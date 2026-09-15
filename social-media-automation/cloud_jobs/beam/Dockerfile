FROM us-central1-docker.pkg.dev/social-media-automation-5c9db/cloud-run-source-deploy/bondify-publisher@sha256:624ea4e1e0d32c0b490d80b0a17e66fe928688d8c241ed3156a27d37caa13f6f
WORKDIR /app/beam
ENV PYTHONPATH=/app
COPY cloud_jobs/beam/*.py ./
COPY assets/beam/app-icon.png ./
RUN pip install --no-cache-dir 'google-cloud-storage>=2.19,<3'
RUN python -c "from media import base; base('Check', 'Font and icon check')"
CMD ["python", "publisher.py"]
