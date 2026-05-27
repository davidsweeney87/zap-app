import { useEffect, useState } from 'react'
import Home from './screens/Home.jsx'
import Routine from './screens/Routine.jsx'
import Habits from './screens/Habits.jsx'
import Focus from './screens/Focus.jsx'
import Reminders from './screens/Reminders.jsx'
import Chat from './screens/Chat.jsx'
import { HomeIcon, RoutineIcon, HabitsIcon, FocusIcon, RemindersIcon, ChatIcon } from './icons.jsx'
import ReminderBanner from './ReminderBanner.jsx'
import { Analytics } from '@vercel/analytics/react'

const TABS = [
  { id: 'home', label: 'Home', Icon: HomeIcon, Component: Home },
  { id: 'routine', label: 'Routine', Icon: RoutineIcon, Component: Routine },
  { id: 'habits', label: 'Habits', Icon: HabitsIcon, Component: Habits },
  { id: 'focus', label: 'Focus', Icon: FocusIcon, Component: Focus },
  { id: 'reminders', label: 'Remind', Icon: RemindersIcon, Component: Reminders },
  { id: 'chat', label: 'Spark', Icon: ChatIcon, Component: Chat }
]

export default function App() {
  const [tab, setTab] = useState('home')
  const Active = TABS.find(t => t.id === tab).Component

  useEffect(() => {
    const url = new URL(window.location.href)
    const checkout = url.searchParams.get('checkout')
    const sessionId = url.searchParams.get('session_id')
    if (checkout === 'success' && sessionId) {
      setTab('chat')
      fetch('/api/verify-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
        .then(r => r.json().then(d => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok && d?.token) {
            localStorage.setItem('zap.sub_token', d.token)
            window.dispatchEvent(new Event('zap:sub-changed'))
          } else {
            alert(d?.error?.message || 'Could not confirm subscription.')
          }
        })
        .catch(e => alert(e?.message || 'Could not confirm subscription.'))
        .finally(() => {
          url.searchParams.delete('checkout')
          url.searchParams.delete('session_id')
          window.history.replaceState({}, '', url.pathname + url.search)
        })
    } else if (checkout) {
      url.searchParams.delete('checkout')
      window.history.replaceState({}, '', url.pathname + url.search)
    }
  }, [])

  return (
    <div className="app">
      <Analytics />
      <ReminderBanner />
      <Active goTo={setTab} />
      <nav className="bottom-nav" aria-label="Primary">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-btn${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
          >
            <t.Icon />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
