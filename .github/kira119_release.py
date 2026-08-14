from pathlib import Path
import re

APP=Path('app.js')
INDEX=Path('index.html')
STYLE=Path('style.css')
SW=Path('service-worker.js')
SW_ALIAS=Path('sw.js')
app=APP.read_text()
index=INDEX.read_text()
style=STYLE.read_text()
sw=SW.read_text()
sw_alias=SW_ALIAS.read_text()

def once(text, old, new, label):
    count=text.count(old)
    if count!=1:
        raise SystemExit(f'{label}: expected exactly 1 match, found {count}')
    return text.replace(old,new,1)

def regex_once(text, pattern, replacement, label, flags=0):
    new,count=re.subn(pattern,replacement,text,count=1,flags=flags)
    if count!=1:
        raise SystemExit(f'{label}: expected exactly 1 regex match, found {count}')
    return new

# --- Beauty state / persistence ---
app=once(app,
"  const defaultEffects=()=>({grain:0,grainType:'Classic',bloom:0,bloomType:'Soft',dust:0,scratches:0,leak:0,leakType:'Pink',rgbSplit:0,noise:0,sparkle:0,sparkleType:'Star'});\n  const defaultSettings=",
"  const defaultEffects=()=>({grain:0,grainType:'Classic',bloom:0,bloomType:'Soft',dust:0,scratches:0,leak:0,leakType:'Pink',rgbSplit:0,noise:0,sparkle:0,sparkleType:'Star'});\n  const defaultBeauty=()=>({smooth:0,blemish:0,redness:0,brighten:0,glow:0});\n  const loadBeauty=()=>{try{const v=JSON.parse(localStorage.getItem('kira.beauty')||'{}');return Object.assign(defaultBeauty(),v&&typeof v==='object'?v:{})}catch(e){return defaultBeauty()}};\n  const defaultSettings=",
'beauty state helpers')

beauty_looks="""
    // Build 11.9 — cute flattering looks with adjustable beauty profiles.
    ['Barely Blush','Beauty','#a87d82,#ead1c9',{brightness:6,contrast:-5,saturation:-5,warmth:4,tint:7,fade:4,bloom:4,beauty:{smooth:18,blemish:34,redness:18,brighten:7,glow:7}}],
    ['Peach Cream','Beauty','#bd8371,#f2c9aa',{brightness:9,contrast:-6,saturation:2,warmth:15,tint:5,fade:5,bloom:7,beauty:{smooth:28,blemish:45,redness:24,brighten:12,glow:12}}],
    ['Rosy Milk','Beauty','#ad7081,#f4d4d8',{brightness:12,contrast:-10,saturation:-4,warmth:4,tint:14,fade:9,bloom:11,beauty:{smooth:32,blemish:50,redness:22,brighten:14,glow:17}}],
    ['Pink Cloud','Beauty','#a86e94,#ebc9e2',{brightness:12,contrast:-11,saturation:1,warmth:-4,tint:20,fade:10,bloom:14,beauty:{smooth:38,blemish:55,redness:24,brighten:16,glow:22}}],
    ['Angel Skin','Beauty','#8f879d,#efe5ed',{brightness:15,contrast:-12,saturation:-12,warmth:-9,tint:11,fade:11,bloom:18,beauty:{smooth:45,blemish:62,redness:34,brighten:20,glow:25}}],
    ['Fresh Skin','Beauty','#7e8e7d,#e5dcc8',{brightness:8,contrast:-3,saturation:-6,warmth:3,tint:-4,fade:3,beauty:{smooth:18,blemish:38,redness:32,brighten:10,glow:5}}],
    ['Vanilla Glow','Beauty','#a58a72,#ead8bd',{brightness:12,contrast:-7,saturation:-8,warmth:13,tint:2,fade:8,bloom:13,beauty:{smooth:35,blemish:55,redness:28,brighten:16,glow:21}}],
    ['Cherry Kiss','Beauty','#a65f74,#efb9c5',{brightness:9,contrast:1,saturation:9,warmth:4,tint:18,bloom:7,beauty:{smooth:28,blemish:48,redness:16,brighten:12,glow:12}}],
    ['Sakura Skin','Beauty','#b47d8d,#f2ccd6',{brightness:11,contrast:-8,saturation:-2,warmth:3,tint:15,fade:7,bloom:10,beauty:{smooth:31,blemish:50,redness:20,brighten:13,glow:16}}],
    ['Soft Princess','Beauty','#8e729d,#e6c9ed',{brightness:13,contrast:-8,saturation:5,warmth:-8,tint:21,bloom:14,beauty:{smooth:42,blemish:60,redness:24,brighten:18,glow:23}}],
    ['Baby Pink Flash','Beauty','#a66f7e,#f8d6dc',{brightness:17,contrast:7,saturation:3,warmth:-4,tint:13,bloom:18,bloomType:'Flash',beauty:{smooth:38,blemish:56,redness:20,brighten:20,glow:20}}],
    ['Clean Daylight','Beauty','#80857e,#eee2d0',{brightness:10,contrast:-1,saturation:-9,warmth:5,tint:-2,beauty:{smooth:22,blemish:45,redness:30,brighten:11,glow:6}}],
    ['Porcelain Cool','Beauty','#78889b,#e0e8ef',{brightness:14,contrast:0,saturation:-14,warmth:-18,tint:5,castColor:'#b9d0e3',castStrength:10,castMode:'soft-light',beauty:{smooth:40,blemish:60,redness:35,brighten:18,glow:15}}],
    ['Honey Glow','Beauty','#9d744e,#edc88d',{brightness:10,contrast:0,saturation:5,warmth:24,tint:-1,bloom:10,beauty:{smooth:26,blemish:45,redness:22,brighten:12,glow:18}}],
    ['Creamy Cafe','Beauty','#8f796e,#dfc7b5',{brightness:8,contrast:-8,saturation:-12,warmth:10,tint:3,fade:8,beauty:{smooth:24,blemish:42,redness:20,brighten:9,glow:10}}],
    ['Dreamy Selfie','Beauty','#8f718d,#e7c4d6',{brightness:13,contrast:-10,saturation:1,warmth:-2,tint:16,fade:8,bloom:16,beauty:{smooth:40,blemish:58,redness:24,brighten:18,glow:24}}],
    ['Icy Pink','Beauty','#7b7696,#dfd5ee',{brightness:12,contrast:1,saturation:-2,warmth:-18,tint:18,hue:6,castColor:'#b9a8db',castStrength:12,castMode:'soft-light',beauty:{smooth:34,blemish:52,redness:28,brighten:16,glow:15}}],
    ['Warm Selfie','Beauty','#a97968,#efc1a8',{brightness:11,contrast:2,saturation:5,warmth:19,tint:6,bloom:8,beauty:{smooth:30,blemish:50,redness:20,brighten:14,glow:14}}],
"""
anchor="    // Build 11.8 — deliberately varied lo-fi camera, recolor, mono, and flash/night packs.\n"
app=once(app,anchor,beauty_looks+"\n"+anchor,'beauty preset insertion')

