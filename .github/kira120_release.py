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
    "    // Build 11.9 — cute flattering looks with adjustable beauty profiles.\n    ['Barely Blush','Beauty','#a87d82,#ead1c9',{brightness:6,contrast:-5,saturation:-5,warmth:4,tint:7,fade:4,bloom:4,beauty:{smooth:18,blemish:34,redness:18,brighten:7,glow:7}}],",
    "    // Build 12 — Beauty Only keeps the camera color neutral while using the stronger skin pass.\n    ['Beauty Only','Beauty','#8c8784,#e8e1dc',{beauty:{smooth:42,blemish:68,redness:30,brighten:8,glow:6}}],\n    // Build 11.9 — cute flattering looks with adjustable beauty profiles.\n    ['Barely Blush','Beauty','#a87d82,#ead1c9',{brightness:6,contrast:-5,saturation:-5,warmth:4,tint:7,fade:4,bloom:4,beauty:{smooth:18,blemish:34,redness:18,brighten:7,glow:7}}],",
    'Beauty Only preset'
)

app = replace_once(
    app,
    "cameraZoomTimer:null,developInitialized:false\n  };",
    "cameraZoomTimer:null,developInitialized:false,cameraImmersive:false,livePhotoEnabled:localStorage.getItem('kira.livePhoto')==='1',liveCaptureBusy:false\n  };",
    'camera state additions'
)

old_beauty_start = app.index("  function skinConfidence(r,g,b){")
old_beauty_end = app.index("\n\n  function applyPresetCast", old_beauty_start)
new_beauty = r'''  function skinConfidence(r,g,b){
    const y=.299*r+.587*g+.114*b;
    if(y<12||y>252)return 0;
    const cb=128-.168736*r-.331264*g+.5*b,cr=128+.5*r-.418688*g-.081312*b;
    const cbScore=1-clamp(Math.abs(cb-110)/56,0,1),crScore=1-clamp(Math.abs(cr-152)/60,0,1);
    const spread=Math.max(r,g,b)-Math.min(r,g,b);
    if(spread<2)return 0;
    return clamp(Math.min(cbScore,crScore)*1.58,0,1)
  }
  function applyBeautyPass(ctx,w,h,beauty=state.beauty){
    const b=Object.assign(defaultBeauty(),beauty||{});
    if(state.compare||!beautyDefs.some(([k])=>Number(b[k]||0)>0))return;
    const maxSide=Math.max(w,h),target=Math.min(maxSide,820),scale=target/maxSide,tw=Math.max(1,Math.round(w*scale)),th=Math.max(1,Math.round(h*scale));
    const src=applyBeautyPass.src||(applyBeautyPass.src=document.createElement('canvas')),blur=applyBeautyPass.blur||(applyBeautyPass.blur=document.createElement('canvas')),layer=applyBeautyPass.layer||(applyBeautyPass.layer=document.createElement('canvas'));
    for(const c of [src,blur,layer]){if(c.width!==tw)c.width=tw;if(c.height!==th)c.height=th}
    const sctx=src.getContext('2d',{alpha:false}),bctx=blur.getContext('2d',{alpha:false}),lctx=layer.getContext('2d');
    if(!sctx||!bctx||!lctx)return;
    sctx.clearRect(0,0,tw,th);sctx.imageSmoothingEnabled=true;sctx.drawImage(ctx.canvas,0,0,w,h,0,0,tw,th);
    const radius=2+Number(b.smooth||0)*.07+Number(b.blemish||0)*.065;
    bctx.clearRect(0,0,tw,th);bctx.filter=`blur(${Math.min(11,radius).toFixed(2)}px)`;bctx.drawImage(src,0,0);bctx.filter='none';
    let orig,soft;try{orig=sctx.getImageData(0,0,tw,th);soft=bctx.getImageData(0,0,tw,th)}catch(e){return}
    const out=lctx.createImageData(tw,th),od=orig.data,sd=soft.data,dd=out.data;
    const sm=clamp(Number(b.smooth||0)/100,0,1),bl=clamp(Number(b.blemish||0)/100,0,1),red=clamp(Number(b.redness||0)/100,0,1),bright=clamp(Number(b.brighten||0)/100,0,1),glow=clamp(Number(b.glow||0)/100,0,1);
    for(let i=0;i<od.length;i+=4){
      const r=od[i],g=od[i+1],bb=od[i+2],skin=skinConfidence(r,g,bb);
      if(skin<.035)continue;
      const sr=sd[i],sg=sd[i+1],sb=sd[i+2];
      const detail=(Math.abs(r-sr)+Math.abs(g-sg)+Math.abs(bb-sb))/3;
      const lum=.299*r+.587*g+.114*bb,softLum=.299*sr+.587*sg+.114*sb;
      const redExcess=Math.max(0,r-(g+bb)*.5),darkSpot=Math.max(0,softLum-lum)/48;
      const blemishTarget=clamp((detail-2)/26+redExcess/52+darkSpot*.88,0,1);
      const soften=clamp(sm*.62+bl*.16+bl*.84*blemishTarget,0,.96);
      let rr=r+(sr-r)*soften,gg=g+(sg-g)*soften,bbb=bb+(sb-bb)*soften;
      if(bl>0&&blemishTarget>0){
        const local=(sg+sb)*.5,excess=Math.max(0,rr-local);
        rr-=excess*bl*blemishTarget*.30;
        const lift=Math.max(0,softLum-(.299*rr+.587*gg+.114*bbb))*bl*blemishTarget*.28;
        rr+=lift;gg+=lift;bbb+=lift;
      }
      if(red>0){const excess=Math.max(0,rr-(gg+bbb)*.5);rr-=excess*red*.72;gg+=excess*red*.10}
      if(bright>0){const lift=(8+20*(1-(.299*rr+.587*gg+.114*bbb)/255))*bright;rr+=lift;gg+=lift*.96;bbb+=lift*.92}
      if(glow>0){rr+=(255-rr)*glow*.052;gg+=(247-gg)*glow*.046;bbb+=(244-bbb)*glow*.046}
      const alpha=clamp(skin*(sm*.58+bl*(.18+.72*blemishTarget)+red*.27+bright*.24+glow*.20),0,.95);
      dd[i]=clamp(rr,0,255);dd[i+1]=clamp(gg,0,255);dd[i+2]=clamp(bbb,0,255);dd[i+3]=Math.round(alpha*255)
    }
    lctx.clearRect(0,0,tw,th);lctx.putImageData(out,0,0);
    ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(layer,0,0,tw,th,0,0,w,h);
    if(glow>0){ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.10,glow*.10);ctx.filter=`blur(${Math.max(1,w/700)}px)`;ctx.drawImage(layer,0,0,tw,th,0,0,w,h);ctx.filter='none'}
    ctx.restore()
  }'''
