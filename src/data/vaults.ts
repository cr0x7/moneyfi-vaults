import { Vault, UserPosition } from '@/lib/types'

function generateAPYHistory(baseApy: number, boost: number, days = 90) {
  const now = new Date()
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (days - i))
    const noise = (Math.random() - 0.5) * 4
    const base = Math.max(baseApy + noise * 0.6, 1)
    const boostVal = Math.max(boost + noise * 0.4, 0)
    return { date: date.toISOString().split('T')[0], apy: base + boostVal, base, boost: boostVal }
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

  // ─── STABLE LP VAULT (Aptos) ──────────────────────────────────────────────
  {
    id: 'usdt-multi-strategy',
    name: 'Stable LP Vault',
    description:
      'Auto-routing across top Aptos DEX protocols to maximize yield. Smart rebalancing ensures your liquidity always earns the best available rate across Tapp Exchange, Moar, Hyperion, and Aries Markets.',
    category: 'LP',
    strategy: 'STABLE_YIELD',
    network: 'APTOS',
    riskLevel: 'LOW',
    riskScore: 2,
    apy: 29.74,
    baseApy: 19.24,
    boostApy: 10.5,
    tvl: 18640000,
    tvlChange: 6.26,
    minDeposit: 10,
    managementFee: 0,
    performanceFee: 0,
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
    audited: true, autoCompound: true, noHiddenFees: true,
    tags: ['Stable', 'Multi-Protocol', 'Auto-Compound', 'Aptos'],
    featured: true, createdAt: '2024-07-01', npoints: 6930,
  },

  // ─── SENTI TRADING VAULTS (BNB Chain, powered by Exness + Senti) ──────────
  {
    id: 'senti-conservative',
    name: 'Senti Conservative Vault',
    description:
      'Low-risk systematic trading targeting ~50% APR. Runs Grid DCA and EMA Mirror strategies on BNB Chain via Exness, managed by the Senti trading engine with strict drawdown controls.',
    category: 'TRADING',
    strategy: 'GRID_DCA',
    sentiTier: 'CONSERVATIVE',
    network: 'BNB_CHAIN',
    riskLevel: 'LOW',
    riskScore: 3,
    targetApr: 50,
    apy: 48.6,
    baseApy: 38.6,
    boostApy: 10.0,
    tvl: 9120000,
    tvlChange: 1.84,
    minDeposit: 1000,
    managementFee: 0,
    performanceFee: 20,
    activeStrategies: ['Grid DCA v1.02', 'EMA Mirror v1.01', 'MFR DCA v2.02'],
    supportedTokens: ['USDT'],
    protocols: [],
    apyHistory: generateAPYHistory(38, 10, 90),
    tvlHistory: generateTVLHistory(9120000, 180),
    transactions: [],
    audited: true, autoCompound: false, noHiddenFees: true,
    tags: ['Senti', 'Conservative', 'BNB Chain', 'Exness', '~50% Target'],
    featured: true, createdAt: '2025-01-15', npoints: 7430,
  },
  {
    id: 'senti-balanced',
    name: 'Senti Balanced Vault',
    description:
      'Medium-risk multi-strategy trading targeting ~100% APR. Blends trend-following and mean-reversion strategies on BNB Chain via Exness, powered by the Senti trading engine.',
    category: 'TRADING',
    strategy: 'EMA_CROSSOVER',
    sentiTier: 'BALANCED',
    network: 'BNB_CHAIN',
    riskLevel: 'MEDIUM',
    riskScore: 5,
    targetApr: 100,
    apy: 96.4,
    baseApy: 74.4,
    boostApy: 22.0,
    tvl: 5270000,
    tvlChange: 3.52,
    minDeposit: 1000,
    managementFee: 0,
    performanceFee: 20,
    activeStrategies: ['EMA Crossover v1.09', 'Fibonacci Cascade v1.03', 'EMA Mirror v1.03'],
    supportedTokens: ['USDT'],
    protocols: [],
    apyHistory: generateAPYHistory(74, 22, 90),
    tvlHistory: generateTVLHistory(5270000, 180),
    transactions: [],
    audited: true, autoCompound: false, noHiddenFees: true,
    tags: ['Senti', 'Balanced', 'BNB Chain', 'Exness', '~100% Target'],
    featured: true, createdAt: '2025-01-15', npoints: 4120,
  },
  {
    id: 'senti-aggressive',
    name: 'Senti Aggressive Vault',
    description:
      'High-risk high-reward trading targeting ~200% APR. Runs Markov Chain probability and Open Range Breakout strategies on BNB Chain via Exness, optimized for maximum return.',
    category: 'TRADING',
    strategy: 'MARKOV',
    sentiTier: 'AGGRESSIVE',
    network: 'BNB_CHAIN',
    riskLevel: 'ADVANCED',
    riskScore: 8,
    targetApr: 200,
    apy: 186.2,
    baseApy: 146.2,
    boostApy: 40.0,
    tvl: 1450000,
    tvlChange: 8.92,
    minDeposit: 1000,
    managementFee: 0,
    performanceFee: 20,
    activeStrategies: ['Markov Chain v1.01', 'ORB v2.02', 'EMA Mirror v1.03 (Aggressive)'],
    supportedTokens: ['USDT'],
    protocols: [],
    apyHistory: generateAPYHistory(146, 40, 90),
    tvlHistory: generateTVLHistory(1450000, 180),
    transactions: [],
    audited: true, autoCompound: false, noHiddenFees: true,
    tags: ['Senti', 'Aggressive', 'BNB Chain', 'Exness', '~200% Target'],
    featured: false, createdAt: '2025-01-15', npoints: 1230,
  },

  // ─── DELTA NEUTRAL (HyperLiquid) ──────────────────────────────────────────
  {
    id: 'delta-neutral',
    name: 'Delta Neutral — HyperLiquid',
    description:
      'Simultaneously opens equal long and short perpetual positions on HyperLiquid to eliminate directional price risk entirely. Profit comes purely from the funding rate differential — when longs pay shorts, you collect. Market goes up or down: irrelevant.',
    category: 'DELTA_NEUTRAL',
    strategy: 'DELTA_NEUTRAL',
    network: 'BNB_CHAIN',
    riskLevel: 'MEDIUM',
    riskScore: 4,
    apy: 27.6,
    baseApy: 19.8,
    boostApy: 7.8,
    tvl: 6430000,
    tvlChange: 3.52,
    minDeposit: 200,
    managementFee: 0,
    performanceFee: 10,
    supportedTokens: ['USDT', 'USDC'],
    protocols: [
      { name: 'HyperLiquid', color: '#6366f1', percentage: 70.0 },
      { name: 'Hyperion', color: '#22c55e', percentage: 20.0 },
      { name: 'Moar', color: '#a855f7', percentage: 10.0 },
    ],
    apyHistory: generateAPYHistory(19, 8, 90),
    tvlHistory: generateTVLHistory(6430000, 180),
    transactions: [],
    audited: true, autoCompound: true, noHiddenFees: true,
    tags: ['Delta Neutral', 'Market Neutral', 'Funding Rate', 'HyperLiquid'],
    featured: true, createdAt: '2025-03-15', npoints: 4890,
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
    vaultId: 'senti-balanced',
    deposited: 1000,
    token: 'USDT',
    depositedAt: '2025-08-01T09:00:00Z',
    currentValue: 1310.5,
    earnedYield: 310.5,
    unrealizedPnL: 310.5,
    unrealizedPnLPercent: 31.05,
    share: 0.0248,
  },
  {
    vaultId: 'delta-neutral',
    deposited: 1000,
    token: 'USDT',
    depositedAt: '2025-10-12T08:30:00Z',
    currentValue: 1087.2,
    earnedYield: 87.2,
    unrealizedPnL: 87.2,
    unrealizedPnLPercent: 8.72,
    share: 0.0169,
  },
]

export function getVaultById(id: string): Vault | undefined {
  return VAULTS.find((v) => v.id === id)
}

export function getUserPosition(vaultId: string): UserPosition | undefined {
  return USER_POSITIONS.find((p) => p.vaultId === vaultId)
}
