'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import { DeltaNeutralStats } from '@/data/strategyStats'
import { formatCurrency } from '@/lib/utils'

interface Props { stats: DeltaNeutralStats }

const ttStyle = { background: '#111', border: '1px solid #333', borderRadius: 8, fontSize: 11, color: '#fff' }

function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: color ?? '#fff', lineHeight: 1, marginBottom: sub ? 4 : 0 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: '#555' }}>{sub}</div>}
    </div>
  )
}

function Countdown({ ms }: { ms: number }) {
  const [rem, setRem] = useState(ms)
  useEffect(() => {
    const id = setInterval(() => setRem(r => Math.max(0, r - 1000)), 1000)
    return () => clearInterval(id)
  }, [])
  const h = Math.floor(rem / 3600000)
  const m = Math.floor((rem % 3600000) / 60000)
  const s = Math.floor((rem % 60000) / 1000)
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
    </span>
  )
}

export default function DeltaNeutralStatsPanel({ stats }: Props) {
  const [selectedPair, setSelectedPair] = useState(stats.activePairs[0]?.symbol ?? '')
  const pair = stats.activePairs.find((p) => p.symbol === selectedPair) ?? stats.activePairs[0]
  const rateChange = stats.currentFundingRate - stats.prevFundingRate
  const rateUp     = rateChange >= 0

  return (
    <div>
      {/* ── Concept explainer ─────────────────────────────── */}
      <div className="card" style={{ padding: '14px 16px', marginBottom: 16, background: '#0d0a1a', borderColor: '#a78bfa30' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ fontSize: 22, flexShrink: 0 }}>⚖️</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', marginBottom: 4 }}>How Delta Neutral earns on HyperLiquid</div>
            <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>
              Equal <span style={{ color: '#3b82f6' }}>LONG</span> and <span style={{ color: '#f97316' }}>SHORT</span> perpetual positions cancel each other&apos;s price exposure.
              Every 8 hours, HyperLiquid pays <strong style={{ color: '#a78bfa' }}>funding rate</strong> from the losing side to the winning side.
              When longs outnumber shorts, you collect as the short side — market direction is irrelevant.
            </p>
          </div>
        </div>
      </div>

      {/* ── Funding rate hero ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
        {/* Next funding countdown */}
        <div className="card" style={{ padding: '16px', background: '#0d0a1a', borderColor: '#a78bfa40', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 9, color: '#a78bfa', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>NEXT FUNDING PAYMENT</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>
                <Countdown ms={stats.nextFundingMs} />
              </div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>HyperLiquid settles every 8h at 00:00 · 08:00 · 16:00 UTC</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, color: '#555', letterSpacing: 1, marginBottom: 4 }}>CURRENT RATE / 8H</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#a78bfa' }}>{stats.currentFundingRate.toFixed(4)}%</div>
              <div style={{ fontSize: 11, color: rateUp ? '#00e676' : '#ef4444' }}>
                {rateUp ? '▲' : '▼'} {Math.abs(rateChange).toFixed(4)}% vs prev
              </div>
            </div>
          </div>
        </div>

        <Stat label="ANNUALIZED YIELD" value={`${stats.annualizedYield.toFixed(1)}%`} sub="from funding rate alone" color="#a78bfa" />
        <Stat label="DAILY YIELD / $1K" value={`$${stats.dailyYield.toFixed(3)}`} sub={`≈ $${(stats.dailyYield * 30).toFixed(2)} / month`} color="#00e676" />
        <Stat label="TOTAL FUNDING COLLECTED" value={formatCurrency(stats.totalFundingCollected)} color="#00e676" />
        <Stat label="POSITION HEALTH" value={`${stats.positionHealth}%`} sub="liquidation buffer" color={stats.positionHealth > 80 ? '#00e676' : '#f97316'} />
      </div>

      {/* ── Active pair allocation ─────────────────────────── */}
      {stats.activePairs.length > 0 && (
        <div className="card" style={{ padding: '16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: 1 }}>ACTIVE PAIRS</div>
            <div style={{ fontSize: 10, color: '#666' }}>{stats.activePairs.length} market-neutral pairs</div>
          </div>
          <div style={{ height: 6, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden', display: 'flex', marginBottom: 12 }}>
            {stats.activePairs.map((p, i) => (
              <div key={p.symbol} style={{ width: `${p.allocation}%`, background: ['#a78bfa', '#3b82f6', '#00e676'][i % 3] }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {stats.activePairs.map((p, i) => {
              const active = p.symbol === pair.symbol
              const color = ['#a78bfa', '#3b82f6', '#00e676'][i % 3]
              return (
                <button
                  key={p.symbol}
                  type="button"
                  onClick={() => setSelectedPair(p.symbol)}
                  style={{
                    padding: '10px 12px',
                    background: active ? color + '18' : '#0d0d0d',
                    border: `1px solid ${active ? color + '70' : '#222'}`,
                    borderRadius: 8,
                    color: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 800 }}>{p.symbol}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color }}>{p.allocation}%</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#555' }}>Funding {p.currentFundingRate.toFixed(4)}% / 8h</div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Long / Short positions ────────────────────────── */}
      {pair && <div className="card" style={{ padding: '16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: 1 }}>POSITION BREAKDOWN</div>
          <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 800 }}>{pair.symbol} · {pair.allocation}% alloc</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 9, color: '#3b82f6', fontWeight: 600, marginBottom: 4, letterSpacing: 0.8 }}>LONG ({pair.symbol})</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{formatCurrency(pair.longSize, true)}</div>
            <div style={{ fontSize: 10, color: '#555' }}>notional</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#555', fontWeight: 600, marginBottom: 4, letterSpacing: 0.8 }}>NET DELTA</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: Math.abs(pair.netDelta) < 10 ? '#00e676' : '#f97316' }}>
              {pair.netDelta >= 0 ? '+' : ''}{formatCurrency(pair.netDelta)}
            </div>
            <div style={{ fontSize: 10, color: '#555' }}>≈ market neutral</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: '#f97316', fontWeight: 600, marginBottom: 4, letterSpacing: 0.8 }}>SHORT ({pair.symbol})</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{formatCurrency(pair.shortSize, true)}</div>
            <div style={{ fontSize: 10, color: '#555' }}>notional</div>
          </div>
        </div>

        {/* Balance bar */}
        <div style={{ height: 6, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
          <div style={{ flex: pair.longSize, background: '#3b82f6', borderRadius: '3px 0 0 3px' }} />
          <div style={{ width: 2, background: '#0a0a0a' }} />
          <div style={{ flex: pair.shortSize, background: '#f97316', borderRadius: '0 3px 3px 0' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: '#3b82f6' }}>Long 50%</span>
          <span style={{ fontSize: 10, color: '#f97316' }}>Short 50%</span>
        </div>

        <div style={{ marginTop: 12, padding: '10px 12px', background: '#0a0a0a', borderRadius: 6 }}>
          <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>COLLATERAL USED</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, height: 4, background: '#1a1a1a', borderRadius: 2, marginRight: 10 }}>
              <div style={{ width: `${(pair.collateralUsed / (pair.longSize * 0.15)) * 100}%`, height: '100%', background: '#a78bfa', borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{formatCurrency(pair.collateralUsed, true)}</span>
          </div>
        </div>
      </div>}

      {/* ── Funding rate history ──────────────────────────── */}
      {pair && <div className="card" style={{ padding: '16px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 12 }}>
          FUNDING RATE HISTORY ({pair.symbol} · % per 8h) — 90 days
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={pair.fundingRateHistory} margin={{ top: 4, right: 0, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="frGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}` }} tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} interval={14} />
            <YAxis tickFormatter={(v) => `${v.toFixed(3)}%`} tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={ttStyle} formatter={(v) => [`${Number(v).toFixed(4)}%`, 'Funding Rate']} labelFormatter={(l) => new Date(l).toLocaleDateString()} />
            <ReferenceLine y={0} stroke="#333" />
            <Area type="monotone" dataKey="rate" stroke="#a78bfa" strokeWidth={2} fill="url(#frGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>}

      {/* ── Cumulative yield ─────────────────────────────── */}
      <div className="card" style={{ padding: '16px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 12 }}>
          CUMULATIVE FUNDING YIELD (% total collected) — 90 days
        </div>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={stats.fundingRateHistory} margin={{ top: 4, right: 0, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00e676" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00e676" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}` }} tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} interval={14} />
            <YAxis tickFormatter={(v) => `${v.toFixed(1)}%`} tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={ttStyle} formatter={(v) => [`${Number(v).toFixed(2)}%`, 'Cumulative Yield']} labelFormatter={(l) => new Date(l).toLocaleDateString()} />
            <Area type="monotone" dataKey="cumYield" stroke="#00e676" strokeWidth={2} fill="url(#cumGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Recent payments ──────────────────────────────── */}
      <div className="card" style={{ padding: '16px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 12 }}>
          RECENT FUNDING PAYMENTS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '6px 16px', alignItems: 'center' }}>
          {['DATE', 'RATE / 8H', 'RECEIVED'].map(h => (
            <div key={h} style={{ fontSize: 9, color: '#444', fontWeight: 600, letterSpacing: 0.8, paddingBottom: 6, borderBottom: '1px solid #1a1a1a' }}>{h}</div>
          ))}
          {stats.recentPayments.map((p, i) => {
            const d = new Date(p.date)
            return [
              <div key={`d${i}`} style={{ fontSize: 12, color: '#888', paddingTop: 6, borderBottom: i < stats.recentPayments.length - 1 ? '1px solid #111' : 'none', paddingBottom: 6 }}>
                {d.toLocaleDateString()} {d.getUTCHours().toString().padStart(2,'0')}:00 UTC
              </div>,
              <div key={`r${i}`} style={{ fontSize: 12, color: '#a78bfa', textAlign: 'right', paddingTop: 6, borderBottom: i < stats.recentPayments.length - 1 ? '1px solid #111' : 'none', paddingBottom: 6 }}>
                {p.rate.toFixed(4)}%
              </div>,
              <div key={`a${i}`} style={{ fontSize: 12, fontWeight: 700, color: '#00e676', textAlign: 'right', paddingTop: 6, borderBottom: i < stats.recentPayments.length - 1 ? '1px solid #111' : 'none', paddingBottom: 6 }}>
                +{formatCurrency(p.amount)}
              </div>,
            ]
          })}
        </div>
      </div>
    </div>
  )
}
