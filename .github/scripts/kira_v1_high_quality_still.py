from pathlib import Path
import re

APP=Path('app.js')
IDX=Path('index.html')
SW=Path('service-worker.js')
SW2=Path('sw.js')
app=APP.read_text()
idx=IDX.read_text()
sw=SW.read_text()

def one(text, old, new, label):
    n=text.count(old)
    if n!=1:
        raise SystemExit(f'{label}: expected exactly 1 match, got {n}')
    return text.replace(old,new,1)

# 1) Photo-quality preference defaults to High for existing/new users.
app=one(
    app,
    "const defaultSettings={grid:false,haptics:true,rememberFilter:true,keepOriginal:false,autoSave:false,autoPhotos:true,continuousShoot:true,videoAudio:true,videoQuality:'smooth',defaultCaptureMode:'photo',theme:'old-rose',accent:'#b76e79',density:'cozy'};",
    "const defaultSettings={grid:false,haptics:true,rememberFilter:true,keepOriginal:false,autoSave:false,autoPhotos:true,continuousShoot:true,videoAudio:true,videoQuality:'smooth',photoQuality:'high',defaultCaptureMode:'photo',theme:'old-rose',accent:'#b76e79',density:'cozy'};",
    'default photo quality'
)

# 2) Settings UI + binding.
video_block='''            <label class="setting-row setting-select-row"><span>Video quality</span>\n              <select id="settingVideoQuality" class="mini-select">\n                <option value="smooth">Smooth • recommended</option>\n                <option value="high">High quality</option>\n              </select>\n            </label>'''
photo_video_block='''            <label class="setting-row setting-select-row"><span>Photo quality</span>\n              <select id="settingPhotoQuality" class="mini-select">\n                <option value="standard">Standard • faster</option>\n                <option value="high">High • recommended</option>\n                <option value="max">Max detail • slower</option>\n              </select>\n            </label>\n            <label class="setting-row setting-select-row"><span>Video quality</span>\n              <select id="settingVideoQuality" class="mini-select">\n                <option value="smooth">Smooth • recommended</option>\n                <option value="high">High quality</option>\n              </select>\n            </label>'''
idx=one(idx,video_block,photo_video_block,'photo quality settings UI')
idx=one(
    idx,
    '            <div class="notice">Smooth mode uses a lower video bitrate and is the recommended setting for iPhone. Kira records the original camera stream for video so recording stays responsive.</div>',
    '            <div class="notice">Photo quality affects still captures only: High is recommended, while Max keeps more detail but takes longer to process and uses more local storage. Video quality stays separate so recording remains responsive.</div>',
    'camera settings notice'
)
old_bind="const vq=$('#settingVideoQuality');if(vq){vq.value=state.settings.videoQuality||'smooth';vq.onchange=()=>{state.settings.videoQuality=vq.value;saveSettings();toast(vq.value==='smooth'?'Smooth video quality selected.':'High video quality selected.')}}const dc=$('#settingDefaultCapture');"
new_bind="const pq=$('#settingPhotoQuality');if(pq){pq.value=state.settings.photoQuality||'high';pq.onchange=()=>{state.settings.photoQuality=pq.value;saveSettings();toast(pq.value==='max'?'Max photo detail selected — saves may take a little longer.':pq.value==='standard'?'Standard photo quality selected.':'High photo quality selected.')}}const vq=$('#settingVideoQuality');if(vq){vq.value=state.settings.videoQuality||'smooth';vq.onchange=()=>{state.settings.videoQuality=vq.value;saveSettings();toast(vq.value==='smooth'?'Smooth video quality selected.':'High video quality selected.')}}const dc=$('#settingDefaultCapture');"
app=one(app,old_bind,new_bind,'photo quality settings binding')

