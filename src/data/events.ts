// Mock event data for the Events page
import { Event, EventStatus } from '@/lib/types'

export const EVENTS: Event[] = [
  {
    id: 'tether-campaign-boost',
    name: 'Tether Campaign Boost',
    description:
      'Deposit USDT into the Stable LP Vault and earn an extra +6% boosted APY powered by Tether. This limited campaign runs for 2 weeks and is open to all USDT depositors. Auto-compounding is enabled by default — your boosted yield compounds every 8 hours.',
    type: 'BOOST',
    status: 'ACTIVE',
    vaultId: 'usdt-multi-strategy',
    startDate: '2026-06-01T00:00:00Z',
    endDate: '2026-06-15T00:00:00Z',
    boostApy: 6.0,
    participants: 3891,
    maxParticipants: 15000,
    icon: '₮',
    color: '#26a17b',
    featured: true,
    tags: ['Boost', 'Tether', 'USDT', 'Stable LP', 'Aptos', 'Campaign'],
  },
]

export function getEventById(id: string): Event | undefined {
  return EVENTS.find((e) => e.id === id)
}

export function getEventsByStatus(status: EventStatus): Event[] {
  return EVENTS.filter((e) => e.status === status)
}

export function getEventsByType(type: string): Event[] {
  return EVENTS.filter((e) => e.type === type)
}
