const CACHE='trump-oracle-suprema-2';
const ASSETS=['/','/index.html','/styles.css?v=suprema-2','/app.mjs?v=suprema-2','/wish-engine.mjs?v=suprema-2','/wish-library.mjs?v=suprema-2','/props.mjs?v=suprema-2','/new-vignettes.mjs?v=suprema-2','/gallery.mjs?v=suprema-2','/manifest.webmanifest','/assets/temple.webp','/assets/characters.webp','/assets/icon-192.png','/assets/icon-512.png','/assets/icon-180.png','/assets/icon-maskable.png','/assets/body.woff','/assets/body-bold.woff'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('trump-oracle-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
const request=event.request;const url=new URL(request.url);
if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
if(request.mode==='navigate'){if(!['/','/index','/index.html'].includes(url.pathname))return;event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put('/index.html',copy)));}return response;}).catch(()=>caches.match('/index.html')));return;}
event.respondWith(caches.match(request).then(hit=>hit||fetch(request).then(response=>{if(response.ok&&url.pathname.startsWith('/assets/vignettes/')){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));}return response;})));
});
