"""Sync approved editorial direction without enabling unfinished runtime features."""
import hashlib
from pathlib import Path
from google.cloud import firestore

root = Path(__file__).resolve().parents[1]
spec = (root / 'config/bondify-strategy.md').read_text()
digest = hashlib.sha256(spec.encode()).hexdigest()
db = firestore.Client(project='social-media-automation-5c9db')
ref = db.collection('contentStrategies').document('bondify')
ref.set({
    'approvedSpecification': spec,
    'specificationSha256': digest,
    'syncedAt': firestore.SERVER_TIMESTAMP,
    'editorialStrategyVersion': 'research-led-v1',
}, merge=True)
assert ref.get().to_dict()['specificationSha256'] == digest
print('Verified strategy sync: contentStrategies/bondify; runtime unchanged; sha256=' + digest)