app=once(app,
"    adjustments:defaultAdjust(),effects:defaultEffects(),frame:'None'",
"    adjustments:defaultAdjust(),effects:defaultEffects(),beauty:loadBeauty(),frame:'None'",
'beauty in state')

app=once(app,
"  const effectDefs=[['grain','◌','Grain'],['bloom','✦','Bloom'],['dust','⠿','Dust'],['scratches','╱','Scratches'],['leak','◒','Light Leak'],['rgbSplit','RGB','RGB Split'],['noise','▦','CCD Noise'],['sparkle','✧','Sparkle']];",
"  const effectDefs=[['grain','◌','Grain'],['bloom','✦','Bloom'],['dust','⠿','Dust'],['scratches','╱','Scratches'],['leak','◒','Light Leak'],['rgbSplit','RGB','RGB Split'],['noise','▦','CCD Noise'],['sparkle','✧','Sparkle']];\n  const beautyDefs=[['smooth','Smooth skin'],['blemish','Acne / blemish'],['redness','Redness'],['brighten','Brighten'],['glow','Glow']];",
'beauty defs')

app=once(app,
"  function saveSettings(){localStorage.setItem('kira.settings',JSON.stringify(state.settings));localStorage.setItem('kira.favoriteFilters',JSON.stringify([...state.favoriteFilters]));if(state.settings.rememberFilter)localStorage.setItem('kira.lastFilter',state.activeFilter)}",
"  function saveSettings(){localStorage.setItem('kira.settings',JSON.stringify(state.settings));localStorage.setItem('kira.favoriteFilters',JSON.stringify([...state.favoriteFilters]));if(state.settings.rememberFilter)localStorage.setItem('kira.lastFilter',state.activeFilter)}\n  function saveBeauty(){localStorage.setItem('kira.beauty',JSON.stringify(Object.assign(defaultBeauty(),state.beauty||{})))}",
'beauty persistence')

