from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    return text.replace(old, new, 1)

app_path = Path('app.js')
index_path = Path('index.html')
style_path = Path('style.css')
sw_path = Path('service-worker.js')
sw_alias_path = Path('sw.js')

app = app_path.read_text(encoding='utf-8')
index = index_path.read_text(encoding='utf-8')
style = style_path.read_text(encoding='utf-8')
sw = sw_path.read_text(encoding='utf-8')

# ---------- Rolls: explicit Filtered view ----------
marker = "  function currentRollItems(){"
helper = "  function isKiraFilteredItem(x){return !!x&&!isVideoItem(x)&&x.kind==='edited'&&!!x.filter&&x.filter!=='Original'}\n"
if helper not in app:
    app = replace_once(app, marker, helper + marker, 'insert filtered helper')

old_filter_logic = "(state.activeRollFilter==='favorites'&&x.favorite)||(state.activeRollFilter==='edited'&&x.kind==='edited')||(state.activeRollFilter==='videos'&&isVideoItem(x))"
new_filter_logic = "(state.activeRollFilter==='favorites'&&x.favorite)||(state.activeRollFilter==='filtered'&&isKiraFilteredItem(x))||(state.activeRollFilter==='edited'&&x.kind==='edited')||(state.activeRollFilter==='videos'&&isVideoItem(x))"
app = replace_once(app, old_filter_logic, new_filter_logic, 'add filtered Rolls logic')

old_tabs = '''            <button class="chip active" data-roll-filter="all">All</button>\n            <button class="chip" data-roll-filter="favorites">Favorites</button>\n            <button class="chip" data-roll-filter="edited">Edited</button>'''
new_tabs = '''            <button class="chip active" data-roll-filter="all">All</button>\n            <button class="chip" data-roll-filter="favorites">Favorites</button>\n            <button class="chip" data-roll-filter="filtered">Filtered</button>\n            <button class="chip" data-roll-filter="edited">Edited</button>'''
index = replace_once(index, old_tabs, new_tabs, 'add Filtered tab')

# Best Quality must save only the processed Kira result. Existing originals remain untouched.
old_system_original = "    if(state.settings.keepOriginal){try{await storeRollPhoto(file,{kind:'original',mediaType:'photo',name,filter:'Original',favorite:false,rollId:pending.rollId,systemCapture:true})}catch(err){console.warn('Kira system original:',err)}}\n"
app = replace_once(app, old_system_original, '', 'remove Best Quality original save')

old_setting = '<label class="setting-row"><span>Keep originals in Kira Rolls</span><input type="checkbox" id="settingKeepOriginal" /></label>'
new_setting = '<label class="setting-row"><span>Keep originals when importing to Develop</span><input type="checkbox" id="settingKeepOriginal" /></label>'
index = replace_once(index, old_setting, new_setting, 'clarify keep-original setting')

old_continuous_label = '<label class="setting-row"><span>Continuous shooting — stay on Camera</span><input type="checkbox" id="settingContinuousShoot" checked /></label>'
new_continuous_label = '<label class="setting-row"><span>Continuous shooting — stay ready for another shot</span><input type="checkbox" id="settingContinuousShoot" checked /></label>'
index = replace_once(index, old_continuous_label, new_continuous_label, 'clarify continuous setting')

old_notice = 'Kira saves each shot immediately to Kira Rolls and keeps the camera open. iPhone does not allow a web app to silently insert files into Photos, so queued shots can be sent to Photos together with one tap on the Photos button in Camera.'
new_notice = 'Kira saves each shot to Kira Rolls. Best Quality stores only the Kira-processed photo and never creates a second system-camera Original. Existing originals are never deleted automatically. With Continuous shooting on, Kira stays ready for the next Best Quality shot; iPhone requires one tap for each new system-camera capture. Queued shots can be sent to Photos together from Camera.'
index = replace_once(index, old_notice, new_notice, 'update saving notice')

# ---------- Best Quality repeated-shot session ----------
old_state_tail = "pendingSystemCapture:null,systemCaptureFocusTimer:null,developInitialized:false,cameraImmersive:false"
new_state_tail = "pendingSystemCapture:null,systemCaptureFocusTimer:null,bestQualitySessionActive:false,bestQualitySessionShots:0,developInitialized:false,cameraImmersive:false"
app = replace_once(app, old_state_tail, new_state_tail, 'add Best Quality session state')

