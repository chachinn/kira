from pathlib import Path
import re


def read(path):
    return Path(path).read_text(encoding='utf-8')


def write(path, text):
    Path(path).write_text(text, encoding='utf-8')


def must_replace(text, old, new, label, count=1):
    found = text.count(old)
    if found < count:
        raise SystemExit(f'{label}: expected at least {count} matches, found {found}')
    return text.replace(old, new, count)


# --- index.html ---
index = read('index.html')
index = must_replace(index, '<link rel="stylesheet" href="./style.css?v=12.2.0" />', '<link rel="stylesheet" href="./style.css?v=12.3.0" />', 'style version')
index = must_replace(index, '<video id="cameraVideo" class="live-video" autoplay muted playsinline></video>', '<video id="cameraVideo" class="live-video" autoplay muted playsinline></video>\n          <canvas id="liveBeautyCanvas" class="live-beauty-canvas" aria-hidden="true"></canvas>', 'live beauty canvas')
index = must_replace(index, '<small>Live preview is lightweight. Saved photos use Kira’s selective skin/blemish pass.</small>', '<small>Smooth and Acne target the detected face/skin region. The live preview uses a low-resolution face layer; saved photos use the stronger full-resolution pass.</small>', 'camera beauty note')
index = must_replace(index, '<div class="setting-row"><span>Current version</span><b>Build 11.9</b></div>', '<div class="setting-row"><span>Current version</span><b>Build 12.3</b></div>', 'about version')
old_release = '''      <div class="release-badge">BUILD 12.2</div>
      <h4>Beauty that actually shows — plus Camera controls you can always close.</h4>
      <div class="info-list">
        <div><b>◎</b><span>Smooth is visibly stronger at higher settings while saved photos still use selective skin masking instead of simply blurring the entire frame.</span></div>
        <div><b>♡</b><span>Acne / blemish now reacts more aggressively to local texture, redness, and darker uneven spots, especially from 60–100.</span></div>
        <div><b>✓</b><span>Camera controls now have sticky Done controls at the top and bottom, so the sheet can always be collapsed even on smaller iPhones.</span></div>
        <div><b>⚡</b><span>The live Beauty preview remains lightweight for smooth shooting; the stronger selective pass runs on saved stills and in Develop.</span></div>
      </div>'''
new_release = '''      <div class="release-badge">BUILD 12.3</div>
      <h4>Face-targeted Beauty — no more whole-camera blur.</h4>
      <div class="info-list">
        <div><b>◎</b><span>Smooth no longer blurs the entire live camera. Kira now renders a separate face/skin Beauty layer and leaves the background, hair, and non-skin areas alone.</span></div>
        <div><b>♡</b><span>Acne / blemish now uses a stronger local healing pass for red, dark, bright, and high-detail spots instead of relying on one generic blur.</span></div>
        <div><b>◌</b><span>Eyes, brows, lips, hair edges, and other high-contrast features receive extra edge protection so stronger Beauty settings do not simply smear the face.</span></div>
        <div><b>⚡</b><span>The live face layer is capped at a small resolution and about seven updates per second; the heavier pass still runs only on saved stills / Develop.</span></div>
      </div>'''
index = must_replace(index, old_release, new_release, 'release notes')
index = must_replace(index, '<script src="./app.js?v=12.2.0"></script>', '<script src="./app.js?v=12.3.0"></script>', 'app version')
write('index.html', index)


