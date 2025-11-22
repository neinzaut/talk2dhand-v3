#!/usr/bin/env python3
"""
AI Converse Translate Service
FastAPI backend for sign language recognition and AI conversation using Gemini.
Follows AI_CONVERSE_TRANSLATE_RULES.md contract.
"""

import os
import sys
import time
import logging
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager
from collections import deque
from functools import lru_cache

import cv2
import pandas as pd
import numpy as np
import mediapipe as mp
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add shared model path
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'shared-models', 'islr')
sys.path.insert(0, MODEL_PATH)

# Import the ISLR model
try:
    from model import IsolatedASLRecognition
except ImportError:
    # Fallback for development
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'dynamic-phrases', 'module', 'islr'))
    from model import IsolatedASLRecognition

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Suppress TensorFlow warnings
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

# Global variables
recognizer = None
mp_holistic = None
holistic = None

# API key rotation
API_KEYS = []
current_key_index = 0

# Landmark cache (LRU with max 100 entries)
LANDMARK_CACHE: Dict[str, List[Dict]] = {}

# Recognition constants
BUFFER_SIZE = 18
SMOOTHING_WINDOW = 5
STABILITY_COUNT = 3
PROB_THRESHOLD = 0.7
MOVE_THRESHOLD = 0.06

# Filipino translation map (same signs, different labels)
FILIPINO_LABELS = {
    "hello": "Kumusta",
    "thankyou": "Salamat",
    "thanks": "Salamat",
    "thank-you": "Salamat Po",
    "you": "Ikaw",
    "we-us": "Tayo/Kami",
    "happy": "Masaya",
    "sad": "Malungkot",
    "food": "Pagkain",
    "drink": "Inumin",
    "now": "Ngayon",
    "today": "Ngayong Araw",
    "go": "Pumunta",
    "have": "Mayroon",
    "like": "Gusto",
    "fine": "Ayos",
    "bad": "Masama",
    "see": "Makita",
    "where": "Saan",
    "will": "Gagawin",
    "not": "Hindi",
    "he-she-it": "Siya",
    "my-mine": "Akin",
}


class LandmarkData:
    """Stores landmark data for a single frame"""
    def __init__(self, timeInSeconds, frameNumber,
                 poseLandmarks=None, faceLandmarks=None,
                 leftHandLandmarks=None, rightHandLandmarks=None):
        self.timeInSeconds = timeInSeconds
        self.frameNumber = frameNumber
        self.poseLandmarks = poseLandmarks
        self.faceLandmarks = faceLandmarks
        self.leftHandLandmarks = leftHandLandmarks
        self.rightHandLandmarks = rightHandLandmarks


class InferRequest(BaseModel):
    """Request model following AI_CONVERSE_TRANSLATE_RULES.md contract"""
    input_type: str  # "sign-frame" | "text"
    payload: str
    language: Optional[str] = "asl"  # "asl" | "fsl"


class LandmarkFrame(BaseModel):
    """Landmark data for a single frame"""
    frame: int
    pose: List[List[float]]
    left_hand: List[List[float]]
    right_hand: List[List[float]]


class InferResponse(BaseModel):
    """Response model following AI_CONVERSE_TRANSLATE_RULES.md contract"""
    output_type: str  # "asl" | "fsl" | "gloss"
    result: str
    confidence: float
    landmarks: Optional[List[Dict]] = None


class ConversationState:
    """Manages per-session state for sign recognition"""
    def __init__(self):
        self.buffer = []
        self.frame_idx = 0
        self.start_time = time.time()
        self.recent_preds = deque(maxlen=SMOOTHING_WINDOW)
        self.last_stable = None
        self.last_confidence = 0.0


