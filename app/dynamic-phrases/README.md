# Dynamic Phrases Recognition Service

This service streams webcam frames from the UI, extracts MediaPipe Holistic landmarks, and feeds them into the ISLR (Isolated Sign Language Recognition) TensorFlow Lite model that lives in `module/islr`. It is the backend for Lesson 3 “Practice” and exposes a single `/predict` endpoint that the Next.js app calls every 500 ms.

## What changed in this refactor?

- The legacy `action.h5` model has been removed.
- We now load `module/islr/model.tflite` plus `dict_sign.csv`, matching the `word_model` demo bundle.
- The service performs the same buffering, motion filtering, and smoothing as `word_model/run_camera.py`.
- Only `hello` and `thanks` are exposed to the UI today (the expanded dataset supports more labels and we will map them incrementally).

## Requirements (local development)

- Python 3.11
- TensorFlow 2.15.0 (CPU)
- MediaPipe 0.10.9
- OpenCV (headless build)
- pandas (needed by `module/islr/model.py`)
- Files under `module/islr/`: `model.tflite`, `dict_sign.csv`, `model.py`

Install everything with:

```powershell
cd app/dynamic-phrases
py -3.11 -m venv .venv
. .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

> ℹ️ The repo already contains the `module/islr` assets. Do not delete or rename that folder; the Docker image validates that `module/islr/model.tflite` exists during build.

## Running with Docker (recommended)

From `app/`:

```powershell
docker-compose up -d dynamic-phrases
docker-compose logs -f dynamic-phrases
```

Or build/run the service directly:

```powershell
cd app/dynamic-phrases
docker build -t talk2dhand-dynamic-phrases .
docker run -p 5008:5008 talk2dhand-dynamic-phrases
```

The Dockerfile installs TensorFlow + MediaPipe first (long-running downloads) and then copies the rest of the app, including `module/islr`.

## API

### `POST /predict`

```jsonc
{
  "image": "data:image/jpeg;base64,...", // raw canvas frame from the UI
  "clientId": "lesson-3-session-id",     // optional; default = "default"
  "language": "english"                  // or "filipino"
}
```

Response:

```jsonc
{
  "success": true,
  "prediction": "hello",          // translated label for requested language
  "english_prediction": "hello",  // normalized label ("hello" or "thanks")
  "confidence": 0.82,
  "frames_collected": 18,
  "sequence_ready": true,
  "supported_signs": ["hello", "thanks"],
  "annotated_image": "data:image/jpeg;base64,...", // frame with overlay
  "sentence": ["hello"],
  "is_valid_sign": true
}
```

Key behaviors:

- Frames are stored per `clientId` so concurrent students don’t collide.
- Motion must exceed `MOVE_THRESHOLD` before we call the model, mirroring the desktop demo.
- Smoothing (`SMOOTHING_WINDOW` + `STABILITY_COUNT`) keeps the UI from flickering.
- When `language` is `"filipino"`, the response uses `kamusta` / `salamat` in `prediction`.

### `POST /health`

Simple readiness probe:

```json
{
  "status": "ok",
  "supported_signs": ["hello", "thanks"],
  "model_path": "/app/module/islr"
}
```

## Current limitations

- `iloveyou` is temporarily omitted until we finish validating the expanded dataset.
- Only RGB frames (JPEG) are supported.
- The service does not persist session history; restarting the container resets buffers.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `module/islr/model.tflite not found` | Re-run `git lfs pull` if applicable or copy from `word_model/module/islr`. |
| High CPU usage | Lower `MOVE_THRESHOLD` / increase request interval, or run the service on a machine with more cores. |
| No predictions | Ensure the UI keeps sending frames (Lesson 3 poll interval = 500 ms) and there is visible motion. |

Check logs with `docker-compose logs -f dynamic-phrases` or `python app.py` when running locally.
