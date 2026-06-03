'use client'

import { useState } from 'react'
import Link from 'next/link'
import VaultCard from '@/components/VaultCard'
import { VAULTS, USER_POSITIONS } from '@/data/vaults'
import { TRADING_STATS } from '@/data/strategyStats'
import { formatCurrency } from '@/lib/utils'
import { VaultCategory } from '@/lib/types'

// ─── Category metadata (used in filter tabs + context line) ─────────────────

const CATEGORY_META: Record<VaultCategory, { label: string; icon: string; color: string; bg: string; tagline: string }> = {
  LP: {
    label: 'Stable LP Vault',
    icon: '💧',
    color: '#00e676',
    bg: '#0a1a0f',
    tagline: 'Provide liquidity to Aptos DEX protocols — earn trading fees automatically with minimal directional risk.',
  },
  TRADING: {
    label: 'Senti Trading',
    icon: '🤖',
    color: '#f97316',
    bg: '#1a0e00',
    tagline: 'Algo-managed trading vaults powered by Senti × Exness on BNB Chain. Three risk tiers: Conservative (~50%), Balanced (~100%), Aggressive (~200%) target APR.',
  },
  DELTA_NEUTRAL: {
    label: 'Delta Neutral',
    icon: '⚖️',
    color: '#a78bfa',
    bg: '#0d0a1a',
    tagline: 'Equal long + short perpetuals on HyperLiquid — earn funding rates regardless of market direction.',
  },
}

const RISK_FILTERS  = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'ADVANCED'] as const
const SORT_OPTIONS  = [
  { id: 'apy',    label: 'Top APY' },
  { id: 'tvl',    label: 'Largest TVL' },
  { id: 'newest', label: 'Newest' },
] as const

