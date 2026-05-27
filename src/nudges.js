import { getClientId } from './clientId.js'

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export function nudgesSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export function nudgesPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

async function getRegistration() {
  const reg = await navigator.serviceWorker.ready
  return reg
}

export async function enableNudges() {
  if (!nudgesSupported()) throw new Error('Notifications not supported on this device.')
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Notifications were not allowed.')

  const cfg = await fetch('/api/config').then(r => r.json())
  if (!cfg?.vapidPublicKey) throw new Error('Server is missing VAPID public key.')

  const reg = await getRegistration()
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(cfg.vapidPublicKey)
    })
  }

  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-zap-client-id': getClientId() },
    body: JSON.stringify({ subscription: sub.toJSON ? sub.toJSON() : sub })
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error?.message || 'Could not save push subscription.')
  }
  return true
}

export async function syncReminders(reminders) {
  const timezone =
    (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC'
  await fetch('/api/reminders/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-zap-client-id': getClientId() },
    body: JSON.stringify({ reminders, timezone })
  }).catch(() => {})
}
