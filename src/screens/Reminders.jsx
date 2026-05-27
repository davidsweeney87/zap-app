import { useEffect, useState } from 'react'
import useLocalStorage from '../useLocalStorage.js'
import { REMINDER_CATEGORIES, REPEAT_OPTIONS } from '../defaults.js'
import { PlusIcon, TrashIcon } from '../icons.jsx'
import { enableNudges, nudgesPermission, nudgesSupported, syncReminders } from '../nudges.js'

export default function Reminders() {
  const [items, setItems] = useLocalStorage('zap.reminders', [])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    label: '',
    time: '09:00',
    repeat: 'daily',
    category: 'meds'
  })
  const [permission, setPermission] = useState(() =>
    nudgesSupported() ? nudgesPermission() : 'unsupported'
  )
  const [nudgeBusy, setNudgeBusy] = useState(false)
  const [nudgeError, setNudgeError] = useState('')

  useEffect(() => {
    syncReminders(items)
  }, [items])

  async function turnOnNudges() {
    setNudgeBusy(true)
    setNudgeError('')
    try {
      await enableNudges()
      setPermission(nudgesPermission())
    } catch (e) {
      setNudgeError(e.message || 'Could not enable nudges.')
    } finally {
      setNudgeBusy(false)
    }
  }

  function add() {
    if (!form.label.trim()) return
    setItems([
      ...items,
      { id: Date.now().toString(36), ...form, label: form.label.trim(), on: true }
    ])
    setForm({ label: '', time: '09:00', repeat: 'daily', category: 'meds' })
    setAdding(false)
  }

  function toggle(id) {
    setItems(items.map(i => i.id === id ? { ...i, on: !i.on } : i))
  }

  function remove(id) {
    setItems(items.filter(i => i.id !== id))
  }

  function catOf(id) { return REMINDER_CATEGORIES.find(c => c.id === id) || REMINDER_CATEGORIES[0] }
  function repeatOf(id) { return REPEAT_OPTIONS.find(r => r.id === id)?.label || 'Once' }

  const sorted = [...items].sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="screen">
      <div className="row between" style={{ marginBottom: 8 }}>
        <h1 className="h1">Reminders</h1>
        <button className="btn small" onClick={() => setAdding(!adding)} aria-label="Add reminder">
          <PlusIcon />
        </button>
      </div>
      <p className="sub" style={{ marginBottom: 16 }}>Gentle nudges, never naggy.</p>

      {permission !== 'granted' && permission !== 'unsupported' && (
        <div className="card warm">
          <div className="row between" style={{ gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, marginBottom: 4 }}>Turn on nudges ✨</div>
              <div className="sub" style={{ fontSize: 13 }}>
                Get a tiny notification at the reminder time, even when the app is closed.
              </div>
              {nudgeError && (
                <div className="sub" style={{ fontSize: 12, color: '#991b1b', marginTop: 6 }}>
                  {nudgeError}
                </div>
              )}
            </div>
            <button className="btn small" onClick={turnOnNudges} disabled={nudgeBusy}>
              {nudgeBusy ? '...' : 'Enable'}
            </button>
          </div>
        </div>
      )}

      {permission === 'unsupported' && (
        <div className="card flat">
          <div className="sub" style={{ fontSize: 13 }}>
            Push notifications aren't supported on this device or browser. On iPhone, add Zap to your Home Screen first.
          </div>
        </div>
      )}

      {adding && (
        <div className="card">
          <h3 className="h3">New reminder</h3>
          <div className="col">
            <input
              className="input"
              placeholder="What's the nudge?"
              value={form.label}
              onChange={e => setForm({ ...form, label: e.target.value })}
              autoFocus
            />
            <div className="row gap-8">
              <input
                className="input"
                type="time"
                value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })}
                style={{ flex: 1 }}
              />
              <select
                className="select"
                value={form.repeat}
                onChange={e => setForm({ ...form, repeat: e.target.value })}
                style={{ flex: 1 }}
              >
                {REPEAT_OPTIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <div className="h3">Category</div>
              <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                {REMINDER_CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    className={`chip${form.category === c.id ? ' active' : ''}`}
                    onClick={() => setForm({ ...form, category: c.id })}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="row gap-8">
              <button className="btn ghost" onClick={() => setAdding(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn" onClick={add} style={{ flex: 1 }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {sorted.length === 0 && !adding && (
        <div className="card flat">
          <p className="empty">No reminders yet. Tap + to add one.</p>
        </div>
      )}

      {sorted.map(r => {
        const c = catOf(r.category)
        return (
          <div className="reminder-item" key={r.id} style={{ opacity: r.on ? 1 : 0.5 }}>
            <div style={{ fontSize: 26 }}>{c.emoji}</div>
            <div style={{ flex: 1 }}>
              <div className="reminder-time">{r.time}</div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{r.label}</div>
              <div className="reminder-meta">{repeatOf(r.repeat)} · {c.label}</div>
            </div>
            <button
              className={`toggle${r.on ? ' on' : ''}`}
              onClick={() => toggle(r.id)}
              aria-label={r.on ? 'Turn off' : 'Turn on'}
            />
            <button onClick={() => remove(r.id)} style={{ color: 'var(--muted)' }} aria-label="Remove"><TrashIcon /></button>
          </div>
        )
      })}
    </div>
  )
}
