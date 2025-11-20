# Use Python 3.10 slim image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for OpenCV and other packages
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies with increased timeout and in stages
# Install large packages separately to handle network timeouts
RUN pip install --no-cache-dir --default-timeout=1000 --retries 10 --trusted-host pypi.org --trusted-host files.pythonhosted.org tensorflow==2.10.0
RUN pip install --no-cache-dir --default-timeout=1000 --retries 10 --trusted-host pypi.org --trusted-host files.pythonhosted.org mediapipe==0.10.9
RUN pip install --no-cache-dir --default-timeout=1000 --retries 10 --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt

# Copy application files
COPY . .

# Expose port 8000
EXPOSE 8000

# Run the Flask server
CMD ["python", "simple_server.py"]

