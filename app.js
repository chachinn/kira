(() => {
  'use strict';

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

  const state = {
    image: null,
    imageName: 'kira-photo',
    activeFilter: 'Old Rose',
    activeCategory: 'All',
    filterIntensity: 70,
    adjustments: { exposure:0, brightness:0, contrast:0, saturation:0, warmth:0, fade:0, grain:8, vignette:8 },
    effects: { bloom:0, dust:0, leak:0 },
    frame: 'None',
    frameTone: '#fff8f1',
    caption: '',
    dateEnabled: true,
    dateStyle: 'Classic',
    dateValue: new Date().toISOString().slice(0,10),
    compare: false,
    favoriteFilters: new Set(JSON.parse(localStorage.getItem('kira.favoriteFilters') || '[]')),
    settings: Object.assign({
      grid:false,
      haptics:true,
      rememberFilter:true,
      keepOriginal:true,
      autoSave:true
    }, JSON.parse(localStorage.getItem('kira.settings') || '{}')),
    rolls: [],
    deferredInstallPrompt: null,
    activeRollFilter: 'all'
  };

  const filters = [
    {name:'Kira Original',cat:'Kira',thumb:'linear-gradient(135deg,#9f7473,#dec2b0)',p:{}},
    {name:'Old Rose',cat:'Kira',thumb:'linear-gradient(135deg,#ad6d79,#e8c2b4)',p:{brightness:5,contrast:-8,saturation:-8,warmth:10,fade:10,grain:8}},
    {name:'First Love',cat:'Kira',thumb:'linear-gradient(135deg,#e8c5c7,#f6e5da)',p:{brightness:10,contrast:-12,saturation:-6,warmth:7,fade:14,bloom:10}},
    {name:'Sunday',cat:'Kira',thumb:'linear-gradient(135deg,#c99678,#f0d9bc)',p:{brightness:5,contrast:-4,saturation:4,warmth:14,fade:6}},
    {name:'Diary',cat:'Kira',thumb:'linear-gradient(135deg,#8c6e62,#d5b29e)',p:{contrast:-12,saturation:-12,warmth:7,fade:18,grain:12,dust:8}},
    {name:'Film 100',cat:'Film',thumb:'linear-gradient(135deg,#8f7e70,#cdbca8)',p:{contrast:7,saturation:-3,warmth:5,grain:6}},
    {name:'Disposable',cat:'Film',thumb:'linear-gradient(135deg,#72574b,#c69268)',p:{brightness:2,contrast:16,saturation:8,warmth:15,fade:5,grain:18,vignette:12}},
    {name:'Film 400',cat:'Film',thumb:'linear-gradient(135deg,#5b4f47,#b49a83)',p:{contrast:12,saturation:-4,warmth:7,grain:22,vignette:9}},
    {name:'Faded Film',cat:'Film',thumb:'linear-gradient(135deg,#a8907b,#d8c6b0)',p:{brightness:6,contrast:-18,saturation:-14,warmth:8,fade:26,grain:10}},
    {name:'CCD 2003',cat:'CCD',thumb:'linear-gradient(135deg,#4f667b,#b0bcc9)',p:{contrast:10,saturation:3,warmth:-16,grain:8,bloom:6}},
    {name:'Pink CCD',cat:'CCD',thumb:'linear-gradient(135deg,#81657b,#dfa3b7)',p:{brightness:5,contrast:8,saturation:9,warmth:-5,fade:5,bloom:7}},
    {name:'Cool CCD',cat:'CCD',thumb:'linear-gradient(135deg,#42596f,#7fa1b0)',p:{contrast:9,saturation:-4,warmth:-22,grain:10}},
    {name:'Flash CCD',cat:'CCD',thumb:'linear-gradient(135deg,#81797f,#f2e8e8)',p:{brightness:13,contrast:18,saturation:-2,warmth:-12,bloom:15}},
    {name:'Bubblegum',cat:'Y2K',thumb:'linear-gradient(135deg,#e0739c,#8a73bd)',p:{brightness:7,contrast:12,saturation:22,warmth:-4,fade:4}},
    {name:'Angel',cat:'Y2K',thumb:'linear-gradient(135deg,#d5d5e8,#f2dbe7)',p:{brightness:16,contrast:-10,saturation:-6,warmth:-8,fade:13,bloom:15}},
    {name:'Baby Pink',cat:'Y2K',thumb:'linear-gradient(135deg,#f0b9c7,#f7e2df)',p:{brightness:8,contrast:-7,saturation:4,warmth:7,fade:8}},
    {name:'Peach Milk',cat:'Dream',thumb:'linear-gradient(135deg,#e5ab8e,#f6e2ce)',p:{brightness:12,contrast:-15,saturation:-5,warmth:14,fade:12,bloom:12}},
    {name:'Bloom',cat:'Dream',thumb:'linear-gradient(135deg,#c6b3be,#f4e8dd)',p:{brightness:7,contrast:-9,saturation:-7,warmth:2,fade:10,bloom:20}},
    {name:'Haze',cat:'Dream',thumb:'linear-gradient(135deg,#9e9794,#ded5ca)',p:{brightness:9,contrast:-22,saturation:-15,warmth:3,fade:24,bloom:9}},
    {name:'Lavender',cat:'Dream',thumb:'linear-gradient(135deg,#877a99,#d7cadf)',p:{brightness:6,contrast:-10,saturation:-5,warmth:-12,fade:10,bloom:8}},
    {name:'Tokyo AM',cat:'Japan',thumb:'linear-gradient(135deg,#6c7d83,#c9c1b1)',p:{brightness:3,contrast:8,saturation:-10,warmth:-8,fade:5,grain:8}},
    {name:'Tokyo PM',cat:'Japan',thumb:'linear-gradient(135deg,#55444e,#d08b73)',p:{contrast:17,saturation:4,warmth:12,grain:14,bloom:8,vignette:8}},
    {name:'Kissaten',cat:'Japan',thumb:'linear-gradient(135deg,#5c4336,#aa7655)',p:{brightness:-3,contrast:12,saturation:-5,warmth:20,fade:8,grain:12}},
    {name:'Kamakura',cat:'Japan',thumb:'linear-gradient(135deg,#5d7d7a,#b7c6bd)',p:{brightness:3,contrast:6,saturation:-5,warmth:-10,fade:8,grain:7}},
    {name:'Kyoto',cat:'Japan',thumb:'linear-gradient(135deg,#745f4f,#b78f6f)',p:{contrast:8,saturation:-8,warmth:14,fade:6,grain:10}}
  ];

  if (state.settings.rememberFilter) {
    const savedFilter = localStorage.getItem('kira.lastFilter');
    if (savedFilter && filters.some(f => f.name === savedFilter)) state.activeFilter = savedFilter;
  }

  const adjustmentDefs = [
    ['exposure','Exposure',-30,30,1],
    ['brightness','Brightness',-40,40,1],
    ['contrast','Contrast',-40,40,1],
    ['saturation','Saturation',-50,50,1],
    ['warmth','Warmth',-40,40,1],
    ['fade','Fade',0,40,1],
    ['grain','Grain',0,40,1],
    ['vignette','Vignette',0,40,1]
  ];

  function haptic(ms=10){ if(state.settings.haptics && navigator.vibrate) navigator.vibrate(ms); }
  function toast(msg){ const el=$('#toast'); el.textContent=msg; el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),2300); }

  function saveSettings(){
    localStorage.setItem('kira.settings', JSON.stringify(state.settings));
    localStorage.setItem('kira.favoriteFilters', JSON.stringify([...state.favoriteFilters]));
    if(state.settings.rememberFilter) localStorage.setItem('kira.lastFilter', state.activeFilter);
  }

  function switchScreen(name){
    $$('.screen').forEach(s => s.classList.toggle('active', s.dataset.screen===name));
    $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.target===name));
    window.scrollTo({top:0,behavior:'smooth'});
    if(name==='rolls') renderRolls();
  }

  function renderCategories(){
    const cats=['All','Favorites','Kira','Film','CCD','Y2K','Dream','Japan'];
    $('#filterCategories').innerHTML=cats.map(c=>`<button class="chip ${state.activeCategory===c?'active':''}" data-cat="${c}">${c}</button>`).join('');
    $('#cameraStrip').innerHTML=filters.slice(0,8).map(filterCard).join('');
    $('#filterCategories').onclick=e=>{
      const b=e.target.closest('[data-cat]'); if(!b)return;
      state.activeCategory=b.dataset.cat; renderCategories(); renderFilters(); haptic();
    };
  }

  function filterCard(f){
    const fav=state.favoriteFilters.has(f.name);
    return `<button class="preset-card ${state.activeFilter===f.name?'active':''}" data-filter="${f.name}" title="${f.name}"><div class="preset-thumb" style="background:${f.thumb}"></div><span>${f.name}${fav?' <i class="favorite-star">♥</i>':''}</span></button>`;
  }

  function visibleFilters(){
    if(state.activeCategory==='All') return filters;
    if(state.activeCategory==='Favorites') return filters.filter(f=>state.favoriteFilters.has(f.name));
    return filters.filter(f=>f.cat===state.activeCategory);
  }

  function renderFilters(){
    const list=visibleFilters();
    $('#filterRow').innerHTML=list.length ? list.map(filterCard).join('') : '<div class="notice">No favorite filters yet. Long-press or double-tap a filter to favorite it.</div>';
    $$('.preset-card').forEach(btn=>{
      btn.addEventListener('click',()=>{ selectFilter(btn.dataset.filter); });
      btn.addEventListener('dblclick',(ev)=>{ ev.preventDefault(); toggleFavorite(btn.dataset.filter); });
      let pressTimer;
      btn.addEventListener('pointerdown',()=>{ pressTimer=setTimeout(()=>toggleFavorite(btn.dataset.filter),600); });
      ['pointerup','pointercancel','pointerleave'].forEach(evt=>btn.addEventListener(evt,()=>clearTimeout(pressTimer)));
    });
    $$('#cameraStrip .preset-card').forEach(btn=>btn.onclick=()=>{ selectFilter(btn.dataset.filter); switchScreen('develop'); });
  }

  function selectFilter(name){
    state.activeFilter=name; if(state.settings.rememberFilter) localStorage.setItem('kira.lastFilter',name);
    renderCategories(); renderFilters(); renderPhoto(); haptic();
  }

  function toggleFavorite(name){
    state.favoriteFilters.has(name)?state.favoriteFilters.delete(name):state.favoriteFilters.add(name);
    saveSettings(); renderCategories(); renderFilters(); toast(state.favoriteFilters.has(name)?'Saved to favorites ♥':'Removed from favorites'); haptic(20);
  }

  function renderAdjustmentPanel(){
    $('#tool-adjust').innerHTML=`<div class="slider-list">${adjustmentDefs.map(([key,label,min,max,step])=>`<div class="slider-row"><label for="adj-${key}">${label}</label><input id="adj-${key}" data-adj="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${state.adjustments[key]}"><output id="out-${key}">${state.adjustments[key]}</output></div>`).join('')}<button class="secondary-btn" id="resetAdjustBtn">Reset adjustments</button></div>`;
    $$('[data-adj]').forEach(inp=>inp.oninput=()=>{ state.adjustments[inp.dataset.adj]=Number(inp.value); $('#out-'+inp.dataset.adj).textContent=inp.value; renderPhoto(); });
    $('#resetAdjustBtn').onclick=()=>{ state.adjustments={exposure:0,brightness:0,contrast:0,saturation:0,warmth:0,fade:0,grain:8,vignette:8}; renderAdjustmentPanel(); renderPhoto(); };
  }

  function renderEffectsPanel(){
    const defs=[['bloom','✦','Bloom'],['dust','⠿','Dust'],['leak','◒','Light Leak']];
    $('#tool-effects').innerHTML=`<div class="effect-grid">${defs.map(([k,ic,l])=>`<button class="effect-btn ${state.effects[k]>0?'active':''}" data-effect="${k}"><b>${ic}</b>${l}<small style="display:block;margin-top:5px">${state.effects[k]}%</small></button>`).join('')}</div><div class="control-card"><div class="control-head"><span>Selected effect strength</span><b id="effectValue">0</b></div><input id="effectStrength" type="range" min="0" max="40" value="0"></div>`;
    let selected='bloom';
    const sync=()=>{ $('#effectStrength').value=state.effects[selected]; $('#effectValue').textContent=state.effects[selected]; };
    $$('.effect-btn').forEach(b=>b.onclick=()=>{ selected=b.dataset.effect; sync(); });
    $('#effectStrength').oninput=e=>{ state.effects[selected]=Number(e.target.value); $('#effectValue').textContent=e.target.value; renderEffectsPanel(); renderPhoto(); };
  }

  function renderFramePanel(){
    const frames=[['None','◻'],['Classic','▣'],['Polaroid','▤'],['35mm','▥'],['Film Strip','▦']];
    $('#tool-frame').innerHTML=`<div class="frame-grid">${frames.map(([n,i])=>`<button class="frame-btn ${state.frame===n?'active':''}" data-frame="${n}"><b>${i}</b>${n}</button>`).join('')}</div><div class="control-card"><label class="control-head"><span>Caption</span></label><input class="caption-input" id="captionInput" maxlength="32" placeholder="good days ♡" value="${escapeHtml(state.caption)}"></div>`;
    $$('.frame-btn').forEach(b=>b.onclick=()=>{ state.frame=b.dataset.frame; renderFramePanel(); renderPhoto(); haptic(); });
    $('#captionInput').oninput=e=>{state.caption=e.target.value; renderPhoto();};
  }

  function renderDatePanel(){
    $('#tool-date').innerHTML=`<div class="date-grid control-card"><label class="setting-row"><span>Show date stamp</span><input type="checkbox" id="dateEnabled" ${state.dateEnabled?'checked':''}></label><label>Style<select id="dateStyle"><option ${state.dateStyle==='Classic'?'selected':''}>Classic</option><option ${state.dateStyle==='2000s'?'selected':''}>2000s</option><option ${state.dateStyle==='Japanese'?'selected':''}>Japanese</option><option ${state.dateStyle==='Film Lab'?'selected':''}>Film Lab</option></select></label><label>Date<input type="date" id="dateValue" value="${state.dateValue}"></label></div>`;
    $('#dateEnabled').onchange=e=>{state.dateEnabled=e.target.checked;renderPhoto();};
    $('#dateStyle').onchange=e=>{state.dateStyle=e.target.value;renderPhoto();};
    $('#dateValue').onchange=e=>{state.dateValue=e.target.value;renderPhoto();};
  }

  function renderComparePanel(){
    $('#tool-compare').innerHTML=`<div class="compare-card"><div class="compare-preview">Press and hold the button below to see your original photo.<br><button class="secondary-btn" id="compareHoldBtn">Hold for Original</button></div></div>`;
    const btn=$('#compareHoldBtn');
    const on=()=>{state.compare=true;renderPhoto();}; const off=()=>{state.compare=false;renderPhoto();};
    ['pointerdown','touchstart'].forEach(ev=>btn.addEventListener(ev,on,{passive:true}));
    ['pointerup','pointercancel','pointerleave','touchend'].forEach(ev=>btn.addEventListener(ev,off,{passive:true}));
  }

  function setupToolTabs(){
    $$('.tool-tab').forEach(btn=>btn.onclick=()=>{
      $$('.tool-tab').forEach(b=>b.classList.toggle('active',b===btn));
      $$('.tool-panel').forEach(p=>p.classList.remove('active'));
      $('#tool-'+btn.dataset.tool).classList.add('active'); haptic();
    });
  }

  async function loadFile(file, source='gallery'){
    if(!file || !file.type.startsWith('image/')){ toast('Please choose an image.'); return; }
    try{
      const url=URL.createObjectURL(file);
      const img=new Image();
      img.onload=async()=>{
        URL.revokeObjectURL(url);
        state.image=img;
        state.imageName=(file.name||'kira-photo').replace(/\.[^.]+$/,'');
        $('#emptyEditor').classList.add('hidden');
        $('#cameraEmpty').classList.add('hidden');
        $('#cameraCanvas').classList.remove('hidden');
        fitCanvases(img);
        renderPhoto();
        switchScreen('develop');
        if(state.settings.keepOriginal){
          try { await storeRollPhoto(file, {kind:'original',name:state.imageName,filter:'Original',favorite:false}); } catch(e){}
        }
        toast(source==='camera'?'Photo ready to develop 🎞️':'Photo imported 🎞️'); haptic(20);
      };
      img.onerror=()=>toast('Kira could not open that photo. Try JPG or PNG.');
      img.src=url;
    }catch(err){ console.error(err); toast('Could not load photo.'); }
  }

  function fitCanvases(img){
    const max=1800;
    const scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
    const w=Math.max(1,Math.round(img.naturalWidth*scale));
    const h=Math.max(1,Math.round(img.naturalHeight*scale));
    [$('#editCanvas'),$('#cameraCanvas')].forEach(c=>{c.width=w;c.height=h;});
  }

  function combinedParams(){
    const f=filters.find(x=>x.name===state.activeFilter) || filters[0];
    const mix=state.compare?0:state.filterIntensity/100;
    const get=(k)=>((f.p[k]||0)*mix)+(state.compare?0:(state.adjustments[k]||0));
    return {
      exposure:get('exposure'),brightness:get('brightness'),contrast:get('contrast'),saturation:get('saturation'),warmth:get('warmth'),fade:get('fade'),grain:get('grain'),vignette:get('vignette'),
      bloom:state.compare?0:((f.p.bloom||0)*mix+state.effects.bloom),
      dust:state.compare?0:((f.p.dust||0)*mix+state.effects.dust),
      leak:state.compare?0:state.effects.leak
    };
  }

  function renderPhoto(){
    if(!state.image) return;
    const p=combinedParams();
    drawEdited($('#editCanvas'),p,true);
    drawEdited($('#cameraCanvas'),p,false);
  }

  function drawEdited(canvas,p,decorate=true){
    const ctx=canvas.getContext('2d',{alpha:false});
    const w=canvas.width,h=canvas.height;
    ctx.save(); ctx.clearRect(0,0,w,h); ctx.fillStyle='#171414'; ctx.fillRect(0,0,w,h);
    const brightness=100 + p.brightness + p.exposure*1.6;
    const contrast=100+p.contrast;
    const saturation=100+p.saturation;
    ctx.filter=`brightness(${Math.max(10,brightness)}%) contrast(${Math.max(10,contrast)}%) saturate(${Math.max(0,saturation)}%)`;
    ctx.drawImage(state.image,0,0,w,h); ctx.filter='none';

    if(p.warmth!==0){ ctx.globalCompositeOperation='soft-light'; ctx.globalAlpha=Math.min(.32,Math.abs(p.warmth)/110); ctx.fillStyle=p.warmth>0?'#ff9b5e':'#559bcb'; ctx.fillRect(0,0,w,h); ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1; }
    if(p.fade>0){ ctx.globalAlpha=Math.min(.35,p.fade/100); ctx.fillStyle='#e8d8c9'; ctx.fillRect(0,0,w,h); ctx.globalAlpha=1; }
    if(p.bloom>0){ ctx.globalCompositeOperation='screen'; ctx.globalAlpha=Math.min(.25,p.bloom/100); ctx.filter=`blur(${Math.max(2,w/350)}px) brightness(115%)`; ctx.drawImage(canvas,0,0); ctx.filter='none'; ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1; }
    if(p.leak>0){ const g=ctx.createRadialGradient(w*.04,h*.48,0,w*.04,h*.48,w*.65); g.addColorStop(0,`rgba(255,94,77,${Math.min(.38,p.leak/100)})`); g.addColorStop(1,'rgba(255,94,77,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); }
    if(p.grain>0) applyGrain(ctx,w,h,p.grain);
    if(p.dust>0) applyDust(ctx,w,h,p.dust);
    if(p.vignette>0){ const g=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.2,w/2,h/2,Math.max(w,h)*.72); g.addColorStop(.45,'rgba(0,0,0,0)'); g.addColorStop(1,`rgba(20,8,8,${Math.min(.52,p.vignette/80)})`); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); }
    if(decorate && !state.compare){ if(state.frame!=='None') drawFrame(ctx,w,h); if(state.dateEnabled) drawDate(ctx,w,h); }
    ctx.restore();
  }

  function applyGrain(ctx,w,h,strength){
    const density=Math.min(12000,Math.round(w*h/250));
    ctx.save(); ctx.globalAlpha=Math.min(.19,strength/160);
    for(let i=0;i<density;i++){
      const v=Math.random()>.5?255:0; ctx.fillStyle=`rgb(${v},${v},${v})`; ctx.fillRect(Math.random()*w,Math.random()*h,1.1,1.1);
    }
    ctx.restore();
  }

  function applyDust(ctx,w,h,strength){
    ctx.save(); ctx.globalAlpha=Math.min(.25,strength/100); ctx.fillStyle='#f8efe5';
    const count=Math.round(strength*1.3);
    for(let i=0;i<count;i++){ const r=Math.random()*2.4+0.5; ctx.beginPath();ctx.arc(Math.random()*w,Math.random()*h,r,0,Math.PI*2);ctx.fill(); }
    ctx.restore();
  }

  function drawFrame(ctx,w,h){
    const m=Math.round(Math.min(w,h)*.055);
    if(state.frame==='Classic' || state.frame==='Polaroid'){
      ctx.save(); ctx.strokeStyle=state.frameTone; ctx.lineWidth=m*2; ctx.strokeRect(m/2,m/2,w-m,h-m);
      if(state.frame==='Polaroid'){
        ctx.fillStyle=state.frameTone; const footer=Math.round(h*.12); ctx.fillRect(0,h-footer,w,footer);
        if(state.caption){ ctx.fillStyle='#6a4d4e';ctx.textAlign='center';ctx.font=`italic ${Math.max(18,Math.round(w*.036))}px Georgia`;ctx.fillText(state.caption,w/2,h-footer*.34); }
      }
      ctx.restore();
    } else if(state.frame==='35mm'){
      ctx.save(); ctx.fillStyle='#151313'; const band=Math.round(h*.07); ctx.fillRect(0,0,w,band);ctx.fillRect(0,h-band,w,band);ctx.fillStyle='#f0c777';ctx.font=`${Math.max(14,Math.round(w*.023))}px monospace`;ctx.fillText('KIRA 400',band*.25,band*.67);ctx.fillText('24 EXP',w-band*1.8,h-band*.3);ctx.restore();
    } else if(state.frame==='Film Strip'){
      ctx.save(); ctx.fillStyle='#111'; const side=Math.round(w*.075);ctx.fillRect(0,0,side,h);ctx.fillRect(w-side,0,side,h);ctx.fillStyle='#e8d9c8';const hole=Math.max(4,Math.round(side*.25));for(let y=hole;y<h;y+=hole*2.2){ctx.fillRect(side*.25,y,hole,hole*.7);ctx.fillRect(w-side*.7,y,hole,hole*.7);}ctx.restore();
    }
  }

  function drawDate(ctx,w,h){
    const d=new Date(state.dateValue+'T12:00:00'); if(Number.isNaN(d.getTime())) return;
    const yy=String(d.getFullYear()).slice(-2), mm=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0');
    let text=`'${yy} ${mm} ${dd}`;
    if(state.dateStyle==='2000s') text=`${mm} ${dd} '${yy}`;
    if(state.dateStyle==='Japanese') text=`${yy}.${mm}.${dd}`;
    if(state.dateStyle==='Film Lab') text=`KIRA 400 • ${yy} ${mm} ${dd}`;
    ctx.save(); ctx.textAlign='right'; ctx.textBaseline='bottom'; ctx.font=`bold ${Math.max(16,Math.round(w*.034))}px ui-monospace, monospace`;ctx.shadowColor='rgba(80,30,10,.35)';ctx.shadowBlur=2;ctx.fillStyle='#ff983e';ctx.fillText(text,w*.95,h*.94);ctx.restore();
  }

  function currentBlob(type='image/jpeg',quality=.94){
    return new Promise(resolve=>$('#editCanvas').toBlob(resolve,type,quality));
  }

  async function saveEdited(){
    if(!state.image){toast('Take or import a photo first.');return;}
    const blob=await currentBlob(); if(!blob){toast('Could not create photo.');return;}
    await storeRollPhoto(blob,{kind:'edited',name:state.imageName,filter:state.activeFilter,favorite:false});
    if(state.settings.autoSave) downloadBlob(blob,`${state.imageName}-kira.jpg`);
    toast(isIOS()?'Kira prepared your photo. Use Share / Save to Photos if it did not enter Photos automatically.':'Saved to your device and Kira Rolls ♥');
    haptic(25);
  }

  function downloadBlob(blob,name){
    const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);
  }

  async function shareEdited(){
    if(!state.image){toast('Take or import a photo first.');return;}
    const blob=await currentBlob(); const file=new File([blob],`${state.imageName}-kira.jpg`,{type:'image/jpeg'});
    if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
      try{await navigator.share({files:[file],title:'Kira photo'});return;}catch(e){if(e.name==='AbortError')return;}
    }
    downloadBlob(blob,file.name); toast('Photo downloaded.');
  }

  function isIOS(){ return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1); }

  // IndexedDB rolls
  function openDB(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open('kira-db',1);
      req.onupgradeneeded=()=>{ const db=req.result; if(!db.objectStoreNames.contains('photos')) db.createObjectStore('photos',{keyPath:'id',autoIncrement:true}); };
      req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
    });
  }

  async function storeRollPhoto(blob,meta){
    const db=await openDB();
    const item={blob,createdAt:Date.now(),...meta};
    await new Promise((resolve,reject)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').add(item);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
    db.close(); await refreshRolls();
  }

  async function refreshRolls(){
    try{
      const db=await openDB();
      state.rolls=await new Promise((resolve,reject)=>{const req=db.transaction('photos').objectStore('photos').getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);});
      db.close(); $('#storedCount').textContent=state.rolls.length; renderRolls();
    }catch(e){console.warn(e);}
  }

  async function updateRollItem(item){
    const db=await openDB(); await new Promise((resolve,reject)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').put(item);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();refreshRolls();
  }

  async function clearRolls(){
    const db=await openDB(); await new Promise((resolve,reject)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();refreshRolls();
  }

  function renderRolls(){
    if(!$('#rollGrid'))return;
    const items=state.rolls.slice().reverse().filter(x=>state.activeRollFilter==='all' || (state.activeRollFilter==='favorites'&&x.favorite) || (state.activeRollFilter==='edited'&&x.kind==='edited'));
    $('#emptyRolls').classList.toggle('hidden',items.length>0); $('#rollGrid').classList.toggle('hidden',items.length===0);
    $('#rollGrid').innerHTML=items.map((x,i)=>{const url=URL.createObjectURL(x.blob);setTimeout(()=>URL.revokeObjectURL(url),10000);return `<article class="roll-photo"><img src="${url}" alt="Kira photo"><span class="roll-badge">${x.kind==='edited'?escapeHtml(x.filter||'Edited'):'Original'}</span><button class="fav-toggle" data-id="${x.id}">${x.favorite?'♥':'♡'}</button></article>`}).join('');
    $$('.fav-toggle').forEach(b=>b.onclick=()=>{const item=state.rolls.find(x=>String(x.id)===b.dataset.id);if(item){item.favorite=!item.favorite;updateRollItem(item);}});
  }

  function escapeHtml(s=''){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

  function bindInputs(){
    $('#galleryBtn').onclick=()=>$('#galleryInput').click();
    $('#shutterBtn').onclick=()=>$('#cameraInput').click();
    $('#cameraBtn').onclick=()=>$('#cameraInput').click();
    $('#galleryInput').onchange=e=>loadFile(e.target.files?.[0],'gallery');
    $('#cameraInput').onchange=e=>loadFile(e.target.files?.[0],'camera');
    $('#savePhotoBtn').onclick=saveEdited; $('#saveTopBtn').onclick=saveEdited; $('#sharePhotoBtn').onclick=shareEdited;
    $('#filterIntensity').oninput=e=>{state.filterIntensity=Number(e.target.value);$('#intensityValue').textContent=e.target.value;renderPhoto();};
    $('#gridBtn').onclick=()=>{state.settings.grid=!state.settings.grid;applySettings();saveSettings();};
    $$('.nav-btn').forEach(b=>b.onclick=()=>switchScreen(b.dataset.target));
    $$('.roll-tabs .chip').forEach(b=>b.onclick=()=>{state.activeRollFilter=b.dataset.rollFilter;$$('.roll-tabs .chip').forEach(x=>x.classList.toggle('active',x===b));renderRolls();});
    $('#newRollBtn').onclick=()=>toast('Named rolls arrive in Build 4 — edited photos already save locally here.');
  }

  function bindSettings(){
    const map={settingGrid:'grid',settingHaptics:'haptics',settingRememberFilter:'rememberFilter',settingKeepOriginal:'keepOriginal',settingAutoSave:'autoSave'};
    Object.entries(map).forEach(([id,key])=>{const el=$('#'+id);el.checked=!!state.settings[key];el.onchange=()=>{state.settings[key]=el.checked;applySettings();saveSettings();};});
    $('#clearKiraBtn').onclick=async()=>{if(confirm('Clear all photos stored inside Kira on this device? This does not delete photos already saved in your phone library.')){await clearRolls();toast('Kira local photos cleared.');}};
  }

  function applySettings(){ document.body.classList.toggle('grid-on',state.settings.grid); $('#settingGrid').checked=state.settings.grid; }

  function setupInstall(){
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.deferredInstallPrompt=e;$('#installBtn').hidden=false;});
    $('#installBtn').onclick=async()=>{if(!state.deferredInstallPrompt)return;state.deferredInstallPrompt.prompt();await state.deferredInstallPrompt.userChoice;state.deferredInstallPrompt=null;$('#installBtn').hidden=true;};
  }

  function preventZoom(){
    const stopGesture = e => e.preventDefault();

    // iOS Safari / installed PWA pinch gestures.
    ['gesturestart','gesturechange','gestureend'].forEach(type => {
      document.addEventListener(type, stopGesture, {passive:false});
    });

    // Block two-finger pinch while still allowing normal one-finger scrolling.
    document.addEventListener('touchmove', e => {
      if (e.touches && e.touches.length > 1) e.preventDefault();
    }, {passive:false});

    // Block Safari's double-tap-to-zoom gesture.
    let lastTouchEnd = 0;
    document.addEventListener('touchend', e => {
      const now = Date.now();
      if (now - lastTouchEnd <= 320) e.preventDefault();
      lastTouchEnd = now;
    }, {passive:false});

    // Desktop / trackpad safety while testing Kira in a browser.
    document.addEventListener('dblclick', stopGesture, {passive:false});
    document.addEventListener('wheel', e => {
      if (e.ctrlKey) e.preventDefault();
    }, {passive:false});
  }

  function init(){
    renderCategories(); renderFilters(); renderAdjustmentPanel(); renderEffectsPanel(); renderFramePanel(); renderDatePanel(); renderComparePanel(); setupToolTabs(); bindInputs(); bindSettings(); applySettings(); setupInstall(); preventZoom(); refreshRolls();
    if('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(console.warn);
  }

  init();
})();
