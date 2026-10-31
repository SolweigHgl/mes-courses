// Service worker : permet d'ouvrir l'application sans réseau.
// IMPORTANT : à chaque mise à jour des fichiers, changez le numéro ci-dessous (v1 -> v2 -> v3…)
// pour que les téléphones récupèrent la nouvelle version.
const CACHE = 'mes-courses-v3';
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'manifest.json', 'favicon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Affiche tout de suite la version en mémoire (fonctionne sans réseau),
// puis la met à jour en arrière-plan pour la prochaine ouverture.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      const net = fetch(e.request).then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