# --- app.js ---
app = read('app.js')
beauty_block = r'''  const beautyBuffers={still:{},live:{}};
  function beautyBuffer(bucket,name,w,h){
    const store=beautyBuffers[bucket]||(beautyBuffers[bucket]={});
    const c=store[name]||(store[name]=document.createElement('canvas'));
    if(c.width!==w)c.width=w;
    if(c.height!==h)c.height=h;
    return c
  }
  function skinConfidence(r,g,b){
    const y=.299*r+.587*g+.114*b;
    if(y<12||y>252)return 0;
    const cb=128-.168736*r-.331264*g+.5*b,cr=128+.5*r-.418688*g-.081312*b;
    const cbScore=1-clamp(Math.abs(cb-110)/58,0,1),crScore=1-clamp(Math.abs(cr-152)/62,0,1);
    const spread=Math.max(r,g,b)-Math.min(r,g,b);
    if(spread<2)return 0;
    const rgbWarm=clamp((r-Math.min(g,b)+18)/72,0,1),lumaGate=clamp((y-14)/42,0,1)*clamp((252-y)/35,0,1);
    return clamp(Math.max(Math.min(cbScore,crScore)*1.9,rgbWarm*.72)*lumaGate,0,1)
  }
  function beautyLuma(d,i){return .299*d[i]+.587*d[i+1]+.114*d[i+2]}
  function detectBeautyFaceBox(data,w,h){
    const cols=12,rows=16,bins=new Float32Array(cols*rows),step=Math.max(1,Math.floor(Math.max(w,h)/360));
    let total=0;
    for(let y=0;y<h;y+=step){for(let x=0;x<w;x+=step){const i=(y*w+x)*4,s=skinConfidence(data[i],data[i+1],data[i+2]);if(s<.16)continue;const nx=(x+.5)/w,ny=(y+.5)/h,center=.58+.42*(1-clamp(Math.abs(nx-.5)/.52,0,1)),upper=ny<.82?1:.72,v=s*center*upper;bins[Math.min(rows-1,Math.floor(ny*rows))*cols+Math.min(cols-1,Math.floor(nx*cols))]+=v;total+=v}}
    if(total<6)return null;
    let best=-1,bx=6,by=7;
    for(let gy=1;gy<rows-1;gy++){for(let gx=1;gx<cols-1;gx++){let sum=0;for(let yy=-1;yy<=1;yy++)for(let xx=-1;xx<=1;xx++)sum+=bins[(gy+yy)*cols+(gx+xx)];const centerPenalty=.78+.22*(1-Math.abs((gx+.5)/cols-.5)*2),score=sum*centerPenalty;if(score>best){best=score;bx=gx;by=gy}}}
    if(best<Math.max(1,total*.026))return null;
    const seedX=(bx+.5)/cols*w,seedY=(by+.5)/rows*h,winX=w*.36,winY=h*.42;
    let mass=0,sx=0,sy=0,sxx=0,syy=0;
    for(let y=0;y<h;y+=step){if(Math.abs(y-seedY)>winY)continue;for(let x=0;x<w;x+=step){if(Math.abs(x-seedX)>winX)continue;const i=(y*w+x)*4,s=skinConfidence(data[i],data[i+1],data[i+2]);if(s<.18)continue;const dx=(x-seedX)/winX,dy=(y-seedY)/winY,local=Math.max(0,1-(dx*dx+dy*dy));if(local<=0)continue;const v=s*local;mass+=v;sx+=x*v;sy+=y*v;sxx+=x*x*v;syy+=y*y*v}}
    if(mass<4)return null;
    const cx=sx/mass,cy=sy/mass,vx=Math.max(1,sxx/mass-cx*cx),vy=Math.max(1,syy/mass-cy*cy);
    return {cx,cy,rx:clamp(Math.sqrt(vx)*2.75,w*.16,w*.39),ry:clamp(Math.sqrt(vy)*2.9,h*.18,h*.44)}
  }
  function beautyFaceWeight(x,y,box){const dx=(x-box.cx)/Math.max(1,box.rx),dy=(y-box.cy)/Math.max(1,box.ry),q=dx*dx+dy*dy;if(q>=1.14)return 0;if(q<=.70)return 1;return 1-(q-.70)/.44}
  function buildBeautyLayer(sourceCanvas,beauty,targetLimit=920,bucket='still'){
    const b=Object.assign(defaultBeauty(),beauty||{}),sm=clamp(Number(b.smooth||0)/100,0,1),bl=clamp(Number(b.blemish||0)/100,0,1),red=clamp(Number(b.redness||0)/100,0,1),bright=clamp(Number(b.brighten||0)/100,0,1),glow=clamp(Number(b.glow||0)/100,0,1);
    if(!(sm||bl||red||bright||glow))return null;
    const maxSide=Math.max(sourceCanvas.width,sourceCanvas.height),scale=Math.min(1,targetLimit/maxSide),tw=Math.max(1,Math.round(sourceCanvas.width*scale)),th=Math.max(1,Math.round(sourceCanvas.height*scale));
    const src=beautyBuffer(bucket,'src',tw,th),soft=beautyBuffer(bucket,'soft',tw,th),heal=beautyBuffer(bucket,'heal',tw,th),layer=beautyBuffer(bucket,'layer',tw,th),sctx=src.getContext('2d',{alpha:false}),softCtx=soft.getContext('2d',{alpha:false}),healCtx=heal.getContext('2d',{alpha:false}),lctx=layer.getContext('2d');
    if(!sctx||!softCtx||!healCtx||!lctx)return null;
    sctx.clearRect(0,0,tw,th);sctx.imageSmoothingEnabled=true;sctx.drawImage(sourceCanvas,0,0,sourceCanvas.width,sourceCanvas.height,0,0,tw,th);
    const pxScale=Math.max(.32,Math.max(tw,th)/920),softRadius=(1.2+sm*5.6+bl*.9)*pxScale,healRadius=(3.2+bl*11.2)*pxScale;
    softCtx.clearRect(0,0,tw,th);softCtx.filter=`blur(${softRadius.toFixed(2)}px)`;softCtx.drawImage(src,0,0);softCtx.filter='none';
    healCtx.clearRect(0,0,tw,th);healCtx.filter=`blur(${healRadius.toFixed(2)}px)`;healCtx.drawImage(src,0,0);healCtx.filter='none';
    let orig,softData,healData;try{orig=sctx.getImageData(0,0,tw,th);softData=softCtx.getImageData(0,0,tw,th);healData=healCtx.getImageData(0,0,tw,th)}catch(e){return null}
    const od=orig.data,sd=softData.data,hd=healData.data,out=lctx.createImageData(tw,th),dd=out.data,face=detectBeautyFaceBox(od,tw,th)||{cx:tw*.5,cy:th*.44,rx:tw*.33,ry:th*.40};
    for(let y=0;y<th;y++){for(let x=0;x<tw;x++){const i=(y*tw+x)*4,r=od[i],g=od[i+1],bb=od[i+2],skin=skinConfidence(r,g,bb),faceWeight=beautyFaceWeight(x,y,face),mask=skin*faceWeight;if(mask<.045)continue;
      const sr=sd[i],sg=sd[i+1],sb=sd[i+2],hr=hd[i],hg=hd[i+1],hb=hd[i+2],lum=beautyLuma(od,i),healLum=beautyLuma(hd,i);
      const left=x>0?beautyLuma(od,i-4):lum,right=x<tw-1?beautyLuma(od,i+4):lum,up=y>0?beautyLuma(od,i-tw*4):lum,down=y<th-1?beautyLuma(od,i+tw*4):lum,edge=Math.abs(left-right)+Math.abs(up-down),maxc=Math.max(r,g,bb),minc=Math.min(r,g,bb),sat=(maxc-minc)/Math.max(1,maxc),featureKeep=clamp(1-clamp((edge-8)/82,0,1)*.82-clamp((sat-.55)/.35,0,1)*.18,.12,1);
      const smoothMix=clamp(sm*mask*(.24+.76*featureKeep)*.92,0,.92);let rr=r+(sr-r)*smoothMix,gg=g+(sg-g)*smoothMix,bbb=bb+(sb-bb)*smoothMix;
      const colorDiff=(Math.abs(r-hr)+Math.abs(g-hg)+Math.abs(bb-hb))/3,redExcess=Math.max(0,r-(g+bb)*.5),darkSpot=Math.max(0,healLum-lum),brightSpot=Math.max(0,lum-healLum),blemishTarget=clamp((colorDiff-2.5)/15+Math.abs(lum-healLum)/28+redExcess/30+darkSpot/30+brightSpot/48,0,1),acneMix=clamp(bl*mask*(.16+.84*blemishTarget)*(.44+.56*featureKeep)*1.20,0,.98);
      rr+=(hr-rr)*acneMix;gg+=(hg-gg)*acneMix;bbb+=(hb-bbb)*acneMix;
      if(bl>0&&blemishTarget>0){const local=(gg+bbb)*.5,excess=Math.max(0,rr-local),repair=bl*blemishTarget*mask;rr-=excess*repair*.72;gg+=excess*repair*.08;const outLum=.299*rr+.587*gg+.114*bbb,lift=Math.max(0,healLum-outLum)*repair*.72;rr+=lift;gg+=lift;bbb+=lift}
      if(red>0){const excess=Math.max(0,rr-(gg+bbb)*.5),repair=red*mask;rr-=excess*repair*.86;gg+=excess*repair*.12}
      if(bright>0){const lift=(7+18*(1-(.299*rr+.587*gg+.114*bbb)/255))*bright*mask;rr+=lift;gg+=lift*.96;bbb+=lift*.92}
      if(glow>0){const a=glow*mask;rr+=(255-rr)*a*.048;gg+=(247-gg)*a*.043;bbb+=(244-bbb)*a*.043}
      dd[i]=clamp(rr,0,255);dd[i+1]=clamp(gg,0,255);dd[i+2]=clamp(bbb,0,255);dd[i+3]=Math.round(clamp(.52+.46*mask,0,.98)*255)
    }}
    lctx.clearRect(0,0,tw,th);lctx.putImageData(out,0,0);return {layer,tw,th,face}
  }
  function applyBeautyPass(ctx,w,h,beauty=state.beauty){
    if(state.compare)return;
    const built=buildBeautyLayer(ctx.canvas,beauty,920,'still');if(!built)return;
    ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(built.layer,0,0,built.tw,built.th,0,0,w,h);ctx.restore()
  }
'''
pattern = re.compile(r"  function skinConfidence\(r,g,b\)\{.*?\n  \}\n\n  function applyPresetCast", re.S)
match = pattern.search(app)
if not match:
    raise SystemExit('beauty engine block not found')
