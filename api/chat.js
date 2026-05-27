import { Redis } from '@upstash/redis'

const DAILY_LIMIT = 20
const TTL_SECONDS = 60 * 60 * 25

const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
    : null

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

  if (redis) {
    const ip = getClientIp(req)
    const cid = sanitizeCid(req.headers['x-zap-client-id'])
    const today = new Date().toISOString().slice(0, 10)
    const ipKey = `chat:ip:${ip}:${today}`
    const cidKey = `chat:cid:${cid}:${today}`

    try {
      const [ipCount, cidCount] = await Promise.all([redis.incr(ipKey), redis.incr(cidKey)])
      if (ipCount === 1) await redis.expire(ipKey, TTL_SECONDS)
      if (cidCount === 1) await redis.expire(cidKey, TTL_SECONDS)

      if (ipCount > DAILY_LIMIT || cidCount > DAILY_LIMIT) {
        return res.status(429).json({
          error: { message: `Daily message limit reached (${DAILY_LIMIT}/day). Try again tomorrow.` }
        })
      }
    } catch (e) {
      // Fail open: if the rate limiter is down, allow the request through rather than blocking the user.
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
