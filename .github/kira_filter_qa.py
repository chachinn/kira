from pathlib import Path
import re

app=Path("app.js").read_text()
index=Path("index.html").read_text()
sw=Path("service-worker.js").read_text()
sw_alias=Path("sw.js").read_text()

assert sw==sw_alias, "service-worker.js and sw.js diverged"
assert "kira-build11-7-filter-engine-20260814" in sw
assert "service-worker.js?v=11.7.0" in app
assert "app.js?v=11.7.0" in index
assert "filterIntensity:100" in app
assert "grain:0,grainType:'Classic'" in app
assert "vignette:0" in app.split("defaultAdjust",1)[1].split(";",1)[0]
for name in ["Violet Hour","Amber Memory","Midnight Blue","Rose Noir","Silver Soft","Deep Mono"]:
    assert name in app, name
assert app.count("const cats=['Kira','Mood','Recent'") == 2
for fn in ["filterParams","filterParamsForSnapshot","applyPresetCast","applyLiveFilter","captureLivePhoto","startVideoRecording","storeRollPhoto","openPhotoModal","syncPhotoCaptionUi","renderInstantCaptionBlob"]:
    assert re.search(rf"function\s+{fn}\s*\(",app), f"missing {fn}"
assert "grainType:userGrain>0" in app
assert "bloomType:userBloom>0" in app
assert "withVisualSnapshot(task.snapshot" in app
assert "drawCameraShotFast(c,source,p)" in app
expected={"0":"48.png","1":"49.png","2":"50.png","3":"51.png","4":"52.png","5":"53.png","6":"54.png","7":"55.png","8":"56.png","9":"57.png"}
manifest=app.split("const kira1989GlyphManifest=",1)[1].split(";",1)[0]
for digit,file in expected.items():
    assert f'"{digit}":{{"file":"{file}"' in manifest, f"1989 digit {digit} mapping changed"
for ch in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz":
    assert f'"{ch}":{{"file":' in manifest, f"1989 glyph missing {ch}"
for element_id in ["cameraVideo","shutterBtn","cameraStrip","filterRow","rollGrid","photoModal","photoCaptionTools","appUpdateBanner"]:
    assert f'id="{element_id}"' in index, f"missing DOM #{element_id}"
assert "An update is available. Refresh to update." in index
assert "no demo photos, fake rolls, or pre-made personal entries" in index
print("Kira 11.7 QA assertions passed")
