import { useEffect, useState } from 'react'

function isStandalone() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true
  if (window.navigator?.standalone === true) return true
  return false
}

function detectPlatform() {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream
  if (isIOS) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'other'
}

export default function InstallBanner() {
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem('zap.install_dismissed') === '1' } catch { return false }
  })
  const [installed, setInstalled] = useState(() => isStandalone())
  const [platform] = useState(() => detectPlatform())
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    function onPrompt(e) {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    function onInstalled() {
      setInstalled(true)
      setDeferredPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  function dismiss() {
    try { localStorage.setItem('zap.install_dismissed', '1') } catch {}
    setHidden(true)
  }

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    try { await deferredPrompt.userChoice } catch {}
    setDeferredPrompt(null)
  }

  if (installed || hidden) return null
  if (platform === 'other' && !deferredPrompt) return null

  return (
    <div className="install-banner">
      <div className="row between" style={{ alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 4 }}>
            Add Zap to your home screen ⚡
          </div>
          {platform === 'ios' && (
            <div className="sub" style={{ fontSize: 13, lineHeight: 1.45 }}>
              In Safari, tap the <strong>Share</strong> button{' '}
              <span aria-hidden="true">⬆️</span>, then{' '}
              <strong>Add to Home Screen</strong>. Required on iPhone for reminder nudges to work.
            </div>
          )}
          {platform === 'android' && (
            <div className="sub" style={{ fontSize: 13, lineHeight: 1.45 }}>
              {deferredPrompt
                ? 'Tap Install to add Zap to your home screen — needed so reminders nudge you in the background.'
                : 'Open the browser menu (⋮) and tap Add to Home Screen so reminders can nudge you.'}
            </div>
          )}
          {platform === 'other' && deferredPrompt && (
            <div className="sub" style={{ fontSize: 13, lineHeight: 1.45 }}>
              Install Zap as an app for quick access.
            </div>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="install-banner-close"
        >
          ×
        </button>
      </div>
      {deferredPrompt && (
        <button className="btn full" onClick={install} style={{ marginTop: 10 }}>
          Install
        </button>
      )}
    </div>
  )
}
