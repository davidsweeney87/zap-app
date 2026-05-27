import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } })
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return res.status(500).json({ error: { message: 'Stripe is not configured on the server.' } })
  }

  const origin =
    req.headers.origin ||
    (req.headers['x-forwarded-host']
      ? `https://${req.headers['x-forwarded-host']}`
      : `https://${req.headers.host}`)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancel`
    })
    return res.status(200).json({ url: session.url })
  } catch (e) {
    return res.status(500).json({ error: { message: e?.message || 'Could not create checkout session' } })
  }
}
