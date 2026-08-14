from pathlib import Path


def read(path):
    return Path(path).read_text(encoding='utf-8')


def write(path, text):
    Path(path).write_text(text, encoding='utf-8')


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'Missing patch anchor: {label}')
    return text.replace(old, new, 1)


# ---------------- app.js ----------------
app = read('app.js')

app = replace_once(
    app,
    "cameraZoomTimer:null,developInitialized:false,cameraImmersive:false,livePhotoEnabled:localStorage.getItem('kira.livePhoto')==='1',liveCaptureBusy:false\n  };",
    "cameraZoomTimer:null,developInitialized:false,cameraImmersive:false\n  };",
    'remove Live camera state'
)

app = replace_once(
    app,
    "if(state.liveCaptureBusy&&name!=='camera'){toast('Live Photo is finishing…');return}if(name!=='camera'&&state.cameraImmersive)",
    "if(name!=='camera'&&state.cameraImmersive)",
    'remove Live screen guard'
)

app = replace_once(
    app,
    "    syncLivePhotoButton();\n    if(state.captureMode==='video')toast('Video mode: smooth recording uses the original camera color. Your selected look stays as a live preview.');",
    "    if(state.captureMode==='video')toast('Video mode: smooth recording uses the original camera color. Your selected look stays as a live preview.');",
    'remove capture mode Live sync'
)

live_functions_start = app.find("  function syncLivePhotoButton(){")
live_functions_end = app.find("  function applyCameraRatio(){", live_functions_start)
if live_functions_start < 0 or live_functions_end < 0:
    raise SystemExit('Missing Live function block')
app = app[:live_functions_start] + app[live_functions_end:]

app = replace_once(
    app,
    "  async function flipCamera(){if(state.liveCaptureBusy){toast('Live Photo is finishing…');return}state.cameraFacing=state.cameraFacing==='environment'?'user':'environment';stopCamera();await startCamera(true);haptic(18)}",
    "  async function flipCamera(){state.cameraFacing=state.cameraFacing==='environment'?'user':'environment';stopCamera();await startCamera(true);haptic(18)}",
    'remove flip Live guard'
)

app = replace_once(
    app,
    "  async function captureOrRecord(){if(state.captureMode==='video'){state.recording?stopVideoRecording():await startVideoRecording();return}if(state.livePhotoEnabled){await captureKiraLivePhoto();return}captureLivePhoto()}",
    "  async function captureOrRecord(){if(state.captureMode==='video'){state.recording?stopVideoRecording():await startVideoRecording();return}captureLivePhoto()}",
    'restore normal photo capture path'
)

cleanup_func = r'''  async function cleanupRetiredMotionPairs(){
    localStorage.removeItem('kira.livePhoto');
    const marker='kira.retiredMotionCleanup12.1';
    if(localStorage.getItem(marker)==='1')return;
    let db;
    try{
      db=await openDB();
      await new Promise((resolve,reject)=>{
        const tx=db.transaction('photos','readwrite'),store=tx.objectStore('photos'),req=store.openCursor();
        req.onsuccess=e=>{
          const cursor=e.target.result;
          if(!cursor)return;
          const item=cursor.value;
          if(item&&(item.motionBlob||item.motionType||item.mediaType==='live-photo')){
            delete item.motionBlob;delete item.motionType;
            if(item.mediaType==='live-photo')delete item.mediaType;
            cursor.update(item)
          }
          cursor.continue()
        };
        req.onerror=()=>reject(req.error);
        tx.oncomplete=resolve;
        tx.onerror=()=>reject(tx.error)
      });
      localStorage.setItem(marker,'1')
    }catch(err){console.warn('Kira retired motion cleanup:',err)}finally{try{db?.close()}catch(_){}}
  }
'''
app = replace_once(
    app,
    "  function isLivePhotoItem(x){return !!x?.motionBlob||x?.mediaType==='live-photo'}\n  function isVideoItem(x){return x?.mediaType==='video'||x?.kind==='video'||x?.blob?.type?.startsWith?.('video/')}",
    cleanup_func + "  function isVideoItem(x){return x?.mediaType==='video'||x?.kind==='video'||x?.blob?.type?.startsWith?.('video/')}",
    'retire Live item helper and add one-time storage cleanup'
)

