export function getClientId() {
  try {
    let id = localStorage.getItem('zap.cid')
    if (!id) {
      id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem('zap.cid', id)
    }
    return id
  } catch {
    return 'anon'
  }
}
