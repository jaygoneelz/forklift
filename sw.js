// Forklift — Service Worker v3.8
// Cache-first for static assets, network-first for map tiles

const CACHE_NAME = 'forklift-v3.8';
const STATIC_ASSETS = [
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  // CDN assets — cached on first load for offline play
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800;900&family=Nunito:wght@400;600;700&display=swap',
];

// Install — pre-cache everything we can
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache what we can; silently fail on errors (e.g. offline during install)
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(e => console.warn('SW: Failed to cache', url, e))
        )
      );
    })
  );
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - Map tiles (OSM): network-first, short cache, degrade gracefully
// - APIs (OSRM/Nominatim): network-only (can't cache routing)
// - Everything else: cache-first
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Network-only for routing/geocoding APIs
  if (url.hostname.includes('router.project-osrm.org') ||
      url.hostname.includes('nominatim.openstreetmap.org')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({error: 'Offline — map routing unavailable'}),
          {headers: {'Content-Type': 'application/json'}})
      )
    );
    return;
  }

  // Network-first for map tiles (they change, keep fresh)
  if (url.hostname.includes('openstreetmap.org') ||
      url.hostname.includes('tile.') ||
      url.pathname.includes('/tiles/')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME + '-tiles').then(c => c.put(event.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for everything else (game assets, CDN)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (!res || !res.ok || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        return res;
      }).catch(() => {
        // Offline fallback — return the game HTML for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