app = replace_once(
    app,
    "const video=isVideoItem(x),livePhoto=isLivePhotoItem(x),contactSel=state.selectedPhotoIds.has(String(x.id))",
    "const video=isVideoItem(x),contactSel=state.selectedPhotoIds.has(String(x.id))",
    'remove Rolls Live state'
)
app = replace_once(
    app,
    "const liveBadge=livePhoto?'<span class=\"live-roll-badge\">LIVE</span>':'';",
    "",
    'remove Rolls Live badge builder'
)
app = replace_once(
    app,
    "${video?'<span class=\"video-roll-badge\">▶ VIDEO</span>':''}${liveBadge}${selector}",
    "${video?'<span class=\"video-roll-badge\">▶ VIDEO</span>':''}${selector}",
    'remove Rolls Live badge output'
)

app = replace_once(
    app,
    "const im=$('#photoModalImage'),vid=$('#photoModalVideo'),video=isVideoItem(item),livePhoto=isLivePhotoItem(item);",
    "const im=$('#photoModalImage'),vid=$('#photoModalVideo'),video=isVideoItem(item);",
    'remove modal Live state'
)
app = replace_once(
    app,
    "video?'Video':livePhoto?'Live Photo':item.kind==='edited'?'Edited':'Original'",
    "video?'Video':item.kind==='edited'?'Edited':'Original'",
    'remove Live media type label'
)
app = replace_once(
    app,
    "const liveBtn=$('#photoLivePlayBtn');if(liveBtn){liveBtn.classList.toggle('hidden',!livePhoto);liveBtn.textContent='▶ Play Live';liveBtn.dataset.mode='photo'}",
    "",
    'remove modal Live button sync'
)

modal_live_start = app.find("  function toggleModalLivePlayback(){")
modal_live_end = app.find("  async function savePhotoDetails(){", modal_live_start)
if modal_live_start < 0 or modal_live_end < 0:
    raise SystemExit('Missing modal Live playback block')
app = app[:modal_live_start] + app[modal_live_end:]

app = replace_once(
    app,
    "$('#cameraImmersiveBtn')&&($('#cameraImmersiveBtn').onclick=toggleCameraImmersive);$('#livePhotoBtn')&&($('#livePhotoBtn').onclick=toggleLivePhoto);$('#photoLivePlayBtn')&&($('#photoLivePlayBtn').onclick=toggleModalLivePlayback);",
    "$('#cameraImmersiveBtn')&&($('#cameraImmersiveBtn').onclick=toggleCameraImmersive);",
    'remove Live event bindings'
)

app = replace_once(
    app,
    "  function init(){saveNamedRolls();syncLivePhotoButton();ensure1989Glyphs().then(()=>{try{renderPhoto()}catch(_){}});",
    "  function init(){saveNamedRolls();ensure1989Glyphs().then(()=>{try{renderPhoto()}catch(_){}});",
    'remove Live init sync'
)
app = replace_once(
    app,
    "setupInstall();preventZoom();refreshRolls();updateHistoryButtons();",
    "setupInstall();preventZoom();cleanupRetiredMotionPairs().finally(()=>refreshRolls());updateHistoryButtons();",
    'run retired motion cleanup before Rolls refresh'
)
app = replace_once(
    app,
    "navigator.serviceWorker.register('./service-worker.js?v=12.0.0')",
    "navigator.serviceWorker.register('./service-worker.js?v=12.1.0')",
    'service worker registration version'
)

write('app.js', app)


