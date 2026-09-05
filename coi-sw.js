/**
 * Throwaway probe service worker: same shape as prometheos-host/public/sw-coi.js
 * and prometheos-shared/src/remote-runtime/sw-apps-coi.js, but stamping
 * require-corp instead of credentialless.
 *
 * The question it exists to answer: does WebKit honour COOP/COEP that come from
 * a service-worker-generated navigation response? Nothing here is meant to be kept.
 */
const COI_HEADERS = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

const NULL_BODY_STATUSES = new Set([101, 204, 205, 304]);

function shouldIsolate (request) {
  if (request.mode === 'navigate') return true;
  try { return new URL (request.url).origin === self.location.origin; } catch { return false; }
}

function withCoi (response) {
  if (!response) return response;
  if (response.type === 'opaque' || response.type === 'opaqueredirect') return response;
  if (response.status < 200 || response.status > 599) return response;
  try {
    const headers = new Headers (response.headers);
    for (const [name, value] of Object.entries (COI_HEADERS)) headers.set (name, value);
    // Same-origin subresources also need CORP so require-corp does not block our own files.
    headers.set ('Cross-Origin-Resource-Policy', 'same-origin');
    return new Response (NULL_BODY_STATUSES.has (response.status) ? null : response.body, {
      status: response.status, statusText: response.statusText, headers,
    });
  } catch { return response; }
}

self.addEventListener ('install', (e) => e.waitUntil (self.skipWaiting ()));
self.addEventListener ('activate', (e) => e.waitUntil (self.clients.claim ()));
self.addEventListener ('fetch', (e) => {
  if (!shouldIsolate (e.request)) return;
  e.respondWith (fetch (e.request).then (withCoi).catch (() => fetch (e.request)));
});
