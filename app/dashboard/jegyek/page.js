'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

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
  const [analysis, setAnalysis] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(true)

  useEffect(() => { if (user) fetchGrades() }, [user])

  async function fetchGrades() {
    const { data } = await supabase.from('grades').select('*').eq('user_id', user.id).order('date', { ascending: true })
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

  async function analyzeGrades() {
    if (grades.length === 0) return
    setAnalysisLoading(true)
    setShowAnalysis(true)
    try {
      const subjects = [...new Set(grades.map(g => g.subject))]
      const res = await fetch('/api/grade-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grades, subjects }),
      })
      const data = await res.json()
      if (data.error) { alert('Hiba: ' + data.error); return }
      setAnalysis(data)
    } catch (e) { console.error(e); alert('Váratlan hiba!') }
    setAnalysisLoading(false)
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

  function getTrend(subjectGrades) {
    if (subjectGrades.length < 2) return null
    const recent = subjectGrades.slice(-2)
    if (recent[1].grade > recent[0].grade) return { icon: '↑', color: '#2dd4a0', label: 'Javul' }
    if (recent[1].grade < recent[0].grade) return { icon: '↓', color: '#ff6b6b', label: 'Romlik' }
    return { icon: '→', color: '#f5c842', label: 'Stabil' }
  }

  function neededForFive(subjectGrades) {
    const avg = parseFloat(calcAverage(subjectGrades))
    if (avg >= 4.5) return null
    const totalWeight = subjectGrades.reduce((s, g) => s + g.weight, 0)
    const weighted = subjectGrades.reduce((s, g) => s + g.grade * g.weight, 0)
    const needed = Math.ceil((4.5 * (totalWeight + 1) - weighted))
    if (needed > 5) return null
    return needed
  }

  function getChartData() {
    const sorted = [...grades].sort((a, b) => new Date(a.date) - new Date(b.date))
    return sorted.map((g, i) => {
      const upToNow = sorted.slice(0, i + 1)
      const avg = calcAverage(upToNow)
      return {
        name: new Date(g.date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }),
        átlag: parseFloat(avg),
        jegy: g.grade,
      }
    })
  }

  const groups = groupBySubject()
  const overall = calcOverall()
  const chartData = getChartData()

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(79,142,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <div style={{ position: 'fixed', top: '15%', right: '5%', width: 'clamp(40px, 5vw, 70px)', height: 'clamp(40px, 5vw, 70px)', border: '1px solid rgba(245,200,66,0.15)', borderRadius: '16px', transform: 'rotate(20deg)', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '20%', left: '4%', width: 'clamp(28px, 3vw, 50px)', height: 'clamp(28px, 3vw, 50px)', border: '1px solid rgba(79,142,255,0.12)', borderRadius: '50%', animation: 'float 9s ease-in-out infinite 2s', pointerEvents: 'none', zIndex: 0 }} />

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
          <p className="section-desc">Súlyozott átlag, trend elemzés, AI előrejelzés.</p>
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

        {/* Chart + AI gombok */}
        {grades.length >= 2 && (
          <div className="animate-fade-up delay-2" style={{ display: 'flex', gap: '10px', marginBottom: 'var(--gap)', flexWrap: 'wrap' }}>
            <button onClick={() => setShowChart(!showChart)} className="btn btn-ghost" style={{ fontSize: '13px' }}>
              {showChart ? '▲ Chart bezárása' : '📈 Átlag chart megtekintése'}
            </button>
            <button onClick={analyzeGrades} disabled={analysisLoading} className="btn btn-primary" style={{ fontSize: '13px', background: 'linear-gradient(135deg, #f5c842, #ff9f43)', boxShadow: '0 4px 20px rgba(245,200,66,0.3)' }}>
              {analysisLoading ? '⏳ Elemzés...' : '🤖 AI Előrejelzés'}
            </button>
          </div>
        )}

        {/* Chart */}
        {showChart && chartData.length >= 2 && (
          <div className="animate-fade-up delay-1" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(20px, 2vw, 28px)', marginBottom: 'var(--gap)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '15px' }}>📈 Átlag alakulása</h2>
              <button onClick={() => setShowChart(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '18px', opacity: 0.5, transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
              >✕</button>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: '#6b7a99', fontSize: 12 }} />
                <YAxis domain={[1, 5]} tick={{ fill: '#6b7a99', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid rgba(79,142,255,0.2)', borderRadius: '10px', color: '#f0f4ff' }} />
                <ReferenceLine y={4.5} stroke="rgba(45,212,160,0.3)" strokeDasharray="4 4" />
                <ReferenceLine y={2.5} stroke="rgba(255,107,107,0.3)" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="átlag" stroke="#4f8eff" strokeWidth={2} dot={{ fill: '#4f8eff', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* AI Elemzés */}
        {analysis && showAnalysis && (
          <div className="animate-fade-up delay-1" style={{ background: 'rgba(245,200,66,0.05)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 'var(--radius)', padding: 'clamp(20px, 2vw, 28px)', marginBottom: 'var(--gap)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,200,66,0.15), transparent)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '20px' }}>🤖</span>
              <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '16px' }}>AI Előrejelzés</h2>
              <span style={{ fontSize: '11px', color: '#f5c842', background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)', padding: '2px 10px', borderRadius: '100px', fontWeight: 600 }}>
                Előrejelzett átlag: {analysis.predicted_average}
              </span>
              <button onClick={() => setShowAnalysis(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '18px', opacity: 0.5, transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
              >✕</button>
            </div>

            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '16px' }}>{analysis.overall_analysis}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {analysis.subjects?.map((s, i) => (
                <div key={i} style={{ background: s.alert ? 'rgba(255,107,107,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${s.alert ? 'rgba(255,107,107,0.2)' : 'var(--border)'}`, borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '14px' }}>{s.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: s.trend === 'improving' ? '#2dd4a0' : s.trend === 'declining' ? '#ff6b6b' : '#f5c842' }}>
                      {s.trend === 'improving' ? '↑ Javul' : s.trend === 'declining' ? '↓ Romlik' : '→ Stabil'}
                    </span>
                    {s.alert && <span style={{ fontSize: '11px', color: '#ff6b6b', fontWeight: 600 }}>⚠️ Figyelj rá!</span>}
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '6px' }}>{s.analysis}</p>
                  {s.needed_for_5 && <p style={{ color: '#f5c842', fontSize: '12px', fontWeight: 500 }}>🎯 {s.needed_for_5}</p>}
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(79,142,255,0.06)', border: '1px solid rgba(79,142,255,0.2)', borderRadius: '12px', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>💡</span>
              <p style={{ color: 'var(--text)', fontSize: '13px', lineHeight: 1.6 }}>{analysis.top_tip}</p>
            </div>
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
              const trend = getTrend(subjectGrades)
              const needed = neededForFive(subjectGrades)

              return (
                <div key={subjectName} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <div style={{ padding: 'clamp(16px, 2vw, 24px) clamp(20px, 3vw, 28px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: 'clamp(15px, 2vw, 18px)' }}>{subjectName}</h2>
                        {trend && (
                          <span style={{ fontSize: '12px', fontWeight: 700, color: trend.color, background: `${trend.color}15`, border: `1px solid ${trend.color}30`, padding: '2px 8px', borderRadius: '100px' }}>
                            {trend.icon} {trend.label}
                          </span>
                        )}
                      </div>
                      {needed && (
                        <p style={{ fontSize: '12px', color: '#f5c842' }}>🎯 Az ötöshez még ~{needed} pont értékű jegy kell</p>
                      )}
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