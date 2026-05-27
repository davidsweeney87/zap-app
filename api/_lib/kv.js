import { Redis } from '@upstash/redis'

export const kv =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
    : null

export function customerKey(customerId) {
  return `customer:${customerId}`
}

export function subTokenKey(token) {
  return `sub:${token}`
}

export async function getSubscriberByToken(token) {
  if (!kv || !token) return null
  const customerId = await kv.get(subTokenKey(token))
  if (!customerId) return null
  const record = await kv.get(customerKey(customerId))
  if (!record) return null
  return { customerId, ...record }
}

export function pushKey(cid) { return `push:${cid}` }
export function remindersKey(cid) { return `reminders:${cid}` }
export function remindersIndexKey() { return 'reminders:index' }
export function reminderFiredKey(cid, reminderId, dateIso) {
  return `fired:${cid}:${reminderId}:${dateIso}`
}

export function sanitizeCid(raw) {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim().slice(0, 64)
  return /^[A-Za-z0-9_-]+$/.test(trimmed) ? trimmed : null
}