# Global conversation state (single session for MVP)
conversation_state = ConversationState()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize and cleanup resources"""
    global recognizer, mp_holistic, holistic, API_KEYS, current_key_index
    
    logger.info("Initializing AI Converse Translate Service...")
    
    # Load all API keys from environment
    for i in range(1, 11):
        key_name = f'GOOGLE_API_KEY_{i}' if i > 1 else 'GOOGLE_API_KEY'
        key = os.getenv(key_name)
        if key:
            API_KEYS.append(key)
    
    if not API_KEYS:
        logger.error("No API keys found in environment")
        raise ValueError("At least one GOOGLE_API_KEY must be set")
    
    logger.info(f"Loaded {len(API_KEYS)} API keys for rotation")
    current_key_index = 0
    
    try:
        # Initialize ISLR model
        recognizer = IsolatedASLRecognition(model_path=MODEL_PATH)
        logger.info(f"ISLR model loaded from: {MODEL_PATH}")
        
        # Initialize MediaPipe Holistic
        mp_holistic = mp.solutions.holistic
        holistic = mp_holistic.Holistic(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        logger.info("MediaPipe Holistic initialized")
        
        # Print available signs
        dict_csv_path = os.path.join(MODEL_PATH, 'dict_sign.csv')
        try:
            df = pd.read_csv(dict_csv_path)
            signs = df['sign'].tolist()
            logger.info(f"Available signs ({len(signs)}): {', '.join(signs[:10])}...")
        except Exception as e:
            logger.warning(f"Could not read dict_sign.csv: {e}")
            
    except Exception as e:
        logger.error(f"Failed to initialize service: {e}")
        raise e
    
    yield
    
    # Shutdown
    if holistic:
        holistic.close()
    logger.info("Service shutdown complete")


app = FastAPI(
    title="AI Converse Translate Service",
    description="Sign language recognition and AI conversation API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def compute_motion(buffer):
    """Compute motion energy from hand landmarks"""
    pts = []
    for d in buffer:
        if getattr(d, 'rightHandLandmarks', None):
            hand = d.rightHandLandmarks
        elif getattr(d, 'leftHandLandmarks', None):
            hand = d.leftHandLandmarks
        else:
            hand = []
        if hand:
            w = hand[0]
            pts.append((w.x, w.y))
    
    if len(pts) < 2:
        return 0.0
    
    import math
    diffs = []
    for i in range(1, len(pts)):
        dx = pts[i][0] - pts[i-1][0]
        dy = pts[i][1] - pts[i-1][1]
        diffs.append(math.hypot(dx, dy))
    return sum(diffs) / len(diffs)


def recognize_sign_from_frame(frame_data: str, language: str = "asl") -> Dict[str, Any]:
    """Process a frame and return recognized sign"""
    global conversation_state
    
    try:
        # Decode base64 image
        if ',' in frame_data:
            frame_data = frame_data.split(',')[1]
        image_data = base64.b64decode(frame_data)
        nparr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise ValueError("Invalid image data")
        
        conversation_state.frame_idx += 1
        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = holistic.process(image_rgb)
        
        # Extract landmarks
        pose_landmarks = results.pose_landmarks.landmark if results.pose_landmarks else []
        face_landmarks = results.face_landmarks.landmark if results.face_landmarks else []
        left_hand = results.left_hand_landmarks.landmark if results.left_hand_landmarks else []
        right_hand = results.right_hand_landmarks.landmark if results.right_hand_landmarks else []
        
        ld = LandmarkData(
            timeInSeconds=time.time() - conversation_state.start_time,
            frameNumber=conversation_state.frame_idx,
            poseLandmarks=pose_landmarks,
            faceLandmarks=face_landmarks,
            leftHandLandmarks=left_hand,
            rightHandLandmarks=right_hand
        )
        
        conversation_state.buffer.append(ld)
        if len(conversation_state.buffer) > BUFFER_SIZE:
            conversation_state.buffer.pop(0)
        
        # Check if we have enough frames
        if len(conversation_state.buffer) >= BUFFER_SIZE:
            motion = compute_motion(conversation_state.buffer)
            
            if motion >= MOVE_THRESHOLD:
                try:
                    # Process landmarks for model
                    processed_landmarks = [recognizer.create_frame_landmark_df(d) for d in conversation_state.buffer]
                    all_landmarks = pd.concat(processed_landmarks, ignore_index=True).sort_values(
                        by=["frame", "type", "landmark_index"]
                    ).reset_index(drop=True)
                    
                    data_columns = ["x", "y", "z"]
                    frames_count = len(all_landmarks["frame"].unique())
                    xyz_np = all_landmarks[data_columns].to_numpy().reshape(
                        frames_count, 543, len(data_columns)
                    ).astype(np.float32)
                    
                    # Run prediction
                    prediction_raw = recognizer.model(inputs=xyz_np)
                    outputs = prediction_raw.get('outputs')
                    try:
                        probs = outputs.squeeze()
                    except Exception:
                        probs = outputs
                    
                    sign_index = int(probs.argmax())
                    max_prob = float(probs.max())
                    sign_name = recognizer.ORD2SIGN.get(sign_index, "Unknown Sign")
                    
                    # Filter out non-meaningful signs
                    if sign_name in {"", "jeans"}:
                        sign_name = "No Movement Detected"
                    
                    if max_prob >= PROB_THRESHOLD:
                        conversation_state.recent_preds.append(sign_name)
                        
                        # Find most common sign
                        if conversation_state.recent_preds:
                            counts = {}
                            for s in conversation_state.recent_preds:
                                counts[s] = counts.get(s, 0) + 1
                            most_common_sign = max(counts.items(), key=lambda x: x[1])[0]
                            most_common_count = counts[most_common_sign]
                            
                            ignore_set = {None, '', 'No Movement Detected', 'Unknown Sign', 'jeans'}
                            if most_common_count >= STABILITY_COUNT and most_common_sign not in ignore_set:
                                if most_common_sign != conversation_state.last_stable:
                                    conversation_state.last_stable = most_common_sign
                                    conversation_state.last_confidence = max_prob
                                    
                                    # Translate to Filipino if needed
                                    display_sign = FILIPINO_LABELS.get(most_common_sign.lower(), most_common_sign) if language == "fsl" else most_common_sign
                                    
                                    logger.info(f"Stable prediction: {display_sign} (conf={max_prob:.2f})")
                                    
                                    return {
                                        "output_type": language,
                                        "result": display_sign,
                                        "confidence": max_prob,
                                        "stable": True
                                    }
                    
                except Exception as e:
                    logger.error(f"Prediction error: {e}")
            else:
                # Clear predictions when no movement
                conversation_state.recent_preds.clear()
                conversation_state.last_stable = None
        
        # Return listening state
        return {
            "output_type": language,
            "result": "Listening...",
            "confidence": 0.0,
            "stable": False
        }
        
    except Exception as e:
        logger.error(f"Recognition error: {e}")
        raise e


def extract_upper_body_landmarks(landmark_data: LandmarkData) -> Dict:
    """Extract upper body landmarks (pose 0-16, hands) from LandmarkData"""
    pose_upper = []
    if landmark_data.poseLandmarks and len(landmark_data.poseLandmarks) > 16:
        for i in range(17):  # Pose landmarks 0-16 (upper body)
            lm = landmark_data.poseLandmarks[i]
            pose_upper.append([float(lm.x), float(lm.y), float(lm.z)])
    
    left_hand = []
    if landmark_data.leftHandLandmarks:
        for lm in landmark_data.leftHandLandmarks[:21]:
            left_hand.append([float(lm.x), float(lm.y), float(lm.z)])
    
    right_hand = []
    if landmark_data.rightHandLandmarks:
        for lm in landmark_data.rightHandLandmarks[:21]:
            right_hand.append([float(lm.x), float(lm.y), float(lm.z)])
    
    return {
        "pose": pose_upper,
        "left_hand": left_hand,
        "right_hand": right_hand
    }


def get_gemini_response(message: str) -> str:
    """Get Gemini AI response in ASL gloss format with API key rotation"""
    global current_key_index
    
    import google.generativeai as genai
    from google.generativeai.types import HarmCategory, HarmBlockThreshold
    
    if not API_KEYS:
        raise ValueError("No API keys available")
    
    # Try each API key in rotation
    attempts = len(API_KEYS)
    last_error = None
    
    for attempt in range(attempts):
        try:
            api_key = API_KEYS[current_key_index]
            logger.info(f"Using API key #{current_key_index + 1} (attempt {attempt + 1}/{attempts})")
            
            genai.configure(api_key=api_key)
            
            # System instruction for ASL gloss responses (unchanged - works perfectly with 2.5-flash)
            system_instruction = """FINAL SYSTEM INSTRUCTION (RESPOND IN STRICT ASL GLOSS)
