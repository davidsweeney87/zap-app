import { useEffect, useRef, useState } from 'react'
import useLocalStorage from '../useLocalStorage.js'
import Spark from '../Spark.jsx'
import { SendIcon, TrashIcon } from '../icons.jsx'
import { getClientId } from '../clientId.js'

function getSubToken() {
  try { return localStorage.getItem('zap.sub_token') || null } catch { return null }
}

async function startCheckout() {
  const res = await fetch('/api/checkout', { method: 'POST' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) {
    alert(data?.error?.message || 'Could not start checkout.')
    return
  }
  window.location.href = data.url
}

async function openBillingPortal() {
  const token = getSubToken()
  if (!token) return
  const res = await fetch('/api/billing-portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) {
    alert(data?.error?.message || 'Could not open billing portal.')
    return
  }
  window.location.href = data.url
}

const SYSTEM_PROMPT = `You are Spark, a warm, upbeat, ADHD-friendly coach inside the Zap app. You help the user manage focus, routines, habits, and overwhelm.

Tone:
- Warm, playful, validating. Like a kind friend, not a therapist.
- Short replies (1-4 sentences). Use bullets only when listing.
- No moralizing. No "you should." Offer, don't prescribe.
- Plain language. No jargon.

Style:
- Lead with acknowledgement when the user shares something hard.
- Then offer one small, concrete next step (a "smallest possible thing").
- Occasional gentle humor and the odd sparkle ✨ — but don't over-emoji.
- Never shame missed routines or habits.

If asked something outside ADHD/life-coaching scope, gently redirect.`

export default function Chat() {
  const [messages, setMessages] = useLocalStorage('zap.chat', [
    { role: 'assistant', content: "Hey! I'm Spark ⚡ — your tiny ADHD copilot. What's on your mind today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [subToken, setSubToken] = useState(() => getSubToken())
  const scrollRef = useRef(null)

  useEffect(() => {
    function syncToken() { setSubToken(getSubToken()) }
    window.addEventListener('storage', syncToken)
    window.addEventListener('zap:sub-changed', syncToken)
    return () => {
      window.removeEventListener('storage', syncToken)
      window.removeEventListener('zap:sub-changed', syncToken)
    }
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    setError('')

    try {
      const headers = { 'Content-Type': 'application/json', 'x-zap-client-id': getClientId() }
      if (subToken) headers['x-zap-sub-token'] = subToken
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          system: SYSTEM_PROMPT,
          messages: next.slice(-12).map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data?.error?.message || `Request failed (${res.status})`
        throw new Error(msg)
      }
      const reply = data?.content?.[0]?.text || "Hmm, I lost my words for a sec. Try again?"
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch (e) {
      setError(e.message || 'Could not reach Spark right now.')
    } finally {
      setLoading(false)
    }
  }

  function clearChat() {
    setMessages([{ role: 'assistant', content: "Fresh start! What's up? ✨" }])
    setError('')
  }

  return (
    <div className="screen" style={{ paddingBottom: 0 }}>
      <div className="row between" style={{ marginBottom: 8 }}>
        <div className="row" style={{ gap: 10 }}>
          <div className="spark-bubble" style={{ width: 44, height: 44 }}><Spark size={44} mood="cheer" /></div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Spark</div>
            <div className="sub" style={{ fontSize: 12 }}>your ADHD copilot</div>
          </div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          {subToken ? (
            <button className="btn ghost small" onClick={openBillingPortal}>Manage</button>
          ) : (
            <button className="btn small" onClick={startCheckout}>Upgrade ✨</button>
          )}
          <button className="btn ghost small" onClick={clearChat} aria-label="Clear chat"><TrashIcon /></button>
        </div>
      </div>

      <div className="chat-wrap">
        <div className="chat-messages" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role === 'user' ? 'user' : 'spark'}`}>{m.content}</div>
          ))}
          {loading && (
            <div className="bubble spark"><div className="typing"><span/><span/><span/></div></div>
          )}
          {error && <div className="bubble error">{error}</div>}
        </div>
        <div className="chat-input-row">
          <input
            className="chat-input"
            placeholder="Talk to Spark..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            disabled={loading}
          />
          <button className="send-btn" onClick={send} disabled={loading} aria-label="Send">
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