# 3) Replace preview-frame-only capture with a still-photo-first capture path.
old_capture_canvas="function captureCanvasForRatio(video){const ratio=state.cameraRatio==='1:1'?[1,1]:state.cameraRatio==='9:16'?[9,16]:[3,4],target=ratio[0]/ratio[1],vw=video.videoWidth||1080,vh=video.videoHeight||1440,src=vw/vh;let sw=vw,sh=vh;if(src>target)sw=vh*target;else sh=vw/target;const maxSide=2048,scale=Math.min(1,maxSide/Math.max(sw,sh)),cw=Math.max(1,Math.round(sw*scale)),ch=Math.max(1,Math.round(sh*scale)),c=document.createElement('canvas');c.width=cw;c.height=ch;drawVideoCrop(c.getContext('2d',{alpha:false}),video,cw,ch);return c}"
new_capture_helpers=r'''function photoQualityProfile(mode=state.settings.photoQuality||'high'){
    if(mode==='max')return {maxSide:3840,jpeg:.97,label:'Max'};
    if(mode==='standard')return {maxSide:2048,jpeg:.93,label:'Standard'};
    return {maxSide:3072,jpeg:.96,label:'High'}
  }
  function cameraRatioPair(name=state.cameraRatio){return name==='1:1'?[1,1]:name==='9:16'?[9,16]:[3,4]}
  function cameraSourceDimensions(source){return [Number(source?.videoWidth||source?.naturalWidth||source?.width||1),Number(source?.videoHeight||source?.naturalHeight||source?.height||1)]}
  function cropCameraSourceToRatio(source,maxSide,mirror=false,ratioName=state.cameraRatio){
    const [iw,ih]=cameraSourceDimensions(source),ratio=cameraRatioPair(ratioName),target=ratio[0]/ratio[1],src=iw/ih;let sx=0,sy=0,sw=iw,sh=ih;
    if(src>target){sw=ih*target;sx=(iw-sw)/2}else{sh=iw/target;sy=(ih-sh)/2}
    const scale=Math.min(1,Math.max(1,Number(maxSide)||3072)/Math.max(sw,sh)),cw=Math.max(1,Math.round(sw*scale)),ch=Math.max(1,Math.round(sh*scale)),c=document.createElement('canvas');c.width=cw;c.height=ch;const ctx=c.getContext('2d',{alpha:false});
    if(mirror){ctx.save();ctx.translate(cw,0);ctx.scale(-1,1);ctx.drawImage(source,sx,sy,sw,sh,0,0,cw,ch);ctx.restore()}else ctx.drawImage(source,sx,sy,sw,sh,0,0,cw,ch);
    return c
  }
  function canvasToJpeg(canvas,quality){return new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality))}
  async function captureBestStill(video){
    const profile=photoQualityProfile(),track=state.cameraStream?.getVideoTracks?.()[0];
    if(track&&typeof ImageCapture==='function'){
      try{
        const imageCapture=new ImageCapture(track),blob=await imageCapture.takePhoto();
        if(blob&&blob.size>0)return {blob,nativeStill:true,needsCrop:true,profile}
      }catch(err){console.warn('Kira high-resolution still fallback:',err)}
    }
    const canvas=captureCanvasForRatio(video,profile.maxSide),blob=await canvasToJpeg(canvas,profile.jpeg);
    if(!blob)throw new Error('Could not encode camera frame');
    return {blob,canvas,nativeStill:false,needsCrop:false,profile}
  }
  async function prepareStillForDevelop(shot,ratioName=state.cameraRatio,facing=state.cameraFacing){
    if(!shot?.needsCrop)return shot?.blob||null;
    const source=await decodePhotoBlob(shot.blob);try{const c=cropCameraSourceToRatio(source,shot.profile?.maxSide||photoQualityProfile().maxSide,facing==='user',ratioName);return await canvasToJpeg(c,shot.profile?.jpeg||.96)}finally{if(source&&typeof source.close==='function')source.close()}
  }
  function captureCanvasForRatio(video,maxSide=photoQualityProfile().maxSide){return cropCameraSourceToRatio(video,maxSide,state.cameraFacing==='user',state.cameraRatio)}'''
app=one(app,old_capture_canvas,new_capture_helpers,'high-quality still helpers')

