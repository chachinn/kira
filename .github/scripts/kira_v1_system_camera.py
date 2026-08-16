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

def one(text, old, new, label):
    n=text.count(old)
    if n!=1:
        raise SystemExit(f'{label}: expected exactly 1 match, got {n}')
    return text.replace(old,new,1)

# 1) Best Quality system-camera handoff is the default photo source.
app=one(
    app,
    "const defaultSettings={grid:false,haptics:true,rememberFilter:true,keepOriginal:false,autoSave:false,autoPhotos:true,continuousShoot:true,videoAudio:true,videoQuality:'smooth',photoQuality:'high',defaultCaptureMode:'photo',theme:'old-rose',accent:'#b76e79',density:'cozy'};",
    "const defaultSettings={grid:false,haptics:true,rememberFilter:true,keepOriginal:false,autoSave:false,autoPhotos:true,continuousShoot:true,videoAudio:true,videoQuality:'smooth',photoQuality:'high',photoCaptureSource:'system',defaultCaptureMode:'photo',theme:'old-rose',accent:'#b76e79',density:'cozy'};",
    'default system photo source'
)

old_state="cameraFlashMode:localStorage.getItem('kira.cameraFlashMode')==='on'?'on':'off',developInitialized:false,cameraImmersive:false"
new_state="cameraFlashMode:localStorage.getItem('kira.cameraFlashMode')==='on'?'on':'off',pendingSystemCapture:null,systemCaptureFocusTimer:null,developInitialized:false,cameraImmersive:false"
app=one(app,old_state,new_state,'system capture state')

# 2) Camera UI: one compact source toggle beside Photos / Controls.
old_heading='''            <div class="camera-heading-actions">\n              <button class="photos-queue-btn hidden" id="photosQueueBtn" title="Save captured photos to iPhone Photos">Photos <b id="photosQueueCount">0</b></button>\n              <button class="soft-icon-btn" id="cameraControlsBtn" aria-expanded="false">Controls⌄</button>\n            </div>'''
new_heading='''            <div class="camera-heading-actions">\n              <button class="photos-queue-btn hidden" id="photosQueueBtn" title="Save captured photos to iPhone Photos">Photos <b id="photosQueueCount">0</b></button>\n              <button class="soft-icon-btn camera-source-btn active" id="cameraSourceBtn" aria-pressed="true" title="Best Quality uses the iPhone system camera, then Kira adds your selected look.">Best Quality</button>\n              <button class="soft-icon-btn" id="cameraControlsBtn" aria-expanded="false">Controls⌄</button>\n            </div>'''
idx=one(idx,old_heading,new_heading,'camera source toggle')

# 3) Settings: user can choose Best Quality vs Live Filter.
photo_quality_block='''            <label class="setting-row setting-select-row"><span>Photo quality</span>\n              <select id="settingPhotoQuality" class="mini-select">\n                <option value="standard">Standard • faster</option>\n                <option value="high">High • recommended</option>\n                <option value="max">Max detail • slower</option>\n              </select>\n            </label>'''
source_and_quality='''            <label class="setting-row setting-select-row"><span>Photo capture</span>\n              <select id="settingPhotoCaptureSource" class="mini-select">\n                <option value="system">Best Quality • iPhone camera</option>\n                <option value="live">Live Filter • inside Kira</option>\n              </select>\n            </label>\n            <label class="setting-row setting-select-row"><span>Photo quality</span>\n              <select id="settingPhotoQuality" class="mini-select">\n                <option value="standard">Standard • faster</option>\n                <option value="high">High • recommended</option>\n                <option value="max">Max detail • slower</option>\n              </select>\n            </label>'''
idx=one(idx,photo_quality_block,source_and_quality,'photo capture setting')
idx=one(
    idx,
    '            <div class="notice">Photo quality affects still captures only: High is recommended, while Max keeps more detail but takes longer to process and uses more local storage. Video quality stays separate so recording remains responsive.</div>',
    '            <div class="notice">Best Quality opens the iPhone/system camera for the actual shot, then Kira automatically applies the look you selected and saves the result to Rolls. Live Filter keeps shooting inside Kira so you can see the look while composing. Kira cannot place its live filter inside the iPhone system camera. Standard / High / Max apply to Live Filter captures; Best Quality keeps a larger system-camera still for processing.</div>',
    'camera mode explanation'
)

