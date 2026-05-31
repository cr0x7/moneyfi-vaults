import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import CustomCursor from '@/components/CustomCursor'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MoneyFi — Earn Yield Automatically',
  description: 'Multi-strategy DeFi vaults on Aptos. Maximize yield automatically.',
  icons: {
    icon: '/favicon.webp',
    shortcut: '/favicon.webp',
    apple: '/favicon.webp',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ minHeight: '100vh', background: '#0a0a0a' }}>
        <CustomCursor />
        <Navbar />
        <main>{children}</main>
        <footer
          className="page-wrap"
          style={{
            borderTop: '1px solid #1a1a1a',
            paddingTop: 16,
            paddingBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginTop: 60,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 10, color: '#2a2a2a' }}>
              ✓ Audited by MOVEBIT · © 2025 BY SOLUTIONS LTD.
            </span>
            <div style={{ display: 'flex', gap: 16 }}>
              {['Terms', 'Privacy', 'Docs'].map((l) => (
                <a key={l} href="#" style={{ fontSize: 11, color: '#444', textDecoration: 'none' }}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
