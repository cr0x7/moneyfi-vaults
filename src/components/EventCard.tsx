'use client'

import Link from 'next/link'
import { Event, EventStatus } from '@/lib/types'
import { formatCurrency, formatDate, formatAPY } from '@/lib/utils'

// ─── Constants (outside component) ────────────────────────────────────────────

const STATUS_META: Record<EventStatus, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'Active', color: '#00e676', bg: '#00e67615' },
  UPCOMING: { label: 'Upcoming', color: '#3b82f6', bg: '#3b82f615' },
  ENDED: { label: 'Ended', color: '#6b7280', bg: '#6b728015' },
}

const TYPE_META: Record<string, { label: string }> = {
  BOOST: { label: 'Boost' },
  CAMPAIGN: { label: 'Campaign' },
  COMPETITION: { label: 'Competition' },
  GUIDED_VAULT: { label: 'Guided Vault' },
  REWARD: { label: 'Rewards' },
}

const MOCK_NOW = new Date('2026-06-03T03:00:00.000Z')

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  return Math.ceil((target.getTime() - MOCK_NOW.getTime()) / (1000 * 60 * 60 * 24))
}

function getProgress(event: Event): { current: number; max: number; percent: number } {
  if (event.maxParticipants && event.participants !== undefined) {
    return {
      current: event.participants,
      max: event.maxParticipants,
      percent: Math.min((event.participants / event.maxParticipants) * 100, 100),
    }
  }
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)
  if (MOCK_NOW < start) return { current: 0, max: 100, percent: 0 }
  if (MOCK_NOW > end) return { current: 100, max: 100, percent: 100 }
  const total = end.getTime() - start.getTime()
  const elapsed = MOCK_NOW.getTime() - start.getTime()
  return { current: Math.round((elapsed / total) * 100), max: 100, percent: (elapsed / total) * 100 }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  const statusMeta = STATUS_META[event.status]
  const typeMeta = TYPE_META[event.type] ?? { label: event.type }
  const progress = getProgress(event)
  const daysLeft = daysUntil(event.endDate)
  const isEnded = event.status === 'ENDED'
  const isUpcoming = event.status === 'UPCOMING'
  const isActive = event.status === 'ACTIVE'

  let timeLabel = ''
  if (isActive && daysLeft > 0) timeLabel = `${daysLeft} days left`
  else if (isUpcoming) {
    const startDays = daysUntil(event.startDate)
    timeLabel = startDays > 0 ? `Starts in ${startDays} days` : 'Starting soon'
  } else if (isEnded) timeLabel = 'Ended'

  return (
    <Link href={`/events/${event.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="card card-hover"
        style={{
          padding: 18,
          position: 'relative',
          overflow: 'hidden',
          opacity: isEnded ? 0.7 : 1,
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: event.color,
            opacity: 0.6,
          }}
        />

        {/* Featured badge */}
        {event.featured && !isEnded && (
          <div
            style={{
              position: 'absolute',
              top: 2,
              right: 0,
              background: '#00e676',
              color: '#000',
              fontSize: 9,
              fontWeight: 800,
              padding: '3px 10px',
              borderBottomLeftRadius: 8,
              letterSpacing: 1,
            }}
          >
            FEATURED
          </div>
        )}

        {/* Icon + status + type row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
            marginTop: 4,
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>{event.icon}</span>
            <div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: event.color,
                  letterSpacing: 0.8,
                  background: event.color + '15',
                  padding: '2px 8px',
                  borderRadius: 4,
                  display: 'inline-block',
                }}
              >
                {typeMeta.label}
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: statusMeta.color,
              background: statusMeta.bg,
              padding: '2px 8px',
              borderRadius: 4,
              letterSpacing: 0.6,
              flexShrink: 0,
            }}
          >
            {statusMeta.label}
          </span>
        </div>

        {/* Name */}
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.3,
            marginBottom: 6,
          }}
        >
          {event.name}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: 12,
            color: '#555',
            lineHeight: 1.5,
            marginBottom: 12,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.description}
        </p>

        {/* Boost APY highlight */}
        {event.boostApy !== undefined && (
          <div
            style={{
              background: '#0a0a0a',
              border: `1px solid ${event.color}25`,
              borderRadius: 8,
              padding: '10px 12px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 9,
                  color: event.color,
                  fontWeight: 700,
                  letterSpacing: 1,
                  marginBottom: 2,
                }}
              >
                BOOSTED APY
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: event.color, lineHeight: 1 }}>
                +{formatAPY(event.boostApy)}
              </div>
            </div>
            <div style={{ fontSize: 10, color: '#444', textAlign: 'right' }}>
              <div>extra yield</div>
              <div style={{ color: '#555' }}>on top of base</div>
            </div>
          </div>
        )}

        {/* Total reward */}
        {event.totalReward !== undefined && (
          <div
            style={{
              background: '#0a0a0a',
              border: `1px solid ${event.color}25`,
              borderRadius: 8,
              padding: '10px 12px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 9,
                  color: event.color,
                  fontWeight: 700,
                  letterSpacing: 1,
                  marginBottom: 2,
                }}
              >
                PRIZE POOL
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                {formatCurrency(event.totalReward)}
              </div>
            </div>
            <div style={{ fontSize: 10, color: '#444', textAlign: 'right' }}>
              <div>{event.rewardToken ?? 'USDT'}</div>
              <div style={{ color: '#555' }}>prize pool</div>
            </div>
          </div>
        )}

        {/* Progress bar (participants) */}
        {event.maxParticipants && event.participants !== undefined && (
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 9, color: '#555' }}>
                {progress.current.toLocaleString()} / {progress.max.toLocaleString()} spots
              </span>
              <span style={{ fontSize: 9, color: event.color }}>
                {progress.percent.toFixed(0)}%
              </span>
            </div>
            <div
              style={{
                height: 3,
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
          </div>
        )}

        {/* Time info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 10,
            borderTop: '1px solid #1a1a1a',
          }}
        >
          <span style={{ fontSize: 10, color: '#555' }}>
            {formatDate(event.startDate)} → {formatDate(event.endDate)}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: isActive ? '#00e676' : isUpcoming ? '#3b82f6' : '#6b7280',
            }}
          >
            {timeLabel}
          </span>
        </div>

        {/* Tags */}
        {event.tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 5,
              flexWrap: 'wrap',
              marginTop: 8,
            }}
          >
            {event.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 9,
                  color: '#555',
                  background: '#1a1a1a',
                  padding: '2px 7px',
                  borderRadius: 4,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
