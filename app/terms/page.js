export default function TermsPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 48px' }}>
        <h1 style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: '42px', letterSpacing: '-1.5px', marginBottom: '8px' }}>
          Felhasználási feltételek
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '48px' }}>Utoljára frissítve: 2026. április</p>

        {[
          { title: '1. Általános feltételek', content: 'A Diák Platform (diakplatform.online) használatával elfogadod az alábbi felhasználási feltételeket. A szolgáltatás használata 13 éves kortól engedélyezett.' },
          { title: '2. A szolgáltatás leírása', content: 'A Diák Platform egy ingyenes tanulási platform magyar diákoknak, amely flashcard rendszert, tanulási ütemtervet, jegykövetést és költségvetés kezelőt tartalmaz AI funkciókkal.' },
          { title: '3. Felhasználói fiókok', content: 'A regisztrációhoz érvényes email cím szükséges. Te vagy felelős a fiókod biztonságáért és az általad létrehozott tartalmakért. Hamis adatok megadása tilos.' },
          { title: '4. Elfogadható használat', content: 'A platformot kizárólag tanulási célokra szabad használni. Tilos: más felhasználók zavarása, a rendszer túlterhelése, illegális tartalmak feltöltése, és a szolgáltatás visszafejtése.' },
          { title: '5. Tartalom', content: 'Az általad létrehozott flashcardok és egyéb tartalmak a te tulajdonod maradnak. A Diák Platform jogot fenntart arra, hogy a felhasználási feltételeket megszegő tartalmakat eltávolítsa.' },
          { title: '6. Szolgáltatás elérhetősége', content: 'A Diák Platform ingyenes szolgáltatást nyújt, de nem garantálja a 100%-os üzemidőt. Fenntartjuk a jogot a szolgáltatás módosítására vagy megszüntetésére előzetes értesítéssel.' },
          { title: '7. Felelősségkorlátozás', content: 'A Diák Platform nem vállal felelősséget az esetleges adatvesztésért vagy a szolgáltatás kieséseiből eredő károkért. A platformot "ahogy van" alapon nyújtjuk.' },
          { title: '8. Módosítások', content: 'Fenntartjuk a jogot a felhasználási feltételek módosítására. A módosításokról email értesítést küldünk.' },
          { title: '9. Kapcsolat', content: 'Kérdésekkel fordulj hozzánk: dorianbardi@gmail.com' },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: '36px', paddingBottom: '36px', borderBottom: i < 8 ? '1px solid var(--border)' : 'none' }}>
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