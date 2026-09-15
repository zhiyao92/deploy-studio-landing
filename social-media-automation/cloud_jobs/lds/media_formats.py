"""Deterministic branded cards and actual-footage reels; no generative video."""
import json
import subprocess
import math
import wave
from array import array
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent
W, H = 1080, 1350
INK = '#28453B'

def font(size, serif=True):
    return ImageFont.truetype(str(ROOT/'fonts'/('Author.ttf' if serif else 'Watermark.ttf')), size)

def wrap(draw, text, face, width):
    result=[]
    for paragraph in text.split('\n'):
        current=''
        for word in paragraph.split():
            if draw.textlength(word,font=face)>width:
                raise ValueError('Unbreakable text exceeds safe width')
            candidate=(current+' '+word).strip()
            if current and draw.textlength(candidate,font=face)>width:
                result.append(current);current=word
            else:current=candidate
        result.append(current)
    return result

def block(im, text, top, bottom, size=76, color=INK, serif=True):
    d=ImageDraw.Draw(im)
    for sz in range(size,35,-2):
        face=font(sz,serif);lines=wrap(d,text,face,840);step=int(sz*1.3)
        if len(lines)*step<=bottom-top:break
    else:raise ValueError('Text cannot fit safe bounds')
    y=top+(bottom-top-len(lines)*step)//2
    for line in lines:
        d.text((540,y),line,font=face,fill=color,anchor='mt');y+=step

def badge(im, y, dark=False):
    d=ImageDraw.Draw(im)
    face=font(36,False)
    logo=Image.open(ROOT/'assets/logo.png').convert('RGBA').resize((64,64),Image.Resampling.LANCZOS)
    mask=Image.new('L',(64,64));ImageDraw.Draw(mask).rounded_rectangle((0,0,63,63),14,fill=255)
    width=64+18+int(d.textlength('LDS Quotes',font=face));x=(1080-width)//2
    d.rounded_rectangle((x-24,y-16,x+width+24,y+80),48,fill='#17372E' if dark else '#E7E7DA')
    im.paste(logo,(x,y),mask)
    d.text((x+82,y+32),'LDS Quotes',font=face,fill='#F5EFDF' if dark else INK,anchor='lm')

def card(text, path, index=None, total=None):
    im=Image.new('RGB',(W,H),'#F4EFE3')
    block(im,text,290,920)
    ImageDraw.Draw(im).text((540,1080),'Original devotional reflection',font=font(24,False),fill='#65716A',anchor='mt')
    badge(im,1190)
    if index and total:
        ImageDraw.Draw(im).text((985,1275),f'{index} / {total}',font=font(23,False),fill='#65716A',anchor='rt')
    im.save(path)

def probe(path):
    p=subprocess.run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)],capture_output=True,text=True,timeout=30,check=True)
    return json.loads(p.stdout)

def reel(source, scenes, folder):
    """Four moving-footage scenes; dark text panels guarantee worst-case contrast."""
    info=probe(source)
    if float(info['format']['duration'])<20:raise ValueError('Source clip shorter than 20 seconds')
    badge_layer=Image.new('RGBA',(1080,1920))
    badge(badge_layer,1510,True)
    ImageDraw.Draw(badge_layer).rounded_rectangle((285,1615,795,1690),25,fill=(12,29,23,235))
    ImageDraw.Draw(badge_layer).text((540,1635),'Original devotional reflection',font=font(24,False),fill='#F5EFDF',anchor='mt')
    badge_layer.save(folder/'badge.png')
    for n,text in enumerate(scenes):
        layer=Image.new('RGBA',(1080,1920))
        # 235/255 opaque black-green keeps even pure-white footage dark enough.
        ImageDraw.Draw(layer).rounded_rectangle((70,480,1010,1120),40,fill=(12,29,23,235))
        block(layer,text,545,1040,size=80,color='#FFF8E7')
        layer.save(folder/f'text-{n}.png')
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(source)]
    for n in range(4):cmd+=['-loop','1','-i',str(folder/f'text-{n}.png')]
    cmd+=['-loop','1','-i',str(folder/'badge.png')]
    # Original synthesized quiet chimes; no third-party music licence needed.
    samples=array('h')
    for i in range(22050*20):
        t=i/22050
        value=0
        for n,hz in enumerate((196,246.94,293.66,392,329.63,293.66,246.94,196)):
            dt=t-n*2.5
            if dt>=0:value+=.065*min(dt/.12,1)*math.exp(-dt/2.2)*math.sin(2*math.pi*hz*dt)
        samples.append(int(32767*value*min(t,1)*min((20-t)/2,1)))
    with wave.open(str(folder/'audio.wav'),'wb') as audio:
        audio.setnchannels(1);audio.setsampwidth(2);audio.setframerate(22050);audio.writeframes(samples.tobytes())
    cmd+=['-i',str(folder/'audio.wav')]
    filters=['[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=24,drawbox=color=black@0.12:t=fill[b0]']
    for n in range(4):
        start=n*5
        filters += [f'[{n+1}:v]format=rgba,fade=t=in:st={start}:d=0.35:alpha=1,fade=t=out:st={start+4.65}:d=0.35:alpha=1[t{n}]',f'[b{n}][t{n}]overlay=enable=\'between(t,{start},{start+5})\'[b{n+1}]']
    filters+=['[b4][5:v]overlay[out]']
    dest=folder/'reel.mp4'
    cmd+=['-filter_complex_threads','1','-filter_complex',';'.join(filters),'-map','[out]','-map','6:a','-t','20','-c:a','aac','-b:a','96k','-c:v','libx264','-preset','veryfast','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart','-threads','2',str(dest)]
    subprocess.run(cmd,check=True,capture_output=True,timeout=360)
    result=probe(dest);v=next(s for s in result['streams'] if s['codec_type']=='video')
    if (v['width'],v['height'])!=(1080,1920) or not 19.9<=float(result['format']['duration'])<=20.1:
        raise ValueError('Rendered video failed dimensions/duration validation')
    if dest.stat().st_size>25*1024*1024:raise ValueError('Rendered video exceeds 25 MB limit')
    # Extract one frame from each scene for QA, not for publishing.
    for n in range(4):
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(n*5+2),'-i',str(dest),'-frames:v','1',str(folder/f'qa-{n}.png')],check=True,capture_output=True,timeout=30)
    return dest
