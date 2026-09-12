import type { Metadata } from 'next'
import { Manrope, Libre_Baskerville } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const libre = Libre_Baskerville({
  subsets: ['latin'],
  variable: '--font-libre',
  display: 'swap',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Colitrack — ECSEL EXPO 2026',
  description: 'Smart SMS Solutions for E-commerce. Real-time parcel tracking, built for Algeria. Live at ECSEL EXPO 2026, Algiers.',
  generator: 'Colitrack.io',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${manrope.variable} ${libre.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
