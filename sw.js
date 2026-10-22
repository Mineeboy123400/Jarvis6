/* Jarvis service worker: lets the app open instantly and start offline.
   The app shell and the code libraries from the CDN are cached; the AI models are cached by the libraries themselves. */
const V='jarvis-v1';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','jarvis-transmitter.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||r.headers.has('range'))return;
  const u=new URL(r.url);
  if(u.origin===location.origin||/(^|\.)jsdelivr\.net$/.test(u.hostname)||u.hostname==='esm.run'){
    e.respondWith(caches.open(V).then(async c=>{
      const hit=await c.match(r,{ignoreSearch:u.origin===location.origin});
      const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone()).catch(()=>{});return res}).catch(()=>hit);
      return hit||net;
    }));
  }
});
