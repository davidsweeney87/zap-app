import webpush from 'web-push'

const keys = webpush.generateVAPIDKeys()
console.log('Paste these into your Vercel project env vars:')
console.log('')
console.log('VAPID_PUBLIC_KEY=' + keys.publicKey)
console.log('VAPID_PRIVATE_KEY=' + keys.privateKey)
console.log('VAPID_SUBJECT=mailto:you@example.com   # replace with your email')
console.log('CRON_SECRET=' + Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url'))
