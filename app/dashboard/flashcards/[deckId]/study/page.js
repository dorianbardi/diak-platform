'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// Spaced repetition algoritmus (SM-2)
function calculateNextReview(card, quality) {
  let { ease_factor, interval } = card

  if (quality >= 3) {
    if (interval === 1) interval = 6
    else interval = Math.round(interval * ease_factor)
    ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (ease_factor < 1.3) ease_factor = 1.3
  } else {
    interval = 1
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return { ease_factor, interval, next_review: nextReview.toISOString() }
}

export default function StudyPage() {
  const { user } = useUser()
  const { deckId } = useParams()
  const [cards, setCards] = useState([])
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0 })

  useEffect(() => {
    if (user) fetchCards()
  }, [user])

  async function fetchCards() {
    const now = new Date().toISOString()
    const { data } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .lte('next_review', now)
      .order('next_review', { ascending: true })
    setCards(data || [])
    setLoading(false)
  }

  async function rate(quality, label) {
    const card = cards[current]
    const updated = calculateNextReview(card, quality)

    await supabase
      .from('flashcards')
      .update(updated)
      .eq('id', card.id)

    setStats(prev => ({ ...prev, [label]: prev[label] + 1 }))
    setFlipped(false)

    if (current + 1 >= cards.length) {
      setDone(true)
    } else {
      setCurrent(prev => prev + 1)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">Betöltés...</p>
    </div>
  )

  if (cards.length === 0) return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
      <div className="text-6xl">🎉</div>
      <h1 className="text-2xl font-bold">Ma nincs több tanulnivaló!</h1>
      <p className="text-gray-400">Minden kártya ismétlése naprakész.</p>
      <Link href={`/dashboard/flashcards/${deckId}`} className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-medium transition">
        ← Vissza a csomaghoz
      </Link>
    </div>
  )

  if (done) return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-6">
      <div className="text-6xl">🏆</div>
      <h1 className="text-3xl font-bold">Tanulás kész!</h1>
      <div className="flex gap-6 text-center">
        <div className="bg-green-900 rounded-2xl px-8 py-4">
          <p className="text-3xl font-bold text-green-400">{stats.easy}</p>
          <p className="text-sm text-gray-400 mt-1">Könnyű</p>
        </div>
        <div className="bg-yellow-900 rounded-2xl px-8 py-4">
          <p className="text-3xl font-bold text-yellow-400">{stats.medium}</p>
          <p className="text-sm text-gray-400 mt-1">Közepes</p>
        </div>
        <div className="bg-red-900 rounded-2xl px-8 py-4">
          <p className="text-3xl font-bold text-red-400">{stats.hard}</p>
          <p className="text-sm text-gray-400 mt-1">Nehéz</p>
        </div>
      </div>
      <Link href={`/dashboard/flashcards/${deckId}`} className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-medium transition mt-2">
        ← Vissza a csomaghoz
      </Link>
    </div>
  )

  const card = cards[current]

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href={`/dashboard/flashcards/${deckId}`} className="text-gray-400 hover:text-white text-sm">
            ← Vissza
          </Link>
          <p className="text-gray-400 text-sm">{current + 1} / {cards.length}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-8">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${((current) / cards.length) * 100}%` }}
          />
        </div>

        {/* Kártya */}
        <div
          onClick={() => setFlipped(!flipped)}
          className="bg-gray-900 border border-gray-800 rounded-3xl p-10 min-h-64 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition mb-6 text-center"
        >
          <p className="text-xs text-gray-500 mb-4 uppercase tracking-widest">
            {flipped ? 'Válasz' : 'Kérdés'}
          </p>
          <p className="text-2xl font-medium">
            {flipped ? card.answer : card.question}
          </p>
          {!flipped && (
            <p className="text-gray-600 text-sm mt-6">Kattints a válaszhoz</p>
          )}
        </div>

        {/* Értékelés gombok */}
        {flipped && (
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => rate(1, 'hard')}
              className="bg-red-900 hover:bg-red-800 border border-red-700 rounded-2xl py-4 font-medium transition"
            >
              😓 Nehéz
              <p className="text-xs text-gray-400 mt-1">Holnap újra</p>
            </button>
            <button
              onClick={() => rate(3, 'medium')}
              className="bg-yellow-900 hover:bg-yellow-800 border border-yellow-700 rounded-2xl py-4 font-medium transition"
            >
              🤔 Közepes
              <p className="text-xs text-gray-400 mt-1">Pár nap múlva</p>
            </button>
            <button
              onClick={() => rate(5, 'easy')}
              className="bg-green-900 hover:bg-green-800 border border-green-700 rounded-2xl py-4 font-medium transition"
            >
              😊 Könnyű
              <p className="text-xs text-gray-400 mt-1">1 hét múlva</p>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}