FROM python:3.13-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-dejavu-core fonts-noto-core fonts-noto-extra fonts-thai-tlwg \
    libfribidi0 libharfbuzz0b libraqm0 \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY pyproject.toml README.md ./
COPY automation ./automation
COPY assets ./assets
RUN pip install --no-cache-dir .

USER 65532:65532
ENTRYPOINT ["python", "-m", "automation.main"]
