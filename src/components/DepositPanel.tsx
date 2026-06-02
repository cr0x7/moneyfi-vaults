'use client'

import { useState } from 'react'
import { Vault, TokenSymbol, UserPosition } from '@/lib/types'
import { formatCurrency, calcEstimatedEarnings } from '@/lib/utils'

interface DepositPanelProps {
  vault: Vault
  position?: UserPosition
  operatorTimeline?: { phase: string; progress: number; estimatedRemaining: string; lastUpdated: string } | null
}

/* ─── Activation (deposit) flow — 5 steps per PRD §10 ─── */
const ACTIVATION_STEPS = [
  { key: 'deposit', label: 'Deposit Confirmed', est: '1-2 min' },
  { key: 'exness', label: 'Exness Account Created', est: '3-5 min' },
  { key: 'senti', label: 'Senti Engine Linked', est: '5-10 min' },
  { key: 'strategy', label: 'Strategy Deployed', est: '10-15 min' },
  { key: 'active', label: 'Vault Active', est: '15-30 min' },
]

/* ─── Withdrawal flow — 6 steps per PRD §11 ─── */
const WITHDRAWAL_STEPS = [
  'Withdrawal Requested',
  'Pause Strategy',
  'Close Positions',
  'Settle PnL & Fees',
  'Transfer Back',
  'Completed',
]

type FlowTab = 'deposit' | 'withdraw'
type FlowState = 'form' | 'running' | 'done'

