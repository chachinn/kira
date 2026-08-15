from pathlib import Path
import re

APP=Path('app.js')
IDX=Path('index.html')
CSS=Path('style.css')
SW=Path('service-worker.js')
SW2=Path('sw.js')

app=APP.read_text()
idx=IDX.read_text()
css=CSS.read_text()
sw=SW.read_text()


def sub_once(pattern,repl,text,label,flags=0):
    out,n=re.subn(pattern,repl,text,count=1,flags=flags)
    if n!=1:
        raise SystemExit(f'{label}: expected 1 replacement, got {n}')
    return out

# ---------- True Mono semantics ----------
app=sub_once(
    r"function presetIdentityGain\(f\)\{if\(!f\|\|f\.kind!=='builtin'\|\|f\.name==='Kira Original'\|\|f\.name==='Beauty Only'\)return 1;return FILTER_IDENTITY_GAIN\[f\.cat\]\|\|1\.35\}",
    "function presetIdentityGain(f){if(!f||f.kind!=='builtin'||f.name==='Kira Original'||f.name==='Beauty Only')return 1;return FILTER_IDENTITY_GAIN[f.cat]||1.35}\n  function monoLookActive(f,intensity){return !!f&&f.kind==='builtin'&&f.cat==='Mono'&&Number(intensity)>0}",
    app,'insert mono helper')

app=sub_once(
    r"function cameraCssFromParams\(p\)\{const br=Math\.max\(25,100\+Number\(p\.brightness\|\|0\)\+Number\(p\.exposure\|\|0\)\*1\.5\),co=Math\.max\(25,100\+Number\(p\.contrast\|\|0\)\),sa=Math\.max\(0,100\+Number\(p\.saturation\|\|0\)\);const sep=clamp\(Number\(p\.sepia\|\|0\)\+\(Number\(p\.warmth\|\|0\)>0\?Number\(p\.warmth\|\|0\)\*\.28:0\),0,72\);const hue=clamp\(Number\(p\.hue\|\|0\)\+Number\(p\.tint\|\|0\)\*\.22\+\(Number\(p\.warmth\|\|0\)<0\?-Number\(p\.warmth\|\|0\)\*\.07:0\),-55,55\);const blur=clamp\(Number\(p\.softness\|\|0\)\+Number\(p\.lowRes\|\|0\)/180,0,3\);return `brightness\(\$\{br\}%\) contrast\(\$\{co\}%\) saturate\(\$\{sa\}%\) sepia\(\$\{sep\}%\) hue-rotate\(\$\{hue\}deg\) blur\(\$\{blur\.toFixed\(2\)\}px\)`\}",
    "function cameraCssFromParams(p){const br=Math.max(25,100+Number(p.brightness||0)+Number(p.exposure||0)*1.5),co=Math.max(25,100+Number(p.contrast||0)),sa=Math.max(0,100+Number(p.saturation||0));const sep=clamp(Number(p.sepia||0)+(Number(p.warmth||0)>0?Number(p.warmth||0)*.28:0),0,72);const hue=clamp(Number(p.hue||0)+Number(p.tint||0)*.22+(Number(p.warmth||0)<0?-Number(p.warmth||0)*.07:0),-55,55);const blur=clamp(Number(p.softness||0)+Number(p.lowRes||0)/180,0,3),mono=p.mono?' grayscale(100%)':'';return `brightness(${br}%) contrast(${co}%) saturate(${sa}%) sepia(${sep}%) hue-rotate(${hue}deg) blur(${blur.toFixed(2)}px)${mono}`}",
    app,'camera css mono')

