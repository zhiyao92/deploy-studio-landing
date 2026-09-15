FROM us-central1-docker.pkg.dev/social-media-automation-5c9db/cloud-run-source-deploy/bondify-publisher@sha256:624ea4e1e0d32c0b490d80b0a17e66fe928688d8c241ed3156a27d37caa13f6f
WORKDIR /app/conference
ENV PYTHONPATH=/app
COPY *.py ./
RUN pip install --no-cache-dir 'google-cloud-storage>=2.19,<3'
RUN python -c "import bs4;from media import card;from pathlib import Path;card('Build-time layout check',Path('/tmp/check.png'))"
CMD ["python", "publisher.py"]
