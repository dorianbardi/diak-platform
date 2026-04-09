'use client'

import { useUser, UserButton } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ProfilePage() {
  const { user } = useUser()
  const [stats, setStats] = useState({ decks: 0, cards: 0, exams: 0, grades: 0, transactions: 0 })
  const [settings, setSettings] = useState({ notifications_enabled: true, language: 'hu' })
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => { if (user) { fetchStats(); fetchSettings() } }, [user])

  async function fetchStats() {
    const [decks, cards, exams, grades, transactions] = await Promise.all([
      supabase.from('flashcard_decks').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('flashcards').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('exams').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('grades').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('transactions').select('id', { count: 'exact' }).eq('user_id', user.id),
    ])
    setStats({
      decks: decks.count || 0,
      cards: cards.count || 0,
      exams: exams.count || 0,
      grades: grades.count || 0,
      transactions: transactions.count || 0,
    })
    setLoading(false)
  }

  async function fetchSettings() {
    const { data } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single()
    if (data) setSettings(data)
    else {
      await supabase.from('user_settings').insert({ user_id: user.id })
    }
  }

  async function saveSettings() {
    await supabase.from('user_settings').upsert({ user_id: user.id, ...settings })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const statItems = [
    { icon: '🃏', label: 'Flashcard csomag', value: stats.decks, color: '#4f8eff' },
    { icon: '📝', label: 'Összes kártya', value: stats.cards, color: '#9b6dff' },
    { icon: '📅', label: 'Vizsga', value: stats.exams, color: '#2dd4a0' },
    { icon: '📊', label: 'Beírt jegy', value: stats.grades, color: '#f5c842' },
    { icon: '💰', label: 'Tranzakció', value: stats.transactions, color: '#ff6b6b' },
  ]

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(79,142,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <div style={{ position: 'fixed', top: '15%', right: '5%', width: '60px', height: '60px', border: '1px solid rgba(79,142,255,0.12)', borderRadius: '14px', transform: 'rotate(20deg)', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '20%', left: '4%', width: '45px', height: '45px', border: '1px solid rgba(155,109,255,0.15)', borderRadius: '50%', animation: 'float 9s ease-in-out infinite 2s', pointerEvents: 'none', zIndex: 0 }} />

      {/* Navbar */}
      <nav className="nav-bar">
        <div className="nav-back">
          <Link href="/dashboard">← Dashboard</Link>
          <span className="nav-divider hide-mobile">|</span>
          <span className="nav-title hide-mobile">👤 Profilom</span>
        </div>
        <UserButton afterSignOutUrl="/" />
      </nav>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: 'var(--pad-y) var(--pad-x)' }}>

        {/* Header */}
        <div className="animate-fade-up delay-1" style={{ marginBottom: '40px' }}>
          <div className="section-label" style={{ color: 'var(--accent-blue)' }}>✦ Profil</div>
          <h1 className="section-title">Profilom</h1>
        </div>

        {/* Profil kártya */}
        <div className="animate-fade-up delay-2" style={{ background: 'rgba(79,142,255,0.05)', border: '1px solid rgba(79,142,255,0.2)', borderRadius: 'var(--radius)', padding: 'clamp(24px, 3vw, 40px)', marginBottom: 'var(--gap)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(79,142,255,0.06)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 800, color: 'white', overflow: 'hidden', border: '3px solid rgba(79,142,255,0.3)' }}>
                {user?.imageUrl
                  ? <img src={user.imageUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : user?.firstName?.[0]?.toUpperCase() || '?'
                }
              </div>
              <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#2dd4a0', border: '2px solid var(--bg)' }} />
            </div>

            {/* Név és email */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h2 style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(20px, 3vw, 28px)', marginBottom: '4px', letterSpacing: '-0.5px' }}>
                {user?.firstName} {user?.lastName}
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '12px' }}>
                {user?.emailAddresses?.[0]?.emailAddress}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: 'var(--accent-green)', background: 'rgba(45,212,160,0.1)', border: '1px solid rgba(45,212,160,0.2)', padding: '3px 10px', borderRadius: '100px' }}>
                  ✓ Aktív fiók
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: '100px' }}>
                  📅 {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('hu-HU') : ''} óta tag
                </span>
              </div>
            </div>

            {/* Clerk profil szerkesztés gomb */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: { width: '40px', height: '40px' }
                  }
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Profil szerkesztése</span>
            </div>
          </div>
        </div>

        {/* Statisztikák */}
        <div className="animate-fade-up delay-3" style={{ marginBottom: 'var(--gap)' }}>
          <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '18px', marginBottom: '16px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '12px' }}>📊 Statisztikák</h2>
          <div className="grid-3" style={{ gap: '12px' }}>
            {statItems.map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(16px, 2vw, 24px)', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '50px', height: '50px', borderRadius: '50%', background: `${s.color}15`, pointerEvents: 'none' }} />
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(24px, 4vw, 36px)', color: s.color, lineHeight: 1, letterSpacing: '-1px' }}>{loading ? '...' : s.value}</div>
                <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '6px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Beállítások */}
        <div className="animate-fade-up delay-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 'var(--gap)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '16px' }}>⚙️ Beállítások</h2>
          </div>

          {/* Értesítések */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>🔔 Email értesítések</div>
              <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Napi emlékeztető a tanuláshoz</div>
            </div>
            <div onClick={() => setSettings(s => ({ ...s, notifications_enabled: !s.notifications_enabled }))} style={{
              width: '48px', height: '26px', borderRadius: '100px', cursor: 'pointer',
              background: settings.notifications_enabled ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' : 'rgba(255,255,255,0.1)',
              position: 'relative', transition: 'all 0.3s', flexShrink: 0,
              boxShadow: settings.notifications_enabled ? '0 0 12px rgba(79,142,255,0.4)' : 'none',
            }}>
              <div style={{
                position: 'absolute', top: '3px',
                left: settings.notifications_enabled ? '25px' : '3px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'white', transition: 'left 0.3s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </div>
          </div>

          {/* Nyelv */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>🌍 Nyelv</div>
              <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Az oldal megjelenítési nyelve</div>
            </div>
            <select value={settings.language} onChange={e => setSettings(s => ({ ...s, language: e.target.value }))} className="input" style={{ width: 'auto' }}>
              <option value="hu">🇭🇺 Magyar</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>

          {/* Mentés gomb */}
          <div style={{ padding: '20px 24px' }}>
            <button onClick={saveSettings} className="btn btn-primary" style={{ fontSize: '14px' }}>
              {saved ? '✓ Mentve!' : 'Beállítások mentése'}
            </button>
          </div>
        </div>

        {/* Gyors linkek */}
        <div className="animate-fade-up delay-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 'var(--gap)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '16px' }}>🔗 Gyors linkek</h2>
          </div>
          {[
            { href: '/dashboard/flashcards', icon: '🃏', label: 'Flashcardok', desc: 'Kártyacsomagjaid kezelése' },
            { href: '/dashboard/jegyek', icon: '📊', label: 'Jegyek', desc: 'Eredményeid áttekintése' },
            { href: '/dashboard/utemterv', icon: '📅', label: 'Ütemterv', desc: 'Vizsgáid tervezése' },
            { href: '/dashboard/koltsegvetes', icon: '💰', label: 'Költségvetés', desc: 'Pénzügyeid kezelése' },
          ].map((item, i) => (
            <Link key={i} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{ padding: '16px 24px', borderBottom: i < 3 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: '16px', transition: 'background 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.label}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{item.desc}</div>
                </div>
                <span style={{ color: 'var(--muted)', fontSize: '16px' }}>→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Veszélyzóna */}
        <div className="animate-fade-up delay-5" style={{ background: 'rgba(255,107,107,0.04)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,107,107,0.15)' }}>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '16px', color: '#ff6b6b' }}>⚠️ Veszélyzóna</h2>
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Fiók törlése</div>
              <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Minden adatod véglegesen törlődik</div>
            </div>
            <button onClick={() => { if (confirm('Biztosan törölni szeretnéd a fiókodat? Ez visszavonhatatlan!')) { alert('Kérjük írj emailt: dorianbardi@gmail.com') } }}
              style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontFamily: 'Geist', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,107,107,0.1)'}
            >
              🗑️ Fiók törlése
            </button>
          </div>
        </div>

      </main>
    </div>
  )
}