'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'VAULT', href: '/' },
  { label: 'RANKING', href: '/ranking' },
  { label: 'EVENTS', href: '/events' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        background: 'rgba(10,10,10,0.92)',
        borderBottom: '1px solid #1a1a1a',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: '#00e676',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 14,
              color: '#000',
            }}
          >
            M
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#fff', letterSpacing: 0.5 }}>
            MoneyFi
          </span>
        </Link>

        {/* Nav tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '6px 16px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 0.8,
                  textDecoration: 'none',
                  background: active ? '#00e676' : 'transparent',
                  color: active ? '#000' : '#666',
                  border: '1px solid',
                  borderColor: active ? '#00e676' : '#222',
                  transition: 'all 0.2s',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/create"
            style={{
              padding: '6px 16px',
              background: '#00e676',
              color: '#000',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: 0.5,
            }}
          >
            + CREATE VAULT
          </Link>
          <button
            style={{
              padding: '6px 14px',
              background: 'transparent',
              border: '1px solid #333',
              borderRadius: 6,
              color: '#888',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              letterSpacing: 0.5,
            }}
          >
            CONNECT WALLET
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              className="live-dot"
              style={{
                width: 6,
                height: 6,
                background: '#00e676',
                borderRadius: '50%',
              }}
            />
            <span style={{ fontSize: 11, color: '#00e676', fontWeight: 600 }}>LIVE</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
