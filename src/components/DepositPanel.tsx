'use client'

import { useState } from 'react'
import { Vault, TokenSymbol, UserPosition } from '@/lib/types'
import { formatCurrency, calcEstimatedEarnings } from '@/lib/utils'

interface DepositPanelProps {
  vault: Vault
  position?: UserPosition
}

const QUICK_AMOUNTS = [25, 50, 75, 100]

export default function DepositPanel({ vault, position }: DepositPanelProps) {
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState<TokenSymbol>(vault.supportedTokens[0])
  const [submitted, setSubmitted] = useState(false)

  const numAmount = parseFloat(amount) || 0
  const est1M = calcEstimatedEarnings(numAmount, vault.apy, 1)
  const est6M = calcEstimatedEarnings(numAmount, vault.apy, 6)
  const est1Y = calcEstimatedEarnings(numAmount, vault.apy, 12)

  function handleAction() {
    if (numAmount <= 0) return
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  function setPercent(pct: number) {
    if (tab === 'withdraw' && position) {
      setAmount(((position.currentValue * pct) / 100).toFixed(2))
    } else {
      setAmount(((1000 * pct) / 100).toFixed(2))
    }
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      {/* Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#0d0d0d',
          borderRadius: 8,
          padding: 3,
          marginBottom: 20,
        }}
      >
        {(['deposit', 'withdraw'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: tab === t ? '#00e676' : 'transparent',
              color: tab === t ? '#000' : '#555',
              letterSpacing: 0.8,
              transition: 'all 0.2s',
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: '#555', marginBottom: 8, letterSpacing: 0.8 }}>AMOUNT</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#0d0d0d',
            border: '1px solid #222',
            borderRadius: 8,
            padding: '12px 14px',
          }}
        >
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 22,
              fontWeight: 700,
              color: '#fff',
              width: '100%',
            }}
          />
          {/* Token selector */}
          <select
            value={token}
            onChange={(e) => setToken(e.target.value as TokenSymbol)}
            style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 6,
              color: '#fff',
              padding: '4px 8px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {vault.supportedTokens.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>
          ≈ {formatCurrency(numAmount)} USD
        </div>
      </div>

      {/* Quick amounts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 16 }}>
        {QUICK_AMOUNTS.map((pct) => (
          <button
            key={pct}
            onClick={() => setPercent(pct)}
            style={{
              padding: '6px 0',
              background: '#1a1a1a',
              border: '1px solid #222',
              borderRadius: 6,
              color: '#888',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.borderColor = '#00e676'; (e.target as HTMLButtonElement).style.color = '#00e676' }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.borderColor = '#222'; (e.target as HTMLButtonElement).style.color = '#888' }}
          >
            {pct}%
          </button>
        ))}
      </div>

      {/* Auto-routed */}
      {tab === 'deposit' && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: '#555', marginBottom: 6, letterSpacing: 0.8 }}>AUTO-ROUTED VIA</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {vault.protocols.filter(p => p.percentage > 0).map((p) => (
              <div
                key={p.name}
                title={`${p.name} — ${p.percentage.toFixed(1)}%`}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: p.color + '33',
                  border: `2px solid ${p.color}66`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  fontWeight: 700,
                  color: p.color,
                }}
              >
                {p.name[0]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estimated earnings */}
      {tab === 'deposit' && numAmount > 0 && (
        <div
          style={{
            background: '#0a1a0f',
            border: '1px solid #00e67625',
            borderRadius: 8,
            padding: 12,
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 10, color: '#00e676', fontWeight: 600, letterSpacing: 0.8, marginBottom: 8 }}>
            ESTIMATED RETURNS
          </div>
          {[
            { label: '1 MONTH', value: numAmount + est1M, earn: est1M, pct: (est1M / numAmount) * 100 },
            { label: '6 MONTHS', value: numAmount + est6M, earn: est6M, pct: (est6M / numAmount) * 100 },
            { label: '1 YEAR', value: numAmount + est1Y, earn: est1Y, pct: (est1Y / numAmount) * 100 },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 0',
              }}
            >
              <span style={{ fontSize: 11, color: '#555' }}>{row.label}</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  {formatCurrency(row.value)}
                </span>
                <span style={{ fontSize: 11, color: '#00e676', marginLeft: 6 }}>
                  +{formatCurrency(row.earn)} (+{row.pct.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fees info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: '#444',
          marginBottom: 16,
        }}
      >
        <span>Gas Fee</span>
        <span>$0.00</span>
      </div>

      {/* Action button */}
      <button
        onClick={handleAction}
        disabled={numAmount <= 0}
        className="btn-primary"
        style={{
          width: '100%',
          padding: '14px',
          fontSize: 14,
          letterSpacing: 1,
          opacity: numAmount <= 0 ? 0.4 : 1,
        }}
      >
        {submitted
          ? '✓ Transaction Submitted!'
          : tab === 'deposit'
          ? `DEPOSIT →`
          : 'WITHDRAW →'}
      </button>

      {/* Badges */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
        {vault.noHiddenFees && (
          <span style={{ fontSize: 10, color: '#444' }}>No hidden fees</span>
        )}
        {vault.autoCompound && (
          <span style={{ fontSize: 10, color: '#444' }}>Auto-compounding</span>
        )}
        {vault.audited && (
          <span style={{ fontSize: 10, color: '#444' }}>Audited by MOVEBIT</span>
        )}
      </div>

      {/* User position */}
      {position && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid #1a1a1a',
          }}
        >
          <div style={{ fontSize: 10, color: '#555', fontWeight: 600, letterSpacing: 0.8, marginBottom: 10 }}>
            YOUR POSITION
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>Deposited</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                {formatCurrency(position.deposited)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>Current Value</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                {formatCurrency(position.currentValue)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>Earned Yield</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#00e676' }}>
                +{formatCurrency(position.earnedYield)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>Unrealized PnL</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: position.unrealizedPnL >= 0 ? '#00e676' : '#ef4444' }}>
                {position.unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(position.unrealizedPnL)}
                <span style={{ fontSize: 11, marginLeft: 4 }}>
                  ({position.unrealizedPnLPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
