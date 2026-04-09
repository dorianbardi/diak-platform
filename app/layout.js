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
        colorBackground: '#0d1526',
        colorInputBackground: '#1a2540',
        colorInputText: '#ffffff',
        colorText: '#ffffff',
        colorTextSecondary: '#ffffff',
        colorNeutral: '#ffffff',
        borderRadius: '12px',
      },
      elements: {
        card: {
          background: '#0d1526',
          border: '1px solid rgba(79,142,255,0.25)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        },
        headerTitle: {
          color: '#ffffff',
          fontFamily: 'Geist, sans-serif',
          fontWeight: '800',
        },
        headerSubtitle: {
          color: '#ffffff',
        },
        socialButtonsBlockButton: {
          background: '#1a2540',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#ffffff',
        },
        socialButtonsBlockButtonText: {
          color: '#ffffff',
        },
        formFieldLabel: {
          color: '#ffffff',
        },
        formFieldInput: {
          background: '#1a2540',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#ffffff',
        },
        footerActionLink: {
          color: '#4f8eff',
        },
        footerActionText: {
          color: '#ffffff',
        },
        dividerLine: {
          background: 'rgba(255,255,255,0.15)',
        },
        dividerText: {
          color: '#ffffff',
        },
        formButtonPrimary: {
          background: 'linear-gradient(135deg, #4f8eff, #9b6dff)',
          color: '#ffffff',
        },
        identityPreviewText: {
          color: '#ffffff',
        },
        identityPreviewEditButton: {
          color: '#4f8eff',
        },
        navbar: {
          background: '#0a1020',
        },
        navbarButton: {
          color: '#ffffff',
        },
        profileSectionTitle: {
          color: '#ffffff',
        },
        profileSectionContent: {
          color: '#ffffff',
        },
        accordionTriggerButton: {
          color: '#ffffff',
        },
        badge: {
          color: '#ffffff',
        },
        tableHead: {
          color: '#ffffff',
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