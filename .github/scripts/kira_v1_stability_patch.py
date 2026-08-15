from pathlib import Path
import re


def once(text, old, new, label):
    if text.count(old) != 1:
        raise SystemExit(f'{label}: expected exactly one target, found {text.count(old)}')
    return text.replace(old, new, 1)


p = Path('app.js')
s = p.read_text()

s = once(
    s,
    "cameraTorchOn:false,cameraCapabilities:null,cameraZoomTimer:null,developInitialized:false,cameraImmersive:false",
    "cameraTorchOn:false,cameraCapabilities:null,cameraZoomTimer:null,cameraFlashMode:localStorage.getItem('kira.cameraFlashMode')==='on'?'on':'off',developInitialized:false,cameraImmersive:false",
    'flash state',
)

s = once(
    s,
    "const LIVE_BEAUTY_INTERVAL=145;\n  let liveBeautyTimer=0,liveBeautyBusy=false;",
    """const LIVE_BEAUTY_INTERVAL=120;
  let liveBeautyTimer=0,liveBeautyBusy=false,liveBeautyFaceTrack=null,liveBeautyFaceMisses=0;
  function resetLiveBeautyTracking(){liveBeautyFaceTrack=null;liveBeautyFaceMisses=0}
  function stabilizeLiveBeautyFace(face,w,h){
    if(!face){liveBeautyFaceMisses++;if(liveBeautyFaceTrack&&liveBeautyFaceMisses<=1)return {...liveBeautyFaceTrack};liveBeautyFaceTrack=null;return null}
    liveBeautyFaceMisses=0;
    if(!liveBeautyFaceTrack){liveBeautyFaceTrack={...face};return {...face}}
    const prev=liveBeautyFaceTrack,move=Math.hypot(face.cx-prev.cx,face.cy-prev.cy)/Math.max(1,Math.min(w,h)),a=move>.12?.62:.34,ra=.30;
    const nx=prev.cx+clamp(face.cx-prev.cx,-w*.14,w*.14)*a,ny=prev.cy+clamp(face.cy-prev.cy,-h*.14,h*.14)*a;
    const nrx=prev.rx+clamp(face.rx-prev.rx,-prev.rx*.22,prev.rx*.22)*ra,nry=prev.ry+clamp(face.ry-prev.ry,-prev.ry*.22,prev.ry*.22)*ra;
    liveBeautyFaceTrack={cx:clamp(nx,0,w),cy:clamp(ny,0,h),rx:clamp(nrx,w*.14,w*.42),ry:clamp(nry,h*.16,h*.46)};
    return {...liveBeautyFaceTrack}
  }""",
    'Beauty temporal tracker',
)

s = once(
    s,
    "const od=orig.data,sd=softData.data,hd=healData.data,out=lctx.createImageData(tw,th),dd=out.data,face=detectBeautyFaceBox(od,tw,th);if(!face)return null;const effectPeak=Math.max(sm,bl,red,bright,glow);",
    "const od=orig.data,sd=softData.data,hd=healData.data,out=lctx.createImageData(tw,th),dd=out.data,detectedFace=detectBeautyFaceBox(od,tw,th),face=bucket==='live'?stabilizeLiveBeautyFace(detectedFace,tw,th):detectedFace;if(!face)return null;const effectPeak=Math.max(sm,bl,red,bright,glow);",
    'Beauty tracker integration',
)

s = once(
    s,
    "function stopLiveBeautyPreview(){if(liveBeautyTimer){clearTimeout(liveBeautyTimer);liveBeautyTimer=0}liveBeautyBusy=false;const c=$('#liveBeautyCanvas');if(c){c.style.opacity='0';const x=c.getContext('2d');x?.clearRect(0,0,c.width,c.height)}}",
    "function stopLiveBeautyPreview(){if(liveBeautyTimer){clearTimeout(liveBeautyTimer);liveBeautyTimer=0}liveBeautyBusy=false;resetLiveBeautyTracking();const c=$('#liveBeautyCanvas');if(c){c.style.opacity='0';const x=c.getContext('2d');x?.clearRect(0,0,c.width,c.height)}}",
    'Beauty reset',
)

s = once(
    s,
    "if(!state.cameraReady||state.cameraFacing!=='user'||!liveBeautyActive()){if(canvas)canvas.style.opacity='0';return}",
    "if(!state.cameraReady||state.cameraFacing!=='user'||!liveBeautyActive()){if(canvas)canvas.style.opacity='0';resetLiveBeautyTracking();return}",
    'Beauty schedule reset',
)

s = once(
    s,
    "if(state.recording||document.hidden||video.readyState<2||!video.videoWidth){canvas.style.opacity='0';scheduleLiveBeautyPreview(300);return}",
    "if(state.recording||document.hidden||video.readyState<2||!video.videoWidth){canvas.style.opacity='0';resetLiveBeautyTracking();scheduleLiveBeautyPreview(300);return}",
    'Beauty paused reset',
)

