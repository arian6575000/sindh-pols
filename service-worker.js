const V='spr-v6',F=['./','index.html','css/style.css?v=6','js/main.js?v=6','js/music-data.js?v=6','manifest.webmanifest','favicon.svg','assets/icons/icon-192.png','assets/icons/icon-512.png'];
/* bypass HTTP cache on install so a stale file is never stored */
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
/* network-first, ignoring HTTP cache: always fresh when online, cached copy offline */
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{if(res.status===200){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r).then(h=>h||(r.mode==='navigate'?caches.match('index.html'):Response.error()))))});
