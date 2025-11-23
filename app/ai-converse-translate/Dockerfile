# Use Python 3.11 slim image (compatible with TensorFlow 2.15.0)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY ai-converse-translate/requirements.txt .

# Install Python dependencies with increased timeout and in stages
# Separate commands to isolate failures and allow caching
RUN pip install --no-cache-dir --default-timeout=1000 --retries 10 \
    --trusted-host pypi.org --trusted-host files.pythonhosted.org \
    tensorflow==2.15.0

RUN pip install --no-cache-dir --default-timeout=1000 --retries 10 \
    --trusted-host pypi.org --trusted-host files.pythonhosted.org \
    mediapipe==0.10.9

RUN pip install --no-cache-dir --default-timeout=1000 --retries 10 \
    --trusted-host pypi.org --trusted-host files.pythonhosted.org \
    -r requirements.txt

# Copy application files
COPY ai-converse-translate/app.py .

# Copy ISLR model files from dynamic-phrases
COPY dynamic-phrases/module/islr /app/shared-models/islr

# Expose port 8100
EXPOSE 8100

# Run the FastAPI server
CMD ["python", "app.py"]