flash_anchor = "  function scheduleCameraZoom(value){"
if s.count(flash_anchor) != 1:
    raise SystemExit('flash anchor missing')
flash_code = """  function updateCameraFlashUI(){const btn=$('#cameraFlashBtn');if(!btn)return;const on=state.cameraFlashMode==='on';btn.textContent=on?'Flash On':'Flash Off';btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',String(on))}
  function toggleCameraFlashMode(){state.cameraFlashMode=state.cameraFlashMode==='on'?'off':'on';localStorage.setItem('kira.cameraFlashMode',state.cameraFlashMode);updateCameraFlashUI();if(state.cameraFlashMode==='on'&&state.cameraReady&&state.cameraFacing==='environment'&&!state.cameraCapabilities?.torch)toast('Rear hardware flash is not exposed by this browser. Front camera still uses screen flash.');haptic(12)}
  function ensureCameraScreenFlash(){let el=$('#cameraScreenFlash');if(!el){el=document.createElement('div');el.id='cameraScreenFlash';el.className='camera-screen-flash';el.setAttribute('aria-hidden','true');document.body.appendChild(el)}return el}
  async function prepareCaptureFlash(){
    if(state.cameraFlashMode!=='on')return async()=>{};
    if(state.cameraFacing==='user'){
      const el=ensureCameraScreenFlash();el.classList.add('active');await new Promise(r=>setTimeout(r,140));
      return async()=>{await new Promise(r=>setTimeout(r,35));el.classList.remove('active')}
    }
    const track=state.cameraStream?.getVideoTracks?.()[0],wasOn=state.cameraTorchOn;
    if(track&&state.cameraCapabilities?.torch){
      try{if(!wasOn){await track.applyConstraints({advanced:[{torch:true}]});state.cameraTorchOn=true}await new Promise(r=>setTimeout(r,120));return async()=>{if(!wasOn){await new Promise(r=>setTimeout(r,35));try{await track.applyConstraints({advanced:[{torch:false}]})}catch(e){}state.cameraTorchOn=false;$('#cameraTorchBtn')&&($('#cameraTorchBtn').textContent='Flashlight Off')}}}catch(e){console.warn('Kira capture flash:',e)}
    }
    return async()=>{}
  }
"""
s = s.replace(flash_anchor, flash_code + flash_anchor, 1)

s = once(
    s,
    "$('#cameraImmersiveBtn')&&($('#cameraImmersiveBtn').onclick=toggleCameraImmersive);",
    "$('#cameraImmersiveBtn')&&($('#cameraImmersiveBtn').onclick=toggleCameraImmersive);$('#cameraFlashBtn')&&($('#cameraFlashBtn').onclick=toggleCameraFlashMode);updateCameraFlashUI();",
    'flash binding',
)

s = once(
    s,
    "function updateCameraHUD(){const active=state.selectedRecipeId?state.recipes.find(r=>r.id===state.selectedRecipeId)?.name:state.activeFilter;",
    "function updateCameraHUD(){updateCameraFlashUI();const active=state.selectedRecipeId?state.recipes.find(r=>r.id===state.selectedRecipeId)?.name:state.activeFilter;",
    'flash HUD',
)

pat = r"  async function captureLivePhoto\(\)\{.*?\}\n\n  function exportDimensions"
m = re.search(pat, s, re.S)
if not m:
    raise SystemExit('captureLivePhoto target missing')
new_capture = """  async function captureLivePhoto(){
    if(state.timerRunning)return;
    if(!state.cameraReady){if(navigator.mediaDevices?.getUserMedia){startCamera(true);toast('Starting camera…')}else $('#cameraInput').click();return}
    const video=$('#cameraVideo');if(!video.videoWidth||!video.videoHeight){toast('Camera is still getting ready.');return}
    await runCameraCountdown();if(!state.cameraReady)return;
    const releaseFlash=await prepareCaptureFlash();
    const c=captureCanvasForRatio(video);
    await releaseFlash();
    shotFeedback();
    c.toBlob(blob=>{if(!blob){toast('Could not capture photo.');return}if(state.settings.continuousShoot){enqueueContinuousPhoto(blob,c);return}const file=new File([blob],`kira-${Date.now()}.jpg`,{type:'image/jpeg'});loadFile(file,'camera')},'image/jpeg',.92)
  }

  function exportDimensions"""
s = s[:m.start()] + new_capture + s[m.end():]

bulk_anchor = "  async function saveSelectedBulk(){const items=bulkSelectedItems();if(!items.length){toast('Select at least one photo or video first.');return}const ok=await shareRollItems(items,'Kira selected');if(ok)setBulkSelectMode(false)}"
if s.count(bulk_anchor) != 1:
    raise SystemExit('bulk save anchor missing')
