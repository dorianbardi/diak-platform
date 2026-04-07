import { ClerkProvider } from '@clerk/nextjs'
import { Geist } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'

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
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="hu">
        <body className={`${geist.variable} antialiased`}>
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}