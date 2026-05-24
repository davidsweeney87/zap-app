import { useEffect, useRef, useState } from 'react'
import useLocalStorage from '../useLocalStorage.js'
import Spark from '../Spark.jsx'
import { PlayIcon, PauseIcon, ResetIcon } from '../icons.jsx'

const PRESETS = [5, 10, 15, 25]

function fmt(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.value = 660
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8)
    o.start()
    o.stop(ctx.currentTime + 0.85)
  } catch {}
}

export default function Focus() {
  const [minutes, setMinutes] = useState(25)
  const [remaining, setRemaining] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useLocalStorage('zap.focusSessions', 0)
  const tick = useRef(null)

  useEffect(() => {
    if (!running) return
    tick.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(tick.current)
          setRunning(false)
          setSessions(s => s + 1)
          beep()
          if ('vibrate' in navigator) navigator.vibrate([180, 80, 180])
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(tick.current)
  }, [running, setSessions])

  function pick(m) {
    setMinutes(m)
    setRemaining(m * 60)
    setRunning(false)
  }

  function reset() {
    setRunning(false)
    setRemaining(minutes * 60)
  }

  const total = minutes * 60
  const pct = total ? remaining / total : 0
  const r = 110
  const C = 2 * Math.PI * r
  const dash = C * (1 - pct)

  return (
    <div className="screen">
      <h1 className="h1">Focus</h1>
      <p className="sub">A short sprint. That's it.</p>

      <div className="preset-row mt-16">
        {PRESETS.map(p => (
          <button
            key={p}
            className={`chip${minutes === p ? ' active' : ''}`}
            onClick={() => pick(p)}
          >
            {p} min
          </button>
        ))}
      </div>

      <div className="timer-circle-wrap">
        <svg viewBox="0 0 240 240">
          <circle cx="120" cy="120" r={r} fill="none" stroke="#fde68a" strokeWidth="14" />
          <circle
            cx="120" cy="120" r={r}
            fill="none"
            stroke="url(#focusGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={dash}
            style={{ transition: 'stroke-dashoffset 0.8s linear' }}
          />
          <defs>
            <linearGradient id="focusGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>
        <div className="time-text">
          <div>{fmt(remaining)}</div>
          <small>{running ? 'focus' : remaining === 0 ? 'done!' : 'ready'}</small>
        </div>
      </div>

      <div className="row" style={{ justifyContent: 'center', gap: 14 }}>
        <button className="btn ghost" onClick={reset} aria-label="Reset">
          <ResetIcon />
        </button>
        <button
          className="btn"
          style={{ minWidth: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          onClick={() => setRunning(r => !r)}
        >
          {running ? <PauseIcon /> : <PlayIcon />}
          {running ? 'Pause' : remaining === 0 ? 'Restart' : 'Start'}
        </button>
      </div>

      <div className="card mt-16 row" style={{ gap: 14 }}>
        <Spark size={48} mood={running ? 'cheer' : 'happy'} />
        <div>
          <div style={{ fontWeight: 800 }}>{sessions} sessions complete</div>
          <div className="sub">Every sprint counts, even the messy ones.</div>
        </div>
      </div>
    </div>
  )
}