# 4) Continuous processing now preserves the selected still-quality tier and crops native stills only once before filtering.
old_process="async function processContinuousPhoto(task){const source=await decodePhotoBlob(task.blob);try{const maxSide=1920,sw=source.width||source.naturalWidth||task.width,sh=source.height||source.naturalHeight||task.height,scale=Math.min(1,maxSide/Math.max(sw,sh)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(sw*scale));c.height=Math.max(1,Math.round(sh*scale));const p=filterParamsForSnapshot(task.snapshot);withVisualSnapshot(task.snapshot,()=>drawCameraShotFast(c,source,p));const finalBlob=await new Promise(resolve=>c.toBlob(resolve,'image/jpeg',.92));if(!finalBlob)throw new Error('Could not encode photo');const name=`kira-${task.stamp}`;const id=await storeRollPhoto(finalBlob,{kind:'edited',mediaType:'photo',name,filter:task.filter,favorite:false,snapshot:task.snapshot,rollId:task.rollId,cameraCapture:true});queueRollIdForPhotos(id);toast(state.settings.autoPhotos?`Saved • ${state.photosQueueIds.length} waiting for Photos`:`Saved to ${rollName(task.rollId)} ✓`)}finally{if(source&&typeof source.close==='function')source.close()}}"
new_process=r'''async function processContinuousPhoto(task){
    const source=await decodePhotoBlob(task.blob);let cropped=null;
    try{
      const profile=photoQualityProfile(task.photoQuality),input=task.needsCrop?(cropped=cropCameraSourceToRatio(source,profile.maxSide,task.facing==='user',task.ratio)):source,sw=input.width||input.naturalWidth||task.width,sh=input.height||input.naturalHeight||task.height,scale=Math.min(1,profile.maxSide/Math.max(sw,sh)),c=document.createElement('canvas');
      c.width=Math.max(1,Math.round(sw*scale));c.height=Math.max(1,Math.round(sh*scale));const p=filterParamsForSnapshot(task.snapshot);withVisualSnapshot(task.snapshot,()=>drawCameraShotFast(c,input,p));const finalBlob=await canvasToJpeg(c,profile.jpeg);if(!finalBlob)throw new Error('Could not encode photo');const name=`kira-${task.stamp}`;const id=await storeRollPhoto(finalBlob,{kind:'edited',mediaType:'photo',name,filter:task.filter,favorite:false,snapshot:task.snapshot,rollId:task.rollId,cameraCapture:true});queueRollIdForPhotos(id);toast(state.settings.autoPhotos?`Saved • ${state.photosQueueIds.length} waiting for Photos`:`Saved to ${rollName(task.rollId)} ✓`)
    }finally{if(source&&typeof source.close==='function')source.close()}
  }'''
app=one(app,old_process,new_process,'continuous high-quality processing')
old_enqueue="function enqueueContinuousPhoto(blob,c){if(state.photoProcessQueue.length>=8){toast('Kira is still saving earlier shots — give it a moment.');return false}state.captureSequence++;state.photoProcessQueue.push({blob,width:c.width,height:c.height,stamp:Date.now(),filter:state.activeFilter,snapshot:editSnapshot(),rollId:state.activeNamedRollId,seq:state.captureSequence});runPhotoProcessQueue();return true}"
new_enqueue="function enqueueContinuousPhoto(blob,c,meta={}){if(state.photoProcessQueue.length>=8){toast('Kira is still saving earlier shots — give it a moment.');return false}state.captureSequence++;state.photoProcessQueue.push({blob,width:c?.width||0,height:c?.height||0,stamp:Date.now(),filter:state.activeFilter,snapshot:editSnapshot(),rollId:state.activeNamedRollId,seq:state.captureSequence,needsCrop:!!meta.needsCrop,ratio:state.cameraRatio,facing:state.cameraFacing,photoQuality:state.settings.photoQuality||'high'});runPhotoProcessQueue();return true}"
app=one(app,old_enqueue,new_enqueue,'continuous capture metadata')