old_snapshot="function editSnapshot(){return JSON.parse(JSON.stringify({activeFilter:state.activeFilter,filterIntensity:state.filterIntensity,adjustments:state.adjustments,effects:state.effects,frame:state.frame"
new_snapshot="function editSnapshot(){return JSON.parse(JSON.stringify({activeFilter:state.activeFilter,filterIntensity:state.filterIntensity,adjustments:state.adjustments,effects:state.effects,beauty:state.beauty,frame:state.frame"
app=once(app,old_snapshot,new_snapshot,'beauty snapshot')

app=once(app,
"function applySnapshot(s){Object.assign(state,JSON.parse(JSON.stringify(s||{})));if(!state.captionFont)",
"function applySnapshot(s){Object.assign(state,JSON.parse(JSON.stringify(s||{})));state.beauty=Object.assign(defaultBeauty(),state.beauty||{});if(!state.captionFont)",
'beauty snapshot fallback')
app=once(app,
"renderAllPanels();renderPhoto();applyLiveFilter();updateHistoryButtons();saveSettings()}",
"renderAllPanels();renderPhoto();applyLiveFilter();syncCameraBeautyControls();updateHistoryButtons();saveBeauty();saveSettings()}",
'beauty snapshot sync')

# Beauty category in Camera + Develop.
old_cats="const cats=['Kira','Mood','Lo-Fi','Recolor','Mono','Flash Night','Recent','Favorites','Camera Packs','Instant','Vintage','Date Cam','Film','Film Stock','CCD','Y2K','Dream','Japan','My Recipes','All'];"
new_cats="const cats=['Kira','Beauty','Mood','Lo-Fi','Recolor','Mono','Flash Night','Recent','Favorites','Camera Packs','Instant','Vintage','Date Cam','Film','Film Stock','CCD','Y2K','Dream','Japan','My Recipes','All'];"
if app.count(old_cats)!=2:
    raise SystemExit(f'beauty category arrays: expected 2 matches, found {app.count(old_cats)}')
app=app.replace(old_cats,new_cats)

# Beauty presets set a starting beauty profile, while ordinary filters leave manual beauty untouched.
app=once(app,
"if(p.autoDate){state.dateEnabled=true;state.dateStyle=p.autoDate.style||'Classic';state.dateColor=p.autoDate.color||'Orange';state.datePosition=p.autoDate.position||'Bottom Right';state.dateValue=today();state.presetAutoDate=true}else state.presetAutoDate=false;updateLiveDateStamp()}",
"if(p.autoDate){state.dateEnabled=true;state.dateStyle=p.autoDate.style||'Classic';state.dateColor=p.autoDate.color||'Orange';state.datePosition=p.autoDate.position||'Bottom Right';state.dateValue=today();state.presetAutoDate=true}else state.presetAutoDate=false;if(p.beauty){state.beauty=Object.assign(defaultBeauty(),p.beauty);saveBeauty();syncCameraBeautyControls()}updateLiveDateStamp()}",
'beauty preset profile')

