'use client'

import { useUser, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const features = [
  { href: '/dashboard/flashcards', icon: '🃏', title: 'Flashcardok', desc: 'SM-2 algoritmus alapú ismétlés', accent: '#4f8eff', border: 'rgba(79,142,255,0.2)', bg: 'rgba(79,142,255,0.05)', shape: 'circle' },
  { href: '/dashboard/utemterv', icon: '📅', title: 'Tanulási ütemterv', desc: 'Vizsgákra való felkészülés tervezése', accent: '#2dd4a0', border: 'rgba(45,212,160,0.2)', bg: 'rgba(45,212,160,0.05)', shape: 'square' },
  { href: '/dashboard/jegyek', icon: '📊', title: 'Jegykövetés', desc: 'Súlyozott átlag, tantárgyak bontása', accent: '#f5c842', border: 'rgba(245,200,66,0.2)', bg: 'rgba(245,200,66,0.05)', shape: 'triangle' },
  { href: '/dashboard/koltsegvetes', icon: '💰', title: 'Költségvetés', desc: 'Bevételek és kiadások kezelése', accent: '#9b6dff', border: 'rgba(155,109,255,0.2)', bg: 'rgba(155,109,255,0.05)', shape: 'hex' },
]

function Clock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }))
    update()
    const i = setInterval(update, 1000)
    return () => clearInterval(i)
  }, [])
  return <span>{time}</span>
}

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Éjjel is tanulsz?'
  if (h < 12) return 'Jó reggelt'
  if (h < 18) return 'Jó napot'
  return 'Jó estét'
}

function getLevel(xp) {
  if (xp < 100) return { level: 1, title: 'Kezdő', next: 100 }
  if (xp < 300) return { level: 2, title: 'Tanuló', next: 300 }
  if (xp < 600) return { level: 3, title: 'Haladó', next: 600 }
  if (xp < 1000) return { level: 4, title: 'Tudós', next: 1000 }
  if (xp < 2000) return { level: 5, title: 'Mester', next: 2000 }
  return { level: 6, title: 'Legenda', next: 9999 }
}

function getStreakMessage(streak) {
  if (streak === 0) return 'Kezdj el tanulni!'
  if (streak < 3) return 'Szép kezdet!'
  if (streak < 7) return 'Így tovább!'
  if (streak < 14) return 'Fantasztikus!'
  if (streak < 30) return 'Elképesztő!'
  return 'Legendás! 🏆'
}

