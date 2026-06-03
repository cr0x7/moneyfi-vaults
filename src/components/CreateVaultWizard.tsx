'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { StrategyType, RiskLevel, TokenSymbol } from '@/lib/types'
import { formatCurrency, calcEstimatedEarnings, riskBgColor } from '@/lib/utils'

const STRATEGY_OPTIONS: { id: StrategyType; name: string; description: string; baseApy: number; risk: RiskLevel }[] = [
  { id: 'STABLE_YIELD', name: 'Stable Yield', description: 'Auto-routing across stablecoins for low-risk consistent returns', baseApy: 12, risk: 'LOW' },
  { id: 'EMA_MIRROR', name: 'EMA Mirror', description: 'Mean-reversion using EMA crossovers for snap-back entries', baseApy: 18, risk: 'MEDIUM' },
  { id: 'FIBONACCI', name: 'Fibonacci DCA', description: 'Smart DCA at Fibonacci retracement levels for optimal entries', baseApy: 22, risk: 'MEDIUM' },
  { id: 'EMA_CROSSOVER', name: 'EMA Crossover', description: 'Trend-following on confirmed EMA cross signals', baseApy: 28, risk: 'MEDIUM' },
  { id: 'GRID_DCA', name: 'Grid DCA', description: 'Grid-based execution with capital efficiency and drawdown control', baseApy: 14, risk: 'LOW' },
  { id: 'MARKOV', name: 'Markov Chain', description: 'Statistical probability-based high-frequency yield extraction', baseApy: 35, risk: 'ADVANCED' },
  { id: 'ORB', name: 'Open Range Breakout', description: 'Intraday breakout capture with tight risk management', baseApy: 20, risk: 'HIGH' },
  { id: 'MFR_DCA', name: 'MFR DCA Trend', description: 'Trend + Fibonacci pullback DCA for risk-adjusted returns', baseApy: 18, risk: 'MEDIUM' },
  { id: 'DELTA_NEUTRAL', name: 'Delta Neutral', description: 'Simultaneous long/short hedging to earn funding rates & fees with zero directional risk', baseApy: 26, risk: 'MEDIUM' },
]

const STEP_LABELS = ['Strategy', 'Configure', 'Deposit', 'Preview']
const DEPOSIT_TOKENS: TokenSymbol[] = ['USDT', 'USDC', 'APT']
const TOKEN_META: Partial<Record<TokenSymbol, { name: string; logo: string; accent: string }>> = {
  USDT: { name: 'Tether USD', logo: '/tokens/usdt.svg', accent: '#26a17b' },
  USDC: { name: 'USD Coin', logo: '/tokens/usdc.svg', accent: '#2775ca' },
  APT: { name: 'Aptos', logo: '/tokens/apt.svg', accent: '#ffffff' },
}

function TokenIcon({ symbol, size = 22 }: { symbol: TokenSymbol; size?: number }) {
  const meta = TOKEN_META[symbol]

  if (meta) {
    return (
      <Image
        src={meta.logo}
        alt={`${symbol} logo`}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'contain', display: 'block' }}
      />
    )
  }

  return (
    <span style={{
      width: size, height: size, borderRadius: '50%', background: '#1a1a1a', border: '1px solid #333',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 9, fontWeight: 800,
    }}>{symbol.slice(0, 2)}</span>
  )
}

