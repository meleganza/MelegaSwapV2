/**
 * FARMS_MODULE_004 — pure Explore Farms builder.
 * ACTIVE stakeable LP farms only. Composes portfolioFarms — no second indexer.
 */

import BigNumber from 'bignumber.js'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import { auditFarmProvenance } from 'lib/data-truth/yieldProvenanceAudit'
import type { FarmPreviewCard } from '../farmsStudioData'
import { isUnavailableFarmMetric } from '../farmsStudioDisplay'
import { formatUsd } from '../farmsRuntime/formatFarmsRuntime'
import { resolveFarmLiquidityUsd } from 'lib/data-truth/yieldMetricHelpers'
import { farmsExplore } from './farmsExploreFarmsTokens'
import type {
  ExploreFarmViewModel,
  FarmsExploreAllowanceState,
  FarmsExploreFarmsViewModel,
  FarmsExploreFilter,
  FarmsExplorePrimaryAction,
  FarmsExploreSort,
  FarmsExploreStatus,
} from './farmsExploreFarmsTypes'

const HIGH_APR_THRESHOLD = 20
const NATIVE_WRAPPER_SYMBOLS = new Set(['WBNB', 'BNB'])
const WBNB_BSC = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'

let _excludedFarmIds: Set<string> | null = null
function excludedFarmIdentities(): Set<string> {
  if (!_excludedFarmIds) {
    _excludedFarmIds = new Set(
      auditFarmProvenance()
        .rows.filter((r) => r.verdict === 'exclude')
        .map((r) => r.identity),
    )
  }
  return _excludedFarmIds
}

type RawFarm = NonNullable<FarmPreviewCard['rawFarm']> & {
  earningToken?: { symbol?: string; name?: string; address?: string; decimals?: number }
  lpToken?: { decimals?: number }
  masterChefAddress?: string
  enableEmergencyWithdraw?: boolean
  isTokenOnly?: boolean
  auctionHostingStartSeconds?: number
}

function normalizeAddr(value?: string | null): string | null {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim().toLowerCase()
  return /^0x[a-f0-9]{40}$/.test(trimmed) ? trimmed : null
}

function isTokenOnly(raw?: RawFarm | null): boolean {
  if (!raw) return true
  if (raw.isTokenOnly) return true
  const pid = raw.pid
  return pid === 0
}

/** Factual ACTIVE / stakeable inclusion — not config-only. */
export function isActiveStakeableExploreFarm(card: FarmPreviewCard): boolean {
  const raw = card.rawFarm as RawFarm | undefined
  if (!raw) return false
  if (isTokenOnly(raw)) return false
  if (!normalizeAddr(raw.lpAddress)) return false
  if (card.status === 'finished') return false
  if (raw.multiplier === '0X') return false
  // Emergency-only / withdraw-only finished surfaces belong to Module 005.
  if (raw.enableEmergencyWithdraw && card.status !== 'live') {
    return false
  }
  if (card.emissionState === 'zero' || card.emissionState === 'no_allocation' || card.emissionState === 'paused') {
    return false
  }
  if (card.cta !== 'stake') return false
  if (card.status !== 'live' && card.status !== 'indexing') return false
  return true
}

function parseAprNumber(card: FarmPreviewCard): { value: number; available: boolean } {
  const label = card.displayApr || card.apr
  if (!label || isUnavailableFarmMetric(label)) return { value: 0, available: false }
  const n = parseFloat(String(label).replace('%', ''))
  if (!Number.isFinite(n) || n <= 0) return { value: 0, available: false }
  return { value: n, available: true }
}

function resolveApr(card: FarmPreviewCard): {
  display: string
  label: ExploreFarmViewModel['aprLabel']
  state: ExploreFarmViewModel['aprState']
  sustainable: string | null
  sort: number
  available: boolean
} {
  const parsed = parseAprNumber(card)
  if (!parsed.available) {
    return {
      display: '—',
      label: 'APR',
      state: 'APR unavailable',
      sustainable: null,
      sort: 0,
      available: false,
    }
  }
  const display = card.displayApr || card.apr || `${parsed.value.toFixed(2)}%`
  const sustainableOk = card.status === 'live' && card.emissionState === 'active'
  return {
    display,
    label: sustainableOk ? 'Sustainable APR' : 'APR',
    state: sustainableOk ? 'Live' : 'Partial',
    sustainable: sustainableOk ? display : null,
    sort: parsed.value,
    available: true,
  }
}

