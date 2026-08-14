from pathlib import Path
import re

APP=Path('app.js')
INDEX=Path('index.html')
SW=Path('service-worker.js')
SW_ALIAS=Path('sw.js')
app=APP.read_text()
index=INDEX.read_text()
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

# 48 additional looks: low-quality cameras, recolors, monochrome, and flash/night.
insert_after="""    ['Deep Mono','Mood','#252525,#8f8f8f',{brightness:-12,contrast:40,saturation:-100,highlights:8,shadows:-9,grain:9,grainType:'Classic',sharpness:8,vignette:19}],

    ['Film 100','Film'"""
expanded="""    ['Deep Mono','Mood','#252525,#8f8f8f',{brightness:-12,contrast:40,saturation:-100,highlights:8,shadows:-9,grain:9,grainType:'Classic',sharpness:8,vignette:19}],

    // Build 11.8 — deliberately varied lo-fi camera, recolor, mono, and flash/night packs.
    ['Toy Cam 1998','Lo-Fi','#74675f,#caa98c',{brightness:2,contrast:13,saturation:-8,warmth:11,fade:7,softness:1.1,lowRes:38,noise:15,grain:14,grainType:'Rough',vignette:13}],
    ['Drugstore Flash','Lo-Fi','#75676c,#eedbd5',{brightness:14,contrast:24,saturation:-6,warmth:-4,tint:4,bloom:18,bloomType:'Flash',lowRes:24,noise:12,grain:10,sharpness:5}],
    ['Webcam 2005','Lo-Fi','#5d6470,#a9b2be',{brightness:2,contrast:18,saturation:-18,warmth:-18,tint:4,softness:1.4,lowRes:76,scanlines:18,noise:28,rgbSplit:5,sharpness:3}],
    ['Flip Phone 2007','Lo-Fi','#58636b,#b5ada7',{brightness:4,contrast:21,saturation:-12,warmth:-12,tint:7,softness:.8,lowRes:68,noise:22,rgbSplit:6,sharpness:8}],
    ['MiniDV Tape','Lo-Fi','#4f5d62,#a7a9a0',{contrast:8,saturation:-22,warmth:-12,tint:-3,fade:9,softness:1.2,lowRes:50,scanlines:24,noise:22,rgbSplit:5}],
    ['Pocket CCD','Lo-Fi','#50697c,#b9c3c7',{brightness:7,contrast:16,saturation:4,warmth:-20,tint:4,lowRes:28,noise:18,bloom:8,sharpness:9}],
    ['Low Battery CCD','Lo-Fi','#4c6258,#8fa08f',{brightness:-7,contrast:29,saturation:-18,warmth:-16,tint:-15,castColor:'#4f745d',castStrength:22,castMode:'soft-light',lowRes:46,noise:30,scanlines:9,vignette:20}],
    ['Mall Photo Booth','Lo-Fi','#7d696f,#d5b1b5',{brightness:9,contrast:20,saturation:-4,warmth:2,tint:12,softness:.7,lowRes:35,bloom:11,bloomType:'Flash',noise:14,grain:8}],
    ['Gas Station Disposable','Lo-Fi','#74583f,#c48a5d',{brightness:1,contrast:24,saturation:6,warmth:27,sepia:12,fade:5,lowRes:22,grain:30,grainType:'Rough',dust:8,vignette:18}],
    ['Crushed JPEG','Lo-Fi','#5b5960,#b7aeb4',{contrast:32,saturation:-8,warmth:-5,tint:6,lowRes:88,noise:24,rgbSplit:8,sharpness:14}],
    ['Security Cam','Lo-Fi','#405449,#9caf98',{brightness:3,contrast:35,saturation:-82,warmth:-14,tint:-20,castColor:'#78a083',castStrength:26,castMode:'color',lowRes:82,scanlines:38,noise:32,sharpness:8,vignette:15}],
    ['Old Scanner','Lo-Fi','#7d6c59,#d1b58d',{brightness:10,contrast:5,saturation:-30,warmth:18,sepia:18,fade:16,softness:1.5,lowRes:42,scanlines:8,noise:9,grain:6}],
    ['Washed Pocket Cam','Lo-Fi','#8a8179,#d6d0c7',{brightness:14,contrast:-16,saturation:-32,warmth:3,fade:30,softness:1.2,lowRes:48,noise:12,grain:8}],
    ['Night Bus Digicam','Lo-Fi','#23384c,#876d81',{brightness:-13,contrast:36,saturation:5,warmth:-28,tint:12,castColor:'#214d74',castStrength:30,castMode:'soft-light',lowRes:44,noise:34,bloom:12,vignette:24}],
    ['Cheap Flash Pink','Lo-Fi','#7a586a,#efb4c1',{brightness:16,contrast:27,saturation:14,warmth:-6,tint:20,castColor:'#d85a91',castStrength:20,castMode:'soft-light',lowRes:32,noise:18,bloom:20,bloomType:'Flash',sharpness:7}],
    ['Tape Dub','Lo-Fi','#495257,#9f988f',{brightness:-1,contrast:20,saturation:-32,warmth:-7,tint:-3,fade:4,softness:1.1,lowRes:60,scanlines:34,noise:25,rgbSplit:10,vignette:10}],

    ['Blueberry','Recolor','#4053a3,#91a8ff',{brightness:3,contrast:13,saturation:22,warmth:-25,tint:18,hue:15,castColor:'#5366d8',castStrength:34,castMode:'color',sharpness:4}],
    ['Teal Pop','Recolor','#197a7b,#8be0d2',{brightness:5,contrast:17,saturation:28,warmth:-24,tint:-20,hue:-12,castColor:'#28a9a4',castStrength:30,castMode:'color'}],
    ['Matcha Fade','Recolor','#617851,#c3d39a',{brightness:8,contrast:-4,saturation:-3,warmth:5,tint:-28,hue:-9,castColor:'#8ba46b',castStrength:28,castMode:'color',fade:12,grain:4}],
    ['Lavender Chrome','Recolor','#6a5a9d,#d0b7ff',{brightness:5,contrast:24,saturation:24,warmth:-18,tint:27,hue:20,castColor:'#8c6bd0',castStrength:32,castMode:'color',rgbSplit:4,sharpness:8}],
    ['Cherry Cola','Recolor','#6c2434,#d66a6c',{brightness:-4,contrast:28,saturation:25,warmth:12,tint:24,hue:-8,castColor:'#8c2d3f',castStrength:31,castMode:'color',vignette:12}],
    ['Aqua Flash','Recolor','#238da2,#c5f6f3',{brightness:15,contrast:20,saturation:18,warmth:-30,tint:-14,hue:-15,castColor:'#43bfd0',castStrength:27,castMode:'color',bloom:18,bloomType:'Flash'}],
    ['Peach Soda','Recolor','#d47d69,#ffd2ad',{brightness:12,contrast:4,saturation:21,warmth:25,tint:10,hue:-6,castColor:'#f09a78',castStrength:23,castMode:'soft-light',bloom:6}],
    ['Mint Film','Recolor','#578b79,#c2e3ce',{brightness:8,contrast:5,saturation:-4,warmth:-9,tint:-26,hue:-10,castColor:'#75b79a',castStrength:27,castMode:'color',fade:8,grain:5}],
    ['Silver Cyan','Recolor','#527789,#c4e3e8',{brightness:8,contrast:19,saturation:-32,warmth:-28,tint:-10,hue:-14,castColor:'#6fa9bd',castStrength:28,castMode:'color',sharpness:7}],
    ['Rose Ice','Recolor','#9f6d91,#edd5e7',{brightness:10,contrast:3,saturation:4,warmth:-20,tint:25,hue:10,castColor:'#c48ab4',castStrength:24,castMode:'color',fade:7,bloom:8}],
    ['Golden Glow','Recolor','#9b713a,#f2c675',{brightness:10,contrast:7,saturation:12,warmth:35,tint:-2,sepia:16,castColor:'#dfaa53',castStrength:24,castMode:'soft-light',bloom:10}],
    ['Crimson Night','Recolor','#5f202a,#b4494b',{brightness:-12,contrast:36,saturation:20,warmth:3,tint:22,hue:-9,castColor:'#7e2630',castStrength:35,castMode:'color',vignette:22,noise:5}],
    ['Grape Jelly','Recolor','#5d347e,#c28ad8',{brightness:2,contrast:21,saturation:31,warmth:-17,tint:35,hue:24,castColor:'#7f49a4',castStrength:34,castMode:'color',bloom:6}],
    ['Emerald Haze','Recolor','#28674f,#96c5a8',{brightness:4,contrast:9,saturation:8,warmth:-10,tint:-34,hue:-12,castColor:'#3f8d67',castStrength:31,castMode:'color',fade:8,bloom:5}],
    ['Neon Plum','Recolor','#712f69,#ed71c2',{brightness:1,contrast:31,saturation:42,warmth:-18,tint:38,hue:18,castColor:'#ad3b9a',castStrength:33,castMode:'color',rgbSplit:6,bloom:8}],
    ['Milk Tea','Recolor','#9a7c64,#dfc6a9',{brightness:10,contrast:-8,saturation:-17,warmth:18,tint:1,sepia:10,castColor:'#b99878',castStrength:19,castMode:'soft-light',fade:12,grain:3}],

    ['Soft B&W','Mono','#777777,#dedede',{brightness:9,contrast:2,saturation:-100,highlights:5,shadows:8,fade:7,softness:.4,grain:3,grainType:'Fine'}],
    ['Noir 400','Mono','#202020,#868686',{brightness:-10,contrast:45,saturation:-100,shadows:-10,grain:18,grainType:'Classic',sharpness:10,vignette:23}],
    ['Matte Mono','Mono','#676767,#c7c7c7',{brightness:5,contrast:-8,saturation:-100,fade:22,grain:7,grainType:'Fine'}],
    ['Silver Print','Mono','#828282,#eeeeee',{brightness:12,contrast:17,saturation:-100,highlights:9,shadows:4,grain:5,sharpness:6}],
    ['Flash Mono','Mono','#5e5e5e,#fafafa',{brightness:17,contrast:31,saturation:-100,bloom:16,bloomType:'Flash',grain:8,sharpness:8}],
    ['Cold Mono','Mono','#4d6571,#c5d2d5',{brightness:2,contrast:24,saturation:-100,warmth:-30,castColor:'#668b9d',castStrength:24,castMode:'color',grain:8,vignette:10}],
    ['Warm Mono','Mono','#756455,#d8c3a9',{brightness:5,contrast:15,saturation:-100,warmth:24,sepia:22,castColor:'#a98765',castStrength:20,castMode:'color',grain:9}],
    ['Newspaper','Mono','#555555,#d9d9d9',{brightness:8,contrast:52,saturation:-100,lowRes:45,scanlines:13,grain:15,grainType:'Rough',sharpness:12}],

    ['Club Flash','Flash Night','#53485a,#f0d3e2',{brightness:14,contrast:30,saturation:18,warmth:-8,tint:14,bloom:24,bloomType:'Flash',noise:14,sharpness:8,vignette:11}],
    ['Bathroom Mirror','Flash Night','#69676e,#f7eee9',{brightness:18,contrast:22,saturation:-4,warmth:-12,tint:5,bloom:20,bloomType:'Flash',noise:8,sharpness:10}],
    ['Night Street','Flash Night','#20374d,#8196a9',{brightness:-11,contrast:35,saturation:-8,warmth:-30,tint:2,castColor:'#244e70',castStrength:28,castMode:'soft-light',noise:18,bloom:8,vignette:24}],
    ['Blue Flash','Flash Night','#344e80,#b9d0ff',{brightness:11,contrast:29,saturation:7,warmth:-36,tint:8,castColor:'#4f78c8',castStrength:30,castMode:'color',bloom:20,bloomType:'Flash',noise:9}],
    ['Red Room','Flash Night','#5d1e27,#c05a60',{brightness:-7,contrast:37,saturation:25,warmth:9,tint:23,hue:-7,castColor:'#852834',castStrength:38,castMode:'color',noise:10,vignette:22}],
    ['After Party','Flash Night','#563e57,#d28cac',{brightness:5,contrast:28,saturation:22,warmth:-10,tint:22,castColor:'#8b4e78',castStrength:27,castMode:'color',bloom:16,bloomType:'Flash',noise:20,rgbSplit:4}],
    ['Paparazzi','Flash Night','#646065,#f5e5dd',{brightness:20,contrast:37,saturation:-5,warmth:-7,bloom:27,bloomType:'Flash',grain:7,noise:12,sharpness:13}],
    ['Convenience Flash','Flash Night','#46666c,#e6d5a1',{brightness:13,contrast:26,saturation:8,warmth:-14,tint:-8,castColor:'#5d9a94',castStrength:16,castMode:'soft-light',bloom:14,bloomType:'Flash',noise:9,sharpness:7}],

    ['Film 100','Film'"""
