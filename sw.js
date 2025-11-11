// --- KONFIGURACJA ---

// Nazwa dla statycznej pamięci podręcznej (pliki główne aplikacji)
const PRECACHE_NAME = 'minetunes-precache-v2';
// Nazwa dla dynamicznej pamięci podręcznej (muzyka, obrazy, dane)
const RUNTIME_CACHE_NAME = 'minetunes-runtime-cache-v2';
// Maksymalna liczba piosenek w pamięci podręcznej
const MAX_MUSIC_CACHE_ITEMS = 50;

// Lista kluczowych plików aplikacji (tzw. "App Shell") do zapisania przy instalacji
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/pokaz.png',
  '/album.png',
  '/banner.png',
  '/disc.png'
  // Pliki .json i reszta będą cachowane dynamicznie
];


// --- INSTALACJA SERVICE WORKERA ---

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});


// --- AKTYWACJA I CZYSZCZENIE STARYCH CACHE ---

self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE_NAME, RUNTIME_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});


// --- PRZECHWYTYWANIE ZAPYTAN (FETCH) ---

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ignoruj zapytania inne niż GET oraz zapytania do zewnętrznych zasobów (np. Google Fonts)
  if (event.request.method !== 'GET' || !url.origin.startsWith(self.location.origin)) {
    return;
  }
  
  // Strategia 1: Network First dla plików .json (zawsze próbuj pobrać najnowsze dane)
  if (url.pathname.endsWith('.json')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Strategia 2: Cache First dla muzyki i obrazów
  if (url.pathname.startsWith('/music/') || url.pathname.startsWith('/album-images/') || url.pathname.startsWith('/images/')) {
    event.respondWith(cacheFirstWithCleanup(event.request));
    return;
  }
  
  // Domyślna strategia: Cache First dla wszystkich pozostałych zapytań
  event.respondWith(caches.match(event.request));
});


// --- STRATEGIE CACHOWANIA ---

// Strategia: Najpierw sieć, potem cache
function networkFirst(request) {
  return fetch(request).then(response => {
    // Jeśli się udało, zapisz w cache i zwróć odpowiedź
    return caches.open(RUNTIME_CACHE_NAME).then(cache => {
      cache.put(request, response.clone());
      return response;
    });
  }).catch(() => {
    // Jeśli sieć zawiodła, poszukaj w cache
    return caches.match(request);
  });
}

// Strategia: Najpierw cache, potem sieć (z czyszczeniem dla muzyki)
function cacheFirstWithCleanup(request) {
  return caches.match(request).then(cachedResponse => {
    if (cachedResponse) {
      return cachedResponse;
    }
    return caches.open(RUNTIME_CACHE_NAME).then(cache => {
      return fetch(request).then(response => {
        cache.put(request, response.clone());
        // Uruchom czyszczenie tylko jeśli to plik z folderu /music/
        if (request.url.includes('/music/')) {
            trimCache(RUNTIME_CACHE_NAME, MAX_MUSIC_CACHE_ITEMS);
        }
        return response;
      });
    });
  });
}


// --- FUNKCJA DO CZYSZCZENIA PAMIĘCI PODRĘCZNEJ ---

function trimCache(cacheName, maxItems) {
  caches.open(cacheName).then(cache => {
    cache.keys().then(keys => {
      // Filtrujemy, aby usuwać tylko pliki muzyczne, a nie np. obrazy
      const musicKeys = keys.filter(key => key.url.includes('/music/'));
      if (musicKeys.length > maxItems) {
        // Usuń najstarszy plik muzyczny
        cache.delete(musicKeys[0]).then(() => trimCache(cacheName, maxItems));
      }
    });
  });
}
