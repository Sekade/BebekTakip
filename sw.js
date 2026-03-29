const CACHE_NAME = 'bebektakip-v4';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap'
];

// Yeni SW hemen devreye girsin, eski SW'yi bekletme
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Eski cache'leri temizle, bu SW tüm sekmelerin kontrolünü alsın
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Network First: Önce internetten dene, başarısız olursa cache'den sun
self.addEventListener('fetch', event => {
  // GET olmayan istekleri (POST vs) atla
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Başarılı geldiyse cache'e de kaydet
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        // İnternet yoksa cache'den sun (çevrimdışı destek)
        return caches.match(event.request);
      })
  );
});