app=once(app,insert_after,expanded,'48-look filter insertion')

old_cats="const cats=['Kira','Mood','Recent','Favorites','Camera Packs','Instant','Vintage','Date Cam','Film','Film Stock','CCD','Y2K','Dream','Japan','My Recipes','All'];"
new_cats="const cats=['Kira','Mood','Lo-Fi','Recolor','Mono','Flash Night','Recent','Favorites','Camera Packs','Instant','Vintage','Date Cam','Film','Film Stock','CCD','Y2K','Dream','Japan','My Recipes','All'];"
if app.count(old_cats)!=2:
    raise SystemExit(f'category lists: expected 2 matches, found {app.count(old_cats)}')
app=app.replace(old_cats,new_cats)

new_filter_params="""  function filterParams(){
    const f=findPreset(state.activeFilter),mix=state.compare?0:state.filterIntensity/100;
    const get=k=>(Number((f.kind==='builtin'?f.p[k]:0)||0)*mix)+(state.compare?0:Number(state.adjustments[k]||0));
    const preset=f.kind==='builtin'?(f.p||{}):{};
    const userGrain=state.compare?0:Number(state.effects.grain||0),userBloom=state.compare?0:Number(state.effects.bloom||0),userLeak=state.compare?0:Number(state.effects.leak||0);
    return {exposure:get('exposure'),brightness:get('brightness'),contrast:get('contrast'),highlights:get('highlights'),shadows:get('shadows'),saturation:get('saturation'),warmth:get('warmth'),tint:get('tint'),fade:get('fade'),sharpness:get('sharpness'),vignette:get('vignette'),sepia:state.compare?0:Number(preset.sepia||0)*mix,hue:state.compare?0:Number(preset.hue||0)*mix,castColor:state.compare?null:(preset.castColor||null),castStrength:state.compare?0:Number(preset.castStrength||0)*mix,castMode:preset.castMode||'soft-light',softness:state.compare?0:Number(preset.softness||0)*mix,lowRes:state.compare?0:Number(preset.lowRes||0)*mix,scanlines:state.compare?0:Number(preset.scanlines||0)*mix,grain:state.compare?0:(Number(preset.grain||0)*mix+userGrain),grainType:userGrain>0?(state.effects.grainType||'Classic'):(preset.grainType||'Classic'),bloom:state.compare?0:(Number(preset.bloom||0)*mix+userBloom),bloomType:userBloom>0?(state.effects.bloomType||'Soft'):(preset.bloomType||'Soft'),dust:state.compare?0:(Number(preset.dust||0)*mix+Number(state.effects.dust||0)),scratches:state.compare?0:(Number(preset.scratches||0)*mix+Number(state.effects.scratches||0)),leak:state.compare?0:(Number(preset.leak||0)*mix+userLeak),leakType:userLeak>0?(state.effects.leakType||'Pink'):(preset.leakType||state.effects.leakType||'Pink'),rgbSplit:state.compare?0:(Number(preset.rgbSplit||0)*mix+Number(state.effects.rgbSplit||0)),noise:state.compare?0:(Number(preset.noise||0)*mix+Number(state.effects.noise||0)),sparkle:state.compare?0:Number(state.effects.sparkle||0),sparkleType:state.effects.sparkleType||'Star'};
  }"""