app = app[:old_beauty_start] + new_beauty + app[old_beauty_end:]

app = replace_once(
    app,
    "beautyBlur=Math.min(.72,Number(b.smooth||0)*.0045+Number(b.blemish||0)*.0022),beautyBright=Number(b.brighten||0)*.045,beautySat=Math.max(94,100-Number(b.redness||0)*.045)",
    "beautyBlur=Math.min(1.08,Number(b.smooth||0)*.0068+Number(b.blemish||0)*.0036),beautyBright=Number(b.brighten||0)*.052,beautySat=Math.max(91,100-Number(b.redness||0)*.06)",
    'stronger live beauty approximation'
)

app = replace_once(
    app,
    "  function switchScreen(name){if(state.recording&&name!=='camera'){toast('Stop recording before leaving Camera.');return}$$('.screen').forEach",
    "  function switchScreen(name){if(state.recording&&name!=='camera'){toast('Stop recording before leaving Camera.');return}if(state.liveCaptureBusy&&name!=='camera'){toast('Live Photo is finishing…');return}if(name!=='camera'&&state.cameraImmersive)setCameraImmersive(false);$$('.screen').forEach",
    'screen switching live guard'
)

app = replace_once(
    app,
    "    if(state.captureMode==='video')toast('Video mode: smooth recording uses the original camera color. Your selected look stays as a live preview.');\n  }",
    "    syncLivePhotoButton();\n    if(state.captureMode==='video')toast('Video mode: smooth recording uses the original camera color. Your selected look stays as a live preview.');\n  }",
    'capture mode live sync'
)

insert_anchor = "  function applyCameraRatio(){const stage=$('#cameraStage');if(!stage)return;"
if insert_anchor not in app:
    raise SystemExit('Missing patch anchor: immersive/live insertion')
