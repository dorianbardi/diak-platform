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

  useEffect(() => {
    if (user) fetchTransactions()
  }, [user])

  async function fetchTransactions() {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    setTransactions(data || [])
    setLoading(false)
  }

  async function addTransaction() {
    if (!amount || isNaN(amount)) return
    await supabase.from('transactions').insert({
      user_id: user.id,
      type,
      amount: parseFloat(amount),
      category,
      description,
      date,
    })
    setAmount('')
    setDescription('')
    setShowForm(false)
    fetchTransactions()
  }

  async function deleteTransaction(id) {
    await supabase.from('transactions').delete().eq('id', id)
    fetchTransactions()
  }

  // Számítások
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  // Kategória összesítő
  function getCategoryTotals() {
    const totals = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount
    })
    return Object.entries(totals).sort((a, b) => b[1] - a[1])
  }

  function formatFt(amount) {
    return new Intl.NumberFormat('hu-HU').format(amount) + ' Ft'
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm mb-1 block">← Vissza</Link>
            <h1 className="text-3xl font-bold">💰 Költségvetés</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl font-medium transition"
          >
            + Új tétel
          </button>
        </div>

        {/* Összesítő */}
        {transactions.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-gray-400 text-sm mb-1">Bevétel</p>
              <p className="text-2xl font-bold text-green-400">{formatFt(totalIncome)}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-gray-400 text-sm mb-1">Kiadás</p>
              <p className="text-2xl font-bold text-red-400">{formatFt(totalExpense)}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-gray-400 text-sm mb-1">Egyenleg</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatFt(balance)}
              </p>
            </div>
          </div>
        )}

        {/* Kategória bontás */}
        {getCategoryTotals().length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <h2 className="font-bold mb-4">Kiadások kategóriánként</h2>
            <div className="flex flex-col gap-2">
              {getCategoryTotals().map(([cat, total]) => (
                <div key={cat} className="flex items-center gap-3">
                  <p className="text-gray-400 text-sm w-28 shrink-0">{cat}</p>
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.min((total / totalExpense) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm font-medium w-28 text-right">{formatFt(total)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Új tétel</h2>

            {/* Bevétel / Kiadás toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setType('expense'); setCategory('Kaja') }}
                className={`flex-1 py-2 rounded-xl font-medium transition ${type === 'expense' ? 'bg-red-600' : 'bg-gray-800'}`}
              >
                Kiadás
              </button>
              <button
                onClick={() => { setType('income'); setCategory('Ösztöndíj') }}
                className={`flex-1 py-2 rounded-xl font-medium transition ${type === 'income' ? 'bg-green-600' : 'bg-gray-800'}`}
              >
                Bevétel
              </button>
            </div>

            <input
              type="number"
              placeholder="Összeg (Ft)"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-gray-800 rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 ring-purple-500"
            />

            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-gray-800 rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 ring-purple-500"
            >
              {(type === 'expense' ? expenseCategories : incomeCategories).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Megjegyzés (opcionális)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-gray-800 rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 ring-purple-500"
            />

            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-gray-800 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 ring-purple-500"
            />

            <div className="flex gap-3">
              <button onClick={addTransaction} className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-xl font-medium transition">
                Hozzáadás
              </button>
              <button onClick={() => setShowForm(false)} className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-xl font-medium transition">
                Mégse
              </button>
            </div>
          </div>
        )}

        {/* Tranzakciók listája */}
        {loading ? (
          <p className="text-gray-400">Betöltés...</p>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">💰</div>
            <p className="text-xl">Még nincs tranzakciód</p>
            <p className="text-sm mt-2">Add hozzá az első tételt!</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {transactions.map((t, i) => (
              <div key={t.id} className={`flex items-center justify-between px-6 py-4 ${i !== transactions.length - 1 ? 'border-b border-gray-800' : ''}`}>
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{t.type === 'income' ? '📈' : '📉'}</span>
                  <div>
                    <p className="font-medium">{t.category}</p>
                    {t.description && <p className="text-gray-400 text-sm">{t.description}</p>}
                    <p className="text-gray-600 text-xs">{new Date(t.date).toLocaleDateString('hu-HU')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className={`font-bold text-lg ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatFt(t.amount)}
                  </p>
                  <button onClick={() => deleteTransaction(t.id)} className="text-gray-600 hover:text-red-500 transition">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}