app=regex_once(app,r"  function filterParams\(\)\{.*?\n  \}\n  let raf=",new_filter_params+'\n  let raf=','filterParams expansion',re.S)

new_snapshot_params="""  function filterParamsForSnapshot(s){
    s=s||{};const f=findPreset(s.activeFilter||state.activeFilter),mix=clamp(Number(s.filterIntensity??100)/100,0,1),a=s.adjustments||{},e=s.effects||{},preset=f.kind==='builtin'?(f.p||{}):{};
    const get=k=>Number(preset[k]||0)*mix+Number(a[k]||0),userGrain=Number(e.grain||0),userBloom=Number(e.bloom||0),userLeak=Number(e.leak||0);
    return {exposure:get('exposure'),brightness:get('brightness'),contrast:get('contrast'),highlights:get('highlights'),shadows:get('shadows'),saturation:get('saturation'),warmth:get('warmth'),tint:get('tint'),fade:get('fade'),sharpness:get('sharpness'),vignette:get('vignette'),sepia:Number(preset.sepia||0)*mix,hue:Number(preset.hue||0)*mix,castColor:preset.castColor||null,castStrength:Number(preset.castStrength||0)*mix,castMode:preset.castMode||'soft-light',softness:Number(preset.softness||0)*mix,lowRes:Number(preset.lowRes||0)*mix,scanlines:Number(preset.scanlines||0)*mix,grain:Number(preset.grain||0)*mix+userGrain,grainType:userGrain>0?(e.grainType||'Classic'):(preset.grainType||'Classic'),bloom:Number(preset.bloom||0)*mix+userBloom,bloomType:userBloom>0?(e.bloomType||'Soft'):(preset.bloomType||'Soft'),dust:Number(preset.dust||0)*mix+Number(e.dust||0),scratches:Number(preset.scratches||0)*mix+Number(e.scratches||0),leak:Number(preset.leak||0)*mix+userLeak,leakType:userLeak>0?(e.leakType||'Pink'):(preset.leakType||e.leakType||'Pink'),rgbSplit:Number(preset.rgbSplit||0)*mix+Number(e.rgbSplit||0),noise:Number(preset.noise||0)*mix+Number(e.noise||0),sparkle:Number(e.sparkle||0),sparkleType:e.sparkleType||'Star'};
  }"""
