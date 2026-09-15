import importlib.util
import sys
from datetime import date
from pathlib import Path
import pytest

ROOT=Path(__file__).resolve().parents[1]/'cloud_jobs/bondify'
def module(name):
    spec=importlib.util.spec_from_file_location(name,ROOT/(name+'.py'))
    mod=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod
r=module('editorial_research')
m=module('editorial_media')

def plan():
    return {'posts':[{'day':i,'format':f,'topic':f'Topic {i}','sourceId':'s1',
        'slides':[f'Hook {i}']+['A useful original example.']*({'carousel':5,'reel':4,'single':1}[f]-1),
        'paragraphs':['A useful opening.','An original example to try.','Save this for later.'],
        'hashtags':['#Bondify','#Couples','#Communication','#Relationships','#Connection']}
        for i,f in enumerate(r.FORMATS)]}

def test_plan_and_rotation():
    assert r.FORMATS==('carousel','reel','single','carousel','reel','carousel','reel')
    assert len(r.validate_plan(plan(),{'s1':{}}))==7

def test_hashtags_are_metadata_and_reviewer_checks_source_alignment():
    assert len(r.validate_plan(plan(),{'s1':{}}))==7
    assert 'separate top-level' in r.RULES
    assert 'Do NOT flag that array' in r.REVIEW_RULES
    assert 'directly support' in r.REVIEW_RULES

@pytest.mark.parametrize('mutation',[
    lambda p:p['posts'][0].update(sourceId='invented'),
    lambda p:p['posts'][0].update(slides=['too short']),
    lambda p:p['posts'][0]['slides'].__setitem__(0,'\u0e44\u0e17\u0e22'),
    lambda p:p['posts'][0]['slides'].__setitem__(0,'90% of couples'),
    lambda p:p['posts'][0].update(hashtags=['#Bondify']*5),
    lambda p:p['posts'][0]['paragraphs'].__setitem__(0,'https://invented.example'),
])
def test_bad_content_rejected(mutation):
    data=plan();mutation(data)
    with pytest.raises(ValueError):r.validate_plan(data,{'s1':{}})

def test_source_boundaries():
    assert r.allowed('https://www.pewresearch.org/internet/example')
    assert not r.allowed('https://pewresearch.org.attacker.example/x')
    assert not r.allowed('http://gottman.com/x')
    assert not r.allowed('https://user:pass@gottman.com/x')
    assert not r.allowed('https://gottman.com:8443/x')

def test_render_safe(tmp_path):
    from PIL import Image
    p=m.card('A specific request can start a different conversation.',tmp_path/'single.png')
    assert Image.open(p).size==(1080,1350)
    with pytest.raises(ValueError):m.card('X'*500,tmp_path/'bad.png')
    slides=['Before you say "You never help"','I feel overwhelmed tonight.','Could we tackle the dishes together?','Name the moment. Ask for something specific.']
    assert m.scene(slides,1).tobytes()!=m.scene(slides,2).tobytes()

def test_caption_sources():
    c=r.caption(plan()['posts'][0],{'title':'Example','year':'2020','url':'https://www.pewresearch.org/example'})
    assert '\n\nWhy this helps:\n' in c
    assert '\n\nTry this:\n' in c
    assert '\n\nSource and further reading:\n' in c
    assert c.count('#')==5

def test_structured_plan_shape():
    schema=r.plan_schema()
    assert schema['required']==['posts']
    data={'posts':[]}
    for i,kind in enumerate(r.FORMATS):
        count={'carousel':5,'reel':4,'single':1}[kind]
        data['posts'].append({'topic':f'Topic {i}','sourceId':'s1',
            'slides':{'slide'+str(n):f'Example {i} {n}' for n in range(count)},
            'paragraphs':['Hello','An example','Try this'],
            'hashtags':['#Bondify','#Couples','#Love','#Habits','#Communication']})
    assert len(r.validate_plan(r.normalize_plan(data),{'s1':{}}))==7

def test_search_prose_json():
    assert r.parse_json('I searched three sources.\n{"sources": []}\nAdditional notes.')=={'sources':[]}
    with pytest.raises(ValueError):r.parse_json('No usable result')

def test_existing_failed_week_does_not_retry():
    class Ref:
        def get(self):return self
        def to_dict(self):return {'status':'needs_attention'}
    class DB:
        def collection(self,_):return self
        def document(self,_):return Ref()
    with pytest.raises(RuntimeError,match='no automatic paid retry'):
        r.make_week(DB(),date(2026,9,9))

def test_dry_run_never_publishes(monkeypatch):
    sys.path.insert(0,str(ROOT))
    try:p=module('editorial_publisher')
    finally:sys.path.pop(0)
    records={}
    class Ref:
        def __init__(self,key):self.key=key
        def get(self):return self
        def to_dict(self):return records.get(self.key,{})
        def create(self,data):records[self.key]=dict(data)
        def update(self,data):records[self.key].update(data)
    class DB:
        def collection(self,name):self.name=name;return self
        def document(self,key):return Ref(self.name+'/'+key)
    class Buffer:
        channel_id='channel'
        def get_channels(self):return [{'id':'channel','service':'instagram'}]
        def publish(self,**kwargs):raise AssertionError('DRY RUN attempted publish')
    class Host:
        def cleanup(self,db):return 0
        def upload(self,path,run_id,index):
            assert path.exists()
            return 'https://example.com/media.png'
    monkeypatch.setenv('DRY_RUN','true')
    monkeypatch.setenv('BONDIFY_FORMAT','single')
    monkeypatch.delenv('BONDIFY_RECONCILE_ONLY',raising=False)
    monkeypatch.setattr(p.firestore,'Client',lambda **kw:DB())
    monkeypatch.setattr(p,'BufferHandler',Buffer)
    monkeypatch.setattr(p,'MediaHost',Host)
    week={'week':'2026-09-07','posts':plan()['posts'],'sources':{'s1':{'title':'Example','year':'2020','url':'https://www.pewresearch.org/example'}}}
    monkeypatch.setattr(p,'make_week',lambda *args,**kwargs:week)
    messages=[]
    monkeypatch.setattr(p,'notify',messages.append)
    assert p.run()==0
    run=next(iter(records.values()))
    assert run['status']=='dry_run_complete' and run['slackVerified']
    assert 'DRY RUN passed' in messages[0]
