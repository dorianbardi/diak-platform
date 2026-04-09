import { ClerkProvider } from '@clerk/nextjs'
import { Geist } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import CookieBanner from './components/CookieBanner'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export const metadata = {
  title: 'Diák Platform — Tanulj okosabban',
  description: 'Flashcardok, tanulási ütemterv, jegykövetés és költségvetés — egy helyen, magyar diákoknak tervezve. Teljesen ingyenes.',
  keywords: 'flashcard, tanulás, diák, jegykövetés, ütemterv, spaced repetition, magyar',
  authors: [{ name: 'Diák Platform' }],
  openGraph: {
    title: 'Diák Platform — Tanulj okosabban',
    description: 'Flashcardok, tanulási ütemterv, jegykövetés és költségvetés — egy helyen, magyar diákoknak tervezve.',
    url: 'https://www.diakplatform.online',
    siteName: 'Diák Platform',
    locale: 'hu_HU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diák Platform — Tanulj okosabban',
    description: 'Flashcardok, tanulási ütemterv, jegykövetés és költségvetés — egy helyen, magyar diákoknak tervezve.',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL('https://www.diakplatform.online'),
  icons: {
    icon: '/logo_final.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{
      variables: {
        colorPrimary: '#4f8eff',
        colorBackground: '#080b14',
        colorInputBackground: 'rgba(255,255,255,0.05)',
        colorInputText: '#f0f4ff',
        colorText: '#f0f4ff',
        colorTextSecondary: '#6b7a99',
        colorNeutral: '#6b7a99',
        borderRadius: '12px',
      },
      elements: {
        card: {
          background: 'rgba(8,11,20,0.95)',
          border: '1px solid rgba(79,142,255,0.2)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        },
        headerTitle: {
          color: '#f0f4ff',
          fontFamily: 'Geist, sans-serif',
          fontWeight: '800',
        },
        headerSubtitle: {
          color: '#6b7a99',
        },
        socialButtonsBlockButton: {
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#f0f4ff',
        },
        formFieldInput: {
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#f0f4ff',
        },
        footerActionLink: {
          color: '#4f8eff',
        },
      }
    }}>
      <html lang="hu">
        <body className={`${geist.variable} antialiased`}>
          {children}
          <Analytics />
          <CookieBanner />
        </body>
      </html>
    </ClerkProvider>
  )
}