from pathlib import Path
import re


def read(path):
    return Path(path).read_text(encoding='utf-8')


def write(path, text):
    Path(path).write_text(text, encoding='utf-8')


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'Missing patch anchor: {label}')
    return text.replace(old, new, 1)


def sub_once(text, pattern, repl, label, flags=0):
    out, n = re.subn(pattern, repl, text, count=1, flags=flags)
    if n != 1:
        raise SystemExit(f'Expected one replacement for {label}, got {n}')
    return out


# ---------------- app.js ----------------
app = read('app.js')

# Stronger saved-photo skin / blemish processing. Kept at a bounded working resolution
# and on the saved still / Develop path only so the live camera remains smooth.
app = replace_once(app, "return clamp(Math.min(cbScore,crScore)*1.58,0,1)", "return clamp(Math.min(cbScore,crScore)*2.05,0,1)", 'skin confidence strength')
app = replace_once(app, "target=Math.min(maxSide,820)", "target=Math.min(maxSide,920)", 'beauty working resolution')
app = replace_once(app, "const radius=2+Number(b.smooth||0)*.07+Number(b.blemish||0)*.065;", "const radius=2.5+Number(b.smooth||0)*.09+Number(b.blemish||0)*.08;", 'beauty blur radius')
app = replace_once(app, "bctx.filter=`blur(${Math.min(11,radius).toFixed(2)}px)`", "bctx.filter=`blur(${Math.min(14,radius).toFixed(2)}px)`", 'beauty blur cap')
app = replace_once(app, "const blemishTarget=clamp((detail-2)/26+redExcess/52+darkSpot*.88,0,1);", "const blemishTarget=clamp((detail-1)/18+redExcess/34+darkSpot*1.15,0,1);", 'blemish targeting')
app = replace_once(app, "const soften=clamp(sm*.62+bl*.16+bl*.84*blemishTarget,0,.96);", "const soften=clamp(sm*.82+bl*.22+bl*1.08*blemishTarget,0,.985);", 'beauty smoothing strength')
app = replace_once(app, "rr-=excess*bl*blemishTarget*.30;", "rr-=excess*bl*blemishTarget*.52;", 'blemish redness correction')
app = replace_once(app, "const lift=Math.max(0,softLum-(.299*rr+.587*gg+.114*bbb))*bl*blemishTarget*.28;", "const lift=Math.max(0,softLum-(.299*rr+.587*gg+.114*bbb))*bl*blemishTarget*.46;", 'blemish dark spot lift')
app = replace_once(app, "if(red>0){const excess=Math.max(0,rr-(gg+bbb)*.5);rr-=excess*red*.72;gg+=excess*red*.10}", "if(red>0){const excess=Math.max(0,rr-(gg+bbb)*.5);rr-=excess*red*.82;gg+=excess*red*.13}", 'redness control strength')
app = replace_once(app, "const alpha=clamp(skin*(sm*.58+bl*(.18+.72*blemishTarget)+red*.27+bright*.24+glow*.20),0,.95);", "const alpha=clamp(skin*1.16*(sm*.76+bl*(.24+.98*blemishTarget)+red*.32+bright*.24+glow*.20),0,.985);", 'beauty mask opacity')

# Make the lightweight live preview visibly respond at high Smooth / Acne settings.
app = replace_once(app, "beautyBlur=Math.min(1.08,Number(b.smooth||0)*.0068+Number(b.blemish||0)*.0036),beautyBright=Number(b.brighten||0)*.052,beautySat=Math.max(91,100-Number(b.redness||0)*.06)", "beautyBlur=Math.min(1.65,Number(b.smooth||0)*.0105+Number(b.blemish||0)*.0056),beautyBright=Number(b.brighten||0)*.058,beautySat=Math.max(89,100-Number(b.redness||0)*.075)", 'live beauty preview strength')

# A single helper owns the Camera controls sheet state so every close path stays in sync.
bind_anchor = "  function bindInputs(){bindRollGridInteractions();bindCameraBeautyControls();"
if bind_anchor not in app:
    raise SystemExit('Missing patch anchor: bindInputs')
helper = r'''  function setCameraControlsOpen(open,restoreFocus=false){
    const btn=$('#cameraControlsBtn'),panel=$('#cameraAdvancedPanel');
    if(!btn||!panel)return;
    const next=!!open;
    panel.classList.toggle('hidden',!next);
    btn.setAttribute('aria-expanded',String(next));
    btn.textContent=next?'Controls⌃':'Controls⌄';
    document.body.classList.toggle('camera-controls-open',next);
    if(!next&&restoreFocus){try{btn.focus({preventScroll:true})}catch(_){btn.focus()}}
  }

'''
app = app.replace(bind_anchor, helper + bind_anchor, 1)

old_controls = "    const cameraControls=$('#cameraControlsBtn'),cameraPanel=$('#cameraAdvancedPanel');if(cameraControls&&cameraPanel)cameraControls.onclick=()=>{const open=cameraPanel.classList.toggle('hidden')===false;cameraControls.setAttribute('aria-expanded',String(open));cameraControls.textContent=open?'Controls⌃':'Controls⌄';haptic()};"
new_controls = "    const cameraControls=$('#cameraControlsBtn'),cameraPanel=$('#cameraAdvancedPanel');if(cameraControls&&cameraPanel)cameraControls.onclick=()=>{setCameraControlsOpen(cameraPanel.classList.contains('hidden'));haptic()};$('#cameraControlsCloseBtn')&&($('#cameraControlsCloseBtn').onclick=()=>{setCameraControlsOpen(false,true);haptic()});$('#cameraControlsDoneBtn')&&($('#cameraControlsDoneBtn').onclick=()=>{setCameraControlsOpen(false,true);haptic()});"
app = replace_once(app, old_controls, new_controls, 'camera controls binding')

