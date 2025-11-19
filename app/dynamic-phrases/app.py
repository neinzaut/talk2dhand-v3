import base64
import logging
import os
import time
from collections import Counter, deque
from dataclasses import dataclass
from types import SimpleNamespace
from typing import Deque, Dict, List, Optional

import cv2
import mediapipe as mp
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

from module.islr import model as islr_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dynamic-phrases")

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
import absl.logging

absl.logging.set_verbosity(absl.logging.ERROR)

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.join(os.path.dirname(__file__), "module", "islr")

try:
    recognizer = islr_model.IsolatedASLRecognition(model_path=MODEL_DIR)
    logger.info("Loaded TFLite recognizer from %s", MODEL_DIR)
except Exception as exc:
    logger.exception("Unable to load TFLite recognizer: %s", exc)
    raise

mp_holistic = mp.solutions.holistic
holistic = mp_holistic.Holistic(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
    model_complexity=0,
    enable_segmentation=False,
    refine_face_landmarks=False,
)

BUFFER_SIZE = 18
SMOOTHING_WINDOW = 5
STABILITY_COUNT = 3
PROB_THRESHOLD = 0.7
MOVE_THRESHOLD = 0.06

SUPPORTED_SIGNS = {
    "hello": "hello",
    "thankyou": "thanks",
}

TRANSLATIONS = {
    "hello": {"english": "hello", "filipino": "kamusta"},
    "thanks": {"english": "thanks", "filipino": "salamat"},
}


@dataclass
class LandmarkData:
    timeInSeconds: float
    frameNumber: int
    poseLandmarks: List
    faceLandmarks: List
    leftHandLandmarks: List
    rightHandLandmarks: List


def _convert_landmarks(landmark_list) -> List[SimpleNamespace]:
    if not landmark_list or not getattr(landmark_list, "landmark", None):
        return []
    return [
        SimpleNamespace(x=point.x, y=point.y, z=getattr(point, "z", 0.0))
        for point in landmark_list.landmark
    ]


def _hands_present(results) -> bool:
    return bool(
        (results.left_hand_landmarks and results.left_hand_landmarks.landmark)
        or (results.right_hand_landmarks and results.right_hand_landmarks.landmark)
    )


def _compute_motion(buffer: Deque[LandmarkData]) -> float:
    points = []
    for frame in buffer:
        hand = frame.rightHandLandmarks or frame.leftHandLandmarks or []
        if hand:
            wrist = hand[0]
            points.append((wrist.x, wrist.y))
    if len(points) < 2:
        return 0.0
    diffs = []
    for idx in range(1, len(points)):
        dx = points[idx][0] - points[idx - 1][0]
        dy = points[idx][1] - points[idx - 1][1]
        diffs.append(float(np.hypot(dx, dy)))
    return float(sum(diffs) / len(diffs))


class ClientState:
    def __init__(self) -> None:
        self.start_time = time.time()
        self.frame_index = 0
        self.buffer: Deque[LandmarkData] = deque(maxlen=BUFFER_SIZE)
        self.recent_preds: Deque[str] = deque(maxlen=SMOOTHING_WINDOW)
        self.last_stable: Optional[str] = None
        self.last_confidence: float = 0.0
        self.last_motion: float = 0.0


clients: Dict[str, ClientState] = {}


def _get_client_state(client_id: str) -> ClientState:
    if client_id not in clients:
        clients[client_id] = ClientState()
    return clients[client_id]


def _decode_image(image_str: str) -> Optional[np.ndarray]:
    if not image_str:
        return None
    if image_str.startswith("data:image"):
        _, image_str = image_str.split(",", 1)
    try:
        image_bytes = base64.b64decode(image_str)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Invalid base64 payload: %s", exc)
        return None
    frame = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    return frame


