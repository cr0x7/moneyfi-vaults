import Link from 'next/link'
import { VAULTS } from '@/data/vaults'
import { formatCurrency } from '@/lib/utils'

const sorted = [...VAULTS].sort((a, b) => (b.npoints ?? 0) - (a.npoints ?? 0))

export default function RankingPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>
          NPOINTS LEADERBOARD
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>Vault Rankings</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {sorted.map((vault, i) => (
          <Link key={vault.id} href={`/vault/${vault.id}`} style={{ textDecoration: 'none' }}>
            <div
              className="card-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 16px',
                borderBottom: '1px solid #1a1a1a',
                transition: 'background 0.2s',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: i < 3 ? '#00e67620' : '#111',
                  border: `1px solid ${i < 3 ? '#00e67640' : '#222'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 800,
                  color: i < 3 ? '#00e676' : '#555',
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{vault.name}</div>
                <div style={{ fontSize: 11, color: '#555' }}>{vault.apy}% APY · {formatCurrency(vault.tvl, true)} TVL</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: i < 3 ? '#00e676' : '#fff' }}>
                  {((vault.npoints ?? 0) / 1000).toFixed(2)}K
                </div>
                <div style={{ fontSize: 10, color: '#555' }}>NPoints</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
