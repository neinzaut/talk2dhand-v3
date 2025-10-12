# Use Python 3.11 slim image (compatible with TensorFlow 2.15.0)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for OpenCV and MediaPipe
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgstreamer1.0-0 \
    libgstreamer-plugins-base1.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the trained model file (required for inference)
COPY action.h5 .

# Copy application files
COPY . .

# Verify that the model file exists and is readable
RUN test -f action.h5 || (echo "ERROR: action.h5 model file not found!" && exit 1)

# Expose port 5008
EXPOSE 5008

# Run the Flask server
CMD ["python", "app.py"]