app=regex_once(app,r"  function filterParamsForSnapshot\(s\)\{.*?\n  \}\n  function withVisualSnapshot",new_snapshot_params+'\n  function withVisualSnapshot','snapshot filter params expansion',re.S)

old_css="  function cameraCssFromParams(p){const br=Math.max(25,100+Number(p.brightness||0)+Number(p.exposure||0)*1.5),co=Math.max(25,100+Number(p.contrast||0)),sa=Math.max(0,100+Number(p.saturation||0));const sep=clamp(Number(p.sepia||0)+(Number(p.warmth||0)>0?Number(p.warmth||0)*.28:0),0,72);const hue=clamp(Number(p.hue||0)+Number(p.tint||0)*.22+(Number(p.warmth||0)<0?-Number(p.warmth||0)*.07:0),-42,42);return `brightness(${br}%) contrast(${co}%) saturate(${sa}%) sepia(${sep}%) hue-rotate(${hue}deg)`}"
new_css="  function cameraCssFromParams(p){const br=Math.max(25,100+Number(p.brightness||0)+Number(p.exposure||0)*1.5),co=Math.max(25,100+Number(p.contrast||0)),sa=Math.max(0,100+Number(p.saturation||0));const sep=clamp(Number(p.sepia||0)+(Number(p.warmth||0)>0?Number(p.warmth||0)*.28:0),0,72);const hue=clamp(Number(p.hue||0)+Number(p.tint||0)*.22+(Number(p.warmth||0)<0?-Number(p.warmth||0)*.07:0),-55,55);const blur=clamp(Number(p.softness||0)+Number(p.lowRes||0)/180,0,3);return `brightness(${br}%) contrast(${co}%) saturate(${sa}%) sepia(${sep}%) hue-rotate(${hue}deg) blur(${blur.toFixed(2)}px)`}"
app=once(app,old_css,new_css,'camera CSS low-fi support')

