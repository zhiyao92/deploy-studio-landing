FROM python:3.13-slim
RUN apt-get update && apt-get install -y --no-install-recommends fonts-dejavu-core ffmpeg \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# Fail the image build if a publisher dependency or module import is missing.
RUN python -c "from google.cloud import firestore, storage; import multiformat; import release_media"
CMD ["python", "multiformat.py"]
