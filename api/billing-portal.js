import Stripe from 'stripe'
import { getSubscriberByToken } from './_lib/kv.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } })
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: { message: 'Stripe is not configured on the server.' } })
  }

  const token = req.body?.token || req.headers['x-zap-sub-token']
  const sub = await getSubscriberByToken(typeof token === 'string' ? token : null)
  if (!sub) {
    return res.status(404).json({ error: { message: 'No subscription found for this token.' } })
  }

  const origin =
    req.headers.origin ||
    (req.headers['x-forwarded-host']
      ? `https://${req.headers['x-forwarded-host']}`
      : `https://${req.headers.host}`)

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.customerId,
      return_url: origin
    })
    return res.status(200).json({ url: portal.url })
  } catch (e) {
    return res.status(500).json({ error: { message: e?.message || 'Portal session failed' } })
  }
}
