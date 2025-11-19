# Use Python 3.11 slim image (compatible with TensorFlow 2.15.0)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Skip apt-get if packages are already available or install from cache
# Combine everything in one layer and use cache mounts for faster builds
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies with increased timeout and in stages
RUN pip install --no-cache-dir --timeout=1000 tensorflow==2.15.0
RUN pip install --no-cache-dir --timeout=1000 mediapipe==0.10.9
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files (includes module/islr assets)
COPY . .

# Verify that the TFLite model exists and is readable
RUN test -f module/islr/model.tflite || (echo "ERROR: module/islr/model.tflite not found!" && exit 1)

# Expose port 5008
EXPOSE 5008

# Run the Flask server
CMD ["python", "app.py"]

