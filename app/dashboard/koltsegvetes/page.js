'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function KoltsegvetesPage() {
  const { user } = useUser()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Kaja')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const incomeCategories = ['Ösztöndíj', 'Zsebpénz', 'Munka', 'Egyéb bevétel']
  const expenseCategories = ['Kaja', 'Busz/Metró', 'Szórakozás', 'Ruha', 'Sport', 'Tanszer', 'Egyéb']

  useEffect(() => { if (user) fetchTransactions() }, [user])

  async function fetchTransactions() {
    const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false })
    setTransactions(data || [])
    setLoading(false)
  }

  async function addTransaction() {
    if (!amount || isNaN(amount)) return
    await supabase.from('transactions').insert({ user_id: user.id, type, amount: parseFloat(amount), category, description, date })
    setAmount(''); setDescription(''); setShowForm(false); fetchTransactions()
  }

  async function deleteTransaction(id) {
    await supabase.from('transactions').delete().eq('id', id); fetchTransactions()
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  function getCategoryTotals() {
    const totals = {}
    transactions.filter(t => t.type === 'expense').forEach(t => { totals[t.category] = (totals[t.category] || 0) + t.amount })
    return Object.entries(totals).sort((a, b) => b[1] - a[1])
  }

  function formatFt(amount) {
    return new Intl.NumberFormat('hu-HU').format(Math.round(amount)) + ' Ft'
  }

  const categoryTotals = getCategoryTotals()

  const categoryColors = {
    'Kaja': '#ff6b6b',
    'Busz/Metró': '#4f8eff',
    'Szórakozás': '#9b6dff',
    'Ruha': '#f5c842',
    'Sport': '#2dd4a0',
    'Tanszer': '#ff9f43',
    'Egyéb': '#a0aec0',
    'Ösztöndíj': '#2dd4a0',
    'Zsebpénz': '#4f8eff',
    'Munka': '#9b6dff',
    'Egyéb bevétel': '#f5c842',
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(79,142,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      {/* Lebegő alakzatok */}
      <div style={{ position: 'fixed', top: '15%', right: '5%', width: '70px', height: '70px', border: '1px solid rgba(155,109,255,0.15)', borderRadius: '16px', transform: 'rotate(20deg)', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '20%', left: '4%', width: '50px', height: '50px', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', border: '1px solid rgba(155,109,255,0.12)', animation: 'float 9s ease-in-out infinite 2s', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '50%', right: '6%', width: '45px', height: '45px', border: '1px solid rgba(155,109,255,0.1)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite 1s', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '35%', left: '3%', width: 0, height: 0, borderLeft: '24px solid transparent', borderRight: '24px solid transparent', borderBottom: '42px solid rgba(155,109,255,0.07)', animation: 'float 10s ease-in-out infinite 3s', pointerEvents: 'none', zIndex: 0 }} />

      {/* Navbar */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 48px', height: '72px', background: 'rgba(8,11,20,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '13px' }}>← Dashboard</Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '16px' }}>💰 Költségvetés</span>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
          + Új tétel
        </button>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '60px 48px' }}>

        {/* Header */}
        <div className="animate-fade-up delay-1" style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '12px', color: '#9b6dff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>✦ Pénzügyek</div>
          <h1 style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-1.5px', marginBottom: '8px' }}>Költségvetés</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Bevételeid és kiadásaid egy helyen.</p>
        </div>

        {/* Összesítő */}
        {transactions.length > 0 && (
          <div className="animate-fade-up delay-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(45,212,160,0.06)', border: '1px solid rgba(45,212,160,0.2)', borderRadius: '24px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,160,0.2), transparent)' }} />
              <div style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Bevétel</div>
              <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: '28px', color: '#2dd4a0', letterSpacing: '-1px' }}>{formatFt(totalIncome)}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px' }}>{transactions.filter(t => t.type === 'income').length} tétel</div>
            </div>

            <div style={{ background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: '24px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,107,0.2), transparent)' }} />
              <div style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Kiadás</div>
              <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: '28px', color: '#ff6b6b', letterSpacing: '-1px' }}>{formatFt(totalExpense)}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px' }}>{transactions.filter(t => t.type === 'expense').length} tétel</div>
            </div>

            <div style={{ background: balance >= 0 ? 'rgba(79,142,255,0.06)' : 'rgba(255,107,107,0.06)', border: `1px solid ${balance >= 0 ? 'rgba(79,142,255,0.2)' : 'rgba(255,107,107,0.2)'}`, borderRadius: '24px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `radial-gradient(circle, ${balance >= 0 ? 'rgba(79,142,255,0.2)' : 'rgba(255,107,107,0.2)'}, transparent)` }} />
              <div style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Egyenleg</div>
              <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: '28px', color: balance >= 0 ? '#4f8eff' : '#ff6b6b', letterSpacing: '-1px' }}>{formatFt(balance)}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px' }}>{balance >= 0 ? '✓ Pozitív' : '⚠ Negatív'}</div>
            </div>
          </div>
        )}

        {/* Kategória bontás */}
        {categoryTotals.length > 0 && (
          <div className="animate-fade-up delay-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '16px', marginBottom: '24px' }}>Kiadások kategóriánként</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categoryTotals.map(([cat, total]) => {
                const color = categoryColors[cat] || '#a0aec0'
                const pct = totalExpense > 0 ? (total / totalExpense) * 100 : 0
                return (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div style={{ width: '100px', fontSize: '14px', color: 'var(--muted)', flexShrink: 0 }}>{cat}</div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '100px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: color, borderRadius: '100px', width: `${pct}%`, transition: 'width 0.6s ease', opacity: 0.8 }} />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color, width: '110px', textAlign: 'right', flexShrink: 0 }}>{formatFt(total)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', width: '36px', textAlign: 'right', flexShrink: 0 }}>{Math.round(pct)}%</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="animate-fade-up delay-1" style={{ background: 'rgba(155,109,255,0.05)', border: '1px solid rgba(155,109,255,0.2)', borderRadius: '24px', padding: '36px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '18px', marginBottom: '20px' }}>Új tétel</h2>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {['expense', 'income'].map(t => (
                <button key={t} onClick={() => { setType(t); setCategory(t === 'expense' ? 'Kaja' : 'Ösztöndíj') }} style={{
                  flex: 1, padding: '12px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontFamily: 'Geist', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
                  background: type === t ? (t === 'expense' ? 'rgba(255,107,107,0.2)' : 'rgba(45,212,160,0.2)') : 'rgba(255,255,255,0.04)',
                  color: type === t ? (t === 'expense' ? '#ff6b6b' : '#2dd4a0') : 'var(--muted)',
                  border: `1px solid ${type === t ? (t === 'expense' ? 'rgba(255,107,107,0.3)' : 'rgba(45,212,160,0.3)') : 'var(--border)'}`,
                }}>
                  {t === 'expense' ? '📉 Kiadás' : '📈 Bevétel'}
                </button>
              ))}
            </div>

            <input className="input" type="number" placeholder="Összeg (Ft)" value={amount} onChange={e => setAmount(e.target.value)} style={{ marginBottom: '12px' }} />
            <select className="input" value={category} onChange={e => setCategory(e.target.value)} style={{ marginBottom: '12px' }}>
              {(type === 'expense' ? expenseCategories : incomeCategories).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="input" placeholder="Megjegyzés (opcionális)" value={description} onChange={e => setDescription(e.target.value)} style={{ marginBottom: '12px' }} />
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} style={{ marginBottom: '20px' }} />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={addTransaction} className="btn btn-primary">Hozzáadás</button>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">Mégse</button>
            </div>
          </div>
        )}

        {/* Tranzakciók */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)' }}>Betöltés...</div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 48px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>💰</div>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '22px', marginBottom: '12px' }}>Még nincs tranzakció</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Add hozzá az első tételed!</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Tétel hozzáadása</button>
          </div>
        ) : (
          <div className="animate-fade-up delay-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '16px' }}>Tranzakciók</h2>
              <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{transactions.length} tétel</span>
            </div>
            {transactions.map((t, i) => {
              const color = categoryColors[t.category] || '#a0aec0'
              return (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 28px',
                  borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}18`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                      {t.type === 'income' ? '📈' : '📉'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '2px' }}>{t.category}</div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {t.description && <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{t.description}</span>}
                        <span style={{ color: 'var(--muted)', fontSize: '12px', opacity: 0.5 }}>{new Date(t.date).toLocaleDateString('hu-HU')}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '16px', color: t.type === 'income' ? '#2dd4a0' : '#ff6b6b' }}>
                      {t.type === 'income' ? '+' : '-'}{formatFt(t.amount)}
                    </span>
                    <button onClick={() => deleteTransaction(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', opacity: 0.3, fontSize: '16px', transition: 'opacity 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0.3}
                    >🗑️</button>
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