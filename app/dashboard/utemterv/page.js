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

  useEffect(() => { if (user) fetchExams() }, [user])

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

  function getDaysLeft(examDate) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    return Math.ceil((new Date(examDate) - today) / (1000 * 60 * 60 * 24))
  }

  function generateSchedule(exam) {
    const daysLeft = getDaysLeft(exam.exam_date)
    if (daysLeft <= 0 || exam.topics.length === 0) return []
    const schedule = []
    const topicsPerDay = Math.ceil(exam.topics.length / daysLeft)
    let topicIndex = 0
    for (let i = 0; i < Math.min(daysLeft, 7); i++) {
      const day = new Date(); day.setDate(day.getDate() + i)
      const dayTopics = exam.topics.slice(topicIndex, topicIndex + topicsPerDay)
      topicIndex += topicsPerDay
      if (dayTopics.length > 0) schedule.push({
        date: day.toLocaleDateString('hu-HU', { weekday: 'short', month: 'short', day: 'numeric' }),
        topics: dayTopics, isToday: i === 0,
      })
    }
    return schedule
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
      <div style={{ position: 'fixed', top: '50%', right: '7%', width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderBottom: '35px solid rgba(155,109,255,0.08)', animation: 'float 8s ease-in-out infinite 1s', pointerEvents: 'none', zIndex: 0 }} />

      <nav className="nav-bar">
        <div className="nav-back">
          <Link href="/dashboard">← Dashboard</Link>
          <span className="nav-divider hide-mobile">|</span>
          <span className="nav-title hide-mobile">📅 Tanulási ütemterv</span>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ padding: '10px 20px' }}>
          + Új vizsga
        </button>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: 'var(--pad-y) var(--pad-x)' }}>

        <div className="animate-fade-up delay-1" style={{ marginBottom: '40px' }}>
          <div className="section-label" style={{ color: '#2dd4a0' }}>✦ Vizsgák & ütemterv</div>
          <h1 className="section-title">Tanulási ütemterv</h1>
          <p className="section-desc">Add meg a vizsgáidat — az oldal kiszámolja mikor mit kell tanulni.</p>
        </div>

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
              const schedule = generateSchedule(exam)
              const s = getDaysLeftStyle(daysLeft)
              return (
                <div key={exam.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <div style={{ padding: 'clamp(20px, 2vw, 32px) clamp(20px, 3vw, 36px)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', borderBottom: schedule.length > 0 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: 'clamp(16px, 2vw, 22px)', marginBottom: '6px' }}>{exam.name}</h2>
                      <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
                        {new Date(exam.exam_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                        <span style={{ margin: '0 6px', opacity: 0.3 }}>·</span>
                        {exam.topics.length} téma
                        <span style={{ margin: '0 6px', opacity: 0.3 }}>·</span>
                        {exam.hours_per_day} óra/nap
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                      <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '14px', padding: 'clamp(10px, 1.5vw, 16px) clamp(16px, 2vw, 24px)', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(20px, 3vw, 32px)', color: s.color, lineHeight: 1 }}>
                          {daysLeft <= 0 ? '⚠️' : daysLeft}
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '4px' }}>
                          {daysLeft <= 0 ? 'Lejárt' : 'nap'}
                        </div>
                      </div>
                      <button onClick={() => deleteExam(exam.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', opacity: 0.4, transition: 'opacity 0.2s', fontSize: '16px' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0.4}
                      >🗑️</button>
                    </div>
                  </div>

                  {schedule.length > 0 && (
                    <div style={{ padding: 'clamp(16px, 2vw, 24px) clamp(20px, 3vw, 36px)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>📋 Következő 7 nap</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {schedule.map((day, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: day.isToday ? 'rgba(79,142,255,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${day.isToday ? 'rgba(79,142,255,0.2)' : 'var(--border)'}`, borderRadius: '12px', padding: 'clamp(10px, 1.5vw, 12px) clamp(12px, 2vw, 16px)', flexWrap: 'wrap' }}>
                            <div style={{ minWidth: '70px', fontSize: '13px', color: day.isToday ? 'var(--accent-blue)' : 'var(--muted)', fontWeight: day.isToday ? 600 : 400, flexShrink: 0 }}>
                              {day.isToday ? '📍 Ma' : day.date}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {day.topics.map((topic, j) => (
                                <span key={j} style={{ background: 'rgba(45,212,160,0.08)', color: '#2dd4a0', border: '1px solid rgba(45,212,160,0.2)', fontSize: '12px', padding: '3px 10px', borderRadius: '100px', fontWeight: 500 }}>
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
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