old_set_capture = "    updatePhotoCaptureSourceUI();\n    if(state.captureMode==='video')toast('Video mode: smooth recording uses the original camera color. Your selected look stays as a live preview.');"
new_set_capture = "    if(state.captureMode==='video'&&state.bestQualitySessionActive)finishBestQualitySession(true);\n    updatePhotoCaptureSourceUI();\n    if(state.captureMode==='video')toast('Video mode: smooth recording uses the original camera color. Your selected look stays as a live preview.');"
app = replace_once(app, old_set_capture, new_set_capture, 'close Best Quality session in video mode')

old_source_ui_tail = "    if(timer){timer.disabled=photo&&system;timer.title=photo&&system?'Best Quality uses the iPhone camera’s timer controls.':'Kira timer'}\n  }"
new_source_ui_tail = "    if(timer){timer.disabled=photo&&system;timer.title=photo&&system?'Best Quality uses the iPhone camera’s timer controls.':'Kira timer'}\n    updateBestQualitySessionUI()\n  }"
app = replace_once(app, old_source_ui_tail, new_source_ui_tail, 'sync Best Quality session UI')

old_set_source = "  function setPhotoCaptureSource(source,quiet=false){\n    state.settings.photoCaptureSource=source==='live'?'live':'system';saveSettings();updatePhotoCaptureSourceUI();"
new_set_source = "  function setPhotoCaptureSource(source,quiet=false){\n    const next=source==='live'?'live':'system';\n    if(next==='live'&&state.bestQualitySessionActive)finishBestQualitySession(true);\n    state.settings.photoCaptureSource=next;saveSettings();updatePhotoCaptureSourceUI();"
app = replace_once(app, old_set_source, new_set_source, 'reset session when switching to Live Filter')

old_toggle_resume = "  function togglePhotoCaptureSource(){setPhotoCaptureSource(currentPhotoCaptureSource()==='system'?'live':'system')}\n  function resumeCameraAfterSystemCapture(){if(document.hidden||!$('#screen-camera')?.classList.contains('active'))return;setTimeout(()=>bootCameraSafely(),120)}"
new_toggle_resume = """  function togglePhotoCaptureSource(){setPhotoCaptureSource(currentPhotoCaptureSource()==='system'?'live':'system')}
  function updateBestQualitySessionUI(){
    const active=!!state.bestQualitySessionActive&&state.captureMode==='photo'&&currentPhotoCaptureSource()==='system',bar=$('#bestQualitySessionBar'),count=$('#bestQualitySessionCount'),again=$('#bestQualityShootAgainBtn'),shutter=$('#shutterBtn');
    if(bar)bar.classList.toggle('hidden',!active);
    if(count)count.textContent=state.bestQualitySessionShots?`${state.bestQualitySessionShots} Kira photo${state.bestQualitySessionShots===1?'':'s'} captured`:'Best Quality session';
    if(again){again.disabled=!!state.pendingSystemCapture||state.photoProcessQueue.length>=8;again.textContent=state.pendingSystemCapture?'Camera open…':'Shoot Again'}
    if(shutter&&state.captureMode==='photo')shutter.setAttribute('aria-label',active&&state.bestQualitySessionShots?'Shoot again with Best Quality':'Take photo')
  }
  function finishBestQualitySession(quiet=false){
    state.bestQualitySessionActive=false;state.bestQualitySessionShots=0;updateBestQualitySessionUI();
    if(!quiet)toast('Best Quality session finished.');
    if(!document.hidden&&$('#screen-camera')?.classList.contains('active'))setTimeout(()=>bootCameraSafely(),80)
  }
  function resumeCameraAfterSystemCapture(){if(document.hidden||!$('#screen-camera')?.classList.contains('active'))return;updateBestQualitySessionUI();setTimeout(()=>bootCameraSafely(),120)}"""
app = replace_once(app, old_toggle_resume, new_toggle_resume, 'add Best Quality session helpers')