Your task is to respond to the meaning or intent of the user's input using correct ASL GLOSS.
You do NOT reconstruct the user's sentence.
You give a meaningful reply, but your reply must follow ASL grammar rules.
Output only the ASL gloss.

LANGUAGE HANDLING
If the user input is Tagalog, translate it to English, interpret the meaning, then respond in ASL gloss.
If the input is English, interpret meaning directly, then respond in ASL gloss.

YOUR RESPONSE MUST FOLLOW ASL SYNTAX
Every reply must follow these grammar rules:
A. TOPIC–COMMENT ORDER
Start with topic/time/place if relevant.
Then express the comment/action/response.

B. WH-WORDS AT THE END
If your response requires a WH-question, place the WH-word last.

C. NO "TO BE" VERBS
Remove: is, am, are, was, were, be, being, been.

D. REMOVE HELPING VERBS
Remove: do, does, did, will, would, should, could, can, may, might, have, has, had
unless needed for meaning.

E. USE "FINISH" FOR COMPLETED ACTIONS WHEN NECESSARY
F. REMOVE ARTICLES
Delete: a, an, the.

G. KEEP ASL LEXICAL ECONOMY
Your responses must be concise, meaning-focused, and follow ASL structure.

PRONOUN RULE
Use pronouns correctly based on meaning of your response (I, YOU, THEY, etc.).
Never invert pronouns incorrectly.

