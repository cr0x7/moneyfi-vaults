import { Vault, UserPosition } from '@/lib/types'

function generateAPYHistory(baseApy: number, boost: number, days = 90) {
  const now = new Date()
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (days - i))
    const noise = (Math.random() - 0.5) * 4
    const base = Math.max(baseApy + noise * 0.6, 1)
    const boostVal = Math.max(boost + noise * 0.4, 0)
    return {
      date: date.toISOString().split('T')[0],
      apy: base + boostVal,
      base,
      boost: boostVal,
    }
  })
}

function generateTVLHistory(currentTVL: number, days = 180) {
  const now = new Date()
  let tvl = currentTVL * 0.1
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (days - i))
    const growth = 1 + (Math.random() * 0.04 - 0.005)
    tvl = Math.min(tvl * growth, currentTVL * 1.05)
    return { date: date.toISOString().split('T')[0], tvl: Math.round(tvl) }
  })
}

export const VAULTS: Vault[] = [
  {
    id: 'usdt-multi-strategy',
    name: 'APTOS Multi-Strategy Stable',
    description:
      'Auto-routing across top Aptos protocols to maximize yield. Smart rebalancing ensures you always earn the best available rate with minimal risk.',
    strategy: 'STABLE_YIELD',
    riskLevel: 'LOW',
    apy: 29.74,
    baseApy: 19.24,
    boostApy: 10.5,
    tvl: 18640000,
    tvlChange: 6.26,
    minDeposit: 10,
    supportedTokens: ['USDT', 'USDC'],
    protocols: [
      { name: 'Tapp Exchange', color: '#f97316', percentage: 69.6 },
      { name: 'Moar', color: '#a855f7', percentage: 25.8 },
      { name: 'Hyperion', color: '#22c55e', percentage: 4.4 },
      { name: 'Aries Markets', color: '#ef4444', percentage: 0.2 },
    ],
    apyHistory: generateAPYHistory(19, 10, 90),
    tvlHistory: generateTVLHistory(18640000, 180),
    transactions: [
      { id: '1', type: 'TRANSFER', amount: 312.75, token: 'USDT', from: '0xdefa2987...d705', to: 'Tapp Exchange', strategy: 'USD1-USDT-USDC LP V2', timestamp: '2025-09-14T14:24:09Z', value: 312.75 },
      { id: '2', type: 'TRANSFER', amount: 187.17, token: 'USDC', from: '0xdefa2987...d705', to: 'Moar', strategy: 'USDC LP Strategy', timestamp: '2025-09-14T13:56:49Z', value: 187.17 },
      { id: '3', type: 'DEPOSIT', amount: 500.02, token: 'USDT', from: '0xdefa2987...d705', timestamp: '2025-09-14T12:44:45Z', value: 500.02 },
      { id: '4', type: 'TRANSFER', amount: 272.09, token: 'USDT', from: '0xdefa2987...d705', to: 'Tapp Exchange', strategy: 'USD1-USDT-USDC LP V2', timestamp: '2025-09-14T11:37:09Z', value: 272.09 },
      { id: '5', type: 'TRANSFER', amount: 162.83, token: 'USDC', from: '0xdefa2987...d705', to: 'Moar', strategy: 'USDC LP Strategy', timestamp: '2025-09-13T23:35:08Z', value: 162.83 },
    ],
    audited: true,
    autoCompound: true,
    noHiddenFees: true,
    tags: ['Stable', 'Multi-Protocol', 'Auto-Compound'],
    featured: true,
    createdAt: '2024-07-01',
    npoints: 6930,
  },
  {
    id: 'ema-mirror-alpha',
    name: 'EMA Mirror Alpha Vault',
    description:
      'Mean-reversion strategy using EMA as reference axis. Upon an EMA cross, seeks entry as price extends further from the mean, capturing snap-back moves.',
    strategy: 'EMA_MIRROR',
    riskLevel: 'MEDIUM',
    apy: 18.4,
    baseApy: 14.2,
    boostApy: 4.2,
    tvl: 3820000,
    tvlChange: 2.14,
    minDeposit: 50,
    supportedTokens: ['USDT', 'APT'],
    protocols: [
      { name: 'Hyperion', color: '#22c55e', percentage: 55.0 },
      { name: 'Tapp Exchange', color: '#f97316', percentage: 30.0 },
      { name: 'Moar', color: '#a855f7', percentage: 15.0 },
    ],
    apyHistory: generateAPYHistory(14, 4, 90),
    tvlHistory: generateTVLHistory(3820000, 180),
    transactions: [],
    audited: true,
    autoCompound: true,
    noHiddenFees: true,
    tags: ['EMA', 'Mean-Reversion', 'Intermediate'],
    createdAt: '2024-09-15',
    npoints: 2840,
  },
  {
    id: 'fibonacci-cascade',
    name: 'Fibonacci Cascade Vault',
    description:
      'Smart DCA basket based on Bullish/Bearish Fibonacci detection. Automatically scales in at key retracement levels for optimal average entry.',
    strategy: 'FIBONACCI',
    riskLevel: 'MEDIUM',
    apy: 24.7,
    baseApy: 18.5,
    boostApy: 6.2,
    tvl: 5270000,
    tvlChange: -1.43,
    minDeposit: 100,
    supportedTokens: ['USDT', 'USDC', 'APT'],
    protocols: [
      { name: 'Aries Markets', color: '#ef4444', percentage: 45.0 },
      { name: 'Tapp Exchange', color: '#f97316', percentage: 35.0 },
      { name: 'Hyperion', color: '#22c55e', percentage: 20.0 },
    ],
    apyHistory: generateAPYHistory(18, 7, 90),
    tvlHistory: generateTVLHistory(5270000, 180),
    transactions: [],
    audited: true,
    autoCompound: true,
    noHiddenFees: true,
    tags: ['Fibonacci', 'DCA', 'Intermediate'],
    createdAt: '2024-10-01',
    npoints: 4120,
  },
  {
    id: 'ema-crossover-yield',
    name: 'EMA Crossover Yield',
    description:
      'Trend-following strategy built around the classic crossover between a fast and slow EMA. Upon confirmed cross on closed bars, positions open with dynamic sizing.',
    strategy: 'EMA_CROSSOVER',
    riskLevel: 'MEDIUM',
    apy: 31.2,
    baseApy: 22.0,
    boostApy: 9.2,
    tvl: 7850000,
    tvlChange: 4.88,
    minDeposit: 50,
    supportedTokens: ['USDT', 'USDC'],
    protocols: [
      { name: 'Moar', color: '#a855f7', percentage: 50.0 },
      { name: 'Tapp Exchange', color: '#f97316', percentage: 32.0 },
      { name: 'Aries Markets', color: '#ef4444', percentage: 18.0 },
    ],
    apyHistory: generateAPYHistory(22, 9, 90),
    tvlHistory: generateTVLHistory(7850000, 180),
    transactions: [],
    audited: true,
    autoCompound: true,
    noHiddenFees: true,
    tags: ['EMA', 'Trend-Following', 'Beginner'],
    featured: true,
    createdAt: '2024-08-20',
    npoints: 5670,
  },
  {
    id: 'open-range-breakout',
    name: 'Open Range Breakout v2',
    description:
      'Intraday strategy designed for the Gold market (XAUUSD), running on M15 timeframe. Captures breakouts from the opening range with tight risk controls.',
    strategy: 'ORB',
    riskLevel: 'HIGH',
    apy: 22.9,
    baseApy: 17.4,
    boostApy: 5.5,
    tvl: 2340000,
    tvlChange: 1.23,
    minDeposit: 200,
    supportedTokens: ['USDT'],
    protocols: [
      { name: 'Hyperion', color: '#22c55e', percentage: 60.0 },
      { name: 'Moar', color: '#a855f7', percentage: 40.0 },
    ],
    apyHistory: generateAPYHistory(17, 6, 90),
    tvlHistory: generateTVLHistory(2340000, 180),
    transactions: [],
    audited: false,
    autoCompound: true,
    noHiddenFees: true,
    tags: ['ORB', 'Intraday', 'Intermediate'],
    createdAt: '2025-01-10',
    npoints: 1890,
  },
  {
    id: 'grid-dca-stable',
    name: 'Grid DCA Stable Vault',
    description:
      'Grid-based DCA Expert Advisor managing two independent chains (Buy/Sell), each spanning 4 zones × 5 levels. Focuses on capital efficiency and drawdown control.',
    strategy: 'GRID_DCA',
    riskLevel: 'LOW',
    apy: 15.6,
    baseApy: 13.1,
    boostApy: 2.5,
    tvl: 9120000,
    tvlChange: 0.74,
    minDeposit: 10,
    supportedTokens: ['USDT', 'USDC'],
    protocols: [
      { name: 'Aries Markets', color: '#ef4444', percentage: 48.0 },
      { name: 'Tapp Exchange', color: '#f97316', percentage: 32.0 },
      { name: 'Hyperion', color: '#22c55e', percentage: 20.0 },
    ],
    apyHistory: generateAPYHistory(13, 3, 90),
    tvlHistory: generateTVLHistory(9120000, 180),
    transactions: [],
    audited: true,
    autoCompound: true,
    noHiddenFees: true,
    tags: ['Grid', 'DCA', 'Stable', 'Beginner'],
    createdAt: '2024-06-15',
    npoints: 7430,
  },
  {
    id: 'markov-chain-alpha',
    name: 'Simple Markov Alpha Vault',
    description:
      'Trading strategy based on short-term statistical probability and Markov Chain principles. Focuses on high-probability state transitions for systematic yield extraction.',
    strategy: 'MARKOV',
    riskLevel: 'ADVANCED',
    apy: 38.4,
    baseApy: 26.0,
    boostApy: 12.4,
    tvl: 1450000,
    tvlChange: 8.92,
    minDeposit: 500,
    supportedTokens: ['USDT', 'APT'],
    protocols: [
      { name: 'Tapp Exchange', color: '#f97316', percentage: 55.0 },
      { name: 'Moar', color: '#a855f7', percentage: 30.0 },
      { name: 'Hyperion', color: '#22c55e', percentage: 15.0 },
    ],
    apyHistory: generateAPYHistory(26, 12, 90),
    tvlHistory: generateTVLHistory(1450000, 180),
    transactions: [],
    audited: true,
    autoCompound: false,
    noHiddenFees: true,
    tags: ['Markov', 'Statistical', 'Advanced'],
    createdAt: '2025-02-28',
    npoints: 1230,
  },
  {
    id: 'mfr-dca-trend',
    name: 'MFR DCA Trend Vault',
    description:
      'Trading strategy based on confirmed market trend, optimizing entry positions through a combination of pullbacks and Fibonacci retracements for maximum risk-adjusted returns.',
    strategy: 'MFR_DCA',
    riskLevel: 'MEDIUM',
    apy: 19.8,
    baseApy: 15.3,
    boostApy: 4.5,
    tvl: 4680000,
    tvlChange: -0.31,
    minDeposit: 100,
    supportedTokens: ['USDT', 'USDC', 'APT'],
    protocols: [
      { name: 'Moar', color: '#a855f7', percentage: 42.0 },
      { name: 'Aries Markets', color: '#ef4444', percentage: 33.0 },
      { name: 'Tapp Exchange', color: '#f97316', percentage: 25.0 },
    ],
    apyHistory: generateAPYHistory(15, 5, 90),
    tvlHistory: generateTVLHistory(4680000, 180),
    transactions: [],
    audited: true,
    autoCompound: true,
    noHiddenFees: true,
    tags: ['DCA', 'Trend', 'Fibonacci', 'Intermediate'],
    createdAt: '2024-11-05',
    npoints: 3560,
  },
]

export const USER_POSITIONS: UserPosition[] = [
  {
    vaultId: 'usdt-multi-strategy',
    deposited: 2000,
    token: 'USDT',
    depositedAt: '2025-06-15T10:00:00Z',
    currentValue: 2218.4,
    earnedYield: 218.4,
    unrealizedPnL: 218.4,
    unrealizedPnLPercent: 10.92,
    share: 0.0117,
  },
  {
    vaultId: 'ema-crossover-yield',
    deposited: 500,
    token: 'USDT',
    depositedAt: '2025-08-01T09:00:00Z',
    currentValue: 531.5,
    earnedYield: 31.5,
    unrealizedPnL: 31.5,
    unrealizedPnLPercent: 6.3,
    share: 0.0064,
  },
]

export function getVaultById(id: string): Vault | undefined {
  return VAULTS.find((v) => v.id === id)
}

export function getUserPosition(vaultId: string): UserPosition | undefined {
  return USER_POSITIONS.find((p) => p.vaultId === vaultId)
}
