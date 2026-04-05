import { UserButton } from '@clerk/nextjs'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Diák Platform 🎓</h1>
          <UserButton afterSignOutUrl="/" />
        </div>

        {/* Feature kártyák */}
        <div className="grid grid-cols-2 gap-6">
          
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-blue-500 cursor-pointer transition">
            <div className="text-4xl mb-3">🃏</div>
            <h2 className="text-xl font-bold mb-2">Flashcardok</h2>
            <p className="text-gray-400">Tanulj okosan ismétléssel</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-green-500 cursor-pointer transition">
            <div className="text-4xl mb-3">📅</div>
            <h2 className="text-xl font-bold mb-2">Tanulási ütemterv</h2>
            <p className="text-gray-400">Tervezd meg a vizsgáidat</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-yellow-500 cursor-pointer transition">
            <div className="text-4xl mb-3">📊</div>
            <h2 className="text-xl font-bold mb-2">Jegyek</h2>
            <p className="text-gray-400">Kövesd az eredményeidet</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-purple-500 cursor-pointer transition">
            <div className="text-4xl mb-3">💰</div>
            <h2 className="text-xl font-bold mb-2">Költségvetés</h2>
            <p className="text-gray-400">Gazdálkodj tudatosan</p>
          </div>

        </div>
      </div>
    </div>
  )
}