RESPONSE BEHAVIOR
You must respond appropriately to the user's message, not restate it.
Examples:

User: "The sun is bright."
System response: YES SUN BRIGHT

User: "Have you eaten?"
System response: I EAT FINISH
(or NOT-YET, depending on intended meaning)

User: "Where are you now?"
System response: NOW I WHERE
(or NOW I HOME, etc., depending on context)

User (Tagalog): "Kumain ka na ba?"
System response: I EAT FINISH
(if responding yes)
or I NOT-YET EAT

OUTPUT FORMAT
ALL CAPS
Spaces between signs
No explanations
No added English
Only the ASL gloss response

SUMMARY OF WHAT YOU DO
Detect if input is Tagalog → translate → interpret → respond in ASL gloss
If input is English → interpret → respond in ASL gloss

You do not rewrite the input
You produce a meaningful ASL gloss response
You output ONLY the ASL gloss"""
        
            # Create model with system instruction - UPDATED TO CURRENT STABLE MODEL
            model = genai.GenerativeModel(
                model_name='gemini-2.5-flash',  # Correct, stable, fast model (November 2025)
                system_instruction=system_instruction
            )
            
            # Generation config (unchanged - works great with 2.5-flash)
            generation_config = genai.GenerationConfig(
                temperature=0.2,
                top_k=40,
                top_p=0.95,
                max_output_tokens=1024,
            )
            
            # Relaxed safety settings to allow normal conversation
            # Only block content that is highly likely to be harmful
            safety_settings = {
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            }
            
            # Generate response
            response = model.generate_content(
                f"User message: {message}",
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            # Check if response was blocked or empty
            if not response.candidates:
                raise Exception("Response was blocked by safety filters. Please try rephrasing your message.")
            
            candidate = response.candidates[0]
            
            # Check finish reason
            # 0 = FINISH_REASON_UNSPECIFIED, 1 = STOP (normal), 2 = MAX_TOKENS, 3 = SAFETY, 4 = RECITATION, 5 = OTHER
            if candidate.finish_reason == 3:  # SAFETY
                raise Exception("Response was blocked due to safety concerns. Please rephrase your message.")
            elif candidate.finish_reason == 4:  # RECITATION
                raise Exception("Response was blocked due to recitation concerns. Please try a different message.")
            elif candidate.finish_reason not in [1, 2]:  # Not STOP or MAX_TOKENS
                raise Exception(f"Response generation stopped unexpectedly (reason: {candidate.finish_reason}). Please try again.")
            
            # Check if response has valid parts
            if not candidate.content.parts:
                raise Exception("No response generated. Please try rephrasing your message.")
            
            asl_response = response.text.strip()
            
            logger.info(f"User: {message} -> Gemini (key #{current_key_index + 1}): {asl_response}")
            
            # Rotate to next key for next call (helps with rate limits)
            current_key_index = (current_key_index + 1) % len(API_KEYS)
            
            return asl_response
            
        except Exception as e:
            error_str = str(e).lower()
            is_rate_limit = '429' in str(e) or 'quota' in error_str or 'rate limit' in error_str
            
            if is_rate_limit and attempt < attempts - 1:
                logger.warning(f"Rate limit hit on API key #{current_key_index + 1}: {e}")
                current_key_index = (current_key_index + 1) % len(API_KEYS)
                logger.info(f"Rotating to API key #{current_key_index + 1}")
                last_error = e
                continue
            else:
                logger.error(f"Gemini API error on key #{current_key_index + 1}: {e}")
                raise e
    
    # If all keys exhausted
    if last_error:
        raise Exception(f"All {len(API_KEYS)} API keys exhausted due to rate limits")
    raise Exception("Failed to get AI response")


def get_gemini_gloss_reconstruction(text: str) -> str:
    """Get Gemini AI to reconstruct text into ASL gloss with API key rotation"""
    global current_key_index
    
    import google.generativeai as genai
    from google.generativeai.types import HarmCategory, HarmBlockThreshold
    
    if not API_KEYS:
        raise ValueError("No API keys available")
    
    # Try each API key in rotation
    attempts = len(API_KEYS)
    last_error = None
    
    for attempt in range(attempts):
        try:
            api_key = API_KEYS[current_key_index]
            logger.info(f"Using API key #{current_key_index + 1} for gloss reconstruction (attempt {attempt + 1}/{attempts})")
            
            genai.configure(api_key=api_key)
            
            # System instruction for ASL gloss reconstruction
            system_instruction = """(STRICT ASL GLOSS RECONSTRUCTION)
