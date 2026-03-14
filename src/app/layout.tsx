import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/layout/header'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'FaultMint — AI Pre-Mortem & Release Gate Dashboard',
  description:
    'Predict failure risks before they ship. Paste release notes, get AI-powered risk analysis, track mitigations, collect approvals, and gate your releases with confidence.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className={inter.variable}>
      <body className='min-h-screen bg-gray-50 font-sans text-gray-900 antialiased'>
        <Providers>
          <Header />
          <main className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