# Add mono flag to live built-in params.
app=sub_once(
    r"function liveParamsForPreset\(f\)\{if\(f\.kind==='recipe'&&f\.snapshot\)\{return filterParamsForSnapshot\(f\.snapshot\)\}const mix=\(state\.filterIntensity/100\)\*presetIdentityGain\(f\),p=f\.p\|\|\{\};return \{([^}]*)scanlines:Number\(p\.scanlines\|\|0\)\*mix\}\}",
    lambda m: "function liveParamsForPreset(f){if(f.kind==='recipe'&&f.snapshot){return filterParamsForSnapshot(f.snapshot)}const mix=(state.filterIntensity/100)*presetIdentityGain(f),p=f.p||{};return {"+m.group(1)+"scanlines:Number(p.scanlines||0)*mix,mono:monoLookActive(f,state.filterIntensity)}}",
    app,'live preset mono')

app=sub_once(
    r"function currentLiveParams\(\)\{const p=filterParams\(\);return \{([^}]*)scanlines:p\.scanlines\}\}",
    lambda m: "function currentLiveParams(){const p=filterParams();return {"+m.group(1)+"scanlines:p.scanlines,mono:p.mono}}",
    app,'current live mono')

# Add mono flag to Develop params and snapshot params.
app=sub_once(
    r"sparkleType:state\.effects\.sparkleType\|\|'Star'\};\n  \}\n  let raf=0;",
    "sparkleType:state.effects.sparkleType||'Star',mono:monoLookActive(f,state.filterIntensity)};\n  }\n  let raf=0;",
    app,'filterParams mono')

app=sub_once(
    r"sparkleType:e\.sparkleType\|\|'Star'\};\n  \}\n  function withVisualSnapshot",
    "sparkleType:e.sparkleType||'Star',mono:monoLookActive(f,s.filterIntensity??100)};\n  }\n  function withVisualSnapshot",
    app,'snapshot mono')

# Reusable final grayscale pass after all color overlays/effects.
anchor="  function applyPresetCast(ctx,w,h,p){"
if anchor not in app:
    raise SystemExit('applyPresetCast anchor missing')
mono_fn="""  function applyFinalMono(ctx,canvas,w,h){
    const tmp=applyFinalMono.buffer||(applyFinalMono.buffer=document.createElement('canvas'));
    if(tmp.width!==w)tmp.width=w;if(tmp.height!==h)tmp.height=h;
    const t=tmp.getContext('2d',{alpha:false});if(!t)return;
    t.clearRect(0,0,w,h);t.filter='grayscale(100%)';t.drawImage(canvas,0,0,w,h);t.filter='none';
    ctx.clearRect(0,0,w,h);ctx.drawImage(tmp,0,0,w,h)
  }

"""
app=app.replace(anchor,mono_fn+anchor,1)

app=sub_once(
    r"if\(p\.vignette>0\)\{const g=ctx\.createRadialGradient\(w/2,h/2,Math\.min\(w,h\)\*\.2,w/2,h/2,Math\.max\(w,h\)\*\.72\);g\.addColorStop\(\.45,'rgba\(0,0,0,0\)'\);g\.addColorStop\(1,`rgba\(20,8,8,\$\{Math\.min\(\.52,p\.vignette/80\)\}\)`\);ctx\.fillStyle=g;ctx\.fillRect\(0,0,w,h\)\}\n    if\(decorate&&!state\.compare\)",
    "if(p.vignette>0){const g=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.2,w/2,h/2,Math.max(w,h)*.72);g.addColorStop(.45,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(20,8,8,${Math.min(.52,p.vignette/80)})`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}\n    if(p.mono)applyFinalMono(ctx,canvas,w,h);\n    if(decorate&&!state.compare)",
    app,'develop final mono')

