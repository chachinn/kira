(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const today=()=>new Date().toISOString().slice(0,10);
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);

  const defaultAdjust=()=>({exposure:0,brightness:0,contrast:0,highlights:0,shadows:0,saturation:0,warmth:0,tint:0,fade:0,sharpness:0,vignette:0});
  const defaultEffects=()=>({grain:0,grainType:'Classic',bloom:0,bloomType:'Soft',dust:0,scratches:0,leak:0,leakType:'Pink',rgbSplit:0,noise:0,sparkle:0,sparkleType:'Star'});
  const defaultBeauty=()=>({smooth:0,blemish:0,redness:0,brighten:0,glow:0});
  const loadBeauty=()=>{try{const v=JSON.parse(localStorage.getItem('kira.beauty')||'{}');return Object.assign(defaultBeauty(),v&&typeof v==='object'?v:{})}catch(e){return defaultBeauty()}};
  const defaultSettings={grid:false,haptics:true,rememberFilter:true,keepOriginal:false,autoSave:false,autoPhotos:true,continuousShoot:true,videoAudio:true,videoQuality:'smooth',defaultCaptureMode:'photo',theme:'old-rose',accent:'#b76e79',density:'cozy'};

  const builtins=[
    ['Kira Original','Kira','#9f7473,#dec2b0',{}],
    ['Old Rose','Kira','#ad6d79,#e8c2b4',{brightness:5,contrast:-8,saturation:-8,warmth:10,fade:10,grain:8,grainType:'Fine'}],
    ['First Love','Kira','#e8c5c7,#f6e5da',{brightness:10,contrast:-12,saturation:-6,warmth:7,fade:14,bloom:10,bloomType:'Dream'}],
    ['Sunday','Kira','#c99678,#f0d9bc',{brightness:5,contrast:-4,saturation:4,warmth:14,fade:6}],
    ['Diary','Kira','#8c6e62,#d5b29e',{contrast:-12,saturation:-12,warmth:7,fade:18,grain:12,dust:8}],
    ['After School','Kira','#af8179,#e4b596',{brightness:3,contrast:4,warmth:9,tint:5,fade:8,grain:9}],
    ['Rose Flash','Kira','#b96c80,#f4cad0',{brightness:13,contrast:7,saturation:4,tint:12,bloom:12,bloomType:'Flash'}],

    // Build 11.7 — visibly distinct looks calibrated from the user's supplied references.
    ['Violet Hour','Mood','#67678f,#b4a9c8',{brightness:4,contrast:10,saturation:5,warmth:-13,tint:20,hue:7,castColor:'#7770a8',castStrength:27,castMode:'soft-light',noise:3,sharpness:4}],
    ['Amber Memory','Mood','#8b5d3f,#d8aa78',{brightness:6,contrast:7,saturation:-8,warmth:28,tint:-3,sepia:25,hue:-4,castColor:'#c27845',castStrength:28,castMode:'soft-light',fade:4,grain:4,grainType:'Fine'}],
    ['Midnight Blue','Mood','#172f48,#526b86',{brightness:-15,contrast:34,saturation:-24,warmth:-35,tint:-8,hue:-8,castColor:'#173b60',castStrength:40,castMode:'soft-light',noise:6,sharpness:5,vignette:17}],
    ['Rose Noir','Mood','#412a34,#815263',{brightness:-14,contrast:30,saturation:-14,warmth:-5,tint:29,hue:10,castColor:'#713347',castStrength:36,castMode:'soft-light',noise:5,vignette:16}],
    ['Silver Soft','Mood','#777777,#d7d7d7',{brightness:8,contrast:7,saturation:-100,highlights:6,shadows:5,fade:5,grain:3,grainType:'Fine',sharpness:2}],
    ['Deep Mono','Mood','#252525,#8f8f8f',{brightness:-12,contrast:40,saturation:-100,highlights:8,shadows:-9,grain:9,grainType:'Classic',sharpness:8,vignette:19}],


    // Build 12 — Beauty Only keeps the camera color neutral while using the stronger skin pass.
    ['Beauty Only','Beauty','#8c8784,#e8e1dc',{beauty:{smooth:42,blemish:68,redness:30,brighten:8,glow:6}}],
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

    ['Film 100','Film','#8f7e70,#cdbca8',{contrast:7,saturation:-3,warmth:5,grain:6,grainType:'Fine'}],
    ['Film 200','Film','#7e7064,#c3ab94',{contrast:8,saturation:1,warmth:7,grain:10,grainType:'Fine'}],
    ['Film 400','Film','#5b4f47,#b49a83',{contrast:12,saturation:-4,warmth:7,grain:20,grainType:'Classic',vignette:9}],
    ['Disposable','Film','#72574b,#c69268',{brightness:2,contrast:16,saturation:8,warmth:15,fade:5,grain:25,grainType:'Rough',vignette:12}],
    ['Faded Film','Film','#a8907b,#d8c6b0',{brightness:6,contrast:-18,saturation:-14,warmth:8,fade:26,grain:10}],
    ['Warm Negative','Film','#704c3e,#c88e67',{contrast:8,saturation:3,warmth:22,highlights:-7,grain:14}],
    ['Portra Soft','Film','#a47e6e,#e0b99f',{brightness:7,contrast:-8,saturation:-4,warmth:11,shadows:8,grain:6,grainType:'Fine'}],
    ['Green 35','Film','#627162,#aeb69e',{contrast:6,saturation:-8,warmth:-2,tint:-10,fade:7,grain:12}],
    ['CCD 2003','CCD','#4f667b,#b0bcc9',{contrast:10,saturation:3,warmth:-16,grain:8,noise:8,bloom:6}],
    ['Pink CCD','CCD','#81657b,#dfa3b7',{brightness:5,contrast:8,saturation:9,warmth:-5,tint:12,fade:5,bloom:7}],
    ['Cool CCD','CCD','#42596f,#7fa1b0',{contrast:9,saturation:-4,warmth:-22,grain:8,noise:12}],
    ['Night CCD','CCD','#28384e,#8b7080',{brightness:-4,contrast:20,saturation:7,warmth:-18,noise:18,bloom:9,vignette:13}],
    ['Flash CCD','CCD','#81797f,#f2e8e8',{brightness:13,contrast:18,saturation:-2,warmth:-12,bloom:18,bloomType:'Flash',noise:8}],
    ['MiniDV','CCD','#5f6d70,#b8b9b0',{contrast:5,saturation:-8,warmth:-10,fade:8,noise:15,rgbSplit:3}],
    ['Silver Digicam','CCD','#65646a,#c7c5c7',{brightness:8,contrast:14,saturation:-15,warmth:-8,noise:10,sharpness:8}],
    ['Bubblegum','Y2K','#e0739c,#8a73bd',{brightness:7,contrast:12,saturation:22,warmth:-4,tint:14,rgbSplit:4}],
    ['Angel','Y2K','#d5d5e8,#f2dbe7',{brightness:16,contrast:-10,saturation:-6,warmth:-8,fade:13,bloom:17,bloomType:'Dream'}],
    ['Baby Pink','Y2K','#f0b9c7,#f7e2df',{brightness:8,contrast:-7,saturation:4,warmth:7,tint:9,fade:8}],
    ['Chrome','Y2K','#6f7890,#d6b3cf',{contrast:22,saturation:-3,warmth:-15,tint:8,rgbSplit:7,sharpness:10}],
    ['2004 Flash','Y2K','#856c75,#f3d4cf',{brightness:16,contrast:19,saturation:9,warmth:-5,tint:8,bloom:15,bloomType:'Flash',noise:10}],
    ['Cyber Pink','Y2K','#7d4c78,#f177b8',{contrast:18,saturation:30,warmth:-13,tint:22,rgbSplit:8}],
    ['Peach Milk','Dream','#e5ab8e,#f6e2ce',{brightness:12,contrast:-15,saturation:-5,warmth:14,fade:12,bloom:12,bloomType:'Dream'}],
    ['Bloom','Dream','#c6b3be,#f4e8dd',{brightness:7,contrast:-9,saturation:-7,warmth:2,fade:10,bloom:23,bloomType:'Soft'}],
    ['Haze','Dream','#9e9794,#ded5ca',{brightness:9,contrast:-22,saturation:-15,warmth:3,fade:24,bloom:9}],
    ['Lavender','Dream','#877a99,#d7cadf',{brightness:6,contrast:-10,saturation:-5,warmth:-12,tint:12,fade:10,bloom:8}],
    ['Milk Glass','Dream','#b9aaa8,#f0e6db',{brightness:13,contrast:-20,highlights:-6,shadows:15,saturation:-11,fade:18,bloom:8}],
    ['Blue Dream','Dream','#677d96,#c6ccda',{brightness:7,contrast:-12,warmth:-20,tint:5,fade:13,bloom:12}],
    ['Tokyo AM','Japan','#6c7d83,#c9c1b1',{brightness:3,contrast:8,saturation:-10,warmth:-8,fade:5,grain:8}],
    ['Tokyo PM','Japan','#55444e,#d08b73',{contrast:17,saturation:4,warmth:12,grain:14,bloom:8,vignette:8}],
    ['Kissaten','Japan','#5c4336,#aa7655',{brightness:-3,contrast:12,saturation:-5,warmth:20,fade:8,grain:12}],
    ['Kamakura','Japan','#5d7d7a,#b7c6bd',{brightness:3,contrast:6,saturation:-5,warmth:-10,tint:-5,fade:8,grain:7}],
    ['Kyoto','Japan','#745f4f,#b78f6f',{contrast:8,saturation:-8,warmth:14,fade:6,grain:10}],
    ['Harajuku','Japan','#ae6e8d,#81a4bd',{brightness:7,contrast:14,saturation:18,warmth:-5,tint:10,rgbSplit:4}],
    ['Convenience Store','Japan','#456776,#e0bc7d',{contrast:17,saturation:10,warmth:-8,highlights:-8,noise:7}],
    ['Rainy Shibuya','Japan','#3f5262,#8d7b86',{brightness:-3,contrast:10,saturation:-14,warmth:-16,fade:6,grain:10,bloom:9}],

    // Build 5 — Instant / old-camera / dated-camera packs
    ['Instant Classic','Instant','#9b756e,#ead4bd',{brightness:7,contrast:-7,saturation:-6,warmth:10,fade:13,grain:8,grainType:'Fine',bloom:5,autoFrame:'Polaroid'}],
    ['Instant Rose','Instant','#b46e7e,#f0c9c5',{brightness:10,contrast:-10,saturation:-3,warmth:8,tint:10,fade:15,grain:7,grainType:'Fine',bloom:7,autoFrame:'Polaroid'}],
    ['Instant Cream','Instant','#b99a7d,#f4e7cf',{brightness:12,contrast:-14,saturation:-10,warmth:15,fade:18,grain:6,autoFrame:'Polaroid'}],
    ['Instant Cool','Instant','#687887,#d1d6d4',{brightness:6,contrast:-5,saturation:-10,warmth:-15,fade:12,grain:7,autoFrame:'Polaroid'}],
    ['Instant Flash','Instant','#8c7277,#f6e2dc',{brightness:16,contrast:15,saturation:1,warmth:-5,bloom:14,bloomType:'Flash',grain:8,autoFrame:'Polaroid'}],
    ['Instant Sepia','Instant','#80614c,#d4b28a',{brightness:4,contrast:2,saturation:-22,warmth:24,fade:14,grain:10,autoFrame:'Polaroid'}],
    ['Instant Washed','Instant','#a38f80,#e6ddd1',{brightness:13,contrast:-22,saturation:-18,warmth:5,fade:27,grain:7,autoFrame:'Polaroid'}],
    ['Instant Night','Instant','#403b43,#a6818b',{brightness:-2,contrast:16,saturation:-5,warmth:-8,bloom:12,noise:8,vignette:12,autoFrame:'Polaroid'}],

    ['1972 Family Album','Vintage','#8b684d,#c49b6d',{brightness:-1,contrast:5,saturation:-18,warmth:24,fade:17,grain:17,dust:7,vignette:10}],
    ['1978 Slide','Vintage','#6d5a45,#c29a65',{contrast:15,saturation:7,warmth:17,highlights:-9,grain:12,vignette:8}],
    ['1983 Pocket Camera','Vintage','#6f685f,#c7b197',{brightness:2,contrast:10,saturation:-9,warmth:10,fade:10,grain:14,vignette:11}],
    ['1987 Warm Print','Vintage','#83624f,#d4a57c',{brightness:4,contrast:2,saturation:-6,warmth:22,fade:15,grain:10}],
    ['1991 Point & Shoot','Vintage','#636260,#beb2a3',{brightness:3,contrast:10,saturation:-12,warmth:5,grain:11,sharpness:4,vignette:9}],
    ['1994 Family Flash','Vintage','#7d6f70,#e7d8d3',{brightness:14,contrast:18,saturation:-7,warmth:-3,bloom:12,bloomType:'Flash',grain:12}],
    ['1997 Drugstore Print','Vintage','#7d6858,#d2b592',{brightness:5,contrast:3,saturation:-4,warmth:14,fade:11,grain:13}],
    ['1999 Compact','Vintage','#62686e,#bdc1c3',{brightness:7,contrast:13,saturation:-8,warmth:-8,noise:5,grain:6,sharpness:5}],
    ['2001 Silver Cam','Vintage','#58636d,#bec5c8',{brightness:8,contrast:15,saturation:-12,warmth:-10,noise:10,sharpness:8}],
    ['2006 Party Cam','Vintage','#6f5c66,#e0a5b0',{brightness:12,contrast:18,saturation:12,warmth:-6,tint:7,bloom:13,bloomType:'Flash',noise:9}],
    ['35mm Amber','Vintage','#70543f,#c9905e',{contrast:12,saturation:-2,warmth:25,grain:18,grainType:'Classic',vignette:8}],
    ['35mm Green Cast','Vintage','#536050,#9ca88a',{contrast:9,saturation:-13,warmth:-1,tint:-14,grain:17,fade:8}],
    ['110 Pocket Film','Vintage','#776454,#c2a58a',{brightness:3,contrast:8,saturation:-12,warmth:10,fade:14,grain:22,grainType:'Rough',vignette:15}],
    ['Half Frame','Vintage','#6e675e,#cabba9',{brightness:4,contrast:6,saturation:-8,warmth:7,fade:9,grain:16,autoFrame:'35mm'}],
    ['Toy Lens','Vintage','#635c63,#c88da0',{contrast:17,saturation:7,warmth:4,tint:7,grain:15,vignette:26,bloom:6}],
    ['Faded Negative','Vintage','#8c7b68,#d0c2ae',{brightness:8,contrast:-17,saturation:-22,warmth:9,fade:29,grain:12,dust:4}],
    ['Old Photo Box','Vintage','#806955,#c2a47e',{brightness:2,contrast:-2,saturation:-24,warmth:22,fade:22,grain:15,dust:10,scratches:5}],
    ['Flashbulb 80s','Vintage','#7a696b,#eee1d5',{brightness:17,contrast:20,saturation:-10,warmth:1,bloom:18,bloomType:'Flash',grain:14,vignette:7}],

    ['98 Date Cam','Date Cam','#4f6170,#b1b8bb',{contrast:10,saturation:-5,warmth:-12,noise:7,grain:7,autoDate:{style:'Digicam 98',color:'Orange',position:'Bottom Right'}}],
    ['99 Summer Date','Date Cam','#8d715f,#e0bb8e',{brightness:7,contrast:8,saturation:8,warmth:18,grain:10,autoDate:{style:'Digicam 98',color:'Orange',position:'Bottom Right'}}],
    ['02 Cool Date','Date Cam','#4e6478,#a9bac6',{brightness:7,contrast:12,saturation:-4,warmth:-18,noise:9,autoDate:{style:'Japanese',color:'Orange',position:'Bottom Right'}}],
    ['04 Party Date','Date Cam','#765d69,#e5a8b5',{brightness:15,contrast:18,saturation:11,warmth:-5,tint:8,bloom:14,bloomType:'Flash',noise:10,autoDate:{style:'2000s',color:'Orange',position:'Bottom Right'}}],
    ['06 Night Date','Date Cam','#303d50,#9a7180',{brightness:-3,contrast:20,saturation:4,warmth:-15,bloom:12,noise:14,vignette:13,autoDate:{style:'2000s',color:'Orange',position:'Bottom Right'}}],
    ['Japan Date','Date Cam','#6e7e78,#c9bda7',{brightness:4,contrast:8,saturation:-9,warmth:-4,grain:8,autoDate:{style:'Japanese',color:'Orange',position:'Bottom Right'}}],
    ['Green Date','Date Cam','#536653,#a8b19c',{contrast:8,saturation:-12,tint:-10,grain:9,autoDate:{style:'Classic',color:'Green',position:'Bottom Right'}}],
    ['Red Date','Date Cam','#6f5357,#ca8f8b',{contrast:12,saturation:-5,warmth:10,grain:10,autoDate:{style:'Classic',color:'Red',position:'Bottom Right'}}],
    ['White Date Flash','Date Cam','#747171,#e8e1dc',{brightness:15,contrast:16,saturation:-15,warmth:-4,bloom:12,autoDate:{style:'Digicam 98',color:'White',position:'Bottom Right'}}],
    ['Film Lab Date','Date Cam','#5a4e47,#b58c71',{contrast:11,saturation:-5,warmth:12,grain:15,autoDate:{style:'Film Lab',color:'Orange',position:'Bottom Right'},autoFrame:'35mm'}],

    // Build 6 — deeper instant film, old film stock, classic cameras and dated-camera looks
    ['Instant Soft White','Instant','#b7a79c,#f7efe6',{brightness:15,contrast:-18,saturation:-12,warmth:7,fade:22,grain:5,bloom:7,autoFrame:'Instant Square'}],
    ['Instant Peach','Instant','#d19a84,#f5d9c8',{brightness:12,contrast:-13,saturation:-2,warmth:18,tint:4,fade:15,grain:6,bloom:8,autoFrame:'Instant Square'}],
    ['Instant Lavender','Instant','#92869d,#dfd4e7',{brightness:10,contrast:-13,saturation:-8,warmth:-10,tint:12,fade:16,grain:6,bloom:8,autoFrame:'Instant Square'}],
    ['Instant Mint','Instant','#7f9485,#dce8da',{brightness:9,contrast:-12,saturation:-12,warmth:-7,tint:-10,fade:14,grain:6,autoFrame:'Instant Square'}],
    ['Instant Chocolate','Instant','#694d42,#c6997d',{brightness:2,contrast:7,saturation:-14,warmth:23,fade:13,grain:11,vignette:7,autoFrame:'Instant Square'}],
    ['Instant Sunny','Instant','#c58a5f,#f2d08f',{brightness:14,contrast:-2,saturation:9,warmth:22,highlights:-4,fade:8,grain:5,autoFrame:'Instant Wide'}],
    ['Instant Cloudy','Instant','#79828a,#d6d8d6',{brightness:8,contrast:-14,saturation:-18,warmth:-8,fade:18,grain:6,autoFrame:'Instant Wide'}],
    ['Instant Closeup','Instant','#a78379,#f0d7ca',{brightness:11,contrast:-8,saturation:-4,warmth:11,shadows:8,bloom:9,grain:5,autoFrame:'Instant Mini'}],
    ['Instant Party','Instant','#8b6877,#f3d6df',{brightness:17,contrast:19,saturation:7,warmth:-3,tint:9,bloom:18,bloomType:'Flash',noise:6,autoFrame:'Instant Square'}],
    ['Instant Midnight','Instant','#353842,#a28792',{brightness:-5,contrast:22,saturation:-8,warmth:-11,bloom:14,noise:11,vignette:17,autoFrame:'Instant Black'}],
    ['Instant Mini 90','Instant','#9a7e76,#e4cdbf',{brightness:8,contrast:-6,saturation:-7,warmth:10,fade:11,grain:8,autoFrame:'Instant Mini'}],
    ['Instant Black Frame','Instant','#64565d,#d7aab5',{brightness:6,contrast:10,saturation:4,warmth:-4,tint:7,grain:8,autoFrame:'Instant Black'}],

    ['Daylight 50','Film Stock','#7c7869,#cfc4a6',{brightness:5,contrast:13,saturation:8,warmth:6,grain:3,grainType:'Fine',sharpness:5}],
    ['Daylight 100','Film Stock','#807669,#d6c2a9',{brightness:6,contrast:10,saturation:4,warmth:7,grain:5,grainType:'Fine'}],
    ['Color 200','Film Stock','#746e66,#c7b7a7',{brightness:4,contrast:8,saturation:1,warmth:5,grain:8,grainType:'Fine'}],
    ['Color 400','Film Stock','#665d56,#b9a18e',{brightness:2,contrast:11,saturation:-3,warmth:7,grain:14,grainType:'Classic',vignette:6}],
    ['Color 800','Film Stock','#51494b,#a98986',{brightness:-1,contrast:16,saturation:-6,warmth:5,grain:23,grainType:'Rough',vignette:10}],
    ['Portrait 160','Film Stock','#ad8476,#e2bca8',{brightness:8,contrast:-5,saturation:-4,warmth:12,shadows:7,grain:4,grainType:'Fine'}],
    ['Portrait 400','Film Stock','#967269,#d3aa9b',{brightness:6,contrast:-2,saturation:-5,warmth:13,shadows:8,grain:10,grainType:'Fine'}],
    ['Tungsten 500','Film Stock','#3f5366,#8b9aae',{brightness:1,contrast:13,saturation:-4,warmth:-25,tint:3,grain:15,bloom:5}],
    ['Cinema Warm 200','Film Stock','#76513f,#c88862',{brightness:1,contrast:14,saturation:-2,warmth:24,highlights:-8,shadows:5,grain:8}],
    ['Cinema Cool 500','Film Stock','#405765,#8196a0',{brightness:0,contrast:16,saturation:-11,warmth:-19,highlights:-8,grain:12}],
    ['Slide Vivid','Film Stock','#625e50,#c2a75e',{contrast:23,saturation:22,warmth:9,highlights:-12,grain:6}],
    ['Slide Soft','Film Stock','#7a756e,#c8bfac',{brightness:3,contrast:8,saturation:-5,warmth:5,fade:6,grain:5}],
    ['Expired 100','Film Stock','#8c7f75,#cbb9a8',{brightness:7,contrast:-10,saturation:-18,warmth:9,fade:20,grain:10,dust:3}],
    ['Expired 200','Film Stock','#7e8069,#c6ba91',{brightness:5,contrast:-5,saturation:-13,warmth:4,tint:-8,fade:18,grain:13,dust:5}],
    ['Expired 400','Film Stock','#80696f,#bc969d',{brightness:4,contrast:1,saturation:-9,warmth:2,tint:8,fade:17,grain:17,dust:6}],
    ['Expired Purple','Film Stock','#66546d,#b695c3',{brightness:4,contrast:4,saturation:-3,warmth:-8,tint:18,fade:12,grain:15,dust:4}],
    ['Monochrome 100','Film Stock','#6e6e6e,#d4d4d4',{brightness:5,contrast:18,saturation:-100,grain:4,grainType:'Fine',sharpness:5}],
    ['Monochrome 400','Film Stock','#505050,#b5b5b5',{brightness:1,contrast:25,saturation:-100,grain:16,grainType:'Classic',vignette:7}],
    ['Monochrome 1600','Film Stock','#303030,#999999',{brightness:-4,contrast:32,saturation:-100,grain:30,grainType:'Rough',vignette:15}],
    ['Sepia Roll','Film Stock','#6e4e38,#c79661',{brightness:3,contrast:8,saturation:-45,warmth:31,fade:12,grain:14,dust:3}],

    ['1963 Sunday','Vintage','#786451,#c3a170',{brightness:3,contrast:-1,saturation:-26,warmth:25,fade:21,grain:15,dust:8,vignette:9}],
    ['1968 Summer Slide','Vintage','#665c43,#c5a24d',{brightness:4,contrast:18,saturation:12,warmth:18,highlights:-10,grain:9}],
    ['1971 Picnic','Vintage','#79624a,#cfa66e',{brightness:5,contrast:3,saturation:-10,warmth:22,fade:12,grain:14,dust:4}],
    ['1974 Golden Print','Vintage','#815b3f,#d1a06e',{brightness:5,contrast:4,saturation:-7,warmth:27,fade:13,grain:13}],
    ['1976 Family Table','Vintage','#765c4d,#bc977d',{brightness:0,contrast:6,saturation:-19,warmth:19,fade:17,grain:16,dust:6}],
    ['1980 Pocket Flash','Vintage','#71666a,#e5dbd5',{brightness:14,contrast:20,saturation:-13,warmth:0,bloom:15,bloomType:'Flash',grain:13}],
    ['1984 Soft Flash','Vintage','#7d6d70,#ddd0cd',{brightness:13,contrast:12,saturation:-10,warmth:3,bloom:10,bloomType:'Flash',grain:11}],
    ['1988 Mall Booth','Vintage','#76646f,#d9b5c4',{brightness:9,contrast:12,saturation:-2,warmth:-2,tint:7,fade:7,grain:11}],
    ['1990 School Trip','Vintage','#6f716b,#c5c0ae',{brightness:6,contrast:8,saturation:-12,warmth:4,fade:9,grain:12}],
    ['1993 Disposable Day','Vintage','#806550,#d5a66c',{brightness:8,contrast:16,saturation:11,warmth:18,grain:20,grainType:'Rough',vignette:10}],
    ['1995 Disposable Flash','Vintage','#7c6b6d,#eadbd4',{brightness:16,contrast:22,saturation:3,warmth:1,bloom:15,bloomType:'Flash',grain:20,grainType:'Rough'}],
    ['1998 Mini Lab','Vintage','#78695c,#d0b493',{brightness:6,contrast:5,saturation:-4,warmth:12,fade:10,grain:12}],
    ['2000 Pocket Silver','Vintage','#59636d,#bdc3c6',{brightness:8,contrast:14,saturation:-10,warmth:-9,noise:8,sharpness:7}],
    ['2003 Pink Digicam','Vintage','#755f70,#dfa5bd',{brightness:10,contrast:13,saturation:10,warmth:-7,tint:12,bloom:8,noise:10}],
    ['2007 Party Pocket','Vintage','#605360,#d899ab',{brightness:13,contrast:19,saturation:14,warmth:-6,tint:10,bloom:14,bloomType:'Flash',noise:13}],

    ['88 Red Date','Date Cam','#665457,#c69286',{contrast:10,saturation:-12,warmth:12,grain:12,autoDate:{style:'Tiny Digital',color:'Red',position:'Bottom Right'}}],
    ['92 Orange Date','Date Cam','#746457,#c9ab88',{brightness:3,contrast:8,saturation:-9,warmth:15,grain:11,autoDate:{style:'Digicam 98',color:'Orange',position:'Bottom Right'}}],
    ['95 Family Date','Date Cam','#776965,#d2b8a8',{brightness:7,contrast:9,saturation:-8,warmth:9,grain:10,bloom:5,autoDate:{style:'Tiny Digital',color:'Orange',position:'Bottom Right'}}],
    ['97 Summer Date','Date Cam','#8d6b55,#dfb37d',{brightness:9,contrast:10,saturation:8,warmth:19,grain:10,autoDate:{style:'Digicam 98',color:'Yellow',position:'Bottom Right'}}],
    ['99 Green Print','Date Cam','#5b6858,#aab39d',{contrast:8,saturation:-15,tint:-11,grain:10,autoDate:{style:'Tiny Digital',color:'Green',position:'Bottom Right'}}],
    ['01 Blue Date','Date Cam','#4d6272,#a9b8c2',{brightness:6,contrast:13,saturation:-8,warmth:-16,noise:9,autoDate:{style:'Tiny Digital',color:'Blue',position:'Bottom Right'}}],
    ['03 Party Date','Date Cam','#745967,#dda2b1',{brightness:15,contrast:19,saturation:13,warmth:-5,tint:10,bloom:14,bloomType:'Flash',noise:10,autoDate:{style:'2000s',color:'Orange',position:'Bottom Right'}}],
    ['05 Camcorder','Date Cam','#526267,#a9afb0',{brightness:5,contrast:8,saturation:-14,warmth:-8,noise:15,rgbSplit:3,autoDate:{style:'Camcorder',color:'White',position:'Top Left'}}],
    ['07 Night Date','Date Cam','#303b4a,#927282',{brightness:-3,contrast:22,saturation:3,warmth:-15,bloom:13,noise:15,vignette:14,autoDate:{style:'Date + Time',color:'Orange',position:'Bottom Right'}}],
    ['09 Silver Date','Date Cam','#5b6267,#c4c6c5',{brightness:10,contrast:14,saturation:-15,warmth:-7,noise:10,sharpness:7,autoDate:{style:'Tiny Digital',color:'White',position:'Bottom Right'}}],
    ['Warm Date + Time','Date Cam','#775a4a,#cc9870',{contrast:11,saturation:-5,warmth:20,grain:13,autoDate:{style:'Date + Time',color:'Orange',position:'Bottom Center'}}],
    ['Cool Date + Time','Date Cam','#455d6d,#94a9b5',{contrast:12,saturation:-9,warmth:-18,noise:9,autoDate:{style:'Date + Time',color:'Blue',position:'Bottom Center'}}],
    ['Japanese Date II','Date Cam','#69736b,#c0bba6',{brightness:4,contrast:8,saturation:-10,warmth:1,grain:8,autoDate:{style:'Japanese',color:'Orange',position:'Bottom Left'}}],
    ['Tiny White Date','Date Cam','#676463,#d7d0ca',{brightness:8,contrast:11,saturation:-17,warmth:-2,grain:8,autoDate:{style:'Tiny Digital',color:'White',position:'Top Right'}}],

    // Build 8 — compact-camera packs inspired by the reference camera looks supplied by the user.
    ['DV','Camera Packs','#5e6670,#adb2b7',{pack:'DV',brightness:3,contrast:10,saturation:-12,warmth:-10,fade:5,noise:12,rgbSplit:2,autoDate:{style:'Camcorder',color:'White',position:'Top Left'}}],
    ['SX40','Camera Packs','#65717a,#c4c5bd',{pack:'DV',brightness:7,contrast:11,saturation:-9,warmth:-7,noise:7,sharpness:5}],
    ['DCR','Camera Packs','#65707b,#b8c0c5',{pack:'DV',brightness:5,contrast:13,saturation:-15,warmth:-13,noise:11,sharpness:4,autoDate:{style:'Tiny Digital',color:'White',position:'Bottom Right'}}],
    ['HK90S','Camera Packs','#9a6978,#e6aab6',{pack:'DV',brightness:10,contrast:14,saturation:7,warmth:-4,tint:9,bloom:8,noise:10}],
    ['HDC','Camera Packs','#777b7d,#d6d4d0',{pack:'DV',brightness:8,contrast:12,saturation:-18,warmth:-5,noise:9,sharpness:7}],
    ['8mm','Camera Packs','#8d672f,#e0ad55',{pack:'DV',brightness:1,contrast:18,saturation:-14,warmth:24,fade:9,grain:24,grainType:'Rough',dust:8,scratches:7,vignette:14,autoDate:{style:'Camcorder',color:'Yellow',position:'Top Left'}}],

    ['CCD','Camera Packs','#7b8288,#d7d7d1',{pack:'CCD',brightness:9,contrast:15,saturation:-10,warmth:-7,noise:10,bloom:5}],
    ['W510','Camera Packs','#9d7f82,#ead4ce',{pack:'CCD',brightness:12,contrast:8,saturation:-1,warmth:4,tint:4,bloom:8,noise:6}],
    ['D-CCD','Camera Packs','#626a67,#a8aaa0',{pack:'CCD',brightness:2,contrast:20,saturation:-16,warmth:-5,noise:14,sharpness:8,vignette:7}],
    ['G-CCD','Camera Packs','#9d813e,#e5c062',{pack:'CCD',brightness:8,contrast:15,saturation:7,warmth:16,noise:8,sharpness:5}],
    ['Kodak A1','Camera Packs','#98784e,#e6c38b',{pack:'CCD',brightness:7,contrast:10,saturation:3,warmth:17,fade:5,grain:8}],

    ['C200','Camera Packs','#96702f,#d7aa54',{pack:'Vintage Cam',brightness:3,contrast:13,saturation:-8,warmth:22,fade:8,grain:17,vignette:8}],
    ['FiN035','Camera Packs','#91846e,#d4c6aa',{pack:'Vintage Cam',brightness:8,contrast:-3,saturation:-14,warmth:10,fade:16,grain:11,bloom:5}],
    ['LOMO','Camera Packs','#6b4e46,#b8736b',{pack:'Vintage Cam',brightness:-1,contrast:25,saturation:14,warmth:10,tint:4,grain:19,vignette:27}],
    ['120ED','Camera Packs','#9d7958,#ddbb88',{pack:'Vintage Cam',brightness:6,contrast:6,saturation:-6,warmth:16,fade:8,grain:9,grainType:'Fine'}],
    ['MangaCore','Camera Packs','#77838f,#f1c8cf',{pack:'Vintage Cam',brightness:14,contrast:17,saturation:18,warmth:-8,tint:10,bloom:11,sharpness:8}],

    ['Polaroid 600','Instant','#92796f,#efe0cd',{pack:'Instant',brightness:11,contrast:-12,saturation:-10,warmth:12,fade:18,grain:7,bloom:7,autoFrame:'Polaroid'}],
    ['SX-70 Soft','Instant','#a77c66,#f2d1ad',{pack:'Instant',brightness:9,contrast:-9,saturation:-3,warmth:20,fade:15,grain:6,autoFrame:'Instant Square'}],
    ['Instax Mini','Instant','#a88882,#f3d8d2',{pack:'Instant',brightness:13,contrast:-11,saturation:-3,warmth:9,tint:4,fade:13,grain:5,autoFrame:'Instant Mini'}],
    ['Instax Wide','Instant','#8a8178,#e9dfd0',{pack:'Instant',brightness:10,contrast:-9,saturation:-11,warmth:5,fade:14,grain:5,autoFrame:'Instant Wide'}],
    ['Polaroid Date','Instant','#8d7771,#e9d6c9',{pack:'Instant',brightness:10,contrast:-8,saturation:-8,warmth:10,fade:14,grain:7,autoFrame:'Polaroid',autoDate:{style:'Tiny Digital',color:'Orange',position:'Bottom Right'}}]
  ].map(([name,cat,c,p])=>({id:name,name,cat,thumb:`linear-gradient(135deg,${c})`,p,kind:'builtin'}));

  const loadRecipes=()=>JSON.parse(localStorage.getItem('kira.recipes')||'[]');
  const loadNamedRolls=()=>{try{const v=JSON.parse(localStorage.getItem('kira.namedRolls')||'[]');return Array.isArray(v)?v:[]}catch(e){return []}};
  const state={
    image:null,imageName:'kira-photo',activeFilter:'Old Rose',activeCategory:'Kira',filterIntensity:100,filterSearch:'',
    adjustments:defaultAdjust(),effects:defaultEffects(),beauty:loadBeauty(),frame:'None',frameTone:'#fff8f1',frameWidth:8,frameCorner:8,caption:'',captionFont:'Classic Serif',captionSize:165,
    dateEnabled:false,dateStyle:'Classic',dateValue:today(),dateColor:'Orange',datePosition:'Bottom Right',dateCustomText:'',
    compare:false,exportQuality:'High',selectedRecipeId:null,
    favoriteFilters:new Set(JSON.parse(localStorage.getItem('kira.favoriteFilters')||'[]')),
    recipes:loadRecipes(),settings:Object.assign({},defaultSettings,JSON.parse(localStorage.getItem('kira.settings')||'{}')),
    namedRolls:loadNamedRolls(),activeNamedRollId:localStorage.getItem('kira.activeRoll')||'unfiled',rollViewId:'all',rollSearch:'',rollSort:'newest',recentLooks:JSON.parse(localStorage.getItem('kira.recentLooks')||'[]'),
    rolls:[],deferredInstallPrompt:null,activeRollFilter:'all',history:[],future:[],pendingSnapshot:null,cameraStream:null,cameraFacing:'environment',cameraReady:false,activeCameraCategory:'Kira',cameraThumbTimer:null,lastThumbPaint:0,thumbPaintPending:false,
    cameraRatio:localStorage.getItem('kira.cameraRatio')||'3:4',cameraTimer:Number(localStorage.getItem('kira.cameraTimer')||0),timerRunning:false,
    contactMode:false,selectedPhotoIds:new Set(),bulkSelectMode:false,bulkSelectedIds:new Set(),contactBlob:null,photoModalId:null,rollModalId:null,presetAutoDate:false,presetAutoFrame:false,captureMode:'photo',mediaRecorder:null,videoChunks:[],recording:false,recordStartedAt:0,recordTimer:null,videoAudioStream:null,pendingShareFile:null,pendingShareTitle:'',photosQueueIds:[],photoProcessQueue:[],photoProcessing:false,captureSequence:0,cameraTorchOn:false,cameraCapabilities:null,cameraZoomTimer:null,developInitialized:false,cameraImmersive:false
  };
  if(state.activeNamedRollId!=='unfiled'&&!state.namedRolls.some(r=>r.id===state.activeNamedRollId))state.activeNamedRollId='unfiled';
  if(state.settings.rememberFilter){const sf=localStorage.getItem('kira.lastFilter');if(sf&&allPresets().some(f=>f.name===sf))state.activeFilter=sf;}
  const settingsVersion=Number(localStorage.getItem('kira.settingsVersion')||0);if(settingsVersion<11.1){localStorage.setItem('kira.settingsVersion','11.1');localStorage.setItem('kira.settings',JSON.stringify(state.settings));}

  const adjustmentDefs=[['exposure','Exposure',-30,30],['brightness','Brightness',-40,40],['contrast','Contrast',-40,40],['highlights','Highlights',-40,40],['shadows','Shadows',-40,40],['saturation','Saturation',-50,50],['warmth','Warmth',-40,40],['tint','Tint',-40,40],['fade','Fade',0,40],['sharpness','Sharpness',0,30],['vignette','Vignette',0,40]];
  const effectDefs=[['grain','◌','Grain'],['bloom','✦','Bloom'],['dust','⠿','Dust'],['scratches','╱','Scratches'],['leak','◒','Light Leak'],['rgbSplit','RGB','RGB Split'],['noise','▦','CCD Noise'],['sparkle','✧','Sparkle']];
  const beautyDefs=[['smooth','Smooth skin'],['blemish','Acne / blemish'],['redness','Redness'],['brighten','Brighten'],['glow','Glow']];

  function haptic(ms=10){if(state.settings.haptics&&navigator.vibrate)navigator.vibrate(ms)}
  function toast(msg){const e=$('#toast');e.textContent=msg;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2300)}
  function saveSettings(){localStorage.setItem('kira.settings',JSON.stringify(state.settings));localStorage.setItem('kira.favoriteFilters',JSON.stringify([...state.favoriteFilters]));if(state.settings.rememberFilter)localStorage.setItem('kira.lastFilter',state.activeFilter)}
  function saveBeauty(){localStorage.setItem('kira.beauty',JSON.stringify(Object.assign(defaultBeauty(),state.beauty||{})))}
  function saveRecipes(){localStorage.setItem('kira.recipes',JSON.stringify(state.recipes));$('#recipeCount')&&($('#recipeCount').textContent=state.recipes.length)}
  function saveNamedRolls(){localStorage.setItem('kira.namedRolls',JSON.stringify(state.namedRolls));localStorage.setItem('kira.activeRoll',state.activeNamedRollId);$('#namedRollCount')&&($('#namedRollCount').textContent=state.namedRolls.length)}
  function rollName(id){if(!id||id==='unfiled')return 'Unfiled';return state.namedRolls.find(r=>r.id===id)?.name||'Unfiled'}
  function defaultRollId(){return 'unfiled'}
  function renderRollSelectors(){const opts=`<option value="unfiled" ${state.activeNamedRollId==='unfiled'?'selected':''}>Unfiled</option>`+state.namedRolls.map(r=>`<option value="${r.id}" ${r.id===state.activeNamedRollId?'selected':''}>${escapeHtml(r.name)}</option>`).join('');['#cameraRollSelect','#developRollSelect','#photoRollSelect'].forEach(s=>{const e=$(s);if(e)e.innerHTML=opts});$('#cameraRollBadge')&&($('#cameraRollBadge').textContent=rollName(state.activeNamedRollId));$('#namedRollCount')&&($('#namedRollCount').textContent=state.namedRolls.length);updateCameraHUD()}
  function setActiveRoll(id){if(id!=='unfiled'&&!state.namedRolls.some(r=>r.id===id))return;state.activeNamedRollId=id;localStorage.setItem('kira.activeRoll',id);renderRollSelectors();if(rollsVisible()){renderNamedRollBar();renderRolls()}haptic()}
  function allPresets(){return [...builtins,...state.recipes.map(recipeToPreset)]}
  function recipeToPreset(r){const base=builtins.find(x=>x.name===r.snapshot.activeFilter)||builtins[0];return {id:r.id,name:r.name,cat:'My Recipes',thumb:base.thumb,p:r.snapshot.adjustments||{},kind:'recipe',recipeId:r.id,pinned:!!r.pinned,snapshot:r.snapshot};}
  function findPreset(name){return allPresets().find(x=>x.name===name) || builtins[0]}
  function editSnapshot(){return JSON.parse(JSON.stringify({activeFilter:state.activeFilter,filterIntensity:state.filterIntensity,adjustments:state.adjustments,effects:state.effects,beauty:state.beauty,frame:state.frame,frameTone:state.frameTone,frameWidth:state.frameWidth,frameCorner:state.frameCorner,caption:state.caption,captionFont:state.captionFont,captionSize:state.captionSize,dateEnabled:state.dateEnabled,dateStyle:state.dateStyle,dateValue:state.dateValue,dateColor:state.dateColor,datePosition:state.datePosition,dateCustomText:state.dateCustomText}))}
  function applySnapshot(s){Object.assign(state,JSON.parse(JSON.stringify(s||{})));state.beauty=Object.assign(defaultBeauty(),state.beauty||{});if(!state.captionFont)state.captionFont='Classic Serif';if(!state.captionSize)state.captionSize=165;state.presetAutoDate=false;state.presetAutoFrame=false;$('#filterIntensity').value=state.filterIntensity;$('#intensityValue').textContent=state.filterIntensity;renderAllPanels();renderPhoto();applyLiveFilter();syncCameraBeautyControls();updateHistoryButtons();saveBeauty();saveSettings()}
  function commit(){state.history.push(editSnapshot());if(state.history.length>50)state.history.shift();state.future=[];updateHistoryButtons()}
  function undo(){if(!state.history.length)return;state.future.push(editSnapshot());applySnapshot(state.history.pop());toast('Undo')}
  function redo(){if(!state.future.length)return;state.history.push(editSnapshot());applySnapshot(state.future.pop());toast('Redo')}
  function updateHistoryButtons(){if($('#undoBtn'))$('#undoBtn').disabled=!state.history.length;if($('#redoBtn'))$('#redoBtn').disabled=!state.future.length}
  function startRangeHistory(){if(!state.pendingSnapshot)state.pendingSnapshot=editSnapshot()}
  function finishRangeHistory(){if(state.pendingSnapshot){state.history.push(state.pendingSnapshot);if(state.history.length>50)state.history.shift();state.pendingSnapshot=null;state.future=[];updateHistoryButtons();saveSettings()}}

  function ensureDevelopReady(){if(state.developInitialized)return;renderAllPanels();state.developInitialized=true}
  function openDrawer(){document.body.classList.add('drawer-open');$('#appDrawer')?.classList.add('open');$('#drawerBackdrop')?.classList.remove('hidden');$('#appDrawer')?.setAttribute('aria-hidden','false');$('#menuBtn')?.setAttribute('aria-expanded','true')}
  function closeDrawer(){document.body.classList.remove('drawer-open');$('#appDrawer')?.classList.remove('open');$('#drawerBackdrop')?.classList.add('hidden');$('#appDrawer')?.setAttribute('aria-hidden','true');$('#menuBtn')?.setAttribute('aria-expanded','false')}
  function switchScreen(name){if(state.recording&&name!=='camera'){toast('Stop recording before leaving Camera.');return}if(name!=='camera'&&state.cameraImmersive)setCameraImmersive(false);$$('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===name));$$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.target===name));$$('.drawer-nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.menuAction===name));document.body.classList.toggle('camera-mode',name==='camera');window.scrollTo(0,0);closeDrawer();if(name==='rolls'){renderNamedRollBar();renderRolls()}if(name==='camera'){renderCameraCategories();renderCameraFilters();updateCameraViewport();applyCameraRatio();bootCameraSafely()}else{stopCamera();if(name==='develop'){ensureDevelopReady();renderPhoto()}}renderRollSelectors();if(name==='settings'){updateStorageEstimate()}}
  function runMenuAction(action){closeDrawer();if(['camera','develop','rolls','settings'].includes(action)){switchScreen(action);return}if(action==='film-lab'){switchScreen('develop');ensureDevelopReady();document.querySelector('[data-tool="film-lab"]')?.click();return}if(action==='favorite-looks'){state.activeCategory='Favorites';switchScreen('develop');ensureDevelopReady();renderCategories();renderFilters();document.querySelector('[data-tool="filter"]')?.click();return}if(action==='surprise'){switchScreen('camera');randomizeLook();return}if(action==='contact-sheet'){switchScreen('rolls');setContactMode(true);return}if(action==='media-favorites'){state.activeRollFilter='favorites';switchScreen('rolls');$$('.roll-tabs .chip').forEach(x=>x.classList.toggle('active',x.dataset.rollFilter==='favorites'));renderRolls();return}if(action==='library-search'){switchScreen('rolls');setTimeout(()=>$('#rollSearch')?.focus(),120);return}if(action==='whats-new'){$('#whatsNewModal')?.classList.remove('hidden');return}if(action==='help'){$('#helpModal')?.classList.remove('hidden');return}if(action==='about'){switchScreen('settings');const d=$('.about-kira-group');if(d){d.open=true;setTimeout(()=>d.scrollIntoView({behavior:'smooth',block:'start'}),80)}return}}
  function presetCard(f){const fav=f.kind==='recipe'?(f.pinned?'♥':''):(state.favoriteFilters.has(f.name)?'♥':'');const label=f.kind==='recipe'?'Recipe':f.cat;return `<button class="preset-card ${state.activeFilter===f.name?'active':''}" data-filter="${escapeHtml(f.name)}" data-kind="${f.kind}" ${f.recipeId?`data-recipe-id="${f.recipeId}"`:''}><div class="preset-thumb" style="background:${f.thumb}"></div><span>${escapeHtml(f.name)}${fav?` <i class="favorite-star">${fav}</i>`:''}</span><small style="font-size:9px;color:#8f7072">${label}</small></button>`}
  function cameraPresetCard(f){const fav=f.kind==='recipe'?(f.pinned?'♥':''):(state.favoriteFilters.has(f.name)?'♥':'');return `<button class="preset-card ${cameraPresetIsActive(f)?'active':''}" data-camera-filter="${escapeHtml(f.name)}" data-kind="${f.kind}" ${f.recipeId?`data-recipe-id="${f.recipeId}"`:''}><div class="preset-thumb camera-swatch" style="background:${f.thumb}"></div><span>${escapeHtml(f.name)}${fav?` <i class="favorite-star">${fav}</i>`:''}</span><small>${f.kind==='recipe'?'Recipe':(f.p?.pack||f.cat)}</small></button>`}
  function cameraPresetIsActive(f){if(f.kind==='recipe')return state.selectedRecipeId===f.recipeId;return !state.selectedRecipeId&&state.activeFilter===f.name}
  function rememberRecentLook(name){if(!name)return;state.recentLooks=[name,...state.recentLooks.filter(x=>x!==name)].slice(0,8);localStorage.setItem('kira.recentLooks',JSON.stringify(state.recentLooks))}
  function recentPresetList(){return state.recentLooks.map(name=>allPresets().find(f=>f.name===name)).filter(Boolean)}
  function randomizeLook(){const choices=allPresets().filter(f=>f.kind==='builtin');if(!choices.length)return;const f=choices[Math.floor(Math.random()*choices.length)];state.activeCameraCategory='Recent';fastCameraSelect(f.name);renderCameraCategories();renderCameraFilters();applyLiveFilter();toast(`Surprise: ${f.name} ✦`)}
  function visiblePresets(){let list=state.activeCategory==='Recent'?recentPresetList():allPresets();if(state.activeCategory==='Favorites')list=list.filter(f=>f.kind==='recipe'?f.pinned:state.favoriteFilters.has(f.name));else if(!['All','Recent'].includes(state.activeCategory))list=list.filter(f=>f.cat===state.activeCategory);const q=state.filterSearch.trim().toLowerCase();if(q)list=list.filter(f=>f.name.toLowerCase().includes(q)||f.cat.toLowerCase().includes(q));if(state.activeCategory==='My Recipes')list.sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned));return list}
  function visibleCameraPresets(){const cat=state.activeCameraCategory;let list=cat==='Recent'?recentPresetList():allPresets();if(cat==='Favorites')list=list.filter(f=>f.kind==='recipe'?f.pinned:state.favoriteFilters.has(f.name));else if(!['All','Recent'].includes(cat))list=list.filter(f=>f.cat===cat);if(cat==='My Recipes')list.sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned));return list}
  function renderCameraCategories(){const cats=['Kira','Beauty','Mood','Lo-Fi','Recolor','Mono','Flash Night','Recent','Favorites','Camera Packs','Instant','Vintage','Date Cam','Film','Film Stock','CCD','Y2K','Dream','Japan','My Recipes','All'];const area=$('#cameraCategories');if(!area)return;if(!area.children.length){area.innerHTML=cats.map(c=>`<button class="chip ${state.activeCameraCategory===c?'active':''}" data-camera-cat="${c}">${c}</button>`).join('');area.onclick=e=>{const b=e.target.closest('[data-camera-cat]');if(!b||state.activeCameraCategory===b.dataset.cameraCat)return;state.activeCameraCategory=b.dataset.cameraCat;$$('[data-camera-cat]',area).forEach(x=>x.classList.toggle('active',x===b));renderCameraFilters();haptic()}}else{$$('[data-camera-cat]',area).forEach(x=>x.classList.toggle('active',x.dataset.cameraCat===state.activeCameraCategory))}}
  function renderCameraFilters(){const area=$('#cameraStrip');if(!area)return;const list=visibleCameraPresets();area.innerHTML=list.length?list.map(cameraPresetCard).join(''):'<div class="notice">No filters saved in this category yet.</div>';$$('[data-camera-filter]',area).forEach(btn=>btn.onclick=()=>{if(state.recording){toast('Finish recording before changing looks.');return}if(btn.dataset.kind==='recipe'&&btn.dataset.recipeId){fastCameraApplyRecipe(btn.dataset.recipeId)}else{fastCameraSelect(btn.dataset.cameraFilter)}syncCameraActiveCards();applyLiveFilter();updateLiveFrame()})}
  function syncCameraActiveCards(){$$('#cameraStrip [data-camera-filter]').forEach(btn=>{const active=btn.dataset.kind==='recipe'?state.selectedRecipeId===btn.dataset.recipeId:(!state.selectedRecipeId&&state.activeFilter===btn.dataset.cameraFilter);btn.classList.toggle('active',active)})}
  function fastCameraSelect(name){rememberRecentLook(name);state.activeFilter=name;state.selectedRecipeId=null;applyPresetExtras(name);if(state.settings.rememberFilter)localStorage.setItem('kira.lastFilter',name);updateCameraHUD();updateLiveFrame();saveSettings();haptic()}
  function fastCameraApplyRecipe(id){const recipe=state.recipes.find(x=>x.id===id);if(!recipe)return;rememberRecentLook(recipe.name);const snap=JSON.parse(JSON.stringify(recipe.snapshot||{}));Object.assign(state,snap);state.selectedRecipeId=id;state.presetAutoDate=false;state.presetAutoFrame=false;updateCameraHUD();updateLiveFrame();saveSettings();haptic()}
  function renderCategories(){const cats=['Kira','Beauty','Mood','Lo-Fi','Recolor','Mono','Flash Night','Recent','Favorites','Camera Packs','Instant','Vintage','Date Cam','Film','Film Stock','CCD','Y2K','Dream','Japan','My Recipes','All'];$('#filterCategories').innerHTML=cats.map(c=>`<button class="chip ${state.activeCategory===c?'active':''}" data-cat="${c}">${c}</button>`).join('');$('#filterCategories').onclick=e=>{const b=e.target.closest('[data-cat]');if(!b)return;state.activeCategory=b.dataset.cat;renderCategories();renderFilters();haptic()}}
  function renderFilters(){const list=visiblePresets();$('#filterRow').innerHTML=list.length?list.map(presetCard).join(''):'<div class="notice">No matching filters or recipes yet.</div>';$$('#filterRow .preset-card').forEach(btn=>{btn.onclick=()=>handlePresetSelect(btn.dataset.kind,btn.dataset.filter,btn.dataset.recipeId);let t;btn.addEventListener('pointerdown',()=>t=setTimeout(()=>btn.dataset.kind==='recipe'?toggleRecipePin(btn.dataset.recipeId):toggleFavorite(btn.dataset.filter),650));['pointerup','pointercancel','pointerleave'].forEach(x=>btn.addEventListener(x,()=>clearTimeout(t)))})}
  function handlePresetSelect(kind,name,recipeId){if(kind==='recipe'&&recipeId)return applyRecipe(recipeId,true);selectFilter(name)}
  function applyPresetExtras(name){const f=builtins.find(x=>x.name===name);if(!f)return;const p=f.p||{};if(state.presetAutoFrame&&!p.autoFrame&&state.frame===state.presetAutoFrame)state.frame='None';if(state.presetAutoDate&&!p.autoDate)state.dateEnabled=false;if(p.autoFrame){state.frame=p.autoFrame;state.presetAutoFrame=p.autoFrame}else state.presetAutoFrame=false;if(p.autoDate){state.dateEnabled=true;state.dateStyle=p.autoDate.style||'Classic';state.dateColor=p.autoDate.color||'Orange';state.datePosition=p.autoDate.position||'Bottom Right';state.dateValue=today();state.presetAutoDate=true}else state.presetAutoDate=false;if(p.beauty){state.beauty=Object.assign(defaultBeauty(),p.beauty);saveBeauty();syncCameraBeautyControls()}updateLiveDateStamp()}
  function prepareNewPhotoEdits(){
    if(state.selectedRecipeId)return;
    state.adjustments=defaultAdjust();
    state.effects=defaultEffects();
    state.frame='None';
    state.dateEnabled=false;
    state.dateStyle='Classic';
    state.dateColor='Orange';
    state.datePosition='Bottom Right';
    state.dateCustomText='';
    state.presetAutoDate=false;
    state.presetAutoFrame=false;
    applyPresetExtras(state.activeFilter);
  }
  function formatDateStamp(){const d=new Date(state.dateValue+'T12:00:00');if(Number.isNaN(d.getTime()))return '';const now=new Date(),yy=String(d.getFullYear()).slice(-2),yyyy=d.getFullYear(),mm=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0'),hh=String(now.getHours()).padStart(2,'0'),mi=String(now.getMinutes()).padStart(2,'0'),months=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];let text=`'${yy} ${mm} ${dd}`;if(state.dateStyle==='Digicam 98')text=`${dd} ${mm} '${yy}`;if(state.dateStyle==='Tiny Digital')text=`${mm}/${dd}/${yy}`;if(state.dateStyle==='2000s')text=`${months[d.getMonth()]} ${dd} ${yyyy}`;if(state.dateStyle==='Japanese')text=`${yy}.${mm}.${dd}`;if(state.dateStyle==='Date + Time')text=`${yy}.${mm}.${dd}  ${hh}:${mi}`;if(state.dateStyle==='Camcorder')text=`${yyyy}/${mm}/${dd}  ${hh}:${mi}`;if(state.dateStyle==='Film Lab')text=`KIRA 400 • ${yy} ${mm} ${dd}`;if(state.dateStyle==='Custom'&&state.dateCustomText.trim())text=state.dateCustomText.trim();return text}
  function updateLiveDateStamp(){const e=$('#liveDateStamp');if(!e)return;if(!state.dateEnabled){e.classList.add('hidden');return}e.textContent=formatDateStamp();e.className='live-date-stamp';e.classList.add('date-'+state.datePosition.toLowerCase().replaceAll(' ','-'),'datecolor-'+state.dateColor.toLowerCase())}
  function selectFilter(name){rememberRecentLook(name);if(name===state.activeFilter&&!state.selectedRecipeId){applyPresetExtras(name);renderFramePanel();renderDatePanel();renderPhoto();applyLiveFilter();return}commit();state.activeFilter=name;state.selectedRecipeId=null;applyPresetExtras(name);if(state.settings.rememberFilter)localStorage.setItem('kira.lastFilter',name);renderCategories();renderFilters();renderFilmLabPanel();renderFramePanel();renderDatePanel();renderPhoto();applyLiveFilter();updateCameraHUD();saveSettings();haptic()}
  function toggleFavorite(name){state.favoriteFilters.has(name)?state.favoriteFilters.delete(name):state.favoriteFilters.add(name);saveSettings();renderCategories();renderFilters();renderCameraFilters();toast(state.favoriteFilters.has(name)?'Saved to favorites ♥':'Removed from favorites');haptic(20)}
  function toggleRecipePin(id){const r=state.recipes.find(x=>x.id===id);if(!r)return;r.pinned=!r.pinned;saveRecipes();renderCategories();renderFilters();renderCameraFilters();renderFilmLabPanel();toast(r.pinned?'Recipe pinned ♥':'Recipe unpinned')}

  function rangeHistory(inp){inp.addEventListener('pointerdown',startRangeHistory);inp.addEventListener('focus',startRangeHistory);inp.addEventListener('change',finishRangeHistory)}
  function renderAdjustmentPanel(){
    $('#tool-adjust').innerHTML=`<div class="slider-list">${adjustmentDefs.map(([k,l,min,max])=>`<div class="slider-row"><label>${l}</label><input data-adj="${k}" type="range" min="${min}" max="${max}" value="${state.adjustments[k]}"><output id="out-${k}">${state.adjustments[k]}</output></div>`).join('')}<button class="secondary-btn" id="resetAdjustBtn">Reset adjustments</button></div>`;
    $$('[data-adj]').forEach(inp=>{rangeHistory(inp);inp.oninput=()=>{state.adjustments[inp.dataset.adj]=Number(inp.value);$('#out-'+inp.dataset.adj).textContent=inp.value;scheduleRender()}});
    $('#resetAdjustBtn').onclick=()=>{commit();state.adjustments=defaultAdjust();renderAdjustmentPanel();renderPhoto();saveSettings()};
  }

  function beautyActive(){const b=state.beauty||defaultBeauty();return beautyDefs.some(([k])=>Number(b[k]||0)>0)}
  function syncCameraBeautyControls(){const b=Object.assign(defaultBeauty(),state.beauty||{});for(const [k] of beautyDefs){const input=$(`[data-camera-beauty="${k}"]`),out=$(`[data-camera-beauty-out="${k}"]`);if(input&&Number(input.value)!==Number(b[k]))input.value=b[k];if(out)out.textContent=b[k]}const badge=$('#cameraBeautyBadge');if(badge){const max=Math.max(...beautyDefs.map(([k])=>Number(b[k]||0)));badge.textContent=max?`On • ${max}`:'Off'}}
  function bindCameraBeautyControls(){const wrap=$('#cameraBeautyControls');if(!wrap||wrap.dataset.bound==='1')return;wrap.dataset.bound='1';$$('[data-camera-beauty]',wrap).forEach(inp=>{inp.oninput=()=>{const key=inp.dataset.cameraBeauty;state.beauty[key]=Number(inp.value);const out=$(`[data-camera-beauty-out="${key}"]`,wrap);if(out)out.textContent=inp.value;syncCameraBeautyControls();scheduleLiveFilter();if($('#screen-develop')?.classList.contains('active'))scheduleRender()};inp.onchange=()=>{saveBeauty();renderBeautyPanel()}});$('#cameraBeautyResetBtn')&&( $('#cameraBeautyResetBtn').onclick=()=>{state.beauty=defaultBeauty();saveBeauty();syncCameraBeautyControls();renderBeautyPanel();scheduleLiveFilter();if($('#screen-develop')?.classList.contains('active'))renderPhoto();toast('Beauty reset')});syncCameraBeautyControls()}
  function renderBeautyPanel(){const area=$('#tool-beauty');if(!area)return;state.beauty=Object.assign(defaultBeauty(),state.beauty||{});area.innerHTML=`<div class="beauty-panel-card"><div class="beauty-panel-head"><div><strong>Beauty</strong><small>adjustable • keep it as natural or strong as you like</small></div><span>${beautyActive()?'On':'Off'}</span></div><div class="slider-list beauty-slider-list">${beautyDefs.map(([k,l])=>`<div class="slider-row"><label>${l}</label><input data-beauty="${k}" type="range" min="0" max="100" value="${state.beauty[k]}"><output id="beauty-out-${k}">${state.beauty[k]}</output></div>`).join('')}</div><div class="beauty-help">Acne / blemish targets uneven red or dark skin texture while Smooth softens overall skin. The saved photo uses Kira’s selective skin pass; the live camera stays intentionally lightweight.</div><button class="secondary-btn" id="resetBeautyBtn">Reset beauty</button></div>`;$$('[data-beauty]',area).forEach(inp=>{rangeHistory(inp);inp.oninput=()=>{state.beauty[inp.dataset.beauty]=Number(inp.value);$('#beauty-out-'+inp.dataset.beauty).textContent=inp.value;scheduleRender();syncCameraBeautyControls();scheduleLiveFilter()};inp.onchange=()=>{finishRangeHistory();saveBeauty();renderBeautyPanel()}});$('#resetBeautyBtn').onclick=()=>{commit();state.beauty=defaultBeauty();saveBeauty();renderBeautyPanel();syncCameraBeautyControls();renderPhoto();scheduleLiveFilter();toast('Beauty reset')};}

  function renderEffectsPanel(){
    $('#tool-effects').innerHTML=`<div class="effect-grid">${effectDefs.map(([k,ic,l])=>`<button class="effect-btn ${state.effects[k]>0?'active':''}" data-effect="${k}"><b>${ic}</b>${l}<small style="display:block;margin-top:5px">${state.effects[k]}%</small></button>`).join('')}</div><div class="sub-control"><div class="control-head"><span id="selectedEffectLabel">Grain strength</span><b id="effectValue">${state.effects.grain}</b></div><input id="effectStrength" type="range" min="0" max="45" value="${state.effects.grain}"><div id="effectVariantArea"></div></div>`;
    let selected='grain';
    const sync=()=>{const v=state.effects[selected];$('#effectStrength').value=v;$('#effectValue').textContent=v;$('#selectedEffectLabel').textContent=(effectDefs.find(x=>x[0]===selected)?.[2]||selected)+' strength';renderEffectVariants(selected)};
    $$('.effect-btn').forEach(b=>b.onclick=()=>{selected=b.dataset.effect;sync()});
    const slider=$('#effectStrength');rangeHistory(slider);slider.oninput=e=>{state.effects[selected]=Number(e.target.value);$('#effectValue').textContent=e.target.value;scheduleRender()};slider.onchange=()=>{finishRangeHistory();renderEffectsPanel();saveSettings()};sync();
  }
  function renderEffectVariants(selected){const area=$('#effectVariantArea');if(!area)return;let label='',opts=[],key='';if(selected==='grain'){label='Grain type';opts=['Fine','Classic','Rough'];key='grainType'}else if(selected==='bloom'){label='Glow style';opts=['Soft','Dream','Flash'];key='bloomType'}else if(selected==='leak'){label='Leak color';opts=['Red','Orange','Pink'];key='leakType'}else if(selected==='sparkle'){label='Sparkle style';opts=['Star','Dream','Heart'];key='sparkleType'}else{area.innerHTML='';return}area.innerHTML=`<div class="effect-control-title">${label}</div><div class="effect-options">${opts.map(o=>`<button class="option-chip ${state.effects[key]===o?'active':''}" data-variant="${o}" data-key="${key}">${o}</button>`).join('')}</div>`;$$('[data-variant]',area).forEach(b=>b.onclick=()=>{commit();state.effects[b.dataset.key]=b.dataset.variant;renderEffectsPanel();renderPhoto();saveSettings()})}

  function renderFramePanel(){const frames=[['None','◻'],['Classic','▣'],['Polaroid','▤'],['Instant Square','□'],['Instant Wide','▭'],['Instant Mini','▯'],['Instant Black','■'],['35mm','▥'],['Film Strip','▦'],['Mini Print','▧'],['Photo Booth','◫'],['Postcard','✉'],['Negative Edge','◩'],['Contact Print','◪']];const tones=['#fff8f1','#f0dfce','#e6c5aa','#d6a7a5','#201b1b'];const fonts=['Classic Serif','1989 Sparkle','Typewriter','Marker','Mono Label'];$('#tool-frame').innerHTML=`<div class="frame-grid">${frames.map(([n,i])=>`<button class="frame-btn ${state.frame===n?'active':''}" data-frame="${n}"><b>${i}</b>${n}</button>`).join('')}</div><div class="frame-controls"><div class="sub-control"><div class="control-head"><span>Border width</span><b>${state.frameWidth}</b></div><input id="frameWidth" type="range" min="2" max="24" value="${state.frameWidth}"></div><div class="sub-control"><div class="control-head"><span>Corner</span><b>${state.frameCorner}</b></div><input id="frameCorner" type="range" min="0" max="24" value="${state.frameCorner}"></div><div class="sub-control"><div class="control-head"><span>Paper tone</span></div><div class="tone-options">${tones.map(t=>`<button class="color-dot ${state.frameTone===t?'active':''}" data-tone="${t}" style="background:${t}"></button>`).join('')}</div></div><div class="control-card"><label class="control-head"><span>Caption</span></label><input class="caption-input" id="captionInput" maxlength="32" placeholder="good days ♡" value="${escapeHtml(state.caption)}"><select id="captionFontSelect" class="mini-select" style="margin-top:10px">${fonts.map(f=>`<option value="${f}" ${state.captionFont===f?'selected':''}>${f}</option>`).join('')}</select><div class="sub-control" style="margin-top:10px"><div class="control-head"><span>Caption size</span><b id="captionSizeValue">${state.captionSize}%</b></div><input id="captionSize" type="range" min="70" max="220" value="${state.captionSize}"></div><small class="control-help">“1989 Sparkle” now uses a custom bitmap alphabet built from your sample.</small></div></div>`;$$('.frame-btn').forEach(b=>b.onclick=()=>{commit();state.frame=b.dataset.frame;state.presetAutoFrame=false;renderFramePanel();renderPhoto();updateLiveFrame();saveSettings();haptic()});$$('[data-tone]').forEach(b=>b.onclick=()=>{commit();state.frameTone=b.dataset.tone;renderFramePanel();renderPhoto();saveSettings()});[['#frameWidth','frameWidth'],['#frameCorner','frameCorner'],['#captionSize','captionSize']].forEach(([s,k])=>{const e=$(s);rangeHistory(e);e.oninput=()=>{state[k]=Number(e.value);if(k==='captionSize')$('#captionSizeValue').textContent=`${state.captionSize}%`;scheduleRender()};e.onchange=()=>{finishRangeHistory();renderFramePanel();saveSettings()}});$('#captionInput').addEventListener('focus',startRangeHistory);$('#captionInput').oninput=e=>{state.caption=e.target.value;scheduleRender()};$('#captionInput').onchange=()=>{finishRangeHistory();saveSettings()};$('#captionFontSelect').addEventListener('focus',startRangeHistory);$('#captionFontSelect').onchange=e=>{state.captionFont=e.target.value;finishRangeHistory();renderPhoto();saveSettings()}}
  function renderDatePanel(){const styles=['Classic','Digicam 98','Tiny Digital','2000s','Japanese','Date + Time','Camcorder','Film Lab','Custom'];const colors=['Orange','Red','White','Green','Blue','Yellow','Pink'];const positions=['Bottom Right','Bottom Center','Bottom Left','Top Right','Top Center','Top Left'];$('#tool-date').innerHTML=`<div class="date-grid control-card"><label class="setting-row"><span>Show date stamp</span><input type="checkbox" id="dateEnabled" ${state.dateEnabled?'checked':''}></label><div class="inline-grid-2"><label>Style<select id="dateStyle">${styles.map(s=>`<option ${state.dateStyle===s?'selected':''}>${s}</option>`).join('')}</select></label><label>Date<input type="date" id="dateValue" value="${state.dateValue}"></label></div><label>Custom text<input class="date-custom-input" id="dateCustomText" maxlength="32" placeholder="AUG 11 2004" value="${escapeHtml(state.dateCustomText)}"></label><div><div class="effect-control-title">Stamp color</div><div class="date-color-grid">${colors.map(c=>`<button class="option-chip ${state.dateColor===c?'active':''}" data-date-color="${c}">${c}</button>`).join('')}</div></div><div><div class="effect-control-title">Position</div><div class="date-position-grid">${positions.map(p=>`<button class="option-chip ${state.datePosition===p?'active':''}" data-date-pos="${p}">${p.replace(' ','<br>')}</button>`).join('')}</div></div></div>`;$('#dateEnabled').onchange=e=>{commit();state.dateEnabled=e.target.checked;state.presetAutoDate=false;updateLiveDateStamp();renderPhoto();saveSettings()};$('#dateStyle').onchange=e=>{commit();state.dateStyle=e.target.value;state.presetAutoDate=false;updateLiveDateStamp();renderPhoto();saveSettings()};$('#dateValue').onchange=e=>{commit();state.dateValue=e.target.value;state.presetAutoDate=false;updateLiveDateStamp();renderPhoto();saveSettings()};$('#dateCustomText').addEventListener('focus',startRangeHistory);$('#dateCustomText').oninput=e=>{state.dateCustomText=e.target.value;state.presetAutoDate=false;updateLiveDateStamp();scheduleRender()};$('#dateCustomText').onchange=()=>{finishRangeHistory();saveSettings()};$$('[data-date-color]').forEach(b=>b.onclick=()=>{commit();state.dateColor=b.dataset.dateColor;state.presetAutoDate=false;updateLiveDateStamp();renderDatePanel();renderPhoto();saveSettings()});$$('[data-date-pos]').forEach(b=>b.onclick=()=>{commit();state.datePosition=b.dataset.datePos;state.presetAutoDate=false;updateLiveDateStamp();renderDatePanel();renderPhoto();saveSettings()})}
  function renderComparePanel(){$('#tool-compare').innerHTML='<div class="compare-card"><div class="compare-preview">Press and hold below to see the untouched original.<br><button class="secondary-btn" id="compareHoldBtn">Hold for Original</button></div></div>';const b=$('#compareHoldBtn'),on=()=>{state.compare=true;renderPhoto()},off=()=>{state.compare=false;renderPhoto()};b.addEventListener('pointerdown',on);['pointerup','pointercancel','pointerleave'].forEach(x=>b.addEventListener(x,off))}
  function renderFilmLabPanel(){const selected=state.recipes.find(x=>x.id===state.selectedRecipeId);$('#tool-film-lab').innerHTML=`<div class="film-lab-current"><div class="film-lab-eyebrow">Current Look</div><h3>${escapeHtml(selected?.name||state.activeFilter)}</h3><p>${selected?'Saved recipe':'Build a reusable recipe from everything currently applied to this photo.'}</p><input class="recipe-name-input" id="recipeNameInput" maxlength="28" placeholder="name this look" value="${escapeHtml(selected?.name||'')}"><div class="recipe-actions three"><button class="primary-btn" id="saveRecipeBtn">Save New</button><button class="secondary-btn" id="updateRecipeBtn">Update</button><button class="secondary-btn" id="duplicateRecipeBtn">Duplicate</button></div></div><div class="film-lab-section-head"><strong>My Recipes</strong><small>${state.recipes.length} saved</small></div><div class="recipe-list">${state.recipes.length?state.recipes.sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)).map(r=>`<div class="recipe-card ${state.selectedRecipeId===r.id?'active':''}" data-recipe-card="${r.id}"><div class="recipe-top"><div class="recipe-title"><span class="recipe-dot"></span><div>${escapeHtml(r.name)}<small>${escapeHtml(r.snapshot.activeFilter)} • ${r.pinned?'Pinned':'Custom recipe'}</small></div></div><button class="tiny-btn ${r.pinned?'rose':''}" data-pin-recipe="${r.id}">${r.pinned?'♥':'♡'}</button></div><div class="recipe-meta"><span>Strength ${r.snapshot.filterIntensity}</span><span>${escapeHtml(r.snapshot.frame)}</span><span>${r.snapshot.dateEnabled?escapeHtml(r.snapshot.dateStyle):'No date'}</span></div><div class="recipe-btn-row"><button class="tiny-btn rose" data-apply-recipe="${r.id}">Apply</button><button class="tiny-btn" data-fill-recipe="${r.id}">Edit</button><button class="tiny-btn" data-dup-recipe="${r.id}">Copy</button><button class="tiny-btn" data-del-recipe="${r.id}">Delete</button></div></div>`).join(''):'<div class="notice">No recipes yet. Name the current look above and tap Save New.</div>'}</div>`;
    $('#saveRecipeBtn').onclick=saveNewRecipe;$('#updateRecipeBtn').onclick=updateRecipe;$('#duplicateRecipeBtn').onclick=duplicateSelectedRecipe;if($('#recipeNameInput'))$('#recipeNameInput').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();saveNewRecipe()}};$$('[data-pin-recipe]').forEach(b=>b.onclick=()=>toggleRecipePin(b.dataset.pinRecipe));$$('[data-apply-recipe]').forEach(b=>b.onclick=()=>applyRecipe(b.dataset.applyRecipe,true));$$('[data-fill-recipe]').forEach(b=>b.onclick=()=>loadRecipeIntoFilmLab(b.dataset.fillRecipe));$$('[data-dup-recipe]').forEach(b=>b.onclick=()=>duplicateRecipeById(b.dataset.dupRecipe));$$('[data-del-recipe]').forEach(b=>b.onclick=()=>deleteRecipe(b.dataset.delRecipe));}
  function saveNewRecipe(){const name=($('#recipeNameInput')?.value||'').trim()||`recipe ${state.recipes.length+1}`;const recipe={id:uid(),name,pinned:false,snapshot:editSnapshot(),createdAt:Date.now()};state.recipes.unshift(recipe);state.selectedRecipeId=recipe.id;saveRecipes();renderCategories();renderFilters();renderFilmLabPanel();toast('Recipe saved ♥')}
  function updateRecipe(){if(!state.selectedRecipeId){toast('Select or load a recipe first.');return}const recipe=state.recipes.find(x=>x.id===state.selectedRecipeId);if(!recipe)return;const name=($('#recipeNameInput')?.value||'').trim();if(name)recipe.name=name;recipe.snapshot=editSnapshot();recipe.updatedAt=Date.now();saveRecipes();renderCategories();renderFilters();renderFilmLabPanel();toast('Recipe updated')}
  function duplicateRecipeById(id){const src=state.recipes.find(x=>x.id===id);if(!src)return;const copy={id:uid(),name:`${src.name} copy`,pinned:false,snapshot:JSON.parse(JSON.stringify(src.snapshot)),createdAt:Date.now()};state.recipes.unshift(copy);state.selectedRecipeId=copy.id;saveRecipes();renderCategories();renderFilters();renderFilmLabPanel();toast('Recipe duplicated')}
  function duplicateSelectedRecipe(){if(!state.selectedRecipeId){saveNewRecipe();return}duplicateRecipeById(state.selectedRecipeId)}
  function deleteRecipe(id){const recipe=state.recipes.find(x=>x.id===id);if(!recipe)return;if(!confirm(`Delete recipe "${recipe.name}"?`))return;state.recipes=state.recipes.filter(x=>x.id!==id);if(state.selectedRecipeId===id)state.selectedRecipeId=null;saveRecipes();renderCategories();renderFilters();renderFilmLabPanel();toast('Recipe deleted')}
  function loadRecipeIntoFilmLab(id){const recipe=state.recipes.find(x=>x.id===id);if(!recipe)return;state.selectedRecipeId=id;$('#recipeNameInput')&&($('#recipeNameInput').value=recipe.name);toast('Recipe loaded in Film Lab')}
  function applyRecipe(id,openDevelop){const recipe=state.recipes.find(x=>x.id===id);if(!recipe)return;commit();state.selectedRecipeId=id;applySnapshot(recipe.snapshot);state.activeCategory='My Recipes';renderCategories();renderFilters();renderFilmLabPanel();renderCameraFilters();applyLiveFilter();if(openDevelop)switchScreen('develop');toast(`Applied ${recipe.name}`)}

  function renderAllPanels(){renderCategories();renderFilters();renderAdjustmentPanel();renderBeautyPanel();renderEffectsPanel();renderFramePanel();renderDatePanel();renderComparePanel();renderFilmLabPanel();renderRollSelectors();updateCameraHUD();$('#recipeCount')&&($('#recipeCount').textContent=state.recipes.length)}
  function setupToolTabs(){$$('.tool-tab').forEach(btn=>btn.onclick=()=>{$$('.tool-tab').forEach(b=>b.classList.toggle('active',b===btn));$$('.tool-panel').forEach(p=>p.classList.remove('active'));$('#tool-'+btn.dataset.tool).classList.add('active');haptic()})}

  async function loadFile(file,source='gallery'){if(!file||!file.type.startsWith('image/')){toast('Please choose an image.');return}try{const url=URL.createObjectURL(file),img=new Image();img.onload=async()=>{URL.revokeObjectURL(url);prepareNewPhotoEdits();state.image=img;state.imageName=(file.name||'kira-photo').replace(/\.[^.]+$/,'');state.history=[];state.future=[];updateHistoryButtons();$('#emptyEditor').classList.add('hidden');$('#cameraEmpty').classList.add('hidden');fitCanvases(img);renderPhoto();switchScreen('develop');if(state.settings.keepOriginal){try{await storeRollPhoto(file,{kind:'original',name:state.imageName,filter:'Original',favorite:false,rollId:state.activeNamedRollId})}catch(e){}}toast(source==='camera'?'Photo ready to develop 🎞️':'Photo imported 🎞️');haptic(20)};img.onerror=()=>toast('Kira could not open that photo. Try JPG or PNG.');img.src=url}catch(e){console.error(e);toast('Could not load photo.')}
  }
  function fitCanvases(img){const max=1200,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale));const c=$('#editCanvas');if(c){c.width=w;c.height=h}}
  function filterParams(){
    const f=findPreset(state.activeFilter),mix=state.compare?0:state.filterIntensity/100;
    const get=k=>(Number((f.kind==='builtin'?f.p[k]:0)||0)*mix)+(state.compare?0:Number(state.adjustments[k]||0));
    const preset=f.kind==='builtin'?(f.p||{}):{};
    const userGrain=state.compare?0:Number(state.effects.grain||0),userBloom=state.compare?0:Number(state.effects.bloom||0),userLeak=state.compare?0:Number(state.effects.leak||0);
    return {exposure:get('exposure'),brightness:get('brightness'),contrast:get('contrast'),highlights:get('highlights'),shadows:get('shadows'),saturation:get('saturation'),warmth:get('warmth'),tint:get('tint'),fade:get('fade'),sharpness:get('sharpness'),vignette:get('vignette'),sepia:state.compare?0:Number(preset.sepia||0)*mix,hue:state.compare?0:Number(preset.hue||0)*mix,castColor:state.compare?null:(preset.castColor||null),castStrength:state.compare?0:Number(preset.castStrength||0)*mix,castMode:preset.castMode||'soft-light',softness:state.compare?0:Number(preset.softness||0)*mix,lowRes:state.compare?0:Number(preset.lowRes||0)*mix,scanlines:state.compare?0:Number(preset.scanlines||0)*mix,grain:state.compare?0:(Number(preset.grain||0)*mix+userGrain),grainType:userGrain>0?(state.effects.grainType||'Classic'):(preset.grainType||'Classic'),bloom:state.compare?0:(Number(preset.bloom||0)*mix+userBloom),bloomType:userBloom>0?(state.effects.bloomType||'Soft'):(preset.bloomType||'Soft'),dust:state.compare?0:(Number(preset.dust||0)*mix+Number(state.effects.dust||0)),scratches:state.compare?0:(Number(preset.scratches||0)*mix+Number(state.effects.scratches||0)),leak:state.compare?0:(Number(preset.leak||0)*mix+userLeak),leakType:userLeak>0?(state.effects.leakType||'Pink'):(preset.leakType||state.effects.leakType||'Pink'),rgbSplit:state.compare?0:(Number(preset.rgbSplit||0)*mix+Number(state.effects.rgbSplit||0)),noise:state.compare?0:(Number(preset.noise||0)*mix+Number(state.effects.noise||0)),sparkle:state.compare?0:Number(state.effects.sparkle||0),sparkleType:state.effects.sparkleType||'Star'};
  }
  let raf=0;function scheduleRender(){cancelAnimationFrame(raf);raf=requestAnimationFrame(renderPhoto)}
  function renderPhoto(){if(!state.image)return;const c=$('#editCanvas');if(!c)return;drawEdited(c,filterParams(),true)}

  function drawEdited(canvas,p,decorate=true){const ctx=canvas.getContext('2d',{alpha:false}),w=canvas.width,h=canvas.height;ctx.save();ctx.clearRect(0,0,w,h);ctx.fillStyle='#171414';ctx.fillRect(0,0,w,h);ctx.filter=cameraCssFromParams(p);ctx.drawImage(state.image,0,0,w,h);ctx.filter='none';
    applyPresetCast(ctx,w,h,p);
    if(p.shadows||p.highlights||p.tint)applyTonePixels(ctx,w,h,p);
    if(p.warmth){ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=Math.min(.34,Math.abs(p.warmth)/105);ctx.fillStyle=p.warmth>0?'#ff995e':'#4d94c2';ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}
    if(p.fade>0){ctx.globalAlpha=Math.min(.38,p.fade/95);ctx.fillStyle='#ead9c9';ctx.fillRect(0,0,w,h);ctx.globalAlpha=1}
    if(p.bloom>0)applyBloom(ctx,canvas,w,h,p.bloom,p.bloomType);
    applyBeautyPass(ctx,w,h,state.beauty);
    if(p.rgbSplit>0)applyRGBSplit(ctx,canvas,w,h,p.rgbSplit);
    if(p.lowRes>0)applyLowResolution(ctx,canvas,w,h,p.lowRes);
    if(p.leak>0)applyLeak(ctx,w,h,p.leak,p.leakType);
    if(p.noise>0)applyNoise(ctx,w,h,p.noise);
    if(p.grain>0)applyGrain(ctx,w,h,p.grain,p.grainType);
    if(p.scanlines>0)applyScanlines(ctx,w,h,p.scanlines);
    if(p.dust>0)applyDust(ctx,w,h,p.dust);
    if(p.scratches>0)applyScratches(ctx,w,h,p.scratches);
    if(p.sparkle>0)applySparkle(ctx,w,h,p.sparkle,p.sparkleType);
    if(p.sharpness>0)applySharpness(ctx,w,h,p.sharpness);
    if(p.vignette>0){const g=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.2,w/2,h/2,Math.max(w,h)*.72);g.addColorStop(.45,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(20,8,8,${Math.min(.52,p.vignette/80)})`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
    if(decorate&&!state.compare){if(state.frame!=='None')drawFrame(ctx,w,h);if(state.dateEnabled)drawDate(ctx,w,h)}ctx.restore()}
  function skinConfidence(r,g,b){
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
  }

  function applyPresetCast(ctx,w,h,p){const strength=clamp(Number(p.castStrength||0),0,60);if(!p.castColor||strength<=0)return;const allowed=new Set(['soft-light','multiply','screen','overlay','color']);ctx.save();ctx.globalCompositeOperation=allowed.has(p.castMode)?p.castMode:'soft-light';ctx.globalAlpha=Math.min(.58,strength/100);ctx.fillStyle=p.castColor;ctx.fillRect(0,0,w,h);ctx.restore()}
  function applyTonePixels(ctx,w,h,p){try{const im=ctx.getImageData(0,0,w,h),d=im.data,sh=p.shadows/100,hi=p.highlights/100,ti=p.tint/100;for(let i=0;i<d.length;i+=4){const lum=(d[i]+d[i+1]+d[i+2])/765,sm=(1-lum)*(1-lum),hm=lum*lum,sv=sh*48*sm,hv=hi*46*hm;d[i]=clamp(d[i]+sv+hv+ti*26,0,255);d[i+1]=clamp(d[i+1]+sv+hv-ti*15,0,255);d[i+2]=clamp(d[i+2]+sv+hv+ti*20,0,255)}ctx.putImageData(im,0,0)}catch(e){}}
  function applyBloom(ctx,canvas,w,h,s,type){ctx.save();ctx.globalCompositeOperation='screen';const mult=type==='Flash'?1.45:type==='Dream'?1.15:1;ctx.globalAlpha=Math.min(.34,s/100*mult);ctx.filter=`blur(${Math.max(2,w/(type==='Dream'?220:320))}px) brightness(${type==='Flash'?135:118}%)`;ctx.drawImage(canvas,0,0);ctx.restore()}
  function applyRGBSplit(ctx,canvas,w,h,s){const px=Math.max(1,Math.round(w*s/850));ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.22,s/40);ctx.drawImage(canvas,px,0,w,h);ctx.globalCompositeOperation='multiply';ctx.globalAlpha=Math.min(.12,s/55);ctx.drawImage(canvas,-px,0,w,h);ctx.restore()}
  function applyLowResolution(ctx,canvas,w,h,s){const amount=clamp(Number(s||0),0,100);if(amount<=0)return;const factor=1+amount/9,tw=Math.max(36,Math.round(w/factor)),th=Math.max(36,Math.round(h/factor)),tmp=applyLowResolution.buffer||(applyLowResolution.buffer=document.createElement('canvas'));if(tmp.width!==tw)tmp.width=tw;if(tmp.height!==th)tmp.height=th;const t=tmp.getContext('2d',{alpha:false});if(!t)return;t.clearRect(0,0,tw,th);t.imageSmoothingEnabled=true;t.drawImage(canvas,0,0,tw,th);ctx.save();ctx.imageSmoothingEnabled=amount<34;ctx.drawImage(tmp,0,0,tw,th,0,0,w,h);ctx.restore()}
  function applyScanlines(ctx,w,h,s){const amount=clamp(Number(s||0),0,100);if(amount<=0)return;const step=Math.max(3,Math.round(h/230)),line=Math.max(1,Math.round(step*.38));ctx.save();ctx.globalAlpha=Math.min(.24,amount/150);ctx.fillStyle='#120f12';for(let y=0;y<h;y+=step*2)ctx.fillRect(0,y,w,line);ctx.restore()}
  function applyLeak(ctx,w,h,s,type){const c=type==='Red'?'255,62,56':type==='Orange'?'255,145,64':'255,93,147',x=type==='Orange'?w*.9:w*.05;ctx.save();const g=ctx.createRadialGradient(x,h*.42,0,x,h*.42,w*.7);g.addColorStop(0,`rgba(${c},${Math.min(.48,s/90)})`);g.addColorStop(.5,`rgba(${c},${Math.min(.18,s/180)})`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.restore()}
  function seeded(i){const x=Math.sin(i*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
  function applyGrain(ctx,w,h,s,type){const density=Math.min(18000,Math.round(w*h/(type==='Fine'?380:type==='Rough'?180:260))),size=type==='Fine'?.8:type==='Rough'?1.9:1.15,alpha=Math.min(type==='Rough'?.22:.17,s/150);ctx.save();ctx.globalAlpha=alpha;for(let i=0;i<density;i++){const v=seeded(i*3)>.5?255:0;ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(seeded(i*3+1)*w,seeded(i*3+2)*h,size,size)}ctx.restore()}
  function applyNoise(ctx,w,h,s){const n=Math.min(9000,Math.round(w*h/350));ctx.save();ctx.globalAlpha=Math.min(.12,s/180);for(let i=0;i<n;i++){const v=120+Math.floor(seeded(i+700)*135);ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(seeded(i+1700)*w,seeded(i+2700)*h,1.3,1.3)}ctx.restore()}
  function applyDust(ctx,w,h,s){ctx.save();ctx.globalAlpha=Math.min(.28,s/100);ctx.fillStyle='#fff6ea';for(let i=0;i<Math.round(s*1.4);i++){const r=seeded(i+5)*2.8+.5;ctx.beginPath();ctx.arc(seeded(i+105)*w,seeded(i+205)*h,r,0,Math.PI*2);ctx.fill()}ctx.restore()}
  function applyScratches(ctx,w,h,s){ctx.save();ctx.globalAlpha=Math.min(.25,s/100);ctx.strokeStyle='#fff4e5';ctx.lineWidth=Math.max(.5,w/1500);for(let i=0;i<Math.round(s/3);i++){const x=seeded(i+40)*w,y=seeded(i+80)*h,len=h*(.08+seeded(i+120)*.42);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(seeded(i+150)-.5)*6,y+len);ctx.stroke()}ctx.restore()}
  function applySparkle(ctx,w,h,s,type){ctx.save();ctx.globalAlpha=Math.min(.5,s/100);ctx.strokeStyle=type==='Heart'?'#ffd5e5':'#fff2df';ctx.fillStyle=type==='Heart'?'rgba(255,215,232,.6)':'rgba(255,251,241,.55)';for(let i=0;i<Math.max(3,Math.round(s/3));i++){const x=seeded(i+410)*w,y=seeded(i+510)*h,rad=1.5+seeded(i+610)*Math.max(2,s/8);if(type==='Heart'){ctx.beginPath();ctx.moveTo(x,y+rad*.8);ctx.bezierCurveTo(x-rad*1.4,y-rad*.6,x-rad*2.2,y+rad*.7,x,y+rad*2);ctx.bezierCurveTo(x+rad*2.2,y+rad*.7,x+rad*1.4,y-rad*.6,x,y+rad*.8);ctx.fill()}else{ctx.beginPath();ctx.moveTo(x-rad,y);ctx.lineTo(x+rad,y);ctx.moveTo(x,y-rad);ctx.lineTo(x,y+rad);if(type==='Dream'){ctx.moveTo(x-rad*.7,y-rad*.7);ctx.lineTo(x+rad*.7,y+rad*.7);ctx.moveTo(x-rad*.7,y+rad*.7);ctx.lineTo(x+rad*.7,y-rad*.7)}ctx.stroke()}}ctx.restore()}
  function applySharpness(ctx,w,h,s){if(s<3)return;ctx.save();ctx.globalCompositeOperation='overlay';ctx.globalAlpha=Math.min(.16,s/190);ctx.filter='contrast(145%)';ctx.drawImage(ctx.canvas,0,0,w,h);ctx.restore()}
  function roundPath(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}

  const kira1989GlyphManifest={"A":{"file":"65.png","w":85,"h":101},"a":{"file":"97.png","w":78,"h":64},"B":{"file":"66.png","w":102,"h":100},"b":{"file":"98.png","w":81,"h":94},"C":{"file":"67.png","w":106,"h":99},"c":{"file":"99.png","w":72,"h":71},"D":{"file":"68.png","w":102,"h":102},"d":{"file":"100.png","w":59,"h":101},"E":{"file":"69.png","w":93,"h":98},"e":{"file":"101.png","w":69,"h":74},"F":{"file":"70.png","w":78,"h":99},"f":{"file":"102.png","w":62,"h":102},"G":{"file":"71.png","w":94,"h":101},"g":{"file":"103.png","w":68,"h":100},"H":{"file":"72.png","w":92,"h":102},"h":{"file":"104.png","w":88,"h":102},"I":{"file":"73.png","w":104,"h":94},"i":{"file":"105.png","w":39,"h":98},"J":{"file":"74.png","w":77,"h":102},"j":{"file":"106.png","w":51,"h":128},"K":{"file":"75.png","w":88,"h":99},"k":{"file":"107.png","w":80,"h":91},"L":{"file":"76.png","w":88,"h":92},"l":{"file":"108.png","w":33,"h":100},"M":{"file":"77.png","w":107,"h":97},"m":{"file":"109.png","w":111,"h":66},"N":{"file":"78.png","w":89,"h":97},"n":{"file":"110.png","w":80,"h":72},"O":{"file":"79.png","w":98,"h":102},"o":{"file":"111.png","w":66,"h":67},"P":{"file":"80.png","w":79,"h":101},"p":{"file":"112.png","w":90,"h":101},"Q":{"file":"81.png","w":98,"h":100},"q":{"file":"113.png","w":87,"h":92},"R":{"file":"82.png","w":113,"h":98},"r":{"file":"114.png","w":73,"h":75},"S":{"file":"83.png","w":62,"h":97},"s":{"file":"115.png","w":51,"h":74},"T":{"file":"84.png","w":125,"h":107},"t":{"file":"116.png","w":92,"h":103},"U":{"file":"85.png","w":95,"h":102},"u":{"file":"117.png","w":79,"h":71},"V":{"file":"86.png","w":99,"h":100},"v":{"file":"118.png","w":83,"h":72},"W":{"file":"87.png","w":122,"h":96},"w":{"file":"119.png","w":106,"h":68},"X":{"file":"88.png","w":77,"h":92},"x":{"file":"120.png","w":92,"h":74},"Y":{"file":"89.png","w":70,"h":101},"y":{"file":"121.png","w":68,"h":102},"Z":{"file":"90.png","w":91,"h":94},"z":{"file":"122.png","w":85,"h":77},"1":{"file":"49.png","w":38,"h":101},"2":{"file":"50.png","w":83,"h":92},"3":{"file":"51.png","w":69,"h":97},"4":{"file":"52.png","w":68,"h":100},"5":{"file":"53.png","w":93,"h":99},"6":{"file":"54.png","w":70,"h":98},"7":{"file":"55.png","w":83,"h":96},"8":{"file":"56.png","w":70,"h":98},"9":{"file":"57.png","w":70,"h":97}," ":{"file":null,"w":42,"h":80},"0":{"file":"48.png","w":85,"h":91}};
  const kira1989GlyphCache={};
  let kira1989GlyphPromise=null;
  function ensure1989Glyphs(){
    if(kira1989GlyphPromise)return kira1989GlyphPromise;
    const entries=Object.entries(kira1989GlyphManifest).filter(([,meta])=>meta&&meta.file);
    kira1989GlyphPromise=Promise.all(entries.map(([ch,meta])=>new Promise(resolve=>{
      const img=new Image();
      img.onload=()=>{kira1989GlyphCache[ch]={img,w:meta.w,h:meta.h};resolve();};
      img.onerror=()=>resolve();
      img.src=`./assets/fonts1989/${meta.file}`;
    }))).then(()=>true).catch(()=>false);
    return kira1989GlyphPromise;
  }
  function measure1989Text(text,size){
    const spacing=Math.max(2,size*0.08);
    let width=0;
    for(const ch of String(text||'')){
      if(ch===' '){width+=size*0.38+spacing;continue;}
      const meta=kira1989GlyphManifest[ch];
      if(meta&&meta.w&&meta.h)width+=size*(meta.w/meta.h)+spacing;
      else width+=size*0.55+spacing;
    }
    return Math.max(0,width-spacing);
  }
  function draw1989Text(ctx,text,x,y,size,color,maxWidth,align='center'){
    text=String(text||'').trim();
    if(!text)return;
    const rawWidth=measure1989Text(text,size);
    const scale=(maxWidth&&rawWidth>maxWidth)?(maxWidth/rawWidth):1;
    const drawSize=size*scale;
    const spacing=Math.max(2,drawSize*0.08);
    const totalWidth=measure1989Text(text,drawSize);
    let cursor=x;
    if(align==='center')cursor=x-totalWidth/2;
    else if(align==='right')cursor=x-totalWidth;
    const baselineTop=y-drawSize/2;
    ctx.save();
    for(const ch of text){
      if(ch===' '){cursor+=drawSize*0.38+spacing;continue;}
      const glyph=kira1989GlyphCache[ch];
      const meta=kira1989GlyphManifest[ch];
      if(glyph&&meta){
        const gw=drawSize*(meta.w/meta.h), gh=drawSize;
        const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(gw)); c.height=Math.max(1,Math.round(gh));
        const gctx=c.getContext('2d');
        gctx.drawImage(glyph.img,0,0,c.width,c.height);
        gctx.globalCompositeOperation='source-in'; gctx.fillStyle=color; gctx.fillRect(0,0,c.width,c.height);
        ctx.drawImage(c,Math.round(cursor),Math.round(baselineTop),c.width,c.height);
        cursor+=gw+spacing;
      }else{
        ctx.fillStyle=color;
        ctx.font=`${Math.max(12,drawSize*0.9)}px 'Marker Felt', 'Comic Sans MS', cursive`;
        ctx.textAlign='left'; ctx.textBaseline='middle';
        ctx.fillText(ch,cursor,y);
        cursor+=drawSize*0.55+spacing;
      }
    }
    ctx.restore();
  }
  function drawCaptionText(ctx,text,fontName,size,color,x,y,maxWidth,align='center'){
    if(fontName==='1989 Sparkle' && Object.keys(kira1989GlyphCache).length){
      draw1989Text(ctx,text,x,y,size,color,maxWidth,align); return;
    }
    ctx.fillStyle=color; ctx.textAlign=align; ctx.textBaseline='middle'; ctx.font=captionFontCss(fontName,size); ctx.fillText(text,x,y,maxWidth);
  }
  function captionFontCss(name,size){const map={'Classic Serif':`italic ${size}px Georgia, 'Times New Roman', serif`,'1989 Sparkle':`600 ${size}px 'Chalkboard SE', 'Chalkboard', 'Marker Felt', 'Noteworthy', 'Comic Sans MS', cursive`,'Typewriter':`${size}px 'Courier New', 'American Typewriter', ui-monospace, monospace`,'Marker':`italic ${size}px 'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive`,'Mono Label':`${size}px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace`};return map[name]||map['Classic Serif']}
  function isInstantCaptionFrame(frame){return ['Polaroid','Instant Square','Instant Wide','Instant Mini','Instant Black'].includes(frame)}
  function drawFrame(ctx,w,h){
    const m=Math.round(Math.min(w,h)*(state.frameWidth/110)),corner=Math.round(Math.min(w,h)*(state.frameCorner/500));
    const instant=['Polaroid','Instant Square','Instant Wide','Instant Mini','Instant Black'];
    if(state.frame==='Classic'||state.frame==='Mini Print'||state.frame==='Postcard'||instant.includes(state.frame)){
      ctx.save();
      const black=state.frame==='Instant Black';
      const tone=black?'#171414':state.frameTone;
      ctx.strokeStyle=tone;ctx.lineWidth=m*2;roundPath(ctx,m/2,m/2,w-m,h-m,corner);ctx.stroke();
      if(instant.includes(state.frame)||state.frame==='Mini Print'||state.frame==='Postcard'){
        let pct=.08;
        if(state.frame==='Instant Square'||state.frame==='Polaroid')pct=.105;
        if(state.frame==='Instant Wide')pct=.065;
        if(state.frame==='Instant Mini')pct=.08;
        if(state.frame==='Instant Black')pct=.10;
        if(state.frame==='Mini Print')pct=.06;
        if(state.frame==='Postcard')pct=.10;
        const footer=Math.round(h*pct+state.frameWidth*1.4);
        ctx.fillStyle=tone;ctx.fillRect(0,h-footer,w,footer);
        if(state.caption){const capColor=black?'#f8eee7':state.frame==='Postcard'?'#8b5d4b':'#6a4d4e';const capScale=(state.captionSize||165)/100;drawCaptionText(ctx,state.caption,state.captionFont,Math.max(16,Math.round(w*.04*capScale)),capColor,w/2,h-footer*.36,w*.82,'center')}
      }
      if(state.frame==='Postcard'){ctx.strokeStyle='rgba(106,77,78,.24)';ctx.beginPath();ctx.moveTo(w*.55,m*1.6);ctx.lineTo(w*.55,h-m*1.6);ctx.moveTo(w*.65,h*.25);ctx.lineTo(w*.88,h*.25);ctx.stroke()}
      ctx.restore();
    }else if(state.frame==='35mm'){
      ctx.save();ctx.fillStyle='#151313';const band=Math.round(h*(.045+state.frameWidth/210));ctx.fillRect(0,0,w,band);ctx.fillRect(0,h-band,w,band);ctx.fillStyle='#f0c777';ctx.font=`${Math.max(14,Math.round(w*.023))}px monospace`;ctx.fillText('KIRA 400',band*.25,band*.67);ctx.fillText('24 EXP',w-band*1.8,h-band*.3);ctx.restore();
    }else if(state.frame==='Film Strip'||state.frame==='Negative Edge'){
      ctx.save();ctx.fillStyle='#111';const side=Math.round(w*(.045+state.frameWidth/230));ctx.fillRect(0,0,side,h);ctx.fillRect(w-side,0,side,h);ctx.fillStyle=state.frame==='Negative Edge'?'#ffb54c':'#e8d9c8';const hole=Math.max(4,Math.round(side*.25));for(let y=hole;y<h;y+=hole*2.2){ctx.fillRect(side*.25,y,hole,hole*.7);ctx.fillRect(w-side*.7,y,hole,hole*.7)}ctx.restore();
    }else if(state.frame==='Photo Booth'){
      ctx.save();ctx.fillStyle=state.frameTone;const gap=Math.round(w*.03),col=Math.round(w*.22),stripX=w-col-gap,innerX=stripX+gap,innerW=col-gap*2,imgH=(h-gap*4)/3;ctx.fillRect(stripX,0,col,h);for(let i=0;i<3;i++){ctx.strokeStyle='rgba(120,92,94,.25)';ctx.strokeRect(innerX,gap*(i+1)+imgH*i,innerW,imgH)}if(state.caption){const stripScale=(state.captionSize||165)/100;drawCaptionText(ctx,state.caption,state.captionFont,Math.max(12,Math.round(w*.025*stripScale)),'#6a4d4e',innerX+6,h-gap*1.5,innerW-12,'left')}ctx.restore();
    }else if(state.frame==='Contact Print'){
      ctx.save();ctx.fillStyle=state.frameTone;ctx.fillRect(0,0,w,h);ctx.strokeStyle='rgba(70,52,54,.14)';const cols=4,rows=4,margin=w*.06,cellW=(w-margin*2)/cols,cellH=(h-margin*2)/rows;for(let r=0;r<rows;r++){for(let c=0;c<cols;c++){ctx.strokeRect(margin+c*cellW,margin+r*cellH,cellW-4,cellH-4)}}ctx.fillStyle='#8d6e70';ctx.font=`${Math.max(12,Math.round(w*.025))}px monospace`;ctx.fillText('CONTACT PRINT',margin,h-margin*.35);ctx.restore();
    }
  }
  function drawDate(ctx,w,h){const text=formatDateStamp();if(!text)return;const colors={Orange:'#ff983e',Red:'#f2675e',White:'#fff7e8',Green:'#72d48c',Blue:'#72b6ff',Yellow:'#ffd75d',Pink:'#ff91bf'};ctx.save();const size=Math.max(14,Math.round(w*.032));ctx.font=`bold ${size}px ui-monospace,monospace`;ctx.shadowColor='rgba(80,30,10,.35)';ctx.shadowBlur=2;ctx.fillStyle=colors[state.dateColor]||colors.Orange;let x=w*.95,y=h*.94,align='right',base='bottom';if(state.datePosition==='Bottom Center'){x=w*.5;align='center';y=h*.94;base='bottom'}else if(state.datePosition==='Bottom Left'){x=w*.05;align='left';y=h*.94;base='bottom'}else if(state.datePosition==='Top Right'){x=w*.95;align='right';y=h*.06;base='top'}else if(state.datePosition==='Top Center'){x=w*.5;align='center';y=h*.06;base='top'}else if(state.datePosition==='Top Left'){x=w*.05;align='left';y=h*.06;base='top'}ctx.textAlign=align;ctx.textBaseline=base;ctx.fillText(text,x,y);ctx.restore()}

  function cameraCssFromParams(p){const br=Math.max(25,100+Number(p.brightness||0)+Number(p.exposure||0)*1.5),co=Math.max(25,100+Number(p.contrast||0)),sa=Math.max(0,100+Number(p.saturation||0));const sep=clamp(Number(p.sepia||0)+(Number(p.warmth||0)>0?Number(p.warmth||0)*.28:0),0,72);const hue=clamp(Number(p.hue||0)+Number(p.tint||0)*.22+(Number(p.warmth||0)<0?-Number(p.warmth||0)*.07:0),-55,55);const blur=clamp(Number(p.softness||0)+Number(p.lowRes||0)/180,0,3);return `brightness(${br}%) contrast(${co}%) saturate(${sa}%) sepia(${sep}%) hue-rotate(${hue}deg) blur(${blur.toFixed(2)}px)`}
  function liveParamsForPreset(f){if(f.kind==='recipe'&&f.snapshot){return filterParamsForSnapshot(f.snapshot)}const mix=state.filterIntensity/100,p=f.p||{};return {exposure:Number(p.exposure||0)*mix,brightness:Number(p.brightness||0)*mix,contrast:Number(p.contrast||0)*mix,saturation:Number(p.saturation||0)*mix,warmth:Number(p.warmth||0)*mix,tint:Number(p.tint||0)*mix,fade:Number(p.fade||0)*mix,vignette:Number(p.vignette||0)*mix,bloom:Number(p.bloom||0)*mix,sepia:Number(p.sepia||0)*mix,hue:Number(p.hue||0)*mix,castColor:p.castColor||null,castStrength:Number(p.castStrength||0)*mix,castMode:p.castMode||'soft-light',softness:Number(p.softness||0)*mix,lowRes:Number(p.lowRes||0)*mix,scanlines:Number(p.scanlines||0)*mix}}
  function currentLiveParams(){const p=filterParams();return {exposure:p.exposure,brightness:p.brightness,contrast:p.contrast,saturation:p.saturation,warmth:p.warmth,tint:p.tint,fade:p.fade,vignette:p.vignette,bloom:p.bloom,sepia:p.sepia,hue:p.hue,castColor:p.castColor,castStrength:p.castStrength,castMode:p.castMode,softness:p.softness,lowRes:p.lowRes,scanlines:p.scanlines}}
  function updateLiveFrame(){const el=$('#liveFrameOverlay');if(!el)return;const map={'Polaroid':'frame-polaroid','Instant Square':'frame-instant-square','Instant Wide':'frame-instant-wide','Instant Mini':'frame-instant-mini','Instant Black':'frame-instant-black','Classic':'frame-classic','35mm':'frame-35mm','Film Strip':'frame-film-strip'};el.className='live-frame-overlay';const cls=map[state.frame];if(!cls){el.classList.add('hidden');return}el.classList.add(cls);el.classList.remove('hidden')}
  let liveFilterFrame=0;
  function scheduleLiveFilter(){if(liveFilterFrame)return;liveFilterFrame=requestAnimationFrame(()=>{liveFilterFrame=0;applyLiveFilter()})}
  function applyLiveFilter(){const video=$('#cameraVideo');if(!video)return;const p=currentLiveParams(),b=Object.assign(defaultBeauty(),state.beauty||{}),beautyBlur=Math.min(1.08,Number(b.smooth||0)*.0068+Number(b.blemish||0)*.0036),beautyBright=Number(b.brighten||0)*.052,beautySat=Math.max(91,100-Number(b.redness||0)*.06);video.style.filter=`${cameraCssFromParams(p)} brightness(${(100+beautyBright).toFixed(2)}%) saturate(${beautySat.toFixed(2)}%) blur(${beautyBlur.toFixed(2)}px)`;video.style.imageRendering=Number(p.lowRes||0)>55?'pixelated':'auto';const tone=$('#liveToneOverlay'),fade=$('#liveFadeOverlay'),vig=$('#liveVignetteOverlay'),texture=$('#liveTextureOverlay');if(tone){if(p.castColor&&Number(p.castStrength)>0){tone.style.background=p.castColor;tone.style.opacity=String(Math.min(.55,Number(p.castStrength)/100));tone.style.mixBlendMode=p.castMode||'soft-light'}else{const warm=Number(p.warmth||0),tint=Number(p.tint||0);let c='255,151,94',op=Math.min(.28,Math.abs(warm)/115);if(warm<0)c='76,145,205';if(Math.abs(tint)>Math.abs(warm)){c=tint>0?'230,112,155':'92,162,118';op=Math.min(.22,Math.abs(tint)/135)}tone.style.background=`rgb(${c})`;tone.style.opacity=String(op);tone.style.mixBlendMode='soft-light'}}if(fade)fade.style.opacity=String(Math.min(.28,Math.max(0,p.fade||0)/130));if(vig)vig.style.opacity=String(Math.min(.62,Math.max(0,p.vignette||0)/58));if(texture){const scan=Number(p.scanlines||0),low=Number(p.lowRes||0),layers=[];if(scan>0)layers.push('repeating-linear-gradient(to bottom,rgba(255,255,255,.08) 0 1px,rgba(0,0,0,.20) 1px 2px,transparent 2px 5px)');if(low>22)layers.push('repeating-linear-gradient(to right,rgba(255,255,255,.035) 0 1px,transparent 1px 4px)');texture.style.background=layers.length?layers.join(','):'none';texture.style.opacity=String(layers.length?Math.min(.30,scan/150+low/500):0);texture.style.mixBlendMode='overlay'}syncCameraBeautyControls()}
  function updateCameraViewport(){if(!$('#screen-camera')?.classList.contains('active'))return;const top=$('.topbar')?.getBoundingClientRect().bottom||0,navH=$('.bottom-nav')?.getBoundingClientRect().height||70,vh=window.visualViewport?.height||window.innerHeight;const h=Math.max(420,Math.floor(vh-top-navH));document.documentElement.style.setProperty('--camera-screen-h',h+'px')}
  function setCaptureMode(mode){
    if(state.recording)return;
    state.captureMode=mode==='video'?'video':'photo';
    $$('[data-capture-mode]').forEach(b=>b.classList.toggle('active',b.dataset.captureMode===state.captureMode));
    const shutter=$('#shutterBtn');
    if(shutter){shutter.classList.toggle('video-mode',state.captureMode==='video');shutter.setAttribute('aria-label',state.captureMode==='video'?'Start video recording':'Take photo')}
    if(state.captureMode==='video')toast('Video mode: smooth recording uses the original camera color. Your selected look stays as a live preview.');
  }
  function recorderMime(){
    if(!window.MediaRecorder)return '';
    const types=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp8,opus','video/webm'];
    return types.find(t=>!MediaRecorder.isTypeSupported||MediaRecorder.isTypeSupported(t))||'';
  }
  function videoExt(type=''){return type.includes('mp4')?'mp4':'webm'}
  function formatRecordTime(ms){const s=Math.max(0,Math.floor(ms/1000)),m=Math.floor(s/60);return `${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
  function updateRecordingUI(){
    const on=state.recording;
    document.body.classList.toggle('camera-recording',on);
    $('#recordingHud')?.classList.toggle('hidden',!on);
    $('#shutterBtn')?.classList.toggle('recording',on);
    if(!on&&$('#recordTime'))$('#recordTime').textContent='00:00';
  }
  async function getVideoAudioTrack(){
    if(!state.settings.videoAudio||!navigator.mediaDevices?.getUserMedia)return null;
    try{
      const s=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});
      state.videoAudioStream=s;
      return s.getAudioTracks()[0]||null;
    }catch(e){console.warn('Kira microphone:',e);toast('Microphone unavailable — recording video without sound.');return null}
  }
  function stopVideoAudio(){if(state.videoAudioStream){state.videoAudioStream.getTracks().forEach(t=>t.stop());state.videoAudioStream=null}}
  async function startVideoRecording(){
    if(state.recording||state.timerRunning)return;
    if(!window.MediaRecorder){toast('Video recording is not supported by this browser.');return}
    if(!state.cameraReady){await startCamera(true);if(!state.cameraReady)return}
    await runCameraCountdown();if(!state.cameraReady)return;
    const videoTrack=state.cameraStream?.getVideoTracks?.()[0];
    if(!videoTrack){toast('Camera is not ready.');return}
    const audioTrack=await getVideoAudioTrack();
    const tracks=[videoTrack];if(audioTrack)tracks.push(audioTrack);
    const recStream=new MediaStream(tracks);
    const mime=recorderMime();
    const bitrate=state.settings.videoQuality==='high'?6500000:2800000;
    let recorder;
    try{recorder=new MediaRecorder(recStream,{...(mime?{mimeType:mime}:{}),videoBitsPerSecond:bitrate,audioBitsPerSecond:128000})}
    catch(e){try{recorder=new MediaRecorder(recStream)}catch(err){console.warn(err);stopVideoAudio();toast('Kira could not start video recording.');return}}
    state.mediaRecorder=recorder;state.videoChunks=[];
    recorder.ondataavailable=e=>{if(e.data&&e.data.size)state.videoChunks.push(e.data)};
    recorder.onerror=e=>{console.warn('Kira recording:',e);toast('Video recording stopped unexpectedly.')};
    recorder.onstop=async()=>{
      const type=recorder.mimeType||mime||state.videoChunks[0]?.type||'video/mp4';
      const blob=new Blob(state.videoChunks,{type});
      state.videoChunks=[];state.mediaRecorder=null;stopVideoAudio();
      if(blob.size<1000){toast('That video was too short to save.');return}
      const ext=videoExt(type),name=`kira-video-${Date.now()}`;
      const videoId=await storeRollPhoto(blob,{kind:'video',mediaType:'video',name,filter:state.activeFilter,favorite:false,rollId:state.activeNamedRollId,videoPreviewLook:state.activeFilter});
      const file=new File([blob],`${name}.${ext}`,{type});
      if(state.settings.autoPhotos){state.pendingShareFile=file;state.pendingShareTitle='Kira video';showSavePhotosPrompt(file,'Kira video')}
      toast(`Video saved to ${rollName(state.activeNamedRollId)} 🎥`);
      haptic(25);
    };
    recorder.start(750);
    state.recording=true;state.recordStartedAt=Date.now();updateRecordingUI();
    clearInterval(state.recordTimer);state.recordTimer=setInterval(()=>{if($('#recordTime'))$('#recordTime').textContent=formatRecordTime(Date.now()-state.recordStartedAt)},250);
    haptic(30);
  }
  function stopVideoRecording(){
    if(!state.recording)return;
    state.recording=false;clearInterval(state.recordTimer);state.recordTimer=null;updateRecordingUI();
    try{if(state.mediaRecorder&&state.mediaRecorder.state!=='inactive')state.mediaRecorder.stop()}catch(e){console.warn(e);stopVideoAudio()}
    haptic(20);
  }
  async function captureOrRecord(){if(state.captureMode==='video'){state.recording?stopVideoRecording():await startVideoRecording();return}captureLivePhoto()}
  function hideSavePhotosPrompt(){state.pendingShareFile=null;state.pendingShareTitle='';$('#savePhotosPrompt')?.classList.add('hidden')}
  function showSavePhotosPrompt(file,title){
    state.pendingShareFile=file;state.pendingShareTitle=title||'Kira media';
    const text=file.type.startsWith('video/')?'Your video is ready.':'Your photo is ready.';
    $('#savePhotosPromptText')&&($('#savePhotosPromptText').textContent=`${text} Tap once to open iPhone’s save/share sheet.`);
    $('#savePhotosPrompt')?.classList.remove('hidden');
  }
  async function shareFileNow(file,title){
    if(!file)return false;
    if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){
      try{await navigator.share({files:[file],title:title||'Kira'});hideSavePhotosPrompt();return true}
      catch(e){if(e?.name==='AbortError'){hideSavePhotosPrompt();return true}console.warn('Kira share:',e)}
    }
    return false;
  }
  async function offerSaveToPhotos(file,title){
    if(!state.settings.autoPhotos||!file)return;
    const hasActivation=navigator.userActivation?.isActive??false;
    if(hasActivation&&await shareFileNow(file,title))return;
    showSavePhotosPrompt(file,title);
  }

  let cameraPermissionStatus=null;
  async function getCameraPermissionState(){
    if(!navigator.permissions?.query)return 'unknown';
    try{
      const status=await navigator.permissions.query({name:'camera'});
      cameraPermissionStatus=status;
      if(status&&!status.onchange){
        status.onchange=()=>{
          if(status.state==='granted'&&$('#screen-camera')?.classList.contains('active')&&!document.hidden)bootCameraSafely();
          if(status.state==='denied'&&!state.cameraReady)showCameraMessage('camera access is off','Enable Camera for Kira in iPhone Settings, then return here.',true);
        };
      }
      return status?.state||'unknown';
    }catch(err){
      return 'unknown';
    }
  }
  async function bootCameraSafely(){
    const stage=$('#cameraStage');
    if(!stage)return;
    if(state.cameraStream&&state.cameraStream.getVideoTracks().some(t=>t.readyState==='live')){
      state.cameraReady=true;
      $('#cameraEmpty')?.classList.add('hidden');
      return;
    }
    if(!navigator.mediaDevices?.getUserMedia){
      stage.classList.add('camera-denied');
      showCameraMessage('camera needs your browser','Live camera is not supported here. Tap below to use your phone camera instead.',true);
      return;
    }
    const permission=await getCameraPermissionState();
    if(permission==='granted'){
      await startCamera(false);
      return;
    }
    stage.classList.remove('camera-loading');
    if(permission==='denied'){
      stage.classList.add('camera-denied');
      showCameraMessage('camera access is off','Enable Camera for Kira in iPhone Settings, then return here.',true);
      return;
    }
    stage.classList.remove('camera-denied');
    const previouslyAllowed=localStorage.getItem('kira.cameraPermissionGranted')==='1';
    showCameraMessage(
      previouslyAllowed?'tap to reopen camera':'start your camera',
      previouslyAllowed?'Kira will not request camera access until you tap Start Camera.':'Tap Start Camera once and choose Allow when iPhone asks.',
      true
    );
  }
  function showCameraMessage(title,text,button=true){const box=$('#cameraEmpty');if(!box)return;$('#cameraEmptyTitle').textContent=title;$('#cameraEmptyText').textContent=text;$('#startCameraBtn').hidden=!button;box.classList.remove('hidden')}
  async function startCamera(userInitiated=false){
    const stage=$('#cameraStage'),video=$('#cameraVideo');
    if(!stage||!video)return;
    if(state.cameraStream&&state.cameraStream.getVideoTracks().some(t=>t.readyState==='live')){
      state.cameraReady=true;$('#cameraEmpty').classList.add('hidden');applyLiveFilter();updateCameraHUD();updateLiveFrame();setupCameraCapabilities();return;
    }
    if(!navigator.mediaDevices?.getUserMedia){
      stage.classList.add('camera-denied');showCameraMessage('camera needs your browser','Live camera is not supported here. Tap below to use your phone camera instead.',true);return;
    }
    if(!userInitiated){
      const permission=await getCameraPermissionState();
      if(permission!=='granted'){
        await bootCameraSafely();
        return;
      }
    }
    stage.classList.add('camera-loading');stage.classList.remove('camera-denied');
    showCameraMessage('opening camera…',userInitiated?'If iPhone asks, choose Allow.':'Camera permission is already granted.',false);
    try{
      const constraints={audio:false,video:{facingMode:{ideal:state.cameraFacing},width:{ideal:1080,max:1920},height:{ideal:1440,max:1920},frameRate:{ideal:30,max:30}}};
      const stream=await navigator.mediaDevices.getUserMedia(constraints);
      state.cameraStream=stream;video.srcObject=stream;video.muted=true;video.setAttribute('playsinline','');await video.play();
      state.cameraReady=true;localStorage.setItem('kira.cameraPermissionGranted','1');
      stage.classList.toggle('front-camera',state.cameraFacing==='user');stage.classList.remove('camera-loading','camera-denied');$('#cameraEmpty').classList.add('hidden');
      applyLiveFilter();updateCameraHUD();updateLiveFrame();setupCameraCapabilities();renderCameraFilters();
    }catch(err){
      console.warn('Kira camera:',err);state.cameraReady=false;stage.classList.remove('camera-loading');stage.classList.add('camera-denied');
      if(err?.name==='NotAllowedError'||err?.name==='PermissionDeniedError'){
        showCameraMessage('camera access needed','Tap Start Camera when you are ready. If iPhone has Camera disabled for Kira, enable it in Settings.',true);
      }else{
        showCameraMessage('camera could not start','Tap Start Camera to try again. Kira can also fall back to the phone camera.',true);
      }
    }
  }
  function setupCameraCapabilities(){const track=state.cameraStream?.getVideoTracks?.()[0],zoomWrap=$('#cameraZoomControl'),zoom=$('#cameraZoom'),torch=$('#cameraTorchBtn');state.cameraCapabilities=null;if(!track)return;let caps={};try{caps=track.getCapabilities?.()||{}}catch(e){}state.cameraCapabilities=caps;if(caps.zoom&&zoom&&zoomWrap){zoom.min=String(caps.zoom.min??1);zoom.max=String(caps.zoom.max??1);zoom.step=String(caps.zoom.step??0.1);zoom.value=String(track.getSettings?.().zoom??caps.zoom.min??1);$('#cameraZoomValue')&&($('#cameraZoomValue').textContent=`${Number(zoom.value).toFixed(1).replace('.0','')}×`);zoomWrap.classList.remove('hidden')}else zoomWrap?.classList.add('hidden');if(torch){torch.classList.toggle('hidden',!caps.torch);torch.textContent='Flashlight Off'}state.cameraTorchOn=false}
  function scheduleCameraZoom(value){const track=state.cameraStream?.getVideoTracks?.()[0];if(!track||!state.cameraCapabilities?.zoom)return;clearTimeout(state.cameraZoomTimer);state.cameraZoomTimer=setTimeout(async()=>{try{await track.applyConstraints({advanced:[{zoom:Number(value)}]})}catch(e){console.warn('Kira zoom:',e)}},70);$('#cameraZoomValue')&&($('#cameraZoomValue').textContent=`${Number(value).toFixed(1).replace('.0','')}×`)}
  async function toggleCameraTorch(){const track=state.cameraStream?.getVideoTracks?.()[0];if(!track||!state.cameraCapabilities?.torch){toast('Flashlight is not available on this camera.');return}state.cameraTorchOn=!state.cameraTorchOn;try{await track.applyConstraints({advanced:[{torch:state.cameraTorchOn}]});$('#cameraTorchBtn').textContent=state.cameraTorchOn?'Flashlight On':'Flashlight Off'}catch(e){state.cameraTorchOn=false;$('#cameraTorchBtn').textContent='Flashlight Off';toast('iPhone did not allow flashlight control here.')}}
  function stopCamera(){state.cameraTorchOn=false;state.cameraCapabilities=null;$('#cameraTorchBtn')?.classList.add('hidden');$('#cameraZoomControl')?.classList.add('hidden');if(state.recording)stopVideoRecording();if(state.cameraThumbTimer){clearInterval(state.cameraThumbTimer);state.cameraThumbTimer=null}if(state.cameraStream){state.cameraStream.getTracks().forEach(t=>t.stop());state.cameraStream=null}state.cameraReady=false;const video=$('#cameraVideo');if(video)video.srcObject=null}
  async function flipCamera(){state.cameraFacing=state.cameraFacing==='environment'?'user':'environment';stopCamera();await startCamera(true);haptic(18)}
  function updateCameraHUD(){const active=state.selectedRecipeId?state.recipes.find(r=>r.id===state.selectedRecipeId)?.name:state.activeFilter;$('#liveFilterName')&&($('#liveFilterName').textContent=active||'Kira');$('#liveIntensityValue')&&($('#liveIntensityValue').textContent=state.filterIntensity);const live=$('#liveFilterIntensity');if(live&&Number(live.value)!==state.filterIntensity)live.value=state.filterIntensity;const fav=$('#cameraFavoriteBtn');if(fav){const on=state.selectedRecipeId?!!state.recipes.find(r=>r.id===state.selectedRecipeId)?.pinned:state.favoriteFilters.has(state.activeFilter);fav.textContent=on?'♥':'♡';fav.classList.toggle('active',on)}const count=state.rolls.filter(x=>(x.rollId||defaultRollId())===state.activeNamedRollId).length;$('#cameraRollCount')&&($('#cameraRollCount').textContent=`${Math.min(count,999)} / 36`);$('#cameraRollBadge')&&($('#cameraRollBadge').textContent=rollName(state.activeNamedRollId));const summary=$('#activeLookSummary');if(summary)summary.textContent=active||'Kira';const si=$('#activeLookIntensity');if(si)si.textContent=`${state.filterIntensity}%`;updateLiveDateStamp()}
  function toggleActiveCameraFavorite(){if(state.selectedRecipeId)toggleRecipePin(state.selectedRecipeId);else toggleFavorite(state.activeFilter);updateCameraHUD()}
  function setCameraImmersive(on){
    state.cameraImmersive=!!on;
    document.body.classList.toggle('camera-immersive',state.cameraImmersive);
    const btn=$('#cameraImmersiveBtn');
    if(btn){btn.textContent=state.cameraImmersive?'Exit':'Full';btn.setAttribute('aria-pressed',String(state.cameraImmersive))}
    requestAnimationFrame(()=>{updateCameraViewport();applyCameraRatio()});
    haptic()
  }
  function toggleCameraImmersive(){setCameraImmersive(!state.cameraImmersive)}
  function applyCameraRatio(){const stage=$('#cameraStage');if(!stage)return;stage.classList.remove('ratio-3-4','ratio-1-1','ratio-9-16');stage.classList.add(state.cameraRatio==='1:1'?'ratio-1-1':state.cameraRatio==='9:16'?'ratio-9-16':'ratio-3-4');$('#ratioBtn')&&($('#ratioBtn').textContent=state.cameraRatio)}
  function cycleCameraRatio(){const vals=['3:4','1:1','9:16'];state.cameraRatio=vals[(vals.indexOf(state.cameraRatio)+1)%vals.length];localStorage.setItem('kira.cameraRatio',state.cameraRatio);applyCameraRatio();haptic()}
  function cycleCameraTimer(){const vals=[0,3,5,10];state.cameraTimer=vals[(vals.indexOf(state.cameraTimer)+1)%vals.length];localStorage.setItem('kira.cameraTimer',String(state.cameraTimer));$('#timerBtn')&&($('#timerBtn').textContent=state.cameraTimer?`${state.cameraTimer}s`:'Timer Off');haptic()}
  function drawVideoCrop(ctx,video,cw,ch){const vw=video.videoWidth||1,vh=video.videoHeight||1,target=cw/ch,src=vw/vh;let sx=0,sy=0,sw=vw,sh=vh;if(src>target){sw=vh*target;sx=(vw-sw)/2}else{sh=vw/target;sy=(vh-sh)/2}if(state.cameraFacing==='user'){ctx.save();ctx.translate(cw,0);ctx.scale(-1,1);ctx.drawImage(video,sx,sy,sw,sh,0,0,cw,ch);ctx.restore()}else ctx.drawImage(video,sx,sy,sw,sh,0,0,cw,ch)}
  function ensureShotFlash(){let el=$('#cameraShotFlash');if(!el){el=document.createElement('div');el.id='cameraShotFlash';el.className='camera-shot-flash';$('#cameraStage')?.appendChild(el)}return el}
  function shotFeedback(){const el=ensureShotFlash();if(el){el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash')}haptic(20)}
  function updatePhotosQueueUI(){const n=state.photosQueueIds.length,b=$('#photosQueueBtn'),c=$('#photosQueueCount');if(c)c.textContent=String(n);if(b){b.classList.toggle('hidden',n===0);if(n){b.classList.remove('has-items');void b.offsetWidth;b.classList.add('has-items')}}}
  function queueRollIdForPhotos(id){if(!state.settings.autoPhotos||id==null)return;if(!state.photosQueueIds.includes(String(id)))state.photosQueueIds.push(String(id));updatePhotosQueueUI()}
  async function shareQueuedPhotos(){if(!state.photosQueueIds.length){toast('No new photos are waiting for Photos.');return}const ids=state.photosQueueIds.slice(0,20),items=ids.map(id=>state.rolls.find(x=>String(x.id)===id)).filter(Boolean).filter(x=>!isVideoItem(x));if(!items.length){state.photosQueueIds=[];updatePhotosQueueUI();return}const files=items.map((x,i)=>new File([x.blob],`${x.name||'kira-photo'}-${i+1}.jpg`,{type:x.blob.type||'image/jpeg'}));if(navigator.share&&(!navigator.canShare||navigator.canShare({files}))){try{await navigator.share({files,title:`Kira photos (${files.length})`});state.photosQueueIds=state.photosQueueIds.filter(id=>!ids.includes(id));updatePhotosQueueUI();toast(files.length===1?'Photo sent to iPhone share sheet.':`${files.length} photos sent to iPhone share sheet.`);return}catch(e){if(e?.name==='AbortError')return;console.warn('Kira batch share:',e)}}showSavePhotosPrompt(files[0],'Kira photo');toast('iPhone could not share the full batch. Saving the first photo instead.')}
  async function decodePhotoBlob(blob){if('createImageBitmap' in window){try{return await createImageBitmap(blob)}catch(e){}}return await new Promise((resolve,reject)=>{const u=URL.createObjectURL(blob),im=new Image();im.onload=()=>{URL.revokeObjectURL(u);resolve(im)};im.onerror=e=>{URL.revokeObjectURL(u);reject(e)};im.src=u})}
  function filterParamsForSnapshot(s){
    s=s||{};const f=findPreset(s.activeFilter||state.activeFilter),mix=clamp(Number(s.filterIntensity??100)/100,0,1),a=s.adjustments||{},e=s.effects||{},preset=f.kind==='builtin'?(f.p||{}):{};
    const get=k=>Number(preset[k]||0)*mix+Number(a[k]||0),userGrain=Number(e.grain||0),userBloom=Number(e.bloom||0),userLeak=Number(e.leak||0);
    return {exposure:get('exposure'),brightness:get('brightness'),contrast:get('contrast'),highlights:get('highlights'),shadows:get('shadows'),saturation:get('saturation'),warmth:get('warmth'),tint:get('tint'),fade:get('fade'),sharpness:get('sharpness'),vignette:get('vignette'),sepia:Number(preset.sepia||0)*mix,hue:Number(preset.hue||0)*mix,castColor:preset.castColor||null,castStrength:Number(preset.castStrength||0)*mix,castMode:preset.castMode||'soft-light',softness:Number(preset.softness||0)*mix,lowRes:Number(preset.lowRes||0)*mix,scanlines:Number(preset.scanlines||0)*mix,grain:Number(preset.grain||0)*mix+userGrain,grainType:userGrain>0?(e.grainType||'Classic'):(preset.grainType||'Classic'),bloom:Number(preset.bloom||0)*mix+userBloom,bloomType:userBloom>0?(e.bloomType||'Soft'):(preset.bloomType||'Soft'),dust:Number(preset.dust||0)*mix+Number(e.dust||0),scratches:Number(preset.scratches||0)*mix+Number(e.scratches||0),leak:Number(preset.leak||0)*mix+userLeak,leakType:userLeak>0?(e.leakType||'Pink'):(preset.leakType||e.leakType||'Pink'),rgbSplit:Number(preset.rgbSplit||0)*mix+Number(e.rgbSplit||0),noise:Number(preset.noise||0)*mix+Number(e.noise||0),sparkle:Number(e.sparkle||0),sparkleType:e.sparkleType||'Star'};
  }
  function withVisualSnapshot(snapshot,fn){const keys=['beauty','frame','frameTone','frameWidth','frameCorner','caption','captionFont','captionSize','dateEnabled','dateStyle','dateValue','dateColor','datePosition','dateCustomText'];const saved={};for(const key of keys){saved[key]=state[key];if(snapshot&&Object.prototype.hasOwnProperty.call(snapshot,key))state[key]=snapshot[key]}try{return fn()}finally{for(const key of keys)state[key]=saved[key]}}
  function drawCameraShotFast(canvas,source,p=filterParams()){const ctx=canvas.getContext('2d',{alpha:false}),w=canvas.width,h=canvas.height;ctx.save();ctx.fillStyle='#171414';ctx.fillRect(0,0,w,h);ctx.filter=cameraCssFromParams(p);ctx.drawImage(source,0,0,w,h);ctx.filter='none';applyPresetCast(ctx,w,h,p);if(p.fade>0){ctx.globalAlpha=Math.min(.36,p.fade/100);ctx.fillStyle='#ead9c9';ctx.fillRect(0,0,w,h);ctx.globalAlpha=1}if(p.warmth){ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=Math.min(.25,Math.abs(p.warmth)/135);ctx.fillStyle=p.warmth>0?'#ff995e':'#4d94c2';ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}if(p.bloom>0&&p.bloom<40){ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.16,p.bloom/180);ctx.filter='blur(3px) brightness(114%)';ctx.drawImage(source,0,0,w,h);ctx.filter='none';ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}applyBeautyPass(ctx,w,h,state.beauty);if(p.rgbSplit>0)applyRGBSplit(ctx,canvas,w,h,p.rgbSplit);if(p.lowRes>0)applyLowResolution(ctx,canvas,w,h,p.lowRes);if(p.noise>0)applyNoise(ctx,w,h,p.noise);if(p.grain>0)applyGrain(ctx,w,h,p.grain,p.grainType);if(p.scanlines>0)applyScanlines(ctx,w,h,p.scanlines);if(p.dust>0)applyDust(ctx,w,h,p.dust);if(p.scratches>0)applyScratches(ctx,w,h,p.scratches);if(p.sharpness>0)applySharpness(ctx,w,h,p.sharpness);if(p.vignette>0){const g=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.22,w/2,h/2,Math.max(w,h)*.72);g.addColorStop(.5,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(20,8,8,${Math.min(.48,p.vignette/90)})`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}if(state.frame!=='None')drawFrame(ctx,w,h);if(state.dateEnabled)drawDate(ctx,w,h);ctx.restore()}
  async function processContinuousPhoto(task){const source=await decodePhotoBlob(task.blob);try{const maxSide=1920,sw=source.width||source.naturalWidth||task.width,sh=source.height||source.naturalHeight||task.height,scale=Math.min(1,maxSide/Math.max(sw,sh)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(sw*scale));c.height=Math.max(1,Math.round(sh*scale));const p=filterParamsForSnapshot(task.snapshot);withVisualSnapshot(task.snapshot,()=>drawCameraShotFast(c,source,p));const finalBlob=await new Promise(resolve=>c.toBlob(resolve,'image/jpeg',.92));if(!finalBlob)throw new Error('Could not encode photo');const name=`kira-${task.stamp}`;const id=await storeRollPhoto(finalBlob,{kind:'edited',mediaType:'photo',name,filter:task.filter,favorite:false,snapshot:task.snapshot,rollId:task.rollId,cameraCapture:true});queueRollIdForPhotos(id);toast(state.settings.autoPhotos?`Saved • ${state.photosQueueIds.length} waiting for Photos`:`Saved to ${rollName(task.rollId)} ✓`)}finally{if(source&&typeof source.close==='function')source.close()}}
  async function runPhotoProcessQueue(){if(state.photoProcessing)return;state.photoProcessing=true;$('#shutterBtn')?.classList.add('saving');try{while(state.photoProcessQueue.length){const task=state.photoProcessQueue.shift();try{await processContinuousPhoto(task)}catch(e){console.error('Kira photo save:',e);toast('One photo could not be saved.')}}}finally{state.photoProcessing=false;$('#shutterBtn')?.classList.remove('saving')}}
  function enqueueContinuousPhoto(blob,c){if(state.photoProcessQueue.length>=8){toast('Kira is still saving earlier shots — give it a moment.');return false}state.captureSequence++;state.photoProcessQueue.push({blob,width:c.width,height:c.height,stamp:Date.now(),filter:state.activeFilter,snapshot:editSnapshot(),rollId:state.activeNamedRollId,seq:state.captureSequence});runPhotoProcessQueue();return true}

  function captureCanvasForRatio(video){const ratio=state.cameraRatio==='1:1'?[1,1]:state.cameraRatio==='9:16'?[9,16]:[3,4],target=ratio[0]/ratio[1],vw=video.videoWidth||1080,vh=video.videoHeight||1440,src=vw/vh;let sw=vw,sh=vh;if(src>target)sw=vh*target;else sh=vw/target;const maxSide=2048,scale=Math.min(1,maxSide/Math.max(sw,sh)),cw=Math.max(1,Math.round(sw*scale)),ch=Math.max(1,Math.round(sh*scale)),c=document.createElement('canvas');c.width=cw;c.height=ch;drawVideoCrop(c.getContext('2d',{alpha:false}),video,cw,ch);return c}
  async function runCameraCountdown(){if(state.timerRunning)return false;if(!state.cameraTimer)return true;state.timerRunning=true;$('#shutterBtn')?.classList.add('timer-running');const box=$('#cameraCountdown');for(let n=state.cameraTimer;n>0;n--){if(box){box.textContent=n;box.classList.remove('hidden')}haptic(12);await new Promise(r=>setTimeout(r,1000))}box?.classList.add('hidden');$('#shutterBtn')?.classList.remove('timer-running');state.timerRunning=false;return true}
  async function captureLivePhoto(){if(state.timerRunning)return;if(!state.cameraReady){if(navigator.mediaDevices?.getUserMedia){startCamera(true);toast('Starting camera…')}else $('#cameraInput').click();return}const video=$('#cameraVideo');if(!video.videoWidth||!video.videoHeight){toast('Camera is still getting ready.');return}await runCameraCountdown();if(!state.cameraReady)return;const c=captureCanvasForRatio(video);shotFeedback();c.toBlob(blob=>{if(!blob){toast('Could not capture photo.');return}if(state.settings.continuousShoot){enqueueContinuousPhoto(blob,c);return}const file=new File([blob],`kira-${Date.now()}.jpg`,{type:'image/jpeg'});loadFile(file,'camera')},'image/jpeg',.92)}

  function exportDimensions(){const iw=state.image.naturalWidth,ih=state.image.naturalHeight,max=state.exportQuality==='Original'?4096:state.exportQuality==='High'?2560:1440,sc=Math.min(1,max/Math.max(iw,ih));return [Math.max(1,Math.round(iw*sc)),Math.max(1,Math.round(ih*sc))]}
  function currentBlob(type='image/jpeg',quality=.94){return new Promise(resolve=>{const [w,h]=exportDimensions(),c=document.createElement('canvas');c.width=w;c.height=h;drawEdited(c,filterParams(),true);c.toBlob(resolve,type,state.exportQuality==='Social'?.9:quality)})}
  async function saveEdited(){if(!state.image){toast('Take or import a photo first.');return}const blob=await currentBlob();if(!blob){toast('Could not create photo.');return}await storeRollPhoto(blob,{kind:'edited',name:state.imageName,filter:state.activeFilter,favorite:false,snapshot:editSnapshot(),rollId:state.activeNamedRollId});const savedFile=new File([blob],`${state.imageName}-kira.jpg`,{type:'image/jpeg'});if(state.settings.autoSave)downloadBlob(blob,savedFile.name);if(state.settings.autoPhotos)offerSaveToPhotos(savedFile,'Kira photo');toast(isIOS()?'Photo prepared. If iOS does not save it automatically, use Share / Save to Photos.':'Saved to your device and Kira Rolls ♥');haptic(25)}
  function downloadBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2500)}
  async function shareEdited(){if(!state.image){toast('Take or import a photo first.');return}const blob=await currentBlob(),file=new File([blob],`${state.imageName}-kira.jpg`,{type:'image/jpeg'});if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){try{await navigator.share({files:[file],title:'Kira photo'});return}catch(e){if(e.name==='AbortError')return}}downloadBlob(blob,file.name);toast('Photo downloaded.')}
  function isIOS(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}

  function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open('kira-db',1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains('photos'))db.createObjectStore('photos',{keyPath:'id',autoIncrement:true})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
  function rollsVisible(){return !!$('#screen-rolls')?.classList.contains('active')}
  function syncRollUi(full=false){$('#storedCount')&&($('#storedCount').textContent=state.rolls.length);renderRollSelectors();updateCameraHUD();if(full||rollsVisible()){renderNamedRollBar();renderRolls()}}
  async function storeRollPhoto(blob,meta={}){const db=await openDB(),item={blob,createdAt:Date.now(),rollId:meta.rollId||state.activeNamedRollId,...meta};let id=await new Promise((res,rej)=>{const tx=db.transaction('photos','readwrite'),req=tx.objectStore('photos').add(item);req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error);tx.onerror=()=>rej(tx.error)});db.close();state.rolls.push({...item,id});syncRollUi(false);return id}
  async function refreshRolls(){try{const db=await openDB();state.rolls=await new Promise((res,rej)=>{const r=db.transaction('photos').objectStore('photos').getAll();r.onsuccess=()=>res((r.result||[]).map(x=>({...x,rollId:x.rollId||defaultRollId()})));r.onerror=()=>rej(r.error)});db.close();syncRollUi(false)}catch(e){console.warn(e)}}
  async function updateRollItem(item){const db=await openDB();await new Promise((res,rej)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').put(item);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close();syncRollUi(rollsVisible())}
  async function deleteRollItem(id){const db=await openDB();await new Promise((res,rej)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').delete(Number(id));tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close();state.rolls=state.rolls.filter(x=>String(x.id)!==String(id));syncRollUi(rollsVisible())}
  async function clearRolls(){const db=await openDB();await new Promise((res,rej)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').clear();tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close();state.rolls=[];syncRollUi(rollsVisible())}
  async function importPhotosToRoll(files){const list=[...files].filter(f=>f.type.startsWith('image/'));if(!list.length)return;const db=await openDB();await new Promise((res,rej)=>{const tx=db.transaction('photos','readwrite'),store=tx.objectStore('photos');list.forEach(file=>store.add({blob:file,createdAt:Date.now(),rollId:state.activeNamedRollId,kind:'original',name:(file.name||'photo').replace(/\.[^.]+$/,''),filter:'Original',favorite:false}));tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close();await refreshRolls();toast(`${list.length} photo${list.length===1?'':'s'} imported to ${rollName(state.activeNamedRollId)}`)}

  async function cleanupRetiredMotionPairs(){
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
  function isVideoItem(x){return x?.mediaType==='video'||x?.kind==='video'||x?.blob?.type?.startsWith?.('video/')}
  function modalCaptionFrame(item){
    return item?.captionFrame || item?.snapshot?.frame || 'None';
  }
  function modalCaptionEnabled(item){
    return !!item && !isVideoItem(item) && isInstantCaptionFrame(modalCaptionFrame(item));
  }
  function syncPhotoCaptionUi(item){
    const wrap=$('#photoCaptionTools');
    if(!wrap)return;
    const enabled=modalCaptionEnabled(item);
    wrap.classList.toggle('hidden',!enabled);
    if(!enabled)return;
    const captionInput=$('#photoCaptionInput');
    const fontSelect=$('#photoCaptionFontSelect');
    const sizeInput=$('#photoCaptionSize');
    const sizeValue=$('#photoCaptionSizeValue');
    if(captionInput)captionInput.value=item.caption ?? item.snapshot?.caption ?? '';
    if(fontSelect)fontSelect.value=item.captionFont || item.snapshot?.captionFont || 'Classic Serif';
    const captionSize=Number(item.captionSize || item.snapshot?.captionSize || 165);
    if(sizeInput)sizeInput.value=captionSize;
    if(sizeValue)sizeValue.textContent=`${captionSize}%`;
  }
  async function renderInstantCaptionBlob(item){
    const frame=modalCaptionFrame(item);
    if(!modalCaptionEnabled(item) || !item?.blob)return item?.blob || null;
    if((item.captionFont||item.snapshot?.captionFont)==='1989 Sparkle')await ensure1989Glyphs();

    const source=await decodePhotoBlob(item.blob);
    try{
      const sw=source.width||source.naturalWidth;
      const sh=source.height||source.naturalHeight;
      if(!sw||!sh)throw new Error('Could not read photo dimensions.');

      const canvas=document.createElement('canvas');
      canvas.width=sw;
      canvas.height=sh;
      const ctx=canvas.getContext('2d',{alpha:false});
      if(!ctx)throw new Error('Canvas is unavailable.');

      ctx.drawImage(source,0,0,sw,sh);

      let pct=.08;
      if(frame==='Polaroid'||frame==='Instant Square')pct=.105;
      if(frame==='Instant Wide')pct=.065;
      if(frame==='Instant Mini')pct=.08;
      if(frame==='Instant Black')pct=.10;

      const frameWidth=Number(item.snapshot?.frameWidth||8);
      const footer=Math.max(24,Math.round(sh*pct+frameWidth*1.4));
      const black=frame==='Instant Black';
      const tone=black?'#171414':(item.snapshot?.frameTone||'#fff8f1');

      // Redraw only the instant-film footer. This lets captions be updated
      // without reprocessing the entire filter stack.
      ctx.fillStyle=tone;
      ctx.fillRect(0,sh-footer,sw,footer);

      const caption=String(item.caption||'').trim();
      if(caption){
        const capColor=black?'#f8eee7':'#6a4d4e';
        const capScale=(Number(item.captionSize || item.snapshot?.captionSize || 165))/100;
        const maxWidth=sw*.82;
        let text=caption;
        if((item.captionFont||'Classic Serif')!=='1989 Sparkle'){
          ctx.font=captionFontCss(item.captionFont||'Classic Serif',Math.max(16,Math.round(sw*.04*capScale)));
          if(ctx.measureText(text).width>maxWidth){
            while(text.length>1 && ctx.measureText(text+'…').width>maxWidth)text=text.slice(0,-1);
            text+='…';
          }
        }
        drawCaptionText(ctx,text,item.captionFont||'Classic Serif',Math.max(16,Math.round(sw*.04*capScale)),capColor,sw/2,sh-footer*.36,maxWidth,'center');
      }

      return await new Promise((resolve,reject)=>{
        canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not save captioned photo.')),'image/jpeg',.92);
      });
    } finally {
      if(source&&typeof source.close==='function')source.close();
    }
  }

  function currentRollItems(){let list=state.rolls.filter(x=>(state.rollViewId==='all'||x.rollId===state.rollViewId)&&(state.activeRollFilter==='all'||(state.activeRollFilter==='favorites'&&x.favorite)||(state.activeRollFilter==='edited'&&x.kind==='edited')||(state.activeRollFilter==='videos'&&isVideoItem(x))));const q=state.rollSearch.trim().toLowerCase();if(q)list=list.filter(x=>{const hay=[x.title,x.name,x.notes,x.filter,rollName(x.rollId),...(Array.isArray(x.tags)?x.tags:[])].filter(Boolean).join(' ').toLowerCase();return hay.includes(q)});if(state.rollSort==='oldest')list.sort((a,b)=>a.createdAt-b.createdAt);else if(state.rollSort==='favorites')list.sort((a,b)=>Number(!!b.favorite)-Number(!!a.favorite)||b.createdAt-a.createdAt);else list.sort((a,b)=>b.createdAt-a.createdAt);return list}
  function renderNamedRollBar(){const area=$('#rollCollectionBar');if(!area)return;const photoItems=state.rolls.filter(x=>!isVideoItem(x));const allCover=photoItems.slice().sort((a,b)=>b.createdAt-a.createdAt)[0];let html=`<div class="roll-album-card ${state.rollViewId==='all'?'active':''}" data-cover-id="${allCover?.id||''}"><button class="roll-album-main" data-roll-view="all"><strong>All Media</strong><small>${state.rolls.length} items</small></button></div>`;const unfiled=state.rolls.filter(x=>(x.rollId||'unfiled')==='unfiled');if(unfiled.length){const cover=unfiled.filter(x=>!isVideoItem(x)).sort((a,b)=>b.createdAt-a.createdAt)[0];html+=`<div class="roll-album-card ${state.rollViewId==='unfiled'?'active':''}" data-cover-id="${cover?.id||''}"><button class="roll-album-main" data-roll-view="unfiled"><strong>Unfiled</strong><small>${unfiled.length} items</small></button></div>`}html+=state.namedRolls.map(r=>{const items=state.rolls.filter(x=>x.rollId===r.id),cover=items.filter(x=>!isVideoItem(x)).sort((a,b)=>b.createdAt-a.createdAt)[0];return `<div class="roll-album-card ${state.rollViewId===r.id?'active':''}" data-cover-id="${cover?.id||''}"><button class="roll-album-main" data-roll-view="${r.id}"><strong>${escapeHtml(r.name)}</strong><small>${items.length} items</small></button><button class="roll-menu-btn" data-roll-menu="${r.id}">⋯</button></div>`}).join('');area.innerHTML=html;hydrateRollCovers();$$('[data-roll-view]',area).forEach(b=>b.onclick=()=>{state.rollViewId=b.dataset.rollView;if(state.rollViewId!=='all')setActiveRoll(state.rollViewId);else{renderNamedRollBar();renderRolls()}});$$('[data-roll-menu]',area).forEach(b=>b.onclick=e=>{e.stopPropagation();openRollModal(b.dataset.rollMenu)})}
  async function hydrateRollCovers(){for(const card of $$('[data-cover-id]',$('#rollCollectionBar'))){const id=card.dataset.coverId;if(!id)continue;const item=state.rolls.find(x=>String(x.id)===String(id));if(!item?.blob)continue;const u=URL.createObjectURL(item.blob);card.style.backgroundImage=`url('${u}')`;card.style.backgroundSize='cover';card.style.backgroundPosition='center';setTimeout(()=>URL.revokeObjectURL(u),12000)}}
  function openRollModal(id=null){state.rollModalId=id;const r=state.namedRolls.find(x=>x.id===id);$('#rollModalTitle').textContent=r?'Edit Film Roll':'New Film Roll';$('#rollNameInput').value=r?.name||'';$('#deleteRollBtn').classList.toggle('hidden',!r);$('#rollModal').classList.remove('hidden');setTimeout(()=>$('#rollNameInput').focus(),120)}
  function closeModal(id){const el=$('#'+id);if(el)el.classList.add('hidden');if(id==='photoModal'){for(const media of [$('#photoModalImage'),$('#photoModalVideo')]){const u=media?.dataset.objectUrl;if(u){URL.revokeObjectURL(u);delete media.dataset.objectUrl}if(media?.tagName==='VIDEO'){media.pause();media.removeAttribute('src');media.load()}}}}
  function saveRollFromModal(){const name=$('#rollNameInput').value.trim();if(!name){toast('Give your film roll a name.');return}if(state.rollModalId){const r=state.namedRolls.find(x=>x.id===state.rollModalId);if(r)r.name=name}else{const r={id:'roll-'+uid(),name,createdAt:Date.now()};state.namedRolls.push(r);state.activeNamedRollId=r.id;state.rollViewId=r.id}saveNamedRolls();closeModal('rollModal');renderNamedRollBar();renderRollSelectors();renderRolls();toast('Film roll saved 🎞️')}
  async function deleteRollFromModal(){const id=state.rollModalId;if(!id)return;const r=state.namedRolls.find(x=>x.id===id);if(!r)return;if(!confirm(`Delete roll "${r.name}"? Photos and videos will move to Unfiled.`))return;for(const item of state.rolls.filter(x=>x.rollId===id)){item.rollId='unfiled';await updateRollItemDirect(item)}state.namedRolls=state.namedRolls.filter(x=>x.id!==id);if(state.activeNamedRollId===id)state.activeNamedRollId='unfiled';if(state.rollViewId===id)state.rollViewId='all';saveNamedRolls();closeModal('rollModal');await refreshRolls();toast('Roll deleted; media kept in Unfiled.')}
  async function updateRollItemDirect(item){const db=await openDB();await new Promise((res,rej)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').put(item);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close()}

  function renderRolls(){if(!$('#rollGrid'))return;const items=currentRollItems();$('#emptyRolls').classList.toggle('hidden',items.length>0);$('#rollGrid').classList.toggle('hidden',items.length===0);$('#contactModeBar').classList.toggle('hidden',!state.contactMode);$('#bulkSelectBar').classList.toggle('hidden',!state.bulkSelectMode);$('#contactSelectedCount').textContent=state.selectedPhotoIds.size;$('#bulkSelectedCount')&&($('#bulkSelectedCount').textContent=state.bulkSelectedIds.size);document.body.classList.toggle('bulk-selecting',state.bulkSelectMode);const selectBtn=$('#bulkSelectBtn');if(selectBtn){selectBtn.textContent=state.bulkSelectMode?'Done':'Select';selectBtn.setAttribute('aria-expanded',String(state.bulkSelectMode))}$('#rollGrid').innerHTML=items.map(x=>{const u=URL.createObjectURL(x.blob);setTimeout(()=>URL.revokeObjectURL(u),60000);const video=isVideoItem(x),contactSel=state.selectedPhotoIds.has(String(x.id)),bulkSel=state.bulkSelectedIds.has(String(x.id)),contactSelectable=state.contactMode&&!video,bulkSelectable=state.bulkSelectMode;const media=video?`<video src="${u}" muted playsinline preload="none"></video>`:`<img src="${u}" alt="Kira photo" loading="lazy" decoding="async">`;const title=x.title?`<span class="media-title-badge">${escapeHtml(x.title)}</span>`:'';let selector='';if(state.bulkSelectMode)selector=`<span class="bulk-selection-check">${bulkSel?'✓':''}</span>`;else if(state.contactMode)selector=video?'<span class="selection-check">—</span>':`<span class="selection-check">${contactSel?'✓':'+'}</span>`;else selector=`<button type="button" class="photo-menu-btn" data-photo-menu="${x.id}" aria-label="Open media details">⋯</button>`;return `<article class="roll-photo ${contactSelectable?'selectable':''} ${contactSel?'selected':''} ${bulkSelectable?'bulk-selectable':''} ${bulkSel?'bulk-selected':''}" role="button" tabindex="0" aria-label="Open ${escapeHtml(video?'video':'photo')} details" data-photo-id="${x.id}">${media}${title}${video?'<span class="video-roll-badge">▶ VIDEO</span>':''}${selector}<span class="roll-badge">${escapeHtml(video?'Video':x.kind==='edited'?(x.filter||'Edited'):'Original')}</span></article>`}).join('')}
  function toggleBulkSelection(id){const key=String(id);state.bulkSelectedIds.has(key)?state.bulkSelectedIds.delete(key):state.bulkSelectedIds.add(key);renderRolls()}
  function safeOpenPhotoModal(id){
    try{
      openPhotoModal(id);
    }catch(err){
      console.error('Kira Media Details error:',err);
      // Keep the app responsive even if an optional Media Details enhancement fails.
      const item=state.rolls.find(x=>String(x.id)===String(id));
      if(!item){toast('Kira could not find that media item.');return}
      state.photoModalId=String(id);
      const modal=$('#photoModal');
      const im=$('#photoModalImage');
      const vid=$('#photoModalVideo');
      try{
        const isVid=isVideoItem(item);
        const url=URL.createObjectURL(item.blob);
        if(isVid){
          if(im)im.classList.add('hidden');
          if(vid){vid.classList.remove('hidden');vid.src=url;vid.dataset.objectUrl=url}
        }else{
          if(vid){vid.pause();vid.classList.add('hidden')}
          if(im){im.classList.remove('hidden');im.src=url;im.dataset.objectUrl=url}
        }
        if($('#photoDetailMeta')){
          $('#photoDetailMeta').innerHTML=`<div><b>Roll</b>${escapeHtml(rollName(item.rollId))}</div><div><b>Look</b>${escapeHtml(item.filter||'Original')}</div><div><b>Type</b>${isVid?'Video':'Photo'}</div><div><b>Date</b>${new Date(item.createdAt).toLocaleDateString()}</div>`;
        }
        if(modal)modal.classList.remove('hidden');
        toast('Media opened in safe mode.');
      }catch(fallbackErr){
        console.error('Kira Media Details fallback error:',fallbackErr);
        toast('Could not open this media item. Try reopening Kira.');
      }
    }
  }

  let rollTouchStart=null,rollTouchHandledAt=0;
  function activateRollCard(card){
    if(!card)return;
    const id=card.dataset.photoId,item=state.rolls.find(x=>String(x.id)===String(id));
    if(!item)return;
    if(state.bulkSelectMode){toggleBulkSelection(id);return}
    if(state.contactMode){
      if(isVideoItem(item)){toast('Contact sheets use photos only.');return}
      toggleContactSelection(id);return
    }
    safeOpenPhotoModal(id)
  }
  function bindRollGridInteractions(){
    const grid=$('#rollGrid');
    if(!grid||grid.dataset.tapBound==='1')return;
    grid.dataset.tapBound='1';

    grid.addEventListener('click',e=>{
      if(Date.now()-rollTouchHandledAt<550)return;
      const menu=e.target.closest('[data-photo-menu]');
      if(menu){e.preventDefault();e.stopPropagation();safeOpenPhotoModal(menu.dataset.photoMenu);return}
      const card=e.target.closest('[data-photo-id]');
      if(card){e.preventDefault();activateRollCard(card)}
    });

    grid.addEventListener('keydown',e=>{
      if(e.key!=='Enter'&&e.key!==' ')return;
      const card=e.target.closest('[data-photo-id]');
      if(!card)return;
      e.preventDefault();
      activateRollCard(card);
    });

    grid.addEventListener('touchstart',e=>{
      if(e.touches.length!==1){rollTouchStart=null;return}
      const t=e.touches[0];
      rollTouchStart={x:t.clientX,y:t.clientY,target:e.target};
    },{passive:true});

    grid.addEventListener('touchend',e=>{
      if(!rollTouchStart||e.changedTouches.length!==1){rollTouchStart=null;return}
      const t=e.changedTouches[0],dx=t.clientX-rollTouchStart.x,dy=t.clientY-rollTouchStart.y;
      const moved=Math.hypot(dx,dy);
      const target=rollTouchStart.target;
      rollTouchStart=null;
      if(moved>12)return; // scrolling, not a tap

      const menu=target.closest?.('[data-photo-menu]');
      const card=target.closest?.('[data-photo-id]');
      if(!menu&&!card)return;

      rollTouchHandledAt=Date.now();
      e.preventDefault();
      if(menu){safeOpenPhotoModal(menu.dataset.photoMenu);return}
      activateRollCard(card);
    },{passive:false});
  }

  function setBulkSelectMode(on){state.bulkSelectMode=!!on;if(on){state.contactMode=false;state.selectedPhotoIds.clear()}else state.bulkSelectedIds.clear();renderRolls()}
  function selectAllBulk(){const items=currentRollItems();state.bulkSelectedIds=new Set(items.map(x=>String(x.id)));renderRolls();toast(items.length?`${items.length} item${items.length===1?'':'s'} selected.`:'Nothing to select.')}
  function bulkSelectedItems(){return currentRollItems().filter(x=>state.bulkSelectedIds.has(String(x.id)))}
  function mediaFilename(item,index=0){const video=isVideoItem(item),type=item.blob?.type||'',base=(item.name||`kira-${item.createdAt||Date.now()}`).replace(/[^a-z0-9._-]+/gi,'-');let ext='jpg';if(video)ext=type.includes('webm')?'webm':'mp4';else if(type.includes('png'))ext='png';else if(type.includes('heic'))ext='heic';return `${base}-${index+1}.${ext}`}
  async function shareRollItems(items,label='Kira media'){const chosen=(items||[]).filter(x=>x?.blob);if(!chosen.length){toast('No items to save.');return false}const files=chosen.map((x,i)=>new File([x.blob],mediaFilename(x,i),{type:x.blob.type||(isVideoItem(x)?'video/mp4':'image/jpeg')}));if(navigator.share){let shareable=true;try{if(navigator.canShare)shareable=navigator.canShare({files})}catch(e){shareable=false}if(shareable){try{await navigator.share({files,title:`${label} (${files.length})`});toast(`${files.length} item${files.length===1?'':'s'} sent to the iPhone share sheet.`);return true}catch(e){if(e?.name==='AbortError')return false;console.warn('Kira bulk share:',e)}}if(files.length>20){const batch=files.slice(0,20);try{if(!navigator.canShare||navigator.canShare({files:batch})){await navigator.share({files:batch,title:`${label} (first 20)`});toast('iPhone accepted the first 20 items. Use Save All again for another batch if needed.');return true}}catch(e){if(e?.name==='AbortError')return false;console.warn('Kira bulk fallback:',e)}}}if(files.length===1){downloadBlob(chosen[0].blob,files[0].name);toast('Saved as a file.');return true}toast('This browser could not open a multi-item save sheet. Try selecting fewer items.');return false}
  async function saveSelectedBulk(){const items=bulkSelectedItems();if(!items.length){toast('Select at least one photo or video first.');return}const ok=await shareRollItems(items,'Kira selected');if(ok)setBulkSelectMode(false)}
  async function saveAllCurrent(){const items=currentRollItems();if(!items.length){toast('This view has nothing to save.');return}await shareRollItems(items,state.rollViewId==='all'?'Kira All Photos':rollName(state.rollViewId))}
  function toggleContactSelection(id){state.selectedPhotoIds.has(String(id))?state.selectedPhotoIds.delete(String(id)):state.selectedPhotoIds.add(String(id));renderRolls()}
  function setContactMode(on){state.contactMode=on;if(on){state.bulkSelectMode=false;state.bulkSelectedIds.clear()}if(!on)state.selectedPhotoIds.clear();renderRolls()}
  function selectAllCurrent(){const items=currentRollItems().filter(x=>!isVideoItem(x));const limit=16;items.slice(0,limit).forEach(x=>state.selectedPhotoIds.add(String(x.id)));renderRolls();if(items.length>limit)toast('Selected the first 16 photos.')}

  function openPhotoModal(id){const item=state.rolls.find(x=>String(x.id)===String(id));if(!item)return;state.photoModalId=String(id);const im=$('#photoModalImage'),vid=$('#photoModalVideo'),video=isVideoItem(item);for(const media of [im,vid]){if(media?.dataset.objectUrl){URL.revokeObjectURL(media.dataset.objectUrl);delete media.dataset.objectUrl}}const u=URL.createObjectURL(item.blob);if(video){im.classList.add('hidden');vid.classList.remove('hidden');vid.src=u;vid.dataset.objectUrl=u}else{vid.pause();vid.classList.add('hidden');im.classList.remove('hidden');im.src=u;im.dataset.objectUrl=u}$('#photoDetailMeta').innerHTML=`<div><b>Roll</b>${escapeHtml(rollName(item.rollId))}</div><div><b>${video?'Preview look':'Look'}</b>${escapeHtml(video?(item.videoPreviewLook||item.filter||'Original'):item.kind==='edited'?(item.filter||'Edited'):'Original')}</div><div><b>Type</b>${video?'Video':item.kind==='edited'?'Edited':'Original'}</div><div><b>Date</b>${new Date(item.createdAt).toLocaleDateString()}</div>`;renderRollSelectors();$('#photoRollSelect').value=(item.rollId&&($('#photoRollSelect option[value="'+item.rollId+'"]')))?item.rollId:'unfiled';$('#photoTitleInput').value=item.title||'';$('#photoNotesInput').value=item.notes||'';$('#photoTagsInput').value=(Array.isArray(item.tags)?item.tags:[]).join(', ');try{syncPhotoCaptionUi(item)}catch(err){console.warn('Kira caption UI:',err);$('#photoCaptionTools')?.classList.add('hidden')}$('#photoFavoriteBtn').textContent=item.favorite?'♥ Favorited':'♡ Favorite';$('#photoUseLookBtn').disabled=video||!item.snapshot;$('#photoModal').classList.remove('hidden')}
  async function savePhotoDetails(){const item=currentModalPhoto();if(!item)return;item.title=$('#photoTitleInput').value.trim();item.notes=$('#photoNotesInput').value.trim();item.tags=$('#photoTagsInput').value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,20);let captionSaved=false;try{if(modalCaptionEnabled(item)){item.caption=$('#photoCaptionInput')?.value.trim()||'';item.captionFont=$('#photoCaptionFontSelect')?.value||'Classic Serif';item.captionSize=Number($('#photoCaptionSize')?.value||165);item.captionFrame=modalCaptionFrame(item);if(item.snapshot){item.snapshot.caption=item.caption;item.snapshot.captionFont=item.captionFont;item.snapshot.captionSize=item.captionSize}const nextBlob=await renderInstantCaptionBlob(item);if(nextBlob)item.blob=nextBlob;captionSaved=true}}catch(err){console.error('Kira caption save:',err);toast('Details saved, but the Polaroid caption could not be rendered.')}await updateRollItem(item);if(!captionSaved)toast('Memory details saved.');else toast('Memory details and caption saved.');safeOpenPhotoModal(item.id)}
  function currentModalPhoto(){return state.rolls.find(x=>String(x.id)===String(state.photoModalId))}
  async function moveModalPhoto(){const item=currentModalPhoto();if(!item)return;item.rollId=$('#photoRollSelect').value;await updateRollItem(item);safeOpenPhotoModal(item.id);toast('Photo moved.')}
  async function favoriteModalPhoto(){const item=currentModalPhoto();if(!item)return;item.favorite=!item.favorite;await updateRollItem(item);safeOpenPhotoModal(item.id)}
  async function deleteModalPhoto(){const item=currentModalPhoto();if(!item)return;if(!confirm('Delete this photo from Kira local storage?'))return;closeModal('photoModal');await deleteRollItem(item.id);toast('Photo deleted from Kira.')}
  function useModalPhotoLook(){const item=currentModalPhoto();if(!item?.snapshot){toast('This photo does not have a saved Kira look.');return}if(!state.image){toast('Load or take a photo first, then apply this look.');closeModal('photoModal');switchScreen('camera');return}commit();applySnapshot(item.snapshot);closeModal('photoModal');switchScreen('develop');toast('Look applied from saved photo.')}

  function blobToImage(blob){return new Promise((resolve,reject)=>{const u=URL.createObjectURL(blob),im=new Image();im.onload=()=>{URL.revokeObjectURL(u);resolve(im)};im.onerror=e=>{URL.revokeObjectURL(u);reject(e)};im.src=u})}
  function drawCover(ctx,img,x,y,w,h){const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height,scale=Math.max(w/iw,h/ih),sw=w/scale,sh=h/scale,sx=(iw-sw)/2,sy=(ih-sh)/2;ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h)}
  function openContactModal(){if(!state.selectedPhotoIds.size){toast('Select photos for your contact sheet first.');return}$('#contactModal').classList.remove('hidden');$('#contactPreviewWrap').classList.add('hidden');if(state.contactBlob){state.contactBlob=null}}
  async function generateContactSheet(){const chosen=state.rolls.filter(x=>state.selectedPhotoIds.has(String(x.id))&&!isVideoItem(x)).sort((a,b)=>a.createdAt-b.createdAt);if(!chosen.length)return;const [cols,rows]=$('#contactLayout').value.split('x').map(Number),max=cols*rows,items=chosen.slice(0,max),W=1600,margin=70,gap=24,header=190,footer=90,cellW=(W-margin*2-gap*(cols-1))/cols,cellH=cellW*1.18,H=Math.round(header+rows*cellH+(rows-1)*gap+footer+margin),c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d'),tone=$('#contactTone').value,label=$('#contactLabel').value.trim()||'KIRA FILM 400',dark=tone==='#1C1919';ctx.fillStyle=tone;ctx.fillRect(0,0,W,H);ctx.fillStyle=dark?'#f8eee5':'#5d4144';ctx.font='bold 54px Georgia';ctx.fillText(label.toUpperCase(),margin,88);ctx.font='26px ui-monospace, monospace';ctx.globalAlpha=.8;ctx.fillText(`${rollName(state.rollViewId==='all'?state.activeNamedRollId:state.rollViewId)}  •  ${items.length} FRAMES  •  ${new Date().toLocaleDateString()}`,margin,136);ctx.globalAlpha=1;for(let i=0;i<items.length;i++){const r=Math.floor(i/cols),col=i%cols,x=margin+col*(cellW+gap),y=header+r*(cellH+gap);try{const im=await blobToImage(items[i].blob);ctx.fillStyle=dark?'#0f0d0d':'#251f20';ctx.fillRect(x-5,y-5,cellW+10,cellH+10);drawCover(ctx,im,x,y,cellW,cellH);ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(x,y+cellH-38,cellW,38);ctx.fillStyle='#fff5e9';ctx.font='20px ui-monospace,monospace';ctx.fillText(String(i+1).padStart(2,'0'),x+12,y+cellH-12)}catch(e){}}ctx.fillStyle=dark?'#e6c0bd':'#9d666f';ctx.font='24px ui-monospace,monospace';ctx.fillText('KIRA • MAKE EVERY MOMENT FEEL LIKE FILM.',margin,H-42);state.contactBlob=await new Promise(res=>c.toBlob(res,'image/jpeg',.94));const u=URL.createObjectURL(state.contactBlob),prev=$('#contactPreview');if(prev.dataset.objectUrl)URL.revokeObjectURL(prev.dataset.objectUrl);prev.src=u;prev.dataset.objectUrl=u;$('#contactPreviewWrap').classList.remove('hidden');toast(items.length<chosen.length?`Sheet made with the first ${items.length} photos.`:'Contact sheet ready 🎞️')}
  function saveContactSheet(){if(!state.contactBlob){toast('Generate the contact sheet first.');return}downloadBlob(state.contactBlob,`kira-contact-sheet-${Date.now()}.jpg`)}
  async function shareContactSheet(){if(!state.contactBlob){toast('Generate the contact sheet first.');return}const file=new File([state.contactBlob],`kira-contact-sheet.jpg`,{type:'image/jpeg'});if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){try{await navigator.share({files:[file],title:'Kira contact sheet'});return}catch(e){if(e.name==='AbortError')return}}saveContactSheet()}

  function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  function bindInputs(){bindRollGridInteractions();bindCameraBeautyControls();
    $('#menuBtn')&&($('#menuBtn').onclick=openDrawer);$('#drawerCloseBtn')&&($('#drawerCloseBtn').onclick=closeDrawer);$('#drawerBackdrop')&&($('#drawerBackdrop').onclick=closeDrawer);$$('[data-menu-action]').forEach(b=>b.onclick=()=>runMenuAction(b.dataset.menuAction));$('#surpriseLookBtn')&&($('#surpriseLookBtn').onclick=randomizeLook);$('#cameraTorchBtn')&&($('#cameraTorchBtn').onclick=toggleCameraTorch);const zoom=$('#cameraZoom');if(zoom)zoom.oninput=e=>scheduleCameraZoom(e.target.value);const rs=$('#rollSearch');if(rs)rs.oninput=e=>{state.rollSearch=e.target.value;renderRolls()};$('#cameraImmersiveBtn')&&($('#cameraImmersiveBtn').onclick=toggleCameraImmersive);const rsort=$('#rollSort');if(rsort){rsort.value=state.rollSort;rsort.onchange=e=>{state.rollSort=e.target.value;renderRolls()}};$('#savePhotoDetailsBtn')&&($('#savePhotoDetailsBtn').onclick=savePhotoDetails);const pcs=$('#photoCaptionSize');if(pcs){pcs.oninput=e=>{$('#photoCaptionSizeValue')&&($('#photoCaptionSizeValue').textContent=`${e.target.value}%`)};}
    const cameraControls=$('#cameraControlsBtn'),cameraPanel=$('#cameraAdvancedPanel');if(cameraControls&&cameraPanel)cameraControls.onclick=()=>{const open=cameraPanel.classList.toggle('hidden')===false;cameraControls.setAttribute('aria-expanded',String(open));cameraControls.textContent=open?'Controls⌃':'Controls⌄';haptic()};
    
    const rollActions=$('#rollActionsBtn'),rollPanel=$('#rollUtilityPanel');if(rollActions&&rollPanel)rollActions.onclick=()=>{const open=rollPanel.classList.toggle('hidden')===false;rollActions.setAttribute('aria-expanded',String(open));rollActions.textContent=open?'Actions⌃':'Actions⌄';haptic()};
    const bulkSelect=$('#bulkSelectBtn');if(bulkSelect)bulkSelect.onclick=()=>setBulkSelectMode(!state.bulkSelectMode);$('#bulkSelectAllBtn').onclick=selectAllBulk;$('#bulkSaveSelectedBtn').onclick=saveSelectedBulk;$('#bulkCancelBtn').onclick=()=>setBulkSelectMode(false);$('#saveAllRollBtn').onclick=saveAllCurrent;
    const compareQuick=$('#compareQuickBtn');if(compareQuick){const on=()=>{state.compare=true;renderPhoto();compareQuick.classList.add('active')},off=()=>{state.compare=false;renderPhoto();compareQuick.classList.remove('active')};compareQuick.addEventListener('pointerdown',on);['pointerup','pointercancel','pointerleave'].forEach(x=>compareQuick.addEventListener(x,off))}
    $('#galleryBtn').onclick=()=>$('#galleryInput').click();$('#shutterBtn').onclick=captureOrRecord;$$('[data-capture-mode]').forEach(b=>b.onclick=()=>setCaptureMode(b.dataset.captureMode));$('#flipCameraBtn').onclick=flipCamera;$('#startCameraBtn').onclick=()=>{if(!navigator.mediaDevices?.getUserMedia){$('#cameraInput').click();return}startCamera(true)};
    $('#galleryInput').onchange=e=>loadFile(e.target.files?.[0],'gallery');$('#cameraInput').onchange=e=>loadFile(e.target.files?.[0],'camera');
    $('#savePhotoBtn').onclick=saveEdited;$('#saveTopBtn').onclick=saveEdited;$('#sharePhotoBtn').onclick=shareEdited;$('#undoBtn').onclick=undo;$('#redoBtn').onclick=redo;
    const fi=$('#filterIntensity');rangeHistory(fi);fi.oninput=e=>{state.filterIntensity=Number(e.target.value);$('#intensityValue').textContent=e.target.value;$('#activeLookIntensity')&&($('#activeLookIntensity').textContent=`${e.target.value}%`);$('#liveFilterIntensity').value=e.target.value;scheduleRender();scheduleLiveFilter()};fi.onchange=()=>{finishRangeHistory();applyLiveFilter()};
    const live=$('#liveFilterIntensity');live.oninput=e=>{state.filterIntensity=Number(e.target.value);$('#filterIntensity').value=e.target.value;$('#intensityValue').textContent=e.target.value;$('#liveIntensityValue').textContent=e.target.value;$('#activeLookIntensity')&&($('#activeLookIntensity').textContent=`${e.target.value}%`);scheduleLiveFilter()};live.onchange=()=>{saveSettings()};
    $('#cameraFavoriteBtn').onclick=toggleActiveCameraFavorite;$('#ratioBtn').onclick=cycleCameraRatio;$('#timerBtn').onclick=cycleCameraTimer;
    $('#gridBtn').onclick=()=>{state.settings.grid=!state.settings.grid;applySettings();saveSettings()};
    $('#cameraRollSelect').onchange=e=>setActiveRoll(e.target.value);$('#developRollSelect').onchange=e=>setActiveRoll(e.target.value);
    $$('.nav-btn').forEach(b=>b.onclick=()=>switchScreen(b.dataset.target));$$('.roll-tabs .chip').forEach(b=>b.onclick=()=>{state.activeRollFilter=b.dataset.rollFilter;if(state.bulkSelectMode)state.bulkSelectedIds.clear();$$('.roll-tabs .chip').forEach(x=>x.classList.toggle('active',x===b));renderRolls()});
    $('#newRollBtn').onclick=()=>openRollModal();$('#saveRollBtn').onclick=saveRollFromModal;$('#deleteRollBtn').onclick=deleteRollFromModal;
    $('#importToRollBtn').onclick=()=>$('#rollImportInput').click();$('#rollImportInput').onchange=e=>importPhotosToRoll(e.target.files);
    $('#contactSheetBtn').onclick=()=>setContactMode(!state.contactMode);$('#cancelContactBtn').onclick=()=>setContactMode(false);$('#selectAllContactBtn').onclick=selectAllCurrent;$('#makeContactSheetBtn').onclick=openContactModal;$('#generateContactBtn').onclick=generateContactSheet;$('#saveContactBtn').onclick=saveContactSheet;$('#shareContactBtn').onclick=shareContactSheet;
    $('#photosQueueBtn').onclick=shareQueuedPhotos;$('#savePhotosPromptBtn').onclick=async()=>{const f=state.pendingShareFile;if(!f)return;const ok=await shareFileNow(f,state.pendingShareTitle);if(!ok){downloadBlob(f,f.name||`kira-${Date.now()}`);hideSavePhotosPrompt();toast('Saved as a file. On iPhone, use the file share menu to add it to Photos.')}};$('#savePhotosDismissBtn').onclick=hideSavePhotosPrompt;$('#photoRollSelect').onchange=moveModalPhoto;$('#photoFavoriteBtn').onclick=favoriteModalPhoto;$('#photoDeleteBtn').onclick=deleteModalPhoto;$('#photoUseLookBtn').onclick=useModalPhotoLook;
    $$('[data-close-modal]').forEach(b=>b.onclick=()=>closeModal(b.dataset.closeModal));$$('.modal-backdrop').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal(m.id)}));
    $$('#exportQuality button').forEach(b=>b.onclick=()=>{state.exportQuality=b.dataset.quality;$$('#exportQuality button').forEach(x=>x.classList.toggle('active',x===b));$('#exportSummary')&&($('#exportSummary').textContent=`${state.exportQuality} quality`);toast(`${state.exportQuality} export selected`)});$('#filterSearch').oninput=e=>{state.filterSearch=e.target.value;renderFilters()};
  }
  const themeMap={
    'old-rose':{rose:'#b76e79',dark:'#934f5d',dusty:'#d7a0a7',blush:'#ebc9c8'},
    'sakura':{rose:'#d7678a',dark:'#b9476d',dusty:'#e8a7bb',blush:'#f3ceda'},
    'lavender':{rose:'#9a78ad',dark:'#755986',dusty:'#c6aad3',blush:'#dfcfe6'},
    'sepia':{rose:'#a7765d',dark:'#7f5643',dusty:'#c9a08a',blush:'#e5c8b5'},
    'mono':{rose:'#777173',dark:'#514d4f',dusty:'#aaa4a6',blush:'#d2ced0'}
  };
  function adjustHex(hex,amount){const h=String(hex||'#b76e79').replace('#','');if(h.length!==6)return '#934f5d';const n=parseInt(h,16),r=clamp((n>>16)+amount,0,255),g=clamp(((n>>8)&255)+amount,0,255),b=clamp((n&255)+amount,0,255);return '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}
  function applyAppearance(){document.body.classList.remove('theme-lavender','theme-sepia','theme-mono','compact-ui');const t=state.settings.theme||'old-rose',custom=state.settings.accent||'#b76e79',palette=t==='custom'?{rose:custom,dark:adjustHex(custom,-34),dusty:adjustHex(custom,40),blush:adjustHex(custom,75)}:(themeMap[t]||themeMap['old-rose']);const root=document.documentElement;root.style.setProperty('--rose',palette.rose);root.style.setProperty('--rose-dark',palette.dark);root.style.setProperty('--dusty',palette.dusty);root.style.setProperty('--blush',palette.blush);if(['lavender','sepia','mono'].includes(t))document.body.classList.add('theme-'+t);document.body.classList.toggle('compact-ui',state.settings.density==='compact');$('#settingAccent')&&($('#settingAccent').value=custom);$('#settingTheme')&&($('#settingTheme').value=t);$('#settingDensity')&&($('#settingDensity').value=state.settings.density||'cozy')}
  function formatBytes(n){if(!Number.isFinite(n))return 'Unavailable';const units=['B','KB','MB','GB'];let i=0,v=n;while(v>=1024&&i<units.length-1){v/=1024;i++}return `${v>=10||i===0?v.toFixed(0):v.toFixed(1)} ${units[i]}`}
  async function updateStorageEstimate(){const text=$('#storageUsageText'),bar=$('#storageUsageBar'),btn=$('#persistentStorageBtn');if(!navigator.storage?.estimate){if(text)text.textContent='Unavailable';return}try{const {usage=0,quota=0}=await navigator.storage.estimate();if(text)text.textContent=`${formatBytes(usage)} of ${formatBytes(quota)}`;if(bar)bar.style.width=quota?`${Math.min(100,usage/quota*100)}%`:'0%';if(btn&&navigator.storage.persisted){const yes=await navigator.storage.persisted();btn.textContent=yes?'Local storage protected ✓':'Protect local storage';btn.disabled=yes}}catch(e){if(text)text.textContent='Unavailable'}}
  async function requestPersistentStorage(){if(!navigator.storage?.persist){toast('Persistent storage is not available in this browser.');return}try{const ok=await navigator.storage.persist();toast(ok?'Kira storage is protected where supported.':'iPhone did not grant persistent storage.');updateStorageEstimate()}catch(e){toast('Could not request persistent storage.')}}
  function exportKiraSetup(){const data={app:'Kira',format:1,exportedAt:new Date().toISOString(),settings:state.settings,favoriteFilters:[...state.favoriteFilters],recipes:state.recipes,namedRolls:state.namedRolls,recentLooks:state.recentLooks,cameraRatio:state.cameraRatio,cameraTimer:state.cameraTimer};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});downloadBlob(blob,`kira-setup-${today()}.json`);toast('Kira setup exported. Photos and videos were not included.')}
  async function importKiraSetup(file){if(!file)return;try{const data=JSON.parse(await file.text());if(data?.app!=='Kira'||data?.format!==1)throw new Error('Not a Kira setup file');if(data.settings&&typeof data.settings==='object')state.settings=Object.assign({},defaultSettings,data.settings);state.favoriteFilters=new Set(Array.isArray(data.favoriteFilters)?data.favoriteFilters:[]);state.recipes=Array.isArray(data.recipes)?data.recipes:[];state.namedRolls=Array.isArray(data.namedRolls)?data.namedRolls:[];state.recentLooks=Array.isArray(data.recentLooks)?data.recentLooks.slice(0,8):[];state.cameraRatio=data.cameraRatio||'3:4';state.cameraTimer=Number(data.cameraTimer||0);state.activeNamedRollId='unfiled';localStorage.setItem('kira.settings',JSON.stringify(state.settings));localStorage.setItem('kira.favoriteFilters',JSON.stringify([...state.favoriteFilters]));localStorage.setItem('kira.recipes',JSON.stringify(state.recipes));localStorage.setItem('kira.namedRolls',JSON.stringify(state.namedRolls));localStorage.setItem('kira.recentLooks',JSON.stringify(state.recentLooks));localStorage.setItem('kira.cameraRatio',state.cameraRatio);localStorage.setItem('kira.cameraTimer',String(state.cameraTimer));localStorage.setItem('kira.activeRoll','unfiled');toast('Kira setup restored. Reloading…');setTimeout(()=>location.reload(),600)}catch(e){console.warn(e);toast('That file is not a valid Kira setup backup.')}}
  function resetPreferences(){if(!confirm('Reset Kira preferences to first-install defaults? Your photos, rolls, and recipes will stay.'))return;state.settings={...defaultSettings};localStorage.setItem('kira.settings',JSON.stringify(state.settings));applySettings();bindSettings();toast('Preferences reset.')}
  function setupOnboarding(){if(localStorage.getItem('kira.onboarding.v11')==='done')return;$('#onboardingModal')?.classList.remove('hidden');$('#finishOnboardingBtn').onclick=()=>{localStorage.setItem('kira.onboarding.v11','done');$('#onboardingModal').classList.add('hidden')}}
  function bindSettings(){const map={settingGrid:'grid',settingHaptics:'haptics',settingRememberFilter:'rememberFilter',settingKeepOriginal:'keepOriginal',settingAutoSave:'autoSave',settingAutoPhotos:'autoPhotos',settingContinuousShoot:'continuousShoot',settingVideoAudio:'videoAudio'};Object.entries(map).forEach(([id,key])=>{const e=$('#'+id);if(!e)return;e.checked=!!state.settings[key];e.onchange=()=>{state.settings[key]=e.checked;applySettings();saveSettings()}});const vq=$('#settingVideoQuality');if(vq){vq.value=state.settings.videoQuality||'smooth';vq.onchange=()=>{state.settings.videoQuality=vq.value;saveSettings();toast(vq.value==='smooth'?'Smooth video quality selected.':'High video quality selected.')}}const dc=$('#settingDefaultCapture');if(dc){dc.value=state.settings.defaultCaptureMode||'photo';dc.onchange=()=>{state.settings.defaultCaptureMode=dc.value;saveSettings()}}const th=$('#settingTheme');if(th){th.value=state.settings.theme||'old-rose';th.onchange=()=>{state.settings.theme=th.value;applyAppearance();saveSettings()}}const ac=$('#settingAccent');if(ac){ac.value=state.settings.accent||'#b76e79';ac.oninput=()=>{state.settings.accent=ac.value;state.settings.theme='custom';applyAppearance()};ac.onchange=saveSettings}const den=$('#settingDensity');if(den){den.value=state.settings.density||'cozy';den.onchange=()=>{state.settings.density=den.value;applyAppearance();saveSettings()}}$('#resetAppearanceBtn')&&($('#resetAppearanceBtn').onclick=()=>{state.settings.theme='old-rose';state.settings.accent='#b76e79';state.settings.density='cozy';applyAppearance();saveSettings();toast('Appearance reset.')} );$('#persistentStorageBtn')&&($('#persistentStorageBtn').onclick=requestPersistentStorage);$('#exportSetupBtn')&&($('#exportSetupBtn').onclick=exportKiraSetup);$('#importSetupBtn')&&($('#importSetupBtn').onclick=()=>$('#setupImportInput').click());$('#setupImportInput')&&($('#setupImportInput').onchange=e=>{importKiraSetup(e.target.files?.[0]);e.target.value=''});$('#resetPreferencesBtn')&&($('#resetPreferencesBtn').onclick=resetPreferences);$('#clearKiraBtn').onclick=async()=>{if(confirm('Clear all photos and videos stored inside Kira on this device? This does not delete media already saved in your phone library.')){await clearRolls();updateStorageEstimate();toast('Kira local media cleared.')}};updateStorageEstimate()}
  function applySettings(){document.body.classList.toggle('grid-on',state.settings.grid);applyAppearance();$('#settingGrid').checked=state.settings.grid;$('#recipeCount')&&($('#recipeCount').textContent=state.recipes.length);$('#namedRollCount')&&($('#namedRollCount').textContent=state.namedRolls.length);applyCameraRatio();$('#timerBtn')&&($('#timerBtn').textContent=state.cameraTimer?`${state.cameraTimer}s`:'Timer Off');renderRollSelectors()}
  let kiraSwRegistration=null,kiraUpdateReloading=false;
  function showAppUpdateBanner(reg){
    kiraSwRegistration=reg||kiraSwRegistration;
    const banner=$('#appUpdateBanner');
    if(banner)banner.classList.remove('hidden');
  }
  function hideAppUpdateBanner(){
    $('#appUpdateBanner')?.classList.add('hidden');
  }
  async function setupServiceWorkerUpdates(){
    if(!('serviceWorker' in navigator))return;
    try{
      const reg=await navigator.serviceWorker.register('./service-worker.js?v=12.1.0');
      kiraSwRegistration=reg;
      if(reg.waiting&&navigator.serviceWorker.controller)showAppUpdateBanner(reg);
      reg.addEventListener('updatefound',()=>{
        const worker=reg.installing;
        if(!worker)return;
        worker.addEventListener('statechange',()=>{
          if(worker.state==='installed'&&navigator.serviceWorker.controller){
            showAppUpdateBanner(reg);
          }
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange',()=>{
        if(!kiraUpdateReloading)return;
        kiraUpdateReloading=false;
        window.location.reload();
      });
      const updateBtn=$('#applyUpdateBtn');
      if(updateBtn)updateBtn.onclick=()=>{
        const waiting=(kiraSwRegistration||reg).waiting;
        if(waiting){
          kiraUpdateReloading=true;
          waiting.postMessage({type:'SKIP_WAITING'});
        }else{
          hideAppUpdateBanner();
          window.location.reload();
        }
      };
      setTimeout(()=>reg.update().catch(()=>{}),1400);
      document.addEventListener('visibilitychange',()=>{
        if(!document.hidden)reg.update().catch(()=>{});
      });
    }catch(err){
      console.warn('Kira service worker:',err);
    }
  }

  function setupInstall(){window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.deferredInstallPrompt=e;$('#installBtn').hidden=false});$('#installBtn').onclick=async()=>{if(!state.deferredInstallPrompt){toast(isIOS()?'On iPhone: Share → Add to Home Screen':'Use your browser menu → Install app');return}state.deferredInstallPrompt.prompt();await state.deferredInstallPrompt.userChoice;state.deferredInstallPrompt=null;$('#installBtn').hidden=true}}
  function preventZoom(){const stop=e=>e.preventDefault();['gesturestart','gesturechange','gestureend'].forEach(t=>document.addEventListener(t,stop,{passive:false}));document.addEventListener('touchmove',e=>{if(e.touches&&e.touches.length>1)e.preventDefault()},{passive:false});let last=0;document.addEventListener('touchend',e=>{const n=Date.now();if(n-last<=320)e.preventDefault();last=n},{passive:false});document.addEventListener('dblclick',stop,{passive:false});document.addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault()},{passive:false})}
  function init(){saveNamedRolls();ensure1989Glyphs().then(()=>{try{renderPhoto()}catch(_){}});setCaptureMode(state.settings.defaultCaptureMode||'photo');if(!state.selectedRecipeId)applyPresetExtras(state.activeFilter);renderRollSelectors();updateCameraHUD();renderCameraCategories();renderCameraFilters();setupToolTabs();bindInputs();bindSettings();applySettings();setupInstall();preventZoom();cleanupRetiredMotionPairs().finally(()=>refreshRolls());updateHistoryButtons();updatePhotosQueueUI();document.body.classList.add('camera-mode');updateCameraViewport();setupOnboarding();const onViewport=()=>requestAnimationFrame(updateCameraViewport);window.addEventListener('resize',onViewport,{passive:true});window.visualViewport?.addEventListener('resize',onViewport,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){if(state.recording)stopVideoRecording();else stopCamera()}else if($('#screen-camera')?.classList.contains('active')){updateCameraViewport();bootCameraSafely()}});setupServiceWorkerUpdates();setTimeout(()=>{updateCameraViewport();bootCameraSafely()},120)}
  init();
})();