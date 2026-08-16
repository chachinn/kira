from pathlib import Path

src=Path('.github/scripts/kira_v1_high_quality_still.py').read_text()
src=src.replace(
    "app=one(app,\"const max=state.exportQuality==='Original'?4096:state.exportQuality==='High'?2560:1440\",\"const max=state.exportQuality==='Original'?4096:state.exportQuality==='High'?3072:1440\",'High export dimensions')",
    "app=one(app,\"max=state.exportQuality==='Original'?4096:state.exportQuality==='High'?2560:1440\",\"max=state.exportQuality==='Original'?4096:state.exportQuality==='High'?3072:1440\",'High export dimensions')"
)
src=src.replace(
    "old_blob=\"async function currentBlob(type='image/jpeg',quality=.94){return new Promise(resolve=>{const [w,h]=exportDimensions(),c=document.createElement('canvas');c.width=w;c.height=h;drawEdited(c,filterParams(),true);c.toBlob(resolve,type,state.exportQuality==='Social'?.9:quality)})}\"",
    "old_blob=\"function currentBlob(type='image/jpeg',quality=.94){return new Promise(resolve=>{const [w,h]=exportDimensions(),c=document.createElement('canvas');c.width=w;c.height=h;drawEdited(c,filterParams(),true);c.toBlob(resolve,type,state.exportQuality==='Social'?.9:quality)})}\""
)
src=src.replace(
    "new_blob=\"async function currentBlob(type='image/jpeg',quality=.94){return new Promise(resolve=>{const [w,h]=exportDimensions(),c=document.createElement('canvas');c.width=w;c.height=h;drawEdited(c,filterParams(),true);const q=state.exportQuality==='Social'?.9:state.exportQuality==='Original'?.97:Math.max(.96,quality);c.toBlob(resolve,type,q)})}\"",
    "new_blob=\"function currentBlob(type='image/jpeg',quality=.94){return new Promise(resolve=>{const [w,h]=exportDimensions(),c=document.createElement('canvas');c.width=w;c.height=h;drawEdited(c,filterParams(),true);const q=state.exportQuality==='Social'?.9:state.exportQuality==='Original'?.97:Math.max(.96,quality);c.toBlob(resolve,type,q)})}\""
)
exec(compile(src,'.github/scripts/kira_v1_high_quality_still.py','exec'))
