'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function calculateNextReview(card, quality) {
  let { ease_factor, interval } = card
  if (quality >= 3) {
    if (interval === 1) interval = 6
    else interval = Math.round(interval * ease_factor)
    ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (ease_factor < 1.3) ease_factor = 1.3
  } else { interval = 1 }
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)
  return { ease_factor, interval, next_review: nextReview.toISOString() }
}

export default function StudyPage() {
  const { user } = useUser()
  const { deckId } = useParams()
  const [cards, setCards] = useState([])
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0 })
  const [deckName, setDeckName] = useState('')

  useEffect(() => { if (user) { fetchCards(); fetchDeck() } }, [user])

  async function fetchDeck() {
    const { data } = await supabase.from('flashcard_decks').select('name').eq('id', deckId).single()
    if (data) setDeckName(data.name)
  }

  async function fetchCards() {
    const now = new Date().toISOString()
    const { data } = await supabase.from('flashcards').select('*').eq('deck_id', deckId).lte('next_review', now).order('next_review', { ascending: true })
    setCards(data || [])
    setLoading(false)
  }

  async function rate(quality, label) {
    const card = cards[current]
    const updated = calculateNextReview(card, quality)
    await supabase.from('flashcards').update(updated).eq('id', card.id)
    setStats(prev => ({ ...prev, [label]: prev[label] + 1 }))
    setFlipped(false)
    if (current + 1 >= cards.length) setDone(true)
    else setCurrent(prev => prev + 1)
  }

  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--muted)' }}>Betöltés...</p>
    </div>
  )

  if (cards.length === 0) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', textAlign: 'center', padding: 'var(--pad-y) var(--pad-x)' }}>
        <div style={{ fontSize: '64px' }}>🎉</div>
        <h1 style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(24px, 4vw, 36px)', letterSpacing: '-1px' }}>Ma nincs több tanulnivaló!</h1>
        <p style={{ color: 'var(--muted)' }}>Minden kártya naprakész. Gyere vissza holnap!</p>
        <Link href={`/dashboard/flashcards/${deckId}`} style={{ textDecoration: 'none' }}>
          <button className="btn btn-primary">← Vissza a csomaghoz</button>
        </Link>
      </div>
    </div>
  )

  if (done) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '28px', padding: 'var(--pad-y) var(--pad-x)', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '64px', marginBottom: '12px' }}>🏆</div>
          <h1 style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(28px, 5vw, 48px)', letterSpacing: '-2px', marginBottom: '8px' }}>Tanulás kész!</h1>
          <p style={{ color: 'var(--muted)' }}>{cards.length} kártyát néztél át</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--gap)', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Könnyű', value: stats.easy, color: '#2dd4a0', bg: 'rgba(45,212,160,0.08)', border: 'rgba(45,212,160,0.2)' },
            { label: 'Közepes', value: stats.medium, color: '#f5c842', bg: 'rgba(245,200,66,0.08)', border: 'rgba(245,200,66,0.2)' },
            { label: 'Nehéz', value: stats.hard, color: '#ff6b6b', bg: 'rgba(255,107,107,0.08)', border: 'rgba(255,107,107,0.2)' },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 'var(--radius)', padding: 'clamp(20px, 3vw, 28px) clamp(28px, 4vw, 40px)', textAlign: 'center', minWidth: '110px' }}>
              <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(32px, 5vw, 48px)', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '6px' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <Link href={`/dashboard/flashcards/${deckId}`} style={{ textDecoration: 'none' }}>
          <button className="btn btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}>← Vissza a csomaghoz</button>
        </Link>
      </div>
    </div>
  )

  const card = cards[current]
  const progress = (current / cards.length) * 100

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(79,142,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <div style={{ position: 'fixed', top: '15%', right: '6%', width: 'clamp(40px, 5vw, 70px)', height: 'clamp(40px, 5vw, 70px)', border: '1px solid rgba(79,142,255,0.1)', borderRadius: '16px', transform: 'rotate(20deg)', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '20%', left: '5%', width: 'clamp(30px, 4vw, 50px)', height: 'clamp(30px, 4vw, 50px)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', border: '1px solid rgba(155,109,255,0.15)', animation: 'float 9s ease-in-out infinite 2s', pointerEvents: 'none', zIndex: 0 }} />

      <nav className="nav-bar">
        <Link href={`/dashboard/flashcards/${deckId}`} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '13px' }}>← Vissza</Link>
        <span style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '15px' }}>🧠 {deckName}</span>
        <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{current + 1} / {cards.length}</span>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto', padding: 'var(--pad-y) var(--pad-x)' }}>

        {/* Progress */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Haladás</span>
            <span style={{ fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 600 }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '100px', height: '6px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))', borderRadius: '100px', width: `${progress}%`, transition: 'width 0.4s ease', boxShadow: '0 0 12px rgba(79,142,255,0.5)' }} />
          </div>
        </div>

        {/* Kártya */}
        <div onClick={() => setFlipped(!flipped)} style={{
          background: flipped ? 'rgba(79,142,255,0.08)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${flipped ? 'rgba(79,142,255,0.3)' : 'var(--border)'}`,
          borderRadius: 'calc(var(--radius) + 4px)',
          padding: 'clamp(36px, 5vw, 60px) clamp(24px, 4vw, 48px)',
          minHeight: 'clamp(200px, 30vw, 280px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', cursor: 'pointer',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          marginBottom: 'var(--gap)', position: 'relative', overflow: 'hidden',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', border: `1px solid ${flipped ? 'rgba(79,142,255,0.2)' : 'var(--border)'}`, opacity: 0.5 }} />
          <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: flipped ? 'var(--accent-blue)' : 'var(--muted)', marginBottom: '20px', fontWeight: 600 }}>
            {flipped ? '✦ VÁLASZ' : '◈ KÉRDÉS'}
          </div>
          <p style={{ fontSize: 'clamp(16px, 3vw, 22px)', lineHeight: 1.6, fontWeight: 500, maxWidth: '500px' }}>
            {flipped ? card.answer : card.question}
          </p>
          {!flipped && (
            <div style={{ marginTop: '24px', fontSize: '13px', color: 'var(--muted)' }}>Kattints a válaszhoz</div>
          )}
        </div>

        {/* Értékelő gombok */}
        {flipped && (
          <div className="animate-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'var(--cols-3)', gap: 'var(--gap)' }}>
            {[
              { label: '😓 Nehéz', sub: 'Holnap újra', quality: 1, stat: 'hard', color: '#ff6b6b', bg: 'rgba(255,107,107,0.08)', border: 'rgba(255,107,107,0.25)' },
              { label: '🤔 Közepes', sub: 'Pár nap múlva', quality: 3, stat: 'medium', color: '#f5c842', bg: 'rgba(245,200,66,0.08)', border: 'rgba(245,200,66,0.25)' },
              { label: '😊 Könnyű', sub: '1 hét múlva', quality: 5, stat: 'easy', color: '#2dd4a0', bg: 'rgba(45,212,160,0.08)', border: 'rgba(45,212,160,0.25)' },
            ].map((b, i) => (
              <button key={i} onClick={() => rate(b.quality, b.stat)} style={{
                background: b.bg, border: `1px solid ${b.border}`,
                borderRadius: 'var(--radius)', padding: 'clamp(14px, 2vw, 20px) clamp(10px, 1.5vw, 16px)',
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span style={{ fontSize: 'clamp(12px, 1.5vw, 15px)', fontWeight: 600, color: b.color }}>{b.label}</span>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{b.sub}</span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}