function resolveTvl(card: FarmPreviewCard): {
  display: string
  state: ExploreFarmViewModel['tvlState']
  sort: number
  available: boolean
} {
  const liq = card.rawFarm ? resolveFarmLiquidityUsd(card.rawFarm) : 0
  if (liq > 0) {
    return { display: formatUsd(liq), state: 'Live', sort: liq, available: true }
  }
  const label = card.tvl || card.liquidity
  if (
    !label ||
    label === '—' ||
    label === 'Unavailable' ||
    label === RUNTIME_UNAVAILABLE_LABEL ||
    label === '$0' ||
    label === '$0.00'
  ) {
    return { display: '—', state: 'TVL unavailable', sort: 0, available: false }
  }
  return { display: '—', state: 'Partial valuation', sort: 0, available: false }
}

function resolveMultiplier(card: FarmPreviewCard): string | null {
  const m = card.multiplier
  if (!m || m === '—' || m === '0x' || m === '0X') return null
  if (isUnavailableFarmMetric(m)) return null
  return m.includes('×') || m.toLowerCase().includes('x') ? m : `${m}×`
}

function resolveRewardRate(card: FarmPreviewCard): string | null {
  const daily = card.dailyRewards
  if (!daily || isUnavailableFarmMetric(daily) || daily === '0.00') return null
  return daily
}

function resolveNewest(card: FarmPreviewCard): { value: number; available: boolean } {
  const start = card.rawFarm?.auctionHostingStartSeconds
  if (typeof start === 'number' && Number.isFinite(start) && start > 0) {
    return { value: start, available: true }
  }
  const pid = card.pid ?? card.rawFarm?.pid
  if (typeof pid === 'number' && Number.isFinite(pid) && pid > 0) {
    // MasterChef pid is a factual listing index — not source-array position.
    return { value: pid, available: true }
  }
  return { value: 0, available: false }
}

function resolveWalletLp(
  card: FarmPreviewCard,
  opts: { account?: string | null; userDataLoaded: boolean },
): {
  display: string | null
  state: ExploreFarmViewModel['userWalletLpBalanceState']
  sort: number
  available: boolean
  hasLp: boolean
} {
  if (!opts.account) {
    return { display: null, state: 'disconnected', sort: 0, available: false, hasLp: false }
  }
  if (!opts.userDataLoaded) {
    return { display: null, state: 'unavailable', sort: 0, available: false, hasLp: false }
  }
  const raw = card.rawFarm as RawFarm | undefined
  const bal = raw?.userData?.tokenBalance
  if (bal == null) {
    return { display: null, state: 'unavailable', sort: 0, available: false, hasLp: false }
  }
  const decimals = raw?.lpToken?.decimals ?? 18
  const n = getBalanceNumber(bal, decimals)
  if (!Number.isFinite(n)) {
    return { display: null, state: 'unavailable', sort: 0, available: false, hasLp: false }
  }
  if (n === 0) {
    return { display: '0 LP', state: 'zero', sort: 0, available: true, hasLp: false }
  }
  const text = n >= 1000 ? `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} LP` : `${n.toFixed(2)} LP`
  return { display: text, state: 'available', sort: n, available: true, hasLp: n > 0 }
}

function resolveAllowance(
  card: FarmPreviewCard,
  opts: { account?: string | null; userDataLoaded: boolean },
): { state: FarmsExploreAllowanceState; approved: boolean } {
  if (!opts.account) return { state: 'Disconnected', approved: false }
  if (!opts.userDataLoaded) return { state: 'Unavailable', approved: false }
  const allowance = card.rawFarm?.userData?.allowance
  if (allowance == null) return { state: 'Unavailable', approved: false }
  const approved = allowance.isGreaterThan(0)
  return { state: approved ? 'Approved' : 'Approval required', approved }
}

function isNativePair(raw?: RawFarm | null): boolean {
  if (!raw) return false
  const symbols = [raw.token?.symbol, raw.quoteToken?.symbol].filter(Boolean).map((s) => String(s).toUpperCase())
  if (symbols.some((s) => NATIVE_WRAPPER_SYMBOLS.has(s))) return true
  const addrs = [normalizeAddr(raw.token?.address), normalizeAddr(raw.quoteToken?.address)]
  return addrs.includes(WBNB_BSC)
}