# Develop Beauty panel + Camera binding helpers.
beauty_functions=r'''  function beautyActive(){const b=state.beauty||defaultBeauty();return beautyDefs.some(([k])=>Number(b[k]||0)>0)}
  function syncCameraBeautyControls(){const b=Object.assign(defaultBeauty(),state.beauty||{});for(const [k] of beautyDefs){const input=$(`[data-camera-beauty="${k}"]`),out=$(`[data-camera-beauty-out="${k}"]`);if(input&&Number(input.value)!==Number(b[k]))input.value=b[k];if(out)out.textContent=b[k]}const badge=$('#cameraBeautyBadge');if(badge){const max=Math.max(...beautyDefs.map(([k])=>Number(b[k]||0)));badge.textContent=max?`On • ${max}`:'Off'}}
  function bindCameraBeautyControls(){const wrap=$('#cameraBeautyControls');if(!wrap||wrap.dataset.bound==='1')return;wrap.dataset.bound='1';$$('[data-camera-beauty]',wrap).forEach(inp=>{inp.oninput=()=>{const key=inp.dataset.cameraBeauty;state.beauty[key]=Number(inp.value);const out=$(`[data-camera-beauty-out="${key}"]`,wrap);if(out)out.textContent=inp.value;syncCameraBeautyControls();scheduleLiveFilter();if($('#screen-develop')?.classList.contains('active'))scheduleRender()};inp.onchange=()=>{saveBeauty();renderBeautyPanel()}});$('#cameraBeautyResetBtn')&&( $('#cameraBeautyResetBtn').onclick=()=>{state.beauty=defaultBeauty();saveBeauty();syncCameraBeautyControls();renderBeautyPanel();scheduleLiveFilter();if($('#screen-develop')?.classList.contains('active'))renderPhoto();toast('Beauty reset')});syncCameraBeautyControls()}
  function renderBeautyPanel(){const area=$('#tool-beauty');if(!area)return;state.beauty=Object.assign(defaultBeauty(),state.beauty||{});area.innerHTML=`<div class="beauty-panel-card"><div class="beauty-panel-head"><div><strong>Beauty</strong><small>adjustable • keep it as natural or strong as you like</small></div><span>${beautyActive()?'On':'Off'}</span></div><div class="slider-list beauty-slider-list">${beautyDefs.map(([k,l])=>`<div class="slider-row"><label>${l}</label><input data-beauty="${k}" type="range" min="0" max="100" value="${state.beauty[k]}"><output id="beauty-out-${k}">${state.beauty[k]}</output></div>`).join('')}</div><div class="beauty-help">Acne / blemish targets uneven red or dark skin texture while Smooth softens overall skin. The saved photo uses Kira’s selective skin pass; the live camera stays intentionally lightweight.</div><button class="secondary-btn" id="resetBeautyBtn">Reset beauty</button></div>`;$$('[data-beauty]',area).forEach(inp=>{rangeHistory(inp);inp.oninput=()=>{state.beauty[inp.dataset.beauty]=Number(inp.value);$('#beauty-out-'+inp.dataset.beauty).textContent=inp.value;scheduleRender();syncCameraBeautyControls();scheduleLiveFilter()};inp.onchange=()=>{finishRangeHistory();saveBeauty();renderBeautyPanel()}});$('#resetBeautyBtn').onclick=()=>{commit();state.beauty=defaultBeauty();saveBeauty();renderBeautyPanel();syncCameraBeautyControls();renderPhoto();scheduleLiveFilter();toast('Beauty reset')};}
'''
app=once(app,"  function renderEffectsPanel(){",beauty_functions+"\n  function renderEffectsPanel(){",'beauty panel functions')

app=once(app,
"function renderAllPanels(){renderCategories();renderFilters();renderAdjustmentPanel();renderEffectsPanel();",
"function renderAllPanels(){renderCategories();renderFilters();renderAdjustmentPanel();renderBeautyPanel();renderEffectsPanel();",
'beauty panel in renderAllPanels')