app = app[:match.start()] + beauty_block + '\n  function applyPresetCast' + app[match.end():]

live_block = r'''  const LIVE_BEAUTY_INTERVAL=145;
  let liveBeautyTimer=0,liveBeautyBusy=false;
  function liveBeautyActive(){const b=state.beauty||defaultBeauty();return beautyDefs.some(([k])=>Number(b[k]||0)>0)}
  function stopLiveBeautyPreview(){if(liveBeautyTimer){clearTimeout(liveBeautyTimer);liveBeautyTimer=0}liveBeautyBusy=false;const c=$('#liveBeautyCanvas');if(c){c.style.opacity='0';const x=c.getContext('2d');x?.clearRect(0,0,c.width,c.height)}}
  function scheduleLiveBeautyPreview(delay=0){
    if(liveBeautyTimer){clearTimeout(liveBeautyTimer);liveBeautyTimer=0}
    const canvas=$('#liveBeautyCanvas');
    if(!state.cameraReady||!liveBeautyActive()){if(canvas)canvas.style.opacity='0';return}
    liveBeautyTimer=setTimeout(()=>requestAnimationFrame(renderLiveBeautyFrame),Math.max(0,delay))
  }
  function renderLiveBeautyFrame(){
    liveBeautyTimer=0;const video=$('#cameraVideo'),canvas=$('#liveBeautyCanvas'),stage=$('#cameraStage');
    if(!video||!canvas||!stage||!state.cameraReady||!liveBeautyActive()){if(canvas)canvas.style.opacity='0';return}
    if(state.recording||document.hidden||video.readyState<2||!video.videoWidth){canvas.style.opacity='0';scheduleLiveBeautyPreview(300);return}
    if(liveBeautyBusy){scheduleLiveBeautyPreview(LIVE_BEAUTY_INTERVAL);return}
    liveBeautyBusy=true;
    try{
      const rect=stage.getBoundingClientRect(),aspect=Math.max(.25,rect.width/Math.max(1,rect.height)),longSide=260;let cw,ch;if(aspect>=1){cw=longSide;ch=Math.max(96,Math.round(longSide/aspect))}else{ch=longSide;cw=Math.max(96,Math.round(longSide*aspect))}
      const source=beautyBuffer('live','video',cw,ch),sctx=source.getContext('2d',{alpha:false});if(!sctx)return;sctx.clearRect(0,0,cw,ch);drawVideoCrop(sctx,video,cw,ch);
      const liveBeauty=Object.assign(defaultBeauty(),state.beauty||{});liveBeauty.smooth=Math.round(Number(liveBeauty.smooth||0)*.82);liveBeauty.blemish=Math.round(Number(liveBeauty.blemish||0)*.92);liveBeauty.redness=Math.round(Number(liveBeauty.redness||0)*.82);liveBeauty.brighten=Math.round(Number(liveBeauty.brighten||0)*.78);liveBeauty.glow=Math.round(Number(liveBeauty.glow||0)*.74);
      const built=buildBeautyLayer(source,liveBeauty,280,'live');if(!built){canvas.style.opacity='0';return}
      if(canvas.width!==cw)canvas.width=cw;if(canvas.height!==ch)canvas.height=ch;const cctx=canvas.getContext('2d');if(!cctx)return;cctx.clearRect(0,0,cw,ch);cctx.imageSmoothingEnabled=true;cctx.drawImage(built.layer,0,0,built.tw,built.th,0,0,cw,ch);canvas.style.filter=cameraCssFromParams(currentLiveParams());canvas.style.opacity='1'
    }catch(e){console.warn('Kira live Beauty:',e);canvas.style.opacity='0'}finally{liveBeautyBusy=false;scheduleLiveBeautyPreview(LIVE_BEAUTY_INTERVAL)}
  }
  function applyLiveFilter(){const video=$('#cameraVideo');if(!video)return;const p=currentLiveParams();video.style.filter=cameraCssFromParams(p);video.style.imageRendering=Number(p.lowRes||0)>55?'pixelated':'auto';const tone=$('#liveToneOverlay'),fade=$('#liveFadeOverlay'),vig=$('#liveVignetteOverlay'),texture=$('#liveTextureOverlay');if(tone){if(p.castColor&&Number(p.castStrength)>0){tone.style.background=p.castColor;tone.style.opacity=String(Math.min(.55,Number(p.castStrength)/100));tone.style.mixBlendMode=p.castMode||'soft-light'}else{const warm=Number(p.warmth||0),tint=Number(p.tint||0);let c='255,151,94',op=Math.min(.28,Math.abs(warm)/115);if(warm<0)c='76,145,205';if(Math.abs(tint)>Math.abs(warm)){c=tint>0?'230,112,155':'92,162,118';op=Math.min(.22,Math.abs(tint)/135)}tone.style.background=`rgb(${c})`;tone.style.opacity=String(op);tone.style.mixBlendMode='soft-light'}}if(fade)fade.style.opacity=String(Math.min(.28,Math.max(0,p.fade||0)/130));if(vig)vig.style.opacity=String(Math.min(.62,Math.max(0,p.vignette||0)/58));if(texture){const scan=Number(p.scanlines||0),low=Number(p.lowRes||0),layers=[];if(scan>0)layers.push('repeating-linear-gradient(to bottom,rgba(255,255,255,.08) 0 1px,rgba(0,0,0,.20) 1px 2px,transparent 2px 5px)');if(low>22)layers.push('repeating-linear-gradient(to right,rgba(255,255,255,.035) 0 1px,transparent 1px 4px)');texture.style.background=layers.length?layers.join(','):'none';texture.style.opacity=String(layers.length?Math.min(.30,scan/150+low/500):0);texture.style.mixBlendMode='overlay'}scheduleLiveBeautyPreview(0);syncCameraBeautyControls()}
'''
pattern = re.compile(r"  function applyLiveFilter\(\)\{.*?\n  function updateCameraViewport", re.S)
match = pattern.search(app)
if not match:
    raise SystemExit('applyLiveFilter block not found')
