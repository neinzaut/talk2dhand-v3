# Use Python 3.11 slim image (compatible with TensorFlow 2.15.0)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system deps (no BuildKit cache mounts for wider compatibility)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies with increased timeout and in stages
# Use separate commands to isolate failures and allow caching
RUN pip install --no-cache-dir --default-timeout=1000 --retries 10 --trusted-host pypi.org --trusted-host files.pythonhosted.org tensorflow==2.15.0
RUN pip install --no-cache-dir --default-timeout=1000 --retries 10 --trusted-host pypi.org --trusted-host files.pythonhosted.org mediapipe==0.10.9
RUN pip install --no-cache-dir --default-timeout=1000 --retries 10 --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt

# Copy application files (includes module/islr assets)
COPY . .

# Verify that the TFLite model exists and is readable
RUN test -f module/islr/model.tflite || (echo "ERROR: module/islr/model.tflite not found!" && exit 1)

# Pre-download MediaPipe models during build to avoid runtime download issues
RUN python -c "import mediapipe as mp; holistic = mp.solutions.holistic.Holistic(model_complexity=0)" || true

# Expose port 5008
EXPOSE 5008

# Run the Flask server
CMD ["python", "app.py"]

