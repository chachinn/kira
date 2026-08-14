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


# Kira 12.4 is intentionally a taxonomy/maintenance release. It does not
# rename or delete filters, so saved Favorites, recipes, and media snapshots
# can continue referring to the same filter names.
app = read('app.js')

moves = {
    'Violet Hour': ('Mood', 'Recolor'),
    'Amber Memory': ('Mood', 'Vintage'),
    'Midnight Blue': ('Mood', 'Flash Night'),
    'Rose Noir': ('Mood', 'Flash Night'),
    'Silver Soft': ('Mood', 'Mono'),
    'Deep Mono': ('Mood', 'Mono'),
}
for name, (old_cat, new_cat) in moves.items():
    old = f"['{name}','{old_cat}',"
    new = f"['{name}','{new_cat}',"
    app = replace_exact(app, old, new, f'{name} category')

# Match only built-in filter rows. The old category UI arrays also contain
# the words “Film Stock”, so counting the broad token would incorrectly see 22.
film_stock_token = ",'Film Stock','#"
film_stock_count = app.count(film_stock_token)
if film_stock_count != 20:
    raise SystemExit(f'Film Stock merge: expected 20 filter rows, found {film_stock_count}')
app = app.replace(film_stock_token, ",'Film','#")

old_cats = "const cats=['Kira','Beauty','Mood','Lo-Fi','Recolor','Mono','Flash Night','Recent','Favorites','Camera Packs','Instant','Vintage','Date Cam','Film','Film Stock','CCD','Y2K','Dream','Japan','My Recipes','All'];"
new_cats = "const cats=['Kira','Beauty','Film','Instant','Vintage','CCD','Date Cam','Y2K','Dream','Japan','Lo-Fi','Recolor','Mono','Flash Night','Camera Packs','Recent','Favorites','My Recipes','All'];"
app = replace_exact(app, old_cats, new_cats, 'Camera/Develop category lists', expected=2)
app = replace_exact(app, "navigator.serviceWorker.register('./service-worker.js?v=12.3.0')", "navigator.serviceWorker.register('./service-worker.js?v=12.4.0')", 'service worker registration version')
write('app.js', app)

index = read('index.html')
index = replace_exact(index, '<link rel="stylesheet" href="./style.css?v=12.3.0" />', '<link rel="stylesheet" href="./style.css?v=12.4.0" />', 'style version')
index = replace_exact(index, '<div class="setting-row"><span>Current version</span><b>Build 12.3</b></div>', '<div class="setting-row"><span>Current version</span><b>Build 12.4</b></div>', 'About version')
old_release = '''      <div class="release-badge">BUILD 12.3</div>
      <h4>Face-targeted Beauty — no more whole-camera blur.</h4>
      <div class="info-list">
        <div><b>◎</b><span>Smooth no longer blurs the entire live camera. Kira now renders a separate face/skin Beauty layer and leaves the background, hair, and non-skin areas alone.</span></div>
        <div><b>♡</b><span>Acne / blemish now uses a stronger local healing pass for red, dark, bright, and high-detail spots instead of relying on one generic blur.</span></div>
        <div><b>◌</b><span>Eyes, brows, lips, hair edges, and other high-contrast features receive extra edge protection so stronger Beauty settings do not simply smear the face.</span></div>
        <div><b>⚡</b><span>The live face layer is capped at a small resolution and about seven updates per second; the heavier pass still runs only on saved stills / Develop.</span></div>
      </div>'''
new_release = '''      <div class="release-badge">BUILD 12.4</div>
      <h4>A cleaner filter library — fewer overlapping categories.</h4>
      <div class="info-list">
        <div><b>🎞</b><span>Film Stock has been folded into Film, so all 28 film and stock-style looks now live in one clearer place.</span></div>
        <div><b>✦</b><span>The broad Mood category was retired. Its six looks now sit where their visual treatment fits best: Recolor, Vintage, Flash Night, or Mono.</span></div>
        <div><b>♡</b><span>No filters were deleted or renamed, so Favorites, Film Lab recipes, recent looks, and saved media references stay compatible.</span></div>
        <div><b>✓</b><span>This maintenance pass also rechecked Camera, Beauty, Rolls, Media Details, PWA behavior, icons, zoom prevention, and the custom 1989 Sparkle alphabet.</span></div>
      </div>'''
index = replace_exact(index, old_release, new_release, 'What’s New block')
index = replace_exact(index, '<script src="./app.js?v=12.3.0"></script>', '<script src="./app.js?v=12.4.0"></script>', 'app version')
write('index.html', index)

for path in ('service-worker.js', 'sw.js'):
    sw = read(path)
    sw = replace_exact(sw, "const CACHE='kira-build12-3-face-beauty-20260814';", "const CACHE='kira-build12-4-filter-cleanup-20260815';", f'{path} cache key')
    write(path, sw)

print('Kira 12.4 filter taxonomy patch applied.')
