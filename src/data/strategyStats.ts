// Mock trading & delta-neutral stats per vault

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TradingStats {
  totalBalance: number
  totalEquity: number
  totalPnL: number
  roi: number
  irrAnnualized: number
  maxDrawdown: number        // % MDD
  currentDrawdown: number    // % current DD
  recoveryTime: number       // days
  riskScore: number          // /10
  sharpeRatio: number
  sortinoRatio: number
  calmarRatio: number
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
  // Returns
  allTimeReturn: number      // %
  return30d: number
  return90d: number
  returnYtd: number
  // Fee
  grossProfitBeforeFee: number
  performanceFeePaid: number
  netProfit: number
  highWaterMark: number
  // History
  equityHistory: { date: string; equity: number; balance: number; drawdown: number }[]
  pnlHistory:    { date: string; pnl: number; cumPnl: number }[]
  volumeHistory: { date: string; lots: number; cumLots: number }[]
  // Strategies
  activeStrategies: { name: string; version: string; allocation: number; return: number; mdd: number }[]
}

export interface FundingPayment {
  date: string
  rate: number
  amount: number
  side: 'received' | 'paid'
}

export interface DeltaNeutralStats {
  currentFundingRate: number
  prevFundingRate: number
  annualizedYield: number
  dailyYield: number
  longSize: number
  shortSize: number
  netDelta: number
  collateralUsed: number
  totalFundingCollected: number
  positionHealth: number
  nextFundingMs: number
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
  base: number,
  targetApr: number,
  winRate: number,
  riskScore: number,
  maxDD: number,
  strategies: { name: string; version: string; allocation: number }[],
  days = 120,
): TradingStats {
  const actualApy      = targetApr * (0.85 + Math.random() * 0.3)
  const deals          = Math.floor(days * 0.5)
  const winCount       = Math.round(deals * winRate / 100)
  const lossCount      = deals - winCount
  const grossBeforeFee = base * (actualApy / 100) * (days / 365)
  const perfFee        = grossBeforeFee * 0.20
  const netProfit      = grossBeforeFee - perfFee
  const grossProfit    = grossBeforeFee * 1.8
  const grossLoss      = grossProfit - grossBeforeFee
  const avgWin         = grossProfit / winCount
  const avgLoss        = -(grossLoss / lossCount)
  const profitFactor   = grossProfit / grossLoss

  // Sharpe: (Return - RiskFree) / StdDev ≈ simplified
  const sharpe  = Math.round(((actualApy - 5) / (maxDD * 0.8)) * 100) / 100
  const sortino = Math.round(sharpe * 1.3 * 100) / 100
  const calmar  = Math.round((actualApy / maxDD) * 100) / 100

  const equityHistory: TradingStats['equityHistory'] = []
  let equity = base
  for (let i = days; i >= 0; i--) {
    const daily = (actualApy / 100 / 365) * equity * (0.5 + Math.random())
    equity += daily
    const dd = Math.random() < 0.1 ? Math.random() * maxDD * 0.6 : Math.random() * maxDD * 0.1
    equityHistory.push({ date: daysAgo(i), equity: Math.round(equity * 100) / 100, balance: Math.round((equity - daily * 0.1) * 100) / 100, drawdown: Math.round(dd * 100) / 100 })
  }

  const pnlHistory: TradingStats['pnlHistory'] = []
  let cumPnl = 0
  for (let i = days; i >= 0; i--) {
    const sign = Math.random() < winRate / 100 ? 1 : -1
    const pnl  = sign * (Math.random() * avgWin * 1.5)
    cumPnl += pnl
    pnlHistory.push({ date: daysAgo(i), pnl: Math.round(pnl * 100) / 100, cumPnl: Math.round(cumPnl * 100) / 100 })
  }

  const volumeHistory: TradingStats['volumeHistory'] = []
  let cumLots = 0
  for (let i = days; i >= 0; i--) {
    const lots = 0.01 + Math.random() * 0.04
    cumLots += lots
    volumeHistory.push({ date: daysAgo(i), lots: Math.round(lots * 1000) / 1000, cumLots: Math.round(cumLots * 1000) / 1000 })
  }

  return {
    totalBalance:        Math.round((base + netProfit) * 100) / 100,
    totalEquity:         Math.round((base + netProfit + Math.random() * 50) * 100) / 100,
    totalPnL:            Math.round(netProfit * 100) / 100,
    roi:                 Math.round((netProfit / base) * 1000) / 10,
    irrAnnualized:       Math.round(actualApy * 0.8 * 10) / 10,
    maxDrawdown:         maxDD,
    currentDrawdown:     Math.round(Math.random() * maxDD * 0.3 * 100) / 100,
    recoveryTime:        Math.round(10 + Math.random() * 20),
    riskScore,
    sharpeRatio:         sharpe,
    sortinoRatio:        sortino,
    calmarRatio:         calmar,
    closedDeals:         deals,
    winRate:             Math.round(winRate * 10) / 10,
    profitFactor:        Math.round(profitFactor * 100) / 100,
    grossProfit:         Math.round(grossProfit * 100) / 100,
    grossLoss:           Math.round(grossLoss * 100) / 100,
    totalVolumeLots:     Math.round(cumLots * 1000) / 1000,
    notionalVolume:      Math.round(cumLots * 3200 * 100) / 100,
    avgWin:              Math.round(avgWin * 100) / 100,
    avgLoss:             Math.round(avgLoss * 100) / 100,
    expectancy:          Math.round(((winRate / 100) * avgWin + (1 - winRate / 100) * avgLoss) * 100) / 100,
    longCount:           Math.round(deals * 0.64),
    shortCount:          Math.round(deals * 0.36),
    robotCount:          deals,
    manualCount:         0,
    winCount,
    lossCount,
    allTimeReturn:       Math.round(actualApy * (days / 365) * 10) / 10,
    return30d:           Math.round(actualApy / 12 * (0.8 + Math.random() * 0.4) * 10) / 10,
    return90d:           Math.round(actualApy / 4 * (0.8 + Math.random() * 0.4) * 10) / 10,
    returnYtd:           Math.round(actualApy * 0.5 * (0.8 + Math.random() * 0.4) * 10) / 10,
    grossProfitBeforeFee: Math.round(grossBeforeFee * 100) / 100,
    performanceFeePaid:   Math.round(perfFee * 100) / 100,
    netProfit:            Math.round(netProfit * 100) / 100,
    highWaterMark:        Math.round((base + netProfit * 1.05) * 100) / 100,
    equityHistory,
    pnlHistory,
    volumeHistory,
    activeStrategies: strategies.map(s => ({
      ...s,
      return: Math.round(actualApy * (s.allocation / 100) * (0.7 + Math.random() * 0.6) * 10) / 10,
      mdd:    Math.round(maxDD * (0.5 + Math.random() * 0.5) * 100) / 100,
    })),
  }
}

