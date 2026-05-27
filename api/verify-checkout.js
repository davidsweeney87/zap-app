import Stripe from 'stripe'
import crypto from 'node:crypto'
import { kv, customerKey, subTokenKey } from './_lib/kv.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } })
  }
  if (!kv) {
    return res.status(500).json({ error: { message: 'KV is not configured on the server.' } })
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: { message: 'Stripe is not configured on the server.' } })
  }

  const sessionId = req.body?.sessionId
  if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
    return res.status(400).json({ error: { message: 'sessionId required' } })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] })
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(400).json({ error: { message: 'Checkout not complete yet' } })
    }

    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
    if (!customerId) {
      return res.status(400).json({ error: { message: 'No customer on session' } })
    }

    const existing = await kv.get(customerKey(customerId))
    const token = existing?.token || crypto.randomUUID()
    const subscription = session.subscription
    const status = typeof subscription === 'object' ? subscription?.status : 'active'
    const active = status === 'active' || status === 'trialing'

    await kv.set(customerKey(customerId), {
      token,
      active,
      status,
      subscriptionId: typeof subscription === 'object' ? subscription?.id : subscription,
      email: session.customer_details?.email || null
    })
    await kv.set(subTokenKey(token), customerId)

    return res.status(200).json({ token, active, email: session.customer_details?.email || null })
  } catch (e) {
    return res.status(500).json({ error: { message: e?.message || 'Verify failed' } })
  }
}
