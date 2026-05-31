'use client'

import { useState } from 'react'
import Link from 'next/link'
import VaultCard from '@/components/VaultCard'
import { VAULTS, USER_POSITIONS } from '@/data/vaults'
import { formatCurrency } from '@/lib/utils'
import { VaultCategory } from '@/lib/types'

// ─── Category definitions ────────────────────────────────────────────────────

const CATEGORIES: {
  id: VaultCategory | 'ALL'
  label: string
  tagline: string
  description: string
  howItWorks: string
  apyRange: string
  riskRange: string
  color: string
  bg: string
  icon: string
}[] = [
  {
    id: 'LP',
    label: 'Liquidity Provider',
    tagline: 'Earn from every swap',
    description: 'Deposit stablecoins into DEX liquidity pools across Aptos protocols. Your funds power trades and you collect the fees — no directional exposure, no active trading.',
    howItWorks: 'Funds auto-route across Tapp Exchange, Moar, Hyperion & Aries Markets. Smart rebalancing captures the highest LP fee rate at all times.',
    apyRange: '15 – 30%',
    riskRange: 'LOW',
    color: '#00e676',
    bg: '#0a1a0f',
    icon: '💧',
  },
  {
    id: 'TRADING',
    label: 'Trading Strategies',
    tagline: 'Algo-powered market returns',
    description: 'Automated trading strategies — EMA, Fibonacci, Grid DCA, ORB, Markov — that actively trade the market to generate returns. Higher upside, higher variance.',
    howItWorks: 'Algorithms execute trades based on technical signals (EMA crossovers, Fibonacci retracements, grid levels). Profits are compounded automatically.',
    apyRange: '15 – 38%',
    riskRange: 'LOW – ADVANCED',
    color: '#f97316',
    bg: '#1a0e00',
    icon: '📈',
  },
  {
    id: 'DELTA_NEUTRAL',
    label: 'Delta Neutral',
    tagline: 'Profit whether up or down',
    description: 'Market-neutral positions that earn regardless of price direction. Long + short positions cancel out directional risk — profit comes from funding rate collection on HyperLiquid.',
    howItWorks: 'Equal long/short perpetual positions opened on HyperLiquid. When the funding rate is positive, shorts collect from longs — that spread is your yield.',
    apyRange: '20 – 35%',
    riskRange: 'MEDIUM',
    color: '#a78bfa',
    bg: '#0d0a1a',
    icon: '⚖️',
  },
]

const RISK_FILTERS = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'ADVANCED'] as const

const SORT_OPTIONS = [
  { id: 'apy',    label: 'Top APY' },
  { id: 'tvl',    label: 'Largest TVL' },
  { id: 'newest', label: 'Newest' },
] as const

// ─── Page ────────────────────────────────────────────────────────────────────

