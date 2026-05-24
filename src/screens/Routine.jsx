import { useState } from 'react'
import useLocalStorage from '../useLocalStorage.js'
import { DEFAULT_ROUTINE, todayKey } from '../defaults.js'
import { ChevronIcon, PlusIcon, TrashIcon } from '../icons.jsx'

const BLOCKS = [
  { id: 'morning', label: 'Morning', emoji: '🌅' },
  { id: 'afternoon', label: 'Afternoon', emoji: '☀️' },
  { id: 'evening', label: 'Evening', emoji: '🌙' }
]

export default function Routine() {
  const [routine, setRoutine] = useLocalStorage('zap.routine', DEFAULT_ROUTINE)
  const [lastReset, setLastReset] = useLocalStorage('zap.routineDay', '')
  const [open, setOpen] = useState({ morning: true, afternoon: false, evening: false })
  const [drafts, setDrafts] = useState({ morning: '', afternoon: '', evening: '' })

  if (lastReset !== todayKey()) {
    const cleared = Object.fromEntries(
      Object.entries(routine).map(([k, items]) => [k, items.map(i => ({ ...i, done: false }))])
    )
    setRoutine(cleared)
    setLastReset(todayKey())
  }

  function toggle(blockId, itemId) {
    setRoutine({
      ...routine,
      [blockId]: routine[blockId].map(i => i.id === itemId ? { ...i, done: !i.done } : i)
    })
  }

  function add(blockId) {
    const text = drafts[blockId].trim()
    if (!text) return
    setRoutine({
      ...routine,
      [blockId]: [...routine[blockId], { id: Date.now().toString(36), label: text, done: false }]
    })
    setDrafts({ ...drafts, [blockId]: '' })
  }

  function remove(blockId, itemId) {
    setRoutine({ ...routine, [blockId]: routine[blockId].filter(i => i.id !== itemId) })
  }

  return (
    <div className="screen">
      <h1 className="h1">Routine</h1>
      <p className="sub" style={{ marginBottom: 16 }}>Tiny anchors for the day.</p>

      {BLOCKS.map(b => {
        const items = routine[b.id]
        const done = items.filter(i => i.done).length
        const isOpen = open[b.id]
        return (
          <div key={b.id}>
            <button className="accordion-head" onClick={() => setOpen({ ...open, [b.id]: !isOpen })}>
              <div className="title">
                <span style={{ fontSize: 22 }}>{b.emoji}</span>
                <span>{b.label}</span>
                <span className="tag yellow">{done}/{items.length}</span>
              </div>
              <ChevronIcon open={isOpen} />
            </button>
            {isOpen && (
              <div className="accordion-body">
                {items.map(item => (
                  <div key={item.id} className={`checklist-item${item.done ? ' done' : ''}`}>
                    <button
                      className={`checkbox${item.done ? ' checked' : ''}`}
                      onClick={() => toggle(b.id, item.id)}
                      aria-label={item.done ? 'Uncheck' : 'Check'}
                    >
                      {item.done && (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      )}
                    </button>
                    <span className="checklist-label">{item.label}</span>
                    <button onClick={() => remove(b.id, item.id)} style={{ color: 'var(--muted)' }} aria-label="Remove"><TrashIcon /></button>
                  </div>
                ))}
                <div className="row gap-8 mt-8">
                  <input
                    className="input"
                    placeholder={`Add to ${b.label.toLowerCase()}...`}
                    value={drafts[b.id]}
                    onChange={e => setDrafts({ ...drafts, [b.id]: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && add(b.id)}
                  />
                  <button className="btn small" onClick={() => add(b.id)} aria-label="Add"><PlusIcon /></button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