new_camera_functions = r'''  function setCameraImmersive(on){
    state.cameraImmersive=!!on;
    document.body.classList.toggle('camera-immersive',state.cameraImmersive);
    const btn=$('#cameraImmersiveBtn');
    if(btn){btn.textContent=state.cameraImmersive?'Exit':'Full';btn.setAttribute('aria-pressed',String(state.cameraImmersive))}
    requestAnimationFrame(()=>{updateCameraViewport();applyCameraRatio()});
    haptic()
  }
  function toggleCameraImmersive(){setCameraImmersive(!state.cameraImmersive)}
  function syncLivePhotoButton(){
    const btn=$('#livePhotoBtn');if(!btn)return;
    const disabled=state.captureMode==='video'||state.recording;
    btn.disabled=disabled;
    btn.classList.toggle('active',state.livePhotoEnabled&&!disabled);
    btn.textContent=state.livePhotoEnabled?'Live On':'Live Off';
    btn.setAttribute('aria-pressed',String(state.livePhotoEnabled));
  }
  function toggleLivePhoto(){
    if(state.captureMode==='video'||state.recording){toast('Live Photo is available in Photo mode.');return}
    if(!window.MediaRecorder){toast('Live Photo is not supported by this browser.');return}
    state.livePhotoEnabled=!state.livePhotoEnabled;
    localStorage.setItem('kira.livePhoto',state.livePhotoEnabled?'1':'0');
    syncLivePhotoButton();
    toast(state.livePhotoEnabled?'Kira Live on • still + motion clip':'Kira Live off');
    haptic(18)
  }
  function livePhotoMime(){
    if(!window.MediaRecorder)return '';
    const types=['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp8','video/webm'];
    return types.find(t=>!MediaRecorder.isTypeSupported||MediaRecorder.isTypeSupported(t))||''
  }
  async function captureLiveMotionClip(duration=2200){
    if(!state.livePhotoEnabled||state.liveCaptureBusy||!window.MediaRecorder)return null;
    const sourceTrack=state.cameraStream?.getVideoTracks?.()[0];
    if(!sourceTrack)return null;
    const track=sourceTrack.clone(),stream=new MediaStream([track]),chunks=[],mime=livePhotoMime();
    let recorder;
    try{recorder=new MediaRecorder(stream,{...(mime?{mimeType:mime}:{}),videoBitsPerSecond:1800000})}
    catch(e){try{recorder=new MediaRecorder(stream)}catch(err){track.stop();return null}}
    state.liveCaptureBusy=true;syncLivePhotoButton();
    return await new Promise(resolve=>{
      let settled=false;
      const finish=blob=>{if(settled)return;settled=true;track.stop();state.liveCaptureBusy=false;syncLivePhotoButton();resolve(blob)};
      recorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
      recorder.onerror=()=>finish(null);
      recorder.onstop=()=>{const type=recorder.mimeType||mime||chunks[0]?.type||'video/mp4';const blob=chunks.length?new Blob(chunks,{type}):null;finish(blob&&blob.size>1000?blob:null)};
      try{recorder.start(300)}catch(e){finish(null);return}
      setTimeout(()=>{try{if(recorder.state!=='inactive')recorder.stop();else finish(null)}catch(e){finish(null)}},duration)
    })
  }
  async function saveKiraLivePhoto(stillBlob,motionBlob){
    const source=await decodePhotoBlob(stillBlob);
    try{
      const maxSide=1920,sw=source.width||source.naturalWidth||1080,sh=source.height||source.naturalHeight||1440,scale=Math.min(1,maxSide/Math.max(sw,sh)),c=document.createElement('canvas');
      c.width=Math.max(1,Math.round(sw*scale));c.height=Math.max(1,Math.round(sh*scale));
      const snapshot=editSnapshot(),p=filterParamsForSnapshot(snapshot);
      withVisualSnapshot(snapshot,()=>drawCameraShotFast(c,source,p));
      const finalBlob=await new Promise(resolve=>c.toBlob(resolve,'image/jpeg',.92));
      if(!finalBlob)throw new Error('Could not encode Live Photo still');
      const name=`kira-live-${Date.now()}`;
      const id=await storeRollPhoto(finalBlob,{kind:'edited',mediaType:'live-photo',name,filter:state.activeFilter,favorite:false,snapshot,rollId:state.activeNamedRollId,cameraCapture:true,motionBlob,motionType:motionBlob.type||'video/mp4'});
      queueRollIdForPhotos(id);
      toast(state.settings.autoPhotos?'Live Photo saved • still queued for Photos':`Live Photo saved to ${rollName(state.activeNamedRollId)} ✓`);
    }finally{if(source&&typeof source.close==='function')source.close()}
  }
  async function captureKiraLivePhoto(){
    if(state.timerRunning||state.liveCaptureBusy){if(state.liveCaptureBusy)toast('Live Photo is finishing…');return}
    if(!state.cameraReady){if(navigator.mediaDevices?.getUserMedia){startCamera(true);toast('Starting camera…')}else $('#cameraInput').click();return}
    const video=$('#cameraVideo');if(!video.videoWidth||!video.videoHeight){toast('Camera is still getting ready.');return}
    await runCameraCountdown();if(!state.cameraReady)return;
    const motionPromise=captureLiveMotionClip(2200);
    await new Promise(r=>requestAnimationFrame(r));
    const c=captureCanvasForRatio(video);shotFeedback();
    const stillBlob=await new Promise(resolve=>c.toBlob(resolve,'image/jpeg',.92));
    if(!stillBlob){toast('Could not capture photo.');await motionPromise;return}
    const motionBlob=await motionPromise;
    if(!motionBlob){enqueueContinuousPhoto(stillBlob,c);toast('Motion clip was unavailable — saved the still photo instead.');return}
    try{await saveKiraLivePhoto(stillBlob,motionBlob)}catch(e){console.error('Kira Live save:',e);enqueueContinuousPhoto(stillBlob,c);toast('Live motion could not be saved — still photo kept.')}
  }

'''
app = app.replace(insert_anchor, new_camera_functions + insert_anchor, 1)