# Selective skin/blemish pass. It operates on a small alpha overlay so non-skin details remain full-resolution.
beauty_renderer=r'''  function skinConfidence(r,g,b){const y=.299*r+.587*g+.114*b;if(y<16||y>250)return 0;const cb=128-.168736*r-.331264*g+.5*b,cr=128+.5*r-.418688*g-.081312*b;const cbScore=1-clamp(Math.abs(cb-110)/48,0,1),crScore=1-clamp(Math.abs(cr-152)/52,0,1);const spread=Math.max(r,g,b)-Math.min(r,g,b);if(spread<3)return 0;return clamp(Math.min(cbScore,crScore)*1.45,0,1)}
  function applyBeautyPass(ctx,w,h,beauty=state.beauty){const b=Object.assign(defaultBeauty(),beauty||{});if(state.compare||!beautyDefs.some(([k])=>Number(b[k]||0)>0))return;const maxSide=Math.max(w,h),target=Math.min(maxSide,760),scale=target/maxSide,tw=Math.max(1,Math.round(w*scale)),th=Math.max(1,Math.round(h*scale));const src=applyBeautyPass.src||(applyBeautyPass.src=document.createElement('canvas')),blur=applyBeautyPass.blur||(applyBeautyPass.blur=document.createElement('canvas')),layer=applyBeautyPass.layer||(applyBeautyPass.layer=document.createElement('canvas'));for(const c of [src,blur,layer]){if(c.width!==tw)c.width=tw;if(c.height!==th)c.height=th}const sctx=src.getContext('2d',{alpha:false}),bctx=blur.getContext('2d',{alpha:false}),lctx=layer.getContext('2d');if(!sctx||!bctx||!lctx)return;sctx.clearRect(0,0,tw,th);sctx.imageSmoothingEnabled=true;sctx.drawImage(ctx.canvas,0,0,w,h,0,0,tw,th);const radius=1.5+Number(b.smooth||0)*.055+Number(b.blemish||0)*.045;bctx.clearRect(0,0,tw,th);bctx.filter=`blur(${Math.min(9,radius).toFixed(2)}px)`;bctx.drawImage(src,0,0);bctx.filter='none';let orig,soft;try{orig=sctx.getImageData(0,0,tw,th);soft=bctx.getImageData(0,0,tw,th)}catch(e){return}const out=lctx.createImageData(tw,th),od=orig.data,sd=soft.data,dd=out.data,sm=clamp(Number(b.smooth||0)/100,0,1),bl=clamp(Number(b.blemish||0)/100,0,1),red=clamp(Number(b.redness||0)/100,0,1),bright=clamp(Number(b.brighten||0)/100,0,1),glow=clamp(Number(b.glow||0)/100,0,1);for(let i=0;i<od.length;i+=4){const r=od[i],g=od[i+1],bb=od[i+2],skin=skinConfidence(r,g,bb);if(skin<.05)continue;const sr=sd[i],sg=sd[i+1],sb=sd[i+2],detail=(Math.abs(r-sr)+Math.abs(g-sg)+Math.abs(bb-sb))/3,redExcess=Math.max(0,r-(g+bb)*.5),blemishTarget=clamp((detail-4)/34+redExcess/65,0,1);const soften=clamp(sm*.48+bl*.78*blemishTarget,0,.9);let rr=r+(sr-r)*soften,gg=g+(sg-g)*soften,bbb=bb+(sb-bb)*soften;if(red>0){const excess=Math.max(0,rr-(gg+bbb)*.5);rr-=excess*red*.62;gg+=excess*red*.08}if(bright>0){const lift=(8+18*(1-(.299*rr+.587*gg+.114*bbb)/255))*bright;rr+=lift;gg+=lift*.96;bbb+=lift*.92}if(glow>0){rr+=(255-rr)*glow*.045;gg+=(245-gg)*glow*.04;bbb+=(242-bbb)*glow*.04}const alpha=clamp(skin*(sm*.42+bl*.56*blemishTarget+red*.24+bright*.22+glow*.20),0,.88);dd[i]=clamp(rr,0,255);dd[i+1]=clamp(gg,0,255);dd[i+2]=clamp(bbb,0,255);dd[i+3]=Math.round(alpha*255)}lctx.clearRect(0,0,tw,th);lctx.putImageData(out,0,0);ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(layer,0,0,tw,th,0,0,w,h);if(glow>0){ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.09,glow*.09);ctx.filter=`blur(${Math.max(1,w/700)}px)`;ctx.drawImage(layer,0,0,tw,th,0,0,w,h);ctx.filter='none'}ctx.restore()}
'''
app=once(app,"  function applyPresetCast(ctx,w,h,p){",beauty_renderer+"\n  function applyPresetCast(ctx,w,h,p){",'beauty renderer insertion')

# Beauty occurs before destructive texture/grain so skin cleanup still looks like the selected camera/film afterwards.
app=once(app,
"    if(p.bloom>0)applyBloom(ctx,canvas,w,h,p.bloom,p.bloomType);\n    if(p.rgbSplit>0)applyRGBSplit(ctx,canvas,w,h,p.rgbSplit);",
"    if(p.bloom>0)applyBloom(ctx,canvas,w,h,p.bloom,p.bloomType);\n    applyBeautyPass(ctx,w,h,state.beauty);\n    if(p.rgbSplit>0)applyRGBSplit(ctx,canvas,w,h,p.rgbSplit);",
'beauty in Develop renderer')

app=once(app,
"function withVisualSnapshot(snapshot,fn){const keys=['frame'",
"function withVisualSnapshot(snapshot,fn){const keys=['beauty','frame'",
'beauty capture snapshot')

app=once(app,
"if(p.bloom>0&&p.bloom<40){ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.16,p.bloom/180);ctx.filter='blur(3px) brightness(114%)';ctx.drawImage(source,0,0,w,h);ctx.filter='none';ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}if(p.rgbSplit>0)",
"if(p.bloom>0&&p.bloom<40){ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.16,p.bloom/180);ctx.filter='blur(3px) brightness(114%)';ctx.drawImage(source,0,0,w,h);ctx.filter='none';ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}applyBeautyPass(ctx,w,h,state.beauty);if(p.rgbSplit>0)",
'beauty in camera capture renderer')

