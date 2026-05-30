import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MoneyFi — Earn Yield Automatically',
  description: 'Multi-strategy DeFi vaults on Aptos. Maximize yield automatically.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ minHeight: '100vh', background: '#0a0a0a' }}>
        <Navbar />
        <main>{children}</main>
        <footer
          style={{
            borderTop: '1px solid #1a1a1a',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 80,
          }}
        >
          <span style={{ fontSize: 11, color: '#333' }}>
            ✓ Audited by MOVEBIT · © 2025 BY SOLUTIONS LTD. · GRAND CAYMAN, CAYMAN ISLANDS
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Terms', 'Privacy', 'Docs'].map((l) => (
              <a key={l} href="#" style={{ fontSize: 11, color: '#444', textDecoration: 'none' }}>
                {l}
              </a>
            ))}
          </div>
        </footer>
      </body>
    </html>
  )
}
