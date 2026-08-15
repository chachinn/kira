from pathlib import Path
import re


def once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 target, found {count}")
    return text.replace(old, new, 1)


app = Path('app.js')
s = app.read_text()

# The live Beauty canvas was compositing a processed copy of an earlier video
# frame over the current video. On iPhone this can ghost/jump after flipping to
# selfie or whenever the face moves. Keep Beauty processing on exact still
# frames only (captured photos + Develop).
start = s.find('  const LIVE_BEAUTY_INTERVAL=120;')
end = s.find('  function applyLiveFilter()', start)
if start < 0 or end < 0 or end <= start:
    raise SystemExit('live Beauty renderer block not found')
replacement = """  function stopLiveBeautyPreview(){
    const c=$('#liveBeautyCanvas');
    if(c){
      c.style.opacity='0';
      const x=c.getContext('2d');
      x?.clearRect(0,0,c.width,c.height)
    }
  }
  function scheduleLiveBeautyPreview(){stopLiveBeautyPreview()}
"""
s = s[:start] + replacement + s[end:]

old_face = "const od=orig.data,sd=softData.data,hd=healData.data,out=lctx.createImageData(tw,th),dd=out.data,detectedFace=detectBeautyFaceBox(od,tw,th),face=bucket==='live'?stabilizeLiveBeautyFace(detectedFace,tw,th):detectedFace;if(!face)return null;const effectPeak=Math.max(sm,bl,red,bright,glow);"
new_face = "const od=orig.data,sd=softData.data,hd=healData.data,out=lctx.createImageData(tw,th),dd=out.data,face=detectBeautyFaceBox(od,tw,th);if(!face)return null;const effectPeak=Math.max(sm,bl,red,bright,glow);"
s = once(s, old_face, new_face, 'still-only Beauty face detection')

old_develop_help = "Smooth and Acne now target Kira’s detected face/skin region. High-contrast facial features are protected from smearing; the live preview uses a small face-only layer while saved photos use the stronger pass."
new_develop_help = "Smooth, Acne, Redness, Brighten, and Glow target Kira’s detected face/skin region on the actual photo. The Camera keeps the moving selfie preview artifact-free, then applies the stronger face-targeted Beauty pass to the captured still and in Develop."
s = once(s, old_develop_help, new_develop_help, 'Develop Beauty help')

s = once(s, "service-worker.js?v=1.0.4", "service-worker.js?v=1.0.5", 'service worker registration')
app.write_text(s)

index = Path('index.html')
h = index.read_text()
if '?v=1.0.4' not in h:
    raise SystemExit('index v1.0.4 asset refs missing')
h = h.replace('?v=1.0.4', '?v=1.0.5')
old_camera_help = "Smooth and Acne only render when Kira finds a face. Live Beauty uses stabilized front-camera face tracking to reduce jumping and flicker; saved photos use the stronger face-targeted pass."
new_camera_help = "Beauty preset color can preview live. Smooth, Acne, Redness, Brighten, and Glow are applied to the captured photo and in Develop so the moving selfie preview stays smooth and artifact-free."
h = once(h, old_camera_help, new_camera_help, 'Camera Beauty help')
index.write_text(h)

style = Path('style.css')
css = style.read_text()
css += """

/* === v1.0 CAPTURE-SAFE BEAUTY CAMERA === */
/* Do not composite delayed processed face pixels over a moving selfie feed.
   Face-targeted Beauty is rendered from the exact captured still / Develop image. */
.live-beauty-canvas{display:none!important;opacity:0!important}
"""
style.write_text(css)

for name in ('service-worker.js', 'sw.js'):
    p = Path(name)
    text = p.read_text()
    text = once(
        text,
        "const CACHE='kira-v1-0-beauty-stability-flash-rolls-20260815';",
        "const CACHE='kira-v1-0-capture-safe-beauty-20260815';",
        f'{name} cache key'
    )
    p.write_text(text)
