export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'ADVANCED'

export type VaultCategory = 'LP' | 'TRADING' | 'DELTA_NEUTRAL'

export type StrategyType =
  | 'STABLE_YIELD'
  | 'EMA_MIRROR'
  | 'FIBONACCI'
  | 'EMA_CROSSOVER'
  | 'ORB'
  | 'GRID_DCA'
  | 'MARKOV'
  | 'MFR_DCA'
  | 'DELTA_NEUTRAL'
  | 'CUSTOM'

export type TokenSymbol = 'USDT' | 'USDC' | 'APT' | 'BTC' | 'ETH'

export interface ProtocolAllocation {
  name: string
  color: string
  percentage: number
}

export interface APYDataPoint {
  date: string
  apy: number
  base: number
  boost: number
}

export interface TVLDataPoint {
  date: string
  tvl: number
}

export interface Transaction {
  id: string
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'COMPOUND'
  amount: number
  token: TokenSymbol
  from?: string
  to?: string
  strategy?: string
  timestamp: string
  value: number
}

export type SentiTier = 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE'
export type Network   = 'APTOS' | 'BNB_CHAIN'

export interface Vault {
  id: string
  name: string
  description: string
  category: VaultCategory
  strategy: StrategyType
  // Senti-specific
  sentiTier?: SentiTier
  network: Network
  targetApr?: number
  riskScore?: number          // out of 10
  performanceFee?: number     // %
  managementFee?: number      // %
  activeStrategies?: string[] // strategy names running in this vault
  riskLevel: RiskLevel
  apy: number
  baseApy: number
  boostApy: number
  tvl: number
  tvlChange: number
  minDeposit: number
  maxDeposit?: number
  supportedTokens: TokenSymbol[]
  protocols: ProtocolAllocation[]
  apyHistory: APYDataPoint[]
  tvlHistory: TVLDataPoint[]
  transactions: Transaction[]
  audited: boolean
  autoCompound: boolean
  noHiddenFees: boolean
  tags: string[]
  featured?: boolean
  createdAt: string
  npoints?: number
}

export interface UserPosition {
  vaultId: string
  deposited: number
  token: TokenSymbol
  depositedAt: string
  currentValue: number
  earnedYield: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
  share: number
}

export interface CreateVaultConfig {
  name: string
  strategy: StrategyType
  riskLevel: RiskLevel
  initialDeposit: number
  token: TokenSymbol
  autoCompound: boolean
  targetApy?: number
}
