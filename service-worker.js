const CACHE='kira-build12-2-beauty-controls-20260814';
const SHELL=['./','./index.html','./style.css','./app.js','./manifest.json','./icons/icon-32.png','./icons/icon-96.png','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-192-maskable.png','./icons/icon-512-maskable.png','./assets/fonts1989/100.png','./assets/fonts1989/101.png','./assets/fonts1989/102.png','./assets/fonts1989/103.png','./assets/fonts1989/104.png','./assets/fonts1989/105.png','./assets/fonts1989/106.png','./assets/fonts1989/107.png','./assets/fonts1989/108.png','./assets/fonts1989/109.png','./assets/fonts1989/110.png','./assets/fonts1989/111.png','./assets/fonts1989/112.png','./assets/fonts1989/113.png','./assets/fonts1989/114.png','./assets/fonts1989/115.png','./assets/fonts1989/116.png','./assets/fonts1989/117.png','./assets/fonts1989/118.png','./assets/fonts1989/119.png','./assets/fonts1989/120.png','./assets/fonts1989/121.png','./assets/fonts1989/122.png','./assets/fonts1989/48.png','./assets/fonts1989/49.png','./assets/fonts1989/50.png','./assets/fonts1989/51.png','./assets/fonts1989/52.png','./assets/fonts1989/53.png','./assets/fonts1989/54.png','./assets/fonts1989/55.png','./assets/fonts1989/56.png','./assets/fonts1989/57.png','./assets/fonts1989/65.png','./assets/fonts1989/66.png','./assets/fonts1989/67.png','./assets/fonts1989/68.png','./assets/fonts1989/69.png','./assets/fonts1989/70.png','./assets/fonts1989/71.png','./assets/fonts1989/72.png','./assets/fonts1989/73.png','./assets/fonts1989/74.png','./assets/fonts1989/75.png','./assets/fonts1989/76.png','./assets/fonts1989/77.png','./assets/fonts1989/78.png','./assets/fonts1989/79.png','./assets/fonts1989/80.png','./assets/fonts1989/81.png','./assets/fonts1989/82.png','./assets/fonts1989/83.png','./assets/fonts1989/84.png','./assets/fonts1989/85.png','./assets/fonts1989/86.png','./assets/fonts1989/87.png','./assets/fonts1989/88.png','./assets/fonts1989/89.png','./assets/fonts1989/90.png','./assets/fonts1989/97.png','./assets/fonts1989/98.png','./assets/fonts1989/99.png','./assets/fonts1989/manifest.json']

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));
});

self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    event.respondWith(
      fetch(request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put('./index.html',copy));
          return response;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request,{ignoreSearch:true}).then(cached=>{
      if(cached)return cached;
      return fetch(request).then(response=>{
        if(response&&response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(request,copy));
        }
        return response;
      });
    })
  );
});
