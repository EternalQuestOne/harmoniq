const CACHE_NAME = 'harmoniq-cache-v24'; 
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './logo.png'
];

// 1. Install the new service worker and cache new files
self.addEventListener('install', event => {
  self.skipWaiting(); // Forces the browser to install this immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching new files for:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Activate the new worker and DELETE old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of the page immediately
  );
});

// 3. Serve cached files when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Return the cached file
        }
        return fetch(event.request).then(
          function(response) {
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
  );
});