def _annotate_frame(frame: np.ndarray, text: str, confidence: float, motion: float) -> str:
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (overlay.shape[1], 60), (24, 24, 24), -1)
    status = text.upper() if text else "LISTENING..."
    cv2.putText(
        overlay,
        f"Sign: {status}",
        (12, 38),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.9,
        (255, 255, 255),
        2,
    )
    cv2.putText(
        overlay,
        f"Conf: {confidence:.2f}  Motion:{motion:.3f}",
        (12, overlay.shape[0] - 16),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (255, 255, 255),
        1,
    )
    _, buffer = cv2.imencode(".jpg", overlay, [cv2.IMWRITE_JPEG_QUALITY, 80])
    return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"


def _translate(sign: Optional[str], language: str) -> str:
    if not sign:
        return ""
    return TRANSLATIONS.get(sign, {}).get(language, sign)


def _run_inference(state: ClientState) -> Optional[Dict[str, float]]:
    if len(state.buffer) < BUFFER_SIZE:
        return None
    motion = _compute_motion(state.buffer)
    state.last_motion = motion
    if motion < MOVE_THRESHOLD:
        state.recent_preds.clear()
        state.last_stable = None
        state.last_confidence = 0.0
        return None
    try:
        prediction = recognizer.predict(list(state.buffer))
    except Exception as exc:  # noqa: BLE001
        logger.warning("Inference failed: %s", exc)
        return None

    raw_sign = (prediction.get("sign") or "").lower()
    normalized = SUPPORTED_SIGNS.get(raw_sign)
    confidence = float(prediction.get("confidence") or 0.0)

    if normalized and confidence >= PROB_THRESHOLD:
        state.recent_preds.append(normalized)
        counts = Counter(state.recent_preds)
        most_common, count = counts.most_common(1)[0]
        if count >= STABILITY_COUNT:
            state.last_stable = most_common
            state.last_confidence = confidence
    else:
        state.recent_preds.clear()
        state.last_stable = None
        state.last_confidence = 0.0

    return {
        "raw_sign": raw_sign,
        "normalized_sign": state.last_stable,
        "confidence": state.last_confidence if state.last_stable else 0.0,
    }


@app.post("/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "supported_signs": list(TRANSLATIONS.keys()),
            "model_path": MODEL_DIR,
        }
    )


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}
    image_payload = payload.get("image")
    client_id = payload.get("clientId") or "default"
    language = payload.get("language") or "english"

    frame = _decode_image(image_payload)
    if frame is None:
        return jsonify({"success": False, "error": "Invalid or missing image payload."}), 400

    state = _get_client_state(client_id)
    state.frame_index += 1

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = holistic.process(rgb_frame)

    landmark_data = LandmarkData(
        timeInSeconds=time.time() - state.start_time,
        frameNumber=state.frame_index,
        poseLandmarks=_convert_landmarks(results.pose_landmarks),
        faceLandmarks=_convert_landmarks(results.face_landmarks),
        leftHandLandmarks=_convert_landmarks(results.left_hand_landmarks),
        rightHandLandmarks=_convert_landmarks(results.right_hand_landmarks),
    )
    state.buffer.append(landmark_data)

    inference = _run_inference(state)
    normalized_sign = inference.get("normalized_sign") if inference else None
    confidence = inference.get("confidence") if inference else 0.0

    translated_prediction = _translate(normalized_sign, language)
    english_prediction = normalized_sign or ""

    annotated = _annotate_frame(frame, translated_prediction, confidence or 0.0, state.last_motion)

    response = {
        "success": True,
        "prediction": translated_prediction,
        "english_prediction": english_prediction,
        "confidence": confidence or 0.0,
        "frames_collected": len(state.buffer),
        "sequence_ready": len(state.buffer) >= BUFFER_SIZE,
        "supported_signs": list(TRANSLATIONS.keys()),
        "annotated_image": annotated,
        "frame": annotated,
        "sentence": [english_prediction] if english_prediction else [],
        "is_valid_sign": bool(english_prediction),
    }
    return jsonify(response)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5008, debug=False, threaded=True)