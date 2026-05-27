import Stripe from 'stripe'
import { kv, customerKey } from './_lib/kv.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const config = { api: { bodyParser: false } }

async function rawBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

async function applySubscription(sub) {
  if (!kv) return
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
  if (!customerId) return
  const status = sub.status
  const active = status === 'active' || status === 'trialing'
  const existing = (await kv.get(customerKey(customerId))) || {}
  await kv.set(customerKey(customerId), {
    ...existing,
    active,
    status,
    subscriptionId: sub.id
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: { message: 'Webhook secret not configured' } })
  }

  const sig = req.headers['stripe-signature']
  let event
  try {
    const buf = await rawBody(req)
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (e) {
    return res.status(400).json({ error: { message: `Webhook signature error: ${e.message}` } })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await applySubscription(event.data.object)
        break
    }
  } catch (e) {
    console.error('webhook handler error', e)
    return res.status(500).json({ error: { message: 'Webhook handler error' } })
  }

  return res.status(200).json({ received: true })
}
