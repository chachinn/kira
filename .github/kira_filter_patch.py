from pathlib import Path
import re

app_path=Path("app.js")
index_path=Path("index.html")
sw_path=Path("service-worker.js")
sw_alias_path=Path("sw.js")
app=app_path.read_text()
index=index_path.read_text()
sw=sw_path.read_text()
sw_alias=sw_alias_path.read_text()

def once(text, old, new, label):
    c=text.count(old)
    if c!=1:
        raise SystemExit(f"{label}: expected 1 match, found {c}")
    return text.replace(old,new,1)

def regex_once(text, pattern, repl, label, flags=0):
    new,c=re.subn(pattern,repl,text,count=1,flags=flags)
    if c!=1:
        raise SystemExit(f"{label}: expected 1 regex match, found {c}")
    return new

app=once(app,
"const defaultAdjust=()=>({exposure:0,brightness:0,contrast:0,highlights:0,shadows:0,saturation:0,warmth:0,tint:0,fade:0,sharpness:0,vignette:8});",
"const defaultAdjust=()=>({exposure:0,brightness:0,contrast:0,highlights:0,shadows:0,saturation:0,warmth:0,tint:0,fade:0,sharpness:0,vignette:0});",
"neutral default vignette")

app=once(app,
"const defaultEffects=()=>({grain:10,grainType:'Classic',bloom:0,bloomType:'Soft',dust:0,scratches:0,leak:0,leakType:'Pink',rgbSplit:0,noise:0,sparkle:0,sparkleType:'Star'});",
"const defaultEffects=()=>({grain:0,grainType:'Classic',bloom:0,bloomType:'Soft',dust:0,scratches:0,leak:0,leakType:'Pink',rgbSplit:0,noise:0,sparkle:0,sparkleType:'Star'});",
"neutral default grain")

marker="    ['Rose Flash','Kira','#b96c80,#f4cad0',{brightness:13,contrast:7,saturation:4,tint:12,bloom:12,bloomType:'Flash'}],\n    ['Film 100','Film'"
mood="""    ['Rose Flash','Kira','#b96c80,#f4cad0',{brightness:13,contrast:7,saturation:4,tint:12,bloom:12,bloomType:'Flash'}],

    // Build 11.7 — visibly distinct looks calibrated from the user's supplied references.
    ['Violet Hour','Mood','#67678f,#b4a9c8',{brightness:4,contrast:10,saturation:5,warmth:-13,tint:20,hue:7,castColor:'#7770a8',castStrength:27,castMode:'soft-light',noise:3,sharpness:4}],
    ['Amber Memory','Mood','#8b5d3f,#d8aa78',{brightness:6,contrast:7,saturation:-8,warmth:28,tint:-3,sepia:25,hue:-4,castColor:'#c27845',castStrength:28,castMode:'soft-light',fade:4,grain:4,grainType:'Fine'}],
    ['Midnight Blue','Mood','#172f48,#526b86',{brightness:-15,contrast:34,saturation:-24,warmth:-35,tint:-8,hue:-8,castColor:'#173b60',castStrength:40,castMode:'soft-light',noise:6,sharpness:5,vignette:17}],
    ['Rose Noir','Mood','#412a34,#815263',{brightness:-14,contrast:30,saturation:-14,warmth:-5,tint:29,hue:10,castColor:'#713347',castStrength:36,castMode:'soft-light',noise:5,vignette:16}],
    ['Silver Soft','Mood','#777777,#d7d7d7',{brightness:8,contrast:7,saturation:-100,highlights:6,shadows:5,fade:5,grain:3,grainType:'Fine',sharpness:2}],
    ['Deep Mono','Mood','#252525,#8f8f8f',{brightness:-12,contrast:40,saturation:-100,highlights:8,shadows:-9,grain:9,grainType:'Classic',sharpness:8,vignette:19}],

    ['Film 100','Film'"""
app=once(app,marker,mood,"Mood look insertion")

cats_old="const cats=['Kira','Recent','Favorites','Camera Packs','Instant','Vintage','Date Cam','Film','Film Stock','CCD','Y2K','Dream','Japan','My Recipes','All'];"
cats_new="const cats=['Kira','Mood','Recent','Favorites','Camera Packs','Instant','Vintage','Date Cam','Film','Film Stock','CCD','Y2K','Dream','Japan','My Recipes','All'];"
c=app.count(cats_old)
if c!=2:
    raise SystemExit(f"category lists: expected 2 matches, found {c}")
app=app.replace(cats_old,cats_new)

