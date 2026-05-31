'use client'

import { useState } from 'react'
import Link from 'next/link'
import VaultCard from '@/components/VaultCard'
import { VAULTS, USER_POSITIONS } from '@/data/vaults'
import { formatCurrency } from '@/lib/utils'

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
  { id: 'DELTA_NEUTRAL', label: 'Delta Neutral' },
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
  const maxAPY = VAULTS.reduce((m, v) => Math.max(m, v.apy), 0)

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
    <div className="page-wrap">

      {/* Hero */}
      <div className="hero-grid">

        {/* Left: copy */}
        <div>
          <div style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: 2, marginBottom: 12 }}>
            APTOS MULTI-STRATEGY VAULTS
          </div>
          <h1 className="hero-title">
            EARN UP TO{' '}
            <span className="gradient-text">{maxAPY.toFixed(2)}%</span>
            <br />APY
          </h1>
          <p style={{ fontSize: 15, color: '#666', marginBottom: 24 }}>
            MAXIMIZE YIELD. <span style={{ color: '#00e676' }}>AUTOMATICALLY.</span>
          </p>
          <div className="hero-btns">
            <a href="#vaults" style={{ textDecoration: 'none' }}>
              <button className="btn-primary green-glow" style={{ padding: '12px 20px', fontSize: 14, letterSpacing: 0.8, width: '100%' }}>
                Browse Vaults →
              </button>
            </a>
            <Link href="/create" style={{ textDecoration: 'none' }}>
              <button className="btn-ghost" style={{ padding: '12px 20px', fontSize: 14, width: '100%' }}>
                + Create Vault
              </button>
            </Link>
          </div>
        </div>

        {/* Right: stats 2×2 */}
        <div className="hero-stats">
          {[
            {
              label: 'TOTAL VOLUME',
              value: formatCurrency(totalTVL, true),
              sub: '↑ 6.26% this week',
              subColor: '#00e676',
            },
            {
              label: 'AVG APY',
              value: `${avgAPY.toFixed(2)}%`,
              sub: `Base ${(avgAPY * 0.7).toFixed(1)}% · Boost ${(avgAPY * 0.3).toFixed(1)}%`,
              subColor: '#00e676',
            },
            {
              label: 'ACTIVE VAULTS',
              value: String(VAULTS.length),
              sub: `${VAULTS.filter((v) => v.featured).length} featured`,
              subColor: '#666',
            },
            {
              label: 'YOUR PORTFOLIO',
              value: userTotalDeposited > 0 ? formatCurrency(userTotalDeposited, true) : '$0',
              sub: userTotalPnL > 0 ? `+${formatCurrency(userTotalPnL)} PnL` : 'Connect wallet',
              subColor: userTotalPnL > 0 ? '#00e676' : '#555',
            },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 5 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 2 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 10, color: stat.subColor }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* My Active Positions */}
      {USER_POSITIONS.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 0.8 }}>
              MY ACTIVE POSITIONS
            </h2>
            <Link href="/create" style={{ fontSize: 12, color: '#00e676', textDecoration: 'none', fontWeight: 600 }}>
              + Add position →
            </Link>
          </div>
          <div className="positions-grid">
            {USER_POSITIONS.map((pos) => {
              const vault = VAULTS.find((v) => v.id === pos.vaultId)!
              return (
                <Link key={pos.vaultId} href={`/vault/${pos.vaultId}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="card card-hover"
                    style={{ padding: 16, borderColor: '#1a3a2a', background: '#0a1a0f' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                          {vault.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#555' }}>{vault.apy}% APY</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
                          {formatCurrency(pos.currentValue)}
                        </div>
                        <div style={{ fontSize: 11, color: '#00e676' }}>
                          +{formatCurrency(pos.unrealizedPnL)} ({pos.unrealizedPnLPercent.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      {[
                        { label: 'DEPOSITED', value: formatCurrency(pos.deposited), color: '#aaa' },
                        { label: 'EARNED', value: `+${formatCurrency(pos.earnedYield)}`, color: '#00e676' },
                        { label: 'UNREALIZED PnL', value: `${pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnLPercent.toFixed(2)}%`, color: pos.unrealizedPnL >= 0 ? '#00e676' : '#ef4444' },
                      ].map((s) => (
                        <div key={s.label}>
                          <div style={{ fontSize: 9, color: '#555', marginBottom: 2 }}>{s.label}</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.value}</div>
                        </div>
                      ))}
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
        {/* Header row */}
        <div className="vaults-header">
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
            VAULTS{' '}
            <span style={{ color: '#444', fontSize: 12, fontWeight: 400 }}>{filteredVaults.length} listed</span>
          </h2>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#555' }}>Sort:</span>
            {(['apy', 'tvl', 'newest'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: sort === s ? '#00e676' : '#1a1a1a',
                  color: sort === s ? '#000' : '#555',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {s === 'apy' ? 'Top APY' : s === 'tvl' ? 'TVL' : 'Newest'}
              </button>
            ))}
          </div>
        </div>

        {/* Filters bar */}
        <div className="filters-bar">
          {/* Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#111',
              border: '1px solid #222',
              borderRadius: 8,
              padding: '7px 12px',
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
                width: '100%',
                minWidth: 0,
              }}
            />
          </div>

          {/* Strategy chips — horizontally scrollable */}
          <div className="filter-chips">
            {STRATEGY_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setStratFilter(f.id)}
                style={{
                  flexShrink: 0,
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
                  whiteSpace: 'nowrap',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Risk chips — horizontally scrollable */}
          <div className="filter-chips">
            {RISK_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setRiskFilter(f.id)}
                style={{
                  flexShrink: 0,
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
                  whiteSpace: 'nowrap',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vault grid */}
        {filteredVaults.length > 0 ? (
          <div className="vault-grid">
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
