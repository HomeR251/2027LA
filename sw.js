// 洛杉磯家庭網站「沒網路也能看」（publish-pages.js 會複製到 GitHub Pages 倉庫）
// 網頁：先上網拿最新，4 秒沒回或沒網路 → 用手機存的那份（存的是加密版）
// 照片、字型、樣式（別的網站來的）：存過就直接用，沒存過才上網抓
const C = 'la2027-v1';
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(['./']))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function save(req, res) { const cp = res.clone(); caches.open(C).then(c => c.put(req, cp)); return res; }
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    const net = fetch(r).then(res => (res.ok ? save(r, res) : res));
    const cached = () => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('./'));
    const late = new Promise(ok => setTimeout(ok, 4000)).then(cached);
    e.respondWith(Promise.race([net.catch(cached), late.then(m => m || net)]));
  } else if (r.destination === 'image' || r.destination === 'font' || r.destination === 'style') {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => save(r, res))));
  }
});