old_capture=r'''  async function captureLivePhoto(){
    if(state.timerRunning)return;
    if(!state.cameraReady){if(navigator.mediaDevices?.getUserMedia){startCamera(true);toast('Starting camera…')}else $('#cameraInput').click();return}
    const video=$('#cameraVideo');if(!video.videoWidth||!video.videoHeight){toast('Camera is still getting ready.');return}
    await runCameraCountdown();if(!state.cameraReady)return;
    const releaseFlash=await prepareCaptureFlash();
    const c=captureCanvasForRatio(video);
    await releaseFlash();
    shotFeedback();
    c.toBlob(blob=>{if(!blob){toast('Could not capture photo.');return}if(state.settings.continuousShoot){enqueueContinuousPhoto(blob,c);return}const file=new File([blob],`kira-${Date.now()}.jpg`,{type:'image/jpeg'});loadFile(file,'camera')},'image/jpeg',.92)
  }'''
new_capture=r'''  async function captureLivePhoto(){
    if(state.timerRunning)return;
    if(!state.cameraReady){if(navigator.mediaDevices?.getUserMedia){startCamera(true);toast('Starting camera…')}else $('#cameraInput').click();return}
    const video=$('#cameraVideo');if(!video.videoWidth||!video.videoHeight){toast('Camera is still getting ready.');return}
    await runCameraCountdown();if(!state.cameraReady)return;
    const releaseFlash=await prepareCaptureFlash();let shot=null;
    try{shot=await captureBestStill(video)}catch(err){console.error('Kira still capture:',err);toast('High-quality still capture failed. Trying the camera frame instead.');try{const profile=photoQualityProfile(),canvas=captureCanvasForRatio(video,profile.maxSide),blob=await canvasToJpeg(canvas,profile.jpeg);shot={blob,canvas,nativeStill:false,needsCrop:false,profile}}catch(fallbackErr){console.error('Kira fallback capture:',fallbackErr)}}finally{await releaseFlash()}
    if(!shot?.blob){toast('Could not capture photo.');return}
    shotFeedback();
    if(state.settings.continuousShoot){enqueueContinuousPhoto(shot.blob,shot.canvas,shot);return}
    const finalBlob=await prepareStillForDevelop(shot,state.cameraRatio,state.cameraFacing);if(!finalBlob){toast('Could not prepare photo.');return}const file=new File([finalBlob],`kira-${Date.now()}.jpg`,{type:'image/jpeg'});loadFile(file,'camera')
  }'''
app=one(app,old_capture,new_capture,'captureLivePhoto still-first path')

# 5) Higher quality manual Develop exports.
app=one(app,"const max=state.exportQuality==='Original'?4096:state.exportQuality==='High'?2560:1440","const max=state.exportQuality==='Original'?4096:state.exportQuality==='High'?3072:1440",'High export dimensions')
old_blob="async function currentBlob(type='image/jpeg',quality=.94){return new Promise(resolve=>{const [w,h]=exportDimensions(),c=document.createElement('canvas');c.width=w;c.height=h;drawEdited(c,filterParams(),true);c.toBlob(resolve,type,state.exportQuality==='Social'?.9:quality)})}"
new_blob="async function currentBlob(type='image/jpeg',quality=.94){return new Promise(resolve=>{const [w,h]=exportDimensions(),c=document.createElement('canvas');c.width=w;c.height=h;drawEdited(c,filterParams(),true);const q=state.exportQuality==='Social'?.9:state.exportQuality==='Original'?.97:Math.max(.96,quality);c.toBlob(resolve,type,q)})}"
app=one(app,old_blob,new_blob,'manual export JPEG quality')

# 6) PWA cache/version bump while public release stays v1.0.
idx=idx.replace('manifest.json?v=1.0.7','manifest.json?v=1.0.8').replace('style.css?v=1.0.7','style.css?v=1.0.8').replace('app.js?v=1.0.7','app.js?v=1.0.8')
if idx.count('1.0.8')<3: raise SystemExit('index version bump incomplete')
app,n=re.subn(r"service-worker\.js\?v=1\.0\.7","service-worker.js?v=1.0.8",app,count=1)
if n!=1: raise SystemExit(f'SW registration bump expected 1, got {n}')
sw,n=re.subn(r"const CACHE='[^']+';","const CACHE='kira-v1-0-high-quality-still-20260817';",sw,count=1)
if n!=1: raise SystemExit('service worker cache bump failed')

APP.write_text(app)
IDX.write_text(idx)
SW.write_text(sw)
SW2.write_text(sw)
print('Applied Kira v1.0 high-quality still capture patch')
