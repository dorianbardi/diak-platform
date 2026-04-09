'use client'

import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookies_accepted')
    if (!accepted) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookies_accepted', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: 'calc(100% - 48px)', maxWidth: '680px',
      background: 'rgba(8,11,20,0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(79,142,255,0.25)',
      borderRadius: '20px',
      padding: '20px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '16px', flexWrap: 'wrap',
      boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(79,142,255,0.1)',
      animation: 'fadeInUp 0.4s ease forwards',
    }}>
      {/* Dekoratív elem */}
      <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--accent-blue), transparent)' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: '200px' }}>
        <span style={{ fontSize: '22px', flexShrink: 0 }}>🍪</span>
        <div>
          <p style={{ fontFamily: 'Geist', fontWeight: 600, fontSize: '14px', color: 'var(--text)', marginBottom: '4px' }}>
            Cookie-kat használunk
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
            Az oldal működéséhez és analitikához sütiket használunk. Részletek a{' '}
            <a href="/cookies" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}>Cookie tájékoztatóban</a>.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <a href="/cookies" style={{ textDecoration: 'none' }}>
          <button className="btn btn-ghost" style={{ padding: '9px 16px', fontSize: '13px' }}>
            Részletek
          </button>
        </a>
        <button onClick={accept} className="btn btn-primary" style={{ padding: '9px 20px', fontSize: '13px' }}>
          Elfogadom ✓
        </button>
      </div>
    </div>
  )
}