old_live="""  function liveParamsForPreset(f){if(f.kind==='recipe'&&f.snapshot){return filterParamsForSnapshot(f.snapshot)}const mix=state.filterIntensity/100,p=f.p||{};return {exposure:Number(p.exposure||0)*mix,brightness:Number(p.brightness||0)*mix,contrast:Number(p.contrast||0)*mix,saturation:Number(p.saturation||0)*mix,warmth:Number(p.warmth||0)*mix,tint:Number(p.tint||0)*mix,fade:Number(p.fade||0)*mix,vignette:Number(p.vignette||0)*mix,bloom:Number(p.bloom||0)*mix,sepia:Number(p.sepia||0)*mix,hue:Number(p.hue||0)*mix,castColor:p.castColor||null,castStrength:Number(p.castStrength||0)*mix,castMode:p.castMode||'soft-light'}}
  function currentLiveParams(){const p=filterParams();return {exposure:p.exposure,brightness:p.brightness,contrast:p.contrast,saturation:p.saturation,warmth:p.warmth,tint:p.tint,fade:p.fade,vignette:p.vignette,bloom:p.bloom,sepia:p.sepia,hue:p.hue,castColor:p.castColor,castStrength:p.castStrength,castMode:p.castMode}}"""
new_live="""  function liveParamsForPreset(f){if(f.kind==='recipe'&&f.snapshot){return filterParamsForSnapshot(f.snapshot)}const mix=state.filterIntensity/100,p=f.p||{};return {exposure:Number(p.exposure||0)*mix,brightness:Number(p.brightness||0)*mix,contrast:Number(p.contrast||0)*mix,saturation:Number(p.saturation||0)*mix,warmth:Number(p.warmth||0)*mix,tint:Number(p.tint||0)*mix,fade:Number(p.fade||0)*mix,vignette:Number(p.vignette||0)*mix,bloom:Number(p.bloom||0)*mix,sepia:Number(p.sepia||0)*mix,hue:Number(p.hue||0)*mix,castColor:p.castColor||null,castStrength:Number(p.castStrength||0)*mix,castMode:p.castMode||'soft-light',softness:Number(p.softness||0)*mix,lowRes:Number(p.lowRes||0)*mix,scanlines:Number(p.scanlines||0)*mix}}
  function currentLiveParams(){const p=filterParams();return {exposure:p.exposure,brightness:p.brightness,contrast:p.contrast,saturation:p.saturation,warmth:p.warmth,tint:p.tint,fade:p.fade,vignette:p.vignette,bloom:p.bloom,sepia:p.sepia,hue:p.hue,castColor:p.castColor,castStrength:p.castStrength,castMode:p.castMode,softness:p.softness,lowRes:p.lowRes,scanlines:p.scanlines}}"""
app=once(app,old_live,new_live,'live params expansion')

