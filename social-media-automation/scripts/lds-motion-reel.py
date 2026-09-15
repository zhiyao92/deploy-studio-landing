"""Render a real-time animated devotional, with original sound and fixed branding."""
from pathlib import Path
import math
import subprocess
import wave
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'previews/lds-motion-reel'
W,H,FPS,SECONDS=720,1280,30,20
FONT='/System/Library/Fonts/Supplemental/Georgia.ttf'
SANS='/System/Library/Fonts/Supplemental/Arial.ttf'
SCENES=[
 ('When prayer\nfeels difficult…','Pause here for a moment.'),
 ('Start with\none honest\nsentence.','“Heavenly Father, I feel…”'),
 ('You can bring\nthe unfinished\nthoughts, too.','Take a breath. Let the words come.'),
 ('Turn toward\nChrist.\nBegin where you are.','Save this for a quiet moment.'),
]
def ease(x):
    x=max(0,min(1,x)); return x*x*(3-2*x)

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    nature='--nature' in sys.argv
    suffix='nature' if nature else 'motion'
    decoder=None
    if nature:
        decoder=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-stream_loop','-1','-i',str(OUT/'nature-source.mp4'),'-vf',f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS}','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
    logo=Image.open(ROOT/'cloud_jobs/lds/assets/logo.png').convert('RGBA').resize((46,46),Image.Resampling.LANCZOS)
    mask=Image.new('L',(46,46)); ImageDraw.Draw(mask).rounded_rectangle((0,0,45,45),10,fill=255)
    logo.putalpha(mask)
    titlefont=ImageFont.truetype(FONT,54)
    small=ImageFont.truetype(SANS,23)
    brandfont=ImageFont.truetype(SANS,27)
    yy,xx=np.mgrid[0:H,0:W]
    rng=np.random.default_rng(9)
    stars=rng.random((35,3))
    # Original, softly plucked harmonic bed, no licensed recording required.
    sr=44100
    ts=np.arange(sr*SECONDS)/sr
    audio=np.zeros_like(ts)
    notes=[196,246.94,293.66,392,329.63,293.66,246.94,196]
    for n,freq in enumerate(notes):
        local=ts-n*2.5
        env=np.where(local>=0,np.minimum(np.maximum(local,0)/.12,1)*np.exp(-np.maximum(local,0)/2.2),0)
        audio+=env*(np.sin(2*np.pi*freq*local)+.25*np.sin(2*np.pi*freq*2*local))*.085
    audio*=np.minimum(ts/1,1)*np.minimum((SECONDS-ts)/2,1)
    with wave.open(str(OUT/'original-audio.wav'),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes((audio*32767).astype('<i2').tobytes())
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgb24','-video_size',f'{W}x{H}','-framerate',str(FPS),'-i','-','-i',str(OUT/'original-audio.wav'),'-vf','scale=1080:1920','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-t',str(SECONDS),'-movflags','+faststart',str(OUT/f'lds-quotes-{suffix}.mp4')]
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    samples=[]
    for frame in range(FPS*SECONDS):
        t=frame/FPS
        scene=min(int(t/5),3); local=t-scene*5
        # Continuously animated light, drifting points and water-like contours.
        glow=np.exp(-(((xx-(360+120*math.sin(t*.19)))/410)**2+((yy-(860-160*math.sin(t*.12)))/510)**2))
        base=np.zeros((H,W,3),dtype=np.float32)
        for c,(dark,light) in enumerate([(13,42),(32,52),(29,38)]):
            base[:,:,c]=dark+glow*light+(yy/H)*7
        im=Image.fromarray(np.uint8(np.clip(base,0,255)))
        d=ImageDraw.Draw(im)
        for sx,sy,sv in stars:
            px=int((sx*W+t*(4+sv*8))%W)
            py=int((sy*H-t*(5+sv*8))%H)
            lum=int(80+45*math.sin(t+sx*6)**2)
            d.ellipse((px,py,px+2,py+2),fill=(lum,lum,100))
        for j in range(13):
            points=[(x,int(780+j*36+14*math.sin(x/150+t*.65+j*.45))) for x in range(-10,W+11,8)]
            d.line(points,fill=(42+j,70+j,61+j),width=2)
        if decoder:
            raw=decoder.stdout.read(W*H*3)
            if len(raw)!=W*H*3:raise RuntimeError('Nature footage decode ended early')
            footage=Image.frombytes('RGB',(W,H),raw)
            im=Image.blend(footage,Image.new('RGB',(W,H),'#10251D'),.40)
        # Outgoing/incoming copy fades and moves, with reading time between.
        opacity=ease(local/.65)*(ease((5-local)/.5) if scene<3 else 1)
        layer=Image.new('RGBA',(W,H)); ld=ImageDraw.Draw(layer)
        text,sub=SCENES[scene]
        lines=text.split('\n')
        top=405-len(lines)*68/2+25*(1-ease(local/.7))
        for i,line in enumerate(lines):
            assert ld.textlength(line,font=titlefont)<W-100
            ld.text((W/2,top+i*68),line,font=titlefont,fill=(247,239,216,int(255*opacity)),anchor='mt')
        ld.text((W/2,top+len(lines)*68+48),sub,font=small,fill=(208,220,201,int(255*opacity)),anchor='mt')
        im=Image.alpha_composite(im.convert('RGBA'),layer)
        d=ImageDraw.Draw(im)
        # Fixed, legible app badge on every frame, inside lower safe area.
        bw=46+14+int(d.textlength('LDS Quotes',font=brandfont)); left=(W-bw)//2
        d.rounded_rectangle((left-16,990,left+bw+16,1068),radius=36,fill=(21,43,37,255))
        im.alpha_composite(logo,(left,1006))
        d.text((left+60,1029),'LDS Quotes',font=brandfont,fill='#F5EFDF',anchor='lm')
        d.text((W/2,1100),'Original devotional reflection',font=ImageFont.truetype(SANS,17),fill='#ACBCAE',anchor='mt')
        # Four quiet progress segments communicate the reel's sequence.
        for i in range(4):
            x=280+i*42
            d.rounded_rectangle((x,720,x+30,724),2,fill='#D7C89B' if i<=scene else '#456052')
        im=im.convert('RGB')
        if frame in (60,210,360,510):
            im.save(OUT/f'{suffix}-scene-{scene+1}.png');samples.append(im.copy())
        proc.stdin.write(im.tobytes())
    proc.stdin.close()
    if proc.wait()!=0:raise RuntimeError('Video encoding failed')
    if decoder:
        decoder.stdout.close()
        decoder.terminate()
        try:
            decoder.wait(timeout=3)
        except subprocess.TimeoutExpired:
            decoder.kill();decoder.wait()
    sheet=Image.new('RGB',(4*288,512))
    for i,im in enumerate(samples):sheet.paste(im.resize((288,512)),(i*288,0))
    sheet.save(OUT/f'{suffix}-storyboard.jpg',quality=95)
    print(OUT/f'lds-quotes-{suffix}.mp4')

if __name__=='__main__':main()
