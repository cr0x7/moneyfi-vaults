'use client'

import Link from 'next/link'
import { Vault } from '@/lib/types'
import { formatCurrency, formatAPY, riskBgColor } from '@/lib/utils'

interface VaultCardProps {
  vault: Vault
  userDeposited?: number
}

const STRATEGY_LABEL: Record<string, string> = {
  STABLE_YIELD:  'Stable Yield',
  EMA_MIRROR:    'EMA Mirror',
  FIBONACCI:     'Fibonacci DCA',
  EMA_CROSSOVER: 'EMA Crossover',
  ORB:           'Open Range Breakout',
  GRID_DCA:      'Grid DCA',
  MARKOV:        'Markov Chain',
  MFR_DCA:       'MFR DCA',
  DELTA_NEUTRAL: 'Delta Neutral',
  CUSTOM:        'Custom',
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  LP:            { label: 'Stable LP Vault',  icon: '💧', color: '#00e676', bg: '#0a1a0f' },
  TRADING:       { label: 'Senti Trading',    icon: '🤖', color: '#f97316', bg: '#1a0e00' },
  DELTA_NEUTRAL: { label: 'Delta Neutral',    icon: '⚖️', color: '#a78bfa', bg: '#0d0a1a' },
}

const SENTI_TIER_META: Record<string, { label: string; color: string }> = {
  CONSERVATIVE: { label: 'Conservative', color: '#00e676' },
  BALANCED:     { label: 'Balanced',     color: '#f59e0b' },
  AGGRESSIVE:   { label: 'Aggressive',   color: '#ef4444' },
}

