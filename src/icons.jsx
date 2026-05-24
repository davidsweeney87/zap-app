const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const HomeIcon = () => (
  <svg viewBox="0 0 24 24" {...s}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>
)
export const RoutineIcon = () => (
  <svg viewBox="0 0 24 24" {...s}><rect x="4" y="5" width="16" height="16" rx="3" /><path d="M9 3v4M15 3v4M4 11h16M9 15l2 2 4-4" /></svg>
)
export const HabitsIcon = () => (
  <svg viewBox="0 0 24 24" {...s}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 4v16M15 4v16" /></svg>
)
export const FocusIcon = () => (
  <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
)
export const RemindersIcon = () => (
  <svg viewBox="0 0 24 24" {...s}><path d="M6 8a6 6 0 0112 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" /><path d="M10 21a2 2 0 004 0" /></svg>
)
export const ChatIcon = () => (
  <svg viewBox="0 0 24 24" {...s}><path d="M21 12a8 8 0 11-3.2-6.4L21 4l-1.2 3.6A8 8 0 0121 12z" /><circle cx="9" cy="12" r="1" fill="currentColor" /><circle cx="13" cy="12" r="1" fill="currentColor" /><circle cx="17" cy="12" r="1" fill="currentColor" /></svg>
)
export const PlayIcon = () => (
  <svg viewBox="0 0 24 24" {...s}><path d="M6 4l14 8-14 8z" fill="currentColor" /></svg>
)
export const PauseIcon = () => (
  <svg viewBox="0 0 24 24" {...s}><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" /><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" /></svg>
)
export const ResetIcon = () => (
  <svg viewBox="0 0 24 24" {...s}><path d="M3 12a9 9 0 109-9" /><path d="M3 3v6h6" /></svg>
)
export const PlusIcon = () => (
  <svg viewBox="0 0 24 24" {...s}><path d="M12 5v14M5 12h14" /></svg>
)
export const TrashIcon = () => (
  <svg viewBox="0 0 24 24" {...s} strokeWidth={2}><path d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" /></svg>
)
export const SendIcon = () => (
  <svg viewBox="0 0 24 24" {...s}><path d="M4 12l16-8-6 16-2-7z" /></svg>
)
export const ChevronIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" {...s} style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'none', width: 20, height: 20 }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
)