bulk_new = bulk_anchor + """
  async function deleteSelectedBulk(){
    const items=bulkSelectedItems();if(!items.length){toast('Select at least one photo or video first.');return}
    const n=items.length;if(!confirm(`Delete ${n} selected item${n===1?'':'s'} from Kira? This cannot be undone.`))return;
    const ids=new Set(items.map(x=>String(x.id))),db=await openDB();
    try{await new Promise((res,rej)=>{const tx=db.transaction('photos','readwrite'),store=tx.objectStore('photos');items.forEach(x=>store.delete(Number(x.id)));tx.oncomplete=res;tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error)})}finally{db.close()}
    state.rolls=state.rolls.filter(x=>!ids.has(String(x.id)));state.photosQueueIds=state.photosQueueIds.filter(id=>!ids.has(String(id)));state.bulkSelectedIds.clear();state.bulkSelectMode=false;updatePhotosQueueUI();syncRollUi(true);toast(`${n} item${n===1?'':'s'} deleted.`)
  }"""
s = s.replace(bulk_anchor, bulk_new, 1)

s = once(
    s,
    "$('#bulkSelectAllBtn').onclick=selectAllBulk;$('#bulkSaveSelectedBtn').onclick=saveSelectedBulk;$('#bulkCancelBtn').onclick=()=>setBulkSelectMode(false);",
    "$('#bulkSelectAllBtn').onclick=selectAllBulk;$('#bulkSaveSelectedBtn').onclick=saveSelectedBulk;$('#bulkDeleteSelectedBtn').onclick=deleteSelectedBulk;$('#bulkCancelBtn').onclick=()=>setBulkSelectMode(false);",
    'bulk delete binding',
)

s = once(s, "service-worker.js?v=1.0.3", "service-worker.js?v=1.0.4", 'service worker registration')
p.write_text(s)

h = Path('index.html')
t = h.read_text()
if '?v=1.0.3' not in t:
    raise SystemExit('index v1.0.3 refs missing')
t = t.replace('?v=1.0.3', '?v=1.0.4')
t = once(
    t,
    '<button class="mini-pill" id="timerBtn">Timer Off</button>\n            <button class="mini-pill" id="ratioBtn">3:4</button>',
    '<button class="mini-pill" id="timerBtn">Timer Off</button>\n            <button class="mini-pill" id="cameraFlashBtn" aria-pressed="false">Flash Off</button>\n            <button class="mini-pill" id="ratioBtn">3:4</button>',
    'flash button',
)
t = once(
    t,
    '<button class="tiny-btn rose" id="bulkSaveSelectedBtn">Save Selected</button>\n            <button class="tiny-btn" id="bulkCancelBtn">Cancel</button>',
    '<button class="tiny-btn rose" id="bulkSaveSelectedBtn">Save Selected</button>\n            <button class="tiny-btn danger" id="bulkDeleteSelectedBtn">Delete</button>\n            <button class="tiny-btn" id="bulkCancelBtn">Cancel</button>',
    'bulk delete button',
)
old_help = 'Smooth and Acne only render when Kira finds a face. Live Beauty previews on the front camera only to prevent false skin masks on objects and backgrounds; saved photos use the stronger face-targeted pass.'
new_help = 'Smooth and Acne only render when Kira finds a face. Live Beauty uses stabilized front-camera face tracking to reduce jumping and flicker; saved photos use the stronger face-targeted pass.'
t = once(t, old_help, new_help, 'Beauty help copy')
h.write_text(t)

c = Path('style.css')
css = c.read_text()
css += """

/* === v1.0 BEAUTY STABILITY + CAPTURE FLASH + ROLLS BULK DELETE === */
.live-beauty-canvas{will-change:opacity,filter!important;contain:paint}
.camera-top-tools .mini-pill.active{background:rgba(183,110,121,.82);border-color:rgba(255,255,255,.42)}
.camera-screen-flash{position:fixed;inset:0;z-index:9999;background:#fff;opacity:0;pointer-events:none;transition:opacity .055s linear}
.camera-screen-flash.active{opacity:.98}
.tiny-btn.danger{border-color:rgba(184,76,76,.42);background:#fff4f2;color:#a34444;font-weight:800}
@media(max-width:430px){.bulk-select-actions{grid-template-columns:1fr 1fr!important}.camera-top-tools{gap:4px}.camera-top-tools .mini-pill{padding:6px 8px;font-size:8px}}
"""
c.write_text(css)

for name in ('service-worker.js', 'sw.js'):
    q = Path(name)
    u = q.read_text()
    u = once(
        u,
        "const CACHE='kira-v1-0-beauty-mask-safety-20260815';",
        "const CACHE='kira-v1-0-beauty-stability-flash-rolls-20260815';",
        f'{name} cache',
    )
    q.write_text(u)