app = replace_once(
    app,
    "  async function flipCamera(){state.cameraFacing=state.cameraFacing==='environment'?'user':'environment';stopCamera();await startCamera(true);haptic(18)}",
    "  async function flipCamera(){if(state.liveCaptureBusy){toast('Live Photo is finishing…');return}state.cameraFacing=state.cameraFacing==='environment'?'user':'environment';stopCamera();await startCamera(true);haptic(18)}",
    'flip live guard'
)

app = replace_once(
    app,
    "  async function captureOrRecord(){if(state.captureMode==='video'){state.recording?stopVideoRecording():await startVideoRecording();return}captureLivePhoto()}",
    "  async function captureOrRecord(){if(state.captureMode==='video'){state.recording?stopVideoRecording():await startVideoRecording();return}if(state.livePhotoEnabled){await captureKiraLivePhoto();return}captureLivePhoto()}",
    'live shutter routing'
)

app = replace_once(
    app,
    "  function isVideoItem(x){return x?.mediaType==='video'||x?.kind==='video'||x?.blob?.type?.startsWith?.('video/')}\n",
    "  function isLivePhotoItem(x){return !!x?.motionBlob||x?.mediaType==='live-photo'}\n  function isVideoItem(x){return x?.mediaType==='video'||x?.kind==='video'||x?.blob?.type?.startsWith?.('video/')}\n",
    'live item detector'
)

app = replace_once(
    app,
    "const video=isVideoItem(x),contactSel=state.selectedPhotoIds.has(String(x.id))",
    "const video=isVideoItem(x),livePhoto=isLivePhotoItem(x),contactSel=state.selectedPhotoIds.has(String(x.id))",
    'roll live flag'
)
app = replace_once(
    app,
    "const title=x.title?`<span class=\"media-title-badge\">${escapeHtml(x.title)}</span>`:'';let selector='';",
    "const title=x.title?`<span class=\"media-title-badge\">${escapeHtml(x.title)}</span>`:'';const liveBadge=livePhoto?'<span class=\"live-roll-badge\">LIVE</span>':'';let selector='';",
    'roll live badge variable'
)
app = replace_once(
    app,
    "${video?'<span class=\"video-roll-badge\">▶ VIDEO</span>':''}${selector}",
    "${video?'<span class=\"video-roll-badge\">▶ VIDEO</span>':''}${liveBadge}${selector}",
    'roll live badge output'
)

