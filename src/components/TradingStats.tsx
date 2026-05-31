'use client'

import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid,
} from 'recharts'
import { TradingStats } from '@/data/strategyStats'
import { formatCurrency } from '@/lib/utils'

interface Props { stats: TradingStats }

// ─── helpers ─────────────────────────────────────────────────────────────────

function StatCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ padding: '12px 14px', borderRight: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
      <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: color ?? '#fff', lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function CompositionBar({ label, leftVal, rightVal, leftLabel, rightLabel, leftColor, rightColor, pct }: {
  label: string; leftVal: string; rightVal: string
  leftLabel: string; rightLabel: string
  leftColor: string; rightColor: string; pct: number
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: 0.8 }}>{label}</span>
        <span style={{ fontSize: 11, color: '#888' }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ height: 5, background: rightColor + '40', borderRadius: 3, overflow: 'hidden', marginBottom: 5 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: leftColor, borderRadius: 3, transition: 'width 1s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: leftColor }}>{leftVal} <span style={{ color: '#555', fontWeight: 400 }}>{leftLabel}</span></span>
        <span style={{ fontSize: 12, fontWeight: 700, color: rightColor }}>{rightVal} <span style={{ color: '#555', fontWeight: 400 }}>{rightLabel}</span></span>
      </div>
    </div>
  )
}

const ttStyle = { background: '#111', border: '1px solid #333', borderRadius: 8, fontSize: 11, color: '#fff' }

// ─── Main ─────────────────────────────────────────────────────────────────────

type Tab = 'COMPOSITION' | 'EQUITY' | 'PNL' | 'VOLUME'
const TABS: Tab[] = ['COMPOSITION', 'EQUITY', 'PNL', 'VOLUME']

