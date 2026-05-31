// Mock trading & delta-neutral stats per vault

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TradingStats {
  totalBalance: number
  totalEquity: number
  totalPnL: number
  roi: number
  irrAnnualized: number
  closedDeals: number
  winRate: number
  profitFactor: number
  grossProfit: number
  grossLoss: number
  totalVolumeLots: number
  notionalVolume: number
  avgWin: number
  avgLoss: number
  expectancy: number
  longCount: number
  shortCount: number
  robotCount: number
  manualCount: number
  winCount: number
  lossCount: number
  equityHistory: { date: string; equity: number; balance: number; drawdown: number }[]
  pnlHistory:    { date: string; pnl: number; cumPnl: number }[]
  volumeHistory: { date: string; lots: number; cumLots: number }[]
}

export interface FundingPayment {
  date: string
  rate: number   // % per 8h
  amount: number // $ collected
  side: 'received' | 'paid'
}

export interface DeltaNeutralStats {
  currentFundingRate: number       // % per 8h
  prevFundingRate: number
  annualizedYield: number          // % from funding alone
  dailyYield: number               // $ per day per $1000
  longSize: number                 // $ notional
  shortSize: number                // $ notional
  netDelta: number                 // $ (near 0)
  collateralUsed: number           // $
  totalFundingCollected: number    // $ since inception
  positionHealth: number           // 0-100
  nextFundingMs: number            // ms until next funding
  fundingRateHistory: { date: string; rate: number; cumYield: number }[]
  recentPayments: FundingPayment[]
}

// ─── Generators ──────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function makeTradingStats(
  base: number,       // account size
  apy: number,
  winRate: number,
  days = 120,
): TradingStats {
  const deals         = Math.floor(days * 0.5)
  const winCount      = Math.round(deals * winRate / 100)
  const lossCount     = deals - winCount
  const grossProfit   = base * (apy / 100) * (days / 365) * 1.8
  const grossLoss     = grossProfit / (1 + (winRate - 40) / 100 * 2)
  const totalPnL      = grossProfit - grossLoss
  const avgWin        = grossProfit / winCount
  const avgLoss       = -(grossLoss / lossCount)
  const profitFactor  = grossProfit / grossLoss

  // equity history
  const equityHistory: TradingStats['equityHistory'] = []
  let   equity = base
  for (let i = days; i >= 0; i--) {
    const daily = (apy / 100 / 365) * equity * (0.5 + Math.random())
    equity += daily
    const dd = Math.max(0, (Math.random() < 0.15 ? Math.random() * 4 : Math.random() * 0.5))
    equityHistory.push({ date: daysAgo(i), equity: Math.round(equity * 100) / 100, balance: Math.round((equity - daily * 0.1) * 100) / 100, drawdown: dd })
  }

  // daily pnl
  const pnlHistory: TradingStats['pnlHistory'] = []
  let cumPnl = 0
  for (let i = days; i >= 0; i--) {
    const sign = Math.random() < winRate / 100 ? 1 : -1
    const pnl  = sign * (Math.random() * avgWin * 1.5)
    cumPnl += pnl
    pnlHistory.push({ date: daysAgo(i), pnl: Math.round(pnl * 100) / 100, cumPnl: Math.round(cumPnl * 100) / 100 })
  }

  // volume
  const volumeHistory: TradingStats['volumeHistory'] = []
  let cumLots = 0
  for (let i = days; i >= 0; i--) {
    const lots = 0.01 + Math.random() * 0.04
    cumLots += lots
    volumeHistory.push({ date: daysAgo(i), lots: Math.round(lots * 1000) / 1000, cumLots: Math.round(cumLots * 1000) / 1000 })
  }

  return {
    totalBalance:   Math.round((base + totalPnL) * 100) / 100,
    totalEquity:    Math.round((base + totalPnL + Math.random() * 20) * 100) / 100,
    totalPnL:       Math.round(totalPnL * 100) / 100,
    roi:            Math.round((totalPnL / base) * 1000) / 10,
    irrAnnualized:  Math.round(apy * 10 + Math.random() * 50),
    closedDeals:    deals,
    winRate:        Math.round(winRate * 10) / 10,
    profitFactor:   Math.round(profitFactor * 100) / 100,
    grossProfit:    Math.round(grossProfit * 100) / 100,
    grossLoss:      Math.round(grossLoss * 100) / 100,
    totalVolumeLots: Math.round(cumLots * 1000) / 1000,
    notionalVolume:  Math.round(cumLots * 3200 * 100) / 100,
    avgWin:         Math.round(avgWin * 100) / 100,
    avgLoss:        Math.round(avgLoss * 100) / 100,
    expectancy:     Math.round(((winRate / 100) * avgWin + (1 - winRate / 100) * avgLoss) * 100) / 100,
    longCount:      Math.round(deals * 0.64),
    shortCount:     Math.round(deals * 0.36),
    robotCount:     deals,
    manualCount:    0,
    winCount,
    lossCount,
    equityHistory,
    pnlHistory,
    volumeHistory,
  }
}

