// Service worker: เก็บหน้า Launcher ไว้ในเครื่อง ให้เปิดได้เร็วและเปิดได้แม้ออฟไลน์
// เมื่อแก้ไฟล์ index.html แล้ว ให้เปลี่ยนเลขเวอร์ชันนี้ เพื่อให้ผู้ใช้ได้ไฟล์ใหม่
const VERSION = 'launcher-v3';
const SHELL = ['./', 'index.html', 'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png',
  'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // ไม่ยุ่งกับคำขอไปยัง Google (Apps Script) ให้ผ่านตรงเสมอ
  if (url.origin !== location.origin || e.request.method !== 'GET') return;

  // network-first: ได้ไฟล์ล่าสุดเมื่อออนไลน์ ใช้ cache เมื่อออฟไลน์
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('index.html')))
  );
});
