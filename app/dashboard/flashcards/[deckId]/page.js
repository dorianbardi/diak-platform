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
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfFile, setPdfFile] = useState(null)

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
    await supabase.from('flashcards').insert({
      deck_id: deckId, user_id: user.id,
      question, answer, is_ai_generated: false,
    })
    setQuestion(''); setAnswer(''); setShowForm(false); fetchCards()
  }

  async function deleteCard(id) {
    await supabase.from('flashcards').delete().eq('id', id); fetchCards()
  }

  async function generateWithAI() {
    if (!aiTopic.trim()) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, count: 10 }),
      })
      const data = await res.json()
      if (data.error) { alert('Hiba: ' + data.error); setAiLoading(false); return }
      for (const card of data.cards) {
        await supabase.from('flashcards').insert({
          deck_id: deckId, user_id: user.id,
          question: card.question, answer: card.answer,
          is_ai_generated: true,
        })
      }
      setAiTopic(''); fetchCards()
    } catch (e) { console.error(e); alert('Váratlan hiba!') }
    setAiLoading(false)
  }

  async function generateFromPDF() {
    if (!pdfFile) return
    setPdfLoading(true)
    try {
      const formData = new FormData()
      formData.append('pdf', pdfFile)
      formData.append('count', '15')
      const res = await fetch('/api/pdf-to-cards', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) { alert('Hiba: ' + data.error); setPdfLoading(false); return }
      for (const card of data.cards) {
        await supabase.from('flashcards').insert({
          deck_id: deckId, user_id: user.id,
          question: card.question, answer: card.answer,
          is_ai_generated: true,
        })
      }
      setPdfFile(null); fetchCards()
    } catch (e) { console.error(e); alert('Váratlan hiba!') }
    setPdfLoading(false)
  }

  function toggleFlip(id) {
    setFlipped(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const aiCards = cards.filter(c => c.is_ai_generated)
  const manualCards = cards.filter(c => !c.is_ai_generated)

  function renderCard(card, isAi) {
    const isFlipped = flipped[card.id]
    const accentColor = isAi ? 'var(--accent-purple)' : 'var(--accent-blue)'
    const accentBg = isAi ? 'rgba(155,109,255,0.12)' : 'rgba(79,142,255,0.12)'
    const accentBorder = isAi ? 'rgba(155,109,255,0.25)' : 'rgba(79,142,255,0.25)'

    return (
      <div key={card.id} style={{ perspective: '1200px', cursor: 'pointer', height: '200px' }} onClick={() => toggleFlip(card.id)}>
        <div style={{
          position: 'relative', width: '100%', height: '100%',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>

          {/* Elő oldal — Kérdés */}
          <div style={{
            position: 'absolute', width: '100%', height: '100%',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            borderRadius: 'var(--radius)', padding: '24px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxSizing: 'border-box',
          }}>
            {/* Dekoratív kör */}
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: accentBg, border: `1px solid ${accentBorder}`, pointerEvents: 'none' }} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: accentColor, background: accentBg, border: `1px solid ${accentBorder}`, padding: '3px 10px', borderRadius: '100px' }}>
                    {isAi ? '🤖 AI' : '✍️ Saját'}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>KÉRDÉS</span>
                </div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: accentBg, border: `1px solid ${accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: accentColor, fontWeight: 700, flexShrink: 0 }}>?</div>
              </div>
              <p style={{ fontSize: 'clamp(13px, 1.6vw, 15px)', lineHeight: 1.7, color: 'var(--text)', fontWeight: 500 }}>{card.question}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--muted)', fontSize: '11px' }}>
                <span>👆</span> Kattints a válaszhoz
              </div>
              <button onClick={e => { e.stopPropagation(); deleteCard(card.id) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', opacity: 0.3, fontSize: '13px', transition: 'opacity 0.2s', padding: '4px' }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.3}
              >🗑️</button>
            </div>
          </div>

          {/* Hátsó oldal — Válasz */}
          <div style={{
            position: 'absolute', width: '100%', height: '100%',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            borderRadius: 'var(--radius)', padding: '24px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            overflow: 'hidden',
            background: isAi
              ? 'linear-gradient(135deg, rgba(155,109,255,0.15), rgba(155,109,255,0.05))'
              : 'linear-gradient(135deg, rgba(79,142,255,0.15), rgba(79,142,255,0.05))',
            border: `1px solid ${isAi ? 'rgba(155,109,255,0.4)' : 'rgba(79,142,255,0.4)'}`,
            boxShadow: `inset 0 0 40px ${isAi ? 'rgba(155,109,255,0.05)' : 'rgba(79,142,255,0.05)'}`,
            transform: 'rotateY(180deg)',
            boxSizing: 'border-box',
          }}>
            {/* Dekoratív kör */}
            <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: accentBg, pointerEvents: 'none' }} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: accentColor, background: accentBg, border: `1px solid ${accentBorder}`, padding: '3px 10px', borderRadius: '100px' }}>✓ VÁLASZ</span>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: accentBg, border: `1px solid ${accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: accentColor, fontWeight: 700, flexShrink: 0 }}>✓</div>
              </div>
              <p style={{ fontSize: 'clamp(13px, 1.6vw, 15px)', lineHeight: 1.7, color: 'var(--text)', fontWeight: 600 }}>{card.answer}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--muted)', fontSize: '11px' }}>
                <span>🔄</span> Kattints vissza
              </div>
              <button onClick={e => { e.stopPropagation(); deleteCard(card.id) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', opacity: 0.3, fontSize: '13px', transition: 'opacity 0.2s', padding: '4px' }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.3}
              >🗑️</button>
            </div>
          </div>

        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(79,142,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <div style={{ position: 'fixed', top: '20%', right: '5%', width: 'clamp(40px, 5vw, 60px)', height: 'clamp(40px, 5vw, 60px)', border: '1px solid rgba(79,142,255,0.12)', borderRadius: '14px', transform: 'rotate(20deg)', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '25%', left: '4%', width: 'clamp(28px, 3vw, 45px)', height: 'clamp(28px, 3vw, 45px)', border: '1px solid rgba(155,109,255,0.15)', borderRadius: '50%', animation: 'float 9s ease-in-out infinite 2s', pointerEvents: 'none', zIndex: 0 }} />

      <nav className="nav-bar">
        <div className="nav-back">
          <Link href="/dashboard/flashcards">← Vissza</Link>
          <span className="nav-divider hide-mobile">|</span>
          <span className="nav-title hide-mobile">{deck?.name || '...'}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {cards.length > 0 && (
            <Link href={`/dashboard/flashcards/${deckId}/study`} style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary" style={{ padding: '10px 16px', fontSize: '13px' }}>🧠 Tanulás</button>
            </Link>
          )}
          <button onClick={() => setShowForm(!showForm)} className="btn btn-ghost" style={{ padding: '10px 16px', fontSize: '13px' }}>+ Kártya</button>
        </div>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: 'var(--pad-y) var(--pad-x)' }}>

        <div className="animate-fade-up delay-1" style={{ marginBottom: '32px' }}>
          <div className="section-label" style={{ color: 'var(--accent-blue)' }}>✦ Kártyacsomag</div>
          <h1 className="section-title">{deck?.name}</h1>
          {deck?.description && <p className="section-desc">{deck.description}</p>}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: '100px' }}>
              {cards.length} kártya összesen
            </span>
            {aiCards.length > 0 && (
              <span style={{ fontSize: '13px', color: 'var(--accent-purple)', background: 'rgba(155,109,255,0.08)', border: '1px solid rgba(155,109,255,0.2)', padding: '4px 12px', borderRadius: '100px' }}>
                🤖 {aiCards.length} AI generált
              </span>
            )}
            {manualCards.length > 0 && (
              <span style={{ fontSize: '13px', color: 'var(--accent-blue)', background: 'rgba(79,142,255,0.08)', border: '1px solid rgba(79,142,255,0.2)', padding: '4px 12px', borderRadius: '100px' }}>
                ✍️ {manualCards.length} saját
              </span>
            )}
          </div>
        </div>

        {/* AI generálás témából */}
        <div className="animate-fade-up delay-2" style={{ background: 'rgba(79,142,255,0.05)', border: '1px solid rgba(79,142,255,0.2)', borderRadius: 'var(--radius)', padding: 'clamp(20px, 2vw, 28px) clamp(20px, 3vw, 32px)', marginBottom: 'var(--gap)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span>🤖</span>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '15px' }}>AI generálás — Témából</h2>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '12px' }}>Írj be egy témát és az AI 10 kártyát generál automatikusan.</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input className="input" placeholder="pl. Francia forradalom..." value={aiTopic} onChange={e => setAiTopic(e.target.value)} style={{ flex: 1, minWidth: '200px' }} />
            <button onClick={generateWithAI} disabled={aiLoading} className="btn btn-primary">
              {aiLoading ? '⏳ Generálás...' : '✨ Generálás'}
            </button>
          </div>
        </div>

        {/* PDF generálás */}
        <div className="animate-fade-up delay-2" style={{ background: 'rgba(155,109,255,0.05)', border: '1px solid rgba(155,109,255,0.2)', borderRadius: 'var(--radius)', padding: 'clamp(20px, 2vw, 28px) clamp(20px, 3vw, 32px)', marginBottom: 'var(--gap)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span>📄</span>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '15px' }}>AI generálás — PDF-ből</h2>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '12px' }}>Tölts fel egy PDF-et és az AI automatikusan generál belőle kártyákat!</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files[0])}
              style={{ flex: 1, minWidth: '200px', color: 'var(--muted)', fontSize: '13px' }} />
            <button onClick={generateFromPDF} disabled={pdfLoading || !pdfFile} className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, var(--accent-purple), #7b4fd4)' }}>
              {pdfLoading ? '⏳ Feldolgozás...' : '📄 Generálás'}
            </button>
          </div>
          {pdfFile && <p style={{ color: 'var(--accent-purple)', fontSize: '12px', marginTop: '8px' }}>✓ {pdfFile.name}</p>}
        </div>

        {/* Manuális kártya form */}
        {showForm && (
          <div className="animate-fade-up delay-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(20px, 2vw, 28px) clamp(20px, 3vw, 32px)', marginBottom: 'var(--gap)' }}>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '16px', marginBottom: '14px' }}>✍️ Új saját kártya</h2>
            <textarea className="input" placeholder="Kérdés" value={question} onChange={e => setQuestion(e.target.value)} style={{ marginBottom: '10px', height: '80px', resize: 'none' }} />
            <textarea className="input" placeholder="Válasz" value={answer} onChange={e => setAnswer(e.target.value)} style={{ marginBottom: '14px', height: '80px', resize: 'none' }} />
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={addCard} className="btn btn-primary">Hozzáadás</button>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">Mégse</button>
            </div>
          </div>
        )}

        {/* Kártyák */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)' }}>Betöltés...</div>
        ) : cards.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">📭</div>
            <h2>Még nincs kártya</h2>
            <p>Adj hozzá kártyákat manuálisan vagy generálj AI-jal!</p>
          </div>
        ) : (
          <div className="animate-fade-up delay-3">

            {/* AI kártyák */}
            {aiCards.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-purple)' }}>🤖 AI generált kártyák ({aiCards.length})</span>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(155,109,255,0.4), transparent)' }} />
                </div>
                <div className="grid-2">
                  {aiCards.map(card => renderCard(card, true))}
                </div>
              </div>
            )}

            {/* Saját kártyák */}
            {manualCards.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-blue)' }}>✍️ Saját kártyák ({manualCards.length})</span>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(79,142,255,0.4), transparent)' }} />
                </div>
                <div className="grid-2">
                  {manualCards.map(card => renderCard(card, false))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}