const CACHE_NAME = 'minetunes-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/pokaz.png',
  '/album.png',
  '/banner.png',
  '/disc.png',
  '/albums.json',
  '/songs.json'
];

// Instalacja service workera i cache'owanie podstawowych zasobów
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Aktywacja service workera i czyszczenie starych cache'y
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Usuwam stary cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Obsługa żądań – serwowanie z cache i dynamiczne cache’owanie nowych plików
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(networkResponse => {
            // Cache’ujemy tylko pliki z określonych folderów
            if (event.request.url.includes('/music/') ||
                event.request.url.includes('/album-images/') ||
                event.request.url.includes('/images/')) {
              return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
            }

            return networkResponse;
          })
          .catch(() => {
            // Fallback dla obrazków offline
            if (event.request.destination === 'image') {
              return caches.match('/pokaz.png');
            }
          });
      })
  );
});
