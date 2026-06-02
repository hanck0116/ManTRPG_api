const CACHE_VERSION = 'v2';
const SHELL_CACHE = `mantrpg-shell-${CACHE_VERSION}`;
const SHELL_FILES = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon.svg', '/icons/maskable-icon.svg'];
const PROVIDER_HOSTS = ['api.groq.com', 'generativelanguage.googleapis.com', 'openrouter.ai'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('mantrpg-') && key !== SHELL_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function isProviderApiRequest(request) {
  const url = new URL(request.url);
  return PROVIDER_HOSTS.includes(url.hostname) || url.pathname.includes('/chat/completions') || url.pathname.includes(':generateContent');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return request.method === 'GET' && url.origin === self.location.origin && /\.(?:js|css|svg|png|webmanifest|ico)$/.test(url.pathname);
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    cache.put('/index.html', response.clone());
    return response;
  } catch {
    return (await cache.match('/index.html')) || (await cache.match('/')) || Response.error();
  }
}

async function cacheFirstStatic(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || isProviderApiRequest(event.request)) return;
  if (isNavigationRequest(event.request)) {
    event.respondWith(networkFirstNavigation(event.request));
    return;
  }
  if (isStaticAsset(event.request)) {
    event.respondWith(cacheFirstStatic(event.request));
  }
});
