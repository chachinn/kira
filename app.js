(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const today=()=>new Date().toISOString().slice(0,10);
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);

  const defaultAdjust=()=>({exposure:0,brightness:0,contrast:0,highlights:0,shadows:0,saturation:0,warmth:0,tint:0,fade:0,sharpness:0,vignette:8});
  const defaultEffects=()=>({grain:10,grainType:'Classic',bloom:0,bloomType:'Soft',dust:0,scratches:0,leak:0,leakType:'Pink',rgbSplit:0,noise:0,sparkle:0,sparkleType:'Star'});
  const defaultSettings={grid:false,haptics:true,rememberFilter:true,keepOriginal:true,autoSave:true,autoPhotos:false,videoAudio:true,videoQuality:'smooth'};

  const builtins=[
    ['Kira Original','Kira','#9f7473,#dec2b0',{}],
    ['Old Rose','Kira','#ad6d79,#e8c2b4',{brightness:5,contrast:-8,saturation:-8,warmth:10,fade:10,grain:8,grainType:'Fine'}],
    ['First Love','Kira','#e8c5c7,#f6e5da',{brightness:10,contrast:-12,saturation:-6,warmth:7,fade:14,bloom:10,bloomType:'Dream'}],
    ['Sunday','Kira','#c99678,#f0d9bc',{brightness:5,contrast:-4,saturation:4,warmth:14,fade:6}],
    ['Diary','Kira','#8c6e62,#d5b29e',{contrast:-12,saturation:-12,warmth:7,fade:18,grain:12,dust:8}],
    ['After School','Kira','#af8179,#e4b596',{brightness:3,contrast:4,warmth:9,tint:5,fade:8,grain:9}],
    ['Rose Flash','Kira','#b96c80,#f4cad0',{brightness:13,contrast:7,saturation:4,tint:12,bloom:12,bloomType:'Flash'}],
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
  const loadNamedRolls=()=>{try{const v=JSON.parse(localStorage.getItem('kira.namedRolls')||'[]');return Array.isArray(v)&&v.length?v:[{id:'roll-kira',name:'Kira Roll',createdAt:Date.now()}]}catch(e){return [{id:'roll-kira',name:'Kira Roll',createdAt:Date.now()}]}};
  const state={
    image:null,imageName:'kira-photo',activeFilter:'Old Rose',activeCategory:'All',filterIntensity:70,filterSearch:'',
    adjustments:defaultAdjust(),effects:defaultEffects(),frame:'None',frameTone:'#fff8f1',frameWidth:8,frameCorner:8,caption:'',
    dateEnabled:false,dateStyle:'Classic',dateValue:today(),dateColor:'Orange',datePosition:'Bottom Right',dateCustomText:'',
    compare:false,exportQuality:'High',selectedRecipeId:null,
    favoriteFilters:new Set(JSON.parse(localStorage.getItem('kira.favoriteFilters')||'[]')),
    recipes:loadRecipes(),settings:Object.assign({},defaultSettings,JSON.parse(localStorage.getItem('kira.settings')||'{}')),
    namedRolls:loadNamedRolls(),activeNamedRollId:localStorage.getItem('kira.activeRoll')||'roll-kira',rollViewId:'all',
    rolls:[],deferredInstallPrompt:null,activeRollFilter:'all',history:[],future:[],pendingSnapshot:null,cameraStream:null,cameraFacing:'environment',cameraReady:false,activeCameraCategory:'Kira',cameraThumbTimer:null,lastThumbPaint:0,thumbPaintPending:false,
    cameraRatio:localStorage.getItem('kira.cameraRatio')||'3:4',cameraTimer:Number(localStorage.getItem('kira.cameraTimer')||0),timerRunning:false,
    contactMode:false,selectedPhotoIds:new Set(),contactBlob:null,photoModalId:null,rollModalId:null,presetAutoDate:false,presetAutoFrame:false,captureMode:'photo',mediaRecorder:null,videoChunks:[],recording:false,recordStartedAt:0,recordTimer:null,videoAudioStream:null,pendingShareFile:null,pendingShareTitle:''
  };
  if(!state.namedRolls.some(r=>r.id===state.activeNamedRollId))state.activeNamedRollId=state.namedRolls[0].id;
  if(state.settings.rememberFilter){const sf=localStorage.getItem('kira.lastFilter');if(sf&&allPresets().some(f=>f.name===sf))state.activeFilter=sf;}

  const adjustmentDefs=[['exposure','Exposure',-30,30],['brightness','Brightness',-40,40],['contrast','Contrast',-40,40],['highlights','Highlights',-40,40],['shadows','Shadows',-40,40],['saturation','Saturation',-50,50],['warmth','Warmth',-40,40],['tint','Tint',-40,40],['fade','Fade',0,40],['sharpness','Sharpness',0,30],['vignette','Vignette',0,40]];
  const effectDefs=[['grain','◌','Grain'],['bloom','✦','Bloom'],['dust','⠿','Dust'],['scratches','╱','Scratches'],['leak','◒','Light Leak'],['rgbSplit','RGB','RGB Split'],['noise','▦','CCD Noise'],['sparkle','✧','Sparkle']];

  function haptic(ms=10){if(state.settings.haptics&&navigator.vibrate)navigator.vibrate(ms)}
  function toast(msg){const e=$('#toast');e.textContent=msg;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2300)}
  function saveSettings(){localStorage.setItem('kira.settings',JSON.stringify(state.settings));localStorage.setItem('kira.favoriteFilters',JSON.stringify([...state.favoriteFilters]));if(state.settings.rememberFilter)localStorage.setItem('kira.lastFilter',state.activeFilter)}
  function saveRecipes(){localStorage.setItem('kira.recipes',JSON.stringify(state.recipes));$('#recipeCount')&&($('#recipeCount').textContent=state.recipes.length)}
  function saveNamedRolls(){localStorage.setItem('kira.namedRolls',JSON.stringify(state.namedRolls));localStorage.setItem('kira.activeRoll',state.activeNamedRollId);$('#namedRollCount')&&($('#namedRollCount').textContent=state.namedRolls.length)}
  function rollName(id){return state.namedRolls.find(r=>r.id===id)?.name||state.namedRolls[0]?.name||'Kira Roll'}
  function defaultRollId(){return state.namedRolls[0]?.id||'roll-kira'}
  function renderRollSelectors(){const opts=state.namedRolls.map(r=>`<option value="${r.id}" ${r.id===state.activeNamedRollId?'selected':''}>${escapeHtml(r.name)}</option>`).join('');['#cameraRollSelect','#developRollSelect','#photoRollSelect'].forEach(s=>{const e=$(s);if(e)e.innerHTML=opts});$('#cameraRollBadge')&&($('#cameraRollBadge').textContent=rollName(state.activeNamedRollId));$('#namedRollCount')&&($('#namedRollCount').textContent=state.namedRolls.length);updateCameraHUD()}
  function setActiveRoll(id){if(!state.namedRolls.some(r=>r.id===id))return;state.activeNamedRollId=id;localStorage.setItem('kira.activeRoll',id);renderRollSelectors();renderNamedRollBar();renderRolls();haptic()}
  function allPresets(){return [...builtins,...state.recipes.map(recipeToPreset)]}
  function recipeToPreset(r){const base=builtins.find(x=>x.name===r.snapshot.activeFilter)||builtins[0];return {id:r.id,name:r.name,cat:'My Recipes',thumb:base.thumb,p:r.snapshot.adjustments||{},kind:'recipe',recipeId:r.id,pinned:!!r.pinned,snapshot:r.snapshot};}
  function findPreset(name){return allPresets().find(x=>x.name===name) || builtins[0]}
  function editSnapshot(){return JSON.parse(JSON.stringify({activeFilter:state.activeFilter,filterIntensity:state.filterIntensity,adjustments:state.adjustments,effects:state.effects,frame:state.frame,frameTone:state.frameTone,frameWidth:state.frameWidth,frameCorner:state.frameCorner,caption:state.caption,dateEnabled:state.dateEnabled,dateStyle:state.dateStyle,dateValue:state.dateValue,dateColor:state.dateColor,datePosition:state.datePosition,dateCustomText:state.dateCustomText}))}
  function applySnapshot(s){Object.assign(state,JSON.parse(JSON.stringify(s||{})));state.presetAutoDate=false;state.presetAutoFrame=false;$('#filterIntensity').value=state.filterIntensity;$('#intensityValue').textContent=state.filterIntensity;renderAllPanels();renderPhoto();applyLiveFilter();updateHistoryButtons();saveSettings()}
  function commit(){state.history.push(editSnapshot());if(state.history.length>50)state.history.shift();state.future=[];updateHistoryButtons()}
  function undo(){if(!state.history.length)return;state.future.push(editSnapshot());applySnapshot(state.history.pop());toast('Undo')}
  function redo(){if(!state.future.length)return;state.history.push(editSnapshot());applySnapshot(state.future.pop());toast('Redo')}
  function updateHistoryButtons(){if($('#undoBtn'))$('#undoBtn').disabled=!state.history.length;if($('#redoBtn'))$('#redoBtn').disabled=!state.future.length}
  function startRangeHistory(){if(!state.pendingSnapshot)state.pendingSnapshot=editSnapshot()}
  function finishRangeHistory(){if(state.pendingSnapshot){state.history.push(state.pendingSnapshot);if(state.history.length>50)state.history.shift();state.pendingSnapshot=null;state.future=[];updateHistoryButtons();saveSettings()}}

  function switchScreen(name){if(state.recording&&name!=='camera'){toast('Stop recording before leaving Camera.');return}$$('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===name));$$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.target===name));document.body.classList.toggle('camera-mode',name==='camera');window.scrollTo(0,0);if(name==='rolls'){renderNamedRollBar();renderRolls()}if(name==='camera'){updateCameraViewport();applyCameraRatio();startCamera()}else{stopCamera();if(name==='develop'){renderAllPanels();renderPhoto()}}renderRollSelectors()}
  function presetCard(f){const fav=f.kind==='recipe'?(f.pinned?'♥':''):(state.favoriteFilters.has(f.name)?'♥':'');const label=f.kind==='recipe'?'Recipe':f.cat;return `<button class="preset-card ${state.activeFilter===f.name?'active':''}" data-filter="${escapeHtml(f.name)}" data-kind="${f.kind}" ${f.recipeId?`data-recipe-id="${f.recipeId}"`:''}><div class="preset-thumb" style="background:${f.thumb}"></div><span>${escapeHtml(f.name)}${fav?` <i class="favorite-star">${fav}</i>`:''}</span><small style="font-size:9px;color:#8f7072">${label}</small></button>`}
  function cameraPresetCard(f){const fav=f.kind==='recipe'?(f.pinned?'♥':''):(state.favoriteFilters.has(f.name)?'♥':'');return `<button class="preset-card ${cameraPresetIsActive(f)?'active':''}" data-camera-filter="${escapeHtml(f.name)}" data-kind="${f.kind}" ${f.recipeId?`data-recipe-id="${f.recipeId}"`:''}><div class="preset-thumb camera-swatch" style="background:${f.thumb}"></div><span>${escapeHtml(f.name)}${fav?` <i class="favorite-star">${fav}</i>`:''}</span><small>${f.kind==='recipe'?'Recipe':(f.p?.pack||f.cat)}</small></button>`}
  function cameraPresetIsActive(f){if(f.kind==='recipe')return state.selectedRecipeId===f.recipeId;return !state.selectedRecipeId&&state.activeFilter===f.name}
  function visiblePresets(){let list=allPresets();if(state.activeCategory==='Favorites')list=list.filter(f=>f.kind==='recipe'?f.pinned:state.favoriteFilters.has(f.name));else if(state.activeCategory!=='All')list=list.filter(f=>f.cat===state.activeCategory);const q=state.filterSearch.trim().toLowerCase();if(q)list=list.filter(f=>f.name.toLowerCase().includes(q)||f.cat.toLowerCase().includes(q));if(state.activeCategory==='My Recipes')list.sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned));return list}
  function visibleCameraPresets(){let list=allPresets();const cat=state.activeCameraCategory;if(cat==='Favorites')list=list.filter(f=>f.kind==='recipe'?f.pinned:state.favoriteFilters.has(f.name));else if(cat!=='All')list=list.filter(f=>f.cat===cat);if(cat==='My Recipes')list.sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned));return list}
  function renderCameraCategories(){const cats=['Kira','Camera Packs','Instant','Vintage','Date Cam','Film','Film Stock','CCD','Y2K','Dream','Japan','Favorites','My Recipes','All'];const area=$('#cameraCategories');if(!area)return;if(!area.children.length){area.innerHTML=cats.map(c=>`<button class="chip ${state.activeCameraCategory===c?'active':''}" data-camera-cat="${c}">${c}</button>`).join('');area.onclick=e=>{const b=e.target.closest('[data-camera-cat]');if(!b||state.activeCameraCategory===b.dataset.cameraCat)return;state.activeCameraCategory=b.dataset.cameraCat;$$('[data-camera-cat]',area).forEach(x=>x.classList.toggle('active',x===b));renderCameraFilters();haptic()}}else{$$('[data-camera-cat]',area).forEach(x=>x.classList.toggle('active',x.dataset.cameraCat===state.activeCameraCategory))}}
  function renderCameraFilters(){const area=$('#cameraStrip');if(!area)return;const list=visibleCameraPresets();area.innerHTML=list.length?list.map(cameraPresetCard).join(''):'<div class="notice">No filters saved in this category yet.</div>';$$('[data-camera-filter]',area).forEach(btn=>btn.onclick=()=>{if(state.recording){toast('Finish recording before changing looks.');return}if(btn.dataset.kind==='recipe'&&btn.dataset.recipeId){fastCameraApplyRecipe(btn.dataset.recipeId)}else{fastCameraSelect(btn.dataset.cameraFilter)}syncCameraActiveCards();applyLiveFilter();updateLiveFrame()})}
  function syncCameraActiveCards(){$$('#cameraStrip [data-camera-filter]').forEach(btn=>{const active=btn.dataset.kind==='recipe'?state.selectedRecipeId===btn.dataset.recipeId:(!state.selectedRecipeId&&state.activeFilter===btn.dataset.cameraFilter);btn.classList.toggle('active',active)})}
  function fastCameraSelect(name){state.activeFilter=name;state.selectedRecipeId=null;applyPresetExtras(name);if(state.settings.rememberFilter)localStorage.setItem('kira.lastFilter',name);updateCameraHUD();updateLiveFrame();saveSettings();haptic()}
  function fastCameraApplyRecipe(id){const recipe=state.recipes.find(x=>x.id===id);if(!recipe)return;const snap=JSON.parse(JSON.stringify(recipe.snapshot||{}));Object.assign(state,snap);state.selectedRecipeId=id;state.presetAutoDate=false;state.presetAutoFrame=false;updateCameraHUD();updateLiveFrame();saveSettings();haptic()}
  function renderCategories(){const cats=['All','Favorites','Kira','Camera Packs','Instant','Vintage','Date Cam','Film','Film Stock','CCD','Y2K','Dream','Japan','My Recipes'];$('#filterCategories').innerHTML=cats.map(c=>`<button class="chip ${state.activeCategory===c?'active':''}" data-cat="${c}">${c}</button>`).join('');$('#filterCategories').onclick=e=>{const b=e.target.closest('[data-cat]');if(!b)return;state.activeCategory=b.dataset.cat;renderCategories();renderFilters();haptic()};renderCameraCategories();renderCameraFilters()}
  function renderFilters(){const list=visiblePresets();$('#filterRow').innerHTML=list.length?list.map(presetCard).join(''):'<div class="notice">No matching filters or recipes yet.</div>';$$('#filterRow .preset-card').forEach(btn=>{btn.onclick=()=>handlePresetSelect(btn.dataset.kind,btn.dataset.filter,btn.dataset.recipeId);let t;btn.addEventListener('pointerdown',()=>t=setTimeout(()=>btn.dataset.kind==='recipe'?toggleRecipePin(btn.dataset.recipeId):toggleFavorite(btn.dataset.filter),650));['pointerup','pointercancel','pointerleave'].forEach(x=>btn.addEventListener(x,()=>clearTimeout(t)))})}
  function handlePresetSelect(kind,name,recipeId){if(kind==='recipe'&&recipeId)return applyRecipe(recipeId,true);selectFilter(name)}
  function applyPresetExtras(name){const f=builtins.find(x=>x.name===name);if(!f)return;const p=f.p||{};if(state.presetAutoFrame&&!p.autoFrame&&state.frame===state.presetAutoFrame)state.frame='None';if(state.presetAutoDate&&!p.autoDate)state.dateEnabled=false;if(p.autoFrame){state.frame=p.autoFrame;state.presetAutoFrame=p.autoFrame}else state.presetAutoFrame=false;if(p.autoDate){state.dateEnabled=true;state.dateStyle=p.autoDate.style||'Classic';state.dateColor=p.autoDate.color||'Orange';state.datePosition=p.autoDate.position||'Bottom Right';state.dateValue=today();state.presetAutoDate=true}else state.presetAutoDate=false;updateLiveDateStamp()}
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
  function selectFilter(name){if(name===state.activeFilter&&!state.selectedRecipeId){applyPresetExtras(name);renderFramePanel();renderDatePanel();renderPhoto();applyLiveFilter();return}commit();state.activeFilter=name;state.selectedRecipeId=null;applyPresetExtras(name);if(state.settings.rememberFilter)localStorage.setItem('kira.lastFilter',name);renderCategories();renderFilters();renderFilmLabPanel();renderFramePanel();renderDatePanel();renderPhoto();applyLiveFilter();updateCameraHUD();saveSettings();haptic()}
  function toggleFavorite(name){state.favoriteFilters.has(name)?state.favoriteFilters.delete(name):state.favoriteFilters.add(name);saveSettings();renderCategories();renderFilters();renderCameraFilters();toast(state.favoriteFilters.has(name)?'Saved to favorites ♥':'Removed from favorites');haptic(20)}
  function toggleRecipePin(id){const r=state.recipes.find(x=>x.id===id);if(!r)return;r.pinned=!r.pinned;saveRecipes();renderCategories();renderFilters();renderCameraFilters();renderFilmLabPanel();toast(r.pinned?'Recipe pinned ♥':'Recipe unpinned')}

  function rangeHistory(inp){inp.addEventListener('pointerdown',startRangeHistory);inp.addEventListener('focus',startRangeHistory);inp.addEventListener('change',finishRangeHistory)}
  function renderAdjustmentPanel(){
    $('#tool-adjust').innerHTML=`<div class="slider-list">${adjustmentDefs.map(([k,l,min,max])=>`<div class="slider-row"><label>${l}</label><input data-adj="${k}" type="range" min="${min}" max="${max}" value="${state.adjustments[k]}"><output id="out-${k}">${state.adjustments[k]}</output></div>`).join('')}<button class="secondary-btn" id="resetAdjustBtn">Reset adjustments</button></div>`;
    $$('[data-adj]').forEach(inp=>{rangeHistory(inp);inp.oninput=()=>{state.adjustments[inp.dataset.adj]=Number(inp.value);$('#out-'+inp.dataset.adj).textContent=inp.value;scheduleRender()}});
    $('#resetAdjustBtn').onclick=()=>{commit();state.adjustments=defaultAdjust();renderAdjustmentPanel();renderPhoto();saveSettings()};
  }

  function renderEffectsPanel(){
    $('#tool-effects').innerHTML=`<div class="effect-grid">${effectDefs.map(([k,ic,l])=>`<button class="effect-btn ${state.effects[k]>0?'active':''}" data-effect="${k}"><b>${ic}</b>${l}<small style="display:block;margin-top:5px">${state.effects[k]}%</small></button>`).join('')}</div><div class="sub-control"><div class="control-head"><span id="selectedEffectLabel">Grain strength</span><b id="effectValue">${state.effects.grain}</b></div><input id="effectStrength" type="range" min="0" max="45" value="${state.effects.grain}"><div id="effectVariantArea"></div></div>`;
    let selected='grain';
    const sync=()=>{const v=state.effects[selected];$('#effectStrength').value=v;$('#effectValue').textContent=v;$('#selectedEffectLabel').textContent=(effectDefs.find(x=>x[0]===selected)?.[2]||selected)+' strength';renderEffectVariants(selected)};
    $$('.effect-btn').forEach(b=>b.onclick=()=>{selected=b.dataset.effect;sync()});
    const slider=$('#effectStrength');rangeHistory(slider);slider.oninput=e=>{state.effects[selected]=Number(e.target.value);$('#effectValue').textContent=e.target.value;scheduleRender()};slider.onchange=()=>{finishRangeHistory();renderEffectsPanel();saveSettings()};sync();
  }
  function renderEffectVariants(selected){const area=$('#effectVariantArea');if(!area)return;let label='',opts=[],key='';if(selected==='grain'){label='Grain type';opts=['Fine','Classic','Rough'];key='grainType'}else if(selected==='bloom'){label='Glow style';opts=['Soft','Dream','Flash'];key='bloomType'}else if(selected==='leak'){label='Leak color';opts=['Red','Orange','Pink'];key='leakType'}else if(selected==='sparkle'){label='Sparkle style';opts=['Star','Dream','Heart'];key='sparkleType'}else{area.innerHTML='';return}area.innerHTML=`<div class="effect-control-title">${label}</div><div class="effect-options">${opts.map(o=>`<button class="option-chip ${state.effects[key]===o?'active':''}" data-variant="${o}" data-key="${key}">${o}</button>`).join('')}</div>`;$$('[data-variant]',area).forEach(b=>b.onclick=()=>{commit();state.effects[b.dataset.key]=b.dataset.variant;renderEffectsPanel();renderPhoto();saveSettings()})}

  function renderFramePanel(){const frames=[['None','◻'],['Classic','▣'],['Polaroid','▤'],['Instant Square','□'],['Instant Wide','▭'],['Instant Mini','▯'],['Instant Black','■'],['35mm','▥'],['Film Strip','▦'],['Mini Print','▧'],['Photo Booth','◫'],['Postcard','✉'],['Negative Edge','◩'],['Contact Print','◪']];const tones=['#fff8f1','#f0dfce','#e6c5aa','#d6a7a5','#201b1b'];$('#tool-frame').innerHTML=`<div class="frame-grid">${frames.map(([n,i])=>`<button class="frame-btn ${state.frame===n?'active':''}" data-frame="${n}"><b>${i}</b>${n}</button>`).join('')}</div><div class="frame-controls"><div class="sub-control"><div class="control-head"><span>Border width</span><b>${state.frameWidth}</b></div><input id="frameWidth" type="range" min="2" max="24" value="${state.frameWidth}"></div><div class="sub-control"><div class="control-head"><span>Corner</span><b>${state.frameCorner}</b></div><input id="frameCorner" type="range" min="0" max="24" value="${state.frameCorner}"></div><div class="sub-control"><div class="control-head"><span>Paper tone</span></div><div class="tone-options">${tones.map(t=>`<button class="color-dot ${state.frameTone===t?'active':''}" data-tone="${t}" style="background:${t}"></button>`).join('')}</div></div><div class="control-card"><label class="control-head"><span>Caption</span></label><input class="caption-input" id="captionInput" maxlength="32" placeholder="good days ♡" value="${escapeHtml(state.caption)}"></div></div>`;$$('.frame-btn').forEach(b=>b.onclick=()=>{commit();state.frame=b.dataset.frame;state.presetAutoFrame=false;renderFramePanel();renderPhoto();updateLiveFrame();saveSettings();haptic()});$$('[data-tone]').forEach(b=>b.onclick=()=>{commit();state.frameTone=b.dataset.tone;renderFramePanel();renderPhoto();saveSettings()});[['#frameWidth','frameWidth'],['#frameCorner','frameCorner']].forEach(([s,k])=>{const e=$(s);rangeHistory(e);e.oninput=()=>{state[k]=Number(e.value);scheduleRender()};e.onchange=()=>{finishRangeHistory();renderFramePanel();saveSettings()}});$('#captionInput').addEventListener('focus',startRangeHistory);$('#captionInput').oninput=e=>{state.caption=e.target.value;scheduleRender()};$('#captionInput').onchange=()=>{finishRangeHistory();saveSettings()}}
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

  function renderAllPanels(){renderCategories();renderFilters();renderAdjustmentPanel();renderEffectsPanel();renderFramePanel();renderDatePanel();renderComparePanel();renderFilmLabPanel();renderRollSelectors();updateCameraHUD();$('#recipeCount')&&($('#recipeCount').textContent=state.recipes.length)}
  function setupToolTabs(){$$('.tool-tab').forEach(btn=>btn.onclick=()=>{$$('.tool-tab').forEach(b=>b.classList.toggle('active',b===btn));$$('.tool-panel').forEach(p=>p.classList.remove('active'));$('#tool-'+btn.dataset.tool).classList.add('active');haptic()})}

  async function loadFile(file,source='gallery'){if(!file||!file.type.startsWith('image/')){toast('Please choose an image.');return}try{const url=URL.createObjectURL(file),img=new Image();img.onload=async()=>{URL.revokeObjectURL(url);prepareNewPhotoEdits();state.image=img;state.imageName=(file.name||'kira-photo').replace(/\.[^.]+$/,'');state.history=[];state.future=[];updateHistoryButtons();$('#emptyEditor').classList.add('hidden');$('#cameraEmpty').classList.add('hidden');fitCanvases(img);renderPhoto();switchScreen('develop');if(state.settings.keepOriginal){try{await storeRollPhoto(file,{kind:'original',name:state.imageName,filter:'Original',favorite:false,rollId:state.activeNamedRollId})}catch(e){}}toast(source==='camera'?'Photo ready to develop 🎞️':'Photo imported 🎞️');haptic(20)};img.onerror=()=>toast('Kira could not open that photo. Try JPG or PNG.');img.src=url}catch(e){console.error(e);toast('Could not load photo.')}
  }
  function fitCanvases(img){const max=1200,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale));const c=$('#editCanvas');if(c){c.width=w;c.height=h}}
  function filterParams(){const f=findPreset(state.activeFilter),mix=state.compare?0:state.filterIntensity/100,get=k=>(Number((f.kind==='builtin'?f.p[k]:0)||0)*mix)+(state.compare?0:Number(state.adjustments[k]||0));return {exposure:get('exposure'),brightness:get('brightness'),contrast:get('contrast'),highlights:get('highlights'),shadows:get('shadows'),saturation:get('saturation'),warmth:get('warmth'),tint:get('tint'),fade:get('fade'),sharpness:get('sharpness'),vignette:get('vignette'),grain:state.compare?0:(Number((f.kind==='builtin'?f.p.grain:0)||0)*mix+state.effects.grain),grainType:state.effects.grainType||f.p.grainType||'Classic',bloom:state.compare?0:(Number((f.kind==='builtin'?f.p.bloom:0)||0)*mix+state.effects.bloom),bloomType:state.effects.bloomType||f.p.bloomType||'Soft',dust:state.compare?0:(Number((f.kind==='builtin'?f.p.dust:0)||0)*mix+state.effects.dust),scratches:state.compare?0:(Number((f.kind==='builtin'?f.p.scratches:0)||0)*mix+state.effects.scratches),leak:state.compare?0:(Number((f.kind==='builtin'?f.p.leak:0)||0)*mix+state.effects.leak),leakType:state.effects.leakType,rgbSplit:state.compare?0:(Number((f.kind==='builtin'?f.p.rgbSplit:0)||0)*mix+state.effects.rgbSplit),noise:state.compare?0:(Number((f.kind==='builtin'?f.p.noise:0)||0)*mix+state.effects.noise),sparkle:state.compare?0:state.effects.sparkle,sparkleType:state.effects.sparkleType}}
  let raf=0;function scheduleRender(){cancelAnimationFrame(raf);raf=requestAnimationFrame(renderPhoto)}
  function renderPhoto(){if(!state.image)return;const c=$('#editCanvas');if(!c)return;drawEdited(c,filterParams(),true)}

  function drawEdited(canvas,p,decorate=true){const ctx=canvas.getContext('2d',{alpha:false}),w=canvas.width,h=canvas.height;ctx.save();ctx.clearRect(0,0,w,h);ctx.fillStyle='#171414';ctx.fillRect(0,0,w,h);const br=100+p.brightness+p.exposure*1.7,co=100+p.contrast,sa=100+p.saturation;ctx.filter=`brightness(${Math.max(10,br)}%) contrast(${Math.max(10,co)}%) saturate(${Math.max(0,sa)}%)`;ctx.drawImage(state.image,0,0,w,h);ctx.filter='none';
    if(p.shadows||p.highlights||p.tint)applyTonePixels(ctx,w,h,p);
    if(p.warmth){ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=Math.min(.34,Math.abs(p.warmth)/105);ctx.fillStyle=p.warmth>0?'#ff995e':'#4d94c2';ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}
    if(p.fade>0){ctx.globalAlpha=Math.min(.38,p.fade/95);ctx.fillStyle='#ead9c9';ctx.fillRect(0,0,w,h);ctx.globalAlpha=1}
    if(p.bloom>0)applyBloom(ctx,canvas,w,h,p.bloom,p.bloomType);
    if(p.rgbSplit>0)applyRGBSplit(ctx,canvas,w,h,p.rgbSplit);
    if(p.leak>0)applyLeak(ctx,w,h,p.leak,p.leakType);
    if(p.noise>0)applyNoise(ctx,w,h,p.noise);
    if(p.grain>0)applyGrain(ctx,w,h,p.grain,p.grainType);
    if(p.dust>0)applyDust(ctx,w,h,p.dust);
    if(p.scratches>0)applyScratches(ctx,w,h,p.scratches);
    if(p.sparkle>0)applySparkle(ctx,w,h,p.sparkle,p.sparkleType);
    if(p.sharpness>0)applySharpness(ctx,w,h,p.sharpness);
    if(p.vignette>0){const g=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.2,w/2,h/2,Math.max(w,h)*.72);g.addColorStop(.45,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(20,8,8,${Math.min(.52,p.vignette/80)})`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
    if(decorate&&!state.compare){if(state.frame!=='None')drawFrame(ctx,w,h);if(state.dateEnabled)drawDate(ctx,w,h)}ctx.restore()}
  function applyTonePixels(ctx,w,h,p){try{const im=ctx.getImageData(0,0,w,h),d=im.data,sh=p.shadows/100,hi=p.highlights/100,ti=p.tint/100;for(let i=0;i<d.length;i+=4){const lum=(d[i]+d[i+1]+d[i+2])/765,sm=(1-lum)*(1-lum),hm=lum*lum,sv=sh*48*sm,hv=hi*46*hm;d[i]=clamp(d[i]+sv+hv+ti*26,0,255);d[i+1]=clamp(d[i+1]+sv+hv-ti*15,0,255);d[i+2]=clamp(d[i+2]+sv+hv+ti*20,0,255)}ctx.putImageData(im,0,0)}catch(e){}}
  function applyBloom(ctx,canvas,w,h,s,type){ctx.save();ctx.globalCompositeOperation='screen';const mult=type==='Flash'?1.45:type==='Dream'?1.15:1;ctx.globalAlpha=Math.min(.34,s/100*mult);ctx.filter=`blur(${Math.max(2,w/(type==='Dream'?220:320))}px) brightness(${type==='Flash'?135:118}%)`;ctx.drawImage(canvas,0,0);ctx.restore()}
  function applyRGBSplit(ctx,canvas,w,h,s){const px=Math.max(1,Math.round(w*s/850));ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.22,s/40);ctx.drawImage(canvas,px,0,w,h);ctx.globalCompositeOperation='multiply';ctx.globalAlpha=Math.min(.12,s/55);ctx.drawImage(canvas,-px,0,w,h);ctx.restore()}
  function applyLeak(ctx,w,h,s,type){const c=type==='Red'?'255,62,56':type==='Orange'?'255,145,64':'255,93,147',x=type==='Orange'?w*.9:w*.05;ctx.save();const g=ctx.createRadialGradient(x,h*.42,0,x,h*.42,w*.7);g.addColorStop(0,`rgba(${c},${Math.min(.48,s/90)})`);g.addColorStop(.5,`rgba(${c},${Math.min(.18,s/180)})`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.restore()}
  function seeded(i){const x=Math.sin(i*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
  function applyGrain(ctx,w,h,s,type){const density=Math.min(18000,Math.round(w*h/(type==='Fine'?380:type==='Rough'?180:260))),size=type==='Fine'?.8:type==='Rough'?1.9:1.15,alpha=Math.min(type==='Rough'?.22:.17,s/150);ctx.save();ctx.globalAlpha=alpha;for(let i=0;i<density;i++){const v=seeded(i*3)>.5?255:0;ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(seeded(i*3+1)*w,seeded(i*3+2)*h,size,size)}ctx.restore()}
  function applyNoise(ctx,w,h,s){const n=Math.min(9000,Math.round(w*h/350));ctx.save();ctx.globalAlpha=Math.min(.12,s/180);for(let i=0;i<n;i++){const v=120+Math.floor(seeded(i+700)*135);ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(seeded(i+1700)*w,seeded(i+2700)*h,1.3,1.3)}ctx.restore()}
  function applyDust(ctx,w,h,s){ctx.save();ctx.globalAlpha=Math.min(.28,s/100);ctx.fillStyle='#fff6ea';for(let i=0;i<Math.round(s*1.4);i++){const r=seeded(i+5)*2.8+.5;ctx.beginPath();ctx.arc(seeded(i+105)*w,seeded(i+205)*h,r,0,Math.PI*2);ctx.fill()}ctx.restore()}
  function applyScratches(ctx,w,h,s){ctx.save();ctx.globalAlpha=Math.min(.25,s/100);ctx.strokeStyle='#fff4e5';ctx.lineWidth=Math.max(.5,w/1500);for(let i=0;i<Math.round(s/3);i++){const x=seeded(i+40)*w,y=seeded(i+80)*h,len=h*(.08+seeded(i+120)*.42);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(seeded(i+150)-.5)*6,y+len);ctx.stroke()}ctx.restore()}
  function applySparkle(ctx,w,h,s,type){ctx.save();ctx.globalAlpha=Math.min(.5,s/100);ctx.strokeStyle=type==='Heart'?'#ffd5e5':'#fff2df';ctx.fillStyle=type==='Heart'?'rgba(255,215,232,.6)':'rgba(255,251,241,.55)';for(let i=0;i<Math.max(3,Math.round(s/3));i++){const x=seeded(i+410)*w,y=seeded(i+510)*h,rad=1.5+seeded(i+610)*Math.max(2,s/8);if(type==='Heart'){ctx.beginPath();ctx.moveTo(x,y+rad*.8);ctx.bezierCurveTo(x-rad*1.4,y-rad*.6,x-rad*2.2,y+rad*.7,x,y+rad*2);ctx.bezierCurveTo(x+rad*2.2,y+rad*.7,x+rad*1.4,y-rad*.6,x,y+rad*.8);ctx.fill()}else{ctx.beginPath();ctx.moveTo(x-rad,y);ctx.lineTo(x+rad,y);ctx.moveTo(x,y-rad);ctx.lineTo(x,y+rad);if(type==='Dream'){ctx.moveTo(x-rad*.7,y-rad*.7);ctx.lineTo(x+rad*.7,y+rad*.7);ctx.moveTo(x-rad*.7,y+rad*.7);ctx.lineTo(x+rad*.7,y-rad*.7)}ctx.stroke()}}ctx.restore()}
  function applySharpness(ctx,w,h,s){if(s<3)return;ctx.save();ctx.globalCompositeOperation='overlay';ctx.globalAlpha=Math.min(.16,s/190);ctx.filter='contrast(145%)';ctx.drawImage(ctx.canvas,0,0,w,h);ctx.restore()}
  function roundPath(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
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
        if(state.caption){ctx.fillStyle=black?'#f8eee7':state.frame==='Postcard'?'#8b5d4b':'#6a4d4e';ctx.textAlign='center';ctx.font=`italic ${Math.max(15,Math.round(w*.031))}px Georgia`;ctx.fillText(state.caption,w/2,h-footer*.34)}
      }
      if(state.frame==='Postcard'){ctx.strokeStyle='rgba(106,77,78,.24)';ctx.beginPath();ctx.moveTo(w*.55,m*1.6);ctx.lineTo(w*.55,h-m*1.6);ctx.moveTo(w*.65,h*.25);ctx.lineTo(w*.88,h*.25);ctx.stroke()}
      ctx.restore();
    }else if(state.frame==='35mm'){
      ctx.save();ctx.fillStyle='#151313';const band=Math.round(h*(.045+state.frameWidth/210));ctx.fillRect(0,0,w,band);ctx.fillRect(0,h-band,w,band);ctx.fillStyle='#f0c777';ctx.font=`${Math.max(14,Math.round(w*.023))}px monospace`;ctx.fillText('KIRA 400',band*.25,band*.67);ctx.fillText('24 EXP',w-band*1.8,h-band*.3);ctx.restore();
    }else if(state.frame==='Film Strip'||state.frame==='Negative Edge'){
      ctx.save();ctx.fillStyle='#111';const side=Math.round(w*(.045+state.frameWidth/230));ctx.fillRect(0,0,side,h);ctx.fillRect(w-side,0,side,h);ctx.fillStyle=state.frame==='Negative Edge'?'#ffb54c':'#e8d9c8';const hole=Math.max(4,Math.round(side*.25));for(let y=hole;y<h;y+=hole*2.2){ctx.fillRect(side*.25,y,hole,hole*.7);ctx.fillRect(w-side*.7,y,hole,hole*.7)}ctx.restore();
    }else if(state.frame==='Photo Booth'){
      ctx.save();ctx.fillStyle=state.frameTone;const gap=Math.round(w*.03),col=Math.round(w*.22),stripX=w-col-gap,innerX=stripX+gap,innerW=col-gap*2,imgH=(h-gap*4)/3;ctx.fillRect(stripX,0,col,h);for(let i=0;i<3;i++){ctx.strokeStyle='rgba(120,92,94,.25)';ctx.strokeRect(innerX,gap*(i+1)+imgH*i,innerW,imgH)}if(state.caption){ctx.fillStyle='#6a4d4e';ctx.font=`italic ${Math.max(12,Math.round(w*.025))}px Georgia`;ctx.fillText(state.caption,innerX+6,h-gap*1.5)}ctx.restore();
    }else if(state.frame==='Contact Print'){
      ctx.save();ctx.fillStyle=state.frameTone;ctx.fillRect(0,0,w,h);ctx.strokeStyle='rgba(70,52,54,.14)';const cols=4,rows=4,margin=w*.06,cellW=(w-margin*2)/cols,cellH=(h-margin*2)/rows;for(let r=0;r<rows;r++){for(let c=0;c<cols;c++){ctx.strokeRect(margin+c*cellW,margin+r*cellH,cellW-4,cellH-4)}}ctx.fillStyle='#8d6e70';ctx.font=`${Math.max(12,Math.round(w*.025))}px monospace`;ctx.fillText('CONTACT PRINT',margin,h-margin*.35);ctx.restore();
    }
  }
  function drawDate(ctx,w,h){const text=formatDateStamp();if(!text)return;const colors={Orange:'#ff983e',Red:'#f2675e',White:'#fff7e8',Green:'#72d48c',Blue:'#72b6ff',Yellow:'#ffd75d',Pink:'#ff91bf'};ctx.save();const size=Math.max(14,Math.round(w*.032));ctx.font=`bold ${size}px ui-monospace,monospace`;ctx.shadowColor='rgba(80,30,10,.35)';ctx.shadowBlur=2;ctx.fillStyle=colors[state.dateColor]||colors.Orange;let x=w*.95,y=h*.94,align='right',base='bottom';if(state.datePosition==='Bottom Center'){x=w*.5;align='center';y=h*.94;base='bottom'}else if(state.datePosition==='Bottom Left'){x=w*.05;align='left';y=h*.94;base='bottom'}else if(state.datePosition==='Top Right'){x=w*.95;align='right';y=h*.06;base='top'}else if(state.datePosition==='Top Center'){x=w*.5;align='center';y=h*.06;base='top'}else if(state.datePosition==='Top Left'){x=w*.05;align='left';y=h*.06;base='top'}ctx.textAlign=align;ctx.textBaseline=base;ctx.fillText(text,x,y);ctx.restore()}

  function cameraCssFromParams(p){const br=Math.max(35,100+p.brightness+p.exposure*1.5),co=Math.max(35,100+p.contrast),sa=Math.max(0,100+p.saturation);const sep=Math.max(0,Math.min(22,p.warmth>0?p.warmth*.38:0));const hue=Math.max(-16,Math.min(16,p.tint*.28+(p.warmth<0?-p.warmth*.12:0)));return `brightness(${br}%) contrast(${co}%) saturate(${sa}%) sepia(${sep}%) hue-rotate(${hue}deg)`}
  function liveParamsForPreset(f){if(f.kind==='recipe'&&f.snapshot){const s=f.snapshot,base=builtins.find(x=>x.name===s.activeFilter)||builtins[0],mix=(s.filterIntensity??70)/100,a=s.adjustments||{},e=s.effects||{};const get=k=>Number(base.p[k]||0)*mix+Number(a[k]||0);return {exposure:get('exposure'),brightness:get('brightness'),contrast:get('contrast'),saturation:get('saturation'),warmth:get('warmth'),tint:get('tint'),fade:get('fade'),vignette:get('vignette'),bloom:Number(base.p.bloom||0)*mix+Number(e.bloom||0)}}const mix=state.filterIntensity/100,p=f.p||{};return {exposure:Number(p.exposure||0)*mix,brightness:Number(p.brightness||0)*mix,contrast:Number(p.contrast||0)*mix,saturation:Number(p.saturation||0)*mix,warmth:Number(p.warmth||0)*mix,tint:Number(p.tint||0)*mix,fade:Number(p.fade||0)*mix,vignette:Number(p.vignette||0)*mix,bloom:Number(p.bloom||0)*mix}}
  function currentLiveParams(){const f=findPreset(state.activeFilter),p=filterParams();return {exposure:p.exposure,brightness:p.brightness,contrast:p.contrast,saturation:p.saturation,warmth:p.warmth,tint:p.tint,fade:p.fade,vignette:p.vignette,bloom:p.bloom}}
  function updateLiveFrame(){const el=$('#liveFrameOverlay');if(!el)return;const map={'Polaroid':'frame-polaroid','Instant Square':'frame-instant-square','Instant Wide':'frame-instant-wide','Instant Mini':'frame-instant-mini','Instant Black':'frame-instant-black','Classic':'frame-classic','35mm':'frame-35mm','Film Strip':'frame-film-strip'};el.className='live-frame-overlay';const cls=map[state.frame];if(!cls){el.classList.add('hidden');return}el.classList.add(cls);el.classList.remove('hidden')}
  let liveFilterFrame=0;
  function scheduleLiveFilter(){if(liveFilterFrame)return;liveFilterFrame=requestAnimationFrame(()=>{liveFilterFrame=0;applyLiveFilter()})}
  function applyLiveFilter(){const video=$('#cameraVideo');if(!video)return;const p=currentLiveParams();video.style.filter=cameraCssFromParams(p);const tone=$('#liveToneOverlay'),fade=$('#liveFadeOverlay'),vig=$('#liveVignetteOverlay');if(tone){const warm=Number(p.warmth||0),tint=Number(p.tint||0);let c='255,151,94',op=Math.min(.28,Math.abs(warm)/115);if(warm<0)c='76,145,205';if(Math.abs(tint)>Math.abs(warm)){c=tint>0?'230,112,155':'92,162,118';op=Math.min(.22,Math.abs(tint)/135)}tone.style.background=`rgb(${c})`;tone.style.opacity=String(op)}if(fade)fade.style.opacity=String(Math.min(.22,Math.max(0,p.fade||0)/150));if(vig)vig.style.opacity=String(Math.min(.58,Math.max(0,p.vignette||0)/60))}
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
    if(!state.cameraReady){await startCamera();if(!state.cameraReady)return}
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
      await storeRollPhoto(blob,{kind:'video',mediaType:'video',name,filter:state.activeFilter,favorite:false,rollId:state.activeNamedRollId,videoPreviewLook:state.activeFilter});
      const file=new File([blob],`${name}.${ext}`,{type});
      if(state.settings.autoPhotos)offerSaveToPhotos(file,'Kira video');
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

  function showCameraMessage(title,text,button=true){const box=$('#cameraEmpty');if(!box)return;$('#cameraEmptyTitle').textContent=title;$('#cameraEmptyText').textContent=text;$('#startCameraBtn').hidden=!button;box.classList.remove('hidden')}
  async function startCamera(){const stage=$('#cameraStage'),video=$('#cameraVideo');if(!stage||!video)return;if(state.cameraStream&&state.cameraStream.getVideoTracks().some(t=>t.readyState==='live')){state.cameraReady=true;$('#cameraEmpty').classList.add('hidden');applyLiveFilter();updateCameraHUD();updateLiveFrame();return}if(!navigator.mediaDevices?.getUserMedia){stage.classList.add('camera-denied');showCameraMessage('camera needs your browser','Live camera is not supported here. Tap below to use your phone camera instead.',true);return}stage.classList.add('camera-loading');stage.classList.remove('camera-denied');showCameraMessage('opening camera…','Allow camera access so you can preview Kira filters live.',false);try{const constraints={audio:false,video:{facingMode:{ideal:state.cameraFacing},width:{ideal:1080,max:1920},height:{ideal:1440,max:1920},frameRate:{ideal:30,max:30}}};const stream=await navigator.mediaDevices.getUserMedia(constraints);state.cameraStream=stream;video.srcObject=stream;video.muted=true;video.setAttribute('playsinline','');await video.play();state.cameraReady=true;stage.classList.toggle('front-camera',state.cameraFacing==='user');stage.classList.remove('camera-loading','camera-denied');$('#cameraEmpty').classList.add('hidden');applyLiveFilter();updateCameraHUD();updateLiveFrame();renderCameraFilters()}catch(err){console.warn('Kira camera:',err);state.cameraReady=false;stage.classList.remove('camera-loading');stage.classList.add('camera-denied');showCameraMessage('camera access needed','Tap Start Camera and allow access. If access stays blocked, Kira can fall back to the phone camera.',true)}}
  function stopCamera(){if(state.recording)stopVideoRecording();if(state.cameraThumbTimer){clearInterval(state.cameraThumbTimer);state.cameraThumbTimer=null}if(state.cameraStream){state.cameraStream.getTracks().forEach(t=>t.stop());state.cameraStream=null}state.cameraReady=false;const video=$('#cameraVideo');if(video)video.srcObject=null}
  async function flipCamera(){state.cameraFacing=state.cameraFacing==='environment'?'user':'environment';stopCamera();await startCamera();haptic(18)}
  function updateCameraHUD(){const active=state.selectedRecipeId?state.recipes.find(r=>r.id===state.selectedRecipeId)?.name:state.activeFilter;$('#liveFilterName')&&($('#liveFilterName').textContent=active||'Kira');$('#liveIntensityValue')&&($('#liveIntensityValue').textContent=state.filterIntensity);const live=$('#liveFilterIntensity');if(live&&Number(live.value)!==state.filterIntensity)live.value=state.filterIntensity;const fav=$('#cameraFavoriteBtn');if(fav){const on=state.selectedRecipeId?!!state.recipes.find(r=>r.id===state.selectedRecipeId)?.pinned:state.favoriteFilters.has(state.activeFilter);fav.textContent=on?'♥':'♡';fav.classList.toggle('active',on)}const count=state.rolls.filter(x=>(x.rollId||defaultRollId())===state.activeNamedRollId).length;$('#cameraRollCount')&&($('#cameraRollCount').textContent=`${Math.min(count,999)} / 36`);$('#cameraRollBadge')&&($('#cameraRollBadge').textContent=rollName(state.activeNamedRollId));const summary=$('#activeLookSummary');if(summary)summary.textContent=active||'Kira';const si=$('#activeLookIntensity');if(si)si.textContent=`${state.filterIntensity}%`;updateLiveDateStamp()}
  function toggleActiveCameraFavorite(){if(state.selectedRecipeId)toggleRecipePin(state.selectedRecipeId);else toggleFavorite(state.activeFilter);updateCameraHUD()}
  function applyCameraRatio(){const stage=$('#cameraStage');if(!stage)return;stage.classList.remove('ratio-3-4','ratio-1-1','ratio-9-16');stage.classList.add(state.cameraRatio==='1:1'?'ratio-1-1':state.cameraRatio==='9:16'?'ratio-9-16':'ratio-3-4');$('#ratioBtn')&&($('#ratioBtn').textContent=state.cameraRatio)}
  function cycleCameraRatio(){const vals=['3:4','1:1','9:16'];state.cameraRatio=vals[(vals.indexOf(state.cameraRatio)+1)%vals.length];localStorage.setItem('kira.cameraRatio',state.cameraRatio);applyCameraRatio();haptic()}
  function cycleCameraTimer(){const vals=[0,3,5,10];state.cameraTimer=vals[(vals.indexOf(state.cameraTimer)+1)%vals.length];localStorage.setItem('kira.cameraTimer',String(state.cameraTimer));$('#timerBtn')&&($('#timerBtn').textContent=state.cameraTimer?`${state.cameraTimer}s`:'Timer Off');haptic()}
  function drawVideoCrop(ctx,video,cw,ch){const vw=video.videoWidth||1,vh=video.videoHeight||1,target=cw/ch,src=vw/vh;let sx=0,sy=0,sw=vw,sh=vh;if(src>target){sw=vh*target;sx=(vw-sw)/2}else{sh=vw/target;sy=(vh-sh)/2}if(state.cameraFacing==='user'){ctx.save();ctx.translate(cw,0);ctx.scale(-1,1);ctx.drawImage(video,sx,sy,sw,sh,0,0,cw,ch);ctx.restore()}else ctx.drawImage(video,sx,sy,sw,sh,0,0,cw,ch)}
  function captureCanvasForRatio(video){const ratio=state.cameraRatio==='1:1'?[1,1]:state.cameraRatio==='9:16'?[9,16]:[3,4],target=ratio[0]/ratio[1],vw=video.videoWidth||1080,vh=video.videoHeight||1440,src=vw/vh;let sw=vw,sh=vh;if(src>target)sw=vh*target;else sh=vw/target;const maxSide=2560,scale=Math.min(1,maxSide/Math.max(sw,sh)),cw=Math.max(1,Math.round(sw*scale)),ch=Math.max(1,Math.round(sh*scale)),c=document.createElement('canvas');c.width=cw;c.height=ch;drawVideoCrop(c.getContext('2d',{alpha:false}),video,cw,ch);return c}
  async function runCameraCountdown(){if(state.timerRunning)return false;if(!state.cameraTimer)return true;state.timerRunning=true;$('#shutterBtn')?.classList.add('timer-running');const box=$('#cameraCountdown');for(let n=state.cameraTimer;n>0;n--){if(box){box.textContent=n;box.classList.remove('hidden')}haptic(12);await new Promise(r=>setTimeout(r,1000))}box?.classList.add('hidden');$('#shutterBtn')?.classList.remove('timer-running');state.timerRunning=false;return true}
  function drawVideoCover(ctx,video,w,h){const vw=video.videoWidth||1,vh=video.videoHeight||1,scale=Math.max(w/vw,h/vh),sw=w/scale,sh=h/scale,sx=(vw-sw)/2,sy=(vh-sh)/2;if(state.cameraFacing==='user'){ctx.save();ctx.translate(w,0);ctx.scale(-1,1);ctx.drawImage(video,sx,sy,sw,sh,0,0,w,h);ctx.restore()}else ctx.drawImage(video,sx,sy,sw,sh,0,0,w,h)}
  function updateLiveThumbs(force=false){const video=$('#cameraVideo');if(!state.cameraReady||!video||video.readyState<2)return;const now=performance.now();if(!force&&now-state.lastThumbPaint<900)return;state.lastThumbPaint=now;const cards=$$('canvas[data-live-filter]').filter(c=>{const r=c.getBoundingClientRect();return r.right>-80&&r.left<(window.innerWidth+80)}).slice(0,8);for(const c of cards){const name=c.dataset.liveFilter,kind=c.dataset.liveKind,rid=c.dataset.liveRecipe;let f;if(kind==='recipe'&&rid){const r=state.recipes.find(x=>x.id===rid);f=r?recipeToPreset(r):null}else f=allPresets().find(x=>x.name===name);if(!f)continue;const p=liveParamsForPreset(f),ctx=c.getContext('2d',{alpha:false});ctx.save();ctx.clearRect(0,0,c.width,c.height);ctx.filter=cameraCssFromParams(p);drawVideoCover(ctx,video,c.width,c.height);ctx.filter='none';if(p.warmth){ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=Math.min(.20,Math.abs(p.warmth)/140);ctx.fillStyle=p.warmth>0?'#ff9b62':'#5794c8';ctx.fillRect(0,0,c.width,c.height)}if(p.fade){ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.14,p.fade/190);ctx.fillStyle='#ead9c9';ctx.fillRect(0,0,c.width,c.height)}ctx.restore()}}
  function requestLiveThumbPaint(force=false){if(state.thumbPaintPending&&!force)return;state.thumbPaintPending=true;const run=()=>{state.thumbPaintPending=false;updateLiveThumbs(force)};if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:260});else setTimeout(run,80)}
  function startLiveThumbLoop(){requestLiveThumbPaint(true)}
  async function captureLivePhoto(){if(state.timerRunning)return;if(!state.cameraReady){if(navigator.mediaDevices?.getUserMedia){startCamera();toast('Start the camera first.')}else $('#cameraInput').click();return}const video=$('#cameraVideo');if(!video.videoWidth||!video.videoHeight){toast('Camera is still getting ready.');return}await runCameraCountdown();if(!state.cameraReady)return;const c=captureCanvasForRatio(video);c.toBlob(blob=>{if(!blob){toast('Could not capture photo.');return}const file=new File([blob],`kira-${Date.now()}.jpg`,{type:'image/jpeg'});if(state.settings.autoPhotos)offerSaveToPhotos(file,'Kira photo');loadFile(file,'camera')},'image/jpeg',.93);haptic(30)}

  function exportDimensions(){const iw=state.image.naturalWidth,ih=state.image.naturalHeight,max=state.exportQuality==='Original'?4096:state.exportQuality==='High'?2560:1440,sc=Math.min(1,max/Math.max(iw,ih));return [Math.max(1,Math.round(iw*sc)),Math.max(1,Math.round(ih*sc))]}
  function currentBlob(type='image/jpeg',quality=.94){return new Promise(resolve=>{const [w,h]=exportDimensions(),c=document.createElement('canvas');c.width=w;c.height=h;drawEdited(c,filterParams(),true);c.toBlob(resolve,type,state.exportQuality==='Social'?.9:quality)})}
  async function saveEdited(){if(!state.image){toast('Take or import a photo first.');return}const blob=await currentBlob();if(!blob){toast('Could not create photo.');return}await storeRollPhoto(blob,{kind:'edited',name:state.imageName,filter:state.activeFilter,favorite:false,snapshot:editSnapshot(),rollId:state.activeNamedRollId});const savedFile=new File([blob],`${state.imageName}-kira.jpg`,{type:'image/jpeg'});if(state.settings.autoSave)downloadBlob(blob,savedFile.name);if(state.settings.autoPhotos)offerSaveToPhotos(savedFile,'Kira photo');toast(isIOS()?'Photo prepared. If iOS does not save it automatically, use Share / Save to Photos.':'Saved to your device and Kira Rolls ♥');haptic(25)}
  function downloadBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2500)}
  async function shareEdited(){if(!state.image){toast('Take or import a photo first.');return}const blob=await currentBlob(),file=new File([blob],`${state.imageName}-kira.jpg`,{type:'image/jpeg'});if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){try{await navigator.share({files:[file],title:'Kira photo'});return}catch(e){if(e.name==='AbortError')return}}downloadBlob(blob,file.name);toast('Photo downloaded.')}
  function isIOS(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}

  function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open('kira-db',1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains('photos'))db.createObjectStore('photos',{keyPath:'id',autoIncrement:true})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
  async function storeRollPhoto(blob,meta={}){const db=await openDB(),item={blob,createdAt:Date.now(),rollId:meta.rollId||state.activeNamedRollId,...meta};await new Promise((res,rej)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').add(item);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close();await refreshRolls()}
  async function refreshRolls(){try{const db=await openDB();state.rolls=await new Promise((res,rej)=>{const r=db.transaction('photos').objectStore('photos').getAll();r.onsuccess=()=>res((r.result||[]).map(x=>({...x,rollId:x.rollId||defaultRollId()})));r.onerror=()=>rej(r.error)});db.close();$('#storedCount').textContent=state.rolls.length;renderNamedRollBar();renderRollSelectors();renderRolls();updateCameraHUD()}catch(e){console.warn(e)}}
  async function updateRollItem(item){const db=await openDB();await new Promise((res,rej)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').put(item);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close();refreshRolls()}
  async function deleteRollItem(id){const db=await openDB();await new Promise((res,rej)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').delete(Number(id));tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close();refreshRolls()}
  async function clearRolls(){const db=await openDB();await new Promise((res,rej)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').clear();tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close();refreshRolls()}
  async function importPhotosToRoll(files){const list=[...files].filter(f=>f.type.startsWith('image/'));if(!list.length)return;const db=await openDB();await new Promise((res,rej)=>{const tx=db.transaction('photos','readwrite'),store=tx.objectStore('photos');list.forEach(file=>store.add({blob:file,createdAt:Date.now(),rollId:state.activeNamedRollId,kind:'original',name:(file.name||'photo').replace(/\.[^.]+$/,''),filter:'Original',favorite:false}));tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close();await refreshRolls();toast(`${list.length} photo${list.length===1?'':'s'} imported to ${rollName(state.activeNamedRollId)}`)}

  function isVideoItem(x){return x?.mediaType==='video'||x?.kind==='video'||x?.blob?.type?.startsWith?.('video/')}
  function currentRollItems(){return state.rolls.slice().reverse().filter(x=>(state.rollViewId==='all'||x.rollId===state.rollViewId)&&(state.activeRollFilter==='all'||(state.activeRollFilter==='favorites'&&x.favorite)||(state.activeRollFilter==='edited'&&x.kind==='edited')||(state.activeRollFilter==='videos'&&isVideoItem(x))))}
  function renderNamedRollBar(){const area=$('#rollCollectionBar');if(!area)return;const allCover=state.rolls.slice().sort((a,b)=>b.createdAt-a.createdAt)[0];const allUrl=allCover?URL.createObjectURL(allCover.blob):'';if(allUrl)setTimeout(()=>URL.revokeObjectURL(allUrl),15000);let html=`<div class="roll-album-card ${state.rollViewId==='all'?'active':''}" ${allUrl?`style="background-image:url('${allUrl}');background-size:cover;background-position:center"`:''}><button class="roll-album-main" data-roll-view="all"><strong>All Photos</strong><small>${state.rolls.length} photos</small></button></div>`;html+=state.namedRolls.map(r=>{const items=state.rolls.filter(x=>x.rollId===r.id).sort((a,b)=>b.createdAt-a.createdAt),cover=items[0],u=cover?URL.createObjectURL(cover.blob):'';if(u)setTimeout(()=>URL.revokeObjectURL(u),15000);return `<div class="roll-album-card ${state.rollViewId===r.id?'active':''}" ${u?`style="background-image:url('${u}');background-size:cover;background-position:center"`:''}><button class="roll-album-main" data-roll-view="${r.id}"><strong>${escapeHtml(r.name)}</strong><small>${items.length} photos</small></button><button class="roll-menu-btn" data-roll-menu="${r.id}">⋯</button></div>`}).join('');area.innerHTML=html;$$('[data-roll-view]',area).forEach(b=>b.onclick=()=>{state.rollViewId=b.dataset.rollView;if(state.rollViewId!=='all')setActiveRoll(state.rollViewId);else{renderNamedRollBar();renderRolls()}});$$('[data-roll-menu]',area).forEach(b=>b.onclick=e=>{e.stopPropagation();openRollModal(b.dataset.rollMenu)})}
  function openRollModal(id=null){state.rollModalId=id;const r=state.namedRolls.find(x=>x.id===id);$('#rollModalTitle').textContent=r?'Edit Film Roll':'New Film Roll';$('#rollNameInput').value=r?.name||'';$('#deleteRollBtn').classList.toggle('hidden',!r||state.namedRolls.length<=1);$('#rollModal').classList.remove('hidden');setTimeout(()=>$('#rollNameInput').focus(),120)}
  function closeModal(id){const el=$('#'+id);if(el)el.classList.add('hidden');if(id==='photoModal'){for(const media of [$('#photoModalImage'),$('#photoModalVideo')]){const u=media?.dataset.objectUrl;if(u){URL.revokeObjectURL(u);delete media.dataset.objectUrl}if(media?.tagName==='VIDEO'){media.pause();media.removeAttribute('src');media.load()}}}}
  function saveRollFromModal(){const name=$('#rollNameInput').value.trim();if(!name){toast('Give your film roll a name.');return}if(state.rollModalId){const r=state.namedRolls.find(x=>x.id===state.rollModalId);if(r)r.name=name}else{const r={id:'roll-'+uid(),name,createdAt:Date.now()};state.namedRolls.push(r);state.activeNamedRollId=r.id;state.rollViewId=r.id}saveNamedRolls();closeModal('rollModal');renderNamedRollBar();renderRollSelectors();renderRolls();toast('Film roll saved 🎞️')}
  async function deleteRollFromModal(){const id=state.rollModalId;if(!id||state.namedRolls.length<=1)return;const r=state.namedRolls.find(x=>x.id===id);if(!confirm(`Delete roll "${r?.name||'this roll'}"? Photos will move to ${rollName(defaultRollId())}.`))return;const fallback=state.namedRolls.find(x=>x.id!==id)?.id||defaultRollId();for(const item of state.rolls.filter(x=>x.rollId===id)){item.rollId=fallback;await updateRollItemDirect(item)}state.namedRolls=state.namedRolls.filter(x=>x.id!==id);if(state.activeNamedRollId===id)state.activeNamedRollId=fallback;if(state.rollViewId===id)state.rollViewId=fallback;saveNamedRolls();closeModal('rollModal');await refreshRolls();toast('Roll deleted; photos kept.')}
  async function updateRollItemDirect(item){const db=await openDB();await new Promise((res,rej)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').put(item);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close()}

  function renderRolls(){if(!$('#rollGrid'))return;const items=currentRollItems();$('#emptyRolls').classList.toggle('hidden',items.length>0);$('#rollGrid').classList.toggle('hidden',items.length===0);$('#contactModeBar').classList.toggle('hidden',!state.contactMode);$('#contactSelectedCount').textContent=state.selectedPhotoIds.size;$('#rollGrid').innerHTML=items.map(x=>{const u=URL.createObjectURL(x.blob);setTimeout(()=>URL.revokeObjectURL(u),60000);const video=isVideoItem(x),sel=state.selectedPhotoIds.has(String(x.id)),selectable=state.contactMode&&!video;const media=video?`<video src="${u}" muted playsinline preload="metadata"></video>`:`<img src="${u}" alt="Kira photo">`;return `<article class="roll-photo ${selectable?'selectable':''} ${sel?'selected':''}" data-photo-id="${x.id}">${media}${video?'<span class="video-roll-badge">▶ VIDEO</span>':''}${state.contactMode?(video?'<span class="selection-check">—</span>':`<span class="selection-check">${sel?'✓':'+'}</span>`):`<button class="photo-menu-btn" data-photo-menu="${x.id}">⋯</button>`}<span class="roll-badge">${escapeHtml(video?'Video':x.kind==='edited'?(x.filter||'Edited'):'Original')}</span></article>`}).join('');$$('[data-photo-id]').forEach(card=>card.onclick=e=>{if(e.target.closest('button'))return;const id=card.dataset.photoId,item=state.rolls.find(x=>String(x.id)===String(id));if(state.contactMode){if(isVideoItem(item)){toast('Contact sheets use photos only.');return}toggleContactSelection(id);return}openPhotoModal(id)});$$('[data-photo-menu]').forEach(b=>b.onclick=()=>openPhotoModal(b.dataset.photoMenu))}
  function toggleContactSelection(id){state.selectedPhotoIds.has(String(id))?state.selectedPhotoIds.delete(String(id)):state.selectedPhotoIds.add(String(id));renderRolls()}
  function setContactMode(on){state.contactMode=on;if(!on)state.selectedPhotoIds.clear();renderRolls()}
  function selectAllCurrent(){const items=currentRollItems().filter(x=>!isVideoItem(x));const limit=16;items.slice(0,limit).forEach(x=>state.selectedPhotoIds.add(String(x.id)));renderRolls();if(items.length>limit)toast('Selected the first 16 photos.')}

  function openPhotoModal(id){const item=state.rolls.find(x=>String(x.id)===String(id));if(!item)return;state.photoModalId=String(id);const im=$('#photoModalImage'),vid=$('#photoModalVideo'),video=isVideoItem(item);for(const media of [im,vid]){if(media?.dataset.objectUrl){URL.revokeObjectURL(media.dataset.objectUrl);delete media.dataset.objectUrl}}const u=URL.createObjectURL(item.blob);if(video){im.classList.add('hidden');vid.classList.remove('hidden');vid.src=u;vid.dataset.objectUrl=u}else{vid.pause();vid.classList.add('hidden');im.classList.remove('hidden');im.src=u;im.dataset.objectUrl=u}$('#photoDetailMeta').innerHTML=`<div><b>Roll</b>${escapeHtml(rollName(item.rollId))}</div><div><b>${video?'Preview look':'Look'}</b>${escapeHtml(video?(item.videoPreviewLook||item.filter||'Original'):item.kind==='edited'?(item.filter||'Edited'):'Original')}</div><div><b>Type</b>${video?'Video':item.kind==='edited'?'Edited':'Original'}</div><div><b>Date</b>${new Date(item.createdAt).toLocaleDateString()}</div>`;renderRollSelectors();$('#photoRollSelect').value=item.rollId;$('#photoFavoriteBtn').textContent=item.favorite?'♥ Favorited':'♡ Favorite';$('#photoUseLookBtn').disabled=video||!item.snapshot;$('#photoModal').classList.remove('hidden')}
  function currentModalPhoto(){return state.rolls.find(x=>String(x.id)===String(state.photoModalId))}
  async function moveModalPhoto(){const item=currentModalPhoto();if(!item)return;item.rollId=$('#photoRollSelect').value;await updateRollItem(item);openPhotoModal(item.id);toast('Photo moved.')}
  async function favoriteModalPhoto(){const item=currentModalPhoto();if(!item)return;item.favorite=!item.favorite;await updateRollItem(item);openPhotoModal(item.id)}
  async function deleteModalPhoto(){const item=currentModalPhoto();if(!item)return;if(!confirm('Delete this photo from Kira local storage?'))return;closeModal('photoModal');await deleteRollItem(item.id);toast('Photo deleted from Kira.')}
  function useModalPhotoLook(){const item=currentModalPhoto();if(!item?.snapshot){toast('This photo does not have a saved Kira look.');return}if(!state.image){toast('Load or take a photo first, then apply this look.');closeModal('photoModal');switchScreen('camera');return}commit();applySnapshot(item.snapshot);closeModal('photoModal');switchScreen('develop');toast('Look applied from saved photo.')}

  function blobToImage(blob){return new Promise((resolve,reject)=>{const u=URL.createObjectURL(blob),im=new Image();im.onload=()=>{URL.revokeObjectURL(u);resolve(im)};im.onerror=e=>{URL.revokeObjectURL(u);reject(e)};im.src=u})}
  function drawCover(ctx,img,x,y,w,h){const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height,scale=Math.max(w/iw,h/ih),sw=w/scale,sh=h/scale,sx=(iw-sw)/2,sy=(ih-sh)/2;ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h)}
  function openContactModal(){if(!state.selectedPhotoIds.size){toast('Select photos for your contact sheet first.');return}$('#contactModal').classList.remove('hidden');$('#contactPreviewWrap').classList.add('hidden');if(state.contactBlob){state.contactBlob=null}}
  async function generateContactSheet(){const chosen=state.rolls.filter(x=>state.selectedPhotoIds.has(String(x.id))&&!isVideoItem(x)).sort((a,b)=>a.createdAt-b.createdAt);if(!chosen.length)return;const [cols,rows]=$('#contactLayout').value.split('x').map(Number),max=cols*rows,items=chosen.slice(0,max),W=1600,margin=70,gap=24,header=190,footer=90,cellW=(W-margin*2-gap*(cols-1))/cols,cellH=cellW*1.18,H=Math.round(header+rows*cellH+(rows-1)*gap+footer+margin),c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d'),tone=$('#contactTone').value,label=$('#contactLabel').value.trim()||'KIRA FILM 400',dark=tone==='#1C1919';ctx.fillStyle=tone;ctx.fillRect(0,0,W,H);ctx.fillStyle=dark?'#f8eee5':'#5d4144';ctx.font='bold 54px Georgia';ctx.fillText(label.toUpperCase(),margin,88);ctx.font='26px ui-monospace, monospace';ctx.globalAlpha=.8;ctx.fillText(`${rollName(state.rollViewId==='all'?state.activeNamedRollId:state.rollViewId)}  •  ${items.length} FRAMES  •  ${new Date().toLocaleDateString()}`,margin,136);ctx.globalAlpha=1;for(let i=0;i<items.length;i++){const r=Math.floor(i/cols),col=i%cols,x=margin+col*(cellW+gap),y=header+r*(cellH+gap);try{const im=await blobToImage(items[i].blob);ctx.fillStyle=dark?'#0f0d0d':'#251f20';ctx.fillRect(x-5,y-5,cellW+10,cellH+10);drawCover(ctx,im,x,y,cellW,cellH);ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(x,y+cellH-38,cellW,38);ctx.fillStyle='#fff5e9';ctx.font='20px ui-monospace,monospace';ctx.fillText(String(i+1).padStart(2,'0'),x+12,y+cellH-12)}catch(e){}}ctx.fillStyle=dark?'#e6c0bd':'#9d666f';ctx.font='24px ui-monospace,monospace';ctx.fillText('KIRA • MAKE EVERY MOMENT FEEL LIKE FILM.',margin,H-42);state.contactBlob=await new Promise(res=>c.toBlob(res,'image/jpeg',.94));const u=URL.createObjectURL(state.contactBlob),prev=$('#contactPreview');if(prev.dataset.objectUrl)URL.revokeObjectURL(prev.dataset.objectUrl);prev.src=u;prev.dataset.objectUrl=u;$('#contactPreviewWrap').classList.remove('hidden');toast(items.length<chosen.length?`Sheet made with the first ${items.length} photos.`:'Contact sheet ready 🎞️')}
  function saveContactSheet(){if(!state.contactBlob){toast('Generate the contact sheet first.');return}downloadBlob(state.contactBlob,`kira-contact-sheet-${Date.now()}.jpg`)}
  async function shareContactSheet(){if(!state.contactBlob){toast('Generate the contact sheet first.');return}const file=new File([state.contactBlob],`kira-contact-sheet.jpg`,{type:'image/jpeg'});if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){try{await navigator.share({files:[file],title:'Kira contact sheet'});return}catch(e){if(e.name==='AbortError')return}}saveContactSheet()}

  function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  function bindInputs(){
    const cameraControls=$('#cameraControlsBtn'),cameraPanel=$('#cameraAdvancedPanel');if(cameraControls&&cameraPanel)cameraControls.onclick=()=>{const open=cameraPanel.classList.toggle('hidden')===false;cameraControls.setAttribute('aria-expanded',String(open));cameraControls.textContent=open?'Controls⌃':'Controls⌄';haptic()};
    
    const rollActions=$('#rollActionsBtn'),rollPanel=$('#rollUtilityPanel');if(rollActions&&rollPanel)rollActions.onclick=()=>{const open=rollPanel.classList.toggle('hidden')===false;rollActions.setAttribute('aria-expanded',String(open));rollActions.textContent=open?'Actions⌃':'Actions⌄';haptic()};
    const compareQuick=$('#compareQuickBtn');if(compareQuick){const on=()=>{state.compare=true;renderPhoto();compareQuick.classList.add('active')},off=()=>{state.compare=false;renderPhoto();compareQuick.classList.remove('active')};compareQuick.addEventListener('pointerdown',on);['pointerup','pointercancel','pointerleave'].forEach(x=>compareQuick.addEventListener(x,off))}
    $('#galleryBtn').onclick=()=>$('#galleryInput').click();$('#shutterBtn').onclick=captureOrRecord;$$('[data-capture-mode]').forEach(b=>b.onclick=()=>setCaptureMode(b.dataset.captureMode));$('#flipCameraBtn').onclick=flipCamera;$('#startCameraBtn').onclick=()=>{if(!navigator.mediaDevices?.getUserMedia){$('#cameraInput').click();return}startCamera()};
    $('#galleryInput').onchange=e=>loadFile(e.target.files?.[0],'gallery');$('#cameraInput').onchange=e=>loadFile(e.target.files?.[0],'camera');
    $('#savePhotoBtn').onclick=saveEdited;$('#saveTopBtn').onclick=saveEdited;$('#sharePhotoBtn').onclick=shareEdited;$('#undoBtn').onclick=undo;$('#redoBtn').onclick=redo;
    const fi=$('#filterIntensity');rangeHistory(fi);fi.oninput=e=>{state.filterIntensity=Number(e.target.value);$('#intensityValue').textContent=e.target.value;$('#activeLookIntensity')&&($('#activeLookIntensity').textContent=`${e.target.value}%`);$('#liveFilterIntensity').value=e.target.value;scheduleRender();scheduleLiveFilter()};fi.onchange=()=>{finishRangeHistory();applyLiveFilter()};
    const live=$('#liveFilterIntensity');live.oninput=e=>{state.filterIntensity=Number(e.target.value);$('#filterIntensity').value=e.target.value;$('#intensityValue').textContent=e.target.value;$('#liveIntensityValue').textContent=e.target.value;$('#activeLookIntensity')&&($('#activeLookIntensity').textContent=`${e.target.value}%`);scheduleLiveFilter()};live.onchange=()=>requestLiveThumbPaint(true);
    $('#cameraFavoriteBtn').onclick=toggleActiveCameraFavorite;$('#ratioBtn').onclick=cycleCameraRatio;$('#timerBtn').onclick=cycleCameraTimer;
    $('#gridBtn').onclick=()=>{state.settings.grid=!state.settings.grid;applySettings();saveSettings()};
    $('#cameraRollSelect').onchange=e=>setActiveRoll(e.target.value);$('#developRollSelect').onchange=e=>setActiveRoll(e.target.value);
    $$('.nav-btn').forEach(b=>b.onclick=()=>switchScreen(b.dataset.target));$$('.roll-tabs .chip').forEach(b=>b.onclick=()=>{state.activeRollFilter=b.dataset.rollFilter;$$('.roll-tabs .chip').forEach(x=>x.classList.toggle('active',x===b));renderRolls()});
    $('#newRollBtn').onclick=()=>openRollModal();$('#saveRollBtn').onclick=saveRollFromModal;$('#deleteRollBtn').onclick=deleteRollFromModal;
    $('#importToRollBtn').onclick=()=>$('#rollImportInput').click();$('#rollImportInput').onchange=e=>importPhotosToRoll(e.target.files);
    $('#contactSheetBtn').onclick=()=>setContactMode(!state.contactMode);$('#cancelContactBtn').onclick=()=>setContactMode(false);$('#selectAllContactBtn').onclick=selectAllCurrent;$('#makeContactSheetBtn').onclick=openContactModal;$('#generateContactBtn').onclick=generateContactSheet;$('#saveContactBtn').onclick=saveContactSheet;$('#shareContactBtn').onclick=shareContactSheet;
    $('#savePhotosPromptBtn').onclick=async()=>{const f=state.pendingShareFile;if(!f)return;const ok=await shareFileNow(f,state.pendingShareTitle);if(!ok){downloadBlob(f,f.name||`kira-${Date.now()}`);hideSavePhotosPrompt();toast('Saved as a file. On iPhone, use the file share menu to add it to Photos.')}};$('#savePhotosDismissBtn').onclick=hideSavePhotosPrompt;$('#photoRollSelect').onchange=moveModalPhoto;$('#photoFavoriteBtn').onclick=favoriteModalPhoto;$('#photoDeleteBtn').onclick=deleteModalPhoto;$('#photoUseLookBtn').onclick=useModalPhotoLook;
    $$('[data-close-modal]').forEach(b=>b.onclick=()=>closeModal(b.dataset.closeModal));$$('.modal-backdrop').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal(m.id)}));
    $$('#exportQuality button').forEach(b=>b.onclick=()=>{state.exportQuality=b.dataset.quality;$$('#exportQuality button').forEach(x=>x.classList.toggle('active',x===b));$('#exportSummary')&&($('#exportSummary').textContent=`${state.exportQuality} quality`);toast(`${state.exportQuality} export selected`)});$('#filterSearch').oninput=e=>{state.filterSearch=e.target.value;renderFilters()};
  }
  function bindSettings(){const map={settingGrid:'grid',settingHaptics:'haptics',settingRememberFilter:'rememberFilter',settingKeepOriginal:'keepOriginal',settingAutoSave:'autoSave',settingAutoPhotos:'autoPhotos',settingVideoAudio:'videoAudio'};Object.entries(map).forEach(([id,key])=>{const e=$('#'+id);e.checked=!!state.settings[key];e.onchange=()=>{state.settings[key]=e.checked;applySettings();saveSettings()}});const vq=$('#settingVideoQuality');if(vq){vq.value=state.settings.videoQuality||'smooth';vq.onchange=()=>{state.settings.videoQuality=vq.value;saveSettings();toast(vq.value==='smooth'?'Smooth video quality selected.':'High video quality selected.')}}$('#clearKiraBtn').onclick=async()=>{if(confirm('Clear all photos stored inside Kira on this device? This does not delete photos already saved in your phone library.')){await clearRolls();toast('Kira local photos cleared.')}}}
  function applySettings(){document.body.classList.toggle('grid-on',state.settings.grid);$('#settingGrid').checked=state.settings.grid;$('#recipeCount')&&($('#recipeCount').textContent=state.recipes.length);$('#namedRollCount')&&($('#namedRollCount').textContent=state.namedRolls.length);applyCameraRatio();$('#timerBtn')&&($('#timerBtn').textContent=state.cameraTimer?`${state.cameraTimer}s`:'Timer Off');renderRollSelectors()}
  function setupInstall(){window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.deferredInstallPrompt=e;$('#installBtn').hidden=false});$('#installBtn').onclick=async()=>{if(!state.deferredInstallPrompt){toast(isIOS()?'On iPhone: Share → Add to Home Screen':'Use your browser menu → Install app');return}state.deferredInstallPrompt.prompt();await state.deferredInstallPrompt.userChoice;state.deferredInstallPrompt=null;$('#installBtn').hidden=true}}
  function preventZoom(){const stop=e=>e.preventDefault();['gesturestart','gesturechange','gestureend'].forEach(t=>document.addEventListener(t,stop,{passive:false}));document.addEventListener('touchmove',e=>{if(e.touches&&e.touches.length>1)e.preventDefault()},{passive:false});let last=0;document.addEventListener('touchend',e=>{const n=Date.now();if(n-last<=320)e.preventDefault();last=n},{passive:false});document.addEventListener('dblclick',stop,{passive:false});document.addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault()},{passive:false})}
  function init(){saveNamedRolls();setCaptureMode('photo');if(!state.selectedRecipeId)applyPresetExtras(state.activeFilter);renderAllPanels();setupToolTabs();bindInputs();bindSettings();applySettings();setupInstall();preventZoom();refreshRolls();updateHistoryButtons();renderNamedRollBar();document.body.classList.add('camera-mode');updateCameraViewport();const onViewport=()=>requestAnimationFrame(updateCameraViewport);window.addEventListener('resize',onViewport,{passive:true});window.visualViewport?.addEventListener('resize',onViewport,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){if(state.recording)stopVideoRecording();else stopCamera()}else if($('#screen-camera')?.classList.contains('active')){updateCameraViewport();startCamera()}});if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js?v=9.2.0').catch(console.warn);setTimeout(()=>{updateCameraViewport();startCamera()},120)}
  init();
})();