var CACHE_NAME = 'leonardofaoro-v3';
var STATIC_ASSETS = [
  '/',
  '/index.html',
  '/404.html',
  '/manifest.json',
  '/robots.txt',
  '/src/style.css',
  '/src/script.js',
  '/assets/favicon.png',
  '/assets/leo_avatar.jpg'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var fetchPromise = fetch(e.request).then(function(networkResponse) {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          var clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return networkResponse;
      }).catch(function() {
        return cached;
      });
      return cached || fetchPromise;
    })
  );
});
