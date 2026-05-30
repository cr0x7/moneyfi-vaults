'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TVLDataPoint } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface TVLChartProps {
  data: TVLDataPoint[]
  title?: string
}

export default function TVLChart({ data, title = 'TOTAL VALUE LOCKED' }: TVLChartProps) {
  const lastTVL = data[data.length - 1]?.tvl ?? 0
  const firstTVL = data[0]?.tvl ?? 0
  const change = ((lastTVL - firstTVL) / firstTVL) * 100

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: '#666', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>
            {title}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>
            {formatCurrency(lastTVL, true)}
          </div>
        </div>
        <div style={{ fontSize: 12, color: change >= 0 ? '#00e676' : '#ef4444', fontWeight: 600 }}>
          {change >= 0 ? '+' : ''}{change.toFixed(1)}% all time
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -24 }}>
          <defs>
            <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(v) => {
              const d = new Date(v)
              return d.toLocaleDateString('en-US', { month: 'short' })
            }}
            tick={{ fill: '#444', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={Math.floor(data.length / 6)}
          />
          <YAxis
            tickFormatter={(v) => formatCurrency(v, true)}
            tick={{ fill: '#444', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#111',
              border: '1px solid #333',
              borderRadius: 8,
              fontSize: 12,
              color: '#fff',
            }}
            formatter={(v) => [formatCurrency(Number(v), true), 'TVL']}
            labelFormatter={(l) => new Date(l).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          />
          <Area
            type="monotone"
            dataKey="tvl"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#tvlGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
