'use client'

import { ProtocolAllocation as PA } from '@/lib/types'

interface Props {
  protocols: PA[]
}

export default function ProtocolAllocation({ protocols }: Props) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#666', fontWeight: 600, letterSpacing: 1, marginBottom: 12 }}>
        PROTOCOL ALLOCATION
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {protocols.map((p) => (
          <div key={p.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                <span style={{ fontSize: 13, color: '#ccc' }}>{p.name}</span>
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: p.percentage > 0 ? '#fff' : '#444',
                }}
              >
                {p.percentage.toFixed(1)}%
              </span>
            </div>
            <div style={{ height: 3, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${p.percentage}%`,
                  background: p.color,
                  borderRadius: 2,
                  transition: 'width 0.8s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
