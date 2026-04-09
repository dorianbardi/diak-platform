'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function UtemtervPage() {
  const { user } = useUser()
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [topics, setTopics] = useState('')
  const [hoursPerDay, setHoursPerDay] = useState(1)
  const [generatingPlan, setGeneratingPlan] = useState(null)
  const [expandedPlan, setExpandedPlan] = useState(null)
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [addingToCalendar, setAddingToCalendar] = useState(null)
  const [calendarSuccess, setCalendarSuccess] = useState(null)

  useEffect(() => {
    if (user) {
      fetchExams()
      checkCalendarConnection()
      // Ha visszajött a Google OAuth-ból
      const params = new URLSearchParams(window.location.search)
      if (params.get('calendar') === 'connected') {
        setCalendarConnected(true)
        window.history.replaceState({}, '', '/dashboard/utemterv')
      }
    }
  }, [user])

  async function checkCalendarConnection() {
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, action: 'check_connection' }),
      })
      const data = await res.json()
      setCalendarConnected(data.connected)
    } catch (e) { console.error(e) }
  }

  async function connectCalendar() {
    window.location.href = `/api/auth/google?state=${user.id}`
  }

  async function addToCalendar(exam) {
    setAddingToCalendar(exam.id)
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          action: 'add_exam',
          exam,
          studyPlan: exam.study_plan,
        }),
      })
      const data = await res.json()
      if (data.error) { alert('Hiba: ' + data.error); return }
      setCalendarSuccess(exam.id)
      setTimeout(() => setCalendarSuccess(null), 3000)
    } catch (e) { console.error(e); alert('Váratlan hiba!') }
    setAddingToCalendar(null)
  }

  async function fetchExams() {
    const { data } = await supabase.from('exams').select('*').eq('user_id', user.id).order('exam_date', { ascending: true })
    setExams(data || [])
    setLoading(false)
  }

  async function addExam() {
    if (!name.trim() || !date || !topics.trim()) return
    const topicList = topics.split(',').map(t => t.trim()).filter(Boolean)
    await supabase.from('exams').insert({ user_id: user.id, name, exam_date: date, topics: topicList, hours_per_day: hoursPerDay })
    setName(''); setDate(''); setTopics(''); setHoursPerDay(1); setShowForm(false); fetchExams()
  }

  async function deleteExam(id) {
    await supabase.from('exams').delete().eq('id', id); fetchExams()
  }

  async function generatePlan(exam) {
    setGeneratingPlan(exam.id)
    try {
      const { data: cards } = await supabase.from('flashcards').select('id').eq('user_id', user.id)
      const res = await fetch('/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examName: exam.name,
          examDate: exam.exam_date,
          topics: exam.topics,
          hoursPerDay: exam.hours_per_day,
          cardCount: cards?.length || 0,
        }),
      })
      const plan = await res.json()
      if (plan.error) { alert('Hiba: ' + plan.error); return }
      await supabase.from('exams').update({ study_plan: plan, completed_days: [] }).eq('id', exam.id)
      fetchExams()
      setExpandedPlan(exam.id)
    } catch (e) { console.error(e); alert('Váratlan hiba!') }
    setGeneratingPlan(null)
  }

  async function toggleDay(exam, dayIndex) {
    const completed = (exam.completed_days || []).map(Number)
    const newCompleted = completed.includes(dayIndex)
      ? completed.filter(d => d !== dayIndex)
      : [...completed, dayIndex]
    await supabase.from('exams').update({ completed_days: newCompleted }).eq('id', exam.id)
    fetchExams()
  }

  function getDaysLeft(examDate) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    return Math.ceil((new Date(examDate) - today) / (1000 * 60 * 60 * 24))
  }

  function getDaysLeftStyle(days) {
    if (days <= 3) return { color: '#ff6b6b', bg: 'rgba(255,107,107,0.08)', border: 'rgba(255,107,107,0.25)' }
    if (days <= 7) return { color: '#f5c842', bg: 'rgba(245,200,66,0.08)', border: 'rgba(245,200,66,0.25)' }
    return { color: '#2dd4a0', bg: 'rgba(45,212,160,0.08)', border: 'rgba(45,212,160,0.25)' }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(79,142,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <div style={{ position: 'fixed', top: '18%', right: '5%', width: 'clamp(40px, 5vw, 65px)', height: 'clamp(40px, 5vw, 65px)', border: '1px solid rgba(45,212,160,0.15)', borderRadius: '14px', transform: 'rotate(15deg)', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '25%', left: '4%', width: 'clamp(28px, 3vw, 45px)', height: 'clamp(28px, 3vw, 45px)', border: '1px solid rgba(79,142,255,0.12)', borderRadius: '50%', animation: 'float 9s ease-in-out infinite 2s', pointerEvents: 'none', zIndex: 0 }} />

      <nav className="nav-bar">
        <div className="nav-back">
          <Link href="/dashboard">← Dashboard</Link>
          <span className="nav-divider hide-mobile">|</span>
          <span className="nav-title hide-mobile">📅 Tanulási ütemterv</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Google Calendar kapcsolat */}
          {calendarConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#2dd4a0', background: 'rgba(45,212,160,0.08)', border: '1px solid rgba(45,212,160,0.2)', padding: '8px 14px', borderRadius: '12px' }}>
              <span>✓</span> Google Calendar
            </div>
          ) : (
            <button onClick={connectCalendar} className="btn btn-ghost" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📅 Google Calendar
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ padding: '10px 20px' }}>
            + Új vizsga
          </button>
        </div>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: 'var(--pad-y) var(--pad-x)' }}>

        <div className="animate-fade-up delay-1" style={{ marginBottom: '40px' }}>
          <div className="section-label" style={{ color: '#2dd4a0' }}>✦ Vizsgák & ütemterv</div>
          <h1 className="section-title">Tanulási ütemterv</h1>
          <p className="section-desc">Add meg a vizsgáidat — az AI részletes napi tervet készít!</p>
        </div>

        {/* Calendar banner ha nincs kapcsolat */}
        {!calendarConnected && (
          <div className="animate-fade-up delay-1" style={{ background: 'rgba(79,142,255,0.05)', border: '1px solid rgba(79,142,255,0.2)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 'var(--gap)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>📅</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>Kösd össze a Google Calendart!</div>
                <div style={{ color: 'var(--muted)', fontSize: '13px' }}>A vizsgák és tanulási napok automatikusan bekerülnek a naptáradba.</div>
              </div>
            </div>
            <button onClick={connectCalendar} className="btn btn-primary" style={{ fontSize: '13px', flexShrink: 0 }}>
              🔗 Összekötés
            </button>
          </div>
        )}

        {showForm && (
          <div className="animate-fade-up delay-1" style={{ background: 'rgba(45,212,160,0.05)', border: '1px solid rgba(45,212,160,0.2)', borderRadius: 'var(--radius)', padding: 'clamp(24px, 3vw, 36px)', marginBottom: 'var(--gap)' }}>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '18px', marginBottom: '16px' }}>Új vizsga hozzáadása</h2>
            <input className="input" placeholder="Vizsga neve (pl. Történelem dolgozat)" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: '10px' }} />
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} style={{ marginBottom: '10px' }} />
            <input className="input" placeholder="Témák vesszővel: Francia forradalom, Napóleon..." value={topics} onChange={e => setTopics(e.target.value)} style={{ marginBottom: '10px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <label style={{ color: 'var(--muted)', fontSize: '14px' }}>Napi tanulási idő:</label>
              <select value={hoursPerDay} onChange={e => setHoursPerDay(Number(e.target.value))} className="input" style={{ width: 'auto' }}>
                {[0.5, 1, 1.5, 2, 3].map(h => <option key={h} value={h}>{h} óra</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={addExam} className="btn btn-primary">Hozzáadás</button>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">Mégse</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)' }}>Betöltés...</div>
        ) : exams.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">📅</div>
            <h2>Még nincs vizsgád</h2>
            <p>Add hozzá az első vizsgádat!</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Vizsga hozzáadása</button>
          </div>
        ) : (
          <div className="animate-fade-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
            {exams.map(exam => {
              const daysLeft = getDaysLeft(exam.exam_date)
              const s = getDaysLeftStyle(daysLeft)
              const plan = exam.study_plan
              const completedDays = exam.completed_days || []
              const isExpanded = expandedPlan === exam.id

              return (
                <div key={exam.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>

                  {/* Vizsga fejléc */}
                  <div style={{ padding: 'clamp(20px, 2vw, 32px) clamp(20px, 3vw, 36px)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: 'clamp(16px, 2vw, 22px)', marginBottom: '6px' }}>{exam.name}</h2>
                      <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
                        {new Date(exam.exam_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                        <span style={{ margin: '0 6px', opacity: 0.3 }}>·</span>
                        {exam.topics.length} téma
                        <span style={{ margin: '0 6px', opacity: 0.3 }}>·</span>
                        {exam.hours_per_day} óra/nap
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                        {exam.topics.map((topic, i) => (
                          <span key={i} style={{ fontSize: '12px', color: '#2dd4a0', background: 'rgba(45,212,160,0.08)', border: '1px solid rgba(45,212,160,0.2)', padding: '3px 10px', borderRadius: '100px' }}>{topic}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
                      <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '14px', padding: 'clamp(10px, 1.5vw, 16px) clamp(16px, 2vw, 24px)', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(20px, 3vw, 32px)', color: s.color, lineHeight: 1 }}>
                          {daysLeft <= 0 ? '⚠️' : daysLeft}
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '4px' }}>
                          {daysLeft <= 0 ? 'Lejárt' : 'nap'}
                        </div>
                      </div>

                      {/* Google Calendar gomb */}
                      {calendarConnected && (
                        <button
                          onClick={() => addToCalendar(exam)}
                          disabled={addingToCalendar === exam.id}
                          style={{
                            background: calendarSuccess === exam.id ? 'rgba(45,212,160,0.1)' : 'rgba(79,142,255,0.08)',
                            border: `1px solid ${calendarSuccess === exam.id ? 'rgba(45,212,160,0.3)' : 'rgba(79,142,255,0.2)'}`,
                            borderRadius: '12px', padding: '8px 14px', cursor: 'pointer',
                            color: calendarSuccess === exam.id ? '#2dd4a0' : 'var(--accent-blue)',
                            fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', gap: '6px',
                          }}
                        >
                          {addingToCalendar === exam.id ? '⏳' : calendarSuccess === exam.id ? '✓ Hozzáadva!' : '📅 Naptárba'}
                        </button>
                      )}

                      {!plan ? (
                        <button onClick={() => generatePlan(exam)} disabled={generatingPlan === exam.id} className="btn btn-primary" style={{ fontSize: '13px', padding: '10px 16px' }}>
                          {generatingPlan === exam.id ? '⏳ Generálás...' : '🤖 AI Terv'}
                        </button>
                      ) : (
                        <button onClick={() => setExpandedPlan(isExpanded ? null : exam.id)} className="btn btn-ghost" style={{ fontSize: '13px', padding: '10px 16px' }}>
                          {isExpanded ? '▲ Bezár' : '📋 Terv'}
                        </button>
                      )}

                      <button onClick={() => deleteExam(exam.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', opacity: 0.4, transition: 'opacity 0.2s', fontSize: '16px' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0.4}
                      >🗑️</button>
                    </div>
                  </div>

                  {/* AI Terv */}
                  {plan && isExpanded && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: 'clamp(20px, 2vw, 28px) clamp(20px, 3vw, 36px)' }}>

                      <div style={{ background: 'rgba(79,142,255,0.05)', border: '1px solid rgba(79,142,255,0.2)', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--accent-blue)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>🤖 AI Összefoglaló</div>
                        <p style={{ color: 'var(--text)', fontSize: '14px', lineHeight: 1.7, marginBottom: '10px' }}>{plan.overview}</p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>📚 Prioritás: <strong style={{ color: 'var(--text)' }}>{plan.priority}</strong></span>
                          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>🃏 Napi kártyák: <strong style={{ color: 'var(--accent-blue)' }}>{plan.daily_cards} db</strong></span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Haladás</span>
                          <span style={{ fontSize: '13px', color: 'var(--accent-green)', fontWeight: 600 }}>{completedDays.length}/{plan.days?.length || 0} nap</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '100px', height: '6px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: 'linear-gradient(90deg, #2dd4a0, #4f8eff)', borderRadius: '100px', width: `${plan.days?.length ? (completedDays.length / plan.days.length) * 100 : 0}%`, transition: 'width 0.4s' }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {plan.days?.map((day, i) => {
                          const isDone = completedDays.includes(i)
                          return (
                            <div key={i} style={{
                              background: isDone ? 'rgba(45,212,160,0.06)' : 'rgba(255,255,255,0.02)',
                              border: `1px solid ${isDone ? 'rgba(45,212,160,0.25)' : 'var(--border)'}`,
                              borderRadius: '14px', padding: '16px 20px', transition: 'all 0.2s',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                <div onClick={() => toggleDay(exam, i)} style={{
                                  width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                                  background: isDone ? 'linear-gradient(135deg, #2dd4a0, #4f8eff)' : 'rgba(255,255,255,0.06)',
                                  border: `2px solid ${isDone ? 'transparent' : 'rgba(255,255,255,0.15)'}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '12px', transition: 'all 0.2s',
                                  boxShadow: isDone ? '0 0 12px rgba(45,212,160,0.4)' : 'none',
                                }}>
                                  {isDone && '✓'}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '14px', color: isDone ? '#2dd4a0' : 'var(--text)' }}>
                                      {day.day}. nap — {new Date(day.date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric', weekday: 'short' })}
                                    </span>
                                    <span style={{ fontSize: '11px', color: 'var(--muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '100px' }}>⏱ {day.hours} óra</span>
                                    {isDone && <span style={{ fontSize: '11px', color: '#2dd4a0', fontWeight: 600 }}>✓ Kész!</span>}
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                                    {day.topics?.map((topic, j) => (
                                      <span key={j} style={{ fontSize: '12px', color: '#2dd4a0', background: 'rgba(45,212,160,0.08)', border: '1px solid rgba(45,212,160,0.2)', padding: '3px 10px', borderRadius: '100px' }}>{topic}</span>
                                    ))}
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                                    {day.tasks?.map((task, j) => (
                                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: isDone ? 'var(--muted)' : 'var(--text)', textDecoration: isDone ? 'line-through' : 'none' }}>
                                        <span style={{ color: 'var(--accent-blue)', flexShrink: 0 }}>→</span>
                                        {task}
                                      </div>
                                    ))}
                                  </div>
                                  {day.motivation && (
                                    <div style={{ fontSize: '12px', color: 'var(--accent-yellow)', fontStyle: 'italic', opacity: 0.8 }}>
                                      💬 {day.motivation}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={() => generatePlan(exam)} disabled={generatingPlan === exam.id} className="btn btn-ghost" style={{ fontSize: '13px' }}>
                          {generatingPlan === exam.id ? '⏳ Generálás...' : '🔄 Terv újragenerálása'}
                        </button>
                        {calendarConnected && (
                          <button onClick={() => addToCalendar(exam)} disabled={addingToCalendar === exam.id} className="btn btn-ghost" style={{ fontSize: '13px', color: 'var(--accent-blue)' }}>
                            {addingToCalendar === exam.id ? '⏳ Hozzáadás...' : '📅 Naptárba mentés'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}