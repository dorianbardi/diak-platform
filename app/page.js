import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import ParticleCanvas from './components/ParticleCanvas'

const features = [
  { icon: '🃏', title: 'Flashcardok', desc: 'SM-2 spaced repetition algoritmus — tudományosan bizonyított módszer. Az Anki-nál szebb, és ingyenes.', accent: '#4f8eff', bg: 'rgba(79,142,255,0.06)', border: 'rgba(79,142,255,0.2)' },
  { icon: '📅', title: 'Tanulási ütemterv', desc: 'Add meg a vizsga dátumát és témáit — az oldal kiszámolja mikor mit kell tanulni, napra pontosan.', accent: '#2dd4a0', bg: 'rgba(45,212,160,0.06)', border: 'rgba(45,212,160,0.2)' },
  { icon: '📊', title: 'Jegykövetés', desc: 'Súlyozott átlag számítás, tantárgyankénti bontás, félév végi előrejelzés. Magyar rendszerhez igazítva.', accent: '#f5c842', bg: 'rgba(245,200,66,0.06)', border: 'rgba(245,200,66,0.2)' },
  { icon: '💰', title: 'Költségvetés', desc: 'Ösztöndíj, zsebpénz, kiadások kezelése diákoknak szabva — kategóriás bontással, vizuális grafikonnal.', accent: '#9b6dff', bg: 'rgba(155,109,255,0.06)', border: 'rgba(155,109,255,0.2)' },
]

const steps = [
  { num: '01', title: 'Regisztrálj ingyen', desc: 'Egy kattintás Google fiókkal, semmi más nem kell.' },
  { num: '02', title: 'Válassz eszközt', desc: 'Flashcard, ütemterv, jegy vagy budget — mind elérhető rögtön.' },
  { num: '03', title: 'Tanulj okosabban', desc: 'Az algoritmus tudja mikor mit kell ismételni. Te csak tanulsz.' },
]

const faqs = [
  { q: 'Teljesen ingyenes?', a: 'Igen. Minden funkció ingyenes, regisztráció után azonnal elérhető.' },
  { q: 'Mi az a spaced repetition?', a: 'Tudományosan bizonyított tanulási módszer — a kártyákat aszerint mutatja, mikor felejtesz el legjobban. Így 50%-kal kevesebb idő kell ugyanannyi anyaghoz.' },
  { q: 'Mobilon is működik?', a: 'Igen, teljesen reszponzív, bármilyen eszközön elérhető.' },
  { q: 'Biztonságban vannak az adataim?', a: 'Igen, Supabase adatbázist használunk, minden adat titkosítva tárolódik.' },
]

