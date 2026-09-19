// CunFashion PWA Service Worker v9.0.0 (Sprint 8.1 User Wardrobe Collection & Conversion Analytics)
const CACHE_NAME = 'cunfashion-cache-v9';
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/site.webmanifest',
  '/images/puzzle-icon-192.png',
  '/images/puzzle-icon-512.png',
  '/images/brand/logo-mini.png',
  '/images/brand/logo-animated.webp',
  '/images/brand/cunfashion-transparent.webp',
  '/cun-style-advisor.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache partially failed:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Chỉ xử lý GET requests và cùng domain
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Bỏ qua Next.js dev server, HMR, và API endpoints
  if (
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin/api/')
  ) {
    return;
  }

  // Static assets (hình ảnh, manifest, scripts, styles): Stale-While-Revalidate
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Navigation / HTML pages: Network-first với Cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline - CunFashion</title></head><body style="font-family:sans-serif;text-align:center;padding:50px 20px;"><h2>Bạn đang ngoại tuyến (Offline)</h2><p>Vui lòng kiểm tra kết nối Internet để tiếp tục trải nghiệm CunFashion.</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
  }
});
