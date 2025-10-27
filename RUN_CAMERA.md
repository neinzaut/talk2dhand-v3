Run Camera Demo (ISLR)

What this contains
- `run_camera.py` : simple camera demo that captures MediaPipe landmarks and runs the bundled TFLite model.
- `module/islr/` : required model assets (`model.py`, `model.tflite`, `dict_sign.csv`).

Quick start (Windows PowerShell)
1. Copy the demo files to a fresh folder (see copy commands below).
2. Create and activate a virtual environment:

```powershell
python -m venv .venv
. .\.venv\Scripts\Activate.ps1
```

3. Install dependencies:

```powershell
pip install -r run_camera_requirements.txt
```

4. Run the demo from the folder containing `run_camera.py` and the `module/islr` folder:

```powershell
python run_camera.py
```

Notes
- Run from the folder that contains `run_camera.py` (so relative imports to `module.islr` resolve).
- If your machine doesn't have a camera, or the camera is in use by another app, the script will fail to open it.
- If you need to tune sensitivity, edit the constants at the top of `run_camera.py`: `MOVE_THRESHOLD`, `PROB_THRESHOLD`, `BUFFER_SIZE`, `SMOOTHING_WINDOW`, `STABILITY_COUNT`.
