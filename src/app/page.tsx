'use client'

import { useState } from 'react'
import Link from 'next/link'
import VaultCard from '@/components/VaultCard'
import { VAULTS, USER_POSITIONS } from '@/data/vaults'
import { formatCurrency } from '@/lib/utils'
import { RiskLevel, StrategyType } from '@/lib/types'

const STRATEGY_FILTERS = [
  { id: 'ALL', label: 'All Strategies' },
  { id: 'STABLE_YIELD', label: 'Stable Yield' },
  { id: 'EMA_MIRROR', label: 'EMA Mirror' },
  { id: 'FIBONACCI', label: 'Fibonacci' },
  { id: 'EMA_CROSSOVER', label: 'EMA Crossover' },
  { id: 'GRID_DCA', label: 'Grid DCA' },
  { id: 'MARKOV', label: 'Markov' },
  { id: 'ORB', label: 'Open Range' },
  { id: 'MFR_DCA', label: 'MFR DCA' },
]

const RISK_FILTERS = [
  { id: 'ALL', label: 'All Levels' },
  { id: 'LOW', label: 'Low' },
  { id: 'MEDIUM', label: 'Medium' },
  { id: 'HIGH', label: 'High' },
  { id: 'ADVANCED', label: 'Advanced' },
]

export default function VaultsPage() {
  const [stratFilter, setStratFilter] = useState('ALL')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'apy' | 'tvl' | 'newest'>('apy')

  const totalTVL = VAULTS.reduce((s, v) => s + v.tvl, 0)
  const avgAPY = VAULTS.reduce((s, v) => s + v.apy, 0) / VAULTS.length
  const userTotalDeposited = USER_POSITIONS.reduce((s, p) => s + p.currentValue, 0)
  const userTotalPnL = USER_POSITIONS.reduce((s, p) => s + p.unrealizedPnL, 0)

  const filteredVaults = VAULTS
    .filter((v) => {
      if (stratFilter !== 'ALL' && v.strategy !== stratFilter) return false
      if (riskFilter !== 'ALL' && v.riskLevel !== riskFilter) return false
      if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'apy') return b.apy - a.apy
      if (sort === 'tvl') return b.tvl - a.tvl
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const userPositionMap = Object.fromEntries(USER_POSITIONS.map((p) => [p.vaultId, p.currentValue]))

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

      {/* Hero */}
      <div
        style={{
          paddingTop: 56,
          paddingBottom: 48,
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 40,
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: 2, marginBottom: 12 }}>
            APTOS MULTI-STRATEGY VAULTS
          </div>
          <h1 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1, marginBottom: 12 }}>
            EARN UP TO{' '}
            <span className="gradient-text">{VAULTS.reduce((m, v) => Math.max(m, v.apy), 0).toFixed(2)}%</span>
            <br />APY
          </h1>
          <p style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
            MAXIMIZE YIELD. <span style={{ color: '#00e676' }}>AUTOMATICALLY.</span>
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="#vaults" style={{ textDecoration: 'none' }}>
              <button className="btn-primary green-glow" style={{ padding: '12px 28px', fontSize: 14, letterSpacing: 0.8 }}>
                Browse Vaults →
              </button>
            </a>
            <Link href="/create" style={{ textDecoration: 'none' }}>
              <button className="btn-ghost" style={{ padding: '12px 28px', fontSize: 14 }}>
                + Create Your Vault
              </button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minWidth: 320 }}>
          {[
            { label: 'TOTAL VOLUME', value: formatCurrency(totalTVL, true), sub: '↑ 6.26% this week', subColor: '#00e676' },
            { label: 'AVG APY', value: `${avgAPY.toFixed(2)}%`, sub: `Base ${(avgAPY * 0.7).toFixed(2)}% · Boost ${(avgAPY * 0.3).toFixed(2)}%`, subColor: '#00e676' },
            { label: 'ACTIVE VAULTS', value: String(VAULTS.length), sub: `${VAULTS.filter(v => v.featured).length} featured`, subColor: '#666' },
            { label: 'YOUR PORTFOLIO', value: userTotalDeposited > 0 ? formatCurrency(userTotalDeposited, true) : '$0', sub: userTotalPnL > 0 ? `+${formatCurrency(userTotalPnL)} PnL` : 'Connect wallet to track', subColor: userTotalPnL > 0 ? '#00e676' : '#555' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card"
              style={{ padding: '14px 16px' }}
            >
              <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>{stat.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: stat.subColor }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* My Positions */}
      {USER_POSITIONS.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 0.8 }}>
              MY ACTIVE POSITIONS
            </h2>
            <Link href="/create" style={{ fontSize: 12, color: '#00e676', textDecoration: 'none', fontWeight: 600 }}>
              + Add position →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {USER_POSITIONS.map((pos) => {
              const vault = VAULTS.find((v) => v.id === pos.vaultId)!
              return (
                <Link key={pos.vaultId} href={`/vault/${pos.vaultId}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="card card-hover"
                    style={{
                      padding: 16,
                      borderColor: '#1a3a2a',
                      background: '#0a1a0f',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{vault.name}</div>
                        <div style={{ fontSize: 11, color: '#555' }}>{vault.apy}% APY</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{formatCurrency(pos.currentValue)}</div>
                        <div style={{ fontSize: 11, color: '#00e676' }}>+{formatCurrency(pos.unrealizedPnL)} ({pos.unrealizedPnLPercent.toFixed(1)}%)</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 9, color: '#555', marginBottom: 2 }}>DEPOSITED</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#aaa' }}>{formatCurrency(pos.deposited)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: '#555', marginBottom: 2 }}>EARNED</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#00e676' }}>+{formatCurrency(pos.earnedYield)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: '#555', marginBottom: 2 }}>UNREALIZED PnL</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: pos.unrealizedPnL >= 0 ? '#00e676' : '#ef4444' }}>
                          {pos.unrealizedPnL >= 0 ? '+' : ''}{pos.unrealizedPnLPercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Vaults section */}
      <div id="vaults">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
            VAULTS <span style={{ color: '#444', fontSize: 13 }}>{filteredVaults.length} listed</span>
          </h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#555' }}>Sort:</span>
            {(['apy', 'tvl', 'newest'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: sort === s ? '#00e676' : '#1a1a1a',
                  color: sort === s ? '#000' : '#555',
                  transition: 'all 0.2s',
                  letterSpacing: 0.5,
                }}
              >
                {s === 'apy' ? 'Top APY' : s === 'tvl' ? 'Largest TVL' : 'Newest'}
              </button>
            ))}
          </div>
        </div>

        {/* Filters bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#111',
              border: '1px solid #222',
              borderRadius: 8,
              padding: '6px 12px',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13, color: '#444' }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vaults..."
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: 13,
                color: '#fff',
                width: 160,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {STRATEGY_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setStratFilter(f.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: stratFilter === f.id ? '#00e676' : '#222',
                  background: stratFilter === f.id ? '#0a1a0f' : 'transparent',
                  color: stratFilter === f.id ? '#00e676' : '#555',
                  transition: 'all 0.15s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {RISK_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setRiskFilter(f.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: riskFilter === f.id ? '#888' : '#222',
                  background: riskFilter === f.id ? '#1a1a1a' : 'transparent',
                  color: riskFilter === f.id ? '#fff' : '#555',
                  transition: 'all 0.15s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vault grid */}
        {filteredVaults.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, paddingBottom: 48 }}>
            {filteredVaults.map((vault) => (
              <VaultCard
                key={vault.id}
                vault={vault}
                userDeposited={userPositionMap[vault.id]}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#444' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14 }}>No vaults match your filters</div>
          </div>
        )}
      </div>
    </div>
  )
}
