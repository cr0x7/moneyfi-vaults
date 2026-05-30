'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getVaultById, getUserPosition } from '@/data/vaults'
import DepositPanel from '@/components/DepositPanel'
import APYChart from '@/components/APYChart'
import TVLChart from '@/components/TVLChart'
import ProtocolAllocation from '@/components/ProtocolAllocation'
import { formatCurrency, formatDate, riskBgColor } from '@/lib/utils'

export default function VaultDetailPage() {
  const { id } = useParams<{ id: string }>()
  const vault = getVaultById(id)
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

  const tvlChangePositive = vault.tvlChange >= 0

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 0' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#555' }}>
        <Link href="/" style={{ color: '#555', textDecoration: 'none' }}>Vaults</Link>
        <span>/</span>
        <span style={{ color: '#fff' }}>{vault.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Left column */}
        <div>
          {/* Vault header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#555',
                  background: '#1a1a1a',
                  padding: '3px 10px',
                  borderRadius: 4,
                  letterSpacing: 1,
                }}
              >
                {vault.strategy.replace(/_/g, ' ')}
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
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>
              {vault.name}
            </h1>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
              {vault.description}
            </p>
          </div>

          {/* Key metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            <div className="card" style={{ padding: '16px 14px' }}>
              <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>TOTAL APY</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#00e676', lineHeight: 1 }}>
                {vault.apy.toFixed(2)}%
              </div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>
                {vault.baseApy.toFixed(2)}% + {vault.boostApy.toFixed(2)}% boost
              </div>
            </div>
            <div className="card" style={{ padding: '16px 14px' }}>
              <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>TVL</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {formatCurrency(vault.tvl, true)}
              </div>
              <div style={{ fontSize: 10, color: tvlChangePositive ? '#00e676' : '#ef4444', marginTop: 4 }}>
                {tvlChangePositive ? '↑' : '↓'} {Math.abs(vault.tvlChange)}% this week
              </div>
            </div>
            <div className="card" style={{ padding: '16px 14px' }}>
              <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>MIN DEPOSIT</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                ${vault.minDeposit}
              </div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>
                {vault.supportedTokens.join(', ')}
              </div>
            </div>
            <div className="card" style={{ padding: '16px 14px' }}>
              <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>NPOINTS</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {(vault.npoints ?? 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>earned by depositors</div>
            </div>
          </div>

          {/* APY Chart */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <APYChart data={vault.apyHistory} />
          </div>

          {/* TVL Chart */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <TVLChart data={vault.tvlHistory} />
          </div>

          {/* Protocol Allocation */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <ProtocolAllocation protocols={vault.protocols} />
          </div>

          {/* Recent Transactions */}
          {vault.transactions.length > 0 && (
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 11, color: '#666', fontWeight: 600, letterSpacing: 1 }}>RECENT ACTIVITY</span>
                <button style={{ fontSize: 11, color: '#00e676', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  ALL TRANSACTIONS →
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {vault.transactions.map((tx, i) => (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: i < vault.transactions.length - 1 ? '1px solid #1a1a1a' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: tx.type === 'DEPOSIT' ? '#0a1a0f' : '#1a1a1a',
                          border: `1px solid ${tx.type === 'DEPOSIT' ? '#00e67640' : '#333'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                        }}
                      >
                        {tx.type === 'DEPOSIT' ? '↓' : tx.type === 'WITHDRAW' ? '↑' : '→'}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc', marginBottom: 2 }}>
                          {tx.type === 'DEPOSIT' ? `Deposit ${tx.amount.toFixed(2)} ${tx.token} to MoneyFi` :
                           tx.type === 'WITHDRAW' ? `Withdraw ${tx.amount.toFixed(2)} ${tx.token}` :
                           `Transfer ${tx.amount.toFixed(2)} ${tx.token} → ${tx.to}${tx.strategy ? ` - ${tx.strategy}` : ''}`}
                        </div>
                        <div style={{ fontSize: 10, color: '#444' }}>
                          {tx.from && <span>{tx.from}</span>}
                          <span style={{ marginLeft: 8 }}>{formatDate(tx.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: tx.type === 'DEPOSIT' ? '#00e676' : '#fff',
                      }}
                    >
                      {tx.type === 'DEPOSIT' ? '+' : ''}{formatCurrency(tx.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — Deposit Panel */}
        <div style={{ position: 'sticky', top: 72, alignSelf: 'start' }}>
          <DepositPanel vault={vault} position={position} />
        </div>
      </div>
    </div>
  )
}