old_begin = """  function beginSystemCameraCapture(){
    if(state.captureMode!=='photo'||state.recording||state.timerRunning)return;
    const input=$('#cameraInput');if(!input)return;
    if(state.photoProcessQueue.length>=8){toast('Kira is still saving earlier shots — give it a moment.');return}
    state.pendingSystemCapture={snapshot:editSnapshot(),filter:state.activeFilter,rollId:state.activeNamedRollId,ratio:state.cameraRatio,facing:state.cameraFacing,stamp:Date.now()};
    input.value='';input.setAttribute('capture',state.cameraFacing==='user'?'user':'environment');
    stopCamera();toast('Opening iPhone camera…');input.click()
  }"""
new_begin = """  function beginSystemCameraCapture(){
    if(state.captureMode!=='photo'||state.recording||state.timerRunning||state.pendingSystemCapture)return;
    const input=$('#cameraInput');if(!input)return;
    if(state.photoProcessQueue.length>=8){toast('Kira is still saving earlier shots — give it a moment.');updateBestQualitySessionUI();return}
    state.bestQualitySessionActive=true;
    state.pendingSystemCapture={snapshot:editSnapshot(),filter:state.activeFilter,rollId:state.activeNamedRollId,ratio:state.cameraRatio,facing:state.cameraFacing,stamp:Date.now()};
    updateBestQualitySessionUI();input.value='';input.setAttribute('capture',state.cameraFacing==='user'?'user':'environment');
    stopCamera();toast(state.bestQualitySessionShots?'Opening camera for another shot…':'Opening iPhone camera…');input.click()
  }"""
app = replace_once(app, old_begin, new_begin, 'make Best Quality repeatable')

old_handle_success = """    const ok=enqueueContinuousPhoto(file,null,{stamp:pending.stamp,filter:pending.filter,snapshot:pending.snapshot,rollId:pending.rollId,needsCrop:true,ratio:pending.ratio,facing:pending.facing,mirror:false,photoQuality:'system',systemCapture:true});
    if(ok){shotFeedback();toast(`${pending.filter} • adding Kira look…`)}
    resumeCameraAfterSystemCapture()"""
new_handle_success = """    const ok=enqueueContinuousPhoto(file,null,{stamp:pending.stamp,filter:pending.filter,snapshot:pending.snapshot,rollId:pending.rollId,needsCrop:true,ratio:pending.ratio,facing:pending.facing,mirror:false,photoQuality:'system',systemCapture:true});
    if(ok){
      shotFeedback();state.bestQualitySessionShots++;
      if(!state.settings.continuousShoot)state.bestQualitySessionActive=false;
      updateBestQualitySessionUI();
      toast(state.settings.continuousShoot?`${pending.filter} queued • tap Shoot Again for the next photo`:`${pending.filter} • adding Kira look…`)
    }
    resumeCameraAfterSystemCapture()"""
app = replace_once(app, old_handle_success, new_handle_success, 'arm Shoot Again after return')

old_queue_finally = "}finally{state.photoProcessing=false;$('#shutterBtn')?.classList.remove('saving')}}"
new_queue_finally = "}finally{state.photoProcessing=false;$('#shutterBtn')?.classList.remove('saving');updateBestQualitySessionUI()}}"
app = replace_once(app, old_queue_finally, new_queue_finally, 'refresh session after queue drains')

# Reset the session when leaving Camera so it cannot leak into Rolls/Develop.
old_switch_start = "function switchScreen(name){if(state.recording&&name!=='camera'){toast('Stop recording before leaving Camera.');return}if(name!=='camera'&&state.cameraImmersive)setCameraImmersive(false);"
new_switch_start = "function switchScreen(name){if(state.recording&&name!=='camera'){toast('Stop recording before leaving Camera.');return}if(name!=='camera'&&state.bestQualitySessionActive){state.bestQualitySessionActive=false;state.bestQualitySessionShots=0;updateBestQualitySessionUI()}if(name!=='camera'&&state.cameraImmersive)setCameraImmersive(false);"
app = replace_once(app, old_switch_start, new_switch_start, 'reset session when leaving Camera')