function resolvePrimaryAction(input: {
  depositEnabled: boolean
  status: FarmsExploreStatus
  account?: string | null
  farmChainMatchesWallet: boolean
  allowance: FarmsExploreAllowanceState
}): FarmsExplorePrimaryAction {
  if (!input.depositEnabled || input.status === 'UNAVAILABLE') return 'Farm Unavailable'
  if (!input.account) return 'Connect Wallet'
  if (!input.farmChainMatchesWallet) return 'Switch Network'
  if (input.allowance === 'Approval required') return 'Approve LP'
  return 'Stake LP'
}

function resolveFarmChainId(card: FarmPreviewCard, fallbackChainId: number): number {
  const fromToken = card.rawFarm?.token?.chainId
  if (typeof fromToken === 'number' && Number.isFinite(fromToken)) return fromToken
  const fromId = String(card.id ?? '')
  const m = fromId.match(/^(\d+):/)
  if (m) return Number(m[1])
  return fallbackChainId
}

export function cardToExploreFarmModel(
  card: FarmPreviewCard,
  opts: {
    chainId: number
    walletChainId?: number
    account?: string | null
    userDataLoaded: boolean
    chainSupported: boolean
    masterChefAddress?: string | null
  },
): ExploreFarmViewModel | null {
  if (!isActiveStakeableExploreFarm(card)) return null
  const raw = card.rawFarm as RawFarm
  const farmChainId = resolveFarmChainId(card, opts.chainId)
  const walletChainId = opts.walletChainId ?? opts.chainId
  const farmChainMatchesWallet = walletChainId === farmChainId && opts.chainSupported
  const pid = card.pid ?? raw.pid ?? null
  const apr = resolveApr(card)
  const tvl = resolveTvl(card)
  const wallet = resolveWalletLp(card, { ...opts, chainId: farmChainId })
  const allowance = resolveAllowance(card, { ...opts, chainId: farmChainId })
  const newest = resolveNewest(card)
  const multiplier = resolveMultiplier(card)
  const rewardRate = resolveRewardRate(card)

  const partialReasons: string[] = []
  if (!apr.available) partialReasons.push('APR unavailable')
  if (!tvl.available) partialReasons.push(tvl.state)
  if (
    opts.account &&
    opts.userDataLoaded &&
    farmChainMatchesWallet &&
    wallet.state === 'unavailable'
  ) {
    partialReasons.push('LP balance unavailable')
  }

  let status: FarmsExploreStatus = 'ACTIVE'
  let statusLabel: ExploreFarmViewModel['statusLabel'] = 'Active'
  if (partialReasons.length > 0) {
    status = 'PARTIAL'
    statusLabel = 'Partial'
  }

  const depositEnabled = card.cta === 'stake' && Boolean(raw.lpAddress) && card.status !== 'finished'
  // Explore never surfaces UNAVAILABLE card status for included farms; Stake disabled only when deposit itself fails.
  const stakeEnabled = depositEnabled
  const s0 = raw.token?.symbol ?? card.tokens?.[0] ?? '?'
  const s1 = raw.quoteToken?.symbol ?? card.tokens?.[1] ?? '?'
  const rewardSym = raw.earningToken?.symbol ?? card.rewardToken ?? 'MARCO'
  const title = `${s0} / ${s1} LP`
  const masterChef =
    raw.masterChefAddress ?? opts.masterChefAddress ?? null
  const primaryAction = resolvePrimaryAction({
    depositEnabled: stakeEnabled,
    status,
    account: opts.account,
    farmChainMatchesWallet,
    allowance: allowance.state,
  })

  return {
    farmId: card.id.includes(':') ? card.id : `${farmChainId}:${(masterChef || 'unknown').toLowerCase()}:${pid}`,
    pid: typeof pid === 'number' ? pid : null,
    masterbuilder: masterChef,
    chainId: farmChainId,
    lpToken: {
      symbol: `${s0}/${s1} LP`,
      name: raw.lpSymbol ?? card.lpLabel ?? null,
      address: normalizeAddr(raw.lpAddress),
      chainId: farmChainId,
    },
    token0: {
      symbol: s0,
      name: raw.token?.name ?? null,
      address: normalizeAddr(raw.token?.address),
      chainId: farmChainId,
    },
    token1: {
      symbol: s1,
      name: raw.quoteToken?.name ?? null,
      address: normalizeAddr(raw.quoteToken?.address),
      chainId: farmChainId,
    },
    rewardToken: {
      symbol: rewardSym,
      name: raw.earningToken?.name ?? null,
      address: normalizeAddr(raw.earningToken?.address),
      chainId: farmChainId,
    },
    status,
    statusLabel,
    depositEnabled,
    apr: apr.display,
    aprLabel: apr.label,
    aprState: apr.state,
    sustainableApr: apr.sustainable,
    tvl: tvl.display,
    tvlState: tvl.state,
    multiplier,
    rewardRate,
    totalStaked: null,
    userWalletLpBalance: wallet.display,
    userWalletLpBalanceState: wallet.state,
    allowanceState: allowance.state,
    source: farmChainMatchesWallet
      ? 'portfolioFarms → FarmWithStakedValue'
      : 'globalYieldInventory → configured farm',
    freshness: partialReasons.length ? 'partial' : farmChainMatchesWallet ? 'live' : 'partial',
    partialData: partialReasons.length > 0,
    partialReasons,
    errorState: null,
    provenance: farmChainMatchesWallet
      ? 'canonical Farms runtime previewCards / portfolioFarms'
      : `multichain config inventory · chain ${farmChainId}`,
    title,
    earnLine: `Earn ${rewardSym}`,
    primaryAction,
    stakeEnabled,
    detailsHref: null,
    sourceCard: card,
    sortApr: apr.sort,
    sortAprAvailable: apr.available,
    sortTvl: tvl.sort,
    sortTvlAvailable: tvl.available,
    sortNewest: newest.value,
    sortNewestAvailable: newest.available,
    sortTitle: title.toLowerCase(),
    sortWalletLp: wallet.sort,
    sortWalletLpAvailable: wallet.available,
    isStable: Boolean(raw.isStable),
    isNativePair: isNativePair(raw),
    hasWalletLp: wallet.hasLp,
    isApproved: allowance.approved,
    volume24h: resolveFarmVolume24h(card),
    fees24h: resolveFarmFees24h(card),
    rewardsRemaining: '—',
    rewardDuration: resolveFarmDuration(card, multiplier),
    participants: resolveFarmParticipants(card),
  }
}

