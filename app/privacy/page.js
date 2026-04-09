export default function PrivacyPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 48px' }}>

        <h1 style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: '42px', letterSpacing: '-1.5px', marginBottom: '8px' }}>
          Adatvédelmi tájékoztató
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '48px' }}>Utoljára frissítve: 2026. április</p>

        {[
          { title: '1. Bevezetés', content: 'A Diák Platform (diakplatform.online) elkötelezett a felhasználók személyes adatainak védelme iránt. Ez az adatvédelmi tájékoztató leírja, hogy milyen adatokat gyűjtünk, hogyan használjuk fel őket, és milyen jogok illetik meg a felhasználókat.' },
          { title: '2. Gyűjtött adatok', content: 'A következő adatokat gyűjtjük: Email cím és név (regisztrációkor), Flashcardok és tanulási adatok, Jegyek és tanulmányi adatok, Költségvetési adatok, Oldallátogatási statisztikák (anonimizálva).' },
          { title: '3. Adatok felhasználása', content: 'Az adatokat kizárólag a szolgáltatás nyújtásához használjuk fel: a tanulási adatok megjelenítéséhez, a spaced repetition algoritmus működéséhez, és a felhasználói élmény javításához. Az adatokat harmadik félnek nem adjuk el.' },
          { title: '4. Adatkezelők', content: 'A következő szolgáltatókat vesszük igénybe: Supabase (adatbázis, EU-s szerver), Clerk (autentikáció), Vercel (hosting), Sentry (hibanaplózás). Minden szolgáltató GDPR-kompatibilis.' },
          { title: '5. Sütik (Cookie-k)', content: 'Az oldal munkamenet-kezeléshez és autentikációhoz használ sütiket. Harmadik fél hirdetési sütiket nem használunk.' },
          { title: '6. Felhasználói jogok', content: 'GDPR alapján jogod van: hozzáférni a személyes adataidhoz, kérni azok törlését, kérni az adatok helyesbítését, tiltakozni az adatkezelés ellen. Kéréseidet az alábbi emailen tudod jelezni.' },
          { title: '7. Adatmegőrzés', content: 'Az adatokat a fiók törléséig tároljuk. Fiókod törlésekor minden személyes adatod véglegesen töröljük az adatbázisból.' },
          { title: '8. Kapcsolat', content: 'Adatvédelmi kérdésekkel fordulj hozzánk: dorianbardi@gmail.com' },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: '36px', paddingBottom: '36px', borderBottom: i < 7 ? '1px solid var(--border)' : 'none' }}>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: '20px', marginBottom: '12px', color: 'var(--accent-blue)' }}>{section.title}</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '15px' }}>{section.content}</p>
          </div>
        ))}

        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <a href="/" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '14px' }}>← Vissza a főoldalra</a>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>© 2026 Diák Platform</span>
        </div>
      </div>
    </div>
  )
}