"""Local-only silent Beam reel previews. No publishing or cloud configuration."""
from pathlib import Path
import json
import math
import subprocess
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'previews/beam-animated-samples'
W,H,FPS,SECONDS=1080,1920,24,20
GREEN='#103D30'; CREAM='#F7F0DF'; GOLD='#E6BA42'; INK='#19382F'

def font(size,bold=False):
    return ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial'+(' Bold' if bold else '')+'.ttf',size)

def write(im,text,box,size=58,color=INK,bold=False):
    x,y,r,b=box; d=ImageDraw.Draw(im)
    for n in range(size,17,-2):
        face=font(n,bold); lines=[]
        for para in text.split('\n'):
            line=''
            for word in para.split():
                candidate=(line+' '+word).strip()
                if d.textlength(candidate,font=face)>r-x and line:
                    lines.append(line);line=word
                else:line=candidate
            lines.append(line)
        step=int(n*1.3)
        if len(lines)*step<=b-y:break
    else:raise ValueError('Text does not fit')
    for line in lines:
        if d.textlength(line,font=face)>r-x:raise ValueError('Text exceeds width')
        d.text((x,y),line,font=face,fill=color,anchor='lt');y+=step

def base(label,title):
    im=Image.new('RGB',(W,H),CREAM);d=ImageDraw.Draw(im)
    d.rectangle((0,0,W,495),fill=GREEN)
    icon=Image.open(ROOT/'assets/beam/app-icon.png').convert('RGBA').resize((90,90),Image.Resampling.LANCZOS)
    mask=Image.new('L',(90,90));ImageDraw.Draw(mask).rounded_rectangle((0,0,89,89),22,fill=255)
    im.paste(icon,(80,150),mask)
    write(im,'Beam: Learn Thai',(195,169,980,232),42,CREAM,True)
    write(im,label.upper(),(85,295,980,345),26,GOLD)
    write(im,title,(80,355,980,475),54,CREAM,True)
    write(im,'Thai for real life',(80,1550,950,1610),35,GREEN,True)
    write(im,'Simplified romanization; tones not shown.',(80,1615,980,1670),27,'#627066')
    return im

def panel(label,phrase,meaning,y,right=False,dark=False):
    layer=Image.new('RGBA',(W,H));d=ImageDraw.Draw(layer)
    x=180 if right else 80; end=990 if right else 890
    d.rounded_rectangle((x,y,end,y+245),36,fill=GREEN if dark else '#E4EADD')
    c=CREAM if dark else INK
    write(layer,label,(x+38,y+25,end-30,y+72),25,GOLD if dark else '#537465',True)
    write(layer,phrase,(x+38,y+88,end-30,y+155),49,c,True)
    write(layer,meaning,(x+38,y+163,end-30,y+225),34,c)
    return layer

def enter(im,layer,t,start):
    a=max(0,min(1,(t-start)/.5));ease=1-(1-a)**3
    if not a:return
    shifted=Image.new('RGBA',(W,H));shifted.paste(layer,(0,int(45*(1-ease))))
    shifted.putalpha(shifted.getchannel('A').point(lambda v:int(v*a)))
    im.paste(shifted,(0,0),shifted)

def make(kind):
    if kind=='conversation':
        background=base('01 / Mini conversation','Someone helped you?')
        layers=[panel('YOU','khop khun khrap','Thank you.',590),
                panel('THE OTHER PERSON','mai pen rai kha','No problem. / You’re welcome.',915,True,True)]
    elif kind=='say-this-instead':
        background=base('02 / Polite upgrade','A warmer thank-you')
        layers=[panel('BASIC PHRASE','khop khun','Thank you.',590),
                panel('ADD A POLITE ENDING','khop khun kha','Thank you. (polite)',915,True,True)]
    else:
        background=base('03 / Quick quiz','What did they mean?')
        write(background,'You say “thank you”.\nThey reply:',(85,565,965,705),42)
        write(background,'mai pen rai',(85,730,980,845),75,GREEN,True)
        layers=[]
    path=OUT/(kind+'.mp4')
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24',
         '-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','veryfast',
         '-crf','23','-pix_fmt','yuv420p','-movflags','+faststart','-threads','2',str(path)]
    with (OUT/(kind+'-encode.log')).open('wb') as log:
        proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=log)
        try:
            for i in range(FPS*SECONDS):
                t=i/FPS;im=background.copy();d=ImageDraw.Draw(im)
                if kind!='quiz':
                    enter(im,layers[0],t,2)
                    enter(im,layers[1],t,7)
                    if 5<t<7:
                        for k in range(3):
                            y=880+int(math.sin(t*7+k)*5)
                            d.ellipse((800+k*28,y,813+k*28,y+13),fill=GREEN)
                    if t>=12:
                        note=('This example uses khrap for a male speaker\nand kha for a female speaker.' if kind=='conversation'
                              else 'Kha is commonly used by female speakers.\nKhrap is commonly used by male speakers.')
                        write(im,note,(85,1240,970,1400),32)
                else:
                    for j,answer in enumerate(('A  No problem.','B  How much?','C  See you tomorrow.')):
                        y=925+j*120
                        correct=t>=10 and j==0
                        d.rounded_rectangle((80,y,980,y+95),24,fill=GREEN if correct else '#E4EADD')
                        write(im,answer,(115,y+24,950,y+83),38,CREAM if correct else INK,correct)
                    if 5<=t<10:
                        write(im,f'Reveal in {math.ceil(10-t)}...',(85,1320,970,1410),36)
                    elif t>=10:
                        write(im,'Here, it is a friendly reply to thanks.\nThe meaning depends on context.',(85,1320,970,1455),34)
                if t>=17:
                    d.rounded_rectangle((65,1470,1000,1535),22,fill=GOLD)
                    write(im,'Save this for a real conversation.',(90,1486,975,1533),30,GREEN,True)
                d.rounded_rectangle((80,1710,980,1718),4,fill='#DCDDCB')
                d.rounded_rectangle((80,1710,80+int(900*t/SECONDS),1718),4,fill=GREEN)
                if i in (96,240,360):im.save(OUT/f'{kind}-qa-{i}.png')
                proc.stdin.write(im.tobytes())
        finally:
            proc.stdin.close()
        if proc.wait(timeout=60):raise RuntimeError('Encoding failed: '+kind)
    data=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)],text=True))
    v=data['streams'][0]
    assert (v['width'],v['height'])==(W,H) and len(data['streams'])==1
    assert abs(float(data['format']['duration'])-SECONDS)<.1
    print(path,flush=True)

if __name__=='__main__':
    OUT.mkdir(parents=True,exist_ok=True)
    with ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(make,['conversation','say-this-instead','quiz']))