app = replace_once(
    app,
    "const im=$('#photoModalImage'),vid=$('#photoModalVideo'),video=isVideoItem(item);",
    "const im=$('#photoModalImage'),vid=$('#photoModalVideo'),video=isVideoItem(item),livePhoto=isLivePhotoItem(item);",
    'media detail live flag'
)
app = replace_once(
    app,
    "<div><b>Type</b>${video?'Video':item.kind==='edited'?'Edited':'Original'}</div>",
    "<div><b>Type</b>${video?'Video':livePhoto?'Live Photo':item.kind==='edited'?'Edited':'Original'}</div>",
    'media detail live type'
)
app = replace_once(
    app,
    "try{syncPhotoCaptionUi(item)}catch(err){console.warn('Kira caption UI:',err);$('#photoCaptionTools')?.classList.add('hidden')}$('#photoFavoriteBtn')",
    "try{syncPhotoCaptionUi(item)}catch(err){console.warn('Kira caption UI:',err);$('#photoCaptionTools')?.classList.add('hidden')}const liveBtn=$('#photoLivePlayBtn');if(liveBtn){liveBtn.classList.toggle('hidden',!livePhoto);liveBtn.textContent='▶ Play Live';liveBtn.dataset.mode='photo'}$('#photoFavoriteBtn')",
    'media detail live button sync'
)

live_modal_anchor = "  async function savePhotoDetails(){const item=currentModalPhoto();"
if live_modal_anchor not in app:
    raise SystemExit('Missing patch anchor: live modal function insertion')
live_modal_fn = r'''  function toggleModalLivePlayback(){
    const item=currentModalPhoto(),btn=$('#photoLivePlayBtn'),im=$('#photoModalImage'),vid=$('#photoModalVideo');
    if(!item||!isLivePhotoItem(item)||!btn||!im||!vid)return;
    if(btn.dataset.mode==='live'){
      safeOpenPhotoModal(item.id);return
    }
    if(vid.dataset.objectUrl){URL.revokeObjectURL(vid.dataset.objectUrl);delete vid.dataset.objectUrl}
    const u=URL.createObjectURL(item.motionBlob);vid.src=u;vid.dataset.objectUrl=u;vid.classList.remove('hidden');im.classList.add('hidden');btn.dataset.mode='live';btn.textContent='▣ Show Photo';
    vid.currentTime=0;vid.play().catch(()=>{})
  }

'''
app = app.replace(live_modal_anchor, live_modal_fn + live_modal_anchor, 1)

app = replace_once(
    app,
    "if(rs)rs.oninput=e=>{state.rollSearch=e.target.value;renderRolls()};",
    "if(rs)rs.oninput=e=>{state.rollSearch=e.target.value;renderRolls()};$('#cameraImmersiveBtn')&&($('#cameraImmersiveBtn').onclick=toggleCameraImmersive);$('#livePhotoBtn')&&($('#livePhotoBtn').onclick=toggleLivePhoto);$('#photoLivePlayBtn')&&($('#photoLivePlayBtn').onclick=toggleModalLivePlayback);",
    'new camera/modal bindings'
)

app = replace_once(
    app,
    "function init(){saveNamedRolls();ensure1989Glyphs()",
    "function init(){saveNamedRolls();syncLivePhotoButton();ensure1989Glyphs()",
    'live button init'
)

app = replace_once(
    app,
    "navigator.serviceWorker.register('./service-worker.js?v=11.9.0')",
    "navigator.serviceWorker.register('./service-worker.js?v=12.0.0')",
    'service worker registration version'
)

write('app.js', app)

