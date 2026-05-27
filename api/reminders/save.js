import { kv, remindersKey, remindersIndexKey, sanitizeCid } from '../_lib/kv.js'

const VALID_REPEAT = new Set(['daily', 'weekdays', 'weekends', 'once'])

function sanitizeReminders(list) {
  if (!Array.isArray(list)) return []
  return list
    .filter(
      r =>
        r &&
        typeof r.id === 'string' &&
        typeof r.label === 'string' &&
        typeof r.time === 'string' &&
        /^\d{2}:\d{2}$/.test(r.time) &&
        VALID_REPEAT.has(r.repeat)
    )
    .map(r => ({
      id: r.id.slice(0, 64),
      label: r.label.slice(0, 200),
      time: r.time,
      repeat: r.repeat,
      category: typeof r.category === 'string' ? r.category.slice(0, 32) : 'other',
      on: !!r.on
    }))
    .slice(0, 50)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } })
  }
  if (!kv) {
    return res.status(500).json({ error: { message: 'KV not configured.' } })
  }

  const cid = sanitizeCid(req.headers['x-zap-client-id'])
  if (!cid) {
    return res.status(400).json({ error: { message: 'Missing or invalid x-zap-client-id.' } })
  }

  const reminders = sanitizeReminders(req.body?.reminders)
  const timezone = typeof req.body?.timezone === 'string' ? req.body.timezone.slice(0, 64) : 'UTC'

  await kv.set(remindersKey(cid), { reminders, timezone, updatedAt: Date.now() })
  if (reminders.length > 0) {
    await kv.sadd(remindersIndexKey(), cid)
  } else {
    await kv.srem(remindersIndexKey(), cid)
  }

  return res.status(200).json({ ok: true, count: reminders.length })
}
