'use client'

import { TradingStats } from '@/data/strategyStats'
import { formatCurrency } from '@/lib/utils'

interface Props {
  stats: TradingStats
  performanceFee?: number
  category: 'LP' | 'DELTA_NEUTRAL'
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  LP: { label: 'Liquidity Provider', icon: '💧', color: '#00e676' },
  DELTA_NEUTRAL: { label: 'Delta Neutral', icon: '⚖️', color: '#a78bfa' },
}

function StatCell({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: color ?? '#fff', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: '#555', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function RiskMeter({ score, color }: { score: number; color: string }) {
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

export default function LpDeltaStatsPanel({ stats, performanceFee = 0, category }: Props) {
  const meta = CATEGORY_META[category]
  const fee = performanceFee ?? 0
  const withdrawable = formatCurrency(stats.totalEquity - stats.performanceFeePaid)

  return (
    <div>
      {/* Category header */}
      <div className="card" style={{ padding: '14px 16px', marginBottom: 16, background: meta.color + '10', borderColor: meta.color + '40' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{meta.icon}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: meta.color, letterSpacing: 0.5 }}>{meta.label.toUpperCase()} METRICS</div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>
              Performance and risk overview · Management fee: 0% · Performance fee: {fee}% of net profits
            </div>
          </div>
        </div>
      </div>

      {/* ── Risk Metrics ─────────────────────────────────── */}
      <div style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 10 }}>RISK METRICS</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
        <StatCell label="MAX DRAWDOWN" value={`${stats.maxDrawdown}%`} color="#ef4444" />
        <StatCell label="CURRENT DRAWDOWN" value={`${stats.currentDrawdown}%`} color={stats.currentDrawdown < stats.maxDrawdown * 0.5 ? '#f59e0b' : '#ef4444'} />
        <StatCell label="RECOVERY TIME" value={`~${stats.recoveryTime} days`} color="#888" />
        <StatCell label="RISK SCORE" value={`${stats.riskScore}/10`} color={meta.color} sub={<RiskMeter score={stats.riskScore} color={meta.color} />} />
      </div>

      {/* ── Performance Returns ──────────────────────────── */}
      <div style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 10 }}>PERFORMANCE RETURNS</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        <StatCell label="ALL-TIME RETURN" value={`${stats.allTimeReturn}%`} color="#00e676" />
        <StatCell label="30D RETURN" value={`${stats.return30d}%`} color="#00e676" />
        <StatCell label="90D RETURN" value={`${stats.return90d}%`} color="#00e676" />
        <StatCell label="YTD RETURN" value={`${stats.returnYtd}%`} color="#00e676" />
      </div>

      {/* ── Fee Breakdown ────────────────────────────────── */}
      <div style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 10 }}>FEE BREAKDOWN</div>
      <div className="card" style={{ padding: '14px 16px', marginBottom: 16, background: '#0d0d0d' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <StatCell label="GROSS PROFIT" value={formatCurrency(stats.grossProfitBeforeFee)} color="#00e676" />
          <StatCell label="PERF. FEE PAID" value={`−${formatCurrency(stats.performanceFeePaid)}`} color="#f59e0b" />
          <StatCell label="NET PROFIT" value={formatCurrency(stats.netProfit)} color="#00e676" />
          <StatCell label="WITHDRAWABLE BALANCE" value={withdrawable} color="#fff" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid #1a1a1a' }}>
          <span style={{ fontSize: 10, color: '#555' }}>High Water Mark</span>
          <span style={{ fontSize: 10, color: '#888' }}>{formatCurrency(stats.highWaterMark)}</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 10, color: '#444', lineHeight: 1.5 }}>
          Management fee: 0% · Performance fee charged only on profits above the High Water Mark
        </div>
      </div>
    </div>
  )
}
