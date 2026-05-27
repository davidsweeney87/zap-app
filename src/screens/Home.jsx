import { useMemo, useState } from 'react'
import Spark from '../Spark.jsx'
import useLocalStorage from '../useLocalStorage.js'
import { DEFAULT_ROUTINE, MOODS, todayKey } from '../defaults.js'
import { PlusIcon, TrashIcon } from '../icons.jsx'
import InstallBanner from '../InstallBanner.jsx'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Home({ goTo }) {
  const [name] = useLocalStorage('zap.name', 'friend')
  const [routine] = useLocalStorage('zap.routine', DEFAULT_ROUTINE)
  const [moodLog, setMoodLog] = useLocalStorage('zap.mood', {})
  const [brain, setBrain] = useLocalStorage('zap.braindump', [])
  const [draft, setDraft] = useState('')

  const today = todayKey()
  const mood = moodLog[today]

  const allTasks = [...routine.morning, ...routine.afternoon, ...routine.evening]
  const done = allTasks.filter(t => t.done).length
  const total = allTasks.length
  const pct = total ? Math.round((done / total) * 100) : 0

  const blocks = useMemo(() => ([
    { id: 'morning', label: 'Morning', emoji: '🌅', items: routine.morning },
    { id: 'afternoon', label: 'Afternoon', emoji: '☀️', items: routine.afternoon },
    { id: 'evening', label: 'Evening', emoji: '🌙', items: routine.evening }
  ]), [routine])

  function addBrain() {
    const text = draft.trim()
    if (!text) return
    setBrain([{ id: Date.now().toString(36), text, at: Date.now() }, ...brain].slice(0, 50))
    setDraft('')
  }

  function removeBrain(id) {
    setBrain(brain.filter(b => b.id !== id))
  }

  return (
    <div className="screen">
      <InstallBanner />
      <div className="row" style={{ gap: 14, marginBottom: 16 }}>
        <div className="spark-bubble" style={{ width: 64, height: 64 }}>
          <Spark size={64} mood="cheer" />
        </div>
        <div>
          <p className="sub">{greeting()},</p>
          <h1 className="h1">{name} ⚡</h1>
        </div>
      </div>

      <div className="card warm">
        <h3 className="h3">How are you feeling?</h3>
        <div className="mood-grid">
          {MOODS.map(m => (
            <button
              key={m.id}
              className={`mood-btn${mood === m.id ? ' active' : ''}`}
              onClick={() => setMoodLog({ ...moodLog, [today]: m.id })}
              aria-label={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="row between" style={{ marginBottom: 10 }}>
          <h3 className="h3" style={{ margin: 0 }}>Today's progress</h3>
          <span className="tag orange">{done}/{total}</span>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        <p className="sub mt-8">
          {pct === 100 ? 'You did it. Seriously, well done. 🎉' : pct >= 50 ? 'Nice rhythm — keep it loose.' : 'One small thing at a time.'}
        </p>
      </div>

      <h2 className="h2 mt-16">Your routine</h2>
      {blocks.map(b => {
        const d = b.items.filter(i => i.done).length
        const remaining = b.items.find(i => !i.done)
        return (
          <button key={b.id} className="accordion-head" onClick={() => goTo('routine')}>
            <div className="title">
              <span style={{ fontSize: 22 }}>{b.emoji}</span>
              <div style={{ textAlign: 'left' }}>
                <div>{b.label}</div>
                <div className="sub" style={{ fontSize: 12, fontWeight: 600 }}>
                  {remaining ? remaining.label : 'All done ✨'}
                </div>
              </div>
            </div>
            <span className="tag yellow">{d}/{b.items.length}</span>
          </button>
        )
      })}

      <h2 className="h2 mt-16">Brain dump 🧠</h2>
      <div className="card">
        <div className="row gap-8">
          <input
            className="input"
            placeholder="Get it out of your head..."
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addBrain()}
          />
          <button className="btn" onClick={addBrain} aria-label="Add"><PlusIcon /></button>
        </div>
        <div className="mt-16">
          {brain.length === 0 && <p className="empty" style={{ padding: '14px 0' }}>Nothing rattling around. Nice.</p>}
          {brain.map(b => (
            <div key={b.id} className="brain-dump-item">
              <span style={{ flex: 1 }}>{b.text}</span>
              <button onClick={() => removeBrain(b.id)} aria-label="Remove"><TrashIcon /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
