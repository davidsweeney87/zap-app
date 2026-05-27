import { kv, pushKey, sanitizeCid } from '../_lib/kv.js'

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

  const subscription = req.body?.subscription
  if (!subscription || typeof subscription !== 'object' || typeof subscription.endpoint !== 'string') {
    return res.status(400).json({ error: { message: 'subscription required' } })
  }

  await kv.set(pushKey(cid), subscription)
  return res.status(200).json({ ok: true })
}