# Lightweight live approximation; the expensive selective pass only runs on stills/Develop.
new_apply_live="""  function applyLiveFilter(){const video=$('#cameraVideo');if(!video)return;const p=currentLiveParams(),b=Object.assign(defaultBeauty(),state.beauty||{}),beautyBlur=Math.min(.72,Number(b.smooth||0)*.0045+Number(b.blemish||0)*.0022),beautyBright=Number(b.brighten||0)*.045,beautySat=Math.max(94,100-Number(b.redness||0)*.045);video.style.filter=`${cameraCssFromParams(p)} brightness(${(100+beautyBright).toFixed(2)}%) saturate(${beautySat.toFixed(2)}%) blur(${beautyBlur.toFixed(2)}px)`;video.style.imageRendering=Number(p.lowRes||0)>55?'pixelated':'auto';const tone=$('#liveToneOverlay'),fade=$('#liveFadeOverlay'),vig=$('#liveVignetteOverlay'),texture=$('#liveTextureOverlay');if(tone){if(p.castColor&&Number(p.castStrength)>0){tone.style.background=p.castColor;tone.style.opacity=String(Math.min(.55,Number(p.castStrength)/100));tone.style.mixBlendMode=p.castMode||'soft-light'}else{const warm=Number(p.warmth||0),tint=Number(p.tint||0);let c='255,151,94',op=Math.min(.28,Math.abs(warm)/115);if(warm<0)c='76,145,205';if(Math.abs(tint)>Math.abs(warm)){c=tint>0?'230,112,155':'92,162,118';op=Math.min(.22,Math.abs(tint)/135)}tone.style.background=`rgb(${c})`;tone.style.opacity=String(op);tone.style.mixBlendMode='soft-light'}}if(fade)fade.style.opacity=String(Math.min(.28,Math.max(0,p.fade||0)/130));if(vig)vig.style.opacity=String(Math.min(.62,Math.max(0,p.vignette||0)/58));if(texture){const scan=Number(p.scanlines||0),low=Number(p.lowRes||0),layers=[];if(scan>0)layers.push('repeating-linear-gradient(to bottom,rgba(255,255,255,.08) 0 1px,rgba(0,0,0,.20) 1px 2px,transparent 2px 5px)');if(low>22)layers.push('repeating-linear-gradient(to right,rgba(255,255,255,.035) 0 1px,transparent 1px 4px)');texture.style.background=layers.length?layers.join(','):'none';texture.style.opacity=String(layers.length?Math.min(.30,scan/150+low/500):0);texture.style.mixBlendMode='overlay'}syncCameraBeautyControls()}"""
app=regex_once(app,r"  function applyLiveFilter\(\)\{.*?\n  function updateCameraViewport",new_apply_live+"\n  function updateCameraViewport",'live beauty preview',re.S)

# Bind camera Beauty controls exactly once.
app=once(app,
"  function bindInputs(){bindRollGridInteractions();",
"  function bindInputs(){bindRollGridInteractions();bindCameraBeautyControls();",
'camera beauty binding')

# --- HTML ---
index=once(index,
"          <div class=\"live-camera-controls cleaned\">\n            <button class=\"camera-heart-btn\" id=\"cameraFavoriteBtn\" title=\"Favorite active filter\">♡</button>\n            <div class=\"live-intensity-control\">\n              <div class=\"control-head\"><span>Filter strength</span><b id=\"liveIntensityValue\">100</b></div>\n              <input id=\"liveFilterIntensity\" type=\"range\" min=\"0\" max=\"100\" value=\"100\">\n            </div>\n          </div>",
"          <div class=\"live-camera-controls cleaned\">\n            <button class=\"camera-heart-btn\" id=\"cameraFavoriteBtn\" title=\"Favorite active filter\">♡</button>\n            <div class=\"live-intensity-control\">\n              <div class=\"control-head\"><span>Filter strength</span><b id=\"liveIntensityValue\">100</b></div>\n              <input id=\"liveFilterIntensity\" type=\"range\" min=\"0\" max=\"100\" value=\"100\">\n            </div>\n          </div>\n          <details class=\"camera-beauty-details\">\n            <summary><span>Beauty</span><b id=\"cameraBeautyBadge\">Off</b></summary>\n            <div class=\"camera-beauty-controls\" id=\"cameraBeautyControls\">\n              <div class=\"camera-beauty-row\"><label>Smooth</label><input data-camera-beauty=\"smooth\" type=\"range\" min=\"0\" max=\"100\" value=\"0\"><output data-camera-beauty-out=\"smooth\">0</output></div>\n              <div class=\"camera-beauty-row\"><label>Acne</label><input data-camera-beauty=\"blemish\" type=\"range\" min=\"0\" max=\"100\" value=\"0\"><output data-camera-beauty-out=\"blemish\">0</output></div>\n              <div class=\"camera-beauty-row\"><label>Redness</label><input data-camera-beauty=\"redness\" type=\"range\" min=\"0\" max=\"100\" value=\"0\"><output data-camera-beauty-out=\"redness\">0</output></div>\n              <div class=\"camera-beauty-row\"><label>Brighten</label><input data-camera-beauty=\"brighten\" type=\"range\" min=\"0\" max=\"100\" value=\"0\"><output data-camera-beauty-out=\"brighten\">0</output></div>\n              <div class=\"camera-beauty-row\"><label>Glow</label><input data-camera-beauty=\"glow\" type=\"range\" min=\"0\" max=\"100\" value=\"0\"><output data-camera-beauty-out=\"glow\">0</output></div>\n              <button class=\"secondary-btn compact-btn\" id=\"cameraBeautyResetBtn\">Reset Beauty</button>\n              <small>Live preview is lightweight. Saved photos use Kira’s selective skin/blemish pass.</small>\n            </div>\n          </details>",
'camera beauty controls html')

