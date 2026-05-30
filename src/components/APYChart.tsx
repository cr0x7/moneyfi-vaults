'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { APYDataPoint } from '@/lib/types'

interface APYChartProps {
  data: APYDataPoint[]
}

const RANGES = ['7D', '30D', '90D'] as const
type Range = typeof RANGES[number]

function filterData(data: APYDataPoint[], range: Range) {
  const days = range === '7D' ? 7 : range === '30D' ? 30 : 90
  return data.slice(-days)
}

export default function APYChart({ data }: APYChartProps) {
  const [range, setRange] = useState<Range>('30D')
  const filtered = filterData(data, range)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: '#666', fontWeight: 600, letterSpacing: 0.8 }}>APY PERFORMANCE</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '4px 12px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: range === r ? '#00e676' : '#1a1a1a',
                color: range === r ? '#000' : '#666',
                transition: 'all 0.2s',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={filtered} margin={{ top: 4, right: 0, bottom: 0, left: -24 }}>
          <defs>
            <linearGradient id="apyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00e676" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#00e676" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(v) => {
              const d = new Date(v)
              return `${d.getMonth() + 1}/${d.getDate()}`
            }}
            tick={{ fill: '#444', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => `${v.toFixed(0)}%`}
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
            formatter={(v) => [`${Number(v).toFixed(2)}%`, 'Total APY']}
            labelFormatter={(l) => new Date(l).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <Area
            type="monotone"
            dataKey="apy"
            stroke="#00e676"
            strokeWidth={2}
            fill="url(#apyGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
