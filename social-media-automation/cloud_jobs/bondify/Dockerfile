FROM python:3.13-slim
RUN apt-get update && apt-get install -y --no-install-recommends fonts-dejavu-core fonts-noto-color-emoji ffmpeg \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python -c "from pathlib import Path; from PIL import Image; import editorial_media; Image.open('/app/assets/bondify-heart-light.png').verify(); editorial_media.font(32); editorial_media.card('Build-time layout check', Path('/tmp/check.png'))"
CMD ["python", "editorial_publisher.py"]
