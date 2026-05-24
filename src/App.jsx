import { useState } from 'react'
import Home from './screens/Home.jsx'
import Routine from './screens/Routine.jsx'
import Habits from './screens/Habits.jsx'
import Focus from './screens/Focus.jsx'
import Reminders from './screens/Reminders.jsx'
import Chat from './screens/Chat.jsx'
import { HomeIcon, RoutineIcon, HabitsIcon, FocusIcon, RemindersIcon, ChatIcon } from './icons.jsx'

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
  return (
    <div className="app">
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