function getVaultMdd(vaultId: string, category: VaultCategory) {
  return category === 'TRADING' ? (TRADING_STATS[vaultId]?.maxDrawdown ?? 0) : 0
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function VaultsPage() {
  const [category, setCategory] = useState<VaultCategory | 'ALL'>('ALL')
  const [risk,     setRisk]     = useState<string>('ALL')
  const [search,   setSearch]   = useState('')
  const [sort,     setSort]     = useState<'apy' | 'tvl' | 'newest'>('apy')

  const totalTVL       = VAULTS.reduce((s, v) => s + v.tvl, 0)
  const userTotalValue = USER_POSITIONS.reduce((s, p) => s + p.currentValue, 0)
  const userTotalPnL   = USER_POSITIONS.reduce((s, p) => s + p.unrealizedPnL, 0)
  const maxAPY         = VAULTS.reduce((m, v) => Math.max(m, v.apy), 0)

  const filteredVaults = VAULTS
    .filter((v) => {
      if (category !== 'ALL' && v.category !== category) return false
      if (risk !== 'ALL' && v.riskLevel !== risk) return false
      if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'apy')    return b.apy - a.apy
      if (sort === 'tvl')    return b.tvl - a.tvl
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const userPositionMap = Object.fromEntries(USER_POSITIONS.map((p) => [p.vaultId, p.currentValue]))
  const activeCatMeta   = category !== 'ALL' ? CATEGORY_META[category] : null

  return (
    <div className="page-wrap">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{ paddingTop: 36, paddingBottom: 28 }}>
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

      {/* ── My Active Positions ───────────────────────────────── */}
      {USER_POSITIONS.length > 0 && (
        <div style={{ marginBottom: 32 }}>
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
              const vault   = VAULTS.find((v) => v.id === pos.vaultId)!
              const catMeta = CATEGORY_META[vault.category]
              const maxDrawdown = getVaultMdd(vault.id, vault.category)
              return (
                <Link key={pos.vaultId} href={`/vault/${pos.vaultId}`} style={{ textDecoration: 'none', display: 'flex' }}>
                  <div
                    className="card card-hover"
                    style={{
                      padding: 14,
                      borderColor: catMeta.color + '30',
                      background: catMeta.bg,
                      display: 'flex', flexDirection: 'column', width: '100%',
                    }}
                  >
                    {/* Category tag */}
                    <div style={{ fontSize: 10, color: catMeta.color, fontWeight: 600, marginBottom: 6 }}>
                      {catMeta.icon} {catMeta.label}
                    </div>

                    {/* Vault name + APY */}
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2, lineHeight: 1.3 }}>
                      {vault.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#555', marginBottom: 10 }}>
                      <span>{vault.apy}% APY</span>
                      <span style={{ color: '#333' }}>·</span>
                      <span style={{ color: maxDrawdown > 0 ? '#ef4444' : '#00e676' }}>MDD {maxDrawdown}%</span>
                    </div>

                    {/* Value + PnL */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                      paddingBottom: 10, marginBottom: 10,
                      borderBottom: '1px solid #1a1a1a',
                    }}>
                      <div>
                        <div style={{ fontSize: 9, color: '#444', letterSpacing: 0.8, marginBottom: 2 }}>CURRENT VALUE</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                          {formatCurrency(pos.currentValue)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 9, color: '#444', letterSpacing: 0.8, marginBottom: 2 }}>UNREALIZED PnL</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: pos.unrealizedPnL >= 0 ? '#00e676' : '#ef4444' }}>
                          +{formatCurrency(pos.unrealizedPnL)}
                        </div>
                        <div style={{ fontSize: 11, color: pos.unrealizedPnL >= 0 ? '#00e676' : '#ef4444' }}>
                          ({pos.unrealizedPnLPercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>

                    {/* Stats — pinned to bottom */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 'auto' }}>
                      {[
                        { label: 'DEPOSITED',    value: formatCurrency(pos.deposited),    color: '#888' },
                        { label: 'EARNED YIELD', value: `+${formatCurrency(pos.earnedYield)}`, color: '#00e676' },
                        { label: 'MDD', value: `${maxDrawdown}%`, color: maxDrawdown > 0 ? '#ef4444' : '#00e676' },
                      ].map((s) => (
                        <div key={s.label}>
                          <div style={{ fontSize: 9, color: '#444', marginBottom: 2, letterSpacing: 0.6 }}>{s.label}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.value}</div>
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
      <div id="vaults">

        {/* Header row: title + category tabs + sort */}
        <div style={{ marginBottom: 14 }}>
          {/* Top: title + sort */}
          <div className="vaults-header" style={{ marginBottom: 10 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
              {activeCatMeta
                ? <>{activeCatMeta.icon} {activeCatMeta.label.toUpperCase()} VAULTS</>
                : 'ALL VAULTS'
              }
              <span style={{ color: '#333', fontSize: 12, fontWeight: 400, marginLeft: 8 }}>
                {filteredVaults.length} listed
              </span>
            </h2>
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

          {/* Filter row: category tabs + risk chips + search */}
          <div className="filters-bar">
            {/* Category tabs */}
            <div className="filter-chips">
              <button
                onClick={() => setCategory('ALL')}
                style={{
                  flexShrink: 0, padding: '5px 12px', borderRadius: 6,
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  border: '1px solid',
                  borderColor: category === 'ALL' ? '#555' : '#222',
                  background: category === 'ALL' ? '#1e1e1e' : 'transparent',
                  color: category === 'ALL' ? '#fff' : '#555',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
              >
                All Types
              </button>
              {(Object.entries(CATEGORY_META) as [VaultCategory, typeof CATEGORY_META[VaultCategory]][]).map(([id, meta]) => {
                const active = category === id
                return (
                  <button
                    key={id}
                    onClick={() => setCategory(active ? 'ALL' : id)}
                    style={{
                      flexShrink: 0, padding: '5px 12px', borderRadius: 6,
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      border: '1px solid',
                      borderColor: active ? meta.color + '80' : '#222',
                      background: active ? meta.bg : 'transparent',
                      color: active ? meta.color : '#555',
                      transition: 'all 0.15s', whiteSpace: 'nowrap',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <span>{meta.icon}</span> {meta.label}
                  </button>
                )
              })}
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

            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', background: '#111',
              border: '1px solid #222', borderRadius: 8, padding: '6px 12px', gap: 8,
            }}>
              <span style={{ fontSize: 12, color: '#444' }}>🔍</span>
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vaults..."
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: '#fff', width: '100%', minWidth: 0 }}
              />
            </div>
          </div>

          {/* Category description line — 1 line only, appears when filtered */}
          {activeCatMeta && (
            <div style={{
              fontSize: 12, color: '#555', lineHeight: 1.5,
              padding: '8px 12px',
              borderLeft: `2px solid ${activeCatMeta.color}60`,
              marginTop: 4,
            }}>
              {activeCatMeta.tagline}
            </div>
          )}
        </div>

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
