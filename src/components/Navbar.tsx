'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
        background: 'rgba(10,10,10,0.95)',
        borderBottom: '1px solid #1a1a1a',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="page-wrap"
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', flexShrink: 0 }}>
          <div
            style={{
              width: 26,
              height: 26,
              background: '#00e676',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 13,
              color: '#000',
            }}
          >
            M
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#fff', letterSpacing: 0.4 }}>
            MoneyFi
          </span>
        </Link>

        {/* Nav tabs — always visible */}
        <div style={{ display: 'flex', gap: 3 }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 0.7,
                  textDecoration: 'none',
                  background: active ? '#00e676' : 'transparent',
                  color: active ? '#000' : '#666',
                  border: '1px solid',
                  borderColor: active ? '#00e676' : '#1e1e1e',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* CREATE VAULT — always show, label hidden on very small screens */}
          <Link
            href="/create"
            style={{
              padding: '5px 12px',
              background: '#00e676',
              color: '#000',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: 0.5,
              whiteSpace: 'nowrap',
            }}
          >
            <span className="nav-create-label">+ CREATE VAULT</span>
            <span style={{ display: 'inline' }} className="hide-on-desktop">+</span>
          </Link>

          {/* CONNECT WALLET — hidden on mobile */}
          <button
            className="nav-connect"
            style={{
              padding: '5px 12px',
              background: 'transparent',
              border: '1px solid #333',
              borderRadius: 6,
              color: '#888',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              alignItems: 'center',
              gap: 6,
              letterSpacing: 0.5,
              whiteSpace: 'nowrap',
            }}
          >
            CONNECT WALLET
          </button>

          {/* LIVE dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              className="live-dot"
              style={{ width: 6, height: 6, background: '#00e676', borderRadius: '50%' }}
            />
            <span style={{ fontSize: 10, color: '#00e676', fontWeight: 600 }}>LIVE</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
