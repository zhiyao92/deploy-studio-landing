"""Check publication boundaries, format rules, and caption/contrast invariants."""
import importlib.util
import sys
from datetime import date
from pathlib import Path
import pytest

MODULE=Path(__file__).resolve().parents[1]/'cloud_jobs/lds'
sys.path.insert(0,str(MODULE))
import multiformat as m

def content(kind):
    return {'slides':['Begin with one honest prayer today.']*{'single':1,'carousel':5,'reel':4}[kind], 'paragraphs':['A fresh start.','Take a quiet moment.','Save this for later.'],'hashtags':['#LDSQuotes','#Prayer','#Faith','#Hope','#ComeUntoChrist']}

def test_week_rotation_and_override_safety():
    assert [m.format_for(date(2026,9,7+i)) for i in range(7)]==list(m.FORMATS)
    with pytest.raises(ValueError):m.format_for(date.today(),'reel',False)

def test_normalize_trims_extra_slide_but_rejects_missing():
    value={'slides':['one','two','three','four','extra']}
    assert m.normalize_content(value,'reel')['slides']==['one','two','three','four']
    with pytest.raises(ValueError):m.normalize_content({'slides':['one']},'reel')

def test_caption_source_separated_and_not_fabricated():
    text=m.caption(m.validate_content(content('single'),'single'))
    assert text.split('\n\n')==['A fresh start.','Reflection:\nTake a quiet moment.',
      'Try this today:\nSave this for later.',
      'About this post:\nOriginal devotional reflection; not a scripture or Church-leader quotation.',
      '#LDSQuotes #Prayer #Faith #Hope #ComeUntoChrist']
    bad=content('single');bad['attribution']='A Church leader'
    with pytest.raises(ValueError):m.validate_content(bad,'single')

def test_reject_oversized_and_duplicate_content():
    bad=content('carousel');bad['slides'][0]='x'*151
    with pytest.raises(ValueError):m.validate_content(bad,'carousel')
    bad=content('single');bad['hashtags'][1]='#LDSQuotes'
    with pytest.raises(ValueError):m.validate_content(bad,'single')

def test_buffer_reel_and_carousel_payload(monkeypatch):
    monkeypatch.setenv('BUFFER_INSTAGRAM_CHANNEL_ID','test-ig')
    monkeypatch.setenv('BUFFER_THREADS_CHANNEL_ID','test-threads')
    assets=[{'url':'https://example.com/a.png'},{'url':'https://example.com/b.png'}]
    assert len(m.payload('instagram','carousel','caption',assets)['assets'])==2
    reel=m.payload('instagram','reel','caption',[{'url':'https://example.com/v.mp4'}])
    assert reel['metadata']['instagram']['type']=='reel'
    assert 'video' in reel['assets'][0]
    assert len(m.payload('threads','carousel','caption',assets)['assets'])==2

def test_dark_panel_contrast_on_white():
    # Worst-case white background under RGBA(12,29,23,235).
    def lum(rgb):
        channels=[v/255 for v in rgb]
        channels=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in channels]
        return sum(v*w for v,w in zip(channels,[.2126,.7152,.0722]))
    bg=[v*(235/255)+255*(20/255) for v in (12,29,23)]
    assert (lum((255,248,231))+.05)/(lum(bg)+.05)>7

def test_duplicate_run_does_not_overwrite_owner(monkeypatch):
    class Document:
        def create(self,data):raise m.AlreadyExists('already running')
        def get(self):return self
        def to_dict(self):return {'status':'preparing'}
        def set(self,*args,**kwargs):raise AssertionError('Must not mutate another execution')
    class DB:
        def collection(self,*args):return self
        def document(self,*args):return Document()
    monkeypatch.setenv('DRY_RUN','true')
    for key in ('ANTHROPIC_API_KEY','BUFFER_API_TOKEN','BUFFER_INSTAGRAM_CHANNEL_ID',
                'BUFFER_THREADS_CHANNEL_ID','BUFFER_FACEBOOK_CHANNEL_ID','MEDIA_BUCKET'):
        monkeypatch.setenv(key,'test')
    monkeypatch.delenv('LDS_FORMAT',raising=False)
    monkeypatch.setattr(m.firestore,'Client',lambda **kw:DB())
    monkeypatch.setattr(m,'notify',lambda *args,**kw:None)
    monkeypatch.setattr(m,'generate',lambda *args:pytest.fail('Duplicate must not generate or publish'))
    assert m.run()==1
