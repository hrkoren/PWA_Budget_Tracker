const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/styles.css",
    "/index.js",
    "/manifest.webmanifest",
    "/index.js",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];

// install data cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(DATA_CACHE_NAME)
            .then((cache) => cache.add(FILES_TO_CACHE))
    );
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

// start the cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then(keyList => {
                return Promise.all(
                    keyList.map(key => {
                        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                            console.log('Remove old data', key);
                            return caches.delete(key);
                        }
                    })
                );
            })
    );
    self.clients.claim();
});

// fetch the cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});