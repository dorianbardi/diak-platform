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

  useEffect(() => {
    if (user) fetchGrades()
  }, [user])

  async function fetchGrades() {
    const { data } = await supabase
      .from('grades')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    setGrades(data || [])
    setLoading(false)
  }

  async function addGrade() {
    if (!subject.trim()) return
    await supabase.from('grades').insert({
      user_id: user.id,
      subject,
      grade,
      weight,
      description,
      date,
    })
    setSubject('')
    setGrade(5)
    setWeight(1)
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setShowForm(false)
    fetchGrades()
  }

  async function deleteGrade(id) {
    await supabase.from('grades').delete().eq('id', id)
    fetchGrades()
  }

  // Tantárgyak csoportosítása
  function groupBySubject() {
    const groups = {}
    grades.forEach(g => {
      if (!groups[g.subject]) groups[g.subject] = []
      groups[g.subject].push(g)
    })
    return groups
  }

  // Súlyozott átlag számítás
  function calcAverage(gradeList) {
    const totalWeight = gradeList.reduce((sum, g) => sum + g.weight, 0)
    const weighted = gradeList.reduce((sum, g) => sum + g.grade * g.weight, 0)
    return totalWeight > 0 ? (weighted / totalWeight).toFixed(2) : 0
  }

  // Összes átlag
  function calcOverallAverage() {
    if (grades.length === 0) return 0
    const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0)
    const weighted = grades.reduce((sum, g) => sum + g.grade * g.weight, 0)
    return totalWeight > 0 ? (weighted / totalWeight).toFixed(2) : 0
  }

  function getGradeColor(avg) {
    if (avg >= 4.5) return 'text-green-400'
    if (avg >= 3.5) return 'text-blue-400'
    if (avg >= 2.5) return 'text-yellow-400'
    return 'text-red-400'
  }

  function getGradeBg(grade) {
    if (grade === 5) return 'bg-green-900 text-green-300'
    if (grade === 4) return 'bg-blue-900 text-blue-300'
    if (grade === 3) return 'bg-yellow-900 text-yellow-300'
    if (grade === 2) return 'bg-orange-900 text-orange-300'
    return 'bg-red-900 text-red-300'
  }

  const groups = groupBySubject()
  const overall = calcOverallAverage()

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm mb-1 block">← Vissza</Link>
            <h1 className="text-3xl font-bold">📊 Jegyek</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-xl font-medium transition"
          >
            + Új jegy
          </button>
        </div>

        {/* Összes átlag */}
        {grades.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Összes átlag</p>
              <p className={`text-5xl font-bold mt-1 ${getGradeColor(overall)}`}>{overall}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">{grades.length} jegy</p>
              <p className="text-gray-400 text-sm">{Object.keys(groups).length} tantárgy</p>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Új jegy hozzáadása</h2>
            <input
              type="text"
              placeholder="Tantárgy (pl. Matematika)"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-gray-800 rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 ring-yellow-500"
            />
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Jegy</label>
                <select
                  value={grade}
                  onChange={e => setGrade(Number(e.target.value))}
                  className="w-full bg-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-yellow-500"
                >
                  {[5, 4, 3, 2, 1].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Súly</label>
                <select
                  value={weight}
                  onChange={e => setWeight(Number(e.target.value))}
                  className="w-full bg-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-yellow-500"
                >
                  {[0.5, 1, 1.5, 2, 3].map(w => (
                    <option key={w} value={w}>{w}x</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Dátum</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-yellow-500"
                />
              </div>
            </div>
            <input
              type="text"
              placeholder="Megjegyzés (pl. Témazáró)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-gray-800 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 ring-yellow-500"
            />
            <div className="flex gap-3">
              <button onClick={addGrade} className="bg-yellow-600 hover:bg-yellow-700 px-6 py-2 rounded-xl font-medium transition">
                Hozzáadás
              </button>
              <button onClick={() => setShowForm(false)} className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-xl font-medium transition">
                Mégse
              </button>
            </div>
          </div>
        )}

        {/* Jegyek tantárgyak szerint */}
        {loading ? (
          <p className="text-gray-400">Betöltés...</p>
        ) : grades.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl">Még nincs jegyed hozzáadva</p>
            <p className="text-sm mt-2">Add hozzá az első jegyed!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {Object.entries(groups).map(([subjectName, subjectGrades]) => (
              <div key={subjectName} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{subjectName}</h2>
                  <p className={`text-2xl font-bold ${getGradeColor(calcAverage(subjectGrades))}`}>
                    {calcAverage(subjectGrades)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {subjectGrades.map(g => (
                    <div key={g.id} className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2">
                      <span className={`font-bold text-lg px-2 py-0.5 rounded-lg ${getGradeBg(g.grade)}`}>
                        {g.grade}
                      </span>
                      {g.description && <span className="text-gray-400 text-sm">{g.description}</span>}
                      <span className="text-gray-600 text-xs">{new Date(g.date).toLocaleDateString('hu-HU')}</span>
                      <button
                        onClick={() => deleteGrade(g.id)}
                        className="text-gray-600 hover:text-red-500 transition ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}