Your task is to convert any user input into correct ASL GLOSS.
Output ONLY the reconstructed ASL gloss. No explanations, no extra text.

1. LANGUAGE HANDLING
If the input sentence is Tagalog, translate it to English first, then proceed to ASL restructuring.

If the input is English, proceed directly.

2. PRONOUN & PERSPECTIVE RULE
Preserve original pronouns exactly as they appear ("your" → YOUR, not ME).

Do not invert or reinterpret pronouns based on speaker.

Only rearrange grammar; never change viewpoint.

3. ASL SYNTAX RULES
A. TOPIC–COMMENT ORDER
Move major topic / time / place first.

Then give the comment / action / description.

Order priority:

TIME (if present)

LOCATION (if present)

SUBJECT

VERB

OBJECT

EXTRA DETAIL

B. WH-WORD PLACEMENT
If the sentence contains WHO, WHAT, WHERE, WHEN, WHY, HOW, WHICH, place the WH-word at the end.

Examples:
EN: What is your name? → YOUR NAME WHAT
EN: Where did she go? → SHE GO WHERE

C. YES/NO QUESTION RULE
Do NOT move anything to the end.

Keep standard ASL order.

No WH-word added.

Example:
EN: Did you eat? → YOU EAT?

4. VERB RULES
A. REMOVE ALL FORMS OF "TO BE"
Delete: is, am, are, was, were, be, being, been.

B. REMOVE ALL HELPING VERBS
Delete: do, does, did, will, would, should, could, can, may, might, have, has, had
unless needed for meaning.

C. PERFECT ASPECT ("have/has/had eaten/seen/etc.")
If the helper verb expresses completion, convert to FINISH.

Examples:
EN: Have you eaten? → YOU EAT FINISH?
EN: I have finished the work. → WORK I FINISH

If "have/has/had" is only grammatical filler → remove it.

5. ARTICLE & FILLER REMOVAL
Delete: a, an, the, and all unnecessary filler words.

Example:
EN: The cat is on the table. → CAT TABLE ON

6. VERB PHRASE SIMPLIFICATION
Keep the main verb only.

Keep essential directional/inflection forms when obvious from meaning.

Examples:
EN: Do you want to go? → YOU WANT GO
EN: Did you see Claire today at school? → TODAY SCHOOL YOU SEE CLAIRE?

7. TIME & LOCATION RULE
If present, place TIME first and LOCATION second unless sentence context requires another logical topic.

Examples:
EN: I will meet you tomorrow at school. → TOMORROW SCHOOL I MEET YOU

8. NO EXTRA WORDS
You MUST NOT:

Add words not present in meaning

Add WH-words unless the English sentence already contains a WH-question

Add explanations or punctuation beyond an optional final "?"

9. OUTPUT FORMAT
ALL CAPS only

Words separated by single spaces

No quotes, no commentary, no explanation

Output only the final ASL gloss

10. SUMMARY OF OUTPUT BEHAVIOR
You:

Detect Tagalog → translate to English → apply ASL rules

If English → apply ASL rules

