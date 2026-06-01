'use client'

import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid,
} from 'recharts'
import { TradingStats } from '@/data/strategyStats'
import { formatCurrency } from '@/lib/utils'

interface Props { stats: TradingStats; performanceFee?: number }

function StatCell({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div style={{ padding: '12px 14px', borderRight: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
      <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: color ?? '#fff', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: '#555', marginTop: 3 }}>{sub}</div>}
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

function RiskMeter({ score }: { score: number }) {
  const color = score <= 3 ? '#00e676' : score <= 5 ? '#f59e0b' : '#ef4444'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 0.8 }}>RISK SCORE</span>
        <span style={{ fontSize: 14, fontWeight: 900, color }}>{score}/10</span>
      </div>
      <div style={{ display: 'flex', gap: 3 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{ flex: 1, height: 6, borderRadius: 2, background: i < score ? color : '#1a1a1a' }} />
        ))}
      </div>
    </div>
  )
}

const ttStyle = { background: '#111', border: '1px solid #333', borderRadius: 8, fontSize: 11, color: '#fff' }

type Tab = 'COMPOSITION' | 'EQUITY' | 'PNL' | 'VOLUME' | 'PROFESSIONAL'
const TABS: Tab[] = ['COMPOSITION', 'EQUITY', 'PNL', 'VOLUME', 'PROFESSIONAL']