# Bind explicit Shoot Again / Done controls.
old_bind_source = "$('#cameraImmersiveBtn')&&($('#cameraImmersiveBtn').onclick=toggleCameraImmersive);$('#cameraSourceBtn')&&($('#cameraSourceBtn').onclick=togglePhotoCaptureSource);$('#cameraFlashBtn')"
new_bind_source = "$('#cameraImmersiveBtn')&&($('#cameraImmersiveBtn').onclick=toggleCameraImmersive);$('#cameraSourceBtn')&&($('#cameraSourceBtn').onclick=togglePhotoCaptureSource);$('#bestQualityShootAgainBtn')&&($('#bestQualityShootAgainBtn').onclick=beginSystemCameraCapture);$('#bestQualityDoneBtn')&&($('#bestQualityDoneBtn').onclick=()=>finishBestQualitySession());$('#cameraFlashBtn')"
app = replace_once(app, old_bind_source, new_bind_source, 'bind session buttons')

# Add visible session controls underneath the normal shutter row.
old_camera_actions = '''        <div class="camera-actions clean-camera-actions">\n          <button class="round-label-btn" id="galleryBtn"><span>▧</span>Gallery</button>\n          <button class="shutter" id="shutterBtn" aria-label="Take photo"></button>\n          <button class="round-label-btn" id="flipCameraBtn"><span>↻</span>Flip</button>\n          <div class="capture-mode-switch" id="captureModeSwitch">\n            <button class="active" data-capture-mode="photo">Photo</button>\n            <button data-capture-mode="video">Video</button>\n          </div>\n        </div>'''
new_camera_actions = old_camera_actions + '''\n        <div class="best-quality-session hidden" id="bestQualitySessionBar" aria-live="polite">\n          <div><strong id="bestQualitySessionCount">Best Quality session</strong><small>iPhone requires one tap for each new system-camera photo.</small></div>\n          <button class="secondary-btn compact-btn" id="bestQualityShootAgainBtn">Shoot Again</button>\n          <button class="text-btn" id="bestQualityDoneBtn">Done</button>\n        </div>'''
index = replace_once(index, old_camera_actions, new_camera_actions, 'add Best Quality session bar')

# Session UI styling; no fixed overlay, so it stays inside iPhone safe layout.
css_patch = """

/* === v1.0 FILTERED ROLLS + CONTINUOUS BEST QUALITY === */
.best-quality-session{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:center;margin:0 4px 10px;padding:10px 12px;border:1px solid rgba(183,110,121,.24);border-radius:18px;background:rgba(255,250,246,.94);box-shadow:0 8px 20px rgba(82,51,54,.07)}
.best-quality-session>div{min-width:0}.best-quality-session strong{display:block;color:var(--rose-dark);font-size:11px}.best-quality-session small{display:block;color:#8f7072;font-size:9px;line-height:1.35;margin-top:2px}.best-quality-session .compact-btn{padding:9px 11px;white-space:nowrap}.best-quality-session .text-btn{padding:8px 4px;font-size:11px}.best-quality-session button:disabled{opacity:.5;pointer-events:none}
@media(max-width:390px){.best-quality-session{grid-template-columns:1fr auto}.best-quality-session>div{grid-column:1/-1}.best-quality-session .text-btn{justify-self:end}}
"""
if '/* === v1.0 FILTERED ROLLS + CONTINUOUS BEST QUALITY === */' not in style:
    style += css_patch

# Internal PWA asset/cache bump while the public release remains v1.0.
if '1.0.9' not in index or '1.0.9' not in app:
    raise SystemExit('expected v1.0.9 asset references not found')
index = index.replace('1.0.9', '1.0.10')
app = app.replace('1.0.9', '1.0.10')
old_cache = "const CACHE='kira-v1-0-system-camera-20260817';"
new_cache = "const CACHE='kira-v1-0-filtered-continuous-best-quality-20260817';"
sw = replace_once(sw, old_cache, new_cache, 'bump service-worker cache')

app_path.write_text(app, encoding='utf-8')
index_path.write_text(index, encoding='utf-8')
style_path.write_text(style, encoding='utf-8')
sw_path.write_text(sw, encoding='utf-8')
sw_alias_path.write_text(sw, encoding='utf-8')
print('Kira filtered Rolls + continuous Best Quality patch applied')