app=once(app,
"image:null,imageName:'kira-photo',activeFilter:'Old Rose',activeCategory:'Kira',filterIntensity:70,filterSearch:'',",
"image:null,imageName:'kira-photo',activeFilter:'Old Rose',activeCategory:'Kira',filterIntensity:100,filterSearch:'',",
"default filter intensity")

new_filter_params="""  function filterParams(){
    const f=findPreset(state.activeFilter),mix=state.compare?0:state.filterIntensity/100;
    const get=k=>(Number((f.kind==='builtin'?f.p[k]:0)||0)*mix)+(state.compare?0:Number(state.adjustments[k]||0));
    const preset=f.kind==='builtin'?(f.p||{}):{};
    const userGrain=state.compare?0:Number(state.effects.grain||0),userBloom=state.compare?0:Number(state.effects.bloom||0),userLeak=state.compare?0:Number(state.effects.leak||0);
    return {exposure:get('exposure'),brightness:get('brightness'),contrast:get('contrast'),highlights:get('highlights'),shadows:get('shadows'),saturation:get('saturation'),warmth:get('warmth'),tint:get('tint'),fade:get('fade'),sharpness:get('sharpness'),vignette:get('vignette'),sepia:state.compare?0:Number(preset.sepia||0)*mix,hue:state.compare?0:Number(preset.hue||0)*mix,castColor:state.compare?null:(preset.castColor||null),castStrength:state.compare?0:Number(preset.castStrength||0)*mix,castMode:preset.castMode||'soft-light',grain:state.compare?0:(Number(preset.grain||0)*mix+userGrain),grainType:userGrain>0?(state.effects.grainType||'Classic'):(preset.grainType||'Classic'),bloom:state.compare?0:(Number(preset.bloom||0)*mix+userBloom),bloomType:userBloom>0?(state.effects.bloomType||'Soft'):(preset.bloomType||'Soft'),dust:state.compare?0:(Number(preset.dust||0)*mix+Number(state.effects.dust||0)),scratches:state.compare?0:(Number(preset.scratches||0)*mix+Number(state.effects.scratches||0)),leak:state.compare?0:(Number(preset.leak||0)*mix+userLeak),leakType:userLeak>0?(state.effects.leakType||'Pink'):(preset.leakType||state.effects.leakType||'Pink'),rgbSplit:state.compare?0:(Number(preset.rgbSplit||0)*mix+Number(state.effects.rgbSplit||0)),noise:state.compare?0:(Number(preset.noise||0)*mix+Number(state.effects.noise||0)),sparkle:state.compare?0:Number(state.effects.sparkle||0),sparkleType:state.effects.sparkleType||'Star'};
  }"""
app=regex_once(app,r"  function filterParams\(\)\{.*?\n  let raf=",new_filter_params+"\n  let raf=","filterParams",re.S)

old_core="const br=100+p.brightness+p.exposure*1.7,co=100+p.contrast,sa=100+p.saturation;ctx.filter=`brightness(${Math.max(10,br)}%) contrast(${Math.max(10,co)}%) saturate(${Math.max(0,sa)}%)`;ctx.drawImage(state.image,0,0,w,h);ctx.filter='none';\n    if(p.shadows||p.highlights||p.tint)applyTonePixels(ctx,w,h,p);"
new_core="ctx.filter=cameraCssFromParams(p);ctx.drawImage(state.image,0,0,w,h);ctx.filter='none';\n    applyPresetCast(ctx,w,h,p);\n    if(p.shadows||p.highlights||p.tint)applyTonePixels(ctx,w,h,p);"
app=once(app,old_core,new_core,"Develop color pipeline")

cast_helper="  function applyPresetCast(ctx,w,h,p){const strength=clamp(Number(p.castStrength||0),0,60);if(!p.castColor||strength<=0)return;const allowed=new Set(['soft-light','multiply','screen','overlay','color']);ctx.save();ctx.globalCompositeOperation=allowed.has(p.castMode)?p.castMode:'soft-light';ctx.globalAlpha=Math.min(.58,strength/100);ctx.fillStyle=p.castColor;ctx.fillRect(0,0,w,h);ctx.restore()}\n"
app=once(app,"  function applyTonePixels(ctx,w,h,p){",cast_helper+"  function applyTonePixels(ctx,w,h,p){","cast helper")

