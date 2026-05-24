import { useState } from 'react'
import useLocalStorage from '../useLocalStorage.js'
import { DEFAULT_HABITS, DAY_LABELS, weekDates } from '../defaults.js'
import { PlusIcon, TrashIcon } from '../icons.jsx'

export default function Habits() {
  const [habits, setHabits] = useLocalStorage('zap.habits', DEFAULT_HABITS)
  const [log, setLog] = useLocalStorage('zap.habitLog', {})
  const [draft, setDraft] = useState('')
  const week = weekDates()
  const todayIso = new Date().toISOString().slice(0, 10)

  function toggle(habitId, dateIso) {
    const key = `${habitId}|${dateIso}`
    setLog({ ...log, [key]: !log[key] })
  }

  function addHabit() {
    const name = draft.trim()
    if (!name) return
    setHabits([...habits, { id: Date.now().toString(36), name, emoji: '⚡' }])
    setDraft('')
  }

  function removeHabit(id) {
    setHabits(habits.filter(h => h.id !== id))
  }

  const totalCells = habits.length * 7
  const checkedCells = habits.reduce((acc, h) => acc + week.filter(d => log[`${h.id}|${d}`]).length, 0)

  return (
    <div className="screen">
      <h1 className="h1">Habits</h1>
      <p className="sub" style={{ marginBottom: 16 }}>This week's tiny wins.</p>

      <div className="card warm">
        <div className="row between">
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>
              {checkedCells} <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-soft)' }}>/ {totalCells}</span>
            </div>
            <div className="sub">checks this week</div>
          </div>
          <div className="tag orange">
            {totalCells ? Math.round((checkedCells / totalCells) * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="card">
        <div className="habits-grid" style={{ marginBottom: 10 }}>
          <div />
          {DAY_LABELS.map((d, i) => (
            <div key={i} className={`day-label${week[i] === todayIso ? '' : ''}`} style={{ color: week[i] === todayIso ? 'var(--orange)' : undefined }}>
              {d}
            </div>
          ))}
        </div>
        {habits.map(h => (
          <div className="habits-grid" key={h.id} style={{ marginBottom: 6 }}>
            <div className="habit-name">
              <span style={{ marginRight: 4 }}>{h.emoji}</span>
              {h.name}
            </div>
            {week.map(d => {
              const done = log[`${h.id}|${d}`]
              return (
                <button
                  key={d}
                  className={`habit-cell${done ? ' done' : ''}`}
                  onClick={() => toggle(h.id, d)}
                  aria-label={`${h.name} ${d}`}
                >
                  {done ? '✓' : ''}
                </button>
              )
            })}
          </div>
        ))}
        {habits.length === 0 && <p className="empty">Add a habit to get started.</p>}
      </div>

      <div className="card">
        <h3 className="h3">Manage habits</h3>
        <div className="row gap-8" style={{ marginBottom: 10 }}>
          <input
            className="input"
            placeholder="New habit (e.g. journal)"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addHabit()}
          />
          <button className="btn small" onClick={addHabit} aria-label="Add"><PlusIcon /></button>
        </div>
        {habits.map(h => (
          <div className="brain-dump-item" key={h.id}>
            <span style={{ flex: 1 }}>{h.emoji} {h.name}</span>
            <button onClick={() => removeHabit(h.id)} aria-label="Remove"><TrashIcon /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
