"""One-off launch editorial correction; never invoked by scheduled publishing."""
import os
import subprocess
import sys
from pathlib import Path
import anthropic
from google.cloud import firestore

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'cloud_jobs/bondify'))
from editorial_research import RULES, validate_plan, parse_json, text_of, usage_of
import json

db=firestore.Client(project='social-media-automation-5c9db')
ref=db.collection('bondifyEditorialWeeks').document('2026-09-07')
data=ref.get().to_dict()
assert data['status'] in ('needs_attention','approved') and len(data['posts'])==7
assert data['posts'][3]['topic']=='What couples actually argue about'
ref.collection('attempts').document().set(data)
post=data['posts'][3]
post['slides']=[
    'What did parents in this survey disagree about?',
    'Communication was their most severe couple-conflict topic.',
    'Moods, parenting, chores and money followed on the list.',
    'The survey ranked topics. It did not test solutions.',
    'A conversation prompt: which topic would you like to discuss calmly?']
post['paragraphs']=[
    'A look at what these parents reported arguing about.',
    'A 2024 University of Illinois report describes a survey of 593 U.S. parents with a child aged 4-17. Communication ranked as their most severe couple-conflict topic. These findings describe that sample, not every couple.',
    'Try our original conversation prompt on the final slide; it is a suggestion, not a tested intervention.']
data['posts'][1]['paragraphs'][0]='A complaint can name the issue without attacking the person.'
data['posts'][4]['paragraphs'][0]='Try describing your experience without deciding what your partner meant.'
data['posts'][4]['slides'][0]='A different way to ask for your partner\'s attention'
data['posts'][5]['slides'][3]='An example: raise one issue instead of listing past mistakes'
data['posts'][6]['paragraphs'][0]='Name what needs doing instead of labelling your partner.'
for p in data['posts']:
    if p['format']=='reel':
        p['paragraphs'][1]='Original before-and-after phrasing examples, inspired by Gottman educational guidance. These are suggestions, not scientifically tested scripts.'
validate_plan({'posts':data['posts']},data['sources'])
key=subprocess.check_output(['gcloud','secrets','versions','access','latest','--secret=bondify-anthropic-api-key','--project=social-media-automation-5c9db'],text=True).strip()
client=anthropic.Anthropic(api_key=key,max_retries=0,timeout=180)
try:
    response=client.messages.create(model='claude-opus-4-8',max_tokens=1800,messages=[{'role':'user','content':RULES+'\nIndependently review all seven posts and source metadata against fetched evidence. Reject unsupported claims, misleading hooks, mismatched sources/populations/dates, unsafe advice and presenting original dialogue as tested wording. Source credits are appended by code, hashtags belong in their separate field. Source-based general educational guidance is allowed; do not demand a clinical trial for clearly labelled original examples. Return JSON {"approved":true or false,"issues":[only actual problems],"checkedDays":[0,1,2,3,4,5,6]}. Approve only if all pass.\nSources:\n'+json.dumps(data['sources'])+'\nPosts:\n'+json.dumps(data['posts'])}])
    verdict=parse_json(text_of(response))
    ref.update({'posts':data['posts'],'review':verdict,'usage.launchCorrectionReview':usage_of(response),'launchCorrection':'Removed unsupported deeper-issue interpretation from survey carousel'})
    print('Review:',verdict)
    assert verdict.get('approved') is True and not verdict.get('issues') and verdict.get('checkedDays')==list(range(7))
    ref.update({'status':'approved','week':'2026-09-07','approvedAt':firestore.SERVER_TIMESTAMP,
                'errorType':firestore.DELETE_FIELD,'validationReason':firestore.DELETE_FIELD})
    print('Launch week approved after correction; no publishing invoked')
except Exception as exc:
    print('Review did not pass:',type(exc).__name__)
    raise SystemExit(1)
