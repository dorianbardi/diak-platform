'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const colors = [
  { accent: '#4f8eff', border: 'rgba(79,142,255,0.2)', bg: 'rgba(79,142,255,0.05)' },
  { accent: '#9b6dff', border: 'rgba(155,109,255,0.2)', bg: 'rgba(155,109,255,0.05)' },
  { accent: '#2dd4a0', border: 'rgba(45,212,160,0.2)', bg: 'rgba(45,212,160,0.05)' },
  { accent: '#f5c842', border: 'rgba(245,200,66,0.2)', bg: 'rgba(245,200,66,0.05)' },
]

export default function FlashcardsPage() {
  const { user } = useUser()
  const [decks, setDecks] = useState([])
  const [newDeckName, setNewDeckName] = useState('')
  const [newDeckDesc, setNewDeckDesc] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { if (user) fetchDecks() }, [user])

  async function fetchDecks() {
    const { data } = await supabase.from('flashcard_decks').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setDecks(data || [])
    setLoading(false)
  }

  async function createDeck() {
    if (!newDeckName.trim()) return
    await supabase.from('flashcard_decks').insert({ user_id: user.id, name: newDeckName, description: newDeckDesc })
    setNewDeckName(''); setNewDeckDesc(''); setShowForm(false); fetchDecks()
  }

  async function deleteDeck(id) {
    await supabase.from('flashcard_decks').delete().eq('id', id); fetchDecks()
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(79,142,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <div style={{ position: 'fixed', top: '15%', right: '5%', width: 'clamp(40px, 5vw, 80px)', height: 'clamp(40px, 5vw, 80px)', border: '1px solid rgba(79,142,255,0.12)', borderRadius: '18px', transform: 'rotate(15deg)', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '20%', left: '4%', width: 'clamp(30px, 4vw, 50px)', height: 'clamp(30px, 4vw, 50px)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', border: '1px solid rgba(155,109,255,0.15)', animation: 'float 9s ease-in-out infinite 2s', pointerEvents: 'none', zIndex: 0 }} />

      <nav className="nav-bar">
        <div className="nav-back">
          <Link href="/dashboard">← Dashboard</Link>
          <span className="nav-divider">|</span>
          <span className="nav-title">🃏 Flashcardok</span>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ padding: '10px 20px' }}>
          + Új csomag
        </button>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: 'var(--pad-y) var(--pad-x)' }}>

        <div className="animate-fade-up delay-1" style={{ marginBottom: '40px' }}>
          <div className="section-label" style={{ color: 'var(--accent-blue)' }}>✦ Kártyacsomagok</div>
          <h1 className="section-title">Flashcardok</h1>
          <p className="section-desc">SM-2 spaced repetition algoritmussal — tanulj okosabban.</p>
        </div>

        {showForm && (
          <div className="animate-fade-up delay-1" style={{ background: 'rgba(79,142,255,0.05)', border: '1px solid rgba(79,142,255,0.2)', borderRadius: 'var(--radius)', padding: 'clamp(24px, 3vw, 36px)', marginBottom: 'var(--gap)' }}>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '18px', marginBottom: '16px' }}>Új kártyacsomag</h2>
            <input className="input" placeholder="Csomag neve (pl. Történelem)" value={newDeckName} onChange={e => setNewDeckName(e.target.value)} style={{ marginBottom: '10px' }} />
            <input className="input" placeholder="Leírás (opcionális)" value={newDeckDesc} onChange={e => setNewDeckDesc(e.target.value)} style={{ marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={createDeck} className="btn btn-primary">Létrehozás</button>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">Mégse</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)' }}>Betöltés...</div>
        ) : decks.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🃏</div>
            <h2>Még nincs csomagod</h2>
            <p>Hozd létre az első kártyacsomagodat!</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Első csomag létrehozása</button>
          </div>
        ) : (
          <div className="animate-fade-up delay-2 grid-2">
            {decks.map((deck, i) => {
              const c = colors[i % colors.length]
              return (
                <div key={deck.id} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 'var(--radius)', padding: 'clamp(24px, 3vw, 36px)', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '70px', height: '70px', borderRadius: '50%', border: `1px solid ${c.border}`, opacity: 0.5 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: 'clamp(16px, 2vw, 20px)', color: c.accent }}>{deck.name}</h2>
                    <button onClick={() => deleteDeck(deck.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '16px', opacity: 0.5, transition: 'opacity 0.2s', flexShrink: 0 }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                    >🗑️</button>
                  </div>
                  {deck.description && <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px', lineHeight: 1.6 }}>{deck.description}</p>}
                  <Link href={`/dashboard/flashcards/${deck.id}`} style={{ textDecoration: 'none' }}>
                    <button className="btn" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.accent, padding: '10px 20px', fontSize: '13px', fontWeight: 600 }}>
                      Megnyitás →
                    </button>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}