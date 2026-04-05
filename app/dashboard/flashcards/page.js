'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function FlashcardsPage() {
  const { user } = useUser()
  const [decks, setDecks] = useState([])
  const [newDeckName, setNewDeckName] = useState('')
  const [newDeckDesc, setNewDeckDesc] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (user) fetchDecks()
  }, [user])

  async function fetchDecks() {
    const { data } = await supabase
      .from('flashcard_decks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setDecks(data || [])
    setLoading(false)
  }

  async function createDeck() {
    if (!newDeckName.trim()) return
    await supabase.from('flashcard_decks').insert({
      user_id: user.id,
      name: newDeckName,
      description: newDeckDesc,
    })
    setNewDeckName('')
    setNewDeckDesc('')
    setShowForm(false)
    fetchDecks()
  }

  async function deleteDeck(id) {
    await supabase.from('flashcard_decks').delete().eq('id', id)
    fetchDecks()
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm mb-1 block">← Vissza</Link>
            <h1 className="text-3xl font-bold">🃏 Flashcardok</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-medium transition"
          >
            + Új csomag
          </button>
        </div>

        {/* Új csomag form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Új kártyacsomag</h2>
            <input
              type="text"
              placeholder="Csomag neve (pl. Történelem)"
              value={newDeckName}
              onChange={e => setNewDeckName(e.target.value)}
              className="w-full bg-gray-800 rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 ring-blue-500"
            />
            <input
              type="text"
              placeholder="Leírás (opcionális)"
              value={newDeckDesc}
              onChange={e => setNewDeckDesc(e.target.value)}
              className="w-full bg-gray-800 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 ring-blue-500"
            />
            <div className="flex gap-3">
              <button onClick={createDeck} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl font-medium transition">
                Létrehozás
              </button>
              <button onClick={() => setShowForm(false)} className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-xl font-medium transition">
                Mégse
              </button>
            </div>
          </div>
        )}

        {/* Csomagok listája */}
        {loading ? (
          <p className="text-gray-400">Betöltés...</p>
        ) : decks.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">🃏</div>
            <p className="text-xl">Még nincs kártyacsomagod</p>
            <p className="text-sm mt-2">Hozz létre egyet a + Új csomag gombbal!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {decks.map(deck => (
              <div key={deck.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500 transition">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold">{deck.name}</h2>
                  <button
                    onClick={() => deleteDeck(deck.id)}
                    className="text-gray-600 hover:text-red-500 transition text-sm"
                  >
                    🗑️
                  </button>
                </div>
                {deck.description && <p className="text-gray-400 text-sm mb-4">{deck.description}</p>}
                <Link
                  href={`/dashboard/flashcards/${deck.id}`}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-medium transition inline-block"
                >
                  Megnyitás →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}