new_live_helpers="""  function cameraCssFromParams(p){const br=Math.max(25,100+Number(p.brightness||0)+Number(p.exposure||0)*1.5),co=Math.max(25,100+Number(p.contrast||0)),sa=Math.max(0,100+Number(p.saturation||0));const sep=clamp(Number(p.sepia||0)+(Number(p.warmth||0)>0?Number(p.warmth||0)*.28:0),0,72);const hue=clamp(Number(p.hue||0)+Number(p.tint||0)*.22+(Number(p.warmth||0)<0?-Number(p.warmth||0)*.07:0),-42,42);return `brightness(${br}%) contrast(${co}%) saturate(${sa}%) sepia(${sep}%) hue-rotate(${hue}deg)`}
  function liveParamsForPreset(f){if(f.kind==='recipe'&&f.snapshot){return filterParamsForSnapshot(f.snapshot)}const mix=state.filterIntensity/100,p=f.p||{};return {exposure:Number(p.exposure||0)*mix,brightness:Number(p.brightness||0)*mix,contrast:Number(p.contrast||0)*mix,saturation:Number(p.saturation||0)*mix,warmth:Number(p.warmth||0)*mix,tint:Number(p.tint||0)*mix,fade:Number(p.fade||0)*mix,vignette:Number(p.vignette||0)*mix,bloom:Number(p.bloom||0)*mix,sepia:Number(p.sepia||0)*mix,hue:Number(p.hue||0)*mix,castColor:p.castColor||null,castStrength:Number(p.castStrength||0)*mix,castMode:p.castMode||'soft-light'}}
  function currentLiveParams(){const p=filterParams();return {exposure:p.exposure,brightness:p.brightness,contrast:p.contrast,saturation:p.saturation,warmth:p.warmth,tint:p.tint,fade:p.fade,vignette:p.vignette,bloom:p.bloom,sepia:p.sepia,hue:p.hue,castColor:p.castColor,castStrength:p.castStrength,castMode:p.castMode}}"""
app=regex_once(app,r"  function cameraCssFromParams\(p\)\{.*?\n  function currentLiveParams\(\)\{.*?\}\n",new_live_helpers+"\n","live parameter pipeline",re.S)

new_apply_live="""  function applyLiveFilter(){const video=$('#cameraVideo');if(!video)return;const p=currentLiveParams();video.style.filter=cameraCssFromParams(p);const tone=$('#liveToneOverlay'),fade=$('#liveFadeOverlay'),vig=$('#liveVignetteOverlay');if(tone){if(p.castColor&&Number(p.castStrength)>0){tone.style.background=p.castColor;tone.style.opacity=String(Math.min(.55,Number(p.castStrength)/100));tone.style.mixBlendMode=p.castMode||'soft-light'}else{const warm=Number(p.warmth||0),tint=Number(p.tint||0);let c='255,151,94',op=Math.min(.28,Math.abs(warm)/115);if(warm<0)c='76,145,205';if(Math.abs(tint)>Math.abs(warm)){c=tint>0?'230,112,155':'92,162,118';op=Math.min(.22,Math.abs(tint)/135)}tone.style.background=`rgb(${c})`;tone.style.opacity=String(op);tone.style.mixBlendMode='soft-light'}}if(fade)fade.style.opacity=String(Math.min(.28,Math.max(0,p.fade||0)/130));if(vig)vig.style.opacity=String(Math.min(.62,Math.max(0,p.vignette||0)/58))}"""
app=regex_once(app,r"  function applyLiveFilter\(\)\{.*?\n  function updateCameraViewport",new_apply_live+"\n  function updateCameraViewport","live filter application",re.S)

