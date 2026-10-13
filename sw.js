```javascript
// Promeni verziju pri svakom objavljivanju nove verzije sajta
const VERSION = 'ett-calculator-v3';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys.map(key =>
            key !== VERSION ? caches.delete(key) : Promise.resolve()
          )
        )
      )
      .then(() => self.clients.claim())
  );
});

// Network-first: prvo server, keš ako nema internet veze
self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Preskoči zahteve ka drugim domenima
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();

          event.waitUntil(
            caches.open(VERSION)
              .then(cache => cache.put(req, copy))
          );
        }

        return response;
      })
      .catch(() =>
        caches.match(req).then(cachedResponse =>
          cachedResponse || (
            req.mode === 'navigate'
              ? caches.match('./index.html')
              : undefined
          )
        )
      )
  );
});
```
