from pathlib import Path

app_path=Path('app.js')
idx_path=Path('index.html')
sw_path=Path('service-worker.js')
sw2_path=Path('sw.js')

app=app_path.read_text()
idx=idx_path.read_text()
sw=sw_path.read_text()
sw2=sw2_path.read_text()

old="""  function applyFinalMono(ctx,canvas,w,h){
    const tmp=applyFinalMono.buffer||(applyFinalMono.buffer=document.createElement('canvas'));
    if(tmp.width!==w)tmp.width=w;if(tmp.height!==h)tmp.height=h;
    const t=tmp.getContext('2d',{alpha:false});if(!t)return;
    t.clearRect(0,0,w,h);t.filter='grayscale(100%)';t.drawImage(canvas,0,0,w,h);t.filter='none';
    ctx.clearRect(0,0,w,h);ctx.drawImage(tmp,0,0,w,h)
  }
"""
new="""  function applyFinalMono(ctx,canvas,w,h){
    // Deterministic pixel conversion: avoid Safari canvas-filter/self-copy inconsistencies.
    // Rec.709 luminance keeps the ten Mono looks genuinely B&W on saved stills and Develop.
    let im;
    try{im=ctx.getImageData(0,0,w,h)}catch(e){console.warn('Kira Mono pixel pass:',e);return}
    const d=im.data;
    for(let i=0;i<d.length;i+=4){
      const y=Math.round(.2126*d[i]+.7152*d[i+1]+.0722*d[i+2]);
      d[i]=y;d[i+1]=y;d[i+2]=y
    }
    try{ctx.putImageData(im,0,0)}catch(e){console.warn('Kira Mono pixel write:',e)}
  }
"""
if app.count(old)!=1:
    raise SystemExit(f'Expected one old applyFinalMono block, found {app.count(old)}')
app=app.replace(old,new,1)

# Internal asset/cache bump so installed iPhones cannot keep the broken renderer.
if '1.0.6' not in idx or '1.0.6' not in app:
    raise SystemExit('Expected v1.0.6 asset/SW refs not found')
idx=idx.replace('1.0.6','1.0.7')
app=app.replace('1.0.6','1.0.7')
old_cache="kira-v1-0-filter-parity-media-swipe-20260815"
new_cache="kira-v1-0-mono-pixel-save-fix-20260815"
if old_cache not in sw or old_cache not in sw2:
    raise SystemExit('Expected old cache key not found in both service workers')
sw=sw.replace(old_cache,new_cache)
sw2=sw2.replace(old_cache,new_cache)

app_path.write_text(app)
idx_path.write_text(idx)
sw_path.write_text(sw)
sw2_path.write_text(sw2)