# 4) Source mode helpers + system camera handoff.
old_capture_or_record="async function captureOrRecord(){if(state.captureMode==='video'){state.recording?stopVideoRecording():await startVideoRecording();return}captureLivePhoto()}"
new_capture_or_record=r'''function currentPhotoCaptureSource(){return state.settings.photoCaptureSource==='live'?'live':'system'}
  function updatePhotoCaptureSourceUI(){
    const source=currentPhotoCaptureSource(),system=source==='system',photo=state.captureMode==='photo',btn=$('#cameraSourceBtn');
    if(btn){btn.hidden=!photo;btn.textContent=system?'Best Quality':'Live Filter';btn.classList.toggle('active',system);btn.setAttribute('aria-pressed',String(system));btn.title=system?'Best Quality opens the iPhone system camera; Kira adds this look after capture.':'Live Filter shoots inside Kira with this look visible before capture.'}
    const sel=$('#settingPhotoCaptureSource');if(sel&&sel.value!==source)sel.value=source;
    const flash=$('#cameraFlashBtn'),timer=$('#timerBtn');
    if(flash){flash.disabled=photo&&system;flash.title=photo&&system?'Best Quality uses the iPhone camera’s flash controls.':'Kira capture flash'}
    if(timer){timer.disabled=photo&&system;timer.title=photo&&system?'Best Quality uses the iPhone camera’s timer controls.':'Kira timer'}
  }
  function setPhotoCaptureSource(source,quiet=false){
    state.settings.photoCaptureSource=source==='live'?'live':'system';saveSettings();updatePhotoCaptureSourceUI();
    if(!quiet)toast(state.settings.photoCaptureSource==='system'?'Best Quality: iPhone camera shoots, Kira adds your look after.':'Live Filter: shoot inside Kira with the look visible.');
    haptic(12)
  }
  function togglePhotoCaptureSource(){setPhotoCaptureSource(currentPhotoCaptureSource()==='system'?'live':'system')}
  function resumeCameraAfterSystemCapture(){if(document.hidden||!$('#screen-camera')?.classList.contains('active'))return;setTimeout(()=>bootCameraSafely(),120)}
  function scheduleSystemCaptureCancelCheck(){
    if(!state.pendingSystemCapture)return;clearTimeout(state.systemCaptureFocusTimer);
    state.systemCaptureFocusTimer=setTimeout(()=>{const input=$('#cameraInput');if(state.pendingSystemCapture&&!input?.files?.length){state.pendingSystemCapture=null;resumeCameraAfterSystemCapture()}},900)
  }
  function beginSystemCameraCapture(){
    if(state.captureMode!=='photo'||state.recording||state.timerRunning)return;
    const input=$('#cameraInput');if(!input)return;
    if(state.photoProcessQueue.length>=8){toast('Kira is still saving earlier shots — give it a moment.');return}
    state.pendingSystemCapture={snapshot:editSnapshot(),filter:state.activeFilter,rollId:state.activeNamedRollId,ratio:state.cameraRatio,facing:state.cameraFacing,stamp:Date.now()};
    input.value='';input.setAttribute('capture',state.cameraFacing==='user'?'user':'environment');
    stopCamera();toast('Opening iPhone camera…');input.click()
  }
  async function handleCameraInput(file){
    const pending=state.pendingSystemCapture;
    if(!pending){if(file)loadFile(file,'camera');return}
    state.pendingSystemCapture=null;clearTimeout(state.systemCaptureFocusTimer);state.systemCaptureFocusTimer=null;
    if(!file){resumeCameraAfterSystemCapture();return}
    if(!file.type?.startsWith('image/')){toast('Kira needs a photo from the camera.');resumeCameraAfterSystemCapture();return}
    const name=`kira-system-${pending.stamp}`;
    if(state.settings.keepOriginal){try{await storeRollPhoto(file,{kind:'original',mediaType:'photo',name,filter:'Original',favorite:false,rollId:pending.rollId,systemCapture:true})}catch(err){console.warn('Kira system original:',err)}}
    const ok=enqueueContinuousPhoto(file,null,{stamp:pending.stamp,filter:pending.filter,snapshot:pending.snapshot,rollId:pending.rollId,needsCrop:true,ratio:pending.ratio,facing:pending.facing,mirror:false,photoQuality:'system',systemCapture:true});
    if(ok){shotFeedback();toast(`${pending.filter} • adding Kira look…`)}
    resumeCameraAfterSystemCapture()
  }
  async function captureOrRecord(){if(state.captureMode==='video'){state.recording?stopVideoRecording():await startVideoRecording();return}if(currentPhotoCaptureSource()==='system'){beginSystemCameraCapture();return}captureLivePhoto()}'''