# Full-screen mode should never leave the controls sheet logically open behind it.
app = replace_once(app, "  function setCameraImmersive(on){\n    state.cameraImmersive=!!on;", "  function setCameraImmersive(on){\n    if(on)setCameraControlsOpen(false);\n    state.cameraImmersive=!!on;", 'immersive closes controls')

# Version service worker registration.
app = sub_once(app, r"service-worker\.js\?v=12\.1\.0", "service-worker.js?v=12.2.0", 'service worker query')
write('app.js', app)


# ---------------- index.html ----------------
index = read('index.html')
index = replace_once(index, './style.css?v=12.1.0', './style.css?v=12.2.0', 'style version')
index = replace_once(index, './app.js?v=12.1.0', './app.js?v=12.2.0', 'app version')

old_head = '<div class="advanced-panel-head"><strong>Camera controls</strong><span>optional</span></div>'
new_head = '<div class="advanced-panel-head"><div><strong>Camera controls</strong><span>optional</span></div><button type="button" class="camera-controls-close-btn" id="cameraControlsCloseBtn" aria-label="Close Camera controls">Done</button></div>'
index = replace_once(index, old_head, new_head, 'camera controls close header')

counter = '<div class="camera-film-counter"><span id="cameraRollBadge">Unfiled</span><b id="cameraRollCount">0 / 36</b></div>'
index = replace_once(index, counter, counter + '\n          <button type="button" class="secondary-btn camera-controls-done-btn" id="cameraControlsDoneBtn">Done</button>', 'camera controls bottom done')

index = replace_once(index, '<div class="release-badge">BUILD 12.1</div>', '<div class="release-badge">BUILD 12.2</div>', 'release badge')
old_release = '''      <h4>A cleaner camera — stronger Beauty, full-screen shooting, and less unnecessary overhead.</h4>
      <div class="info-list">
        <div><b>♡</b><span>Beauty Only gives you a normal, neutral camera look with smoothing and blemish reduction but no film color grade.</span></div>
        <div><b>◎</b><span>Smooth and Acne / blemish now use a stronger selective skin pass, including better handling of red and darker uneven spots.</span></div>
        <div><b>⛶</b><span>Full camera view expands the live preview to the whole iPhone-style screen while keeping shutter, mode, ratio, timer, grid, and flip controls reachable.</span></div>
        <div><b>⚡</b><span>The retired motion-photo recorder has been removed entirely, reducing capture complexity and storage overhead while the heavy Beauty pass still runs only on saved stills / Develop.</span></div>
      </div>'''
new_release = '''      <h4>Beauty that actually shows — plus Camera controls you can always close.</h4>
      <div class="info-list">
        <div><b>◎</b><span>Smooth is visibly stronger at higher settings while saved photos still use selective skin masking instead of simply blurring the entire frame.</span></div>
        <div><b>♡</b><span>Acne / blemish now reacts more aggressively to local texture, redness, and darker uneven spots, especially from 60–100.</span></div>
        <div><b>✓</b><span>Camera controls now have sticky Done controls at the top and bottom, so the sheet can always be collapsed even on smaller iPhones.</span></div>
        <div><b>⚡</b><span>The live Beauty preview remains lightweight for smooth shooting; the stronger selective pass runs on saved stills and in Develop.</span></div>
      </div>'''
index = replace_once(index, old_release, new_release, 'What’s New Build 12.2')
write('index.html', index)


# ---------------- style.css ----------------
css = read('style.css')
css += r'''

/* === BUILD 12.2: CLOSABLE CAMERA CONTROLS + STRONGER BEAUTY UX === */
body.camera-mode .camera-advanced-panel{
  max-height:min(58dvh,640px);
  overflow-y:auto;
  overscroll-behavior:contain;
  -webkit-overflow-scrolling:touch;
  padding:0 12px 12px;
  scrollbar-width:none;
}
body.camera-mode .camera-advanced-panel::-webkit-scrollbar{display:none}
body.camera-mode .camera-advanced-panel .advanced-panel-head{
  position:sticky;
  top:0;
  z-index:5;
  margin:0 -12px 10px;
  padding:11px 12px 10px;
  background:rgba(255,250,246,.985);
  border-bottom:1px solid var(--hairline);
  backdrop-filter:blur(18px);
}
.advanced-panel-head>div{display:grid;gap:2px;min-width:0}
.advanced-panel-head>div span{display:block}
.camera-controls-close-btn{
  flex:none;
  min-width:58px;
  min-height:36px;
  border:1px solid rgba(183,110,121,.34);
  border-radius:999px;
  background:#fff8f4;
  color:var(--rose-dark);
  font-size:10px;
  font-weight:800;
  padding:7px 12px;
  touch-action:manipulation;
}
.camera-controls-close-btn:active{transform:scale(.97)}
.camera-controls-done-btn{width:100%;margin-top:10px;min-height:42px}
body.camera-controls-open .camera-look-section{position:relative;z-index:2}
@media(max-height:760px){
  body.camera-mode .camera-advanced-panel{max-height:55dvh!important}
}
'''
write('style.css', css)


# ---------------- service workers ----------------
for path in ('service-worker.js','sw.js'):
    sw = read(path)
    sw = replace_once(sw, "kira-build12-1-retire-live-20260814", "kira-build12-2-beauty-controls-20260814", f'{path} cache')
    write(path, sw)

print('Kira 12.2 patch applied.')
