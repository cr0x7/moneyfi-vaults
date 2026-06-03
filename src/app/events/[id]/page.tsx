'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getVaultById } from '@/data/vaults'
import { getEventById, EVENTS } from '@/data/events'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'Active', color: '#00e676', bg: '#00e67615' },
  UPCOMING: { label: 'Upcoming', color: '#3b82f6', bg: '#3b82f615' },
  ENDED: { label: 'Ended', color: '#6b7280', bg: '#6b728015' },
}

function daysUntil(dateStr: string): number {
  const now = new Date('2026-06-03T03:00:00.000Z')
  const target = new Date(dateStr)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function getProgress(event: typeof EVENTS[0]): { current: number; max: number; percent: number } {
  if (event.maxParticipants && event.participants !== undefined) {
    return {
      current: event.participants,
      max: event.maxParticipants,
      percent: Math.min((event.participants / event.maxParticipants) * 100, 100),
    }
  }
  const now = new Date('2026-06-03T03:00:00.000Z')
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)
  if (now < start) return { current: 0, max: 100, percent: 0 }
  if (now > end) return { current: 100, max: 100, percent: 100 }
  const total = end.getTime() - start.getTime()
  const elapsed = now.getTime() - start.getTime()
  return { current: Math.round((elapsed / total) * 100), max: 100, percent: (elapsed / total) * 100 }
}

