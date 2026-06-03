'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'VAULT', href: '/' },
  { label: 'RANKING', href: '/ranking' },
  { label: 'EVENTS', href: '/events' },
]

const WALLET_PROVIDERS = [
  { name: 'MetaMask', type: 'EVM wallet', logo: '/wallets/metamask.svg', bg: '#2a1605', border: '#f6851b55' },
  { name: 'OKX Wallet', type: 'Multi-chain wallet', logo: '/wallets/okx.svg', bg: '#050505', border: '#333333' },
  { name: 'Petra', type: 'Aptos wallet', logo: '/wallets/petra.svg', bg: '#141018', border: '#7c3aed55', fullBleed: true },
  { name: 'WalletConnect', type: 'QR / mobile wallet', logo: '/wallets/walletconnect.svg', bg: '#071525', border: '#3b99fc55' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [walletOpen, setWalletOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)

  function connectWallet(provider: string) {
    setConnectedWallet(provider)
    setWalletOpen(false)
  }

  function handleTouchEnd(endX: number) {
    if (touchStartX === null) return
    const delta = endX - touchStartX
    setTouchStartX(null)

    if (Math.abs(delta) < 70) return
    if (delta < 0) setNavOpen(true)
    if (delta > 0) setNavOpen(false)
  }

  return (
    <div
      onTouchStart={(e) => setTouchStartX(e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
    >
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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
            <Image
              src="/moneyfi-logo.png"
              alt="MoneyFi"
              height={28}
              width={120}
              style={{ height: 28, width: 'auto', objectFit: 'contain' }}
              priority
            />
          </Link>

          {/* Nav tabs */}
          <div className="nav-tabs" style={{ gap: 3 }}>
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
            {/* CREATE VAULT */}
            <Link
              className="nav-create"
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
              + CREATE VAULT
            </Link>

            {/* CONNECT WALLET */}
            <button
              className="nav-connect"
              onClick={() => setWalletOpen(true)}
              style={{
                padding: '5px 12px',
                background: connectedWallet ? '#0a1a0f' : 'transparent',
                border: `1px solid ${connectedWallet ? '#00e67655' : '#333'}`,
                borderRadius: 6,
                color: connectedWallet ? '#00e676' : '#888',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                alignItems: 'center',
                gap: 6,
                letterSpacing: 0.5,
                whiteSpace: 'nowrap',
              }}
            >
              {connectedWallet ? '0x7A1...91C2' : 'CONNECT WALLET'}
            </button>

            {/* LIVE dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div
                className="live-dot"
                style={{ width: 6, height: 6, background: '#00e676', borderRadius: '50%' }}
              />
              <span style={{ fontSize: 10, color: '#00e676', fontWeight: 600 }}>LIVE</span>
            </div>

            <button
              type="button"
              className="nav-menu-trigger"
              onClick={() => setNavOpen((next) => !next)}
              aria-label="Open navigation menu"
              aria-expanded={navOpen}
              style={{
                width: 30,
                height: 28,
                padding: 0,
                background: navOpen ? '#00e676' : 'transparent',
                border: `1px solid ${navOpen ? '#00e676' : '#333'}`,
                borderRadius: 6,
                color: navOpen ? '#000' : '#888',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              {[0, 1, 2].map((line) => (
                <span
                  key={line}
                  style={{
                    width: 13,
                    height: 2,
                    borderRadius: 2,
                    background: navOpen ? '#000' : '#888',
                    display: 'block',
                  }}
                />
              ))}
            </button>
          </div>
        </div>
      </nav>

      <div
        className="nav-mobile-menu"
        onClick={() => setNavOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 49,
          background: navOpen ? 'rgba(0,0,0,0.48)' : 'rgba(0,0,0,0)',
          pointerEvents: navOpen ? 'auto' : 'none',
          transition: 'background 0.2s ease',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: 'min(78vw, 320px)',
            paddingTop: 58,
            background: 'rgba(10,10,10,0.98)',
            borderLeft: '1px solid #1a1a1a',
            backdropFilter: 'blur(12px)',
            transform: navOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.22s ease',
            boxShadow: navOpen ? '-24px 0 80px rgba(0,0,0,0.45)' : 'none',
          }}
        >
          <div style={{ display: 'grid', gap: 8, padding: '12px 14px' }}>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setNavOpen(false)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 0.8,
                    textDecoration: 'none',
                    background: active ? '#00e676' : '#111',
                    color: active ? '#000' : '#777',
                    border: `1px solid ${active ? '#00e676' : '#222'}`,
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {walletOpen && (
        <div
          onClick={() => setWalletOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.64)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 392,
              padding: 18,
              background: '#101010',
              borderColor: '#2a2a2a',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Connect wallet</div>
                <div style={{ fontSize: 11, color: '#666', lineHeight: 1.5 }}>Choose a provider to continue with this mock wallet flow.</div>
              </div>
              <button
                type="button"
                onClick={() => setWalletOpen(false)}
                aria-label="Close wallet selector"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: '1px solid #2a2a2a',
                  background: '#151515',
                  color: '#777',
                  fontSize: 16,
                  lineHeight: 1,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              {WALLET_PROVIDERS.map((provider) => (
                <button
                  key={provider.name}
                  type="button"
                  onClick={() => connectWallet(provider.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid #222',
                    background: connectedWallet === provider.name ? '#0a1a0f' : '#0d0d0d',
                    color: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: provider.bg,
                      border: `1px solid ${provider.border}`,
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={provider.logo}
                      alt={`${provider.name} logo`}
                      width={provider.fullBleed ? 34 : 22}
                      height={provider.fullBleed ? 34 : 22}
                      style={{
                        width: provider.fullBleed ? '100%' : 22,
                        height: provider.fullBleed ? '100%' : 22,
                        objectFit: provider.fullBleed ? 'cover' : 'contain',
                      }}
                    />
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 800, marginBottom: 2 }}>{provider.name}</span>
                    <span style={{ display: 'block', fontSize: 10, color: '#666' }}>{provider.type}</span>
                  </span>
                  {connectedWallet === provider.name && (
                    <span style={{ fontSize: 10, color: '#00e676', fontWeight: 800 }}>CONNECTED</span>
                  )}
                </button>
              ))}
            </div>

            {connectedWallet && (
              <button
                type="button"
                onClick={() => {
                  setConnectedWallet(null)
                  setWalletOpen(false)
                }}
                style={{
                  width: '100%',
                  marginTop: 12,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #333',
                  background: 'transparent',
                  color: '#888',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                DISCONNECT
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
