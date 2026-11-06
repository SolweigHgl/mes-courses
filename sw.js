// Service worker : permet d'ouvrir l'application sans réseau.
// À chaque mise à jour des fichiers, changez le numéro ci-dessous (v4 -> v5 -> v6…).
const CACHE = 'mes-courses-v7';
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'manifest.json', 'favicon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

// À l'installation, on télécharge chaque fichier en ignorant la mémoire du navigateur et de GitHub,
// pour être sûr d'enregistrer la toute dernière version.
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(FILES.map(u => fetch(new Request(u, { cache: 'reload' })).then(r => { if (!r.ok) throw new Error(u); return c.put(u, r); }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Affiche tout de suite la version en mémoire (fonctionne sans réseau),
// puis la vérifie et la met à jour en arrière-plan.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      const net = fetch(e.request, { cache: 'no-cache' }).then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
