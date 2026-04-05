import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Diák Platform 🎓</h1>
          <UserButton afterSignOutUrl="/" />
        </div>

        <div className="grid grid-cols-2 gap-6">

          <Link href="/dashboard/flashcards" className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-blue-500 cursor-pointer transition">
            <div className="text-4xl mb-3">🃏</div>
            <h2 className="text-xl font-bold mb-2">Flashcardok</h2>
            <p className="text-gray-400">Tanulj okosan ismétléssel</p>
          </Link>

          <Link href="/dashboard/utemterv" className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-green-500 cursor-pointer transition">
            <div className="text-4xl mb-3">📅</div>
            <h2 className="text-xl font-bold mb-2">Tanulási ütemterv</h2>
            <p className="text-gray-400">Tervezd meg a vizsgáidat</p>
          </Link>

          <Link href="/dashboard/jegyek" className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-yellow-500 cursor-pointer transition">
            <div className="text-4xl mb-3">📊</div>
            <h2 className="text-xl font-bold mb-2">Jegyek</h2>
            <p className="text-gray-400">Kövesd az eredményeidet</p>
          </Link>

          <Link href="/dashboard/koltsegvetes" className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-purple-500 cursor-pointer transition">
            <div className="text-4xl mb-3">💰</div>
            <h2 className="text-xl font-bold mb-2">Költségvetés</h2>
            <p className="text-gray-400">Gazdálkodj tudatosan</p>
          </Link>

        </div>
      </div>
    </div>
  )
}