export default function VaultCard({ vault, userDeposited }: VaultCardProps) {
  const tvlChangePositive = vault.tvlChange >= 0
  const catMeta    = CATEGORY_META[vault.category] ?? CATEGORY_META['TRADING']
  const tierMeta   = vault.sentiTier ? SENTI_TIER_META[vault.sentiTier] : null
  const isSenti    = vault.category === 'TRADING'
  const displayAPY = vault.targetApr ?? vault.apy

  return (
    <Link href={`/vault/${vault.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="card card-hover"
        style={{ padding: 18, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
      >
        {/* Top accent line = category color */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: catMeta.color, opacity: 0.5,
        }} />

        {/* Featured badge */}
        {vault.featured && (
          <div style={{
            position: 'absolute', top: 2, right: 0,
            background: '#00e676', color: '#000', fontSize: 9, fontWeight: 800,
            padding: '3px 10px', borderBottomLeftRadius: 8, letterSpacing: 1,
          }}>
            FEATURED
          </div>
        )}

        {/* User active badge */}
        {userDeposited && (
          <div style={{
            position: 'absolute', top: 2, left: 0,
            background: '#1a3a2a', borderBottom: '1px solid #00e67640', borderRight: '1px solid #00e67640',
            color: '#00e676', fontSize: 9, fontWeight: 700,
            padding: '3px 10px', borderBottomRightRadius: 8, letterSpacing: 0.8,
          }}>
            ACTIVE
          </div>
        )}

        {/* Category + risk row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 4 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: catMeta.bg, border: `1px solid ${catMeta.color}30`,
            borderRadius: 20, padding: '3px 10px',
          }}>
            <span style={{ fontSize: 11 }}>{catMeta.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: catMeta.color, letterSpacing: 0.4 }}>
              {catMeta.label}
            </span>
          </div>
          <span
            className={`border text-xs font-semibold px-2 py-0.5 rounded ${riskBgColor(vault.riskLevel)}`}
            style={{ fontSize: 10, letterSpacing: 0.6 }}
          >
            {vault.riskLevel}
          </span>
        </div>

        {/* Name + strategy */}
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 3 }}>
            {vault.name}
          </h3>
          <span style={{
            fontSize: 10, color: '#555', background: '#1a1a1a',
            padding: '2px 8px', borderRadius: 4, letterSpacing: 0.6,
          }}>
            {STRATEGY_LABEL[vault.strategy] ?? vault.strategy}
          </span>
        </div>

        {/* APY / Target APR */}
        <div style={{
          background: '#0a0a0a', border: `1px solid ${catMeta.color}25`,
          borderRadius: 8, padding: '10px 12px', marginBottom: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <span style={{ fontSize: 9, color: catMeta.color, fontWeight: 700, letterSpacing: 1 }}>
              {isSenti ? 'TARGET APR' : 'APY'}
            </span>
            {tierMeta && (
              <span style={{ fontSize: 9, fontWeight: 700, color: tierMeta.color, background: tierMeta.color + '20', padding: '1px 8px', borderRadius: 10 }}>
                {tierMeta.label}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: catMeta.color, lineHeight: 1 }}>
              ~{formatAPY(displayAPY)}
            </span>
            {isSenti ? (
              <div style={{ fontSize: 10, color: '#444', lineHeight: 1.4 }}>
                <div>indicative</div>
                <div style={{ color: '#555' }}>not guaranteed</div>
              </div>
            ) : (
              <div style={{ fontSize: 10, color: '#444', lineHeight: 1.4 }}>
                <div>{formatAPY(vault.baseApy)} base</div>
                <div style={{ color: catMeta.color + '80' }}>+{formatAPY(vault.boostApy)} boost</div>
              </div>
            )}
          </div>
          {/* Risk score for Senti */}
          {vault.riskScore !== undefined && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 9, color: '#555' }}>RISK SCORE</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: catMeta.color }}>{vault.riskScore}/10</span>
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 1, background: i < (vault.riskScore ?? 0) ? catMeta.color : '#1a1a1a' }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TVL + min deposit */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 9, color: '#444', marginBottom: 2, letterSpacing: 0.6 }}>TVL</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{formatCurrency(vault.tvl, true)}</div>
            <div style={{ fontSize: 10, color: tvlChangePositive ? '#00e676' : '#ef4444' }}>
              {tvlChangePositive ? '↑' : '↓'} {Math.abs(vault.tvlChange).toFixed(2)}% this week
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: '#444', marginBottom: 2, letterSpacing: 0.6 }}>MIN DEPOSIT</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>${vault.minDeposit}</div>
            <div style={{ fontSize: 10, color: '#555' }}>{vault.supportedTokens.join(' · ')}</div>
          </div>
        </div>

        {/* Protocol allocation bar — LP only */}
        {vault.category === 'LP' && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ height: 3, borderRadius: 2, overflow: 'hidden', display: 'flex' }}>
              {vault.protocols.map((p) => (
                <div key={p.name} style={{ width: `${p.percentage}%`, background: p.color }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
              {vault.protocols.slice(0, 3).map((p) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: p.color }} />
                  <span style={{ fontSize: 10, color: '#555' }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {vault.audited && (
            <span style={{ fontSize: 9, color: '#00e676', background: '#00e67615', padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>
              ✓ Audited
            </span>
          )}
          {vault.network === 'BNB_CHAIN' && (
            <span style={{ fontSize: 9, color: '#f0b90b', background: '#f0b90b15', padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>
              BNB Chain
            </span>
          )}
          {vault.network === 'APTOS' && (
            <span style={{ fontSize: 9, color: '#00e676', background: '#00e67615', padding: '2px 7px', borderRadius: 4 }}>
              Aptos
            </span>
          )}
          {(vault.performanceFee ?? 0) > 0 ? (
            <span style={{ fontSize: 9, color: '#f59e0b', background: '#f59e0b15', padding: '2px 7px', borderRadius: 4 }}>
              {vault.performanceFee}% perf. fee
            </span>
          ) : (
            <span style={{ fontSize: 9, color: '#666', background: '#1a1a1a', padding: '2px 7px', borderRadius: 4 }}>
              No fees
            </span>
          )}
        </div>

        {/* User position */}
        {userDeposited && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #1a3a2a', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#555' }}>Your deposit</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#00e676' }}>{formatCurrency(userDeposited)}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
