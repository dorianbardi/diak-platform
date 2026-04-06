'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

function ParticleCanvas() {
  const ref = useRef()
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }))
    let raf
    function draw() {
      ctx.clearRect(0, 0, w, h)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(79,142,255,${p.opacity})`
        ctx.fill()
      })
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const d = Math.hypot(p.x - p2.x, p.y - p2.y)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(79,142,255,${0.08 * (1 - d / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}

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

export default function Home() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', color: 'var(--text)' }}>
      <ParticleCanvas />

      {/* Háttér orbok */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(79,142,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 48px', height: '72px',
        background: 'rgba(8,11,20,0.85)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>
          <span className="gradient-text">Diák</span>
          <span style={{ color: 'var(--text)' }}>Platform</span>
          <span style={{ color: 'var(--accent-blue)', marginLeft: '4px' }}>✦</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/sign-in" className="btn btn-ghost" style={{ padding: '10px 20px', fontSize: '14px' }}>Bejelentkezés</Link>
          <Link href="/sign-up" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>Regisztráció →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '140px 48px 80px',
      }}>

        {/* Lebegő alakzatok */}
        <div style={{
          position: 'absolute', top: '15%', left: '8%', width: '80px', height: '80px',
          border: '1px solid rgba(79,142,255,0.2)', borderRadius: '16px',
          transform: 'rotate(15deg)', animation: 'float 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '25%', right: '10%', width: '50px', height: '50px',
          border: '1px solid rgba(155,109,255,0.3)', borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite 2s',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', left: '12%', width: '40px', height: '40px',
          background: 'rgba(45,212,160,0.1)', border: '1px solid rgba(45,212,160,0.3)',
          transform: 'rotate(45deg)', animation: 'float 7s ease-in-out infinite 1s',
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '6%',
          width: 0, height: 0,
          borderLeft: '30px solid transparent',
          borderRight: '30px solid transparent',
          borderBottom: '52px solid rgba(245,200,66,0.08)',
          animation: 'float 9s ease-in-out infinite 3s',
        }} />
        <div style={{
          position: 'absolute', bottom: '30%', right: '15%', width: '60px', height: '60px',
          border: '1px solid rgba(79,142,255,0.15)',
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          background: 'rgba(79,142,255,0.05)',
          animation: 'float 10s ease-in-out infinite 0.5s',
        }} />

        <div className="animate-fade-up delay-1" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(79,142,255,0.08)', border: '1px solid rgba(79,142,255,0.25)',
          borderRadius: '100px', padding: '8px 20px', fontSize: '13px',
          color: 'var(--accent-blue)', marginBottom: '32px', fontWeight: 500, letterSpacing: '0.5px',
        }}>
          <span style={{ fontSize: '8px', background: 'var(--accent-blue)', borderRadius: '50%', width: '8px', height: '8px', display: 'inline-block', boxShadow: '0 0 8px var(--accent-blue)' }} />
          Teljesen ingyenes diákoknak
        </div>

        <h1 className="animate-fade-up delay-2" style={{
          fontFamily: 'Syne', fontWeight: 800, lineHeight: 1.02,
          fontSize: 'clamp(52px, 8vw, 96px)', marginBottom: '28px', maxWidth: '1000px',
          letterSpacing: '-2px',
        }}>
          Tanulj okosabban.<br />
          <span className="gradient-text">Érd el a céljaid.</span>
        </h1>

        <p className="animate-fade-up delay-3" style={{
          fontSize: '18px', color: 'var(--muted)', maxWidth: '500px',
          lineHeight: 1.8, marginBottom: '48px',
        }}>
          Flashcardok, tanulási ütemterv, jegykövetés és költségvetés — egy helyen, diákoknak tervezve.
        </p>

        <div className="animate-fade-up delay-4" style={{ display: 'flex', gap: '12px', marginBottom: '80px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/sign-up" className="btn btn-primary" style={{ fontSize: '16px', padding: '16px 40px', letterSpacing: '0.3px' }}>
            Kezdés ingyen →
          </Link>
          <Link href="/sign-in" className="btn btn-ghost" style={{ fontSize: '16px', padding: '16px 40px' }}>
            Bejelentkezés
          </Link>
        </div>

        {/* Stats */}
        <div className="animate-fade-up delay-5" style={{
          display: 'flex', gap: '0',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: '20px', overflow: 'hidden',
          backdropFilter: 'blur(20px)',
        }}>
          {[
            { value: '4', label: 'Eszköz egy helyen', icon: '✦' },
            { value: '∞', label: 'Flashcard csomag', icon: '◈' },
            { value: '0 Ft', label: 'Teljesen ingyenes', icon: '◉' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '28px 48px', textAlign: 'center',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '40px', lineHeight: 1 }} className="gradient-text">{s.value}</div>
              <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '6px', letterSpacing: '0.3px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '72px' }}>
          <div style={{ fontFamily: 'Syne', fontSize: '12px', letterSpacing: '3px', color: 'var(--accent-blue)', marginBottom: '16px', textTransform: 'uppercase' }}>
            ✦ Funkciók
          </div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 52px)', marginBottom: '16px', letterSpacing: '-1px' }}>
            Minden amit egy diák keres
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '17px', maxWidth: '400px', margin: '0 auto' }}>Négy eszköz, egy platform, nulla kompromisszum.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: f.bg, border: `1px solid ${f.border}`,
              borderRadius: '24px', padding: '40px',
              position: 'relative', overflow: 'hidden',
              transition: 'transform 0.3s, box-shadow 0.3s',
              cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 60px ${f.bg}` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {/* Dekoratív sarok */}
              <div style={{
                position: 'absolute', top: '-30px', right: '-30px',
                width: '100px', height: '100px',
                border: `1px solid ${f.border}`, borderRadius: '50%',
                opacity: 0.5,
              }} />
              <div style={{
                position: 'absolute', top: '-10px', right: '-10px',
                width: '60px', height: '60px',
                border: `1px solid ${f.border}`, borderRadius: '50%',
                opacity: 0.3,
              }} />

              <div style={{
                fontSize: '36px', marginBottom: '24px',
                display: 'inline-flex', padding: '14px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px', border: `1px solid ${f.border}`,
              }}>{f.icon}</div>

              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '22px', marginBottom: '12px', color: f.accent }}>{f.title}</h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '15px' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '72px' }}>
          <div style={{ fontFamily: 'Syne', fontSize: '12px', letterSpacing: '3px', color: 'var(--accent-purple)', marginBottom: '16px', textTransform: 'uppercase' }}>
            ◈ Hogyan működik
          </div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-1px' }}>
            3 lépés az okosabb tanuláshoz
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', position: 'relative' }}>
          {/* Összekötő vonal */}
          <div style={{
            position: 'absolute', top: '60px', left: '20%', right: '20%', height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--accent-blue), var(--accent-purple), transparent)',
            zIndex: 0,
          }} />

          {steps.map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
              borderRadius: '24px', padding: '40px 32px', textAlign: 'center',
              position: 'relative', zIndex: 1,
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Syne', fontWeight: 800, fontSize: '18px',
                margin: '0 auto 24px', boxShadow: '0 0 30px rgba(79,142,255,0.3)',
              }}>{s.num}</div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '20px', marginBottom: '12px' }}>{s.title}</h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: '15px' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HIGHLIGHT SÁV */}
      <section style={{
        position: 'relative', zIndex: 1, margin: '40px 0',
        background: 'linear-gradient(135deg, rgba(79,142,255,0.08), rgba(155,109,255,0.08))',
        borderTop: '1px solid rgba(79,142,255,0.15)', borderBottom: '1px solid rgba(155,109,255,0.15)',
        padding: '60px 48px', overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '36px', marginBottom: '12px', letterSpacing: '-1px' }}>
              Spaced Repetition — <span className="gradient-text">a tudomány mögött</span>
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '16px', maxWidth: '500px', lineHeight: 1.8 }}>
              Az SM-2 algoritmus kiszámolja mikor fogod elfelejteni az anyagot, és pontosan akkor mutatja a kártyát. Tanulmányok szerint <strong style={{ color: 'var(--text)' }}>2-5x hatékonyabb</strong> a hagyományos ismétlésnél.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'Hatékonyabb tanulás', value: '5×' },
              { label: 'Kevesebb idő', value: '50%' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                borderRadius: '20px', padding: '24px 36px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '48px', lineHeight: 1 }} className="gradient-text">{s.value}</div>
                <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '8px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 48px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontFamily: 'Syne', fontSize: '12px', letterSpacing: '3px', color: 'var(--accent-green)', marginBottom: '16px', textTransform: 'uppercase' }}>
            ◉ Kérdések
          </div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-1px' }}>
            Gyakori kérdések
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((f, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
              borderRadius: '16px', padding: '24px 28px',
            }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '16px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--accent-blue)' }}>✦</span> {f.q}
              </div>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: '15px', paddingLeft: '28px' }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        position: 'relative', zIndex: 1, padding: '80px 48px 120px',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: '700px', margin: '0 auto',
          background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
          borderRadius: '32px', padding: '80px 48px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
            width: '200px', height: '200px',
            background: 'radial-gradient(circle, rgba(79,142,255,0.2), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ fontFamily: 'Syne', fontSize: '12px', letterSpacing: '3px', color: 'var(--accent-blue)', marginBottom: '20px', textTransform: 'uppercase' }}>
            ✦ Csatlakozz most
          </div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: '16px', letterSpacing: '-1.5px' }}>
            Készen állsz?
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: '40px', fontSize: '17px', lineHeight: 1.7 }}>
            Regisztrálj ingyen és kezdj el okosabban tanulni még ma.
          </p>
          <Link href="/sign-up" className="btn btn-primary" style={{ fontSize: '18px', padding: '18px 56px', letterSpacing: '0.3px' }}>
            Regisztrálok ingyen →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid var(--border)',
        padding: '32px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '18px' }}>
          <span className="gradient-text">Diák</span>Platform <span style={{ color: 'var(--accent-blue)' }}>✦</span>
        </div>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>© 2026 — Minden jog fenntartva</span>
        </div>
      </footer>

    </div>
  )
}