# ---------------- index.html ----------------
index = read('index.html')
index = replace_once(index, './style.css?v=12.0.0', './style.css?v=12.1.0', 'style version')
index = replace_once(index, './app.js?v=12.0.0', './app.js?v=12.1.0', 'app version')
index = replace_once(index, '            <button class="mini-pill" id="livePhotoBtn" aria-pressed="false">Live Off</button>\n', '', 'Live camera button')
index = replace_once(index, '      <button class="secondary-btn live-photo-play hidden" id="photoLivePlayBtn">▶ Play Live</button>\n', '', 'Live playback button')
index = replace_once(index, '<div class="release-badge">BUILD 12.0</div>', '<div class="release-badge">BUILD 12.1</div>', 'release badge')
index = replace_once(
    index,
    '<h4>A more iPhone-like camera — stronger Beauty, full-screen shooting, and Kira Live.</h4>',
    '<h4>A cleaner camera — stronger Beauty, full-screen shooting, and less unnecessary overhead.</h4>',
    'release title'
)
index = replace_once(
    index,
    '<div><b>⛶</b><span>Full camera view expands the live preview to the whole iPhone-style screen while keeping shutter, mode, ratio, timer, grid, Live, and flip controls reachable.</span></div>',
    '<div><b>⛶</b><span>Full camera view expands the live preview to the whole iPhone-style screen while keeping shutter, mode, ratio, timer, grid, and flip controls reachable.</span></div>',
    'full camera release note'
)
index = replace_once(index, '        <div><b>LIVE</b><span>Kira Live saves one still photo plus a short motion clip and lets you play it from Media Details.</span></div>\n', '', 'Kira Live release note')
index = replace_once(
    index,
    '        <div><b>⚡</b><span>Live processing stays off unless you enable it, and the heavy Beauty pass still runs only on saved stills / Develop to protect camera smoothness.</span></div>\n',
    '        <div><b>⚡</b><span>The retired motion-photo recorder has been removed entirely, reducing capture complexity and storage overhead while the heavy Beauty pass still runs only on saved stills / Develop.</span></div>\n',
    'performance release note'
)
index = replace_once(index, '        <div><b>iOS</b><span>Apple\'s proprietary Live Photo pair cannot be written directly by a PWA, so Kira Live remains an in-app motion photo while the still can still be sent to Photos.</span></div>\n', '', 'iOS Live limitation note')
write('index.html', index)


# ---------------- style.css ----------------
css = read('style.css')
css = replace_once(css, '/* === BUILD 12.0: CAMERA BEAUTY + IMMERSIVE + KIRA LIVE === */', '/* === BUILD 12.1: CAMERA BEAUTY + IMMERSIVE === */', 'Build 12 CSS heading')
for line, label in [
    ("#livePhotoBtn.active{background:rgba(255,211,92,.92);border-color:rgba(255,232,157,.95);color:#4a3820;font-weight:800}\n", 'Live active CSS'),
    ("#livePhotoBtn:disabled{opacity:.48}\n", 'Live disabled CSS'),
    (".live-roll-badge{position:absolute;z-index:4;right:8px;bottom:8px;background:rgba(255,210,78,.92);color:#3b2c18;border-radius:999px;padding:5px 7px;font-size:8px;font-weight:900;letter-spacing:.05em;pointer-events:none}\n", 'Live badge CSS'),
    (".live-photo-play{width:100%;margin:8px 0 2px;padding:10px 12px}\n", 'Live play CSS')
]:
    css = replace_once(css, line, '', label)
css = replace_once(css, '/* Five compact camera pills must stay reachable without forcing horizontal page scroll. */', '/* Four compact camera pills must stay reachable without forcing horizontal page scroll. */', 'camera pill comment')
write('style.css', css)


# ---------------- service workers ----------------
for path in ('service-worker.js','sw.js'):
    sw = read(path)
    sw = replace_once(sw, "const CACHE='kira-build12-camera-beauty-live-20260814';", "const CACHE='kira-build12-1-retire-live-20260814';", f'{path} cache')
    write(path, sw)
