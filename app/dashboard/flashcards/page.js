'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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

  const colors = [
    { accent: '#4f8eff', border: 'rgba(79,142,255,0.2)', bg: 'rgba(79,142,255,0.05)' },
    { accent: '#9b6dff', border: 'rgba(155,109,255,0.2)', bg: 'rgba(155,109,255,0.05)' },
    { accent: '#2dd4a0', border: 'rgba(45,212,160,0.2)', bg: 'rgba(45,212,160,0.05)' },
    { accent: '#f5c842', border: 'rgba(245,200,66,0.2)', bg: 'rgba(245,200,66,0.05)' },
  ]

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      <div className="orb orb-1" /><div className="orb orb-2" />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(79,142,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      {/* Lebegő alakzatok */}
      <div style={{ position: 'fixed', top: '15%', right: '5%', width: '80px', height: '80px', border: '1px solid rgba(79,142,255,0.12)', borderRadius: '18px', transform: 'rotate(15deg)', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '20%', left: '4%', width: '50px', height: '50px', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', border: '1px solid rgba(155,109,255,0.15)', background: 'rgba(155,109,255,0.04)', animation: 'float 9s ease-in-out infinite 2s', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '50%', left: '3%', width: '40px', height: '40px', border: '1px solid rgba(45,212,160,0.15)', borderRadius: '50%', animation: 'float 6s ease-in-out infinite 1s', pointerEvents: 'none', zIndex: 0 }} />

      {/* Navbar */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 48px', height: '72px', background: 'rgba(8,11,20,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ← Dashboard
          </Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '16px' }}>🃏 Flashcardok</span>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
          + Új csomag
        </button>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '60px 48px' }}>

        {/* Header */}
        <div className="animate-fade-up delay-1" style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '12px', color: 'var(--accent-blue)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>✦ Kártyacsomagok</div>
          <h1 style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-1.5px', marginBottom: '8px' }}>Flashcardok</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>SM-2 spaced repetition algoritmussal — tanulj okosabban.</p>
        </div>

        {/* Form */}
        {showForm && (
          <div className="animate-fade-up delay-1" style={{ background: 'rgba(79,142,255,0.05)', border: '1px solid rgba(79,142,255,0.2)', borderRadius: '24px', padding: '36px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '18px', marginBottom: '20px' }}>Új kártyacsomag</h2>
            <input className="input" placeholder="Csomag neve (pl. Történelem)" value={newDeckName} onChange={e => setNewDeckName(e.target.value)} style={{ marginBottom: '12px' }} />
            <input className="input" placeholder="Leírás (opcionális)" value={newDeckDesc} onChange={e => setNewDeckDesc(e.target.value)} style={{ marginBottom: '20px' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={createDeck} className="btn btn-primary">Létrehozás</button>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">Mégse</button>
            </div>
          </div>
        )}

        {/* Csomagok */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)' }}>Betöltés...</div>
        ) : decks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 48px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🃏</div>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '24px', marginBottom: '12px' }}>Még nincs csomagod</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Hozd létre az első kártyacsomagodat!</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Első csomag létrehozása</button>
          </div>
        ) : (
          <div className="animate-fade-up delay-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {decks.map((deck, i) => {
              const c = colors[i % colors.length]
              return (
                <div key={deck.id} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '24px', padding: '36px', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s', cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {/* Dekoratív elem */}
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '70px', height: '70px', borderRadius: '50%', border: `1px solid ${c.border}`, opacity: 0.5 }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '20px', color: c.accent }}>{deck.name}</h2>
                    <button onClick={() => deleteDeck(deck.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '16px', opacity: 0.5, transition: 'opacity 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                    >🗑️</button>
                  </div>

                  {deck.description && <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>{deck.description}</p>}

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