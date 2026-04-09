export default function CookiesPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 48px' }}>
        <h1 style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: '42px', letterSpacing: '-1.5px', marginBottom: '8px' }}>
          Cookie tájékoztató
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '48px' }}>Utoljára frissítve: 2026. április</p>

        {[
          { title: '1. Mi az a cookie?', content: 'A cookie (süti) egy kis szövegfájl, amelyet a weboldal helyez el a böngésződben. Segít a weboldal megfelelő működésében és a felhasználói élmény javításában.' },
          { title: '2. Milyen cookie-kat használunk?', content: 'Munkamenet cookie-k: A bejelentkezési állapot megőrzéséhez szükségesek. Ezek nélkül nem tudnál bejelentkezni az oldalra. Analitikai cookie-k: A Vercel Analytics segítségével anonimizált látogatási statisztikákat gyűjtünk az oldal fejlesztéséhez.' },
          { title: '3. Harmadik fél cookie-k', content: 'A Clerk autentikációs szolgáltató saját cookie-kat használ a biztonságos bejelentkezéshez. Hirdetési cookie-kat nem használunk.' },
          { title: '4. Cookie-k kezelése', content: 'A böngésződ beállításaiban bármikor törölheted vagy letilthatod a cookie-kat. Figyelem: a cookie-k letiltása esetén előfordulhat, hogy az oldal egyes funkciói nem működnek megfelelően.' },
          { title: '5. Cookie-k élettartama', content: 'Munkamenet cookie-k: A böngésző bezárásával törlődnek. Tartós cookie-k: Maximum 30 napig tárolódnak.' },
          { title: '6. Kapcsolat', content: 'Cookie-kkal kapcsolatos kérdésekkel fordulj hozzánk: dorianbardi@gmail.com' },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: '36px', paddingBottom: '36px', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
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