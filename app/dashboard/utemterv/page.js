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

  useEffect(() => {
    if (user) fetchExams()
  }, [user])

  async function fetchExams() {
    const { data } = await supabase
      .from('exams')
      .select('*')
      .eq('user_id', user.id)
      .order('exam_date', { ascending: true })
    setExams(data || [])
    setLoading(false)
  }

  async function addExam() {
    if (!name.trim() || !date || !topics.trim()) return
    const topicList = topics.split(',').map(t => t.trim()).filter(Boolean)
    await supabase.from('exams').insert({
      user_id: user.id,
      name,
      exam_date: date,
      topics: topicList,
      hours_per_day: hoursPerDay,
    })
    setName('')
    setDate('')
    setTopics('')
    setHoursPerDay(1)
    setShowForm(false)
    fetchExams()
  }

  async function deleteExam(id) {
    await supabase.from('exams').delete().eq('id', id)
    fetchExams()
  }

  function getDaysLeft(examDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const exam = new Date(examDate)
    const diff = Math.ceil((exam - today) / (1000 * 60 * 60 * 24))
    return diff
  }

  function generateSchedule(exam) {
    const daysLeft = getDaysLeft(exam.exam_date)
    const topics = exam.topics
    if (daysLeft <= 0 || topics.length === 0) return []

    const schedule = []
    const topicsPerDay = Math.ceil(topics.length / daysLeft)
    let topicIndex = 0

    for (let i = 0; i < Math.min(daysLeft, 7); i++) {
      const day = new Date()
      day.setDate(day.getDate() + i)
      const dayTopics = topics.slice(topicIndex, topicIndex + topicsPerDay)
      topicIndex += topicsPerDay
      if (dayTopics.length > 0) {
        schedule.push({
          date: day.toLocaleDateString('hu-HU', { weekday: 'short', month: 'short', day: 'numeric' }),
          topics: dayTopics,
        })
      }
    }
    return schedule
  }

  function getDaysLeftColor(days) {
    if (days <= 3) return 'text-red-400'
    if (days <= 7) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm mb-1 block">← Vissza</Link>
            <h1 className="text-3xl font-bold">📅 Tanulási ütemterv</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl font-medium transition"
          >
            + Új vizsga
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Új vizsga hozzáadása</h2>
            <input
              type="text"
              placeholder="Vizsga neve (pl. Történelem dolgozat)"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-gray-800 rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 ring-green-500"
            />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-gray-800 rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 ring-green-500"
            />
            <input
              type="text"
              placeholder="Témák vesszővel elválasztva (pl. Francia forradalom, Napóleon, Bécsi kongresszus)"
              value={topics}
              onChange={e => setTopics(e.target.value)}
              className="w-full bg-gray-800 rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 ring-green-500"
            />
            <div className="flex items-center gap-3 mb-4">
              <label className="text-gray-400 text-sm">Napi tanulási idő:</label>
              <select
                value={hoursPerDay}
                onChange={e => setHoursPerDay(Number(e.target.value))}
                className="bg-gray-800 rounded-xl px-4 py-2 outline-none focus:ring-2 ring-green-500"
              >
                {[0.5, 1, 1.5, 2, 3].map(h => (
                  <option key={h} value={h}>{h} óra</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={addExam} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl font-medium transition">
                Hozzáadás
              </button>
              <button onClick={() => setShowForm(false)} className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-xl font-medium transition">
                Mégse
              </button>
            </div>
          </div>
        )}

        {/* Vizsgák */}
        {loading ? (
          <p className="text-gray-400">Betöltés...</p>
        ) : exams.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-xl">Még nincs vizsgád hozzáadva</p>
            <p className="text-sm mt-2">Add hozzá az első vizsgádat!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {exams.map(exam => {
              const daysLeft = getDaysLeft(exam.exam_date)
              const schedule = generateSchedule(exam)
              return (
                <div key={exam.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{exam.name}</h2>
                      <p className="text-gray-400 text-sm mt-1">
                        {new Date(exam.exam_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getDaysLeftColor(daysLeft)}`}>
                          {daysLeft <= 0 ? 'Lejárt' : `${daysLeft} nap`}
                        </p>
                        <p className="text-gray-500 text-xs">van hátra</p>
                      </div>
                      <button onClick={() => deleteExam(exam.id)} className="text-gray-600 hover:text-red-500 transition">
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Ütemterv */}
                  {schedule.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-3">📋 Következő 7 nap ütemterve:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {schedule.map((day, i) => (
                          <div key={i} className="flex items-center gap-4 bg-gray-800 rounded-xl px-4 py-3">
                            <p className="text-sm text-gray-400 w-28 shrink-0">{day.date}</p>
                            <div className="flex flex-wrap gap-2">
                              {day.topics.map((topic, j) => (
                                <span key={j} className="bg-green-900 text-green-300 text-xs px-3 py-1 rounded-full">
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
      </div>
    </div>
  )
}