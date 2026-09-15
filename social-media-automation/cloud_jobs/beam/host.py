"""Short-lived, MIME-correct public media in Google Cloud Storage."""
import os
from urllib.parse import quote

import requests
from google.cloud import storage

PREFIX='beam-media--'
FOLDER='beam/'
LIMIT=350*1024*1024

class MediaHost:
    def __init__(self):
        name=os.environ.get('MEDIA_BUCKET','').strip()
        if not name:raise RuntimeError('MEDIA_BUCKET is required')
        self.bucket=storage.Client().bucket(name)

    def inventory(self):
        return list(self.bucket.list_blobs(prefix=FOLDER,max_results=100))

    def cleanup(self,db):
        # The bucket lifecycle deletes every object after eight days.
        return 0

    def upload(self,path,run_id,index):
        size=path.stat().st_size;objects=self.inventory()
        if size>25*1024*1024 or len(objects)>=80 or sum(o.size or 0 for o in objects)+size>LIMIT:
            raise RuntimeError('Media retention budget reached')
        name=FOLDER+f'{PREFIX}{run_id}--{index}{path.suffix}'
        kind='video/mp4' if path.suffix.lower()=='.mp4' else 'image/png'
        blob=self.bucket.blob(name);blob.cache_control='public,max-age=604800'
        blob.upload_from_filename(str(path),content_type=kind)
        url=f'https://storage.googleapis.com/{self.bucket.name}/{quote(name,safe="/")}'
        with requests.get(url,stream=True,timeout=30) as check:
            actual=check.headers.get('Content-Type','').split(';')[0].lower()
            if check.status_code!=200 or actual!=kind or not next(check.iter_content(1024),b''):
                raise RuntimeError('Public media is not Meta-compatible')
        return url