export default function Dashboard() {
  const { user } = useUser()
  const [stats, setStats] = useState({ streak: 0, xp: 0, longest_streak: 0 })
  const [statsLoading, setStatsLoading] = useState(true)

 useEffect(() => {
  if (user) {
    fetchStats()
    window.addEventListener('focus', fetchStats)
    return () => window.removeEventListener('focus', fetchStats)
  }
}, [user])

  async function fetchStats() {
    try {
      const res = await fetch(`/api/streak?user_id=${user.id}`)
      const data = await res.json()
      setStats(data)
    } catch (e) { console.error(e) }
    setStatsLoading(false)
  }

  const levelInfo = getLevel(stats.xp)
  const xpProgress = ((stats.xp % (levelInfo.next - (levelInfo.level === 1 ? 0 : levelInfo.next / 2))) / (levelInfo.next / levelInfo.level)) * 100

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(79,142,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <div style={{ position: 'fixed', top: '12%', right: '6%', width: 'clamp(40px, 5vw, 70px)', height: 'clamp(40px, 5vw, 70px)', border: '1px solid rgba(79,142,255,0.15)', borderRadius: '16px', transform: 'rotate(20deg)', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '60%', right: '4%', width: 'clamp(24px, 3vw, 40px)', height: 'clamp(24px, 3vw, 40px)', border: '1px solid rgba(155,109,255,0.2)', borderRadius: '50%', animation: 'float 9s ease-in-out infinite 2s', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '30%', left: '3%', width: 'clamp(30px, 4vw, 50px)', height: 'clamp(30px, 4vw, 50px)', background: 'rgba(45,212,160,0.06)', border: '1px solid rgba(45,212,160,0.2)', transform: 'rotate(45deg)', animation: 'float 8s ease-in-out infinite 1s', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '35%', right: '8%', width: 'clamp(35px, 4vw, 55px)', height: 'clamp(35px, 4vw, 55px)', border: '1px solid rgba(79,142,255,0.12)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', background: 'rgba(79,142,255,0.04)', animation: 'float 10s ease-in-out infinite 3s', pointerEvents: 'none', zIndex: 0 }} />

      {/* Navbar */}
      <nav className="nav-bar">
        <div className="nav-logo">
          <span className="gradient-text">Diák</span>
          <span style={{ color: 'var(--text)' }}>Platform</span>
          <span style={{ color: 'var(--accent-blue)', marginLeft: '4px' }}>✦</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="hide-mobile" style={{ color: 'var(--muted)', fontSize: '14px', fontWeight: 500 }}>
            <Clock />
          </div>
          <UserButton afterSignOutUrl="/">
            <UserButton.MenuItems>
              <UserButton.Link
                label="Profilom"
                labelIcon={<span style={{ fontSize: '14px' }}>👤</span>}
                href="/dashboard/profile"
              />
            </UserButton.MenuItems>
          </UserButton>
        </div>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: 'var(--pad-y) var(--pad-x)' }}>

        {/* Üdvözlés */}
        <div className="animate-fade-up delay-1" style={{ marginBottom: '32px' }}>
          <div className="section-label" style={{ color: 'var(--accent-blue)' }}>✦ Dashboard</div>
          <h1 style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(32px, 5vw, 64px)', letterSpacing: '-2px', lineHeight: 1.05, marginBottom: '12px' }}>
            {greeting()},<br />
            <span className="gradient-text">{user?.firstName || 'Diák'}</span> 👋
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
            {new Date().toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Streak + XP kijelző */}
        <div className="animate-fade-up delay-2" style={{ marginBottom: '32px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(245,200,66,0.08), rgba(255,107,107,0.05))', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 'var(--radius)', padding: 'clamp(24px, 3vw, 40px)', position: 'relative', overflow: 'hidden' }}>

            {/* Dekoratív háttér */}
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,200,66,0.15), transparent)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,107,0.1), transparent)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>

              {/* Streak */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: 'clamp(48px, 8vw, 80px)', lineHeight: 1, filter: stats.streak > 0 ? 'drop-shadow(0 0 20px rgba(245,200,66,0.6))' : 'none', transition: 'filter 0.3s' }}>🔥</div>
                  {stats.streak > 0 && (
                    <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg, #f5c842, #ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: 'white' }}>
                      {stats.streak > 99 ? '∞' : stats.streak}
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(40px, 7vw, 72px)', lineHeight: 1, letterSpacing: '-3px', background: 'linear-gradient(135deg, #f5c842, #ff9f43)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {statsLoading ? '...' : stats.streak}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>napos streak</div>
                  <div style={{ fontSize: '12px', color: '#f5c842', fontWeight: 600, marginTop: '2px' }}>{getStreakMessage(stats.streak)}</div>
                </div>
              </div>

              {/* Elválasztó */}
              <div style={{ width: '1px', height: '80px', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} className="hide-mobile" />

              {/* XP + Szint */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>⚡</span>
                    <span style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '15px' }}>{levelInfo.title}</span>
                    <span style={{ fontSize: '11px', color: 'var(--accent-blue)', background: 'rgba(79,142,255,0.1)', border: '1px solid rgba(79,142,255,0.2)', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>Szint {levelInfo.level}</span>
                  </div>
                  <span style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '15px', color: '#f5c842' }}>{statsLoading ? '...' : stats.xp} XP</span>
                </div>

                {/* XP progress bar */}
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '100px', height: '8px', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg, #f5c842, #ff9f43)', borderRadius: '100px', width: `${Math.min((stats.xp / levelInfo.next) * 100, 100)}%`, transition: 'width 0.6s ease', boxShadow: '0 0 10px rgba(245,200,66,0.5)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{stats.xp} XP</span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{levelInfo.next} XP a következő szinthez</span>
                </div>
              </div>

              {/* Leghosszabb streak */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(24px, 4vw, 40px)', color: 'var(--muted)', letterSpacing: '-1px' }}>{statsLoading ? '...' : stats.longest_streak}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>leghosszabb</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', opacity: 0.6 }}>streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature kártyák */}
        <div className="animate-fade-up delay-3 grid-2">
          {features.map((f, i) => (
            <Link key={i} href={f.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: f.bg, border: `1px solid ${f.border}`, borderRadius: 'var(--radius)', padding: 'clamp(24px, 3vw, 36px) clamp(20px, 3vw, 40px)', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s', cursor: 'pointer', height: '100%' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 60px ${f.bg}` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                {f.shape === 'circle' && <div style={{ position: 'absolute', top: '-24px', right: '-24px', width: '80px', height: '80px', borderRadius: '50%', border: `1px solid ${f.border}`, opacity: 0.6 }} />}
                {f.shape === 'square' && <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '70px', height: '70px', border: `1px solid ${f.border}`, borderRadius: '12px', transform: 'rotate(20deg)', opacity: 0.5 }} />}
                {f.shape === 'triangle' && <div style={{ position: 'absolute', top: '12px', right: '12px', width: 0, height: 0, borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderBottom: `52px solid ${f.bg}`, opacity: 0.8 }} />}
                {f.shape === 'hex' && <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '64px', height: '64px', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', background: f.border, opacity: 0.3 }} />}

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 'clamp(24px, 3vw, 32px)', marginBottom: '16px', display: 'inline-flex', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: `1px solid ${f.border}` }}>{f.icon}</div>
                  <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: 'clamp(16px, 2vw, 20px)', color: f.accent, marginBottom: '6px' }}>{f.title}</h2>
                  <p style={{ color: 'var(--muted)', fontSize: 'clamp(12px, 1.5vw, 14px)', lineHeight: 1.6, marginBottom: '20px' }}>{f.desc}</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: f.accent, fontSize: '13px', fontWeight: 600 }}>
                    Megnyitás <span>→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Napi tipp */}
        <div className="animate-fade-up delay-4" style={{ marginTop: 'var(--gap)', background: 'rgba(79,142,255,0.05)', border: '1px solid rgba(79,142,255,0.15)', borderRadius: 'var(--radius)', padding: 'clamp(20px, 2vw, 28px) clamp(20px, 3vw, 36px)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ fontSize: '24px', flexShrink: 0 }}>💡</div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Napi tipp</div>
            <div style={{ color: 'var(--muted)', fontSize: 'clamp(13px, 1.5vw, 14px)', lineHeight: 1.6 }}>
              A spaced repetition algoritmus akkor a leghatékonyabb ha minden nap legalább 10 percet töltesz a flashcardokkal — még ha csak pár kártyát nézel is át.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}