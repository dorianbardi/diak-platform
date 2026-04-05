import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-gray-800">
        <h1 className="text-xl font-bold">Diák Platform 🎓</h1>
        <div className="flex gap-3">
          <Link href="/sign-in" className="px-4 py-2 rounded-xl text-gray-400 hover:text-white transition">
            Bejelentkezés
          </Link>
          <Link href="/sign-up" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-medium transition">
            Regisztráció
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-8 py-32">
        <div className="bg-blue-600 text-xs font-medium px-4 py-1.5 rounded-full mb-6 inline-block">
          🚀 Ingyenes diákoknak
        </div>
        <h1 className="text-6xl font-bold mb-6 max-w-3xl leading-tight">
          Tanulj okosabban,<br />
          <span className="text-blue-400">érd el a céljaidat</span>
        </h1>
        <p className="text-gray-400 text-xl max-w-xl mb-10">
          Flashcardok, tanulási ütemterv, jegykövetés és költségvetés — egy helyen, diákoknak tervezve.
        </p>
        <div className="flex gap-4">
          <Link href="/sign-up" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-bold text-lg transition">
            Kezdés ingyen →
          </Link>
          <Link href="/sign-in" className="bg-gray-900 hover:bg-gray-800 border border-gray-700 px-8 py-4 rounded-xl font-bold text-lg transition">
            Bejelentkezés
          </Link>
        </div>
      </section>

      {/* Feature kártyák */}
      <section className="px-8 pb-24 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Minden ami kell egy diáknak</h2>
        <div className="grid grid-cols-2 gap-6">

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="text-5xl mb-4">🃏</div>
            <h3 className="text-xl font-bold mb-2">Flashcardok</h3>
            <p className="text-gray-400">Spaced repetition algoritmussal tanulj — pont mint az Anki, de szebb és egyszerűbb.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2">Tanulási ütemterv</h3>
            <p className="text-gray-400">Add meg a vizsga dátumát és a témákat — az oldal kiszámolja mikor mit kell tanulni.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Jegykövetés</h3>
            <p className="text-gray-400">Kövesd az összes jegyedet, számítsd ki a súlyozott átlagot tantárgyanként.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Költségvetés</h3>
            <p className="text-gray-400">Kezeld az ösztöndíjad, zsebpénzed és kiadásaid — gazdálkodj tudatosan.</p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-800 px-8 py-24 text-center">
        <h2 className="text-4xl font-bold mb-4">Készen állsz?</h2>
        <p className="text-gray-400 mb-8 text-lg">Csatlakozz és kezdj el okosabban tanulni még ma.</p>
        <Link href="/sign-up" className="bg-blue-600 hover:bg-blue-700 px-10 py-4 rounded-xl font-bold text-lg transition">
          Regisztrálok ingyen →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-8 py-6 text-center text-gray-600 text-sm">
        © 2026 Diák Platform — Minden jog fenntartva
      </footer>

    </div>
  )
}