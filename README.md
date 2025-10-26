# alphabet_model

This folder contains a small ASL keypoint classifier demo (`asl_recognizer.py`) that uses MediaPipe for hand landmarks and a TFLite model for classification.

Contents
- `asl_recognizer.py` — demo script. Defaults expect the model under `model/keypoint_classifier/`.
- `keypoint_classifier.tflite` — the TFLite model (if present at repo root; see setup step to move it).
- `keypoint_classifier_label.csv` — label file (if present at repo root; see setup step to move it).
- `requirements.txt` — Python dependencies for the demo.
- `prepare_model.ps1` — helper PowerShell script to create the directory and move model files into the expected path.

Quick start (PowerShell)

Run these commands from the repository root (this folder). They assume you have Python installed and available as `python`.

1) Create and activate virtual environment

```powershell
python -m venv .venv
# If activation is blocked, run once (CurrentUser scope):
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
.\.venv\Scripts\Activate.ps1
```

2) Upgrade pip and install dependencies from `requirements.txt`

```powershell
python -m pip install --upgrade pip
pip install -r .\requirements.txt
```

3) Place the model and label where the script expects them

If your workspace currently has `keypoint_classifier.tflite` and `keypoint_classifier_label.csv` in the repo root, run the provided helper to create the folder and move them:

```powershell
# Make script executable in current PowerShell session and run it
.\prepare_model.ps1
```

Or manually:

```powershell
New-Item -ItemType Directory -Force -Path .\model\keypoint_classifier
Copy-Item -Path .\keypoint_classifier.tflite -Destination .\model\keypoint_classifier\keypoint_classifier.tflite -Force
Copy-Item -Path .\keypoint_classifier_label.csv -Destination .\model\keypoint_classifier\keypoint_classifier_label.csv -Force
```

4) Run the demo

```powershell
python .\asl_recognizer.py
```

- The app will open a window showing your webcam feed. The detected ASL label (and confidence) will be overlaid on the image. Press ESC to exit.

Git / pushing to remote branch `models`

If you want to push this folder to https://github.com/neinzaut/talk2dhand-v3 on a new branch named `models`, do:

```powershell
# If you already cloned that repo as origin, skip the remote-add step
git remote add origin https://github.com/neinzaut/talk2dhand-v3.git
git checkout -b models
git add .
git commit -m "Add ASL recognizer and model structure"
git push origin models
```

Notes & troubleshooting
- On Windows, `tflite-runtime` may not be available; `tensorflow` is installed here to provide `tf.lite.Interpreter`.
- If `mediapipe` install fails, try using Python 3.8–3.10.
- If the webcam doesn't open, try a different camera index (edit `asl_recognizer.py` and change `cv.VideoCapture(0)` to another index).
- If you prefer to include the model files in the repo, remove `model/*.tflite` and `model/*.csv` lines from `.gitignore` before committing.

If you want, I can also create a small `run.ps1` wrapper that handles venv activation and running the script in one step — tell me if you'd like that.