index=once(index,
"          <button class=\"tool-tab active\" data-tool=\"filter\">Looks</button>\n          <button class=\"tool-tab\" data-tool=\"adjust\">Adjust</button>",
"          <button class=\"tool-tab active\" data-tool=\"filter\">Looks</button>\n          <button class=\"tool-tab\" data-tool=\"beauty\">Beauty</button>\n          <button class=\"tool-tab\" data-tool=\"adjust\">Adjust</button>",
'Beauty Develop tab')
index=once(index,
"        <div class=\"tool-panel\" id=\"tool-adjust\"></div>",
"        <div class=\"tool-panel\" id=\"tool-beauty\"></div>\n        <div class=\"tool-panel\" id=\"tool-adjust\"></div>",
'Beauty Develop panel')

index=index.replace('style.css?v=11.0.0','style.css?v=11.9.0',1)
index=index.replace('app.js?v=11.8.0','app.js?v=11.9.0',1)
index=index.replace('<div class="setting-row"><span>Current version</span><b>Build 11.8</b></div>','<div class="setting-row"><span>Current version</span><b>Build 11.9</b></div>',1)

old_whats=re.search(r'<div class="release-badge">BUILD 11\.8</div>.*?</div>\n    </div>\n  </div>\n\n  <div class="modal-backdrop hidden" id="helpModal">',index,re.S)
if not old_whats:
    raise SystemExit('What’s New Build 11.8 block not found')
new_whats='''<div class="release-badge">BUILD 11.9</div>
      <h4>Beauty that stays adjustable — including acne / blemish softening.</h4>
      <div class="info-list">
        <div><b>♡</b><span>Eighteen new cute Beauty looks, from Barely Blush and Rosy Milk to Soft Princess, Sakura Skin, and Dreamy Selfie.</span></div>
        <div><b>100</b><span>Five independent 0–100 beauty controls: Smooth skin, Acne / blemish, Redness, Brighten, and Glow.</span></div>
        <div><b>◎</b><span>Acne / blemish selectively softens uneven red or dark skin texture instead of simply blurring the whole photo.</span></div>
        <div><b>◐</b><span>Beauty settings are preserved in captures, Undo / Redo, and Film Lab recipes.</span></div>
        <div><b>⚡</b><span>The live camera uses a lightweight approximation; the selective beauty pass runs only for still photos and Develop to protect iPhone camera smoothness.</span></div>
        <div><b>□</b><span>Beauty starts at zero on a clean install and can be reset at any time.</span></div>
      </div>
    </div>
  </div>

  <div class="modal-backdrop hidden" id="helpModal">'''
index=index[:old_whats.start()]+new_whats+index[old_whats.end():]

