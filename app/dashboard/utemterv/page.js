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
    const exam = new Date(examDate)
    return Math.ceil((exam - today) / (1000 * 60 * 60 * 24))
  }

  function generateSchedule(exam) {
    const daysLeft = getDaysLeft(exam.exam_date)
    const topics = exam.topics
    if (daysLeft <= 0 || topics.length === 0) return []
    const schedule = []
    const topicsPerDay = Math.ceil(topics.length / daysLeft)
    let topicIndex = 0
    for (let i = 0; i < Math.min(daysLeft, 7); i++) {
      const day = new Date(); day.setDate(day.getDate() + i)
      const dayTopics = topics.slice(topicIndex, topicIndex + topicsPerDay)
      topicIndex += topicsPerDay
      if (dayTopics.length > 0) {
        schedule.push({
          date: day.toLocaleDateString('hu-HU', { weekday: 'short', month: 'short', day: 'numeric' }),
          topics: dayTopics,
          isToday: i === 0,
        })
      }
    }
    return schedule
  }

  function getDaysLeftColor(days) {
    if (days <= 3) return '#ff6b6b'
    if (days <= 7) return '#f5c842'
    return '#2dd4a0'
  }

  function getDaysLeftBg(days) {
    if (days <= 3) return 'rgba(255,107,107,0.08)'
    if (days <= 7) return 'rgba(245,200,66,0.08)'
    return 'rgba(45,212,160,0.08)'
  }

  function getDaysLeftBorder(days) {
    if (days <= 3) return 'rgba(255,107,107,0.25)'
    if (days <= 7) return 'rgba(245,200,66,0.25)'
    return 'rgba(45,212,160,0.25)'
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(79,142,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      {/* Lebegő alakzatok */}
      <div style={{ position: 'fixed', top: '18%', right: '5%', width: '65px', height: '65px', border: '1px solid rgba(45,212,160,0.15)', borderRadius: '14px', transform: 'rotate(15deg)', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '25%', left: '4%', width: '45px', height: '45px', border: '1px solid rgba(79,142,255,0.12)', borderRadius: '50%', animation: 'float 9s ease-in-out infinite 2s', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '50%', right: '7%', width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderBottom: '38px solid rgba(155,109,255,0.08)', animation: 'float 8s ease-in-out infinite 1s', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '40%', left: '3%', width: '50px', height: '50px', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', border: '1px solid rgba(45,212,160,0.12)', animation: 'float 10s ease-in-out infinite 3s', pointerEvents: 'none', zIndex: 0 }} />

      {/* Navbar */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 48px', height: '72px', background: 'rgba(8,11,20,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '13px' }}>← Dashboard</Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '16px' }}>📅 Tanulási ütemterv</span>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
          + Új vizsga
        </button>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '60px 48px' }}>

        {/* Header */}
        <div className="animate-fade-up delay-1" style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '12px', color: '#2dd4a0', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>✦ Vizsgák & ütemterv</div>
          <h1 style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-1.5px', marginBottom: '8px' }}>Tanulási ütemterv</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Add meg a vizsgáidat — az oldal kiszámolja mikor mit kell tanulni.</p>
        </div>

        {/* Form */}
        {showForm && (
          <div className="animate-fade-up delay-1" style={{ background: 'rgba(45,212,160,0.05)', border: '1px solid rgba(45,212,160,0.2)', borderRadius: '24px', padding: '36px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '18px', marginBottom: '20px' }}>Új vizsga hozzáadása</h2>
            <input className="input" placeholder="Vizsga neve (pl. Történelem dolgozat)" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: '12px' }} />
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} style={{ marginBottom: '12px' }} />
            <input className="input" placeholder="Témák vesszővel: Francia forradalom, Napóleon, Bécsi kongresszus" value={topics} onChange={e => setTopics(e.target.value)} style={{ marginBottom: '12px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <label style={{ color: 'var(--muted)', fontSize: '14px' }}>Napi tanulási idő:</label>
              <select value={hoursPerDay} onChange={e => setHoursPerDay(Number(e.target.value))} className="input" style={{ width: 'auto' }}>
                {[0.5, 1, 1.5, 2, 3].map(h => <option key={h} value={h}>{h} óra</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={addExam} className="btn btn-primary">Hozzáadás</button>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">Mégse</button>
            </div>
          </div>
        )}

        {/* Vizsgák */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)' }}>Betöltés...</div>
        ) : exams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 48px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📅</div>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '22px', marginBottom: '12px' }}>Még nincs vizsgád</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Add hozzá az első vizsgádat!</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Vizsga hozzáadása</button>
          </div>
        ) : (
          <div className="animate-fade-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {exams.map(exam => {
              const daysLeft = getDaysLeft(exam.exam_date)
              const schedule = generateSchedule(exam)
              const color = getDaysLeftColor(daysLeft)
              const bg = getDaysLeftBg(daysLeft)
              const border = getDaysLeftBorder(daysLeft)

              return (
                <div key={exam.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden' }}>

                  {/* Vizsga fejléc */}
                  <div style={{ padding: '32px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: schedule.length > 0 ? '1px solid var(--border)' : 'none' }}>
                    <div>
                      <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '22px', marginBottom: '6px' }}>{exam.name}</h2>
                      <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                        {new Date(exam.exam_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                        <span style={{ margin: '0 8px', opacity: 0.3 }}>·</span>
                        {exam.topics.length} téma
                        <span style={{ margin: '0 8px', opacity: 0.3 }}>·</span>
                        {exam.hours_per_day} óra/nap
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '16px', padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: '32px', color, lineHeight: 1 }}>
                          {daysLeft <= 0 ? '⚠️' : daysLeft}
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px' }}>
                          {daysLeft <= 0 ? 'Lejárt' : 'nap van hátra'}
                        </div>
                      </div>
                      <button onClick={() => deleteExam(exam.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '16px', opacity: 0.4, transition: 'opacity 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0.4}
                      >🗑️</button>
                    </div>
                  </div>

                  {/* Ütemterv */}
                  {schedule.length > 0 && (
                    <div style={{ padding: '24px 36px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>📋 Következő 7 nap</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {schedule.map((day, i) => (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '16px',
                            background: day.isToday ? 'rgba(79,142,255,0.06)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${day.isToday ? 'rgba(79,142,255,0.2)' : 'var(--border)'}`,
                            borderRadius: '12px', padding: '12px 16px',
                          }}>
                            <div style={{ minWidth: '80px', fontSize: '13px', color: day.isToday ? 'var(--accent-blue)' : 'var(--muted)', fontWeight: day.isToday ? 600 : 400 }}>
                              {day.isToday ? '📍 Ma' : day.date}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {day.topics.map((topic, j) => (
                                <span key={j} style={{ background: 'rgba(45,212,160,0.08)', color: '#2dd4a0', border: '1px solid rgba(45,212,160,0.2)', fontSize: '12px', padding: '4px 12px', borderRadius: '100px', fontWeight: 500 }}>
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