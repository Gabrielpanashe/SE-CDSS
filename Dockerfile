FROM python:3.11-slim

WORKDIR /app

# Container is already isolated — venv not needed here.
# For local development on your machine, always use venv:
#   python -m venv venv
#   source venv/bin/activate  (Linux/Mac)
#   venv\Scripts\activate     (Windows)

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies (into container's site-packages)
# PyTorch CPU-only wheels live at the PyTorch index, not PyPI
RUN pip install --no-cache-dir \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    -r requirements.txt

# Copy application code
COPY . .

# Expose API port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health', timeout=5)"

# Run FastAPI server
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