export default function TradingStatsPanel({ stats, performanceFee = 20 }: Props) {
  const [tab, setTab] = useState<Tab>('COMPOSITION')

  const pnlPositive = stats.totalPnL >= 0
  const profitPct   = (stats.grossProfit / (stats.grossProfit + stats.grossLoss)) * 100
  const longPct     = (stats.longCount / (stats.longCount + stats.shortCount)) * 100

  return (
    <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>

      {/* ── Hero metrics: 3×3 grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid #1a1a1a' }}>
        <StatCell label="TOTAL BALANCE"    value={formatCurrency(stats.totalBalance)} />
        <StatCell label="TOTAL EQUITY"     value={formatCurrency(stats.totalEquity)} />
        <StatCell label="TOTAL P&L (NET)"  value={formatCurrency(stats.totalPnL)}    color={pnlPositive ? '#00e676' : '#ef4444'} />
        <StatCell label="ROI"              value={`${stats.roi}%`}                   color={pnlPositive ? '#00e676' : '#ef4444'} />
        <StatCell label="IRR (ANNUALIZED)" value={`${stats.irrAnnualized}%`}         color="#00e676" />
        <StatCell label="CLOSED DEALS"     value={String(stats.closedDeals)} />
        <StatCell label="MAX DRAWDOWN"     value={`${stats.maxDrawdown}%`}           color="#ef4444" />
        <StatCell label="CURRENT DRAWDOWN" value={`${stats.currentDrawdown}%`}       color={stats.currentDrawdown < stats.maxDrawdown * 0.5 ? '#f59e0b' : '#ef4444'} />
        <StatCell label="WIN RATE"         value={`${stats.winRate}%`}               color="#00e676" />
        <StatCell label="PROFIT FACTOR"    value={String(stats.profitFactor)}        color={stats.profitFactor >= 1.5 ? '#00e676' : '#f59e0b'} />
        <StatCell label="GROSS PROFIT"     value={formatCurrency(stats.grossProfit)} color="#00e676" />
        <StatCell label="GROSS LOSS"       value={`−${formatCurrency(stats.grossLoss)}`} color="#ef4444" />
        <StatCell label="AVG WIN"          value={formatCurrency(stats.avgWin)}      color="#00e676" />
        <StatCell label="AVG LOSS"         value={`−${formatCurrency(Math.abs(stats.avgLoss))}`} color="#ef4444" />
        <StatCell label="EXPECTANCY"       value={formatCurrency(stats.expectancy)}  color={stats.expectancy >= 0 ? '#00e676' : '#ef4444'} />
        <StatCell label="LONG / SHORT"     value={`${stats.longCount} / ${stats.shortCount}`} />
        <StatCell label="ROBOT / MANUAL"   value={`${stats.robotCount} / ${stats.manualCount}`} />
        <StatCell label="WIN / LOSS"       value={`${stats.winCount} / ${stats.lossCount}`} />
      </div>

      {/* ── Returns row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #1a1a1a' }}>
        <StatCell label="ALL-TIME RETURN" value={`${stats.allTimeReturn}%`}  color="#00e676" />
        <StatCell label="30D RETURN"      value={`${stats.return30d}%`}      color="#00e676" />
        <StatCell label="90D RETURN"      value={`${stats.return90d}%`}      color="#00e676" />
        <StatCell label="YTD RETURN"      value={`${stats.returnYtd}%`}      color="#00e676" />
      </div>

      {/* ── Risk meter ── */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a1a' }}>
        <RiskMeter score={stats.riskScore} />
      </div>

      {/* ── Fee breakdown ── */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a1a', background: '#0d0d0d' }}>
        <div style={{ fontSize: 9, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
          PERFORMANCE FEE ({performanceFee}% of net profits · High Water Mark)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { label: 'GROSS PROFIT', value: formatCurrency(stats.grossProfitBeforeFee), color: '#00e676' },
            { label: 'PERF. FEE PAID', value: `−${formatCurrency(stats.performanceFeePaid)}`, color: '#f59e0b' },
            { label: 'NET PROFIT', value: formatCurrency(stats.netProfit), color: '#00e676' },
            { label: 'HIGH WATER MARK', value: formatCurrency(stats.highWaterMark), color: '#888' },
          ].map((f) => (
            <div key={f.label}>
              <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 0.8, marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: f.color }}>{f.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: '#444', lineHeight: 1.5 }}>
          Management fee: 0% · Performance fee charged only on profits above the High Water Mark
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1a1a1a', background: '#0d0d0d', overflowX: 'auto' }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flexShrink: 0, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, fontWeight: 600, letterSpacing: 0.8,
            color: tab === t ? '#fff' : '#555',
            borderBottom: tab === t ? '2px solid #f97316' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: 20 }}>

        {/* COMPOSITION */}
        {tab === 'COMPOSITION' && (
          <div>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>Profit · Win rate · Direction · Source</div>
            <div style={{ height: 1, background: '#1a1a1a', marginBottom: 20 }} />
            <CompositionBar label="PROFIT / LOSS" leftVal={formatCurrency(stats.grossProfit)} leftLabel="Profit" rightVal={formatCurrency(stats.grossLoss)} rightLabel="Loss" leftColor="#00e676" rightColor="#ef4444" pct={profitPct} />
            <CompositionBar label="WIN / LOSS"     leftVal={String(stats.winCount)}  leftLabel="Win"   rightVal={String(stats.lossCount)}  rightLabel="Loss"  leftColor="#00e676" rightColor="#ef4444" pct={stats.winRate} />
            <CompositionBar label="LONG / SHORT"   leftVal={String(stats.longCount)} leftLabel="Long"  rightVal={String(stats.shortCount)} rightLabel="Short" leftColor="#3b82f6" rightColor="#f97316" pct={longPct} />
            <CompositionBar label="ROBOT / MANUAL" leftVal={String(stats.robotCount)} leftLabel="Robot" rightVal={String(stats.manualCount)} rightLabel="Manual" leftColor="#a78bfa" rightColor="#555" pct={100} />

            {/* Active strategies */}
            {stats.activeStrategies.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: 0.8, marginBottom: 12 }}>ACTIVE STRATEGIES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {stats.activeStrategies.map((s, i) => (
                    <div key={s.name} style={{
                      display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                      gap: 12, alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: i < stats.activeStrategies.length - 1 ? '1px solid #1a1a1a' : 'none',
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: '#555' }}>{s.version}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 9, color: '#555' }}>ALLOC</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{s.allocation}%</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 9, color: '#555' }}>RETURN</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#00e676' }}>+{s.return}%</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 9, color: '#555' }}>MDD</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>{s.mdd}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}` }} tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={ttStyle} formatter={(v) => [formatCurrency(Number(v)), '']} labelFormatter={(l) => new Date(l).toLocaleDateString()} />
                <Area type="monotone" dataKey="equity"  stroke="#f97316" strokeWidth={2} fill="url(#eqGrad)" dot={false} name="Equity" />
                <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={1} fill="none" dot={false} name="Balance" strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 12, height: 2, background: '#f97316' }} /><span style={{ fontSize: 10, color: '#555' }}>Equity</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 12, height: 2, background: '#3b82f6' }} /><span style={{ fontSize: 10, color: '#555' }}>Balance</span></div>
            </div>
          </div>
        )}

        {/* PNL */}
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
                <Bar dataKey="pnl" fill="#f97316" radius={[2, 2, 0, 0]}
                  // @ts-expect-error recharts custom shape
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
                    <Bar dataKey="lots" fill="#f97316" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#555', letterSpacing: 0.8, marginBottom: 8 }}>CUMULATIVE VOLUME (LOTS)</div>
                <ResponsiveContainer width="100%" height={130}>
                  <AreaChart data={stats.volumeHistory.filter((_, i) => i % 2 === 0)} margin={{ top: 0, right: 0, bottom: 0, left: -28 }}>
                    <defs>
                      <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}` }} tick={{ fill: '#444', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: '#444', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={ttStyle} formatter={(v) => [`${Number(v).toFixed(3)} lots`, 'Cumulative']} />
                    <Area type="monotone" dataKey="cumLots" stroke="#f97316" strokeWidth={2} fill="url(#volGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* PROFESSIONAL METRICS */}
        {tab === 'PROFESSIONAL' && (
          <div>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 16 }}>Risk-adjusted performance ratios</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                {
                  name: 'Sharpe Ratio',
                  value: stats.sharpeRatio,
                  desc: '(Return − Risk-free) ÷ StdDev',
                  good: stats.sharpeRatio >= 1,
                  threshold: '> 1 is good',
                },
                {
                  name: 'Sortino Ratio',
                  value: stats.sortinoRatio,
                  desc: 'Like Sharpe but penalises downside only',
                  good: stats.sortinoRatio >= 1.5,
                  threshold: '> 1.5 is good',
                },
                {
                  name: 'Calmar Ratio',
                  value: stats.calmarRatio,
                  desc: 'Annual return ÷ Max Drawdown',
                  good: stats.calmarRatio >= 0.5,
                  threshold: '> 0.5 is good',
                },
              ].map((r) => (
                <div key={r.name} className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 10, color: '#555', fontWeight: 600, letterSpacing: 0.8, marginBottom: 6 }}>{r.name.toUpperCase()}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: r.good ? '#00e676' : '#f59e0b', lineHeight: 1, marginBottom: 6 }}>
                    {r.value.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>{r.threshold}</div>
                  <div style={{ fontSize: 10, color: '#444', lineHeight: 1.4 }}>{r.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: '#555', fontWeight: 600, letterSpacing: 0.8, marginBottom: 10 }}>DRAWDOWN METRICS</div>
                {[
                  { label: 'Max Drawdown', value: `${stats.maxDrawdown}%`, color: '#ef4444' },
                  { label: 'Current Drawdown', value: `${stats.currentDrawdown}%`, color: stats.currentDrawdown > 0 ? '#f59e0b' : '#00e676' },
                  { label: 'Recovery Time', value: `~${stats.recoveryTime} days`, color: '#888' },
                ].map((d) => (
                  <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #111' }}>
                    <span style={{ fontSize: 12, color: '#555' }}>{d.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.value}</span>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: '#555', fontWeight: 600, letterSpacing: 0.8, marginBottom: 10 }}>ACCOUNT STRUCTURE</div>
                {[
                  { label: 'User Wallet', icon: '👤' },
                  { label: 'MoneyFi Vault', icon: '🏦' },
                  { label: 'Exness Sub Account', icon: '🔗' },
                  { label: 'Senti Trading Engine', icon: '🤖' },
                  { label: 'Active Strategies', icon: '📈' },
                ].map((a, i, arr) => (
                  <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                    <span style={{ fontSize: 12 }}>{a.icon}</span>
                    <span style={{ fontSize: 11, color: '#888' }}>{a.label}</span>
                    {i < arr.length - 1 && (
                      <span style={{ marginLeft: 'auto', fontSize: 10, color: '#333' }}>↓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
