'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ExaminerPage() {
  const { user } = useUser()
  const { deckId } = useParams()
  const [cards, setCards] = useState([])
  const [deckName, setDeckName] = useState('')
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState('start') // start, question, evaluate, done
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluation, setEvaluation] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [results, setResults] = useState([])
  const [questionCount, setQuestionCount] = useState(0)
  const [maxQuestions, setMaxQuestions] = useState(5)

  useEffect(() => { if (user) fetchData() }, [user])

  async function fetchData() {
    const { data: deck } = await supabase.from('flashcard_decks').select('name').eq('id', deckId).single()
    if (deck) setDeckName(deck.name)
    const { data } = await supabase.from('flashcards').select('*').eq('deck_id', deckId)
    setCards(data || [])
    setLoading(false)
  }

  async function getNextQuestion() {
    setAiLoading(true)
    setUserAnswer('')
    setEvaluation(null)
    try {
      const res = await fetch('/api/examiner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'question', cards }),
      })
      const data = await res.json()
      if (data.error) { alert('Hiba: ' + data.error); return }
      setCurrentQuestion(data)
      setPhase('question')
    } catch (e) { console.error(e) }
    setAiLoading(false)
  }

  async function evaluateAnswer() {
  if (!userAnswer.trim()) return
  setAiLoading(true)

  // Streak + XP frissítése
  try {
    await fetch('/api/streak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id }),
    })
  } catch (e) { console.error(e) }

  try {
    const res = await fetch('/api/examiner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'evaluate',
        question: currentQuestion.question,
        correctAnswer: currentQuestion.correctAnswer,
        userAnswer,
      }),
    })
    const data = await res.json()
    if (data.error) { alert('Hiba: ' + data.error); return }
    setEvaluation(data)
    setResults(prev => [...prev, { ...currentQuestion, userAnswer, ...data }])
    setQuestionCount(prev => prev + 1)
    setPhase('evaluate')
  } catch (e) { console.error(e) }
  setAiLoading(false)
}

  function nextQuestion() {
    if (questionCount >= maxQuestions) {
      setPhase('done')
    } else {
      getNextQuestion()
    }
  }

  function restart() {
    setPhase('start')
    setResults([])
    setQuestionCount(0)
    setCurrentQuestion(null)
    setEvaluation(null)
    setUserAnswer('')
  }

  const avgScore = results.length > 0
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
    : 0

  const avgScore10 = results.length > 0
    ? (results.reduce((s, r) => s + r.score10, 0) / results.length).toFixed(1)
    : 0

  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--muted)' }}>Betöltés...</p>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(79,142,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <div style={{ position: 'fixed', top: '15%', right: '5%', width: 'clamp(40px,5vw,70px)', height: 'clamp(40px,5vw,70px)', border: '1px solid rgba(245,200,66,0.15)', borderRadius: '16px', transform: 'rotate(20deg)', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '20%', left: '4%', width: 'clamp(28px,3vw,50px)', height: 'clamp(28px,3vw,50px)', border: '1px solid rgba(79,142,255,0.12)', borderRadius: '50%', animation: 'float 9s ease-in-out infinite 2s', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '50%', right: '7%', width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderBottom: '35px solid rgba(155,109,255,0.08)', animation: 'float 8s ease-in-out infinite 1s', pointerEvents: 'none', zIndex: 0 }} />

      {/* Navbar */}
      <nav className="nav-bar">
        <div className="nav-back">
          <Link href={`/dashboard/flashcards/${deckId}`}>← Vissza</Link>
          <span className="nav-divider hide-mobile">|</span>
          <span className="nav-title hide-mobile">🎓 AI Vizsgáztató — {deckName}</span>
        </div>
        {phase !== 'start' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{questionCount} / {maxQuestions} kérdés</span>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '100px', height: '6px', width: '100px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))', borderRadius: '100px', width: `${(questionCount / maxQuestions) * 100}%`, transition: 'width 0.4s' }} />
            </div>
          </div>
        )}
      </nav>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', padding: 'var(--pad-y) var(--pad-x)' }}>

        {/* START */}
        {phase === 'start' && (
          <div className="animate-fade-up delay-1" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎓</div>
            <div className="section-label" style={{ color: 'var(--accent-yellow)', justifyContent: 'center', display: 'flex' }}>✦ AI Vizsgáztató</div>
            <h1 className="section-title" style={{ marginBottom: '12px' }}>{deckName}</h1>
            <p className="section-desc" style={{ marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
              Az AI kérdéseket tesz fel a kártyáid alapján, te szövegesen válaszolsz, ő pedig kiértékeli és pontozza a válaszaidat!
            </p>

            {cards.length === 0 ? (
              <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 'var(--radius)', padding: '24px', marginBottom: '24px' }}>
                <p style={{ color: '#ff6b6b' }}>⚠️ Nincsenek kártyák ebben a csomagban! Előbb adj hozzá kártyákat.</p>
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px', marginBottom: '32px', display: 'inline-block' }}>
                <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>Hány kérdést szeretnél?</p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[3, 5, 10, Math.min(cards.length, 15)].filter((v, i, a) => a.indexOf(v) === i).map(n => (
                    <button key={n} onClick={() => setMaxQuestions(n)} style={{
                      padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                      fontFamily: 'Geist', fontWeight: 600, fontSize: '15px', transition: 'all 0.2s',
                      background: maxQuestions === n ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' : 'rgba(255,255,255,0.05)',
                      color: maxQuestions === n ? 'white' : 'var(--muted)',
                      boxShadow: maxQuestions === n ? '0 4px 12px rgba(79,142,255,0.3)' : 'none',
                    }}>{n}</button>
                  ))}
                </div>
              </div>
            )}

            {cards.length > 0 && (
              <div>
                <button onClick={getNextQuestion} disabled={aiLoading} className="btn btn-primary" style={{ fontSize: '16px', padding: '16px 40px' }}>
                  {aiLoading ? '⏳ Betöltés...' : '🎓 Vizsgáztatás kezdése →'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* KÉRDÉS */}
        {phase === 'question' && currentQuestion && (
          <div className="animate-fade-up delay-1">
            <div style={{ background: 'rgba(79,142,255,0.06)', border: '1px solid rgba(79,142,255,0.2)', borderRadius: 'var(--radius)', padding: 'clamp(28px, 4vw, 48px)', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(79,142,255,0.06)', pointerEvents: 'none' }} />
              <div style={{ fontSize: '11px', color: 'var(--accent-blue)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '16px' }}>✦ {questionCount + 1}. kérdés</div>
              <p style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 700, lineHeight: 1.5, color: 'var(--text)' }}>{currentQuestion.question}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <textarea
                className="input"
                placeholder="Írd be a válaszod..."
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) evaluateAnswer() }}
                style={{ height: '140px', resize: 'none', fontSize: '15px', lineHeight: 1.7 }}
                autoFocus
              />
              <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>Ctrl + Enter a beküldéshez</p>
            </div>

            <button onClick={evaluateAnswer} disabled={aiLoading || !userAnswer.trim()} className="btn btn-primary" style={{ fontSize: '15px', padding: '14px 32px' }}>
              {aiLoading ? '⏳ Értékelés...' : '📤 Beküldés'}
            </button>
          </div>
        )}

        {/* ÉRTÉKELÉS */}
        {phase === 'evaluate' && evaluation && (
          <div className="animate-fade-up delay-1">

            {/* Pontszám */}
            <div style={{
              background: evaluation.correct ? 'rgba(45,212,160,0.08)' : 'rgba(255,107,107,0.08)',
              border: `1px solid ${evaluation.correct ? 'rgba(45,212,160,0.3)' : 'rgba(255,107,107,0.3)'}`,
              borderRadius: 'var(--radius)', padding: 'clamp(28px, 4vw, 48px)',
              marginBottom: '20px', textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: evaluation.correct ? 'rgba(45,212,160,0.06)' : 'rgba(255,107,107,0.06)', pointerEvents: 'none' }} />

              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{evaluation.correct ? '🎉' : '💪'}</div>

              {/* Nagy pontszám */}
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(48px, 8vw, 80px)', lineHeight: 1, color: evaluation.correct ? '#2dd4a0' : '#ff6b6b', letterSpacing: '-3px' }}>
                    {evaluation.score}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>/ 100 pont</div>
                </div>
                <div style={{ width: '1px', background: 'var(--border)', alignSelf: 'stretch' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(48px, 8vw, 80px)', lineHeight: 1, color: evaluation.correct ? '#2dd4a0' : '#ff6b6b', letterSpacing: '-3px' }}>
                    {evaluation.score10}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>/ 10 pont</div>
                </div>
              </div>

              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text)', maxWidth: '500px', margin: '0 auto' }}>{evaluation.feedback}</p>
            </div>

            {/* Helyes válasz */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Helyes válasz</div>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--accent-green)', fontWeight: 500 }}>{currentQuestion.correctAnswer}</p>
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>A te válaszod</div>
                <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)' }}>{userAnswer}</p>
              </div>
            </div>

            <button onClick={nextQuestion} className="btn btn-primary" style={{ fontSize: '15px', padding: '14px 32px' }}>
              {questionCount >= maxQuestions ? '📊 Eredmények megtekintése' : `Következő kérdés → (${questionCount}/${maxQuestions})`}
            </button>
          </div>
        )}

        {/* DONE */}
        {phase === 'done' && (
          <div className="animate-fade-up delay-1" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '72px', marginBottom: '20px' }}>🏆</div>
            <div className="section-label" style={{ color: 'var(--accent-yellow)', justifyContent: 'center', display: 'flex' }}>✦ Vizsga vége</div>
            <h1 style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(28px, 5vw, 48px)', letterSpacing: '-2px', marginBottom: '8px' }}>Gratulálok!</h1>
            <p style={{ color: 'var(--muted)', marginBottom: '40px' }}>{maxQuestions} kérdésre válaszoltál</p>

            {/* Összesített pontszám */}
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(79,142,255,0.08)', border: '1px solid rgba(79,142,255,0.2)', borderRadius: 'var(--radius)', padding: 'clamp(20px, 3vw, 32px) clamp(28px, 4vw, 48px)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(48px, 8vw, 80px)', color: 'var(--accent-blue)', lineHeight: 1, letterSpacing: '-3px' }}>{avgScore}</div>
                <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '6px' }}>átlag / 100</div>
              </div>
              <div style={{ background: 'rgba(155,109,255,0.08)', border: '1px solid rgba(155,109,255,0.2)', borderRadius: 'var(--radius)', padding: 'clamp(20px, 3vw, 32px) clamp(28px, 4vw, 48px)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(48px, 8vw, 80px)', color: 'var(--accent-purple)', lineHeight: 1, letterSpacing: '-3px' }}>{avgScore10}</div>
                <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '6px' }}>átlag / 10</div>
              </div>
              <div style={{ background: 'rgba(45,212,160,0.08)', border: '1px solid rgba(45,212,160,0.2)', borderRadius: 'var(--radius)', padding: 'clamp(20px, 3vw, 32px) clamp(28px, 4vw, 48px)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(48px, 8vw, 80px)', color: 'var(--accent-green)', lineHeight: 1, letterSpacing: '-3px' }}>
                  {results.filter(r => r.correct).length}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '6px' }}>helyes / {maxQuestions}</div>
              </div>
            </div>

            {/* Kérdések áttekintése */}
            <div style={{ textAlign: 'left', marginBottom: '32px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Kérdések áttekintése</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {results.map((r, i) => (
                  <div key={i} style={{
                    background: r.correct ? 'rgba(45,212,160,0.05)' : 'rgba(255,107,107,0.05)',
                    border: `1px solid ${r.correct ? 'rgba(45,212,160,0.2)' : 'rgba(255,107,107,0.2)'}`,
                    borderRadius: '14px', padding: '16px 20px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{r.question}</p>
                      <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Te: {r.userAnswer}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: '28px', color: r.correct ? '#2dd4a0' : '#ff6b6b', lineHeight: 1 }}>{r.score10}/10</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{r.score}/100</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={restart} className="btn btn-primary" style={{ fontSize: '15px', padding: '14px 32px' }}>🔄 Újra</button>
              <Link href={`/dashboard/flashcards/${deckId}`} style={{ textDecoration: 'none' }}>
                <button className="btn btn-ghost" style={{ fontSize: '15px', padding: '14px 32px' }}>← Vissza</button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}