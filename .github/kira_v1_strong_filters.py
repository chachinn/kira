from pathlib import Path


def read(path):
    return Path(path).read_text(encoding='utf-8')


def write(path, text):
    Path(path).write_text(text, encoding='utf-8')


def replace_exact(text, old, new, label, expected=1):
    found = text.count(old)
    if found != expected:
        raise SystemExit(f'{label}: expected {expected} matches, found {found}')
    return text.replace(old, new)


# Kira v1.0 — stronger filter identity.
# Keep the user-facing strength control at 0–100, but make 100% represent a
# bolder calibrated version of each built-in category. User adjustments remain
# unboosted, and neutral Kira Original / Beauty Only stay neutral.
app = read('app.js')

anchor = "  function findPreset(name){return allPresets().find(x=>x.name===name) || builtins[0]}\n"
helper = anchor + """  const FILTER_IDENTITY_GAIN=Object.freeze({
    Kira:1.55,Beauty:1.35,Film:1.50,Instant:1.40,Vintage:1.50,CCD:1.45,'Date Cam':1.40,
    Y2K:1.50,Dream:1.45,Japan:1.50,'Lo-Fi':1.18,Recolor:1.22,Mono:1.18,'Flash Night':1.22,'Camera Packs':1.35
  });
  function presetIdentityGain(f){if(!f||f.kind!=='builtin'||f.name==='Kira Original'||f.name==='Beauty Only')return 1;return FILTER_IDENTITY_GAIN[f.cat]||1.35}
"""
app = replace_exact(app, anchor, helper, 'filter identity helper')

app = replace_exact(
    app,
    "    const f=findPreset(state.activeFilter),mix=state.compare?0:state.filterIntensity/100;",
    "    const f=findPreset(state.activeFilter),mix=state.compare?0:(state.filterIntensity/100)*presetIdentityGain(f);",
    'Develop/current filter mix'
)

app = replace_exact(
    app,
    "  function liveParamsForPreset(f){if(f.kind==='recipe'&&f.snapshot){return filterParamsForSnapshot(f.snapshot)}const mix=state.filterIntensity/100,p=f.p||{};",
    "  function liveParamsForPreset(f){if(f.kind==='recipe'&&f.snapshot){return filterParamsForSnapshot(f.snapshot)}const mix=(state.filterIntensity/100)*presetIdentityGain(f),p=f.p||{};",
    'live preset mix'
)

app = replace_exact(
    app,
    "    s=s||{};const f=findPreset(s.activeFilter||state.activeFilter),mix=clamp(Number(s.filterIntensity??100)/100,0,1),a=s.adjustments||{},e=s.effects||{},preset=f.kind==='builtin'?(f.p||{}):{};",
    "    s=s||{};const f=findPreset(s.activeFilter||state.activeFilter),mix=clamp(Number(s.filterIntensity??100)/100,0,1)*presetIdentityGain(f),a=s.adjustments||{},e=s.effects||{},preset=f.kind==='builtin'?(f.p||{}):{};",
    'snapshot/capture filter mix'
)

app = replace_exact(
    app,
    "navigator.serviceWorker.register('./service-worker.js?v=12.4.0')",
    "navigator.serviceWorker.register('./service-worker.js?v=1.0.0')",
    'service worker registration version'
)
write('app.js', app)

index = read('index.html')
index = replace_exact(index, '<link rel="manifest" href="./manifest.json?v=11.0.0" />', '<link rel="manifest" href="./manifest.json?v=1.0.0" />', 'manifest version')
index = replace_exact(index, '<link rel="stylesheet" href="./style.css?v=12.4.0" />', '<link rel="stylesheet" href="./style.css?v=1.0.0" />', 'style version')
index = replace_exact(index, '<script src="./app.js?v=12.4.0"></script>', '<script src="./app.js?v=1.0.0"></script>', 'app version')
index = replace_exact(index, '<div class="setting-row"><span>Current version</span><b>Build 12.4</b></div>', '<div class="setting-row"><span>Current version</span><b>v1.0</b></div>', 'About version')

old_release = '''      <div class="release-badge">BUILD 12.4</div>
      <h4>A cleaner filter library — fewer overlapping categories.</h4>
      <div class="info-list">
        <div><b>🎞</b><span>Film Stock has been folded into Film, so all 28 film and stock-style looks now live in one clearer place.</span></div>
        <div><b>✦</b><span>The broad Mood category was retired. Its six looks now sit where their visual treatment fits best: Recolor, Vintage, Flash Night, or Mono.</span></div>
        <div><b>♡</b><span>No filters were deleted or renamed, so Favorites, Film Lab recipes, recent looks, and saved media references stay compatible.</span></div>
        <div><b>✓</b><span>This maintenance pass also rechecked Camera, Beauty, Rolls, Media Details, PWA behavior, icons, zoom prevention, and the custom 1989 Sparkle alphabet.</span></div>
      </div>'''
new_release = '''      <div class="release-badge">v1.0</div>
      <h4>Stronger looks — every filter has more personality.</h4>
      <div class="info-list">
        <div><b>✦</b><span>100% strength is now intentionally bolder. Kira, Film, Vintage, CCD, Y2K, Dream, Japan and the other collections receive category-calibrated identity boosts instead of sharing one timid intensity curve.</span></div>
        <div><b>🎞</b><span>The 0–100 strength slider still works normally: 0 stays neutral, lower values stay softer, and 100 now shows the full intended character of the selected look.</span></div>
        <div><b>♡</b><span>Kira Original and Beauty Only remain neutral by design. Beauty processing itself is not artificially boosted by this color/filter change.</span></div>
        <div><b>✓</b><span>Kira is now labeled v1.0 for its first public release line. Filter names, Favorites, recipes, Rolls, Camera, Beauty, and saved-media references remain compatible.</span></div>
      </div>'''
index = replace_exact(index, old_release, new_release, 'What’s New release block')
write('index.html', index)

for path in ('service-worker.js', 'sw.js'):
    sw = read(path)
    sw = replace_exact(sw, "const CACHE='kira-build12-4-filter-cleanup-20260815';", "const CACHE='kira-v1-0-strong-filter-identity-20260815';", f'{path} cache key')
    write(path, sw)

print('Kira v1.0 strong filter identity patch applied.')
