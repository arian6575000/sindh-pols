const V='spr-v3',F=['./','index.html','css/style.css','js/main.js','manifest.webmanifest','favicon.svg','assets/audio/music.mp3','assets/icons/icon-192.png','assets/icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
e.respondWith(caches.match(r).then(h=>h||fetch(r).then(res=>{if(res.status===200){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>r.mode==='navigate'?caches.match('index.html'):Response.error())))});