old_apply_live="  function applyLiveFilter(){const video=$('#cameraVideo');if(!video)return;const p=currentLiveParams();video.style.filter=cameraCssFromParams(p);const tone=$('#liveToneOverlay'),fade=$('#liveFadeOverlay'),vig=$('#liveVignetteOverlay');if(tone){if(p.castColor&&Number(p.castStrength)>0){tone.style.background=p.castColor;tone.style.opacity=String(Math.min(.55,Number(p.castStrength)/100));tone.style.mixBlendMode=p.castMode||'soft-light'}else{const warm=Number(p.warmth||0),tint=Number(p.tint||0);let c='255,151,94',op=Math.min(.28,Math.abs(warm)/115);if(warm<0)c='76,145,205';if(Math.abs(tint)>Math.abs(warm)){c=tint>0?'230,112,155':'92,162,118';op=Math.min(.22,Math.abs(tint)/135)}tone.style.background=`rgb(${c})`;tone.style.opacity=String(op);tone.style.mixBlendMode='soft-light'}}if(fade)fade.style.opacity=String(Math.min(.28,Math.max(0,p.fade||0)/130));if(vig)vig.style.opacity=String(Math.min(.62,Math.max(0,p.vignette||0)/58))}"
new_apply_live="""  function applyLiveFilter(){const video=$('#cameraVideo');if(!video)return;const p=currentLiveParams();video.style.filter=cameraCssFromParams(p);video.style.imageRendering=Number(p.lowRes||0)>55?'pixelated':'auto';const tone=$('#liveToneOverlay'),fade=$('#liveFadeOverlay'),vig=$('#liveVignetteOverlay'),texture=$('#liveTextureOverlay');if(tone){if(p.castColor&&Number(p.castStrength)>0){tone.style.background=p.castColor;tone.style.opacity=String(Math.min(.55,Number(p.castStrength)/100));tone.style.mixBlendMode=p.castMode||'soft-light'}else{const warm=Number(p.warmth||0),tint=Number(p.tint||0);let c='255,151,94',op=Math.min(.28,Math.abs(warm)/115);if(warm<0)c='76,145,205';if(Math.abs(tint)>Math.abs(warm)){c=tint>0?'230,112,155':'92,162,118';op=Math.min(.22,Math.abs(tint)/135)}tone.style.background=`rgb(${c})`;tone.style.opacity=String(op);tone.style.mixBlendMode='soft-light'}}if(fade)fade.style.opacity=String(Math.min(.28,Math.max(0,p.fade||0)/130));if(vig)vig.style.opacity=String(Math.min(.62,Math.max(0,p.vignette||0)/58));if(texture){const scan=Number(p.scanlines||0),low=Number(p.lowRes||0),layers=[];if(scan>0)layers.push('repeating-linear-gradient(to bottom,rgba(255,255,255,.08) 0 1px,rgba(0,0,0,.20) 1px 2px,transparent 2px 5px)');if(low>22)layers.push('repeating-linear-gradient(to right,rgba(255,255,255,.035) 0 1px,transparent 1px 4px)');texture.style.background=layers.length?layers.join(','):'none';texture.style.opacity=String(layers.length?Math.min(.30,scan/150+low/500):0);texture.style.mixBlendMode='overlay'}}"""
app=once(app,old_apply_live,new_apply_live,'live lo-fi texture preview')

helpers="""  function applyLowResolution(ctx,canvas,w,h,s){const amount=clamp(Number(s||0),0,100);if(amount<=0)return;const factor=1+amount/9,tw=Math.max(36,Math.round(w/factor)),th=Math.max(36,Math.round(h/factor)),tmp=applyLowResolution.buffer||(applyLowResolution.buffer=document.createElement('canvas'));if(tmp.width!==tw)tmp.width=tw;if(tmp.height!==th)tmp.height=th;const t=tmp.getContext('2d',{alpha:false});if(!t)return;t.clearRect(0,0,tw,th);t.imageSmoothingEnabled=true;t.drawImage(canvas,0,0,tw,th);ctx.save();ctx.imageSmoothingEnabled=amount<34;ctx.drawImage(tmp,0,0,tw,th,0,0,w,h);ctx.restore()}
  function applyScanlines(ctx,w,h,s){const amount=clamp(Number(s||0),0,100);if(amount<=0)return;const step=Math.max(3,Math.round(h/230)),line=Math.max(1,Math.round(step*.38));ctx.save();ctx.globalAlpha=Math.min(.24,amount/150);ctx.fillStyle='#120f12';for(let y=0;y<h;y+=step*2)ctx.fillRect(0,y,w,line);ctx.restore()}
"""
app=once(app,"  function applyLeak(ctx,w,h,s,type){",helpers+"  function applyLeak(ctx,w,h,s,type){",'lo-fi render helpers')