app=one(app,old_capture_or_record,new_capture_or_record,'system capture handoff')

# 5) Capture-mode UI must expose source only for photos and re-enable Kira controls for video/live shooting.
old_set_mode="if(shutter){shutter.classList.toggle('video-mode',state.captureMode==='video');shutter.setAttribute('aria-label',state.captureMode==='video'?'Start video recording':'Take photo')}\n    if(state.captureMode==='video')toast('Video mode: smooth recording uses the original camera color. Your selected look stays as a live preview.');"
new_set_mode="if(shutter){shutter.classList.toggle('video-mode',state.captureMode==='video');shutter.setAttribute('aria-label',state.captureMode==='video'?'Start video recording':'Take photo')}\n    updatePhotoCaptureSourceUI();\n    if(state.captureMode==='video')toast('Video mode: smooth recording uses the original camera color. Your selected look stays as a live preview.');"
app=one(app,old_set_mode,new_set_mode,'capture mode source UI sync')

# 6) Processing queue can freeze the handoff's exact look/roll/ratio/facing and must not double-mirror system selfies.
old_enqueue="function enqueueContinuousPhoto(blob,c,meta={}){if(state.photoProcessQueue.length>=8){toast('Kira is still saving earlier shots — give it a moment.');return false}state.captureSequence++;state.photoProcessQueue.push({blob,width:c?.width||0,height:c?.height||0,stamp:Date.now(),filter:state.activeFilter,snapshot:editSnapshot(),rollId:state.activeNamedRollId,seq:state.captureSequence,needsCrop:!!meta.needsCrop,ratio:state.cameraRatio,facing:state.cameraFacing,photoQuality:state.settings.photoQuality||'high'});runPhotoProcessQueue();return true}"
new_enqueue="function enqueueContinuousPhoto(blob,c,meta={}){if(state.photoProcessQueue.length>=8){toast('Kira is still saving earlier shots — give it a moment.');return false}state.captureSequence++;state.photoProcessQueue.push({blob,width:c?.width||0,height:c?.height||0,stamp:meta.stamp||Date.now(),filter:meta.filter||state.activeFilter,snapshot:JSON.parse(JSON.stringify(meta.snapshot||editSnapshot())),rollId:meta.rollId||state.activeNamedRollId,seq:state.captureSequence,needsCrop:!!meta.needsCrop,ratio:meta.ratio||state.cameraRatio,facing:meta.facing||state.cameraFacing,mirror:Object.prototype.hasOwnProperty.call(meta,'mirror')?!!meta.mirror:undefined,photoQuality:meta.photoQuality||state.settings.photoQuality||'high',systemCapture:!!meta.systemCapture});runPhotoProcessQueue();return true}"
app=one(app,old_enqueue,new_enqueue,'frozen queue metadata')

old_proc="const profile=photoQualityProfile(task.photoQuality),input=task.needsCrop?(cropped=cropCameraSourceToRatio(source,profile.maxSide,task.facing==='user',task.ratio)):source,sw=input.width||input.naturalWidth||task.width"
new_proc="const profile=photoQualityProfile(task.photoQuality),mirror=task.mirror===undefined?task.facing==='user':!!task.mirror,input=task.needsCrop?(cropped=cropCameraSourceToRatio(source,profile.maxSide,mirror,task.ratio)):source,sw=input.width||input.naturalWidth||task.width"
app=one(app,old_proc,new_proc,'system selfie no double mirror')

old_store="storeRollPhoto(finalBlob,{kind:'edited',mediaType:'photo',name,filter:task.filter,favorite:false,snapshot:task.snapshot,rollId:task.rollId,cameraCapture:true})"
new_store="storeRollPhoto(finalBlob,{kind:'edited',mediaType:'photo',name,filter:task.filter,favorite:false,snapshot:task.snapshot,rollId:task.rollId,cameraCapture:true,systemCapture:!!task.systemCapture})"
app=one(app,old_store,new_store,'system capture metadata')

old_profile="function photoQualityProfile(mode=state.settings.photoQuality||'high'){\n    if(mode==='max')return {maxSide:3840,jpeg:.97,label:'Max'};"
new_profile="function photoQualityProfile(mode=state.settings.photoQuality||'high'){\n    if(mode==='system')return {maxSide:4096,jpeg:.98,label:'Best Quality'};\n    if(mode==='max')return {maxSide:3840,jpeg:.97,label:'Max'};"
app=one(app,old_profile,new_profile,'system photo quality profile')