function makeDeltaStats(tvl: number, fundingRate: number): DeltaNeutralStats {
  const perAnnum  = fundingRate * 3 * 365
  const dailyYield = (fundingRate / 100) * 3 * 1000
  const posSize   = tvl * 0.48
  const collected = tvl * 0.08

  const fundingRateHistory: DeltaNeutralStats['fundingRateHistory'] = []
  let cumYield = 0
  for (let i = 90; i >= 0; i--) {
    const noise = (Math.random() - 0.5) * 0.008
    const rate  = Math.max(0.001, fundingRate + noise)
    cumYield   += rate * 3
    fundingRateHistory.push({ date: daysAgo(i), rate: Math.round(rate * 10000) / 10000, cumYield: Math.round(cumYield * 100) / 100 })
  }

  const recentPayments: FundingPayment[] = Array.from({ length: 10 }, (_, i) => {
    const noise  = (Math.random() - 0.5) * 0.006
    const rate   = Math.max(0.001, fundingRate + noise)
    const amount = (rate / 100) * posSize
    const d = new Date()
    d.setHours(d.getHours() - i * 8)
    return { date: d.toISOString(), rate: Math.round(rate * 10000) / 10000, amount: Math.round(amount * 100) / 100, side: 'received' as const }
  })

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
  'senti-conservative': makeTradingStats(
    30000, 50, 71.0, 3, 12.4, [
      { name: 'Grid DCA', version: 'v1.02', allocation: 45 },
      { name: 'EMA Mirror', version: 'v1.01', allocation: 35 },
      { name: 'MFR DCA', version: 'v2.02', allocation: 20 },
    ]
  ),
  'senti-balanced': makeTradingStats(
    30000, 100, 67.2, 5, 24.8, [
      { name: 'EMA Crossover', version: 'v1.09', allocation: 40 },
      { name: 'Fibonacci DCA', version: 'v1.03', allocation: 35 },
      { name: 'EMA Mirror', version: 'v1.03', allocation: 25 },
    ]
  ),
  'senti-aggressive': makeTradingStats(
    30000, 200, 56.3, 8, 42.0, [
      { name: 'Markov Chain', version: 'v1.01', allocation: 45 },
      { name: 'ORB', version: 'v2.02', allocation: 35 },
      { name: 'EMA Mirror', version: 'v1.03 (Aggressive)', allocation: 20 },
    ]
  ),
  // LP vault — stable yield, low drawdown, high consistency
  'usdt-multi-strategy': makeTradingStats(
    18640000, 29.74, 88.0, 2, 6.5, [
      { name: 'Tapp Exchange', version: 'V2', allocation: 69.6 },
      { name: 'Moar', version: 'v1', allocation: 25.8 },
      { name: 'Hyperion', version: 'v1', allocation: 4.4 },
      { name: 'Aries Markets', version: 'v1', allocation: 0.2 },
    ]
  ),
  // Delta Neutral — market-neutral funding rate, medium risk
  'delta-neutral': makeTradingStats(
    6430000, 27.6, 76.0, 4, 14.0, [
      { name: 'HyperLiquid Perp', version: 'v1', allocation: 70.0 },
      { name: 'Hyperion', version: 'v1', allocation: 20.0 },
      { name: 'Moar', version: 'v1', allocation: 10.0 },
    ]
  ),
}

export const DELTA_STATS: Record<string, DeltaNeutralStats> = {
  'delta-neutral': makeDeltaStats(6430000, 0.0231),
}