app=once(app,"    if(p.rgbSplit>0)applyRGBSplit(ctx,canvas,w,h,p.rgbSplit);\n    if(p.leak>0)applyLeak(ctx,w,h,p.leak,p.leakType);",
"    if(p.rgbSplit>0)applyRGBSplit(ctx,canvas,w,h,p.rgbSplit);\n    if(p.lowRes>0)applyLowResolution(ctx,canvas,w,h,p.lowRes);\n    if(p.leak>0)applyLeak(ctx,w,h,p.leak,p.leakType);",'Develop low-resolution stage')
app=once(app,"    if(p.grain>0)applyGrain(ctx,w,h,p.grain,p.grainType);\n    if(p.dust>0)applyDust(ctx,w,h,p.dust);",
"    if(p.grain>0)applyGrain(ctx,w,h,p.grain,p.grainType);\n    if(p.scanlines>0)applyScanlines(ctx,w,h,p.scanlines);\n    if(p.dust>0)applyDust(ctx,w,h,p.dust);",'Develop scanline stage')

app=once(app,"if(p.rgbSplit>0)applyRGBSplit(ctx,canvas,w,h,p.rgbSplit);if(p.noise>0)applyNoise(ctx,w,h,p.noise);",
"if(p.rgbSplit>0)applyRGBSplit(ctx,canvas,w,h,p.rgbSplit);if(p.lowRes>0)applyLowResolution(ctx,canvas,w,h,p.lowRes);if(p.noise>0)applyNoise(ctx,w,h,p.noise);",'camera capture low-resolution stage')
app=once(app,"if(p.grain>0)applyGrain(ctx,w,h,p.grain,p.grainType);if(p.dust>0)applyDust(ctx,w,h,p.dust);",
"if(p.grain>0)applyGrain(ctx,w,h,p.grain,p.grainType);if(p.scanlines>0)applyScanlines(ctx,w,h,p.scanlines);if(p.dust>0)applyDust(ctx,w,h,p.dust);",'camera capture scanline stage')

app=once(app,"navigator.serviceWorker.register('./service-worker.js?v=11.7.0')","navigator.serviceWorker.register('./service-worker.js?v=11.8.0')",'service-worker registration bump')

index=once(index,'          <div id="liveFadeOverlay" class="live-overlay live-fade-overlay"></div>\n          <div id="liveVignetteOverlay" class="live-overlay live-vignette-overlay"></div>',
'          <div id="liveFadeOverlay" class="live-overlay live-fade-overlay"></div>\n          <div id="liveTextureOverlay" class="live-overlay live-texture-overlay" style="mix-blend-mode:overlay"></div>\n          <div id="liveVignetteOverlay" class="live-overlay live-vignette-overlay"></div>','live texture overlay DOM')
index=once(index,'<div class="setting-row"><span>Current version</span><b>Build 11.7</b></div>','<div class="setting-row"><span>Current version</span><b>Build 11.8</b></div>','About build')
index=once(index,'<div class="release-badge">BUILD 11.7</div>','<div class="release-badge">BUILD 11.8</div>','release badge')
index=once(index,'<h4>Filters that finally feel unmistakably different.</h4>','<h4>A much bigger camera shelf: 48 new looks.</h4>','release title')
old_notes="""        <div><b>◐</b><span>Filter calibration overhaul: stronger separation in color, contrast, warmth, tint, monochrome, and mood.</span></div>
        <div><b>✦</b><span>Six new Mood looks: Violet Hour, Amber Memory, Midnight Blue, Rose Noir, Silver Soft, and Deep Mono.</span></div>
        <div><b>100</b><span>Looks now open at their intended 100% strength instead of being softened to 70% by default.</span></div>
        <div><b>◌</b><span>Preset-specific grain and bloom styles now render correctly instead of being overridden by generic defaults.</span></div>
        <div><b>⚡</b><span>Captured photos keep the exact look that was active when the shutter was pressed, even while the save queue is busy.</span></div>
        <div><b>□</b><span>Kira Original is neutral again: no hidden default grain or vignette is added.</span></div>"""
