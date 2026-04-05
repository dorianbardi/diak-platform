'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DeckPage() {
  const { user } = useUser()
  const { deckId } = useParams()
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [flipped, setFlipped] = useState({})

  const [aiTopic, setAiTopic] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchDeck()
      fetchCards()
    }
  }, [user])

  async function fetchDeck() {
    const { data } = await supabase
      .from('flashcard_decks')
      .select('*')
      .eq('id', deckId)
      .single()
    setDeck(data)
  }

  async function fetchCards() {
    const { data } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .order('created_at', { ascending: false })
    setCards(data || [])
    setLoading(false)
  }

  async function addCard() {
    if (!question.trim() || !answer.trim()) return
    await supabase.from('flashcards').insert({
      deck_id: deckId,
      user_id: user.id,
      question,
      answer,
    })
    setQuestion('')
    setAnswer('')
    setShowForm(false)
    fetchCards()
  }

  async function deleteCard(id) {
    await supabase.from('flashcards').delete().eq('id', id)
    fetchCards()
  }

  async function generateWithAI() {
  if (!aiTopic.trim()) return
  setAiLoading(true)
  try {
    const res = await fetch('/api/generate-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: aiTopic, count: 10 }),
    })
    const data = await res.json()
    
    if (data.error) {
      alert('Hiba: ' + data.error)
      setAiLoading(false)
      return
    }

    for (const card of data.cards) {
      await supabase.from('flashcards').insert({
        deck_id: deckId,
        user_id: user.id,
        question: card.question,
        answer: card.answer,
      })
    }
    setAiTopic('')
    fetchCards()
  } catch (e) {
    console.error(e)
    alert('Váratlan hiba történt!')
  }
  setAiLoading(false)
}

  function toggleFlip(id) {
    setFlipped(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/dashboard/flashcards" className="text-gray-400 hover:text-white text-sm mb-1 block">← Vissza</Link>
            <h1 className="text-3xl font-bold">{deck?.name || 'Betöltés...'}</h1>
            {deck?.description && <p className="text-gray-400 mt-1">{deck.description}</p>}
          </div>
          <div className="flex gap-3">
            {cards.length > 0 && (
              <Link
                href={`/dashboard/flashcards/${deckId}/study`}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl font-medium transition"
              >
                🧠 Tanulás
              </Link>
            )}
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-medium transition"
            >
              + Új kártya
            </button>
          </div>
        </div>

{/* AI generálás */}
<div className="bg-gray-900 border border-blue-800 rounded-2xl p-6 mb-6">
  <h2 className="text-lg font-bold mb-1">🤖 AI kártyagenerálás</h2>
  <p className="text-gray-400 text-sm mb-4">Írj be egy témát és az AI generál 10 kártyát automatikusan!</p>
  <div className="flex gap-3">
    <input
      type="text"
      placeholder="pl. Francia forradalom, Másodfokú egyenletek..."
      value={aiTopic}
      onChange={e => setAiTopic(e.target.value)}
      className="flex-1 bg-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-blue-500"
    />
    <button
      onClick={generateWithAI}
      disabled={aiLoading}
      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-xl font-medium transition"
    >
      {aiLoading ? '⏳ Generálás...' : '✨ Generálás'}
    </button>
  </div>
</div>


        {/* Új kártya form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Új kártya</h2>
            <textarea
              placeholder="Kérdés"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              className="w-full bg-gray-800 rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 ring-blue-500 resize-none h-24"
            />
            <textarea
              placeholder="Válasz"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              className="w-full bg-gray-800 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 ring-blue-500 resize-none h-24"
            />
            <div className="flex gap-3">
              <button onClick={addCard} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl font-medium transition">
                Hozzáadás
              </button>
              <button onClick={() => setShowForm(false)} className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-xl font-medium transition">
                Mégse
              </button>
            </div>
          </div>
        )}

        {/* Kártyák */}
        {loading ? (
          <p className="text-gray-400">Betöltés...</p>
        ) : cards.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl">Még nincs kártya ebben a csomagban</p>
            <p className="text-sm mt-2">Adj hozzá egyet a + Új kártya gombbal!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {cards.map(card => (
              <div
                key={card.id}
                onClick={() => toggleFlip(card.id)}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-blue-500 transition min-h-36 flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs text-gray-500 mb-2">{flipped[card.id] ? 'VÁLASZ' : 'KÉRDÉS'}</p>
                  <p className="text-lg">{flipped[card.id] ? card.answer : card.question}</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-xs text-gray-600">Kattints a forgatáshoz</p>
                  <button
                    onClick={e => { e.stopPropagation(); deleteCard(card.id) }}
                    className="text-gray-600 hover:text-red-500 transition text-sm"
                  >
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