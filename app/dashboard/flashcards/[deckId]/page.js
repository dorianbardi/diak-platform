'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DeckPage() {
  const { user } = useUser()
  const { deckId } = useParams()
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [flipped, setFlipped] = useState({})
  const [aiTopic, setAiTopic] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => { if (user) { fetchDeck(); fetchCards() } }, [user])

  async function fetchDeck() {
    const { data } = await supabase.from('flashcard_decks').select('*').eq('id', deckId).single()
    setDeck(data)
  }

  async function fetchCards() {
    const { data } = await supabase.from('flashcards').select('*').eq('deck_id', deckId).order('created_at', { ascending: false })
    setCards(data || [])
    setLoading(false)
  }

  async function addCard() {
    if (!question.trim() || !answer.trim()) return
    await supabase.from('flashcards').insert({ deck_id: deckId, user_id: user.id, question, answer })
    setQuestion(''); setAnswer(''); setShowForm(false); fetchCards()
  }

  async function deleteCard(id) {
    await supabase.from('flashcards').delete().eq('id', id); fetchCards()
  }

  async function generateWithAI() {
    if (!aiTopic.trim()) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/generate-cards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: aiTopic, count: 10 }) })
      const data = await res.json()
      if (data.error) { alert('Hiba: ' + data.error); setAiLoading(false); return }
      for (const card of data.cards) {
        await supabase.from('flashcards').insert({ deck_id: deckId, user_id: user.id, question: card.question, answer: card.answer })
      }
      setAiTopic(''); fetchCards()
    } catch (e) { console.error(e); alert('Váratlan hiba!') }
    setAiLoading(false)
  }

  function toggleFlip(id) { setFlipped(prev => ({ ...prev, [id]: !prev[id] })) }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      <div className="orb orb-1" /><div className="orb orb-2" />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(79,142,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      {/* Lebegő alakzatok */}
      <div style={{ position: 'fixed', top: '20%', right: '5%', width: '60px', height: '60px', border: '1px solid rgba(79,142,255,0.12)', borderRadius: '14px', transform: 'rotate(20deg)', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '25%', left: '4%', width: '45px', height: '45px', border: '1px solid rgba(155,109,255,0.15)', borderRadius: '50%', animation: 'float 9s ease-in-out infinite 2s', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '60%', right: '6%', width: '35px', height: '35px', background: 'rgba(45,212,160,0.05)', border: '1px solid rgba(45,212,160,0.15)', transform: 'rotate(45deg)', animation: 'float 8s ease-in-out infinite 1s', pointerEvents: 'none', zIndex: 0 }} />

      {/* Navbar */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 48px', height: '72px', background: 'rgba(8,11,20,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard/flashcards" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '13px' }}>← Vissza</Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '16px' }}>{deck?.name || '...'}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {cards.length > 0 && (
            <Link href={`/dashboard/flashcards/${deckId}/study`} style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>🧠 Tanulás</button>
            </Link>
          )}
          <button onClick={() => setShowForm(!showForm)} className="btn btn-ghost" style={{ padding: '10px 20px', fontSize: '14px' }}>+ Új kártya</button>
        </div>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '60px 48px' }}>

        {/* Header */}
        <div className="animate-fade-up delay-1" style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '12px', color: 'var(--accent-blue)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>✦ Kártyacsomag</div>
          <h1 style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1.5px', marginBottom: '8px' }}>{deck?.name}</h1>
          {deck?.description && <p style={{ color: 'var(--muted)', fontSize: '15px' }}>{deck.description}</p>}
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: '100px' }}>
              {cards.length} kártya
            </span>
          </div>
        </div>

        {/* AI generálás */}
        <div className="animate-fade-up delay-2" style={{ background: 'rgba(79,142,255,0.05)', border: '1px solid rgba(79,142,255,0.2)', borderRadius: '20px', padding: '28px 32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '18px' }}>🤖</span>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '16px' }}>AI kártyagenerálás</h2>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px' }}>Írj be egy témát és az AI generál 10 kártyát automatikusan.</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input className="input" placeholder="pl. Francia forradalom, Másodfokú egyenletek..." value={aiTopic} onChange={e => setAiTopic(e.target.value)} style={{ flex: 1 }} />
            <button onClick={generateWithAI} disabled={aiLoading} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
              {aiLoading ? '⏳ Generálás...' : '✨ Generálás'}
            </button>
          </div>
        </div>

        {/* Új kártya form */}
        {showForm && (
          <div className="animate-fade-up delay-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px 32px', marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>Új kártya</h2>
            <textarea className="input" placeholder="Kérdés" value={question} onChange={e => setQuestion(e.target.value)} style={{ marginBottom: '12px', height: '90px', resize: 'none' }} />
            <textarea className="input" placeholder="Válasz" value={answer} onChange={e => setAnswer(e.target.value)} style={{ marginBottom: '16px', height: '90px', resize: 'none' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={addCard} className="btn btn-primary">Hozzáadás</button>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">Mégse</button>
            </div>
          </div>
        )}

        {/* Kártyák */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)' }}>Betöltés...</div>
        ) : cards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 48px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '22px', marginBottom: '12px' }}>Még nincs kártya</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Adj hozzá kártyákat vagy generálj AI-jal!</p>
          </div>
        ) : (
          <div className="animate-fade-up delay-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {cards.map(card => (
              <div key={card.id} onClick={() => toggleFlip(card.id)} style={{
                background: flipped[card.id] ? 'rgba(79,142,255,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${flipped[card.id] ? 'rgba(79,142,255,0.3)' : 'var(--border)'}`,
                borderRadius: '20px', padding: '28px', cursor: 'pointer',
                minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(79,142,255,0.3)'}
                onMouseLeave={e => { if (!flipped[card.id]) e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: flipped[card.id] ? 'var(--accent-blue)' : 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 600 }}>
                    {flipped[card.id] ? 'VÁLASZ' : 'KÉRDÉS'}
                  </div>
                  <p style={{ fontSize: '15px', lineHeight: 1.6 }}>{flipped[card.id] ? card.answer : card.question}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Kattints a forgatáshoz</span>
                  <button onClick={e => { e.stopPropagation(); deleteCard(card.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '14px', opacity: 0.4, transition: 'opacity 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.4}
                  >🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}