# ---------------- index.html ----------------
index = read('index.html')
index = replace_once(index, 'href="./style.css?v=11.9.0"', 'href="./style.css?v=12.0.0"', 'style version')
index = replace_once(
    index,
    '<button class="mini-pill" id="gridBtn">Grid</button>',
    '<button class="mini-pill" id="gridBtn">Grid</button>\n            <button class="mini-pill" id="livePhotoBtn" aria-pressed="false">Live Off</button>\n            <button class="mini-pill" id="cameraImmersiveBtn" aria-pressed="false">Full</button>',
    'camera Live/full controls'
)
index = replace_once(
    index,
    '<video id="photoModalVideo" class="photo-detail-image hidden" controls playsinline preload="metadata"></video>\n      <div class="photo-detail-meta" id="photoDetailMeta"></div>',
    '<video id="photoModalVideo" class="photo-detail-image hidden" controls playsinline preload="metadata"></video>\n      <button class="secondary-btn live-photo-play hidden" id="photoLivePlayBtn">▶ Play Live</button>\n      <div class="photo-detail-meta" id="photoDetailMeta"></div>',
    'Live Photo playback button'
)
old_whats = '''      <div class="release-badge">BUILD 11.9</div>\n      <h4>Beauty that stays adjustable — including acne / blemish softening.</h4>\n      <div class="info-list">\n        <div><b>♡</b><span>Eighteen new cute Beauty looks, from Barely Blush and Rosy Milk to Soft Princess, Sakura Skin, and Dreamy Selfie.</span></div>\n        <div><b>100</b><span>Five independent 0–100 beauty controls: Smooth skin, Acne / blemish, Redness, Brighten, and Glow.</span></div>\n        <div><b>◎</b><span>Acne / blemish selectively softens uneven red or dark skin texture instead of simply blurring the whole photo.</span></div>\n        <div><b>◐</b><span>Beauty settings are preserved in captures, Undo / Redo, and Film Lab recipes.</span></div>\n        <div><b>⚡</b><span>The live camera uses a lightweight approximation; the selective beauty pass runs only for still photos and Develop to protect iPhone camera smoothness.</span></div>\n        <div><b>□</b><span>Beauty starts at zero on a clean install and can be reset at any time.</span></div>\n      </div>'''
new_whats = '''      <div class="release-badge">BUILD 12.0</div>\n      <h4>A more iPhone-like camera — stronger Beauty, full-screen shooting, and Kira Live.</h4>\n      <div class="info-list">\n        <div><b>♡</b><span>Beauty Only gives you a normal, neutral camera look with smoothing and blemish reduction but no film color grade.</span></div>\n        <div><b>◎</b><span>Smooth and Acne / blemish now use a stronger selective skin pass, including better handling of red and darker uneven spots.</span></div>\n        <div><b>⛶</b><span>Full camera view expands the live preview to the whole iPhone-style screen while keeping shutter, mode, ratio, timer, grid, Live, and flip controls reachable.</span></div>\n        <div><b>LIVE</b><span>Kira Live saves one still photo plus a short motion clip and lets you play it from Media Details.</span></div>\n        <div><b>⚡</b><span>Live processing stays off unless you enable it, and the heavy Beauty pass still runs only on saved stills / Develop to protect camera smoothness.</span></div>\n        <div><b>iOS</b><span>Apple's proprietary Live Photo pair cannot be written directly by a PWA, so Kira Live remains an in-app motion photo while the still can still be sent to Photos.</span></div>\n      </div>'''
index = replace_once(index, old_whats, new_whats, 'What’s New Build 12')
index = replace_once(index, '<script src="./app.js?v=11.9.0"></script>', '<script src="./app.js?v=12.0.0"></script>', 'app version')
write('index.html', index)

# ---------------- style.css ----------------
style = read('style.css')
if '/* === BUILD 12.0: CAMERA BEAUTY + IMMERSIVE + KIRA LIVE === */' in style:
    raise SystemExit('Build 12 CSS already present')