# ---------- Live/capture core color parity ----------
parity_helper="""  function applyPreviewToneToCanvas(ctx,w,h,p){
    if(p.castColor&&Number(p.castStrength)>0){
      const allowed=new Set(['soft-light','multiply','screen','overlay','color']);
      ctx.save();ctx.globalCompositeOperation=allowed.has(p.castMode)?p.castMode:'soft-light';ctx.globalAlpha=Math.min(.55,Number(p.castStrength)/100);ctx.fillStyle=p.castColor;ctx.fillRect(0,0,w,h);ctx.restore()
    }else{
      const warm=Number(p.warmth||0),tint=Number(p.tint||0);let c='255,151,94',op=Math.min(.28,Math.abs(warm)/115);
      if(warm<0)c='76,145,205';
      if(Math.abs(tint)>Math.abs(warm)){c=tint>0?'230,112,155':'92,162,118';op=Math.min(.22,Math.abs(tint)/135)}
      if(op>0){ctx.save();ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=op;ctx.fillStyle=`rgb(${c})`;ctx.fillRect(0,0,w,h);ctx.restore()}
    }
    if(p.fade>0){ctx.save();ctx.globalAlpha=Math.min(.28,Math.max(0,p.fade||0)/130);ctx.fillStyle='#ead9c9';ctx.fillRect(0,0,w,h);ctx.restore()}
  }

"""
app=app.replace("  function drawCameraShotFast(canvas,source,p=filterParams()){",parity_helper+"  function drawCameraShotFast(canvas,source,p=filterParams()){",1)

app=sub_once(
    r"function drawCameraShotFast\(canvas,source,p=filterParams\(\)\)\{.*?ctx\.restore\(\)\}",
    """function drawCameraShotFast(canvas,source,p=filterParams()){const ctx=canvas.getContext('2d',{alpha:false}),w=canvas.width,h=canvas.height;ctx.save();ctx.fillStyle='#171414';ctx.fillRect(0,0,w,h);ctx.filter=cameraCssFromParams(p);ctx.drawImage(source,0,0,w,h);ctx.filter='none';applyPreviewToneToCanvas(ctx,w,h,p);if(p.bloom>0&&p.bloom<40){ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.12,p.bloom/220);ctx.filter='blur(3px) brightness(112%)';ctx.drawImage(source,0,0,w,h);ctx.filter='none';ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}applyBeautyPass(ctx,w,h,state.beauty);if(p.rgbSplit>0)applyRGBSplit(ctx,canvas,w,h,p.rgbSplit);if(p.lowRes>0)applyLowResolution(ctx,canvas,w,h,p.lowRes);if(p.noise>0)applyNoise(ctx,w,h,p.noise);if(p.grain>0)applyGrain(ctx,w,h,p.grain,p.grainType);if(p.scanlines>0)applyScanlines(ctx,w,h,p.scanlines);if(p.dust>0)applyDust(ctx,w,h,p.dust);if(p.scratches>0)applyScratches(ctx,w,h,p.scratches);if(p.sharpness>0)applySharpness(ctx,w,h,p.sharpness);if(p.vignette>0){const g=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.22,w/2,h/2,Math.max(w,h)*.72);g.addColorStop(.5,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(20,8,8,${Math.min(.62,Math.max(0,p.vignette||0)/58)})`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}if(p.mono)applyFinalMono(ctx,canvas,w,h);if(state.frame!=='None')drawFrame(ctx,w,h);if(state.dateEnabled)drawDate(ctx,w,h);ctx.restore()}""",
    app,'capture parity renderer',flags=re.S)

# ---------- Media Details browse/swipe ----------
old_media='''      <img id="photoModalImage" class="photo-detail-image" alt="Kira photo">\n      <video id="photoModalVideo" class="photo-detail-image hidden" controls playsinline preload="metadata"></video>'''
new_media='''      <div class="photo-detail-media-wrap" id="photoMediaSwipeZone">\n        <button type="button" class="photo-browse-btn prev" id="photoPrevBtn" aria-label="Previous media">‹</button>\n        <img id="photoModalImage" class="photo-detail-image" alt="Kira photo">\n        <video id="photoModalVideo" class="photo-detail-image hidden" controls playsinline preload="metadata"></video>\n        <button type="button" class="photo-browse-btn next" id="photoNextBtn" aria-label="Next media">›</button>\n        <div class="photo-browse-count" id="photoBrowseCount" aria-live="polite"></div>\n      </div>'''
if old_media not in idx: raise SystemExit('media markup anchor missing')
idx=idx.replace(old_media,new_media,1)