snapshot_helpers="""  function filterParamsForSnapshot(s){
    s=s||{};const f=findPreset(s.activeFilter||state.activeFilter),mix=clamp(Number(s.filterIntensity??100)/100,0,1),a=s.adjustments||{},e=s.effects||{},preset=f.kind==='builtin'?(f.p||{}):{};
    const get=k=>Number(preset[k]||0)*mix+Number(a[k]||0),userGrain=Number(e.grain||0),userBloom=Number(e.bloom||0),userLeak=Number(e.leak||0);
    return {exposure:get('exposure'),brightness:get('brightness'),contrast:get('contrast'),highlights:get('highlights'),shadows:get('shadows'),saturation:get('saturation'),warmth:get('warmth'),tint:get('tint'),fade:get('fade'),sharpness:get('sharpness'),vignette:get('vignette'),sepia:Number(preset.sepia||0)*mix,hue:Number(preset.hue||0)*mix,castColor:preset.castColor||null,castStrength:Number(preset.castStrength||0)*mix,castMode:preset.castMode||'soft-light',grain:Number(preset.grain||0)*mix+userGrain,grainType:userGrain>0?(e.grainType||'Classic'):(preset.grainType||'Classic'),bloom:Number(preset.bloom||0)*mix+userBloom,bloomType:userBloom>0?(e.bloomType||'Soft'):(preset.bloomType||'Soft'),dust:Number(preset.dust||0)*mix+Number(e.dust||0),scratches:Number(preset.scratches||0)*mix+Number(e.scratches||0),leak:Number(preset.leak||0)*mix+userLeak,leakType:userLeak>0?(e.leakType||'Pink'):(preset.leakType||e.leakType||'Pink'),rgbSplit:Number(preset.rgbSplit||0)*mix+Number(e.rgbSplit||0),noise:Number(preset.noise||0)*mix+Number(e.noise||0),sparkle:Number(e.sparkle||0),sparkleType:e.sparkleType||'Star'};
  }
  function withVisualSnapshot(snapshot,fn){const keys=['frame','frameTone','frameWidth','frameCorner','caption','captionFont','captionSize','dateEnabled','dateStyle','dateValue','dateColor','datePosition','dateCustomText'];const saved={};for(const key of keys){saved[key]=state[key];if(snapshot&&Object.prototype.hasOwnProperty.call(snapshot,key))state[key]=snapshot[key]}try{return fn()}finally{for(const key of keys)state[key]=saved[key]}}
"""
app=once(app,"  function drawCameraShotFast(canvas,source){",snapshot_helpers+"  function drawCameraShotFast(canvas,source,p=filterParams()){	","snapshot-safe capture helpers")
app=app.replace("  function drawCameraShotFast(canvas,source,p=filterParams()){	","  function drawCameraShotFast(canvas,source,p=filterParams()){")

new_camera_draw="""  function drawCameraShotFast(canvas,source,p=filterParams()){const ctx=canvas.getContext('2d',{alpha:false}),w=canvas.width,h=canvas.height;ctx.save();ctx.fillStyle='#171414';ctx.fillRect(0,0,w,h);ctx.filter=cameraCssFromParams(p);ctx.drawImage(source,0,0,w,h);ctx.filter='none';applyPresetCast(ctx,w,h,p);if(p.fade>0){ctx.globalAlpha=Math.min(.36,p.fade/100);ctx.fillStyle='#ead9c9';ctx.fillRect(0,0,w,h);ctx.globalAlpha=1}if(p.warmth){ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=Math.min(.25,Math.abs(p.warmth)/135);ctx.fillStyle=p.warmth>0?'#ff995e':'#4d94c2';ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}if(p.bloom>0&&p.bloom<40){ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.16,p.bloom/180);ctx.filter='blur(3px) brightness(114%)';ctx.drawImage(source,0,0,w,h);ctx.filter='none';ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}if(p.rgbSplit>0)applyRGBSplit(ctx,canvas,w,h,p.rgbSplit);if(p.noise>0)applyNoise(ctx,w,h,p.noise);if(p.grain>0)applyGrain(ctx,w,h,p.grain,p.grainType);if(p.dust>0)applyDust(ctx,w,h,p.dust);if(p.scratches>0)applyScratches(ctx,w,h,p.scratches);if(p.sharpness>0)applySharpness(ctx,w,h,p.sharpness);if(p.vignette>0){const g=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.22,w/2,h/2,Math.max(w,h)*.72);g.addColorStop(.5,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(20,8,8,${Math.min(.48,p.vignette/90)})`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}if(state.frame!=='None')drawFrame(ctx,w,h);if(state.dateEnabled)drawDate(ctx,w,h);ctx.restore()}"""
app=regex_once(app,r"  function drawCameraShotFast\(canvas,source,p=filterParams\(\)\)\{.*?\n  async function processContinuousPhoto",new_camera_draw+"\n  async function processContinuousPhoto","capture rendering",re.S)

