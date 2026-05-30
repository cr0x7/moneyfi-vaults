import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatAPY(value: number): string {
  return `${value.toFixed(2)}%`
}

export function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function calcEstimatedEarnings(
  principal: number,
  apy: number,
  months: number
): number {
  const monthlyRate = apy / 100 / 12
  return principal * (Math.pow(1 + monthlyRate, months) - 1)
}

export function riskColor(risk: string): string {
  switch (risk) {
    case 'LOW': return 'text-green-400'
    case 'MEDIUM': return 'text-yellow-400'
    case 'HIGH': return 'text-orange-400'
    case 'ADVANCED': return 'text-red-400'
    default: return 'text-gray-400'
  }
}

export function riskBgColor(risk: string): string {
  switch (risk) {
    case 'LOW': return 'bg-green-400/10 text-green-400 border-green-400/20'
    case 'MEDIUM': return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
    case 'HIGH': return 'bg-orange-400/10 text-orange-400 border-orange-400/20'
    case 'ADVANCED': return 'bg-red-400/10 text-red-400 border-red-400/20'
    default: return 'bg-gray-400/10 text-gray-400 border-gray-400/20'
  }
}
