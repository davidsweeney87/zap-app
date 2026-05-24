export const DEFAULT_ROUTINE = {
  morning: [
    { id: 'm1', label: 'Drink a glass of water', done: false },
    { id: 'm2', label: 'Take meds / vitamins', done: false },
    { id: 'm3', label: 'Stretch for 2 minutes', done: false },
    { id: 'm4', label: 'Set 3 priorities for today', done: false }
  ],
  afternoon: [
    { id: 'a1', label: 'Eat a real lunch', done: false },
    { id: 'a2', label: '5-min movement break', done: false },
    { id: 'a3', label: 'Tackle the hardest task', done: false }
  ],
  evening: [
    { id: 'e1', label: 'Tidy one small space', done: false },
    { id: 'e2', label: 'Lay out tomorrow’s clothes', done: false },
    { id: 'e3', label: 'Screens off 30 min before bed', done: false },
    { id: 'e4', label: 'Brain dump for tomorrow', done: false }
  ]
}

export const DEFAULT_HABITS = [
  { id: 'h1', name: 'Hydrate', emoji: '💧' },
  { id: 'h2', name: 'Movement', emoji: '🏃' },
  { id: 'h3', name: 'Read 10m', emoji: '📖' },
  { id: 'h4', name: 'Meds', emoji: '💊' },
  { id: 'h5', name: 'Sleep by 11', emoji: '😴' }
]

export const MOODS = [
  { id: 'great', emoji: '🤩', label: 'Great' },
  { id: 'good', emoji: '😊', label: 'Good' },
  { id: 'meh', emoji: '😐', label: 'Meh' },
  { id: 'low', emoji: '😔', label: 'Low' },
  { id: 'fried', emoji: '🥴', label: 'Fried' }
]

export const REMINDER_CATEGORIES = [
  { id: 'meds', label: 'Meds', emoji: '💊' },
  { id: 'water', label: 'Water', emoji: '💧' },
  { id: 'move', label: 'Move', emoji: '🏃' },
  { id: 'eat', label: 'Eat', emoji: '🍎' },
  { id: 'focus', label: 'Focus', emoji: '🎯' },
  { id: 'other', label: 'Other', emoji: '✨' }
]

export const REPEAT_OPTIONS = [
  { id: 'once', label: 'Once' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'weekends', label: 'Weekends' }
]

export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function weekDates() {
  const d = new Date()
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday)
    x.setDate(monday.getDate() + i)
    return x.toISOString().slice(0, 10)
  })
}

export const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
