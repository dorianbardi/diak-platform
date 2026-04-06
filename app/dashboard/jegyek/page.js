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

  function calcAverage(gradeList) {
    const totalWeight = gradeList.reduce((sum, g) => sum + g.weight, 0)
    const weighted = gradeList.reduce((sum, g) => sum + g.grade * g.weight, 0)
    return totalWeight > 0 ? (weighted / totalWeight).toFixed(2) : 0
  }

  function calcOverallAverage() {
    if (grades.length === 0) return 0
    const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0)
    const weighted = grades.reduce((sum, g) => sum + g.grade * g.weight, 0)
    return totalWeight > 0 ? (weighted / totalWeight).toFixed(2) : 0
  }

  function getGradeColor(avg) {
    if (avg >= 4.5) return '#2dd4a0'
    if (avg >= 3.5) return '#4f8eff'
    if (avg >= 2.5) return '#f5c842'
    return '#ff6b6b'
  }

  function getGradeBadge(g) {
    const colors = {
      5: { color: '#2dd4a0', bg: 'rgba(45,212,160,0.12)', border: 'rgba(45,212,160,0.3)' },
      4: { color: '#4f8eff', bg: 'rgba(79,142,255,0.12)', border: 'rgba(79,142,255,0.3)' },
      3: { color: '#f5c842', bg: 'rgba(245,200,66,0.12)', border: 'rgba(245,200,66,0.3)' },
      2: { color: '#ff9f43', bg: 'rgba(255,159,67,0.12)', border: 'rgba(255,159,67,0.3)' },
      1: { color: '#ff6b6b', bg: 'rgba(255,107,107,0.12)', border: 'rgba(255,107,107,0.3)' },
    }
    return colors[g] || colors[1]
  }

  const groups = groupBySubject()
  const overall = calcOverallAverage()
  const subjectCount = Object.keys(groups).length

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(79,142,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      {/* Lebegő alakzatok */}
      <div style={{ position: 'fixed', top: '15%', right: '5%', width: '70px', height: '70px', border: '1px solid rgba(245,200,66,0.15)', borderRadius: '16px', transform: 'rotate(20deg)', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '20%', left: '4%', width: '50px', height: '50px', border: '1px solid rgba(79,142,255,0.12)', borderRadius: '50%', animation: 'float 9s ease-in-out infinite 2s', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '55%', right: '6%', width: '40px', height: '40px', background: 'rgba(245,200,66,0.05)', border: '1px solid rgba(245,200,66,0.15)', transform: 'rotate(45deg)', animation: 'float 8s ease-in-out infinite 1s', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '40%', left: '3%', width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderBottom: '38px solid rgba(245,200,66,0.06)', animation: 'float 10s ease-in-out infinite 3s', pointerEvents: 'none', zIndex: 0 }} />

      {/* Navbar */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 48px', height: '72px', background: 'rgba(8,11,20,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '13px' }}>← Dashboard</Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '16px' }}>📊 Jegykövetés</span>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
          + Új jegy
        </button>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '60px 48px' }}>

        {/* Header */}
        <div className="animate-fade-up delay-1" style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '12px', color: '#f5c842', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>✦ Eredmények</div>
          <h1 style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-1.5px', marginBottom: '8px' }}>Jegykövetés</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Súlyozott átlag, tantárgyankénti bontás.</p>
        </div>

        {/* Összesítő kártyák */}
        {grades.length > 0 && (
          <div className="animate-fade-up delay-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>

            {/* Átlag */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `radial-gradient(circle, ${getGradeColor(overall)}22, transparent)` }} />
              <div style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Összes átlag</div>
              <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: '56px', color: getGradeColor(overall), lineHeight: 1, letterSpacing: '-2px' }}>{overall}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px' }}>súlyozott átlag</div>
            </div>

            {/* Jegyek száma */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,255,0.15), transparent)' }} />
              <div style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Összes jegy</div>
              <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: '56px', color: '#4f8eff', lineHeight: 1, letterSpacing: '-2px' }}>{grades.length}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px' }}>beírt jegy</div>
            </div>

            {/* Tantárgyak */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,109,255,0.15), transparent)' }} />
              <div style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Tantárgyak</div>
              <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: '56px', color: '#9b6dff', lineHeight: 1, letterSpacing: '-2px' }}>{subjectCount}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px' }}>különböző tárgy</div>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="animate-fade-up delay-1" style={{ background: 'rgba(245,200,66,0.05)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: '24px', padding: '36px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '18px', marginBottom: '20px' }}>Új jegy hozzáadása</h2>
            <input className="input" placeholder="Tantárgy (pl. Matematika)" value={subject} onChange={e => setSubject(e.target.value)} style={{ marginBottom: '12px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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
            <input className="input" placeholder="Megjegyzés (pl. Témazáró)" value={description} onChange={e => setDescription(e.target.value)} style={{ marginBottom: '20px' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={addGrade} className="btn btn-primary">Hozzáadás</button>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">Mégse</button>
            </div>
          </div>
        )}

        {/* Jegyek */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)' }}>Betöltés...</div>
        ) : grades.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 48px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '22px', marginBottom: '12px' }}>Még nincs jegyed</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Add hozzá az első jegyed!</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Jegy hozzáadása</button>
          </div>
        ) : (
          <div className="animate-fade-up delay-3" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(groups).map(([subjectName, subjectGrades]) => {
              const avg = calcAverage(subjectGrades)
              const color = getGradeColor(avg)
              return (
                <div key={subjectName} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>

                  {/* Tantárgy fejléc */}
                  <div style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>{subjectName}</h2>
                      <p style={{ color: 'var(--muted)', fontSize: '13px' }}>{subjectGrades.length} jegy</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {/* Mini progress bar */}
                      <div style={{ width: '100px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', textAlign: 'right' }}>átlag</div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '100px', height: '4px' }}>
                          <div style={{ height: '100%', background: color, borderRadius: '100px', width: `${(avg / 5) * 100}%`, transition: 'width 0.4s' }} />
                        </div>
                      </div>
                      <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: '28px', color, minWidth: '52px', textAlign: 'right', letterSpacing: '-1px' }}>{avg}</div>
                    </div>
                  </div>

                  {/* Jegyek */}
                  <div style={{ padding: '16px 28px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {subjectGrades.map(g => {
                      const badge = getGradeBadge(g.grade)
                      return (
                        <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px 12px' }}>
                          <span style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: '18px', color: badge.color, background: badge.bg, border: `1px solid ${badge.border}`, padding: '2px 10px', borderRadius: '8px' }}>{g.grade}</span>
                          {g.description && <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{g.description}</span>}
                          <span style={{ color: 'var(--muted)', fontSize: '12px', opacity: 0.5 }}>{new Date(g.date).toLocaleDateString('hu-HU')}</span>
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