function TokenSelector({ value, onChange }: { value: TokenSymbol; onChange: (token: TokenSymbol) => void }) {
  const [open, setOpen] = useState(false)
  const current = TOKEN_META[value]

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((next) => !next)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          minWidth: 132,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '0 12px',
          borderRadius: 10,
          border: `1px solid ${open ? '#00e67666' : '#2a2a2a'}`,
          background: open ? '#101810' : '#151515',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: open ? '0 0 0 3px rgba(0,230,118,0.08)' : 'none',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TokenIcon symbol={value} />
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 800, lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: 9, color: '#666', lineHeight: 1 }}>{current?.name}</span>
          </span>
        </span>
        <span style={{ color: '#777', fontSize: 12, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>⌄</span>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 50,
            right: 0,
            zIndex: 20,
            width: 190,
            padding: 5,
            borderRadius: 10,
            border: '1px solid #2a2a2a',
            background: '#101010',
            boxShadow: '0 16px 36px rgba(0,0,0,0.45)',
          }}
        >
          {DEPOSIT_TOKENS.map((symbol) => {
            const meta = TOKEN_META[symbol]
            const active = symbol === value

            return (
              <button
                key={symbol}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => { onChange(symbol); setOpen(false) }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px',
                  border: 'none',
                  borderRadius: 8,
                  background: active ? '#0a1a0f' : 'transparent',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <TokenIcon symbol={symbol} />
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 800 }}>{symbol}</span>
                  <span style={{ display: 'block', fontSize: 10, color: '#666' }}>{meta?.name}</span>
                </span>
                {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e676' }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function CreateVaultWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [strategy, setStrategy] = useState<StrategyType | null>(null)
  const [name, setName] = useState('')
  const [risk, setRisk] = useState<RiskLevel>('MEDIUM')
  const [autoCompound, setAutoCompound] = useState(true)
  const [deposit, setDeposit] = useState('')
  const [token, setToken] = useState<TokenSymbol>('USDT')
  const [deployed, setDeployed] = useState(false)

  const selectedStrategy = STRATEGY_OPTIONS.find((s) => s.id === strategy)
  const amount = parseFloat(deposit) || 0
  const apy = selectedStrategy ? selectedStrategy.baseApy * (risk === 'HIGH' || risk === 'ADVANCED' ? 1.4 : risk === 'MEDIUM' ? 1.15 : 1.0) : 0

  function next() { setStep((s) => Math.min(s + 1, 3)) }
  function back() { setStep((s) => Math.max(s - 1, 0)) }

  function deploy() {
    setDeployed(true)
    setTimeout(() => router.push('/'), 2500)
  }

  if (deployed) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#00e676', marginBottom: 8 }}>
          Vault Deployed!
        </div>
        <div style={{ fontSize: 14, color: '#666' }}>
          Redirecting to dashboard...
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32 }}>
        {STEP_LABELS.map((label, i) => (
          <div key={label} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: i < step ? '#00e676' : i === step ? '#00e676' : '#1a1a1a',
                  border: `2px solid ${i <= step ? '#00e676' : '#333'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: i <= step ? '#000' : '#444',
                  marginBottom: 6,
                  transition: 'all 0.3s',
                }}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 11, color: i <= step ? '#fff' : '#444', fontWeight: 600 }}>
                {label}
              </span>
            </div>
            {i < 3 && (
              <div
                style={{
                  height: 2,
                  flex: 1,
                  background: i < step ? '#00e676' : '#222',
                  marginBottom: 20,
                  transition: 'background 0.3s',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Choose strategy */}
      {step === 0 && (
        <div className="animate-in">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Choose a Strategy</h2>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
            Select the trading strategy for your vault. Each strategy has a different risk/reward profile.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {STRATEGY_OPTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setStrategy(s.id)}
                style={{
                  background: strategy === s.id ? '#0a1a0f' : '#111',
                  border: `1px solid ${strategy === s.id ? '#00e676' : '#222'}`,
                  borderRadius: 10,
                  padding: 14,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{s.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#00e676' }}>~{s.baseApy}%</span>
                </div>
                <p style={{ fontSize: 11, color: '#666', lineHeight: 1.4, marginBottom: 8 }}>{s.description}</p>
                <span className={`border px-2 py-0.5 rounded text-xs font-semibold ${riskBgColor(s.risk)}`} style={{ fontSize: 10 }}>
                  {s.risk}
                </span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn-primary"
              onClick={next}
              disabled={!strategy}
              style={{ padding: '12px 32px', fontSize: 14, opacity: strategy ? 1 : 0.4 }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Configure */}
      {step === 1 && (
        <div className="animate-in">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Configure Your Vault</h2>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
            Give your vault a name and set your preferences.
          </p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: '#666', fontWeight: 600, letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>
              VAULT NAME
            </label>
            <input
              className="input-field"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`My ${selectedStrategy?.name} Vault`}
              style={{ padding: '12px 14px', fontSize: 14 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: '#666', fontWeight: 600, letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>
              RISK LEVEL
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {(['LOW', 'MEDIUM', 'HIGH', 'ADVANCED'] as RiskLevel[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRisk(r)}
                  className={risk === r ? `border rounded text-xs font-semibold ${riskBgColor(r)}` : ''}
                  style={{
                    padding: '8px 0',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: risk === r ? undefined : '#111',
                    border: risk === r ? undefined : '1px solid #222',
                    color: risk === r ? undefined : '#555',
                    transition: 'all 0.2s',
                    letterSpacing: 0.6,
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#111',
              border: '1px solid #222',
              borderRadius: 8,
              padding: '14px 16px',
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>Auto-Compound</div>
              <div style={{ fontSize: 11, color: '#555' }}>Automatically reinvest earned yield</div>
            </div>
            <button
              onClick={() => setAutoCompound(!autoCompound)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: autoCompound ? '#00e676' : '#333',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  left: autoCompound ? 22 : 2,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                }}
              />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button className="btn-ghost" onClick={back} style={{ padding: '12px 24px', fontSize: 13, flex: 1 }}>
              ← Back
            </button>
            <button className="btn-primary" onClick={next} style={{ padding: '12px 24px', fontSize: 13, flex: 2 }}>
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Deposit */}
      {step === 2 && (
        <div className="animate-in">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Initial Deposit</h2>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
            Set the amount you want to deposit to start earning.
          </p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: '#666', fontWeight: 600, letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>
              DEPOSIT AMOUNT
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: '#0d0d0d',
                border: '1px solid #262626',
                borderRadius: 12,
                padding: '12px',
                boxShadow: amount > 0 ? '0 0 0 1px rgba(0,230,118,0.18), inset 0 1px 0 rgba(255,255,255,0.03)' : 'inset 0 1px 0 rgba(255,255,255,0.03)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    fontSize: 28,
                    fontWeight: 800,
                    color: '#fff',
                    lineHeight: 1.1,
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <TokenIcon symbol={token} size={14} />
                  <span style={{ fontSize: 11, color: '#555' }}>
                    {amount > 0 ? `≈ ${formatCurrency(amount)} USD` : 'Choose amount and token'}
                  </span>
                </div>
              </div>
              <TokenSelector value={token} onChange={setToken} />
            </div>
          </div>

          {amount > 0 && (
            <div
              style={{
                background: '#0a1a0f',
                border: '1px solid #00e67625',
                borderRadius: 8,
                padding: 14,
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 10, color: '#00e676', fontWeight: 600, letterSpacing: 0.8, marginBottom: 10 }}>
                PROJECTED EARNINGS @ {apy.toFixed(1)}% APY
              </div>
              {[
                { label: '1 month', months: 1 },
                { label: '6 months', months: 6 },
                { label: '1 year', months: 12 },
              ].map(({ label, months }) => {
                const earn = calcEstimatedEarnings(amount, apy, months)
                return (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span style={{ fontSize: 12, color: '#555' }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#00e676' }}>
                      +{formatCurrency(earn)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button className="btn-ghost" onClick={back} style={{ padding: '12px 24px', fontSize: 13, flex: 1 }}>
              ← Back
            </button>
            <button
              className="btn-primary"
              onClick={next}
              disabled={amount <= 0}
              style={{ padding: '12px 24px', fontSize: 13, flex: 2, opacity: amount > 0 ? 1 : 0.4 }}
            >
              Preview →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 3 && selectedStrategy && (
        <div className="animate-in">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Review & Deploy</h2>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
            Review your vault configuration before deploying.
          </p>

          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              {name || `My ${selectedStrategy.name} Vault`}
            </div>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>{selectedStrategy.description}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div>
                <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>STRATEGY</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{selectedStrategy.name}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>EST. APY</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#00e676' }}>{apy.toFixed(1)}%</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>RISK</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  <span className={`border px-2 py-0.5 rounded ${riskBgColor(risk)}`} style={{ fontSize: 11 }}>
                    {risk}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>DEPOSIT</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  {formatCurrency(amount)} {token}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>AUTO-COMPOUND</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: autoCompound ? '#00e676' : '#ef4444' }}>
                  {autoCompound ? 'Yes' : 'No'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>1Y ESTIMATE</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#00e676' }}>
                  +{formatCurrency(calcEstimatedEarnings(amount, apy, 12))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-ghost" onClick={back} style={{ padding: '12px 24px', fontSize: 13, flex: 1 }}>
              ← Back
            </button>
            <button
              className="btn-primary green-glow"
              onClick={deploy}
              style={{ padding: '14px 24px', fontSize: 14, letterSpacing: 1, flex: 2 }}
            >
              🚀 DEPLOY VAULT
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
