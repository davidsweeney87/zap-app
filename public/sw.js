const CACHE = 'zap-v2'
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
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) return

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

self.addEventListener('push', e => {
  let payload = {}
  try { payload = e.data ? e.data.json() : {} } catch { payload = { title: 'Zap ⚡', body: e.data?.text?.() || '' } }
  const title = payload.title || 'Zap ⚡'
  const options = {
    body: payload.body || '',
    icon: '/spark.svg',
    badge: '/spark.svg',
    tag: payload.tag || 'zap',
    data: { url: payload.url || '/' }
  }
  e.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const target = e.notification.data?.url || '/'
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const client of all) {
      if ('focus' in client) {
        try { await client.navigate(target) } catch {}
        return client.focus()
      }
    }
    if (self.clients.openWindow) return self.clients.openWindow(target)
  })())
})