/** Participants = unique wallet census only. Never LP supply / emissions / token amounts. */
function resolveFarmParticipants(card: FarmPreviewCard): string {
  if (card.participantsSource === 'participant_index_pending') return 'Indexing…'
  if (card.participantsSource !== 'masterchef_event_index' && card.participantsSource !== 'indexed_wallet_census') {
    return 'Indexing…'
  }
  const value = String(card.participants ?? '').replace(/,/g, '').trim()
  const count = Number(value)
  return Number.isInteger(count) && count >= 0 ? Number(count).toLocaleString('en-US') : 'Indexing…'
}

/**
 * Factual duration for MasterChef farms:
 * - Live with positive multiplier → Ongoing (continuous emission schedule)
 * - Otherwise uncertified → —
 * Never invent calendar ends from unrelated timestamps.
 */
function resolveFarmDuration(card: FarmPreviewCard, multiplier: string | null): string {
  if (card.status === 'live' && multiplier) return 'Ongoing'
  if (card.status === 'finished') return 'Ended'
  return '—'
}

/**
 * Remaining time vs Rewards left are separate fields.
 * MasterChef farms do not expose a certified remaining-budget clock here → —
 */
function resolveFarmRemaining(): string {
  return '—'
}

/**
 * 24H volume / fees for farms come only from certified LP/pair market rows.
 * FarmPreviewCard does not currently carry certified pair volume — never invent from TVL/emissions.
 */
function resolveFarmVolume24h(_card: FarmPreviewCard): string {
  return '—'
}

function resolveFarmFees24h(_card: FarmPreviewCard): string {
  return '—'
}