function makeDeltaStats(tvl: number, fundingRate: number): DeltaNeutralStats {
  const perAnnum      = fundingRate * 3 * 365
  const dailyYield    = (fundingRate / 100) * 3 * 1000  // per $1000
  const posSize       = tvl * 0.48
  const collected     = tvl * 0.08

  // 90-day funding rate history (3 payments per day = every 8h)
  const fundingRateHistory: DeltaNeutralStats['fundingRateHistory'] = []
  let cumYield = 0
  for (let i = 90; i >= 0; i--) {
    const noise = (Math.random() - 0.5) * 0.008
    const rate  = Math.max(0.001, fundingRate + noise)
    cumYield   += rate * 3
    fundingRateHistory.push({
      date:     daysAgo(i),
      rate:     Math.round(rate * 10000) / 10000,
      cumYield: Math.round(cumYield * 100) / 100,
    })
  }

  // Recent 10 funding payments
  const recentPayments: FundingPayment[] = Array.from({ length: 10 }, (_, i) => {
    const noise  = (Math.random() - 0.5) * 0.006
    const rate   = Math.max(0.001, fundingRate + noise)
    const amount = (rate / 100) * posSize
    const hoursAgo = i * 8
    const d = new Date()
    d.setHours(d.getHours() - hoursAgo)
    return {
      date:   d.toISOString(),
      rate:   Math.round(rate * 10000) / 10000,
      amount: Math.round(amount * 100) / 100,
      side:   'received' as const,
    }
  })

  // Next funding: HyperLiquid pays at 00:00, 08:00, 16:00 UTC
  const now      = new Date()
  const utcH     = now.getUTCHours()
  const nextSlot = [0, 8, 16].find(h => h > utcH) ?? 24
  const diffMs   = ((nextSlot - utcH) * 3600 - now.getUTCMinutes() * 60 - now.getUTCSeconds()) * 1000

  return {
    currentFundingRate:    Math.round(fundingRate * 10000) / 10000,
    prevFundingRate:       Math.round((fundingRate + (Math.random() - 0.5) * 0.004) * 10000) / 10000,
    annualizedYield:       Math.round(perAnnum * 100) / 100,
    dailyYield:            Math.round(dailyYield * 1000) / 1000,
    longSize:              Math.round(posSize * 100) / 100,
    shortSize:             Math.round(posSize * 100) / 100,
    netDelta:              Math.round((Math.random() - 0.5) * 4 * 100) / 100,
    collateralUsed:        Math.round(posSize * 0.12 * 100) / 100,
    totalFundingCollected: Math.round(collected * 100) / 100,
    positionHealth:        92 + Math.round(Math.random() * 6),
    nextFundingMs:         diffMs > 0 ? diffMs : diffMs + 8 * 3600 * 1000,
    fundingRateHistory,
    recentPayments,
  }
}

// ─── Per-vault stats ──────────────────────────────────────────────────────────

export const TRADING_STATS: Record<string, TradingStats> = {
  'ema-mirror-alpha':    makeTradingStats(30000, 18.4,  64.2),
  'fibonacci-cascade':   makeTradingStats(30000, 24.7,  61.5),
  'ema-crossover-yield': makeTradingStats(30000, 31.2,  67.2),
  'open-range-breakout': makeTradingStats(30000, 22.9,  59.8),
  'grid-dca-stable':     makeTradingStats(30000, 15.6,  71.0),
  'markov-chain-alpha':  makeTradingStats(30000, 38.4,  56.3),
  'mfr-dca-trend':       makeTradingStats(30000, 19.8,  63.1),
}

export const DELTA_STATS: Record<string, DeltaNeutralStats> = {
  'delta-neutral': makeDeltaStats(6430000, 0.0231),
}
