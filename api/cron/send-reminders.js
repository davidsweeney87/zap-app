import webpush from 'web-push'
import {
  kv,
  remindersKey,
  remindersIndexKey,
  pushKey,
  reminderFiredKey
} from '../_lib/kv.js'

const TTL_FIRED = 60 * 60 * 25
const MATCH_WINDOW_MINUTES = 5

function hhmmToMinutes(s) {
  const [h, m] = s.split(':').map(Number)
  return h * 60 + m
}

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:nobody@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

function partsInTz(date, tz) {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      hourCycle: 'h23'
    })
    const parts = Object.fromEntries(fmt.formatToParts(date).map(p => [p.type, p.value]))
    return {
      iso: `${parts.year}-${parts.month}-${parts.day}`,
      hhmm: `${parts.hour}:${parts.minute}`,
      weekday: parts.weekday
    }
  } catch {
    return null
  }
}

const WEEKDAYS = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
const WEEKENDS = new Set(['Sat', 'Sun'])

function matchesRepeat(repeat, weekday) {
  if (repeat === 'daily') return true
  if (repeat === 'weekdays') return WEEKDAYS.has(weekday)
  if (repeat === 'weekends') return WEEKENDS.has(weekday)
  return false
}

export default async function handler(req, res) {
  if (!process.env.CRON_SECRET) {
    return res.status(500).json({ error: { message: 'CRON_SECRET not configured.' } })
  }
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: { message: 'Unauthorized' } })
  }
  if (!kv) {
    return res.status(500).json({ error: { message: 'KV not configured.' } })
  }
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return res.status(500).json({ error: { message: 'VAPID keys not configured.' } })
  }

  const cids = (await kv.smembers(remindersIndexKey())) || []
  const now = new Date()
  let sent = 0
  let scanned = 0
  const failures = []

  for (const cid of cids) {
    const record = await kv.get(remindersKey(cid))
    if (!record || !Array.isArray(record.reminders) || record.reminders.length === 0) continue

    const tz = record.timezone || 'UTC'
    const parts = partsInTz(now, tz)
    if (!parts) continue

    const nowMinutes = hhmmToMinutes(parts.hhmm)
    for (const r of record.reminders) {
      scanned++
      if (!r.on) continue
      if (!matchesRepeat(r.repeat, parts.weekday)) continue
      const reminderMinutes = hhmmToMinutes(r.time)
      const delta = nowMinutes - reminderMinutes
      if (delta < 0 || delta > MATCH_WINDOW_MINUTES) continue

      const firedKey = reminderFiredKey(cid, r.id, parts.iso)
      const already = await kv.get(firedKey)
      if (already) continue

      const sub = await kv.get(pushKey(cid))
      if (!sub) continue

      try {
        await webpush.sendNotification(
          sub,
          JSON.stringify({
            title: r.label,
            body: 'Tap to open Zap ⚡',
            tag: `reminder-${r.id}`
          })
        )
        await kv.set(firedKey, 1, { ex: TTL_FIRED })
        sent++
      } catch (e) {
        const status = e?.statusCode
        if (status === 404 || status === 410) {
          await kv.del(pushKey(cid))
        }
        failures.push({ cid, reminderId: r.id, status: status || 'error' })
      }
    }
  }

  return res.status(200).json({ ok: true, users: cids.length, scanned, sent, failures })
}