browse_helpers="""  function modalBrowseItems(){return currentRollItems().filter(x=>x?.blob)}
  function updatePhotoBrowseUi(id=state.photoModalId){
    const items=modalBrowseItems(),index=items.findIndex(x=>String(x.id)===String(id)),prev=$('#photoPrevBtn'),next=$('#photoNextBtn'),count=$('#photoBrowseCount');
    if(prev)prev.disabled=index<=0;if(next)next.disabled=index<0||index>=items.length-1;if(count)count.textContent=index>=0?`${index+1} / ${items.length}`:''
  }
  async function navigatePhotoModal(step){
    const items=modalBrowseItems(),index=items.findIndex(x=>String(x.id)===String(state.photoModalId));if(index<0)return;
    const next=items[index+step];if(!next)return;
    if(state.photoModalDirty)await savePhotoDetails({reopen:false,quiet:true});
    safeOpenPhotoModal(next.id);haptic(8)
  }
  let photoSwipeStart=null;
  function bindPhotoModalBrowsing(){
    const zone=$('#photoMediaSwipeZone');if(!zone||zone.dataset.bound==='1')return;zone.dataset.bound='1';
    $('#photoPrevBtn')&&($('#photoPrevBtn').onclick=()=>navigatePhotoModal(-1));$('#photoNextBtn')&&($('#photoNextBtn').onclick=()=>navigatePhotoModal(1));
    zone.addEventListener('touchstart',e=>{if(e.touches.length!==1){photoSwipeStart=null;return}const t=e.touches[0];photoSwipeStart={x:t.clientX,y:t.clientY}},{passive:true});
    zone.addEventListener('touchend',e=>{if(!photoSwipeStart||e.changedTouches.length!==1){photoSwipeStart=null;return}const t=e.changedTouches[0],dx=t.clientX-photoSwipeStart.x,dy=t.clientY-photoSwipeStart.y;photoSwipeStart=null;if(Math.abs(dx)<52||Math.abs(dx)<=Math.abs(dy)*1.15)return;dx<0?navigatePhotoModal(1):navigatePhotoModal(-1)},{passive:true});
    document.addEventListener('keydown',e=>{if($('#photoModal')?.classList.contains('hidden'))return;if(/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName||''))return;if(e.key==='ArrowLeft'){e.preventDefault();navigatePhotoModal(-1)}else if(e.key==='ArrowRight'){e.preventDefault();navigatePhotoModal(1)}})
  }

"""
app=app.replace("  function openPhotoModal(id){",browse_helpers+"  function openPhotoModal(id){",1)

# Update openPhotoModal tail: clear dirty and update browser UI.
app=sub_once(
    r"\$\('#photoUseLookBtn'\)\.disabled=video\|\|!item\.snapshot;\$\('#photoModal'\)\.classList\.remove\('hidden'\)\}",
    "$('#photoUseLookBtn').disabled=video||!item.snapshot;state.photoModalDirty=false;$('#photoModal').classList.remove('hidden');updatePhotoBrowseUi(item.id)}",
    app,'modal browser ui')

# Make savePhotoDetails optionally quiet/non-reopening and track clean state.
app=sub_once(
    r"async function savePhotoDetails\(\)\{const item=currentModalPhoto\(\);if\(!item\)return;(.*?)await updateRollItem\(item\);if\(!captionSaved\)toast\('Memory details saved\.'\);else toast\('Memory details and caption saved\.'\);safeOpenPhotoModal\(item\.id\)\}",
    "async function savePhotoDetails(options={}){const opts=options&&options.currentTarget?{}:options||{},reopen=opts.reopen!==false,quiet=!!opts.quiet;const item=currentModalPhoto();if(!item)return;\\1await updateRollItem(item);state.photoModalDirty=false;if(!quiet){if(!captionSaved)toast('Memory details saved.');else toast('Memory details and caption saved.')}if(reopen)safeOpenPhotoModal(item.id)}",
    app,'save details options',flags=re.S)

