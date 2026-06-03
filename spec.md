# MoneyFi Vaults — Full Product Specification

> Version: as of 2026-06-03  
> Purpose: Complete rebuild reference for any platform or framework  
> Live URL: https://moneyfi-vaults.vercel.app  
> Repo: https://github.com/cr0x7/moneyfi-vaults

---

## 1. Product Overview

MoneyFi Vaults is a DeFi yield platform MVP (UI-first, mock data). Users browse multiple vaults across three strategy categories, deposit into them, track performance, and earn yield. Three distinct vault types serve different user risk appetites.

**Product positioning (from PRD):**
> Choose your risk profile → Deposit capital → MoneyFi handles the trading  
> MoneyFi automatically creates and manages trading infrastructure through Exness and Senti while optimizing strategy allocation based on selected risk profile.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + inline styles |
| Charts | Recharts |
| Fonts | Geist Sans / Geist Mono (Google Fonts) |
| Animation | CSS keyframes (no framer-motion) |
| Deployment | Vercel |
| Package manager | npm |

**Key dependencies:** `recharts`, `lucide-react`, `clsx`

---

## 3. Design System

### Colors
```
Background:       #0a0a0a (base), #111111 (card), #161616 (card hover)
Border:           #222222 (default), #333333 (hover)
Green (LP):       #00e676  — primary accent, LP vaults
Orange (Senti):   #f97316  — Trading/Senti vaults
Purple (Delta):   #a78bfa  — Delta Neutral vaults
Tether green:     #26a17b  — Events/Tether campaign
BNB yellow:       #f0b90b  — BNB Chain badge
Text primary:     #ffffff
Text secondary:   #888888
Text muted:       #444444
Red (loss):       #ef4444
Yellow (warning): #f59e0b
Blue (balance):   #3b82f6
```

### CSS Classes (globals.css)
```
.card              → bg #111, border #222, radius 12px
.card-hover        → transition border + bg on hover
.btn-primary       → green bg, black text, radius 8px
.btn-ghost         → transparent, border #333, hover green border
.gradient-text     → green→lime text gradient
.green-glow        → box-shadow rgba(0,230,118,0.18)
.page-wrap         → max-width 1280px, padding 16px mobile / 24px desktop
.hero-grid         → 1-col mobile → 1fr auto desktop (900px)
.hero-title        → 40px mobile → 56px desktop
.vault-grid        → 1col → 2col (560px) → auto-fill 300px (900px)
.detail-grid       → 1col → 1fr 340px sidebar (1024px)
.positions-grid    → 1col → 2col (640px) → 3col (900px)
.filters-bar       → column mobile → row desktop (900px)
.filter-chips      → horizontal scroll, no scrollbar visible
.metrics-grid      → 2col → 4col (640px)
.category-grid     → 1col → 3col (640px)
.deposit-sticky    → static mobile → sticky top:72px desktop
.live-dot          → pulse-green animation
.animate-in        → fade-up entrance animation
```