new_notes="""        <div><b>48</b><span>Forty-eight additional filters across Lo-Fi, Recolor, Mono, and Flash Night collections.</span></div>
        <div><b>▦</b><span>Lo-Fi cameras now simulate downsampled resolution, softness, scanlines, cheap digital noise, flash bloom, color casts, and RGB drift.</span></div>
        <div><b>◐</b><span>Recolor adds strong blue, teal, matcha, lavender, cherry, aqua, mint, crimson, grape, emerald, plum, and warm-tone transformations.</span></div>
        <div><b>◻</b><span>Eight dedicated monochrome looks range from soft silver prints to rough Newspaper and Noir 400.</span></div>
        <div><b>✦</b><span>Flash Night adds club, mirror, street, blue-flash, red-room, after-party, paparazzi, and convenience-store looks.</span></div>
        <div><b>⚡</b><span>Low-quality texture work is applied only to the selected live look and final still render—no extra camera streams or live thumbnail canvases.</span></div>"""
index=once(index,old_notes,new_notes,'What’s New 11.8 notes')
index=once(index,'<script src="./app.js?v=11.7.0"></script>','<script src="./app.js?v=11.8.0"></script>','app script cache-bust')

old_cache="const CACHE='kira-build11-7-filter-engine-20260814';"
if sw.count(old_cache)!=1 or sw_alias.count(old_cache)!=1:
    raise SystemExit('service-worker cache marker mismatch')
sw=sw.replace(old_cache,"const CACHE='kira-build11-8-mega-filter-library-20260814';",1)
sw_alias=sw_alias.replace(old_cache,"const CACHE='kira-build11-8-mega-filter-library-20260814';",1)

APP.write_text(app)
INDEX.write_text(index)
SW.write_text(sw)
SW_ALIAS.write_text(sw_alias)

# Static/runtime dependency QA. Node syntax checking runs in the workflow after this script.
assert SW.read_text()==SW_ALIAS.read_text(), 'service-worker.js and sw.js diverged'
assert "kira-build11-8-mega-filter-library-20260814" in SW.read_text()
assert "service-worker.js?v=11.8.0" in app
assert "app.js?v=11.8.0" in index
assert 'id="liveTextureOverlay"' in index
assert app.count("const cats=['Kira','Mood','Lo-Fi','Recolor','Mono','Flash Night'")==2
new_names=[
'Toy Cam 1998','Drugstore Flash','Webcam 2005','Flip Phone 2007','MiniDV Tape','Pocket CCD','Low Battery CCD','Mall Photo Booth','Gas Station Disposable','Crushed JPEG','Security Cam','Old Scanner','Washed Pocket Cam','Night Bus Digicam','Cheap Flash Pink','Tape Dub',
'Blueberry','Teal Pop','Matcha Fade','Lavender Chrome','Cherry Cola','Aqua Flash','Peach Soda','Mint Film','Silver Cyan','Rose Ice','Golden Glow','Crimson Night','Grape Jelly','Emerald Haze','Neon Plum','Milk Tea',
'Soft B&W','Noir 400','Matte Mono','Silver Print','Flash Mono','Cold Mono','Warm Mono','Newspaper',
'Club Flash','Bathroom Mirror','Night Street','Blue Flash','Red Room','After Party','Paparazzi','Convenience Flash']
assert len(new_names)==48 and len(set(new_names))==48
for name in new_names:
    assert app.count("['"+name+"',")==1, f'missing or duplicated filter {name}'
for cat,expected in [('Lo-Fi',16),('Recolor',16),('Mono',8),('Flash Night',8)]:
    found=len(re.findall(r"\['[^']+','"+re.escape(cat)+r"',",app))
    assert found>=expected, f'{cat}: expected at least {expected}, found {found}'
for token in ['softness:','lowRes:','scanlines:','applyLowResolution','applyScanlines','liveTextureOverlay']:
    assert token in app or token in index, token
for fn in ['filterParams','filterParamsForSnapshot','applyPresetCast','applyLowResolution','applyScanlines','applyLiveFilter','captureLivePhoto','startVideoRecording','storeRollPhoto','openPhotoModal','syncPhotoCaptionUi','renderInstantCaptionBlob']:
    assert re.search(rf'function\s+{fn}\s*\(',app), f'missing critical function {fn}'
# 1989 Sparkle regression guard.
manifest=app.split('const kira1989GlyphManifest=',1)[1].split(';',1)[0]
for digit,code in zip('0123456789',range(48,58)):
    assert f'"{digit}":{{"file":"{code}.png"' in manifest, f'1989 digit mapping changed for {digit}'
for ch in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz':
    assert f'"{ch}":{{"file":' in manifest, f'1989 glyph missing {ch}'
for element_id in ['cameraVideo','shutterBtn','cameraStrip','filterRow','rollGrid','photoModal','photoCaptionTools','appUpdateBanner','liveTextureOverlay']:
    assert f'id="{element_id}"' in index, f'missing DOM #{element_id}'
assert 'An update is available. Refresh to update.' in index
assert 'no demo photos, fake rolls, or pre-made personal entries' in index
print('Kira Build 11.8 patch + static dependency QA passed')