style += r'''

/* === BUILD 12.0: CAMERA BEAUTY + IMMERSIVE + KIRA LIVE === */
#livePhotoBtn.active{background:rgba(255,211,92,.92);border-color:rgba(255,232,157,.95);color:#4a3820;font-weight:800}
#livePhotoBtn:disabled{opacity:.48}
.live-roll-badge{position:absolute;z-index:4;right:8px;bottom:8px;background:rgba(255,210,78,.92);color:#3b2c18;border-radius:999px;padding:5px 7px;font-size:8px;font-weight:900;letter-spacing:.05em;pointer-events:none}
.live-photo-play{width:100%;margin:8px 0 2px;padding:10px 12px}

/* Five compact camera pills must stay reachable without forcing horizontal page scroll. */
.camera-top-tools{left:8px;right:8px;gap:5px;justify-content:center;flex-wrap:wrap;align-content:flex-start}
.camera-top-tools .mini-pill{padding:6px 8px;font-size:9px;min-height:30px;white-space:nowrap}

/* Immersive view is deliberately CSS-only: no extra stream, no second live canvas. */
body.camera-mode.camera-immersive{overflow:hidden;background:#000}
body.camera-mode.camera-immersive .app-shell{position:fixed!important;inset:0!important;width:100%!important;max-width:none!important;height:100dvh!important;min-height:100dvh!important;margin:0!important;padding:0!important;border-radius:0!important;box-shadow:none!important;background:#000!important;overflow:hidden!important;z-index:300}
body.camera-mode.camera-immersive .topbar,
body.camera-mode.camera-immersive .bottom-nav,
body.camera-mode.camera-immersive .camera-look-section,
body.camera-mode.camera-immersive .camera-advanced-panel{display:none!important}
body.camera-mode.camera-immersive main{position:absolute!important;inset:0!important;padding:0!important;margin:0!important;width:100%!important;height:100%!important;overflow:hidden!important}
body.camera-mode.camera-immersive .clean-camera-screen{position:absolute!important;inset:0!important;display:block!important;width:100%!important;height:100%!important;padding:0!important;margin:0!important;background:#000!important}
body.camera-mode.camera-immersive #cameraStage{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:0!important;max-height:none!important;aspect-ratio:auto!important;border-radius:0!important;box-shadow:none!important;background:#000!important}
body.camera-mode.camera-immersive #cameraStage.ratio-3-4,
body.camera-mode.camera-immersive #cameraStage.ratio-1-1,
body.camera-mode.camera-immersive #cameraStage.ratio-9-16{aspect-ratio:auto!important}
body.camera-mode.camera-immersive #cameraVideo{width:100%!important;height:100%!important;object-fit:cover!important}
body.camera-mode.camera-immersive .camera-top-tools{top:calc(10px + env(safe-area-inset-top))!important;z-index:45!important}
body.camera-mode.camera-immersive .live-filter-name{bottom:calc(126px + env(safe-area-inset-bottom))!important;z-index:44!important}
body.camera-mode.camera-immersive .clean-camera-actions{position:absolute!important;z-index:50!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;height:116px!important;padding:4px 14px calc(10px + env(safe-area-inset-bottom))!important;grid-template-columns:1fr 78px 1fr!important;grid-template-rows:30px 72px!important;background:linear-gradient(to top,rgba(0,0,0,.74),rgba(0,0,0,.08))!important}
body.camera-mode.camera-immersive .clean-camera-actions .round-label-btn{color:#fff!important;text-shadow:0 1px 8px rgba(0,0,0,.45)!important}
body.camera-mode.camera-immersive .clean-camera-actions .shutter{width:68px!important;height:68px!important;border-color:#fff!important;box-shadow:inset 0 0 0 5px rgba(255,255,255,.78),0 5px 18px rgba(0,0,0,.34)!important}
body.camera-mode.camera-immersive .capture-mode-switch{background:rgba(15,15,15,.42)!important;border:1px solid rgba(255,255,255,.16)!important;border-radius:999px!important}
body.camera-mode.camera-immersive .capture-mode-switch button{color:#ddd!important}
body.camera-mode.camera-immersive .capture-mode-switch button.active{color:#ffd66d!important}
body.camera-mode.camera-immersive .camera-empty{z-index:35!important;background:rgba(0,0,0,.38)!important}
body.camera-mode.camera-immersive .camera-countdown,
body.camera-mode.camera-immersive .recording-hud{z-index:55!important}
@media(max-width:380px){.camera-top-tools .mini-pill{padding:5px 7px;font-size:8px}.camera-top-tools{gap:4px}}
'''
write('style.css', style)

# ---------------- service worker parity ----------------
sw = read('service-worker.js')
sw = replace_once(sw, "const CACHE='kira-build11-9-adjustable-beauty-20260814';", "const CACHE='kira-build12-camera-beauty-live-20260814';", 'cache name')
write('service-worker.js', sw)
write('sw.js', sw)

# ---------------- release assertions ----------------
assert "['Beauty Only','Beauty'" in app
assert "function captureKiraLivePhoto" in app
assert "function toggleCameraImmersive" in app
assert "function isLivePhotoItem" in app
assert "kira.livePhoto" in app
assert "service-worker.js?v=12.0.0" in app
assert 'id="livePhotoBtn"' in index
assert 'id="cameraImmersiveBtn"' in index
assert 'id="photoLivePlayBtn"' in index
assert 'BUILD 12.0' in index
assert './app.js?v=12.0.0' in index
assert 'camera-immersive' in style
assert 'live-roll-badge' in style
assert "kira-build12-camera-beauty-live-20260814" in sw
print('Kira 12.0 production patch applied successfully.')