### Custom Cursor
- **Green dot** (#00e676, 8px, box-shadow glow) — snaps exactly to mouse position
- **Ring** (36px, 1.5px border #00e676) — lerps at 11% per frame (~9 frame lag)
- Hover interactive elements: ring expands to 52px, dot shrinks to 4px
- Click: ring squishes to 70% then spring-bounces back (cubic-bezier overshoot)
- Only active on `pointer: fine` devices (desktop); touch devices get native cursor
- Implemented in `CustomCursor.tsx`, mounted in root layout

---

## 4. Data Models

### Vault
```typescript
interface Vault {
  id: string
  name: string
  description: string
  category: 'LP' | 'TRADING' | 'DELTA_NEUTRAL'
  strategy: StrategyType
  sentiTier?: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE'
  network: 'APTOS' | 'BNB_CHAIN'
  targetApr?: number          // indicative target for Senti vaults
  riskScore?: number          // 0–10
  performanceFee?: number     // % (20 for Senti, 0 for LP)
  managementFee?: number      // always 0
  activeStrategies?: string[] // strategy names in this vault
  riskLevel: 'LOW'|'MEDIUM'|'HIGH'|'ADVANCED'
  apy: number
  baseApy: number
  boostApy: number
  tvl: number
  tvlChange: number           // % weekly
  minDeposit: number
  supportedTokens: TokenSymbol[]
  protocols: ProtocolAllocation[]
  apyHistory: APYDataPoint[]  // 90 days
  tvlHistory: TVLDataPoint[]  // 180 days
  transactions: Transaction[]
  audited: boolean
  autoCompound: boolean
  noHiddenFees: boolean
  tags: string[]
  featured?: boolean
  createdAt: string
  npoints?: number
}
```

### UserPosition
```typescript
interface UserPosition {
  vaultId: string
  deposited: number
  token: TokenSymbol
  depositedAt: string
  currentValue: number
  earnedYield: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
  share: number               // % of vault
}
```

### TradingStats (per vault)
```typescript
interface TradingStats {
  totalBalance, totalEquity, totalPnL, roi, irrAnnualized
  maxDrawdown, currentDrawdown, recoveryTime, riskScore
  sharpeRatio, sortinoRatio, calmarRatio
  closedDeals, winRate, profitFactor
  grossProfit, grossLoss, totalVolumeLots, notionalVolume
  avgWin, avgLoss, expectancy
  longCount, shortCount, robotCount, manualCount, winCount, lossCount
  allTimeReturn, return30d, return90d, returnYtd
  grossProfitBeforeFee, performanceFeePaid, netProfit, highWaterMark
  equityHistory[]   // { date, equity, balance, drawdown }
  pnlHistory[]      // { date, pnl, cumPnl }
  volumeHistory[]   // { date, lots, cumLots }
  activeStrategies[] // { name, version, allocation%, return%, mdd% }
}
```

### DeltaNeutralStats (per vault)
```typescript
interface DeltaNeutralStats {
  currentFundingRate     // % per 8h
  prevFundingRate
  annualizedYield        // % from funding alone
  dailyYield             // $ per $1000
  longSize, shortSize    // $ notional (equal)
  netDelta               // ≈ $0
  collateralUsed
  totalFundingCollected
  positionHealth         // 0-100%
  nextFundingMs          // countdown to next HyperLiquid settlement
  fundingRateHistory[]   // { date, rate, cumYield } — 90 days
  recentPayments[]       // { date, rate, amount, side: 'received'|'paid' }
  activePairs[]          // { symbol, allocation, ... per-pair stats }
}
```

### Event
```typescript
interface Event {
  id: string
  name, description: string
  type: 'BOOST'|'CAMPAIGN'|'COMPETITION'|'GUIDED_VAULT'|'REWARD'
  status: 'UPCOMING'|'ACTIVE'|'ENDED'
  vaultId?: string           // linked vault
  startDate, endDate: string
  boostApy?: number
  totalReward?: number
  rewardToken?: TokenSymbol
  participants?: number
  maxParticipants?: number
  rewards?: EventReward[]
  icon: string               // emoji or symbol
  color: string              // hex
  featured?: boolean
  tags: string[]
}
```

---

## 5. Current Vaults (5 total)

### 💧 Stable LP Vault  (LP category · Aptos)
- ID: `usdt-multi-strategy`
- APY: 29.74% (19.24% base + 10.5% boost)
- TVL: $18.64M · Min deposit: $10 · Tokens: USDT, USDC
- Fees: 0% mgmt, 0% performance
- Risk: LOW (score 2/10)
- Protocols: Tapp Exchange 69.6%, Moar 25.8%, Hyperion 4.4%, Aries Markets 0.2%
- Featured, Audited, Auto-compound

### 🤖 Senti Conservative Vault  (Trading · BNB Chain)
- ID: `senti-conservative`
- Target APR: ~50% · Risk: LOW (3/10)
- APY: 48.6% · TVL: $9.12M · Min: $1,000 · Token: USDT
- Fees: 0% mgmt, **20% performance**
- Strategies: Grid DCA v1.02 (45%), EMA Mirror v1.01 (35%), MFR DCA v2.02 (20%)
- Powered by: Senti × Exness

### 🤖 Senti Balanced Vault  (Trading · BNB Chain)
- ID: `senti-balanced`
- Target APR: ~100% · Risk: MEDIUM (5/10)
- APY: 96.4% · TVL: $5.27M · Min: $1,000 · Token: USDT
- Fees: 0% mgmt, **20% performance**
- Strategies: EMA Crossover v1.09 (40%), Fibonacci Cascade v1.03 (35%), EMA Mirror v1.03 (25%)

### 🤖 Senti Aggressive Vault  (Trading · BNB Chain)
- ID: `senti-aggressive`
- Target APR: ~200% · Risk: ADVANCED (8/10)
- APY: 186.2% · TVL: $1.45M · Min: $1,000 · Token: USDT
- Fees: 0% mgmt, **20% performance**
- Strategies: Markov Chain v1.01 (45%), ORB v2.02 (35%), EMA Mirror v1.03 Aggressive (20%)

### ⚖️ Delta Neutral — HyperLiquid  (Delta Neutral · BNB Chain)
- ID: `delta-neutral`
- APY: 27.6% (19.8% base + 7.8% boost)
- TVL: $6.43M · Min: $200 · Tokens: USDT, USDC
- Fees: 0% mgmt, 10% performance
- Risk: MEDIUM (4/10)
- Strategy: Equal long+short BTC-PERP on HyperLiquid, earn funding rate differential
- Funding: HyperLiquid settles every 8h at 00:00, 08:00, 16:00 UTC

---

## 6. Page Routes

| Route | Type | Description |
|---|---|---|
| `/` | Static client | Vault catalog — hero, positions, category filter, vault grid |
| `/vault/[id]` | Dynamic SSR | Vault detail with analytics + deposit panel |
| `/create` | Static client | 4-step Create Vault wizard |
| `/events` | Static client | Yield campaigns catalog |
| `/events/[id]` | Dynamic SSR | Event detail with tiers, prize pool, T&Cs |
| `/ranking` | Static | NPoints leaderboard |
| `/events` (stub) | Static | Events page |

---

## 7. Page Specifications

### 7.1 Homepage `/`

**Layout:** `page-wrap` container

**Sections (top to bottom):**

1. **Hero**
   - Label: "MONEYFI · APTOS VAULTS"
   - H1: "EARN UP TO {maxAPY}% APY" (gradient text on APY)
   - Subtitle: "Choose your strategy · Set risk appetite · Start earning automatically"
   - Right side: Total TVL card + My Portfolio card (if has positions) + "+ Create Vault" button

2. **My Active Positions** (shown only when USER_POSITIONS.length > 0)
   - `positions-grid` (1→2→3 col responsive)
   - Each card: category icon+label, vault name, APY · MDD, CURRENT VALUE + UNREALIZED PnL (large), DEPOSITED + EARNED YIELD (bottom pinned)
   - Card border and background tinted to category color
   - Click → `/vault/[id]`

3. **ALL VAULTS section**
   - Header row: "ALL/TRADING/LP/DELTA NEUTRAL VAULTS {n} listed" + Sort buttons (Top APY / Largest TVL / Newest)
   - Filter row: [All Types] [💧 LP] [🤖 Senti Trading] [⚖️ Delta Neutral] | [All Risks] [LOW] [MEDIUM] [HIGH] [ADVANCED] | 🔍 Search
   - Category description tagline (1 line, left-bordered) appears when a category is active
   - Vault grid: `vault-grid` class (1→2→auto-fill responsive)

### 7.2 Vault Detail `/vault/[id]`

**Layout:** `detail-grid` (1col → `1fr 340px` sidebar at 1024px)

**Breadcrumb:** Vaults / {category icon+label} / {vault name}

**Left column (top section):**
- Category pill badge (color matches category)
- Risk level badge + Audited badge
- H1: vault name
- Description paragraph

**Key metrics grid** (`metrics-grid` — 2col → 4col):
- TOTAL APY (or TARGET APR for Senti), TVL, MIN DEPOSIT, NPOINTS

**Analytics content — differs by category:**

**LP vaults:**
- APY Performance chart (7D/30D/90D tabs, area chart, green)
- Total Value Locked chart (area chart, blue)
- Protocol Allocation (colored bars + labels)
- Recent Transactions list

**Senti Trading vaults:**
- TradingStats panel (see §8.1)
- APY Performance chart

**Delta Neutral vault:**
- DeltaNeutralStats panel (see §8.2)

**Right column — DepositPanel** (sticky on desktop):
- See §8.3 for full spec

### 7.3 Events `/events`

**Hero:** "YIELD CAMPAIGNS" with active/upcoming/total event count pills

**Filters:** Status (Active/Upcoming/Ended) · Type (Boost/Campaign/Competition/etc.) · Search · Sort (Featured/Start Date/Reward Pool)

**Grid:** EventCard components (see §8.4)

**Empty state:** Mailbox emoji + "No events match your filters"

### 7.4 Event Detail `/events/[id]`

**Sections:**
- Hero: name + status badge (ACTIVE=green, UPCOMING=blue) + LIVE dot
- **Boosted APY card:** base APY + boost APY = total APY (large numbers)
- **Event progress:** participants bar + countdown ("X days remaining")
- **Participation Tiers** (4 tiers when active):
  - Bronze $100 → +2%, Silver $500 → +4%, Gold $2K → +6%, Diamond $10K → +8%
- **Prize Pool** (for campaigns): total reward in USDT
- **How It Works:** 4 numbered steps: Deposit → Choose Tier → Earn Boosted Yield → Collect Rewards
- **Terms & Conditions:** 7 rules bullet list
- **Sidebar:** Linked vault card (name, base APY, boosted APY, TVL, min deposit, "View Vault" button)

### 7.5 Create Vault `/create`

**4-step wizard:**

**Step 1 — Choose Strategy:**
- Grid of 9 strategy cards: Stable Yield, EMA Mirror, Fibonacci DCA, EMA Crossover, Grid DCA, Markov Chain, Open Range Breakout, MFR DCA, Delta Neutral
- Each shows: name, base APY estimate, risk level badge, description

**Step 2 — Configure:**
- Vault name input (placeholder: "My {strategy} Vault")
- Risk level selector: LOW / MEDIUM / HIGH / ADVANCED (4 buttons)
- Auto-Compound toggle (on/off switch)

**Step 3 — Deposit:**
- Amount input + token selector
- Projected earnings at selected APY (1 month / 6 months / 1 year)

**Step 4 — Preview & Deploy:**
- Summary card: name, strategy, est. APY, risk, deposit, auto-compound, 1Y estimate
- 🚀 DEPLOY VAULT button → shows ✓ deployed + redirect to homepage

---

## 8. Component Specifications

### 8.1 TradingStats Panel

**6 tabs:** COMPOSITION · EQUITY · DRAWDOWN · PNL · VOLUME · PROFESSIONAL

**Header (always visible, 3×6 metric grid):**
```
TOTAL BALANCE | TOTAL EQUITY | TOTAL P&L (NET)
ROI           | IRR (ANNUALIZED) | TOTAL TRADES
MAX DRAWDOWN  | CURRENT DRAWDOWN | WIN RATE
PROFIT FACTOR | GROSS PROFIT  | GROSS LOSS
AVG WIN       | AVG LOSS      | EXPECTANCY
LONG/SHORT    | ROBOT/MANUAL  | WIN/LOSS
```

**Returns row (4 cols):** ALL-TIME RETURN · 30D · 90D · YTD

**Risk Meter:** 10-segment bar, green(≤3) / amber(≤5) / red(>5)

**Fee Breakdown:** GROSS PROFIT → −PERF. FEE → NET PROFIT → WITHDRAWABLE BALANCE  
Note: "Fee charged only above High Water Mark"

**COMPOSITION tab:**
- Profit · Win rate · Direction · Source bars (4 animated horizontal bars)
- Active Strategies table: name · version · allocation% · return% · MDD%

**EQUITY tab:** Area chart — Equity (orange) + Balance (blue dashed)

**DRAWDOWN tab:** Area chart — drawdown curve (red)

**PNL tab:** Bar chart — daily PnL, green bars (profit) / red bars (loss)

**VOLUME tab:** Side-by-side — daily lots (bar) + cumulative lots (area)

**PROFESSIONAL tab:**
- Sharpe Ratio card — threshold: >1 is good
- Sortino Ratio card — threshold: >1.5 is good
- Calmar Ratio card — threshold: >0.5 is good
- Drawdown Metrics: max DD, current DD, recovery time
- Account Structure: User Wallet → MoneyFi Vault → Exness Sub Account → Senti Trading Engine → Active Strategies

### 8.2 DeltaNeutralStats Panel

**Sections (stacked):**

1. **Concept explainer card:** How long+short perpetuals cancel price exposure; funding rate paid every 8h on HyperLiquid

2. **Next Funding countdown:** Live countdown timer (HH:MM:SS) to next 00:00/08:00/16:00 UTC settlement; current rate + change vs prev period

3. **Metrics grid (2×2):** Annualized Yield · Daily Yield per $1K · Total Funding Collected · Position Health %

4. **Position Breakdown:**
   - Long (blue) | Net Delta (≈$0, green) | Short (orange) labels
   - Blue/orange 50/50 balance bar
   - Collateral Used progress bar

5. **Funding Rate History** (90 days): Area chart in purple

6. **Cumulative Yield** (90 days): Area chart in green

7. **Recent Funding Payments table:** DATE · RATE/8H · RECEIVED (10 rows)

### 8.3 DepositPanel

**Network badge:** BNB Chain (yellow dot) or Aptos (green dot), + "Powered by Senti × Exness" for Trading vaults

**Tabs:** DEPOSIT · WITHDRAW

**Deposit form (pre-submission):**
- Amount input (large, 22px font) + token selector dropdown (shows token logo + name)
- Min deposit validation message
- 25/50/75/100% quick buttons
- Estimated returns box (1m/6m/1y):
  - LP/Delta: shows gross amount + APY%
  - Senti: shows net after 20% performance fee, labeled "net after fee"
- Fee info box: "0% management · X% performance · HWM note"
- **Risk Acknowledgement** (Senti only): checkbox required before proceeding
- Gas fee: $0.00
- DEPOSIT → button (orange for Senti, green for LP)

**Activation flow (Senti deposit, 6 steps, ~900ms each):**
1. Deposit Confirmed (1-2 min)
2. Bridge / Fund Transfer (3-8 min)
3. Create Account (5-10 min)
4. Link Account (2-5 min)
5. Strategy Deployment (10-15 min)
6. Trading Active (15-30 min total)

Each step shows: dot indicator (filled = done, pulsing = active) + label + est. time + "In progress..." text + ✓ on done

**Withdrawal form:**
- Amount input
- Withdrawal timeline preview (6 steps):
  Requested → Pause Strategy → Close Positions → Settle PnL & Fees → Transfer Back → Completed
- Est. 1-3 business days notice

**User Position** (shown below if user has deposited):
- Deposited · Current Value · Earned Yield · Unrealized PnL (%)

### 8.4 EventCard

- Top accent line (event color)
- FEATURED badge (top-right, green)
- Icon + type label (colored) + status badge (ACTIVE=green / UPCOMING=blue / ENDED=gray)
- Event name (h3) + description (3-line clamp)
- Boosted APY box: "+X%" in event color + "extra yield"
- Prize pool box (if present): reward amount + token
- Participants bar: X/Y spots, percentage filled
- Footer: date range + time status ("X days left" / "Starts in X days" / "Ended")
- Tags (up to 4)
- Reduced opacity if ended

### 8.5 VaultCard

- Top accent line (2px, category color at 50% opacity)
- FEATURED badge (top-right, green) / ACTIVE badge (top-left, green) if user deposited
- Category pill: icon + label (💧 Stable LP / 🤖 Senti Trading / ⚖️ Delta Neutral)
- Risk level badge (color-coded)
- Vault name + strategy label
- APY box:
  - LP/Delta: "APY {value}%" with base/boost breakdown
  - Senti: "TARGET APR ~{value}%" + tier badge (Conservative/Balanced/Aggressive) + "indicative, not guaranteed" + Risk Score bar (10 segments)
- Stats row: TVL + weekly change · Min Deposit · MDD (for Trading)
- Protocol allocation bar (LP only): colored segments + protocol legend
- Strategy allocation bar (Senti/Delta): strategy name + allocation%
- Trust badges: ✓ Audited · BNB Chain (yellow) or Aptos (green) · perf. fee % or "No fees"
- User deposit line (if active)

### 8.6 Navbar

- Logo: MoneyFi horizontal white PNG (`/moneyfi-logo.png`), height 28px
- Nav tabs: VAULT · RANKING · EVENTS (active = green bg/text)
- Right side:
  - "+ CREATE VAULT" button (green, collapses to "+" on mobile <480px)
  - "CONNECT WALLET" button (hidden on mobile <640px) → opens wallet modal
  - Wallet modal: MetaMask · OKX · Petra · WalletConnect (with SVG icons from `/wallets/`)
  - LIVE dot (pulsing green) + "LIVE" text
- Sticky, blur backdrop, `z-index: 50`

---

## 9. Fee Structure (per PRD)

| Vault | Management Fee | Performance Fee | Notes |
|---|---|---|---|
| Stable LP | 0% | 0% | Pure LP, no trading |
| Senti Conservative | 0% | 20% | On net profits only |
| Senti Balanced | 0% | 20% | On net profits only |
| Senti Aggressive | 0% | 20% | On net profits only |
| Delta Neutral | 0% | 10% | Funding rate strategy |

**High Water Mark:** Performance fee only charged on profits above the highest previously recorded account value.

---

## 10. Category System

| Category | ID | Color | Network | Min Deposit |
|---|---|---|---|---|
| Stable LP Vault | `LP` | #00e676 | Aptos | $10 |
| Senti Trading | `TRADING` | #f97316 | BNB Chain | $1,000 |
| Delta Neutral | `DELTA_NEUTRAL` | #a78bfa | BNB Chain | $200 |

**Senti Tiers:**
| Tier | Risk Score | Target APR | Color |
|---|---|---|---|
| CONSERVATIVE | 3/10 | ~50% | #00e676 |
| BALANCED | 5/10 | ~100% | #f59e0b |
| AGGRESSIVE | 8/10 | ~200% | #ef4444 |

---

## 11. Infrastructure

**Senti Account Structure (per PRD §13):**
```
User Wallet
  └── MoneyFi Vault
        └── Exness Sub Account
              └── Senti Trading Engine
                    └── Active Strategies
```

**Deposit timeline (PRD §12):**
1. Deposit Confirmed
2. Bridge / Fund Transfer
3. Create Account (Exness)
4. Link Account (Senti)
5. Strategy Deployment
6. Trading Active

**Withdrawal timeline (PRD §11):**
1. Withdrawal Requested
2. Pause Strategy
3. Close Positions
4. Settle PnL & Fees
5. Transfer Back (1-3 business days)
6. Completed

---

## 12. Events / Campaigns

**Current event:** Tether Campaign Boost
- Status: ACTIVE (June 1–15, 2026)
- Linked vault: Stable LP Vault
- Boost: +6% APY on top of base 29.74%
- Participants: 3,891 / 15,000
- Tiers: Bronze $100 (+2%) · Silver $500 (+4%) · Gold $2K (+6%) · Diamond $10K (+8%)
- Auto-compounding every 8 hours

---

## 13. Mock Data Notes

- All data is **mock/static** — no backend API exists
- Random data uses a **seeded generator** (`createSeededRandom` with string seeds) so values are deterministic and don't re-generate on each render
- `MOCK_NOW = '2026-06-03T03:00:00.000Z'` is the fixed date for all history generation
- APY history: 90 days · TVL history: 180 days · Trading stats: 120 days
- 3 mock user positions: Stable LP ($2,218 current), Senti Balanced ($1,310), Delta Neutral ($1,087)

---

## 14. Assets

```
public/
  moneyfi-logo.png      — horizontal white logo (navbar)
  favicon.webp          — 32px shield icon
  tokens/
    usdt.svg            — Tether (circle, green)
    usdc.svg            — USD Coin (circle, blue)
    apt.svg             — Aptos
  wallets/
    metamask.svg
    okx.svg
    petra.svg           — Aptos Petra wallet
    walletconnect.svg
```

---

## 15. File Structure

```
src/
  app/
    layout.tsx           — root layout, Navbar, CustomCursor, footer
    page.tsx             — vault catalog (homepage)
    globals.css          — design tokens, responsive classes, animations
    favicon.ico          — MoneyFi icon
    icon.png             — favicon auto-detected by Next.js
    vault/[id]/page.tsx  — vault detail
    create/page.tsx      — create vault wizard
    events/page.tsx      — events catalog
    events/[id]/page.tsx — event detail
    ranking/page.tsx     — NPoints leaderboard
  components/
    Navbar.tsx           — sticky nav, wallet modal
    VaultCard.tsx        — vault card for grid
    DepositPanel.tsx     — deposit/withdraw + activation flow
    APYChart.tsx         — 7D/30D/90D area chart (Recharts)
    TVLChart.tsx         — 180-day TVL area chart (Recharts)
    ProtocolAllocation.tsx — colored bar breakdown
    TradingStats.tsx     — full trading analytics panel (6 tabs)
    DeltaNeutralStats.tsx — funding rate dashboard
    LpDeltaStats.tsx     — risk + returns + fee panel for LP/Delta
    EventCard.tsx        — event card for campaigns grid
    CreateVaultWizard.tsx — 4-step wizard
    CustomCursor.tsx     — green dot + lagging ring cursor
  data/
    vaults.ts            — VAULTS array + USER_POSITIONS
    strategyStats.ts     — TRADING_STATS + DELTA_STATS (generated)
    events.ts            — EVENTS array
  lib/
    types.ts             — all TypeScript interfaces
    utils.ts             — formatCurrency, formatAPY, calcEstimatedEarnings, riskBgColor, etc.
    mockRandom.ts        — MOCK_NOW constant + createSeededRandom(seed)
```