export default function DepositPanel({ vault, position, operatorTimeline }: DepositPanelProps) {
  const isSenti = vault.category === 'TRADING'
  const [tab, setTab] = useState<FlowTab>('deposit')
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState<TokenSymbol>(vault.supportedTokens[0])
  const [riskAck, setRiskAck] = useState(false)

  // activation step index | null = form | -1 = withdrawal form | 6.. = withdrawal running
  const [activationStep, setActivationStep] = useState<number | null>(null)
  const [withdrawalStep, setWithdrawalStep] = useState<number | null>(null)

  const numAmount = parseFloat(amount) || 0
  const apy = vault.targetApr ?? vault.apy
  const perfFee = vault.performanceFee ?? 0

  function startActivation() {
    if (numAmount < vault.minDeposit) return
    if (isSenti && !riskAck) return
    setActivationStep(0)
    let s = 0
    const timer = setInterval(() => {
      s++
      setActivationStep(s)
      if (s >= ACTIVATION_STEPS.length - 1) clearInterval(timer)
    }, 900)
  }

  function startWithdrawal() {
    if (numAmount <= 0) return
    setWithdrawalStep(0)
    let s = 0
    const timer = setInterval(() => {
      s++
      setWithdrawalStep(s)
      if (s >= WITHDRAWAL_STEPS.length - 1) clearInterval(timer)
    }, 900)
  }

  function resetFlows() {
    setActivationStep(null)
    setWithdrawalStep(null)
    setAmount('')
  }

  const networkLabel = vault.network === 'BNB_CHAIN' ? 'BNB Chain (BSC)' : 'Aptos'
  const networkColor = vault.network === 'BNB_CHAIN' ? '#f0b90b' : '#00e676'

  const showActivation = tab === 'deposit' && activationStep !== null && activationStep >= 0 && activationStep < ACTIVATION_STEPS.length
  const showWithdrawalRunning = tab === 'withdraw' && withdrawalStep !== null && withdrawalStep >= 0 && withdrawalStep < WITHDRAWAL_STEPS.length
  const activationDone = tab === 'deposit' && activationStep !== null && activationStep >= ACTIVATION_STEPS.length - 1
  const withdrawalDone = tab === 'withdraw' && withdrawalStep !== null && withdrawalStep >= WITHDRAWAL_STEPS.length - 1

  return (
    <div className="card" style={{ padding: 20 }}>

      {/* ── Operator Timeline (system status, not user flow) ── */}
      {operatorTimeline && (
        <div className="card" style={{ padding: '12px 14px', marginBottom: 16, background: '#0d0d0d', border: '1px solid #222' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 9, color: '#555', fontWeight: 700, letterSpacing: 1 }}>SYSTEM STATUS</span>
            <span style={{ fontSize: 9, color: '#444' }}>Last updated: {operatorTimeline.lastUpdated}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{operatorTimeline.phase}</div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>Estimated remaining: {operatorTimeline.estimatedRemaining}</div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316' }}>{operatorTimeline.progress}%</div>
          </div>
          <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${operatorTimeline.progress}%`, background: '#f97316', borderRadius: 2, transition: 'width 0.5s ease' }} />
          </div>
        </div>
      )}

      {/* Network badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: networkColor }} />
        <span style={{ fontSize: 10, color: networkColor, fontWeight: 700, letterSpacing: 0.8 }}>{networkLabel}</span>
        {isSenti && (
          <>
            <span style={{ color: '#333', fontSize: 10 }}>·</span>
            <span style={{ fontSize: 10, color: '#555' }}>Powered by Senti × Exness</span>
          </>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#0d0d0d', borderRadius: 8, padding: 3, marginBottom: 18 }}>
        {(['deposit', 'withdraw'] as FlowTab[]).map((t) => (
          <button key={t} onClick={() => { setTab(t); resetFlows() }} style={{
            padding: '8px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
            background: tab === t ? (isSenti ? '#f97316' : '#00e676') : 'transparent',
            color: tab === t ? '#000' : '#555', letterSpacing: 0.8, transition: 'all 0.2s',
          }}>{t.toUpperCase()}</button>
        ))}
      </div>

      {/* ── DEPOSIT FORM ── */}
      {tab === 'deposit' && !showActivation && !activationDone && (
        <>
          {/* Amount input */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: '#555', marginBottom: 8, letterSpacing: 0.8 }}>AMOUNT</div>
            <div style={{ display: 'flex', alignItems: 'center', background: '#0d0d0d', border: '1px solid #222', borderRadius: 8, padding: '12px 14px' }}>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Min $${vault.minDeposit.toLocaleString()}`} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 22, fontWeight: 700, color: '#fff' }} />
              <select value={token} onChange={(e) => setToken(e.target.value as TokenSymbol)} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, color: '#fff', padding: '4px 8px', fontSize: 13, fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
                {vault.supportedTokens.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {numAmount > 0 && numAmount < vault.minDeposit && (
              <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Min deposit is ${vault.minDeposit.toLocaleString()}</div>
            )}
            <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>≈ {formatCurrency(numAmount)} USD</div>
          </div>

          {/* Quick % */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 16 }}>
            {[25, 50, 75, 100].map((pct) => (
              <button key={pct} onClick={() => setAmount((vault.minDeposit * (pct / 25)).toFixed(0))} style={{
                padding: '6px 0', background: '#1a1a1a', border: '1px solid #222', borderRadius: 6,
                color: '#888', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>{pct}%</button>
            ))}
          </div>

          {/* Estimated earnings */}
          {numAmount >= vault.minDeposit && (() => {
            const est1M = calcEstimatedEarnings(numAmount, apy, 1)
            const est6M = calcEstimatedEarnings(numAmount, apy, 6)
            const est1Y = calcEstimatedEarnings(numAmount, apy, 12)
            const netFactor = (100 - perfFee) / 100
            const netEst1Y = est1Y * netFactor
            return (
              <div style={{ background: '#0a1a0f', border: '1px solid #00e67625', borderRadius: 8, padding: 12, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: '#00e676', fontWeight: 700, letterSpacing: 0.8 }}>
                    ESTIMATED RETURNS ({isSenti ? `~${vault.targetApr}% Target APR` : `${vault.apy.toFixed(2)}% APY`})
                  </span>
                </div>
                {[
                  { label: '1 MONTH', gross: numAmount + est1M, net: numAmount + est1M * netFactor },
                  { label: '6 MONTHS', gross: numAmount + est6M, net: numAmount + est6M * netFactor },
                  { label: '1 YEAR', gross: numAmount + est1Y, net: numAmount + netEst1Y },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                    <span style={{ fontSize: 11, color: '#555' }}>{row.label}</span>
                    <div style={{ textAlign: 'right' }}>
                      {perfFee > 0 ? (
                        <>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{formatCurrency(row.net)}</span>
                          <span style={{ fontSize: 10, color: '#555', marginLeft: 4 }}>net after {perfFee}% fee</span>
                        </>
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#00e676' }}>{formatCurrency(row.gross)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Fee info */}
          {(perfFee > 0 || (vault.managementFee ?? 0) === 0) && (
            <div style={{ background: '#0d0d0d', borderRadius: 6, padding: '8px 12px', marginBottom: 14, fontSize: 11, color: '#555' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Management fee</span><span style={{ color: '#00e676' }}>0%</span></div>
              {perfFee > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}><span>Performance fee</span><span style={{ color: '#f59e0b' }}>{perfFee}% of net profits</span></div>}
              {perfFee > 0 && <div style={{ marginTop: 4, fontSize: 10, color: '#444' }}>Fee charged only above High Water Mark</div>}
            </div>
          )}

          {/* Risk Acknowledgement — Senti only */}
          {isSenti && (
            <div style={{ background: '#1a0e00', border: '1px solid #f9731630', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: '#f97316', fontWeight: 700, letterSpacing: 0.8, marginBottom: 8 }}>⚠️ RISK ACKNOWLEDGEMENT</div>
              <p style={{ fontSize: 11, color: '#888', lineHeight: 1.5, marginBottom: 10 }}>
                This vault uses algorithmic trading strategies on Exness via the Senti engine. Past performance does not guarantee future results. Trading involves substantial risk of loss. Target APR is indicative only.
              </p>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={riskAck} onChange={(e) => setRiskAck(e.target.checked)} style={{ marginTop: 2, accentColor: '#f97316' }} />
                <span style={{ fontSize: 11, color: '#aaa' }}>I understand the risks and acknowledge that returns are not guaranteed</span>
              </label>
            </div>
          )}

          {/* Gas fee */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#444', marginBottom: 16 }}><span>Gas Fee</span><span>$0.00</span></div>

          {/* CTA */}
          <button onClick={startActivation} disabled={numAmount < vault.minDeposit || (isSenti && !riskAck)} style={{
            width: '100%', padding: '14px', fontSize: 14, letterSpacing: 1, fontWeight: 700,
            background: isSenti ? '#f97316' : '#00e676', color: '#000', border: 'none', borderRadius: 8,
            cursor: 'pointer', opacity: (numAmount >= vault.minDeposit && (!isSenti || riskAck)) ? 1 : 0.4, transition: 'all 0.2s',
          }}>DEPOSIT →</button>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10 }}>
            {vault.noHiddenFees && <span style={{ fontSize: 10, color: '#444' }}>No hidden fees</span>}
            {vault.audited && <span style={{ fontSize: 10, color: '#444' }}>Audited</span>}
          </div>
        </>
      )}

      {/* ── ACTIVATION FLOW (after deposit) ── */}
      {showActivation && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Activating your vault…</div>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 20 }}>Estimated time: 15–30 minutes</div>
          {ACTIVATION_STEPS.map((s, i) => {
            const done = i < activationStep
            const current = i === activationStep
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: done ? '#f97316' : current ? '#1a0e00' : '#111',
                  border: `2px solid ${done ? '#f97316' : current ? '#f97316' : '#333'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: done ? '#000' : current ? '#f97316' : '#444',
                }}>{done ? '✓' : i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: done ? '#fff' : current ? '#fff' : '#444' }}>{s.label}</div>
                  {current && <div style={{ fontSize: 10, color: '#f97316', marginTop: 2 }}>In progress…</div>}
                </div>
                {done && <span style={{ fontSize: 12, color: '#00e676' }}>✓</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* ── ACTIVATION COMPLETE ── */}
      {activationDone && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#00e676', marginBottom: 4 }}>Vault Active!</div>
          <div style={{ fontSize: 11, color: '#555' }}>Your strategies are now trading on Exness</div>
          <button onClick={resetFlows} style={{
            marginTop: 16, padding: '8px 16px', background: '#1a1a1a', border: '1px solid #333',
            borderRadius: 6, color: '#888', fontSize: 11, cursor: 'pointer',
          }}>← Back</button>
        </div>
      )}

      {/* ── WITHDRAW FORM ── */}
      {tab === 'withdraw' && !showWithdrawalRunning && !withdrawalDone && (
        <>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: '#555', marginBottom: 8, letterSpacing: 0.8 }}>WITHDRAW AMOUNT</div>
            <div style={{ display: 'flex', alignItems: 'center', background: '#0d0d0d', border: '1px solid #222', borderRadius: 8, padding: '12px 14px' }}>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 22, fontWeight: 700, color: '#fff' }} />
              <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>{token}</span>
            </div>
          </div>

          {/* Withdrawal timeline preview (static) */}
          {isSenti && (
            <div style={{ background: '#0d0d0d', border: '1px solid #333', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: '#555', fontWeight: 600, letterSpacing: 0.8, marginBottom: 8 }}>WITHDRAWAL TIMELINE</div>
              {WITHDRAWAL_STEPS.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#444', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#666' }}>{s}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: 10, color: '#555' }}>Estimated processing time: 1–3 business days</div>
            </div>
          )}

          <button onClick={startWithdrawal} disabled={numAmount <= 0} style={{
            width: '100%', padding: '14px', fontSize: 14, letterSpacing: 1, fontWeight: 700,
            background: 'transparent', border: '1px solid #333', borderRadius: 8,
            color: '#888', cursor: 'pointer', opacity: numAmount > 0 ? 1 : 0.4,
          }}>WITHDRAW →</button>
        </>
      )}

      {/* ── WITHDRAWAL RUNNING FLOW ── */}
      {showWithdrawalRunning && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Processing withdrawal…</div>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 20 }}>Estimated time: 1–3 business days</div>
          {WITHDRAWAL_STEPS.map((s, i) => {
            const done = i < withdrawalStep
            const current = i === withdrawalStep
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: done ? '#00e676' : current ? '#0a1a0f' : '#111',
                  border: `2px solid ${done ? '#00e676' : current ? '#00e676' : '#333'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: done ? '#000' : current ? '#00e676' : '#444',
                }}>{done ? '✓' : i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: done ? '#fff' : current ? '#fff' : '#444' }}>{s}</div>
                  {current && <div style={{ fontSize: 10, color: '#00e676', marginTop: 2 }}>In progress…</div>}
                </div>
                {done && <span style={{ fontSize: 12, color: '#00e676' }}>✓</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* ── WITHDRAWAL COMPLETE ── */}
      {withdrawalDone && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#00e676', marginBottom: 4 }}>Withdrawal Complete</div>
          <div style={{ fontSize: 11, color: '#555' }}>Funds have been transferred back to your wallet</div>
          <button onClick={resetFlows} style={{
            marginTop: 16, padding: '8px 16px', background: '#1a1a1a', border: '1px solid #333',
            borderRadius: 6, color: '#888', fontSize: 11, cursor: 'pointer',
          }}>← Back</button>
        </div>
      )}

      {/* ── User position ── */}
      {position && !showActivation && !activationDone && !showWithdrawalRunning && !withdrawalDone && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #1a1a1a' }}>
          <div style={{ fontSize: 10, color: '#555', fontWeight: 600, letterSpacing: 0.8, marginBottom: 10 }}>YOUR POSITION</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Deposited', value: formatCurrency(position.deposited), color: '#fff' },
              { label: 'Current Value', value: formatCurrency(position.currentValue), color: '#fff' },
              { label: 'Earned Yield', value: `+${formatCurrency(position.earnedYield)}`, color: '#00e676' },
              { label: 'Unrealized PnL', value: `${position.unrealizedPnL >= 0 ? '+' : ''}${formatCurrency(position.unrealizedPnL)} (${position.unrealizedPnLPercent.toFixed(2)}%)`, color: position.unrealizedPnL >= 0 ? '#00e676' : '#ef4444' },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