# 7) Bind UI + file return. Preserve user activation by opening the system camera directly from shutter tap.
old_bind_piece="$('#galleryBtn').onclick=()=>$('#galleryInput').click();$('#shutterBtn').onclick=captureOrRecord;$$('[data-capture-mode]').forEach(b=>b.onclick=()=>setCaptureMode(b.dataset.captureMode));$('#flipCameraBtn').onclick=flipCamera;$('#startCameraBtn').onclick=()=>{if(!navigator.mediaDevices?.getUserMedia){$('#cameraInput').click();return}startCamera(true)};\n    $('#galleryInput').onchange=e=>loadFile(e.target.files?.[0],'gallery');$('#cameraInput').onchange=e=>loadFile(e.target.files?.[0],'camera');"
new_bind_piece="$('#galleryBtn').onclick=()=>$('#galleryInput').click();$('#shutterBtn').onclick=captureOrRecord;$$('[data-capture-mode]').forEach(b=>b.onclick=()=>setCaptureMode(b.dataset.captureMode));$('#cameraSourceBtn')&&($('#cameraSourceBtn').onclick=togglePhotoCaptureSource);$('#flipCameraBtn').onclick=flipCamera;$('#startCameraBtn').onclick=()=>{if(!navigator.mediaDevices?.getUserMedia){beginSystemCameraCapture();return}startCamera(true)};\n    $('#galleryInput').onchange=e=>loadFile(e.target.files?.[0],'gallery');$('#cameraInput').onchange=e=>{const input=e.currentTarget,file=input.files?.[0];handleCameraInput(file).finally(()=>{input.value=''})};window.addEventListener('focus',scheduleSystemCaptureCancelCheck,{passive:true});"
app=one(app,old_bind_piece,new_bind_piece,'system camera input binding')

# 8) Settings binding + UI sync.
old_settings="const pq=$('#settingPhotoQuality');if(pq){pq.value=state.settings.photoQuality||'high';pq.onchange=()=>{state.settings.photoQuality=pq.value;saveSettings();toast(pq.value==='max'?'Max photo detail selected — saves may take a little longer.':pq.value==='standard'?'Standard photo quality selected.':'High photo quality selected.')}}const vq=$('#settingVideoQuality');"
new_settings="const pcs=$('#settingPhotoCaptureSource');if(pcs){pcs.value=currentPhotoCaptureSource();pcs.onchange=()=>setPhotoCaptureSource(pcs.value)}const pq=$('#settingPhotoQuality');if(pq){pq.value=state.settings.photoQuality||'high';pq.onchange=()=>{state.settings.photoQuality=pq.value;saveSettings();toast(pq.value==='max'?'Max photo detail selected — saves may take a little longer.':pq.value==='standard'?'Standard photo quality selected.':'High photo quality selected.')}}const vq=$('#settingVideoQuality');"
app=one(app,old_settings,new_settings,'system source settings binding')

old_apply="function applySettings(){document.body.classList.toggle('grid-on',state.settings.grid);applyAppearance();$('#settingGrid').checked=state.settings.grid;$('#recipeCount')&&($('#recipeCount').textContent=state.recipes.length);$('#namedRollCount')&&($('#namedRollCount').textContent=state.namedRolls.length);applyCameraRatio();$('#timerBtn')&&($('#timerBtn').textContent=state.cameraTimer?`${state.cameraTimer}s`:'Timer Off');renderRollSelectors()}"
new_apply="function applySettings(){document.body.classList.toggle('grid-on',state.settings.grid);applyAppearance();$('#settingGrid').checked=state.settings.grid;$('#recipeCount')&&($('#recipeCount').textContent=state.recipes.length);$('#namedRollCount')&&($('#namedRollCount').textContent=state.namedRolls.length);applyCameraRatio();$('#timerBtn')&&($('#timerBtn').textContent=state.cameraTimer?`${state.cameraTimer}s`:'Timer Off');renderRollSelectors();updatePhotoCaptureSourceUI()}"
app=one(app,old_apply,new_apply,'apply source settings')

# 9) Visibility return from iPhone camera: let the file input resolve before restarting getUserMedia.
old_visibility="document.addEventListener('visibilitychange',()=>{if(document.hidden){if(state.recording)stopVideoRecording();else stopCamera()}else if($('#screen-camera')?.classList.contains('active')){updateCameraViewport();bootCameraSafely()}});"
new_visibility="document.addEventListener('visibilitychange',()=>{if(document.hidden){if(state.recording)stopVideoRecording();else stopCamera()}else if($('#screen-camera')?.classList.contains('active')){updateCameraViewport();if(state.pendingSystemCapture)scheduleSystemCaptureCancelCheck();else bootCameraSafely()}});"
app=one(app,old_visibility,new_visibility,'system camera return visibility')