new_process="""  async function processContinuousPhoto(task){const source=await decodePhotoBlob(task.blob);try{const maxSide=1920,sw=source.width||source.naturalWidth||task.width,sh=source.height||source.naturalHeight||task.height,scale=Math.min(1,maxSide/Math.max(sw,sh)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(sw*scale));c.height=Math.max(1,Math.round(sh*scale));const p=filterParamsForSnapshot(task.snapshot);withVisualSnapshot(task.snapshot,()=>drawCameraShotFast(c,source,p));const finalBlob=await new Promise(resolve=>c.toBlob(resolve,'image/jpeg',.92));if(!finalBlob)throw new Error('Could not encode photo');const name=`kira-${task.stamp}`;const id=await storeRollPhoto(finalBlob,{kind:'edited',mediaType:'photo',name,filter:task.filter,favorite:false,snapshot:task.snapshot,rollId:task.rollId,cameraCapture:true});queueRollIdForPhotos(id);toast(state.settings.autoPhotos?`Saved • ${state.photosQueueIds.length} waiting for Photos`:`Saved to ${rollName(task.rollId)} ✓`)}finally{if(source&&typeof source.close==='function')source.close()}}"""
app=regex_once(app,r"  async function processContinuousPhoto\(task\)\{.*?\n  async function runPhotoProcessQueue",new_process+"\n  async function runPhotoProcessQueue","snapshot-safe photo processing",re.S)

app=once(app,"navigator.serviceWorker.register('./service-worker.js?v=11.6.0')","navigator.serviceWorker.register('./service-worker.js?v=11.7.0')","service worker registration version")

index=once(index,'<script src="./app.js?v=11.0.0"></script>','<script src="./app.js?v=11.7.0"></script>',"app script version")
for old,new,label in [
('id="liveIntensityValue">70<','id="liveIntensityValue">100<',"live intensity label"),
('id="liveFilterIntensity" type="range" min="0" max="100" value="70"','id="liveFilterIntensity" type="range" min="0" max="100" value="100"',"live intensity slider"),
('id="activeLookIntensity">70%<','id="activeLookIntensity">100%<',"active look label"),
('id="intensityValue">70<','id="intensityValue">100<',"Develop intensity label"),
('id="filterIntensity" min="0" max="100" value="70"','id="filterIntensity" min="0" max="100" value="100"',"Develop intensity slider"),
('<div class="setting-row"><span>Current version</span><b>Build 11</b></div>','<div class="setting-row"><span>Current version</span><b>Build 11.7</b></div>',"About version"),
('<div class="release-badge">BUILD 11</div>','<div class="release-badge">BUILD 11.7</div>',"What’s New badge"),
('<h4>A much bigger Kira, with a much calmer UI.</h4>','<h4>Filters that finally feel unmistakably different.</h4>',"What’s New title")
]:
    index=once(index,old,new,label)

old_info="""        <div><b>☰</b><span>New hamburger navigation with only Camera, Develop, and Rolls kept in the bottom bar.</span></div>
        <div><b>⌕</b><span>Library search, sorting, titles, notes, and tags.</span></div>
        <div><b>✦</b><span>Recent Looks, Surprise Me, and shortcuts to Film Lab and favorites.</span></div>
        <div><b>◉</b><span>Zoom and flashlight controls appear automatically when the device supports them.</span></div>
        <div><b>◌</b><span>Themes, UI density, storage dashboard, persistent-storage request, and setup backup/restore.</span></div>
        <div><b>⚡</b><span>Startup work reduced: heavy Develop panels are now built only when you actually open Develop.</span></div>"""
new_info="""        <div><b>◐</b><span>Filter calibration overhaul: stronger separation in color, contrast, warmth, tint, monochrome, and mood.</span></div>
        <div><b>✦</b><span>Six new Mood looks: Violet Hour, Amber Memory, Midnight Blue, Rose Noir, Silver Soft, and Deep Mono.</span></div>
        <div><b>100</b><span>Looks now open at their intended 100% strength instead of being softened to 70% by default.</span></div>
        <div><b>◌</b><span>Preset-specific grain and bloom styles now render correctly instead of being overridden by generic defaults.</span></div>
        <div><b>⚡</b><span>Captured photos keep the exact look that was active when the shutter was pressed, even while the save queue is busy.</span></div>
        <div><b>□</b><span>Kira Original is neutral again: no hidden default grain or vignette is added.</span></div>"""
index=once(index,old_info,new_info,"What’s New filter notes")

old_cache="const CACHE='kira-build11-6-1989-digitfix-20260812';"
for name,text in [("service-worker.js",sw),("sw.js",sw_alias)]:
    if text.count(old_cache)!=1:
        raise SystemExit(f"{name}: cache marker mismatch")
sw=sw.replace(old_cache,"const CACHE='kira-build11-7-filter-engine-20260814';",1)
sw_alias=sw_alias.replace(old_cache,"const CACHE='kira-build11-7-filter-engine-20260814';",1)

app_path.write_text(app)
index_path.write_text(index)
sw_path.write_text(sw)
sw_alias_path.write_text(sw_alias)
