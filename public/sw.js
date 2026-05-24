const CACHE = 'zap-v1'
const ASSETS = ['/', '/index.html', '/manifest.json', '/spark.svg']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET') return
  if (url.hostname.includes('anthropic.com')) return

  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetcher = fetch(e.request).then(res => {
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {})
        }
        return res
      }).catch(() => cached)
      return cached || fetcher
    })
  )
})
