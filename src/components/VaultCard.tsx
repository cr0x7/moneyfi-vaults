'use client'

import Link from 'next/link'
import { Vault } from '@/lib/types'
import { formatCurrency, formatAPY, riskBgColor } from '@/lib/utils'

interface VaultCardProps {
  vault: Vault
  userDeposited?: number
}

const STRATEGY_LABEL: Record<string, string> = {
  STABLE_YIELD: 'Stable Yield',
  EMA_MIRROR: 'EMA Mirror',
  FIBONACCI: 'Fibonacci DCA',
  EMA_CROSSOVER: 'EMA Crossover',
  ORB: 'Open Range',
  GRID_DCA: 'Grid DCA',
  MARKOV: 'Markov Chain',
  MFR_DCA: 'MFR DCA',
  DELTA_NEUTRAL: 'Delta Neutral',
  CUSTOM: 'Custom',
}

export default function VaultCard({ vault, userDeposited }: VaultCardProps) {
  const tvlChangePositive = vault.tvlChange >= 0

  return (
    <Link href={`/vault/${vault.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="card card-hover"
        style={{
          padding: 20,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Featured badge */}
        {vault.featured && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: '#00e676',
              color: '#000',
              fontSize: 9,
              fontWeight: 800,
              padding: '3px 10px',
              borderBottomLeftRadius: 8,
              letterSpacing: 1,
            }}
          >
            FEATURED
          </div>
        )}

        {/* User deposited badge */}
        {userDeposited && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              background: '#1a3a2a',
              borderBottom: '1px solid #00e67640',
              borderRight: '1px solid #00e67640',
              color: '#00e676',
              fontSize: 9,
              fontWeight: 700,
              padding: '3px 10px',
              borderBottomRightRadius: 8,
              letterSpacing: 0.8,
            }}
          >
            ACTIVE
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#666',
                background: '#1a1a1a',
                padding: '2px 8px',
                borderRadius: 4,
                letterSpacing: 0.8,
              }}
            >
              {STRATEGY_LABEL[vault.strategy] || vault.strategy}
            </span>
            <span
              className={`border text-xs font-semibold px-2 py-0.5 rounded ${riskBgColor(vault.riskLevel)}`}
              style={{ fontSize: 10, letterSpacing: 0.6 }}
            >
              {vault.riskLevel}
            </span>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 4 }}>
            {vault.name}
          </h3>
          <p style={{ fontSize: 12, color: '#666', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {vault.description}
          </p>
        </div>

        {/* APY */}
        <div
          style={{
            background: '#0a1a0f',
            border: '1px solid #00e67630',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 10, color: '#00e676', fontWeight: 600, letterSpacing: 0.8, marginBottom: 2 }}>
            APY
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#00e676', lineHeight: 1 }}>
              {formatAPY(vault.apy)}
            </span>
            <div style={{ fontSize: 11, color: '#555' }}>
              <span style={{ color: '#444' }}>{formatAPY(vault.baseApy)} base</span>
              <span style={{ color: '#00e67680', marginLeft: 4 }}>+{formatAPY(vault.boostApy)} boost</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: '#555', marginBottom: 2, letterSpacing: 0.6 }}>TVL</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
              {formatCurrency(vault.tvl, true)}
            </div>
            <div style={{ fontSize: 11, color: tvlChangePositive ? '#00e676' : '#ef4444' }}>
              {tvlChangePositive ? '↑' : '↓'} {Math.abs(vault.tvlChange).toFixed(2)}% this week
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#555', marginBottom: 2, letterSpacing: 0.6 }}>MIN DEPOSIT</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
              ${vault.minDeposit}
            </div>
            <div style={{ fontSize: 11, color: '#555' }}>
              {vault.supportedTokens.join(' · ')}
            </div>
          </div>
        </div>

        {/* Protocol allocation mini-bar */}
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              height: 4,
              borderRadius: 2,
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            {vault.protocols.map((p) => (
              <div
                key={p.name}
                style={{ width: `${p.percentage}%`, background: p.color }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            {vault.protocols.slice(0, 3).map((p) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
                <span style={{ fontSize: 10, color: '#666' }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {vault.audited && (
            <span style={{ fontSize: 10, color: '#00e676', background: '#00e67615', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
              ✓ Audited
            </span>
          )}
          {vault.autoCompound && (
            <span style={{ fontSize: 10, color: '#888', background: '#1a1a1a', padding: '2px 8px', borderRadius: 4 }}>
              Auto-compound
            </span>
          )}
          {vault.noHiddenFees && (
            <span style={{ fontSize: 10, color: '#888', background: '#1a1a1a', padding: '2px 8px', borderRadius: 4 }}>
              No hidden fees
            </span>
          )}
        </div>

        {/* User position */}
        {userDeposited && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid #1a3a2a',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 11, color: '#666' }}>Your deposit</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#00e676' }}>
              {formatCurrency(userDeposited)}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