app = app[:match.start()] + live_block + '  function updateCameraViewport' + app[match.end():]

app = must_replace(app, "  function stopCamera(){state.cameraTorchOn=false;", "  function stopCamera(){stopLiveBeautyPreview();state.cameraTorchOn=false;", 'stop camera beauty')
app = must_replace(app, "Acne / blemish targets uneven red or dark skin texture while Smooth softens overall skin. The saved photo uses Kira’s selective skin pass; the live camera stays intentionally lightweight.", "Smooth and Acne now target Kira’s detected face/skin region. High-contrast facial features are protected from smearing; the live preview uses a small face-only layer while saved photos use the stronger pass.", 'develop beauty help')
app = must_replace(app, "service-worker.js?v=12.2.0", "service-worker.js?v=12.3.0", 'service worker registration')
write('app.js', app)


# --- style.css ---
css = read('style.css')
css += r'''

/* Build 12.3 — face-targeted Beauty preview. One small live canvas overlays only processed skin pixels. */
.live-beauty-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;opacity:0;object-fit:cover;image-rendering:auto;transition:opacity .12s linear;will-change:contents,filter}
.live-overlay{z-index:3}
body.camera-mode.camera-immersive .live-beauty-canvas{width:100%!important;height:100%!important}
'''
write('style.css', css)


# --- service workers ---
for path in ('service-worker.js','sw.js'):
    sw = read(path)
    sw = must_replace(sw, "const CACHE='kira-build12-2-beauty-controls-20260814';", "const CACHE='kira-build12-3-face-beauty-20260814';", f'{path} cache')
    write(path, sw)

print('Kira 12.3 face-targeted Beauty patch applied.')