/** Stable dedupe by canonical identity chainId + masterChef + pid (never symbol-only). */
export function dedupeExploreFarms(farms: ExploreFarmViewModel[]): ExploreFarmViewModel[] {
  const seen = new Set<string>()
  const out: ExploreFarmViewModel[] = []
  for (const farm of farms) {
    const key =
      farm.farmId ||
      `${farm.chainId}:${(farm.masterbuilder || 'unknown').toLowerCase()}:${farm.pid ?? 'x'}:${farm.lpToken.address ?? ''}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(farm)
  }
  return out
}

function compareWithUnavailableLast(
  aAvail: boolean,
  bAvail: boolean,
  primary: number,
  farmIdA: string,
  farmIdB: string,
): number {
  if (aAvail !== bAvail) return aAvail ? -1 : 1
  if (primary !== 0) return primary
  return farmIdA.localeCompare(farmIdB)
}

export function sortExploreFarms(farms: ExploreFarmViewModel[], sort: FarmsExploreSort): ExploreFarmViewModel[] {
  const list = [...farms]
  switch (sort) {
    case 'Highest Sustainable APR':
      return list.sort((a, b) =>
        compareWithUnavailableLast(a.sortAprAvailable, b.sortAprAvailable, b.sortApr - a.sortApr, a.farmId, b.farmId),
      )
    case 'Highest TVL':
      return list.sort((a, b) =>
        compareWithUnavailableLast(a.sortTvlAvailable, b.sortTvlAvailable, b.sortTvl - a.sortTvl, a.farmId, b.farmId),
      )
    case 'Newest':
      return list.sort((a, b) =>
        compareWithUnavailableLast(
          a.sortNewestAvailable,
          b.sortNewestAvailable,
          b.sortNewest - a.sortNewest,
          a.farmId,
          b.farmId,
        ),
      )
    default:
      return list
  }
}

export function filterExploreFarms(
  farms: ExploreFarmViewModel[],
  filter: FarmsExploreFilter,
  opts?: { highTvlCutoff?: number },
): ExploreFarmViewModel[] {
  switch (filter) {
    case 'Stable LP':
      return farms.filter((f) => f.isStable)
    case 'Volatile LP':
      return farms.filter((f) => !f.isStable)
    case 'Native Pair':
      return farms.filter((f) => f.isNativePair)
    case 'High APR':
      return farms.filter((f) => f.sortAprAvailable && f.sortApr >= HIGH_APR_THRESHOLD)
    case 'High TVL': {
      const cutoff = opts?.highTvlCutoff ?? 0
      return farms.filter((f) => f.sortTvlAvailable && f.sortTvl >= cutoff && f.sortTvl > 0)
    }
    case 'Wallet Has LP':
      return farms.filter((f) => f.hasWalletLp)
    case 'Approved':
      return farms.filter((f) => f.isApproved)
    case 'Stakeable Now':
      return farms.filter((f) => f.depositEnabled && (f.status === 'ACTIVE' || f.status === 'PARTIAL'))
    default:
      return farms
  }
}

export function searchExploreFarms(farms: ExploreFarmViewModel[], query: string): ExploreFarmViewModel[] {
  const q = query.trim()
  if (!q) return farms
  const qLower = q.toLowerCase()
  const qAddr = normalizeAddr(q)

  return farms.filter((f) => {
    if (qAddr) {
      return (
        f.lpToken.address === qAddr ||
        f.token0.address === qAddr ||
        f.token1.address === qAddr ||
        f.rewardToken.address === qAddr
      )
    }
    if (/^\d+$/.test(q) && f.pid != null && String(f.pid) === q) return true
    if (f.farmId.toLowerCase() === qLower) return true
    const hay = [
      f.token0.symbol,
      f.token0.name,
      f.token1.symbol,
      f.token1.name,
      f.title,
      f.lpToken.symbol,
      f.lpToken.name,
      f.rewardToken.symbol,
      f.rewardToken.name,
      f.farmId,
      f.pid != null ? String(f.pid) : null,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(qLower)
  })
}

function highTvlCutoff(farms: ExploreFarmViewModel[]): number {
  const values = farms.map((f) => f.sortTvl).filter((v) => v > 0).sort((a, b) => a - b)
  if (!values.length) return Number.POSITIVE_INFINITY
  const mid = Math.floor(values.length / 2)
  return values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid]
}

export function buildFarmsExploreFarmsViewModel(input: {
  portfolioFarms: FarmPreviewCard[]
  farmsLoading: boolean
  chainId: number
  account?: string | null
  userDataLoaded: boolean
  chainSupported?: boolean
  masterChefAddress?: string | null
  filter: FarmsExploreFilter
  sort: FarmsExploreSort
  search: string
  visibleLimit?: number
  sourcesFailed?: boolean
  previous?: ExploreFarmViewModel[] | null
  previousChainId?: number | null
  /** When set, only farms on this chainId are kept ('all' = every LIVE chain). */
  chainFilter?: 'all' | number
}): FarmsExploreFarmsViewModel {
  const pageSize = farmsExplore.initialLimit
  const visibleLimit = Math.max(pageSize, input.visibleLimit ?? pageSize)
  const chainSupported = input.chainSupported !== false

  if (input.farmsLoading && !input.portfolioFarms.length && !input.previous?.length) {
    return {
      state: 'loading',
      registry: [],
      farms: [],
      visibleFarms: [],
      totalActive: 0,
      filter: input.filter,
      sort: input.sort,
      search: input.search,
      pageSize,
      visibleLimit,
      hasMore: false,
      disclosure: null,
      liveRegion: 'Loading active farms',
      source: 'portfolioFarms',
      freshness: null,
    }
  }

  if (input.sourcesFailed && !input.portfolioFarms.length) {
    if (input.previous?.length && input.previousChainId === input.chainId) {
      const stale = input.previous.map((f) => ({ ...f, freshness: 'stale' as const }))
      const limited = stale.slice(0, visibleLimit)
      return {
        state: 'stale',
        registry: stale,
        farms: stale,
        visibleFarms: limited,
        totalActive: stale.length,
        filter: input.filter,
        sort: input.sort,
        search: input.search,
        pageSize,
        visibleLimit,
        hasMore: stale.length > visibleLimit,
        disclosure: 'Showing last known active farms. Fresh data is temporarily unavailable.',
        liveRegion: `${stale.length} active farms (stale)`,
        source: 'portfolioFarms (retained)',
        freshness: 'stale',
      }
    }
    return {
      state: 'unavailable',
      registry: [],
      farms: [],
      visibleFarms: [],
      totalActive: 0,
      filter: input.filter,
      sort: input.sort,
      search: input.search,
      pageSize,
      visibleLimit,
      hasMore: false,
      disclosure: null,
      liveRegion: 'Active farming programs could not be loaded',
      source: 'portfolioFarms',
      freshness: null,
    }
  }

  const excluded = excludedFarmIdentities()
  const built = dedupeExploreFarms(
    input.portfolioFarms
      .map((c) =>
        cardToExploreFarmModel(c, {
          chainId: input.chainId,
          walletChainId: input.chainId,
          account: input.account,
          userDataLoaded: input.userDataLoaded,
          chainSupported,
          masterChefAddress: input.masterChefAddress,
        }),
      )
      .filter((f): f is ExploreFarmViewModel => Boolean(f)),
  )
    .filter((f) => {
      if (excluded.has(f.farmId)) return false
      const mc = (f.masterbuilder || '').toLowerCase()
      if (f.pid != null && mc && excluded.has(`${f.chainId}:${mc}:${f.pid}`)) return false
      return true
    })
    .filter((f) => {
      if (input.chainFilter == null || input.chainFilter === 'all') return true
      return f.chainId === input.chainFilter
    })

  if (!built.length) {
    return {
      state: 'empty',
      registry: [],
      farms: [],
      visibleFarms: [],
      totalActive: 0,
      filter: input.filter,
      sort: input.sort,
      search: input.search,
      pageSize,
      visibleLimit,
      hasMore: false,
      disclosure: null,
      liveRegion: 'No active farms available',
      source: 'portfolioFarms',
      freshness: 'live',
    }
  }

  const walletFilterPending =
    (input.filter === 'Wallet Has LP' || input.filter === 'Approved') &&
    Boolean(input.account) &&
    !input.userDataLoaded

  const cutoff = highTvlCutoff(built)
  let list = walletFilterPending ? built : filterExploreFarms(built, input.filter, { highTvlCutoff: cutoff })
  list = searchExploreFarms(list, input.search)
  list = sortExploreFarms(list, input.sort)

  const anyPartial = list.some((f) => f.status === 'PARTIAL')
  const disclosures: string[] = []
  if (walletFilterPending) disclosures.push('Wallet filters apply after LP balance reads complete.')

  // Keep the complete inventory queryable, but never mount every farm card at
  // once. Rendering a large multichain inventory was blocking route changes on
  // lower-power browsers. Search, filters and Load More still expose all rows.
  const visibleFarms = list.slice(0, Math.max(visibleLimit, 0))

  return {
    state: anyPartial ? 'partial' : 'ready',
    registry: built,
    farms: list,
    visibleFarms,
    totalActive: built.length,
    filter: input.filter,
    sort: input.sort,
    search: input.search,
    pageSize,
    visibleLimit,
    hasMore: list.length > visibleLimit,
    disclosure: disclosures.length ? disclosures.join(' ') : null,
    liveRegion: `${list.length} active farm${list.length === 1 ? '' : 's'} across LIVE chains`,
    source: 'globalYieldInventory + portfolioFarms',
    freshness: anyPartial ? 'partial' : 'live',
  }
}

/** Test helper — zero BigNumber LP balance fixture. */
export function zeroLpBalance(): BigNumber {
  return new BigNumber(0)
}
