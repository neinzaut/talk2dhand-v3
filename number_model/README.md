# Number Model — How to run

This README explains how to set up and run the lightweight number-model preview included in this repository on Windows (PowerShell). It covers creating a virtual environment, installing dependencies, placing the model, and running the preview that opens your webcam and shows model predictions.

## What this script does

- Opens your webcam
- Uses MediaPipe Hands to extract 21 hand landmarks
- Builds the same feature vector used by the project's inference code
- Calls the serialized scikit-learn model and overlays the predicted label on the video preview

Controls while the preview window is open:
- Esc: quit
- s: save the current frame to `number_preview.jpg`

## Requirements

- Python 3.8+ (3.10/3.11 recommended)
- A working webcam
- The Python packages listed in `number_requirements.txt` (exact versions included)

The project includes `number_requirements.txt` with these pinned dependencies:

- opencv-contrib-python==4.9.0.80
- mediapipe==0.10.9
- numpy==1.26.4
- scikit-learn==1.2.0

## Quick setup (PowerShell)

Open PowerShell and run these commands from the repository root (the folder that contains `run_number_model.py` and `number_requirements.txt`).

1) Create and activate a virtual environment

```powershell
python -m venv .venv
# Activate the venv in PowerShell
.\.venv\Scripts\Activate.ps1
```

2) Install dependencies

```powershell
pip install --upgrade pip
pip install -r .\number_requirements.txt
```

## Make sure the model file is in the right place

The runner expects a pickled model at `models/fingerspelling/number_model.p` relative to the project root. 

Note: The script will raise a `FileNotFoundError` if the model is not present at that path.

## Run the preview

From the repository root (the same directory as `run_number_model.py`), run:

```powershell
python .\run_number_model.py
```


Watch the console for messages. Typical startup prints:

- "Loading number model from: <path>"
- "Starting number-model preview. Press ESC to quit."

If the script prints `camera not opened`, try:

- Ensure no other app is using the webcam
- Try a different capture backend or index by editing the script line that opens the camera:

```python
# original: cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
# try other indices or remove CAP_DSHOW
cap = cv2.VideoCapture(0)  # or 1, 2, ... if you have multiple cameras
```

## Troubleshooting

- FileNotFoundError: Number model not found at ...
  - Make sure the `.p` model is located at `models/fingerspelling/number_model.p` relative to the project root (see copy command above).

- ImportError / package issues
  - Make sure you activated the `.venv` and installed the packages. Re-run the install commands.

- Mediapipe / OpenCV errors on Windows
  - Use the provided pinned versions in `number_requirements.txt` to match a known-good environment.
  - If installation fails for mediapipe, ensure you have a compatible Python version and pip updated.

## What to expect

- A window titled `number-preview` should open showing your webcam feed.
- When a hand is detected, the script draws a bounding box and the predicted label above it.

## Quick notes for development

- The script extracts normalized landmark positions (x,y) and builds a fixed-length feature vector fed into a scikit-learn model.
- If you want to adapt the script (different model path or camera index), open `run_number_model.py` and modify `MODEL_PATH` or the `cv2.VideoCapture(...)` call.

## Next steps (optional)

- If you want, you can run the preview and copy the first saved `number_preview.jpg` into an issue or share it to confirm the model is detecting your hand.

---

If anything fails when you run the commands locally, tell me the exact console output and I will help you debug further.
