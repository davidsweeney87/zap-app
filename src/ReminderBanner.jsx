import { useEffect, useState } from 'react'
import { REMINDER_CATEGORIES } from './defaults.js'

const WEEKDAYS = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
const WEEKENDS = new Set(['Sat', 'Sun'])

function nowParts() {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { hhmm: `${hh}:${mm}`, weekday, iso }
}

function matchesRepeat(repeat, weekday) {
  if (repeat === 'daily') return true
  if (repeat === 'weekdays') return WEEKDAYS.has(weekday)
  if (repeat === 'weekends') return WEEKENDS.has(weekday)
  return false
}

function readReminders() {
  try {
    const raw = localStorage.getItem('zap.reminders')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function readShown() {
  try {
    const raw = localStorage.getItem('zap.banner_shown')
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeShown(map) {
  try { localStorage.setItem('zap.banner_shown', JSON.stringify(map)) } catch {}
}

export default function ReminderBanner() {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    function tick() {
      const reminders = readReminders()
      if (reminders.length === 0) return
      const { hhmm, weekday, iso } = nowParts()
      const shown = readShown()
      // prune old days
      for (const key of Object.keys(shown)) {
        if (!key.startsWith(iso)) delete shown[key]
      }
      for (const r of reminders) {
        if (!r.on) continue
        if (r.time !== hhmm) continue
        if (!matchesRepeat(r.repeat, weekday)) continue
        const key = `${iso}|${r.id}`
        if (shown[key]) continue
        shown[key] = 1
        writeShown(shown)
        const cat = REMINDER_CATEGORIES.find(c => c.id === r.category)
        setToast({ id: r.id, label: r.label, emoji: cat?.emoji || '✨' })
        break
      }
    }
    tick()
    const handle = setInterval(tick, 20_000)
    return () => clearInterval(handle)
  }, [])

  useEffect(() => {
    if (!toast) return
    const handle = setTimeout(() => setToast(null), 10_000)
    return () => clearTimeout(handle)
  }, [toast])

  if (!toast) return null
  return (
    <div className="reminder-toast" role="status" aria-live="polite">
      <div style={{ fontSize: 22 }}>{toast.emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 14 }}>Reminder</div>
        <div style={{ fontSize: 14 }}>{toast.label}</div>
      </div>
      <button onClick={() => setToast(null)} aria-label="Dismiss" className="reminder-toast-close">×</button>
    </div>
  )
}
