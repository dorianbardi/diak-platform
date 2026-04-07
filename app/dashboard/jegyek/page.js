'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function JegyekPage() {
  const { user } = useUser()
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState(5)
  const [weight, setWeight] = useState(1)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => { if (user) fetchGrades() }, [user])

  async function fetchGrades() {
    const { data } = await supabase.from('grades').select('*').eq('user_id', user.id).order('date', { ascending: false })
    setGrades(data || [])
    setLoading(false)
  }

  async function addGrade() {
    if (!subject.trim()) return
    await supabase.from('grades').insert({ user_id: user.id, subject, grade, weight, description, date })
    setSubject(''); setGrade(5); setWeight(1); setDescription(''); setDate(new Date().toISOString().split('T')[0]); setShowForm(false); fetchGrades()
  }

  async function deleteGrade(id) {
    await supabase.from('grades').delete().eq('id', id); fetchGrades()
  }

  function groupBySubject() {
    const groups = {}
    grades.forEach(g => { if (!groups[g.subject]) groups[g.subject] = []; groups[g.subject].push(g) })
    return groups
  }

  function calcAverage(list) {
    const tw = list.reduce((s, g) => s + g.weight, 0)
    const wg = list.reduce((s, g) => s + g.grade * g.weight, 0)
    return tw > 0 ? (wg / tw).toFixed(2) : 0
  }

  function calcOverall() {
    if (!grades.length) return 0
    const tw = grades.reduce((s, g) => s + g.weight, 0)
    const wg = grades.reduce((s, g) => s + g.grade * g.weight, 0)
    return tw > 0 ? (wg / tw).toFixed(2) : 0
  }

  function getColor(avg) {
    if (avg >= 4.5) return '#2dd4a0'
    if (avg >= 3.5) return '#4f8eff'
    if (avg >= 2.5) return '#f5c842'
    return '#ff6b6b'
  }

  function getBadge(g) {
    const map = {
      5: { color: '#2dd4a0', bg: 'rgba(45,212,160,0.12)', border: 'rgba(45,212,160,0.3)' },
      4: { color: '#4f8eff', bg: 'rgba(79,142,255,0.12)', border: 'rgba(79,142,255,0.3)' },
      3: { color: '#f5c842', bg: 'rgba(245,200,66,0.12)', border: 'rgba(245,200,66,0.3)' },
      2: { color: '#ff9f43', bg: 'rgba(255,159,67,0.12)', border: 'rgba(255,159,67,0.3)' },
      1: { color: '#ff6b6b', bg: 'rgba(255,107,107,0.12)', border: 'rgba(255,107,107,0.3)' },
    }
    return map[g] || map[1]
  }

  const groups = groupBySubject()
  const overall = calcOverall()

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(79,142,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <div style={{ position: 'fixed', top: '15%', right: '5%', width: 'clamp(40px, 5vw, 70px)', height: 'clamp(40px, 5vw, 70px)', border: '1px solid rgba(245,200,66,0.15)', borderRadius: '16px', transform: 'rotate(20deg)', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '20%', left: '4%', width: 'clamp(28px, 3vw, 50px)', height: 'clamp(28px, 3vw, 50px)', border: '1px solid rgba(79,142,255,0.12)', borderRadius: '50%', animation: 'float 9s ease-in-out infinite 2s', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '55%', right: '6%', width: 'clamp(24px, 3vw, 40px)', height: 'clamp(24px, 3vw, 40px)', background: 'rgba(245,200,66,0.05)', border: '1px solid rgba(245,200,66,0.15)', transform: 'rotate(45deg)', animation: 'float 8s ease-in-out infinite 1s', pointerEvents: 'none', zIndex: 0 }} />

      <nav className="nav-bar">
        <div className="nav-back">
          <Link href="/dashboard">← Dashboard</Link>
          <span className="nav-divider hide-mobile">|</span>
          <span className="nav-title hide-mobile">📊 Jegykövetés</span>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ padding: '10px 20px' }}>
          + Új jegy
        </button>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: 'var(--pad-y) var(--pad-x)' }}>

        <div className="animate-fade-up delay-1" style={{ marginBottom: '40px' }}>
          <div className="section-label" style={{ color: '#f5c842' }}>✦ Eredmények</div>
          <h1 className="section-title">Jegykövetés</h1>
          <p className="section-desc">Súlyozott átlag, tantárgyankénti bontás.</p>
        </div>

        {/* Összesítő */}
        {grades.length > 0 && (
          <div className="animate-fade-up delay-2 grid-3" style={{ marginBottom: 'var(--gap)' }}>
            {[
              { label: 'Összes átlag', value: overall, color: getColor(overall), glow: getColor(overall) },
              { label: 'Összes jegy', value: grades.length, color: '#4f8eff', glow: 'rgba(79,142,255,0.15)' },
              { label: 'Tantárgyak', value: Object.keys(groups).length, color: '#9b6dff', glow: 'rgba(155,109,255,0.15)' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(20px, 2vw, 32px)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `radial-gradient(circle, ${s.glow}22, transparent)` }} />
                <div style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>{s.label}</div>
                <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(32px, 5vw, 56px)', color: s.color, lineHeight: 1, letterSpacing: '-2px' }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="animate-fade-up delay-1" style={{ background: 'rgba(245,200,66,0.05)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 'var(--radius)', padding: 'clamp(24px, 3vw, 36px)', marginBottom: 'var(--gap)' }}>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '18px', marginBottom: '16px' }}>Új jegy hozzáadása</h2>
            <input className="input" placeholder="Tantárgy (pl. Matematika)" value={subject} onChange={e => setSubject(e.target.value)} style={{ marginBottom: '10px' }} />
            <div className="grid-3" style={{ marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px', display: 'block' }}>Jegy</label>
                <select className="input" value={grade} onChange={e => setGrade(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px', display: 'block' }}>Súly</label>
                <select className="input" value={weight} onChange={e => setWeight(Number(e.target.value))}>
                  {[0.5, 1, 1.5, 2, 3].map(w => <option key={w} value={w}>{w}x</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px', display: 'block' }}>Dátum</label>
                <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>
            <input className="input" placeholder="Megjegyzés (pl. Témazáró)" value={description} onChange={e => setDescription(e.target.value)} style={{ marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={addGrade} className="btn btn-primary">Hozzáadás</button>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">Mégse</button>
            </div>
          </div>
        )}

        {/* Jegyek */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)' }}>Betöltés...</div>
        ) : grades.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">📊</div>
            <h2>Még nincs jegyed</h2>
            <p>Add hozzá az első jegyed!</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Jegy hozzáadása</button>
          </div>
        ) : (
          <div className="animate-fade-up delay-3" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
            {Object.entries(groups).map(([subjectName, subjectGrades]) => {
              const avg = calcAverage(subjectGrades)
              const color = getColor(avg)
              return (
                <div key={subjectName} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <div style={{ padding: 'clamp(16px, 2vw, 24px) clamp(20px, 3vw, 28px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                      <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: 'clamp(15px, 2vw, 18px)', marginBottom: '2px' }}>{subjectName}</h2>
                      <p style={{ color: 'var(--muted)', fontSize: '13px' }}>{subjectGrades.length} jegy</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 'clamp(60px, 10vw, 100px)' }}>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '100px', height: '4px' }}>
                          <div style={{ height: '100%', background: color, borderRadius: '100px', width: `${(avg / 5) * 100}%`, transition: 'width 0.4s' }} />
                        </div>
                      </div>
                      <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(20px, 3vw, 28px)', color, minWidth: '48px', textAlign: 'right', letterSpacing: '-1px' }}>{avg}</div>
                    </div>
                  </div>
                  <div style={{ padding: 'clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 28px)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {subjectGrades.map(g => {
                      const badge = getBadge(g.grade)
                      return (
                        <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: '7px 10px' }}>
                          <span style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: '16px', color: badge.color, background: badge.bg, border: `1px solid ${badge.border}`, padding: '2px 8px', borderRadius: '6px' }}>{g.grade}</span>
                          {g.description && <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{g.description}</span>}
                          <span style={{ color: 'var(--muted)', fontSize: '11px', opacity: 0.5 }}>{new Date(g.date).toLocaleDateString('hu-HU')}</span>
                          <button onClick={() => deleteGrade(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', opacity: 0.3, fontSize: '14px', transition: 'opacity 0.2s', lineHeight: 1 }}
                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                            onMouseLeave={e => e.currentTarget.style.opacity = 0.3}
                          >×</button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}