# Inject dirty binding into bindInputs after caption size setup.
app=sub_once(
    r"const pcs=\$\('#photoCaptionSize'\);if\(pcs\)\{pcs\.oninput=e=>\{\$\('#photoCaptionSizeValue'\)&&\(\$\('#photoCaptionSizeValue'\)\.textContent=`\$\{e\.target\.value\}%`\)\};\}",
    "const pcs=$('#photoCaptionSize');if(pcs){pcs.oninput=e=>{$('#photoCaptionSizeValue')&&($('#photoCaptionSizeValue').textContent=`${e.target.value}%`);state.photoModalDirty=true};}['#photoTitleInput','#photoNotesInput','#photoTagsInput','#photoCaptionInput','#photoCaptionFontSelect'].forEach(s=>{const el=$(s);if(el)el.addEventListener('input',()=>{state.photoModalDirty=true})});bindPhotoModalBrowsing()",
    app,'bind browse/dirty')

# Clear dirty when closing Media Details.
app=sub_once(
    r"if\(id==='photoModal'\)\{for\(const media of \[\$\('#photoModalImage'\),\$\('#photoModalVideo'\)\]\)\{",
    "if(id==='photoModal'){state.photoModalDirty=false;for(const media of [$('#photoModalImage'),$('#photoModalVideo')]){",
    app,'close dirty reset')

# Ensure state includes dirty flag.
app=sub_once(
    r"photoModalId:null,rollModalId:null,",
    "photoModalId:null,photoModalDirty:false,rollModalId:null,",
    app,'state dirty')

# Media browsing styling.
css += """

/* === v1.0 MEDIA DETAILS BROWSE === */
.photo-detail-media-wrap{position:relative;display:grid;place-items:center;overflow:hidden;border-radius:18px;background:#171414;touch-action:pan-y}
.photo-detail-media-wrap .photo-detail-image{width:100%;margin:0;border-radius:0}
.photo-browse-btn{position:absolute;z-index:5;top:50%;transform:translateY(-50%);width:38px;height:52px;border:1px solid rgba(255,255,255,.32);border-radius:999px;background:rgba(32,25,26,.48);backdrop-filter:blur(10px);color:#fff;font-size:32px;line-height:1;padding:0;display:grid;place-items:center;box-shadow:0 5px 16px rgba(0,0,0,.16)}
.photo-browse-btn.prev{left:8px}.photo-browse-btn.next{right:8px}.photo-browse-btn:disabled{opacity:0;pointer-events:none}
.photo-browse-count{position:absolute;z-index:5;left:50%;bottom:9px;transform:translateX(-50%);padding:5px 9px;border-radius:999px;background:rgba(30,23,24,.52);backdrop-filter:blur(9px);color:#fff;font-size:9px;font-weight:800;letter-spacing:.04em;pointer-events:none}
@media(max-width:430px){.photo-browse-btn{width:34px;height:46px;font-size:28px}.photo-browse-btn.prev{left:6px}.photo-browse-btn.next{right:6px}}
"""

# Version/cache bump.
idx=idx.replace('manifest.json?v=1.0.5','manifest.json?v=1.0.6').replace('style.css?v=1.0.5','style.css?v=1.0.6').replace('app.js?v=1.0.5','app.js?v=1.0.6')
app=app.replace("service-worker.js?v=1.0.5","service-worker.js?v=1.0.6")
sw=sw.replace("const CACHE='kira-v1-0-capture-safe-beauty-20260815';","const CACHE='kira-v1-0-filter-parity-media-swipe-20260815';")

APP.write_text(app)
IDX.write_text(idx)
CSS.write_text(css)
SW.write_text(sw)
SW2.write_text(sw)
print('patched Kira v1.0 filter parity + true Mono + Media Details browse')