# --- CSS ---
style=style.replace('.clean-tool-tabs{display:grid;grid-template-columns:repeat(6,1fr);', '.clean-tool-tabs{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));',1)
style=style.replace('.clean-tool-tabs .tool-tab{border-radius:12px;padding:8px 2px;font-size:9px}', '.clean-tool-tabs .tool-tab{border-radius:12px;padding:8px 1px;font-size:8px}',1)
style += r'''

/* === BUILD 11.9: ADJUSTABLE BEAUTY === */
.camera-beauty-details{margin-top:9px;border-top:1px solid var(--hairline);padding-top:8px}
.camera-beauty-details>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;color:var(--rose-dark);font-size:10px;font-weight:800}
.camera-beauty-details>summary::-webkit-details-marker{display:none}.camera-beauty-details>summary:after{content:'⌄';color:#a17e80}.camera-beauty-details[open]>summary:after{content:'⌃'}
.camera-beauty-details>summary b{margin-left:auto;background:var(--paper);padding:4px 7px;border-radius:999px;font-size:8px;color:#8f7072}
.camera-beauty-controls{display:grid;gap:7px;margin-top:9px;padding:9px;background:rgba(255,255,255,.42);border:1px solid var(--hairline);border-radius:15px}
.camera-beauty-row{display:grid;grid-template-columns:58px minmax(0,1fr) 28px;gap:7px;align-items:center}.camera-beauty-row label,.camera-beauty-row output{font-size:8px}.camera-beauty-row output{text-align:right;font-weight:800;color:var(--rose-dark)}
.camera-beauty-controls small{font-size:8px;line-height:1.4;color:#927477}.camera-beauty-controls .compact-btn{width:100%;padding:8px}
.beauty-panel-card{display:grid;gap:10px;background:var(--soft-surface);border:1px solid var(--hairline);border-radius:20px;padding:12px}.beauty-panel-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.beauty-panel-head strong{display:block;font-family:Georgia,serif;color:var(--rose-dark);font-size:18px}.beauty-panel-head small{display:block;font-size:8px;color:#98797b;margin-top:2px}.beauty-panel-head>span{background:var(--paper);border-radius:999px;padding:5px 8px;font-size:8px;color:var(--rose-dark);font-weight:800}.beauty-slider-list{padding:0;border:0;background:transparent}.beauty-help{font-size:9px;line-height:1.5;color:#8d7072;background:rgba(239,226,212,.65);border-radius:13px;padding:9px}
@media(max-width:360px){.clean-tool-tabs .tool-tab{font-size:7px;padding-left:0;padding-right:0}.camera-beauty-row{grid-template-columns:52px minmax(0,1fr) 24px}}
'''

# --- PWA version/cache ---
app=re.sub(r"service-worker\.js\?v=11\.8\.0","service-worker.js?v=11.9.0",app,count=1)
old_cache="const CACHE='kira-build11-8-mega-filter-library-20260814';"
new_cache="const CACHE='kira-build11-9-adjustable-beauty-20260814';"
if sw.count(old_cache)!=1 or sw_alias.count(old_cache)!=1:
    raise SystemExit('Build 11.8 cache marker missing')
sw=sw.replace(old_cache,new_cache,1)
sw_alias=sw_alias.replace(old_cache,new_cache,1)

APP.write_text(app)
INDEX.write_text(index)
STYLE.write_text(style)
SW.write_text(sw)
SW_ALIAS.write_text(sw_alias)

# --- Static QA assertions ---
app=APP.read_text(); index=INDEX.read_text(); style=STYLE.read_text(); sw=SW.read_text(); sw_alias=SW_ALIAS.read_text()
assert sw==sw_alias, 'service-worker.js and sw.js diverged'
assert "kira-build11-9-adjustable-beauty-20260814" in sw
assert "service-worker.js?v=11.9.0" in app
assert 'app.js?v=11.9.0' in index and 'style.css?v=11.9.0' in index
beauty_names=['Barely Blush','Peach Cream','Rosy Milk','Pink Cloud','Angel Skin','Fresh Skin','Vanilla Glow','Cherry Kiss','Sakura Skin','Soft Princess','Baby Pink Flash','Clean Daylight','Porcelain Cool','Honey Glow','Creamy Cafe','Dreamy Selfie','Icy Pink','Warm Selfie']
for name in beauty_names:
    assert name in app, name
assert app.count("const cats=['Kira','Beauty','Mood'")==2
for fn in ['renderBeautyPanel','bindCameraBeautyControls','syncCameraBeautyControls','applyBeautyPass','skinConfidence','captureLivePhoto','startVideoRecording','storeRollPhoto','openPhotoModal','syncPhotoCaptionUi','renderInstantCaptionBlob']:
    assert re.search(rf'function\s+{fn}\s*\(',app), f'missing {fn}'
assert 'beauty:state.beauty' in app
assert "const keys=['beauty','frame'" in app
assert 'applyBeautyPass(ctx,w,h,state.beauty)' in app
for key in ['smooth','blemish','redness','brighten','glow']:
    assert f'data-camera-beauty="{key}"' in index, key
assert 'id="tool-beauty"' in index and 'data-tool="beauty"' in index
assert 'BUILD 11.9' in index
assert 'An update is available. Refresh to update.' in index
manifest=app.split('const kira1989GlyphManifest=',1)[1].split(';',1)[0]
expected={'0':'48.png','1':'49.png','2':'50.png','3':'51.png','4':'52.png','5':'53.png','6':'54.png','7':'55.png','8':'56.png','9':'57.png'}
for digit,file in expected.items():
    assert f'"{digit}":{{"file":"{file}"' in manifest, f'1989 digit {digit} mapping changed'
for ch in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz':
    assert f'"{ch}":{{"file":' in manifest, f'1989 glyph missing {ch}'
print('Kira Build 11.9 patch + static QA passed')