export default function TradingStatsPanel({ stats }: Props) {
  const [tab, setTab] = useState<Tab>('COMPOSITION')

  const pnlPositive = stats.totalPnL >= 0
  const profitPct   = (stats.grossProfit / (stats.grossProfit + stats.grossLoss)) * 100
  const longPct     = (stats.longCount / (stats.longCount + stats.shortCount)) * 100

  return (
    <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>

      {/* ── Metrics grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid #1a1a1a' }}>
        <StatCell label="TOTAL BALANCE"    value={formatCurrency(stats.totalBalance)} />
        <StatCell label="TOTAL EQUITY"     value={formatCurrency(stats.totalEquity)} />
        <StatCell label="TOTAL P&L"        value={formatCurrency(stats.totalPnL)}    color={pnlPositive ? '#00e676' : '#ef4444'} />
        <StatCell label="ROI"              value={`${stats.roi}%`}                   color={pnlPositive ? '#00e676' : '#ef4444'} />
        <StatCell label="IRR (ANNUALIZED)" value={`${stats.irrAnnualized}%`}         color="#00e676" />
        <StatCell label="CLOSED DEALS"     value={String(stats.closedDeals)} />
        <StatCell label="WIN RATE"         value={`${stats.winRate}%`}               color="#00e676" />
        <StatCell label="PROFIT FACTOR"    value={String(stats.profitFactor)}        color={stats.profitFactor >= 1 ? '#00e676' : '#ef4444'} />
        <StatCell label="GROSS PROFIT"     value={formatCurrency(stats.grossProfit)} color="#00e676" />
        <StatCell label="GROSS LOSS"       value={`−${formatCurrency(stats.grossLoss)}`} color="#ef4444" />
        <StatCell label="TOTAL VOLUME"     value={`${stats.totalVolumeLots} lots`} />
        <StatCell label="NOTIONAL VOLUME"  value={formatCurrency(stats.notionalVolume, true)} />
        <StatCell label="AVG WIN"          value={formatCurrency(stats.avgWin)}      color="#00e676" />
        <StatCell label="AVG LOSS"         value={`−${formatCurrency(Math.abs(stats.avgLoss))}`} color="#ef4444" />
        <StatCell label="EXPECTANCY"       value={formatCurrency(stats.expectancy)}  color={stats.expectancy >= 0 ? '#00e676' : '#ef4444'} />
        <StatCell label="LONG / SHORT"     value={`${stats.longCount} / ${stats.shortCount}`} />
        <StatCell label="ROBOT / MANUAL"   value={`${stats.robotCount} / ${stats.manualCount}`} />
        <StatCell label="WIN / LOSS"       value={`${stats.winCount} / ${stats.lossCount}`} />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1a1a1a', background: '#0d0d0d' }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 600, letterSpacing: 0.8,
              color: tab === t ? '#fff' : '#555',
              borderBottom: tab === t ? '2px solid #00e676' : '2px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div style={{ padding: 20 }}>

        {/* COMPOSITION */}
        {tab === 'COMPOSITION' && (
          <div>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>
              Profit · Win rate · Direction · Source
            </div>
            <div style={{ height: 1, background: '#1a1a1a', marginBottom: 20 }} />
            <CompositionBar
              label="PROFIT / LOSS"
              leftVal={formatCurrency(stats.grossProfit)} leftLabel="Profit"
              rightVal={formatCurrency(stats.grossLoss)}  rightLabel="Loss"
              leftColor="#00e676" rightColor="#ef4444"
              pct={profitPct}
            />
            <CompositionBar
              label="WIN / LOSS"
              leftVal={String(stats.winCount)}  leftLabel="Win"
              rightVal={String(stats.lossCount)} rightLabel="Loss"
              leftColor="#00e676" rightColor="#ef4444"
              pct={stats.winRate}
            />
            <CompositionBar
              label="LONG / SHORT"
              leftVal={String(stats.longCount)}  leftLabel="Long"
              rightVal={String(stats.shortCount)} rightLabel="Short"
              leftColor="#3b82f6" rightColor="#f97316"
              pct={longPct}
            />
            <CompositionBar
              label="ROBOT / MANUAL"
              leftVal={String(stats.robotCount)}  leftLabel="Robot"
              rightVal={String(stats.manualCount)} rightLabel="Manual"
              leftColor="#a78bfa" rightColor="#555"
              pct={100}
            />
          </div>
        )}

        {/* EQUITY & DRAWDOWN */}
        {tab === 'EQUITY' && (
          <div>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 12 }}>
              Balance reconstructed from deals · current: {formatCurrency(stats.totalBalance)}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.equityHistory.filter((_, i) => i % 3 === 0)} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00e676" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#00e676" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}` }} tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={ttStyle} formatter={(v) => [formatCurrency(Number(v)), '']} labelFormatter={(l) => new Date(l).toLocaleDateString()} />
                <Area type="monotone" dataKey="equity"  stroke="#00e676" strokeWidth={2} fill="url(#eqGrad)" dot={false} name="Equity" />
                <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={1} fill="none"          dot={false} name="Balance" strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 12, height: 2, background: '#00e676' }} /><span style={{ fontSize: 10, color: '#555' }}>Equity</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 12, height: 2, background: '#3b82f6' }} /><span style={{ fontSize: 10, color: '#555' }}>Balance</span></div>
            </div>
          </div>
        )}

        {/* PNL TIME SERIES */}
        {tab === 'PNL' && (
          <div>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 12 }}>Daily realized PnL</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.pnlHistory.filter((_, i) => i % 2 === 0)} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}` }} tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tickFormatter={(v) => `$${v.toFixed(0)}`} tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={ttStyle} formatter={(v) => [formatCurrency(Number(v)), 'PnL']} labelFormatter={(l) => new Date(l).toLocaleDateString()} />
                <ReferenceLine y={0} stroke="#333" />
                <Bar dataKey="pnl" fill="#00e676" radius={[2, 2, 0, 0]}
                  label={false}
                  // @ts-expect-error recharts cell coloring
                  shape={(props: { x: number; y: number; width: number; height: number; pnl: number }) => {
                    const color = props.pnl >= 0 ? '#00e676' : '#ef4444'
                    return <rect x={props.x} y={props.pnl >= 0 ? props.y : props.y + props.height} width={props.width} height={Math.abs(props.height)} fill={color} rx={2} />
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* VOLUME */}
        {tab === 'VOLUME' && (
          <div>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 12 }}>Daily and cumulative lots traded</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: '#555', letterSpacing: 0.8, marginBottom: 8 }}>DAILY VOLUME (LOTS)</div>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={stats.volumeHistory.filter((_, i) => i % 2 === 0)} margin={{ top: 0, right: 0, bottom: 0, left: -28 }}>
                    <XAxis dataKey="date" tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}` }} tick={{ fill: '#444', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: '#444', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={ttStyle} formatter={(v) => [`${Number(v).toFixed(3)} lots`, 'Volume']} />
                    <Bar dataKey="lots" fill="#00e676" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#555', letterSpacing: 0.8, marginBottom: 8 }}>CUMULATIVE VOLUME (LOTS)</div>
                <ResponsiveContainer width="100%" height={130}>
                  <AreaChart data={stats.volumeHistory.filter((_, i) => i % 2 === 0)} margin={{ top: 0, right: 0, bottom: 0, left: -28 }}>
                    <defs>
                      <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00e676" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#00e676" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}` }} tick={{ fill: '#444', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: '#444', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={ttStyle} formatter={(v) => [`${Number(v).toFixed(3)} lots`, 'Cumulative']} />
                    <Area type="monotone" dataKey="cumLots" stroke="#00e676" strokeWidth={2} fill="url(#volGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
