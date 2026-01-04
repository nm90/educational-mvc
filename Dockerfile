# Educational MVC App - Docker Image
# Multi-stage build for optimized image size

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (if needed for any Python packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ ./backend/
COPY lessons/ ./lessons/

# Create directories for data persistence
RUN mkdir -p /app/data /app/backend/logs

# Expose Flask port
EXPOSE 5000

# Set environment variables
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')" || exit 1

# Run the Flask application
CMD ["python", "backend/app.py"]
