"""LDS Conference cards and Pexels reels with original gentle instrumental audio."""
import json,math,subprocess,wave
from array import array
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).parent
CREAM='#F3F1EA';INK='#243A3A';GOLD='#BDA36B'

def font(size,serif=False):
    name='DejaVuSerif.ttf' if serif else 'DejaVuSans.ttf'
    linux=Path('/usr/share/fonts/truetype/dejavu')/name
    mac=Path('/System/Library/Fonts/Supplemental')/('Georgia.ttf' if serif else 'Arial.ttf')
    return ImageFont.truetype(str(linux if linux.exists() else mac),size)

def write(im,value,box,size,color,serif=False):
    d=ImageDraw.Draw(im);x,y,right,bottom=box
    for n in range(size,17,-2):
        face=font(n,serif);lines=[]
        for para in value.split('\n'):
            line=''
            for word in para.split():
                if d.textlength(word,font=face)>right-x:raise ValueError('Unbreakable text exceeds width')
                trial=(line+' '+word).strip()
                if line and d.textlength(trial,font=face)>right-x:lines.append(line);line=word
                else:line=trial
            lines.append(line)
        step=int(n*1.25)
        if len(lines)*step<=bottom-y:break
    else:raise ValueError('Text does not fit')
    for line in lines:d.text((x,y),line,font=face,fill=color);y+=step

def card(value,path,index=1,total=1,dark=False):
    bg,fg=(INK,CREAM) if dark else (CREAM,INK)
    im=Image.new('RGB',(1080,1350),bg);d=ImageDraw.Draw(im);accent=GOLD
    write(im,'CONFERENCE / IN EVERYDAY LIFE',(86,90,990,140),25,accent)
    d.line((86,182,994,182),fill=accent,width=1)
    write(im,value,(86,295,994,830),84,fg,True)
    write(im,'Study reflection, not a direct quotation.',(86,1080,994,1130),24,accent)
    d.line((86,1220,994,1220),fill=accent,width=1)
    write(im,'LDS Conferences / Independent study',(86,1250,880,1295),25,fg)
    write(im,f'{index:02d}/{total:02d}' if total>1 else 'REFLECT',(900,1250,1010,1295),22,accent)
    im.save(path)
    return path

def soundtrack(path,seconds=24,sr=22050):
    samples=array('h');notes=(196,246.94,293.66,392,329.63,293.66,246.94,196)
    for i in range(sr*seconds):
        t=i/sr;value=0
        for n,hz in enumerate(notes):
            dt=t-n*3
            if dt>=0:value+=.052*min(dt/.15,1)*math.exp(-dt/2.8)*(math.sin(2*math.pi*hz*dt)+.18*math.sin(4*math.pi*hz*dt))
        value*=min(t/1.5,1)*min((seconds-t)/2.5,1)
        samples.append(max(-32767,min(32767,int(value*32767))))
    with wave.open(str(path),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes(samples.tobytes())

def reel(source,scenes,source_meta,folder):
    overlays=[]
    for n,value in enumerate(scenes):
        layer=Image.new('RGBA',(1080,1920));d=ImageDraw.Draw(layer)
        d.rounded_rectangle((60,270,1020,1160),40,fill=(24,58,58,170))
        write(layer,'CONFERENCE / IN EVERYDAY LIFE',(90,320,990,380),28,'#E6D5AE')
        write(layer,value,(90,510,990,970),82,CREAM,True)
        write(layer,'Study reflection, not a direct quotation.',(90,1030,990,1090),25,CREAM)
        write(layer,'LDS Conferences / Independent study',(90,1590,990,1650),31,CREAM)
        write(layer,f'{n+1:02d}/04',(900,1590,1000,1650),23,GOLD)
        p=folder/f'overlay-{n}.png';layer.save(p);overlays.append(p)
    audio=folder/'original-instrumental.wav';soundtrack(audio)
    dest=folder/'reel.mp4';cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-stream_loop','-1','-i',str(source)]
    for p in overlays:cmd += ['-loop','1','-i',str(p)]
    cmd += ['-i',str(audio)]
    filters=['[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=24,drawbox=color=#102D2A@0.48:t=fill[b0]']
    for n in range(4):
        start=n*6
        filters += [f'[{n+1}:v]format=rgba,fade=t=in:st={start}:d=0.45:alpha=1,fade=t=out:st={start+5.55}:d=0.45:alpha=1[t{n}]',f'[b{n}][t{n}]overlay=enable=\'between(t,{start},{start+6})\'[b{n+1}]']
    cmd += ['-filter_complex_threads','1','-filter_complex',';'.join(filters),'-map','[b4]','-map','5:a','-t','24','-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart','-threads','2',str(dest)]
    result=subprocess.run(cmd,capture_output=True,timeout=360)
    if result.returncode:raise RuntimeError('Reel encoding failed: '+result.stderr.decode(errors='replace')[-1200:])
    info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(dest)],text=True))
    video=next(s for s in info['streams'] if s['codec_type']=='video');audio_stream=next((s for s in info['streams'] if s['codec_type']=='audio'),None)
    if (video['width'],video['height'])!=(1080,1920) or audio_stream is None or abs(float(info['format']['duration'])-24)>.15 or dest.stat().st_size>25*1024*1024:
        raise ValueError('Reel validation failed')
    return dest

def render(kind,data,folder,footage_path=None,footage=None):
    if kind=='reel':return [reel(footage_path,data['slides'],footage,folder)]
    return [card(s,folder/f'card-{i}.png',i+1,len(data['slides']),dark=(kind=='single' or i==len(data['slides'])-1)) for i,s in enumerate(data['slides'])]