Produce only the ASL gloss in strict format

Never output anything else"""
        
            # Create model with system instruction
            model = genai.GenerativeModel(
                model_name='gemini-2.5-flash',
                system_instruction=system_instruction
            )
            
            # Generation config
            generation_config = genai.GenerationConfig(
                temperature=0.2,
                top_k=40,
                top_p=0.95,
                max_output_tokens=1024,
            )
            
            # Relaxed safety settings
            safety_settings = {
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            }
            
            # Generate response
            response = model.generate_content(
                f"Convert to ASL gloss: {text}",
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            # Check if response was blocked or empty
            if not response.candidates:
                raise Exception("Response was blocked by safety filters. Please try rephrasing your text.")
            
            candidate = response.candidates[0]
            
            # Check finish reason
            if candidate.finish_reason == 3:  # SAFETY
                raise Exception("Response was blocked due to safety concerns. Please rephrase your text.")
            elif candidate.finish_reason == 4:  # RECITATION
                raise Exception("Response was blocked due to recitation concerns. Please try different text.")
            elif candidate.finish_reason not in [1, 2]:  # Not STOP or MAX_TOKENS
                raise Exception(f"Response generation stopped unexpectedly (reason: {candidate.finish_reason}). Please try again.")
            
            # Check if response has valid parts
            if not candidate.content.parts:
                raise Exception("No gloss generated. Please try rephrasing your text.")
            
            asl_gloss = response.text.strip()
            
            logger.info(f"Text: {text} -> Gloss (key #{current_key_index + 1}): {asl_gloss}")
            
            # Rotate to next key for next call
            current_key_index = (current_key_index + 1) % len(API_KEYS)
            
            return asl_gloss
            
        except Exception as e:
            error_str = str(e).lower()
            is_rate_limit = '429' in str(e) or 'quota' in error_str or 'rate limit' in error_str
            
            if is_rate_limit and attempt < attempts - 1:
                logger.warning(f"Rate limit hit on API key #{current_key_index + 1}: {e}")
                current_key_index = (current_key_index + 1) % len(API_KEYS)
                logger.info(f"Rotating to API key #{current_key_index + 1}")
                last_error = e
                continue
            else:
                logger.error(f"Gemini API error on key #{current_key_index + 1}: {e}")
                raise e
    
    # If all keys exhausted
    if last_error:
        raise Exception(f"All {len(API_KEYS)} API keys exhausted due to rate limits")
    raise Exception("Failed to get gloss reconstruction")


class TranslateGlossRequest(BaseModel):
    """Request model for text-to-gloss translation"""
    text: str


class TranslateGlossResponse(BaseModel):
    """Response model for text-to-gloss translation"""
    gloss: str


@app.post("/translate-gloss", response_model=TranslateGlossResponse)
async def translate_gloss(request: TranslateGlossRequest):
    """
    Translate text to ASL gloss using Gemini AI
    """
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Text is required")
        
        gloss = get_gemini_gloss_reconstruction(request.text.strip())
        
        return TranslateGlossResponse(gloss=gloss)
        
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/infer", response_model=InferResponse)
async def infer(request: InferRequest):
    """
    Unified inference endpoint following AI_CONVERSE_TRANSLATE_RULES.md
    
    Handles both:
    - Sign recognition (input_type="sign-frame")
    - AI conversation (input_type="text")
    """
    try:
        if request.input_type == "sign-frame":
            # Sign recognition from video frame
            result = recognize_sign_from_frame(request.payload, request.language)
            return InferResponse(
                output_type=result["output_type"],
                result=result["result"],
                confidence=result["confidence"]
            )
        
        elif request.input_type == "text":
            # Gemini AI conversation
            gloss_response = get_gemini_response(request.payload)
            
            # Extract landmarks for gloss words (returning empty for now - will be populated later)
            # This allows frontend to fallback to text display
            landmarks = []
            
            return InferResponse(
                output_type="gloss",
                result=gloss_response,
                confidence=1.0,
                landmarks=landmarks
            )
        
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid input_type: {request.input_type}. Expected 'sign-frame' or 'text'"
            )
        
    except Exception as e:
        logger.error(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": recognizer is not None,
        "mediapipe_ready": holistic is not None,
        "model_path": MODEL_PATH
    }


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8100,
        reload=True,
        log_level="info"
    )