# 10) What’s New / Help reflect hybrid capture without changing public v1.0.
idx=one(idx,'      <h4>Stronger looks — every filter has more personality.</h4>','      <h4>Best Quality camera mode — iPhone capture, Kira finish.</h4>','whats new heading')
old_info='''        <div><b>✦</b><span>100% strength is now intentionally bolder. Kira, Film, Vintage, CCD, Y2K, Dream, Japan and the other collections receive category-calibrated identity boosts instead of sharing one timid intensity curve.</span></div>\n        <div><b>🎞</b><span>The 0–100 strength slider still works normally: Kira starts at a balanced 50%, 0 stays neutral, and 100 shows the full intended character of the selected look.</span></div>\n        <div><b>♡</b><span>Kira Original and Beauty Only remain neutral by design. Beauty processing itself is not artificially boosted by this color/filter change.</span></div>\n        <div><b>✓</b><span>Kira is now labeled v1.0 for its first public release line. Filter names, Favorites, recipes, Rolls, Camera, Beauty, and saved-media references remain compatible.</span></div>'''
new_info='''        <div><b>📷</b><span>Best Quality is now the default photo path. Kira hands the actual shot to the iPhone/system camera, then automatically applies the look and strength you selected when the photo returns.</span></div>\n        <div><b>🎞</b><span>Live Filter is still one tap away when you want to compose and shoot entirely inside Kira with the selected look visible before capture.</span></div>\n        <div><b>♡</b><span>Best Quality preserves the selected Beauty, frame, Date Cam, Roll, and other Kira settings for post-capture processing. System-camera selfies are not mirrored a second time.</span></div>\n        <div><b>✓</b><span>Kira remains v1.0. All 233 looks, 50% default strength, Mono, Flash, Rolls, Media Details browsing, and the existing high-quality Live Filter path stay intact.</span></div>'''
idx=one(idx,old_info,new_info,'whats new hybrid details')
idx=one(
    idx,
    '<div><strong>Camera permission</strong><p>Kira only requests camera access after you tap Start Camera unless iPhone already reports permission as granted.</p></div>',
    '<div><strong>Best Quality vs Live Filter</strong><p>Best Quality uses the iPhone/system camera for the shot and applies your selected Kira look afterward. Live Filter stays inside Kira so you can preview the look while composing.</p></div>',
    'help hybrid camera'
)

# 11) Compact source button styles; disabled Kira flash/timer communicate system ownership.
css += r'''

/* === v1.0 BEST QUALITY SYSTEM CAMERA === */
.camera-heading-actions{display:flex;align-items:center;justify-content:flex-end;gap:5px;min-width:0}
body.camera-mode #cameraSourceBtn{position:static!important;flex:none!important;min-height:25px!important;max-width:82px;padding:5px 9px!important;font-size:7.5px!important;line-height:1!important;border-radius:999px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
body.camera-mode #cameraSourceBtn.active{background:var(--rose)!important;color:#fff!important;border-color:var(--rose)!important}
.camera-top-tools .mini-pill:disabled{opacity:.45;pointer-events:none}
@media(max-width:390px){body.camera-mode #cameraSourceBtn{max-width:70px;padding:5px 7px!important;font-size:7px!important}.camera-heading-actions{gap:4px}}
'''

# 12) PWA cache/version bump. Public product version remains v1.0.
for old,new in [('manifest.json?v=1.0.8','manifest.json?v=1.0.9'),('style.css?v=1.0.8','style.css?v=1.0.9'),('app.js?v=1.0.8','app.js?v=1.0.9')]:
    idx=one(idx,old,new,f'index bump {old}')
app=one(app,'service-worker.js?v=1.0.8','service-worker.js?v=1.0.9','SW registration bump')
sw,n=re.subn(r"const CACHE='[^']+';","const CACHE='kira-v1-0-system-camera-20260817';",sw,count=1)
if n!=1: raise SystemExit('service worker cache bump failed')

APP.write_text(app)
IDX.write_text(idx)
CSS.write_text(css)
SW.write_text(sw)
SW2.write_text(sw)
print('Applied Kira v1.0 Best Quality system-camera hybrid patch')
