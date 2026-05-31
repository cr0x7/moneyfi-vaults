'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getVaultById, getUserPosition } from '@/data/vaults'
import { TRADING_STATS, DELTA_STATS } from '@/data/strategyStats'
import DepositPanel from '@/components/DepositPanel'
import APYChart from '@/components/APYChart'
import TVLChart from '@/components/TVLChart'
import ProtocolAllocation from '@/components/ProtocolAllocation'
import TradingStatsPanel from '@/components/TradingStats'
import DeltaNeutralStatsPanel from '@/components/DeltaNeutralStats'
import { formatCurrency, formatDate, riskBgColor } from '@/lib/utils'

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  LP:            { label: 'Liquidity Provider', icon: '💧', color: '#00e676' },
  TRADING:       { label: 'Trading Strategy',   icon: '📈', color: '#f97316' },
  DELTA_NEUTRAL: { label: 'Delta Neutral',       icon: '⚖️', color: '#a78bfa' },
}

export default function VaultDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const vault    = getVaultById(id)
  const position = getUserPosition(id)

  if (!vault) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <div style={{ fontSize: 14, color: '#555' }}>Vault not found.</div>
        <Link href="/" style={{ color: '#00e676', textDecoration: 'none', fontSize: 13, marginTop: 12, display: 'inline-block' }}>
          ← Back to Vaults
        </Link>
      </div>
    )
  }

  const catMeta         = CATEGORY_META[vault.category]
  const tvlChangePos    = vault.tvlChange >= 0
  const tradingStats    = TRADING_STATS[vault.id]
  const deltaStats      = DELTA_STATS[vault.id]

  return (
    <div className="page-wrap" style={{ paddingTop: 20, paddingBottom: 0 }}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#555' }}>
        <Link href="/" style={{ color: '#555', textDecoration: 'none' }}>Vaults</Link>
        <span>/</span>
        <span style={{ fontSize: 11, color: catMeta.color }}>{catMeta.icon} {catMeta.label}</span>
        <span>/</span>
        <span style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vault.name}</span>
      </div>

      <div className="detail-grid">
        {/* ── Left column ───────────────────────────────────── */}
        <div>

          {/* Vault header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 10, fontWeight: 700, color: catMeta.color,
                background: catMeta.color + '18', border: `1px solid ${catMeta.color}30`,
                padding: '3px 10px', borderRadius: 20,
              }}>
                {catMeta.icon} {catMeta.label}
              </span>
              <span className={`border px-2 py-0.5 rounded text-xs font-semibold ${riskBgColor(vault.riskLevel)}`} style={{ fontSize: 10 }}>
                {vault.riskLevel}
              </span>
              {vault.audited && (
                <span style={{ fontSize: 10, color: '#00e676', background: '#00e67615', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                  ✓ Audited
                </span>
              )}
            </div>
            <h1 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 900, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>
              {vault.name}
            </h1>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
              {vault.description}
            </p>
          </div>

          {/* Key metrics — always shown */}
          <div className="metrics-grid">
            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 5 }}>TOTAL APY</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: catMeta.color, lineHeight: 1 }}>{vault.apy.toFixed(2)}%</div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>{vault.baseApy.toFixed(2)}% + {vault.boostApy.toFixed(2)}% boost</div>
            </div>
            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 5 }}>TVL</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{formatCurrency(vault.tvl, true)}</div>
              <div style={{ fontSize: 10, color: tvlChangePos ? '#00e676' : '#ef4444', marginTop: 4 }}>
                {tvlChangePos ? '↑' : '↓'} {Math.abs(vault.tvlChange)}% this week
              </div>
            </div>
            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 5 }}>MIN DEPOSIT</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 }}>${vault.minDeposit}</div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>{vault.supportedTokens.join(', ')}</div>
            </div>
            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 5 }}>NPOINTS</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{(vault.npoints ?? 0).toLocaleString()}</div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>earned by depositors</div>
            </div>
          </div>

          {/* ── LP: APY chart + TVL chart + Protocol Allocation ── */}
          {vault.category === 'LP' && (
            <>
              <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <APYChart data={vault.apyHistory} />
              </div>
              <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <TVLChart data={vault.tvlHistory} />
              </div>
              <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <ProtocolAllocation protocols={vault.protocols} />
              </div>
            </>
          )}

          {/* ── TRADING: full analytics panel + APY chart ──────── */}
          {vault.category === 'TRADING' && tradingStats && (
            <>
              <TradingStatsPanel stats={tradingStats} />
              <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <APYChart data={vault.apyHistory} />
              </div>
            </>
          )}

          {/* ── DELTA NEUTRAL: funding rate dashboard ──────────── */}
          {vault.category === 'DELTA_NEUTRAL' && deltaStats && (
            <DeltaNeutralStatsPanel stats={deltaStats} />
          )}

          {/* Recent Transactions — LP only (has actual tx data) */}
          {vault.transactions.length > 0 && (
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 11, color: '#666', fontWeight: 600, letterSpacing: 1 }}>RECENT ACTIVITY</span>
                <button style={{ fontSize: 11, color: '#00e676', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  ALL TRANSACTIONS →
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {vault.transactions.map((tx, i) => (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: i < vault.transactions.length - 1 ? '1px solid #1a1a1a' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: tx.type === 'DEPOSIT' ? '#0a1a0f' : '#1a1a1a',
                        border: `1px solid ${tx.type === 'DEPOSIT' ? '#00e67640' : '#333'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                      }}>
                        {tx.type === 'DEPOSIT' ? '↓' : tx.type === 'WITHDRAW' ? '↑' : '→'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                          {tx.type === 'DEPOSIT' ? `Deposit ${tx.amount.toFixed(2)} ${tx.token}` :
                           tx.type === 'WITHDRAW' ? `Withdraw ${tx.amount.toFixed(2)} ${tx.token}` :
                           `Transfer ${tx.amount.toFixed(2)} ${tx.token} → ${tx.to}`}
                        </div>
                        <div style={{ fontSize: 10, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tx.from && <span>{tx.from}</span>}
                          <span style={{ marginLeft: 6 }}>{formatDate(tx.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: tx.type === 'DEPOSIT' ? '#00e676' : '#fff' }}>
                      {tx.type === 'DEPOSIT' ? '+' : ''}{formatCurrency(tx.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column — Deposit Panel ───────────────────── */}
        <div className="deposit-sticky">
          <DepositPanel vault={vault} position={position} />
        </div>
      </div>
    </div>
  )
}