export default async function Home() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', color: 'var(--text)', overflowX: 'hidden' }}>
      <ParticleCanvas />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(79,142,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 var(--pad-x)', height: 'var(--nav-h)',
        background: 'rgba(8,11,20,0.85)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image src="/logo_final.svg" alt="Diák Platform" width={32} height={32} style={{ borderRadius: '8px' }} />
          <span style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(16px, 3vw, 20px)' }}>
            <span className="gradient-text">Diák</span>
            <span style={{ color: 'var(--text)' }}>Platform</span>
            <span style={{ color: 'var(--accent-blue)', marginLeft: '4px' }}>✦</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/sign-in" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}>Bejelentkezés</Link>
          <Link href="/sign-up" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>Regisztráció →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'calc(var(--nav-h) + 60px) var(--pad-x) 80px' }}>
        <div style={{ position: 'absolute', top: '15%', left: '8%', width: 'clamp(40px, 6vw, 80px)', height: 'clamp(40px, 6vw, 80px)', border: '1px solid rgba(79,142,255,0.2)', borderRadius: '16px', transform: 'rotate(15deg)', animation: 'float 6s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '25%', right: '10%', width: 'clamp(30px, 4vw, 50px)', height: 'clamp(30px, 4vw, 50px)', border: '1px solid rgba(155,109,255,0.3)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite 2s', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '12%', width: 'clamp(24px, 3vw, 40px)', height: 'clamp(24px, 3vw, 40px)', background: 'rgba(45,212,160,0.1)', border: '1px solid rgba(45,212,160,0.3)', transform: 'rotate(45deg)', animation: 'float 7s ease-in-out infinite 1s', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '30%', right: '8%', width: 'clamp(40px, 5vw, 60px)', height: 'clamp(40px, 5vw, 60px)', border: '1px solid rgba(79,142,255,0.15)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', background: 'rgba(79,142,255,0.05)', animation: 'float 10s ease-in-out infinite 0.5s', pointerEvents: 'none' }} />

        <div className="animate-fade-up delay-1" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(79,142,255,0.08)', border: '1px solid rgba(79,142,255,0.25)', borderRadius: '100px', padding: '8px 20px', fontSize: '13px', color: 'var(--accent-blue)', marginBottom: '32px', fontWeight: 500 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'inline-block', boxShadow: '0 0 8px var(--accent-blue)' }} />
          Teljesen ingyenes diákoknak
        </div>

        <h1 className="animate-fade-up delay-2" style={{ fontFamily: 'Geist', fontWeight: 800, lineHeight: 1.02, fontSize: 'clamp(36px, 8vw, 96px)', marginBottom: '24px', maxWidth: '1000px', letterSpacing: '-2px' }}>
          Tanulj okosabban.<br />
          <span className="gradient-text">Érd el a céljaid.</span>
        </h1>

        <p className="animate-fade-up delay-3" style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--muted)', maxWidth: '500px', lineHeight: 1.8, marginBottom: '40px' }}>
          Flashcardok, tanulási ütemterv, jegykövetés és költségvetés — egy helyen, diákoknak tervezve.
        </p>

        <div className="animate-fade-up delay-4" style={{ display: 'flex', gap: '12px', marginBottom: '60px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/sign-up" className="btn btn-primary" style={{ fontSize: 'clamp(14px, 2vw, 16px)', padding: '14px 32px' }}>Kezdés ingyen →</Link>
          <Link href="/sign-in" className="btn btn-ghost" style={{ fontSize: 'clamp(14px, 2vw, 16px)', padding: '14px 32px' }}>Bejelentkezés</Link>
        </div>

        <div className="animate-fade-up delay-5" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
          {[
            { value: '4', label: 'Eszköz egy helyen' },
            { value: '∞', label: 'Flashcard csomag' },
            { value: '0 Ft', label: 'Teljesen ingyenes' },
          ].map((s, i) => (
            <div key={i} style={{ padding: 'clamp(16px, 3vw, 28px) clamp(24px, 4vw, 48px)', textAlign: 'center', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(24px, 4vw, 40px)', lineHeight: 1 }} className="gradient-text">{s.value}</div>
              <div style={{ color: 'var(--muted)', fontSize: 'clamp(11px, 1.5vw, 13px)', marginTop: '6px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'var(--pad-y) var(--pad-x)', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="section-label" style={{ color: 'var(--accent-blue)' }}>✦ Funkciók</div>
          <h2 className="section-title">Minden amit egy diák keres</h2>
          <p className="section-desc" style={{ maxWidth: '400px', margin: '0 auto' }}>Négy eszköz, egy platform, nulla kompromisszum.</p>
        </div>
        <div className="grid-2">
          {features.map((f, i) => (
            <div key={i} style={{ background: f.bg, border: `1px solid ${f.border}`, borderRadius: 'var(--radius)', padding: 'clamp(24px, 3vw, 40px)', position: 'relative', overflow: 'hidden', transition: 'transform 0.3s' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', border: `1px solid ${f.border}`, opacity: 0.5 }} />
              <div style={{ fontSize: 'clamp(32px, 4vw, 48px)', marginBottom: '16px', display: 'inline-flex', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', border: `1px solid ${f.border}` }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: 'clamp(17px, 2vw, 22px)', marginBottom: '10px', color: f.accent }}>{f.title}</h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 'clamp(13px, 1.5vw, 15px)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'var(--pad-y) var(--pad-x)', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="section-label" style={{ color: 'var(--accent-purple)' }}>◈ Hogyan működik</div>
          <h2 className="section-title">3 lépés az okosabb tanuláshoz</h2>
        </div>
        <div className="grid-3" style={{ position: 'relative' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(24px, 3vw, 40px) clamp(20px, 2vw, 32px)', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Geist', fontWeight: 800, fontSize: '16px', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(79,142,255,0.3)' }}>{s.num}</div>
              <h3 style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: 'clamp(16px, 2vw, 20px)', marginBottom: '10px' }}>{s.title}</h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 'clamp(13px, 1.5vw, 15px)' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Highlight */}
      <section style={{ position: 'relative', zIndex: 1, margin: '40px 0', background: 'linear-gradient(135deg, rgba(79,142,255,0.08), rgba(155,109,255,0.08))', borderTop: '1px solid rgba(79,142,255,0.15)', borderBottom: '1px solid rgba(155,109,255,0.15)', padding: 'var(--pad-y) var(--pad-x)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h2 style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(22px, 3vw, 36px)', marginBottom: '12px', letterSpacing: '-1px' }}>
              Spaced Repetition — <span className="gradient-text">a tudomány mögött</span>
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 'clamp(13px, 1.5vw, 16px)', maxWidth: '500px', lineHeight: 1.8 }}>
              Az SM-2 algoritmus kiszámolja mikor fogod elfelejteni az anyagot. Tanulmányok szerint <strong style={{ color: 'var(--text)' }}>2-5x hatékonyabb</strong> a hagyományos ismétlésnél.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[{ label: 'Hatékonyabb tanulás', value: '5×' }, { label: 'Kevesebb idő', value: '50%' }].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '20px', padding: 'clamp(16px, 2vw, 24px) clamp(24px, 3vw, 36px)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1 }} className="gradient-text">{s.value}</div>
                <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '8px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'var(--pad-y) var(--pad-x)', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="section-label" style={{ color: 'var(--accent-green)' }}>◉ Kérdések</div>
          <h2 className="section-title">Gyakori kérdések</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(18px, 2vw, 24px) clamp(20px, 2vw, 28px)' }}>
              <div style={{ fontFamily: 'Geist', fontWeight: 700, fontSize: 'clamp(14px, 1.5vw, 16px)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--accent-blue)', flexShrink: 0 }}>✦</span> {f.q}
              </div>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 'clamp(13px, 1.5vw, 15px)', paddingLeft: '24px' }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'var(--pad-y) var(--pad-x) 100px', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'calc(var(--radius) + 8px)', padding: 'clamp(40px, 6vw, 80px) clamp(24px, 4vw, 48px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(79,142,255,0.2), transparent 70%)', pointerEvents: 'none' }} />
          <div className="section-label" style={{ color: 'var(--accent-blue)' }}>✦ Csatlakozz most</div>
          <h2 style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(28px, 5vw, 56px)', marginBottom: '16px', letterSpacing: '-1.5px', marginTop: '8px' }}>Készen állsz?</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '36px', fontSize: 'clamp(14px, 1.5vw, 17px)', lineHeight: 1.7 }}>Regisztrálj ingyen és kezdj el okosabban tanulni még ma.</p>
          <Link href="/sign-up" className="btn btn-primary" style={{ fontSize: 'clamp(14px, 1.5vw, 18px)', padding: 'clamp(14px, 2vw, 18px) clamp(32px, 4vw, 56px)' }}>Regisztrálok ingyen →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border)', padding: 'clamp(20px, 2vw, 32px) var(--pad-x)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image src="/logo_final.svg" alt="Diák Platform" width={28} height={28} style={{ borderRadius: '7px' }} />
          <span style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: '18px' }}>
            <span className="gradient-text">Diák</span>Platform <span style={{ color: 'var(--accent-blue)' }}>✦</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/privacy" style={{ color: 'var(--muted)', fontSize: '13px', textDecoration: 'none' }}>Adatvédelem</a>
          <a href="/terms" style={{ color: 'var(--muted)', fontSize: '13px', textDecoration: 'none' }}>Feltételek</a>
          <a href="/cookies" style={{ color: 'var(--muted)', fontSize: '13px', textDecoration: 'none' }}>Cookie-k</a>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>© 2026 — Diák Platform</span>
        </div>
      </footer>
    </div>
  )
}