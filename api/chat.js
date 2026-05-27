import { kv, getSubscriberByToken } from './_lib/kv.js'

const FREE_DAILY_LIMIT = 20
const SUB_DAILY_LIMIT = 100
const TTL_SECONDS = 60 * 60 * 25

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length) return xff.split(',')[0].trim()
  return req.headers['x-real-ip'] || 'unknown'
}

function sanitizeCid(raw) {
  if (typeof raw !== 'string') return 'anon'
  const trimmed = raw.trim().slice(0, 64)
  return /^[A-Za-z0-9_-]+$/.test(trimmed) ? trimmed : 'anon'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'ANTHROPIC_API_KEY is not set on the server.' } })
  }

  const token = req.headers['x-zap-sub-token']
  const subscriber = await getSubscriberByToken(typeof token === 'string' ? token : null)
  const isSubscriber = !!subscriber?.active
  const limit = isSubscriber ? SUB_DAILY_LIMIT : FREE_DAILY_LIMIT

  if (kv) {
    const today = new Date().toISOString().slice(0, 10)
    const scope = isSubscriber ? `sub:${subscriber.customerId}` : null
    const ip = scope ? null : getClientIp(req)
    const cid = scope ? null : sanitizeCid(req.headers['x-zap-client-id'])
    const keys = scope
      ? [`chat:${scope}:${today}`]
      : [`chat:ip:${ip}:${today}`, `chat:cid:${cid}:${today}`]

    try {
      const counts = await Promise.all(keys.map(k => kv.incr(k)))
      await Promise.all(
        counts.map((n, i) => (n === 1 ? kv.expire(keys[i], TTL_SECONDS) : null))
      )
      if (counts.some(n => n > limit)) {
        const msg = isSubscriber
          ? `Daily message limit reached (${limit}/day). Resets at UTC midnight.`
          : `Daily message limit reached (${limit}/day). Upgrade for ${SUB_DAILY_LIMIT}/day, or try again tomorrow.`
        return res.status(429).json({ error: { message: msg } })
      }
    } catch (e) {
      console.error('rate-limit error', e)
    }
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    })
    const data = await upstream.json()
    return res.status(upstream.status).json(data)
  } catch (e) {
    return res.status(502).json({ error: { message: e?.message || 'Upstream request failed' } })
  }
}
