'use client'

import { useState } from 'react'
import EventCard from '@/components/EventCard'
import { EVENTS } from '@/data/events'
import { EventStatus, EventType } from '@/lib/types'

const STATUS_FILTERS: { id: EventStatus | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All Status' },
  { id: 'ACTIVE', label: 'Active' },
  { id: 'UPCOMING', label: 'Upcoming' },
  { id: 'ENDED', label: 'Ended' },
]

const TYPE_FILTERS: { id: EventType | 'ALL'; label: string; icon: string }[] = [
  { id: 'ALL', label: 'All Types', icon: '📋' },
  { id: 'BOOST', label: 'Boost', icon: '🚀' },
  { id: 'CAMPAIGN', label: 'Campaign', icon: '🎁' },
  { id: 'COMPETITION', label: 'Competition', icon: '🏆' },
  { id: 'GUIDED_VAULT', label: 'Guided Vault', icon: '🧭' },
  { id: 'REWARD', label: 'Rewards', icon: '⛏️' },
]

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'startDate', label: 'Start Date' },
  { id: 'reward', label: 'Reward Pool' },
] as const

export default function EventsPage() {
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'ALL'>('ALL')
  const [typeFilter, setTypeFilter] = useState<EventType | 'ALL'>('ALL')
  const [sort, setSort] = useState<'featured' | 'startDate' | 'reward'>('featured')
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  const activeCount = EVENTS.filter((e) => e.status === 'ACTIVE').length
  const upcomingCount = EVENTS.filter((e) => e.status === 'UPCOMING').length

  const filteredEvents = EVENTS
    .filter((e) => {
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false
      if (typeFilter !== 'ALL' && e.type !== typeFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
        )
      }
      return true
    })
    .sort((a, b) => {
      if (sort === 'startDate') return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      if (sort === 'reward') {
        const ra = a.totalReward ?? 0
        const rb = b.totalReward ?? 0
        if (ra !== rb) return rb - ra
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      }
      // featured sort: featured first, then by startDate
      const fa = a.featured ? 1 : 0
      const fb = b.featured ? 1 : 0
      if (fa !== fb) return fb - fa
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    })

  return (
    <div className="page-wrap">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{ paddingTop: 36, paddingBottom: 28 }}>
        <div style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: 2, marginBottom: 10 }}>
          MONEYFI · EVENTS
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="hero-title" style={{ marginBottom: 6 }}>
              Yield{' '}
              <span className="gradient-text">Campaigns</span>
            </h1>
            <p style={{ fontSize: 14, color: '#555' }}>
              Boosted vaults · competitions · limited-time rewards
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {activeCount > 0 && (
              <div className="card" style={{ padding: '10px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1 }}>ACTIVE</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#00e676', lineHeight: 1.2 }}>{activeCount}</div>
              </div>
            )}
            {upcomingCount > 0 && (
              <div className="card" style={{ padding: '10px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1 }}>UPCOMING</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#3b82f6', lineHeight: 1.2 }}>{upcomingCount}</div>
              </div>
            )}
            <div className="card" style={{ padding: '10px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#555', fontWeight: 600, letterSpacing: 1 }}>TOTAL EVENTS</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{EVENTS.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        {/* Header row */}
        <div className="vaults-header" style={{ marginBottom: 10 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
            ALL EVENTS
            <span style={{ color: '#333', fontSize: 12, fontWeight: 400, marginLeft: 8 }}>
              {filteredEvents.length} results
            </span>
          </h2>
          <div style={{ display: 'flex', gap: 4 }}>
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: sort === s.id ? '#00e676' : '#1a1a1a',
                  color: sort === s.id ? '#000' : '#555',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile filter trigger */}
        <button
          className="mobile-filter-trigger"
          type="button"
          onClick={() => setFilterOpen(true)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #333',
            background: '#111',
            color: '#fff',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 0.8,
            cursor: 'pointer',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            display: 'flex',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              border: '1px solid #00e67655',
              background: '#00e67612',
              color: '#00e676',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 5h16l-6.4 7.3v5.2L10.4 20v-7.7L4 5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </span>
          <span style={{ color: '#00e676' }}>
            {statusFilter === 'ALL' ? 'All Status' : STATUS_FILTERS.find((f) => f.id === statusFilter)?.label} ·{' '}
            {typeFilter === 'ALL' ? 'All Types' : TYPE_FILTERS.find((f) => f.id === typeFilter)?.label}
          </span>
        </button>

        {/* Desktop filter bar */}
        <div className="filters-bar filters-desktop">
          {/* Status chips */}
          <div className="filter-chips">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                style={{
                  flexShrink: 0,
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: statusFilter === f.id ? '#888' : '#222',
                  background: statusFilter === f.id ? '#1a1a1a' : 'transparent',
                  color: statusFilter === f.id ? '#fff' : '#555',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Type chips */}
          <div className="filter-chips">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                style={{
                  flexShrink: 0,
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: typeFilter === f.id ? '#888' : '#222',
                  background: typeFilter === f.id ? '#1a1a1a' : 'transparent',
                  color: typeFilter === f.id ? '#fff' : '#555',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>{f.icon}</span> {f.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#111',
              border: '1px solid #222',
              borderRadius: 8,
              padding: '6px 12px',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12, color: '#444' }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: 12,
                color: '#fff',
                width: '100%',
                minWidth: 0,
              }}
            />
          </div>
        </div>

        {/* Mobile filter popup */}
        {filterOpen && (
          <div
            className="filter-popup"
            onClick={() => setFilterOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 90,
              background: 'rgba(0,0,0,0.58)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                background: '#101010',
                borderTop: '1px solid #2a2a2a',
                borderRadius: '14px 14px 0 0',
                padding: 16,
                boxShadow: '0 -24px 70px rgba(0,0,0,0.45)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                <div style={{ fontSize: 13, color: '#fff', fontWeight: 900, letterSpacing: 1 }}>FILTER EVENTS</div>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: '1px solid #333',
                    background: '#151515',
                    color: '#888',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}
              >
                STATUS
              </div>
              <div className="filter-chips" style={{ marginBottom: 14 }}>
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    style={{
                      flexShrink: 0,
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: statusFilter === f.id ? '#555' : '#222',
                      background: statusFilter === f.id ? '#1e1e1e' : 'transparent',
                      color: statusFilter === f.id ? '#fff' : '#555',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div
                style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}
              >
                TYPE
              </div>
              <div className="filter-chips" style={{ marginBottom: 14 }}>
                {TYPE_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTypeFilter(f.id)}
                    style={{
                      flexShrink: 0,
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: typeFilter === f.id ? '#555' : '#222',
                      background: typeFilter === f.id ? '#1e1e1e' : 'transparent',
                      color: typeFilter === f.id ? '#fff' : '#555',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{f.icon}</span> {f.label}
                  </button>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#0d0d0d',
                  border: '1px solid #222',
                  borderRadius: 8,
                  padding: '9px 12px',
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: 12, color: '#444' }}>🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events..."
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    fontSize: 12,
                    color: '#fff',
                    width: '100%',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: 'none',
                  background: '#00e676',
                  color: '#000',
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                APPLY FILTERS
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Events Grid ──────────────────────────────────────── */}
      {filteredEvents.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 14,
            paddingBottom: 48,
            alignItems: 'stretch',
          }}
          className="vault-grid"
        >
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#444' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 14 }}>No events match your filters</div>
        </div>
      )}
    </div>
  )
}