// Tier definitions for participation levels
const TIERS = [
  { name: 'Bronze', minDeposit: 100, boost: 2.0, color: '#cd7f32', bg: '#1a1208' },
  { name: 'Silver', minDeposit: 500, boost: 4.0, color: '#c0c0c0', bg: '#12131a' },
  { name: 'Gold', minDeposit: 2000, boost: 6.0, color: '#ffd700', bg: '#1a1808' },
  { name: 'Diamond', minDeposit: 10000, boost: 8.0, color: '#b9f2ff', bg: '#081a1e' },
]

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const event = getEventById(id)
  const vault = event?.vaultId ? getVaultById(event.vaultId) : null

  if (!event) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
        <div style={{ fontSize: 14, color: '#555', marginBottom: 12 }}>Event not found.</div>
        <Link href="/events" style={{ color: '#00e676', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
          ← Back to Events
        </Link>
      </div>
    )
  }

  const statusMeta = STATUS_META[event.status] ?? STATUS_META['ACTIVE']
  const progress = getProgress(event)
  const daysLeft = daysUntil(event.endDate)
  const isEnded = event.status === 'ENDED'
  const isUpcoming = event.status === 'UPCOMING'
  const isActive = event.status === 'ACTIVE'
  const boostedBaseApy = vault?.baseApy ?? 0
  const boostedTotalApy = boostedBaseApy + (event.boostApy ?? 0)

  let timeLabel = ''
  if (isActive && daysLeft > 0) timeLabel = `${daysLeft} days remaining`
  else if (isActive && daysLeft <= 0) timeLabel = 'Ending soon'
  else if (isUpcoming) {
    const startDays = daysUntil(event.startDate)
    timeLabel = startDays > 0 ? `Starts in ${startDays} days` : 'Starting soon'
  } else timeLabel = 'Event ended'

  return (
    <div className="page-wrap" style={{ paddingTop: 20, paddingBottom: 48 }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#555' }}>
        <Link href="/events" style={{ color: '#555', textDecoration: 'none' }}>Events</Link>
        <span>/</span>
        <span style={{ color: event.color }}>{event.icon} {event.name}</span>
      </div>

      <div className="detail-grid">
        {/* ── Top Section ───────────────────────────────────── */}
        <div className="detail-main-top">
          {/* Event header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 10,
                  fontWeight: 700,
                  color: event.color,
                  background: event.color + '18',
                  border: `1px solid ${event.color}30`,
                  padding: '3px 10px',
                  borderRadius: 20,
                }}
              >
                {event.icon} BOOST
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: statusMeta.color,
                  background: statusMeta.bg,
                  padding: '2px 8px',
                  borderRadius: 4,
                  letterSpacing: 0.6,
                }}
              >
                {statusMeta.label}
              </span>
              {isActive && (
                <span
                  className="live-dot"
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#00e676',
                    background: '#00e67615',
                    padding: '2px 8px',
                    borderRadius: 4,
                    letterSpacing: 0.6,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: '#00e676',
                      display: 'inline-block',
                    }}
                  />
                  LIVE
                </span>
              )}
            </div>

            <h1
              style={{
                fontSize: 'clamp(22px, 4vw, 32px)',
                fontWeight: 900,
                color: '#fff',
                marginBottom: 8,
                lineHeight: 1.2,
              }}
            >
              {event.name}
            </h1>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, maxWidth: 700 }}>
              {event.description}
            </p>
          </div>

          {/* Boost APY highlight */}
          {event.boostApy !== undefined && (
            <div
              className="card"
              style={{
                padding: 20,
                marginBottom: 16,
                borderColor: event.color + '30',
                background: '#0a0a0a',
              }}
            >
              <div style={{ fontSize: 9, color: event.color, fontWeight: 700, letterSpacing: 1.2, marginBottom: 8 }}>
                BOOSTED APY
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: event.color, lineHeight: 1 }}>
                  +{event.boostApy.toFixed(1)}%
                </span>
                <span style={{ fontSize: 14, color: '#555' }}>
                  extra yield on top of base APY
                </span>
              </div>
              {vault && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '12px 16px',
                    background: '#111',
                    borderRadius: 8,
                    border: '1px solid #222',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 9, color: '#555', letterSpacing: 0.8, marginBottom: 4 }}>BASE APY</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{boostedBaseApy.toFixed(2)}%</div>
                  </div>
                  <div style={{ fontSize: 18, color: '#333', fontWeight: 300 }}>+</div>
                  <div>
                    <div style={{ fontSize: 9, color: event.color, letterSpacing: 0.8, marginBottom: 4 }}>BOOST</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: event.color }}>+{event.boostApy.toFixed(1)}%</div>
                  </div>
                  <div style={{ fontSize: 18, color: '#333', fontWeight: 300 }}>=</div>
                  <div>
                    <div style={{ fontSize: 9, color: '#555', letterSpacing: 0.8, marginBottom: 4 }}>TOTAL APY</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{boostedTotalApy.toFixed(2)}%</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Time & Progress */}
          <div
            className="card"
            style={{ padding: 20, marginBottom: 16 }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div>
                <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>
                  EVENT PERIOD
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  {formatDate(event.startDate)} → {formatDate(event.endDate)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>
                  STATUS
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: isActive ? '#00e676' : isUpcoming ? '#3b82f6' : '#6b7280',
                  }}
                >
                  {timeLabel}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: '#555' }}>
                  {event.participants !== undefined
                    ? `${event.participants.toLocaleString()} participants`
                    : 'Participation progress'}
                </span>
                <span style={{ fontSize: 10, color: event.color, fontWeight: 600 }}>
                  {progress.percent.toFixed(1)}%
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: '#1a1a1a',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progress.percent}%`,
                    background: event.color,
                    borderRadius: 2,
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              {event.maxParticipants && (
                <div style={{ fontSize: 10, color: '#444', marginTop: 4 }}>
                  {event.participants?.toLocaleString() ?? 0} / {event.maxParticipants.toLocaleString()} spots filled
                </div>
              )}
            </div>
          </div>

          {/* ── Participation Tiers ───────────────────────────── */}
          {isActive && (
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 9,
                  color: '#555',
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  marginBottom: 14,
                }}
              >
                PARTICIPATION TIERS
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: 10,
                }}
                className="vault-grid"
              >
                {TIERS.map((tier) => {
                  const totalApy = boostedBaseApy + tier.boost
                  return (
                    <div
                      key={tier.name}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 8,
                        border: `1px solid ${tier.color}30`,
                        background: tier.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: tier.color + '20',
                            border: `1px solid ${tier.color}40`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 900,
                            color: tier.color,
                          }}
                        >
                          {tier.name[0]}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: tier.color }}>{tier.name}</div>
                          <div style={{ fontSize: 10, color: '#555' }}>Deposit ≥ ${tier.minDeposit.toLocaleString()}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>+{tier.boost.toFixed(1)}%</div>
                        <div style={{ fontSize: 10, color: tier.color }}>boost → {totalApy.toFixed(1)}% total</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Prize Pool (for competitions/campaigns) */}
          {event.totalReward !== undefined && (
            <div
              className="card"
              style={{
                padding: 20,
                marginBottom: 16,
                borderColor: event.color + '30',
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  color: event.color,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  marginBottom: 8,
                }}
              >
                TOTAL PRIZE POOL
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 4 }}>
                {formatCurrency(event.totalReward)}
              </div>
              <div style={{ fontSize: 12, color: '#555' }}>
                {event.rewardToken ?? 'USDT'} distributed across all participants
              </div>
            </div>
          )}

          {/* Tags */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
              marginBottom: 16,
            }}
          >
            {event.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 10,
                  color: '#555',
                  background: '#1a1a1a',
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: '1px solid #222',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── Sidebar: Vault Info ────────────────────────────── */}
        {vault && (
          <div className="deposit-sticky">
            <div className="card" style={{ padding: 18, marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 9,
                  color: '#555',
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  marginBottom: 12,
                }}
              >
                LINKED VAULT
              </div>
              <Link
                href={`/vault/${vault.id}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  style={{
                    padding: '14px',
                    borderRadius: 8,
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                    {vault.name}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 10, color: '#555' }}>Base APY</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: event.color }}>
                      {vault.baseApy.toFixed(2)}%
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 10, color: '#555' }}>Boosted APY</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: event.color }}>
                      +{event.boostApy?.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 10, color: '#555' }}>TVL</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>
                      {formatCurrency(vault.tvl, true)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: 10, color: '#555' }}>Min Deposit</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>
                      ${vault.minDeposit}
                    </span>
                  </div>
                </div>
              </Link>
              <Link
                href={`/vault/${vault.id}`}
                style={{ textDecoration: 'none' }}
              >
                <button
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: 12,
                    fontWeight: 800,
                    borderRadius: 8,
                  }}
                >
                  View Vault →
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ── Campaign Info Section ──────────────────────────── */}
        <div className="detail-main-content">
          {/* Participants overview */}
          <div className="metrics-grid" style={{ marginBottom: 20 }}>
            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 5 }}>
                PARTICIPANTS
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {event.participants?.toLocaleString() ?? '—'}
              </div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>
                {event.maxParticipants
                  ? `of ${event.maxParticipants.toLocaleString()} max`
                  : 'unlimited'}
              </div>
            </div>
            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: 9, color: event.color, fontWeight: 600, letterSpacing: 1, marginBottom: 5 }}>
                BOOST APY
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: event.color, lineHeight: 1 }}>
                +{event.boostApy?.toFixed(1) ?? '—'}%
              </div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>
                extra yield
              </div>
            </div>
            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 5 }}>
                BOOSTED TOTAL
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {boostedTotalApy.toFixed(1)}%
              </div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>
                {boostedBaseApy.toFixed(1)}% + {event.boostApy?.toFixed(1)}% boost
              </div>
            </div>
            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1, marginBottom: 5 }}>
                REMAINING
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: daysLeft > 0 ? '#fff' : '#6b7280',
                  lineHeight: 1,
                }}
              >
                {daysLeft > 0 ? `${daysLeft}d` : 'Ended'}
              </div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>
                {isActive ? 'until event ends' : isUpcoming ? 'until event starts' : 'event closed'}
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div
              style={{
                fontSize: 9,
                color: '#555',
                fontWeight: 700,
                letterSpacing: 1.2,
                marginBottom: 16,
              }}
            >
              HOW IT WORKS
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 14,
              }}
              className="vault-grid"
            >
              {[
                { step: '01', title: 'Deposit USDT', desc: 'Deposit USDT into the Stable LP Vault. Minimum $100 to participate in the boost campaign.' },
                { step: '02', title: 'Choose Your Tier', desc: 'Higher deposits unlock bigger boost tiers: Bronze (2%), Silver (4%), Gold (6%), Diamond (8%).' },
                { step: '03', title: 'Earn Boosted Yield', desc: 'Your boosted APY compounds every 8 hours via auto-compounding. No action needed.' },
                { step: '04', title: 'Collect Rewards', desc: 'Boosted yield is paid out continuously. Withdraw anytime — no lock-up period.' },
              ].map((item) => (
                <div
                  key={item.step}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: event.color + '15',
                      border: `1px solid ${event.color}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 800,
                      color: event.color,
                      flexShrink: 0,
                    }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div
              style={{
                fontSize: 9,
                color: '#555',
                fontWeight: 700,
                letterSpacing: 1.2,
                marginBottom: 12,
              }}
            >
              TERMS & CONDITIONS
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {[
                'Campaign runs from June 1, 2026 to June 15, 2026 (UTC).',
                'Boost is applied on top of the base APY of the Stable LP Vault.',
                'Boost tier is determined by your deposit amount at the time of entry.',
                'Boost compounds automatically every 8 hours alongside base yield.',
                'Early withdrawal is allowed. Boost is recalculated on next deposit.',
                'Tether reserves the right to adjust or terminate the campaign early.',
                'Fraudulent or wash-trade activity will result in boost removal.',
              ].map((rule) => (
                <li
                  key={rule}
                  style={{
                    fontSize: 12,
                    color: '#666',
                    lineHeight: 1.5,
                    paddingLeft: 16,
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      color: '#333',
                    }}
                  >
                    •
                  </span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
