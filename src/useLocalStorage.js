import { useState, useEffect } from 'react'

export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw == null) return typeof initial === 'function' ? initial() : initial
      return JSON.parse(raw)
    } catch {
      return typeof initial === 'function' ? initial() : initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value])

  return [value, setValue]
}