export default function VaultsPage() {
  const [category, setCategory] = useState<VaultCategory | 'ALL'>('ALL')
  const [risk, setRisk]         = useState<string>('ALL')
  const [search, setSearch]     = useState('')
  const [sort, setSort]         = useState<'apy' | 'tvl' | 'newest'>('apy')
  const [expandedCat, setExpandedCat] = useState<VaultCategory | null>(null)

  const totalTVL          = VAULTS.reduce((s, v) => s + v.tvl, 0)
  const userTotalValue    = USER_POSITIONS.reduce((s, p) => s + p.currentValue, 0)
  const userTotalPnL      = USER_POSITIONS.reduce((s, p) => s + p.unrealizedPnL, 0)
  const maxAPY            = VAULTS.reduce((m, v) => Math.max(m, v.apy), 0)

  const filteredVaults = VAULTS
    .filter((v) => {
      if (category !== 'ALL' && v.category !== category) return false
      if (risk !== 'ALL' && v.riskLevel !== risk) return false
      if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'apy') return b.apy - a.apy
      if (sort === 'tvl') return b.tvl - a.tvl
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const userPositionMap = Object.fromEntries(USER_POSITIONS.map((p) => [p.vaultId, p.currentValue]))

  const catVaultCount = (id: VaultCategory) => VAULTS.filter(v => v.category === id).length
  const catAvgAPY     = (id: VaultCategory) => {
    const vs = VAULTS.filter(v => v.category === id)
    return vs.reduce((s, v) => s + v.apy, 0) / vs.length
  }

  return (
    <div className="page-wrap">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{ paddingTop: 36, paddingBottom: 32 }}>
        <div style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: 2, marginBottom: 10 }}>
          MONEYFI · APTOS VAULTS
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="hero-title" style={{ marginBottom: 6 }}>
              EARN UP TO{' '}
              <span className="gradient-text">{maxAPY.toFixed(2)}%</span> APY
            </h1>
            <p style={{ fontSize: 14, color: '#555' }}>
              Choose your strategy · Set risk appetite · Start earning automatically
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: '10px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1 }}>TOTAL TVL</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{formatCurrency(totalTVL, true)}</div>
            </div>
            {userTotalValue > 0 && (
              <div className="card" style={{ padding: '10px 16px', textAlign: 'center', borderColor: '#1a3a2a', background: '#0a1a0f' }}>
                <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1 }}>MY PORTFOLIO</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#00e676' }}>{formatCurrency(userTotalValue, true)}</div>
                <div style={{ fontSize: 10, color: '#00e676' }}>+{formatCurrency(userTotalPnL)} PnL</div>
              </div>
            )}
            <Link href="/create" style={{ textDecoration: 'none' }}>
              <button className="btn-primary green-glow" style={{ padding: '10px 20px', fontSize: 13 }}>
                + Create Vault
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Category selector cards ───────────────────────────── */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: '#444', fontWeight: 600, letterSpacing: 1.5, marginBottom: 14 }}>
          SELECT STRATEGY TYPE
        </div>
        <div className="category-grid">
          {CATEGORIES.map((cat) => {
            const active  = category === cat.id
            const vCount  = catVaultCount(cat.id as VaultCategory)
            const avgAPY  = catAvgAPY(cat.id as VaultCategory)
            const showExp = expandedCat === cat.id

            return (
              <div
                key={cat.id}
                onClick={() => {
                  setCategory(active ? 'ALL' : cat.id as VaultCategory)
                  setExpandedCat(showExp ? null : cat.id as VaultCategory)
                }}
                style={{
                  background: active ? cat.bg : '#0f0f0f',
                  border: `1px solid ${active ? cat.color + '60' : '#1e1e1e'}`,
                  borderRadius: 12,
                  padding: '16px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Glow accent when active */}
                {active && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: cat.color, borderRadius: '12px 12px 0 0',
                  }} />
                )}

                {/* Icon + label row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontSize: 22 }}>{cat.icon}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: active ? cat.color : '#444',
                      background: active ? cat.color + '20' : '#1a1a1a',
                      padding: '2px 8px', borderRadius: 20, letterSpacing: 0.5,
                    }}>
                      {vCount} vault{vCount !== 1 ? 's' : ''}
                    </span>
                    {active && (
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: cat.color }} />
                    )}
                  </div>
                </div>

                <div style={{ fontSize: 14, fontWeight: 800, color: active ? '#fff' : '#aaa', marginBottom: 2, lineHeight: 1.2 }}>
                  {cat.label}
                </div>
                <div style={{ fontSize: 11, color: active ? cat.color : '#555', fontWeight: 600, marginBottom: 10 }}>
                  {cat.tagline}
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 9, color: '#555', letterSpacing: 0.8 }}>AVG APY</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: active ? cat.color : '#666' }}>
                      {avgAPY.toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ width: 1, background: '#222' }} />
                  <div>
                    <div style={{ fontSize: 9, color: '#555', letterSpacing: 0.8 }}>RISK</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: active ? '#ccc' : '#555' }}>
                      {cat.riskRange}
                    </div>
                  </div>
                  <div style={{ width: 1, background: '#222' }} />
                  <div>
                    <div style={{ fontSize: 9, color: '#555', letterSpacing: 0.8 }}>APY RANGE</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: active ? '#ccc' : '#555' }}>
                      {cat.apyRange}
                    </div>
                  </div>
                </div>

                {/* Expanded explanation */}
                {showExp && (
                  <div style={{
                    marginTop: 14, paddingTop: 14,
                    borderTop: `1px solid ${cat.color}30`,
                  }}>
                    <p style={{ fontSize: 12, color: '#999', lineHeight: 1.6, marginBottom: 8 }}>
                      {cat.description}
                    </p>
                    <div style={{ background: '#0a0a0a', borderRadius: 6, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, color: cat.color, fontWeight: 700, letterSpacing: 0.8, marginBottom: 4 }}>
                        HOW IT WORKS
                      </div>
                      <p style={{ fontSize: 11, color: '#666', lineHeight: 1.6 }}>
                        {cat.howItWorks}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* "All" toggle */}
        {category !== 'ALL' && (
          <div style={{ marginTop: 10, textAlign: 'center' }}>
            <button
              onClick={() => { setCategory('ALL'); setExpandedCat(null) }}
              style={{
                background: 'none', border: 'none', color: '#555', fontSize: 12,
                cursor: 'pointer', textDecoration: 'underline',
              }}
            >
              ✕ Clear filter — show all {VAULTS.length} vaults
            </button>
          </div>
        )}
      </div>

      {/* ── My Active Positions ───────────────────────────────── */}
      {USER_POSITIONS.length > 0 && (
        <div style={{ marginBottom: 32, marginTop: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1.2 }}>
              MY ACTIVE POSITIONS
            </h2>
            <Link href="/create" style={{ fontSize: 12, color: '#00e676', textDecoration: 'none', fontWeight: 600 }}>
              + Add →
            </Link>
          </div>
          <div className="positions-grid">
            {USER_POSITIONS.map((pos) => {
              const vault = VAULTS.find((v) => v.id === pos.vaultId)!
              const catMeta = CATEGORIES.find(c => c.id === vault.category)
              return (
                <Link key={pos.vaultId} href={`/vault/${pos.vaultId}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-hover" style={{ padding: 14, borderColor: '#1a3a2a', background: '#0a1a0f' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 10, color: catMeta?.color ?? '#888' }}>
                            {catMeta?.icon} {catMeta?.label}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{vault.name}</div>
                        <div style={{ fontSize: 11, color: '#555' }}>{vault.apy}% APY</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{formatCurrency(pos.currentValue)}</div>
                        <div style={{ fontSize: 11, color: '#00e676' }}>+{formatCurrency(pos.unrealizedPnL)} ({pos.unrealizedPnLPercent.toFixed(1)}%)</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      {[
                        { label: 'DEPOSITED', value: formatCurrency(pos.deposited), color: '#888' },
                        { label: 'EARNED', value: `+${formatCurrency(pos.earnedYield)}`, color: '#00e676' },
                        { label: 'UNREAL. PnL', value: `${pos.unrealizedPnLPercent >= 0 ? '+' : ''}${pos.unrealizedPnLPercent.toFixed(2)}%`, color: pos.unrealizedPnL >= 0 ? '#00e676' : '#ef4444' },
                      ].map((s) => (
                        <div key={s.label}>
                          <div style={{ fontSize: 9, color: '#444', marginBottom: 1 }}>{s.label}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.value}</div>
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

      {/* ── Vault list ────────────────────────────────────────── */}
      <div id="vaults" style={{ marginTop: 28 }}>

        {/* Section header */}
        <div className="vaults-header">
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
              {category === 'ALL'
                ? 'ALL VAULTS'
                : CATEGORIES.find(c => c.id === category)?.label.toUpperCase() + ' VAULTS'}
              <span style={{ color: '#333', fontSize: 12, fontWeight: 400, marginLeft: 8 }}>
                {filteredVaults.length} listed
              </span>
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                style={{
                  padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', border: 'none',
                  background: sort === s.id ? '#00e676' : '#1a1a1a',
                  color: sort === s.id ? '#000' : '#555',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar" style={{ marginBottom: 20 }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', background: '#111',
            border: '1px solid #222', borderRadius: 8, padding: '7px 12px', gap: 8,
          }}>
            <span style={{ fontSize: 13, color: '#444' }}>🔍</span>
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vaults..."
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#fff', width: '100%', minWidth: 0 }}
            />
          </div>

          {/* Risk chips */}
          <div className="filter-chips">
            {RISK_FILTERS.map((r) => (
              <button
                key={r}
                onClick={() => setRisk(r)}
                style={{
                  flexShrink: 0, padding: '5px 12px', borderRadius: 6,
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  border: '1px solid',
                  borderColor: risk === r ? '#888' : '#222',
                  background: risk === r ? '#1a1a1a' : 'transparent',
                  color: risk === r ? '#fff' : '#555',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
              >
                {r === 'ALL' ? 'All Risks' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Category context banner (shown when a category is selected) */}
        {category !== 'ALL' && (() => {
          const meta = CATEGORIES.find(c => c.id === category)!
          return (
            <div style={{
              background: meta.bg, border: `1px solid ${meta.color}30`,
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 20 }}>{meta.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: meta.color, marginBottom: 2 }}>
                  {meta.label}
                </div>
                <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>
                  {meta.description}
                </div>
              </div>
            </div>
          )
        })()}

        {/* Grid */}
        {filteredVaults.length > 0 ? (
          <div className="vault-grid">
            {filteredVaults.map((vault) => (
              <VaultCard key={vault.id} vault={vault} userDeposited={userPositionMap[vault.id]} />
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
