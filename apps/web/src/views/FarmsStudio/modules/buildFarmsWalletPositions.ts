/** Pure FARMS_MODULE_003 portfolio builder. No React or runtime hooks. */
import BigNumber from 'bignumber.js'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import type { FarmPreviewCard } from '../farmsStudioData'
import { farmsMyFarms } from './farmsMyFarmsTokens'
import type { FarmsMyFarmsModuleState, FarmsMyFarmsViewModel, FarmsPositionAction, FarmsPositionStatus, FarmsWalletPosition } from './farmsMyFarmsTypes'

const priority: Record<FarmsPositionStatus, number> = { EMERGENCY: 1, WITHDRAW_ONLY: 2, ACTIVE: 3, ENDED: 4, PARTIAL: 5, UNAVAILABLE: 6, LOADING: 7 }
type RawFarm = NonNullable<FarmPreviewCard['rawFarm']>

export function formatFarmPositionAmount(amount: BigNumber | undefined, decimals: number | null | undefined, symbol: string, allowZero = false) {
  if (!amount || decimals == null || !Number.isFinite(decimals)) return { formatted: '—', raw: null, ok: false }
  const raw = amount.toFixed(0)
  if (amount.isZero()) return { formatted: allowZero ? `0 ${symbol}` : '—', raw, ok: allowZero }
  const n = getBalanceNumber(amount, decimals)
  if (!Number.isFinite(n)) return { formatted: '—', raw, ok: false }
  return { formatted: `${n.toLocaleString(undefined, { maximumFractionDigits: n >= 1 ? 2 : 4 })} ${symbol}`, raw, ok: true }
}
function usd(n: number | null) {
  if (n == null || !Number.isFinite(n) || n <= 0) return null
  return n >= 1000 ? `($${(n / 1000).toFixed(1)}K)` : `($${n.toFixed(2)})`
}
function farmStatus(card: FarmPreviewCard): FarmsWalletPosition['farmStatus'] {
  if (card.status === 'finished') return 'ENDED'
  if (card.status === 'live' || card.status === 'new') return 'ACTIVE'
  if (card.status === 'indexing') return 'INDEXING'
  return 'UNAVAILABLE'
}
export function farmPositionInclusionEligible(card: FarmPreviewCard): boolean {
  if (card.pid === 0 && Boolean((card.rawFarm as RawFarm | undefined)?.isTokenOnly)) return false
  return Boolean(card.userStaked?.gt(0) || card.pendingReward?.gt(0))
}
function positionState(card: FarmPreviewCard, status: FarmsWalletPosition['farmStatus']) {
  const staked = Boolean(card.userStaked?.gt(0))
  const pending = Boolean(card.pendingReward?.gt(0))
  const raw = card.rawFarm as (RawFarm & { enableEmergencyWithdraw?: boolean }) | undefined
  if (status === 'ENDED' && staked && raw?.enableEmergencyWithdraw) return { status: 'EMERGENCY' as const, label: 'Emergency' as const, line: 'Emergency withdrawal only' }
  if (status === 'ENDED' && staked) return { status: 'WITHDRAW_ONLY' as const, label: 'Finished' as const, line: 'Farm finished — harvest rewards and withdraw remaining LP.' }
  if (status === 'ENDED' && pending) return { status: 'ENDED' as const, label: 'Finished' as const, line: 'Farm finished — harvest rewards and withdraw remaining LP.' }
  if ((status === 'ACTIVE' || status === 'INDEXING') && (staked || pending)) return { status: 'ACTIVE' as const, label: 'Active' as const, line: 'Active farming' }
  return { status: 'UNAVAILABLE' as const, label: 'Unavailable' as const, line: 'Farm data unavailable' }
}
/**
 * Finished positions never show a generic "Manage" action — only Harvest (pending),
 * Withdraw (staked), and the card's own BscScan link. Active positions offer
 * "Stake More" plus Withdraw (unstaking is always available on an active farm).
 */
function actions(card: FarmPreviewCard, state: FarmsPositionStatus, hasStake: boolean, hasPending: boolean, account: string): FarmsPositionAction[] {
  const raw = Boolean(card.rawFarm)
  if (!account) return [{ kind: 'connect', label: 'Connect Wallet', enabled: true, accessibleName: 'Connect wallet to manage farms' }]
  if (!raw) return []
  const out: FarmsPositionAction[] = []
  if (state === 'EMERGENCY' && hasStake) out.push({ kind: 'unstake', label: 'Emergency Withdraw', modalAction: 'unstake', enabled: true, accessibleName: `Emergency withdraw ${card.pair}` })
  if (hasPending) out.push({ kind: 'claim', label: 'Harvest', modalAction: 'claim', enabled: true, accessibleName: `Harvest rewards from ${card.pair}` })
  if (state !== 'EMERGENCY' && (state === 'WITHDRAW_ONLY' || state === 'ENDED') && hasStake) out.push({ kind: 'unstake', label: 'Withdraw', modalAction: 'unstake', enabled: true, accessibleName: `Withdraw ${card.pair}` })
  if ((state === 'ACTIVE' || state === 'PARTIAL') && hasStake) {
    out.push({ kind: 'stake', label: 'Stake More', modalAction: 'stake', enabled: true, accessibleName: `Stake more into ${card.pair}` })
    out.push({ kind: 'unstake', label: 'Withdraw', modalAction: 'unstake', enabled: true, accessibleName: `Withdraw ${card.pair}` })
  }
  return out.slice(0, 3)
}
export function cardToFarmsWalletPosition(card: FarmPreviewCard, opts: { wallet: string; chainId: number }): FarmsWalletPosition | null {
  if (!farmPositionInclusionEligible(card)) return null
  const raw = card.rawFarm as RawFarm | undefined
  const token0 = raw?.token; const token1 = raw?.quoteToken; const reward = raw?.earningToken
  const s0 = token0?.symbol ?? card.tokens[0] ?? 'TOKEN'; const s1 = token1?.symbol ?? card.tokens[1] ?? 'TOKEN'; const rs = reward?.symbol ?? card.rewardToken ?? 'REWARD'
  const stakeDecimals = raw?.lpToken?.decimals ?? 18
  const rewardDecimals = reward?.decimals ?? null
  const hasStake = Boolean(card.userStaked?.gt(0)); const hasPending = Boolean(card.pendingReward?.gt(0))
  const stake = formatFarmPositionAmount(card.userStaked, stakeDecimals, `${s0}/${s1} LP`, !hasStake)
  const pending = formatFarmPositionAmount(card.pendingReward, rewardDecimals, rs, true)
  const stakeNumber = card.userStaked ? getBalanceNumber(card.userStaked, stakeDecimals) : null
  const pendingNumber = card.pendingReward && rewardDecimals != null ? getBalanceNumber(card.pendingReward, rewardDecimals) : null
  const rawAny = raw as (RawFarm & { tokenPriceBusd?: number; earningTokenPrice?: number; lpTokenPrice?: number; masterChefAddress?: string }) | undefined
  const stakeUsd = stakeNumber != null && rawAny?.lpTokenPrice && rawAny.lpTokenPrice > 0 ? stakeNumber * rawAny.lpTokenPrice : null
  const pendingUsd = pendingNumber != null && rawAny?.earningTokenPrice ? pendingNumber * rawAny.earningTokenPrice : null
  const fs = farmStatus(card); let resolved = positionState(card, fs)
  const partialReasons: string[] = []
  if (card.pendingReward == null) partialReasons.push('Reward data unavailable')
  if (hasStake && stakeUsd == null) partialReasons.push('Valuation unavailable')
  const pid = card.pid ?? raw?.pid ?? null
  const depositedPrimary =
    stakeUsd != null && Number.isFinite(stakeUsd)
      ? `$${stakeUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      : stake.formatted
  const depositedSecondary =
    stakeUsd != null && Number.isFinite(stakeUsd) ? `LP tokens: ${stake.formatted}` : null
  return {
    positionId: `farm:${opts.chainId}:${opts.wallet.toLowerCase()}:${pid ?? card.id}`, farmId: card.id, pid, masterChef: rawAny?.masterChefAddress ?? null, chainId: opts.chainId,
    lpToken: { symbol: `${s0}/${s1} LP`, address: raw?.lpAddress ?? null, decimals: stakeDecimals, chainId: opts.chainId },
    token0: { symbol: s0, address: token0?.address ?? null, decimals: token0?.decimals ?? null, chainId: opts.chainId },
    token1: { symbol: s1, address: token1?.address ?? null, decimals: token1?.decimals ?? null, chainId: opts.chainId },
    rewardToken: { symbol: rs, address: reward?.address ?? null, decimals: rewardDecimals, chainId: opts.chainId },
    stakedRaw: stake.raw, stakedFormatted: depositedPrimary, stakedLpFormatted: stake.formatted, stakedValue: depositedSecondary ?? usd(stakeUsd), pendingRaw: pending.raw, pendingFormatted: pending.formatted, pendingValue: usd(pendingUsd),
    farmStatus: fs, positionStatus: resolved.status, statusLabel: resolved.label, apr: card.displayApr ?? card.apr ?? null, tvl: card.tvl ?? null, multiplier: card.multiplier ?? null,
    actions: actions(card, resolved.status, hasStake, hasPending, opts.wallet), source: fs === 'ENDED' ? 'historical' : 'masterchef',
    freshness: partialReasons.length ? 'partial' : 'live', partialData: partialReasons.length > 0, partialReasons,
    provenance: 'portfolioFarms → FarmWithStakedValue.userData.stakedBalance / earnings', sourceCard: card,
    sortPendingUsd: pendingUsd ?? (hasPending ? 1 : 0), sortStakedUsd: stakeUsd ?? (hasStake ? 1 : 0),
    title: `${s0} / ${s1} LP`, subtitle: hasPending ? `Earn ${rs}` : `Rewards in ${rs}`, farmStateLine: resolved.line,
    depositedUsdAvailable: stakeUsd != null && Number.isFinite(stakeUsd),
  }
}
export function compareFarmsWalletPositions(a: FarmsWalletPosition, b: FarmsWalletPosition) {
  const p = priority[a.positionStatus] - priority[b.positionStatus]; if (p) return p
  if (a.positionStatus === 'ACTIVE' && b.positionStatus === 'ACTIVE') { const q = (b.sortPendingUsd > 0 ? 1 : 0) - (a.sortPendingUsd > 0 ? 1 : 0); if (q) return q }
  return b.sortPendingUsd - a.sortPendingUsd || b.sortStakedUsd - a.sortStakedUsd || a.positionId.localeCompare(b.positionId)
}
export function farmsUserDataPresence(cards: FarmPreviewCard[]) {
  if (!cards.length) return 'empty_universe' as const
  return cards.some((c) => c.userStaked != null || c.pendingReward != null || c.rawFarm?.userData != null) ? 'present' as const : 'absent' as const
}
function base(state: FarmsMyFarmsModuleState, account: string | null, chainId: number | null, generation: number): FarmsMyFarmsViewModel {
  return { state, wallet: account, chainId, positions: [], visiblePositions: [], totalCount: null, showCountBadge: false, showViewAll: false, moduleDisclosure: null, liveRegion: 'Farm positions are temporarily unavailable', freshness: state === 'loading' ? 'loading' : 'unavailable', authoritativeEmpty: false, generation }
}
export function buildFarmsWalletPositionsViewModel(input: { account?: string | null; chainId?: number | null; portfolioFarms: FarmPreviewCard[]; userDataLoaded: boolean; farmsLoading: boolean; generation?: number; previous?: FarmsWalletPosition[] | null; previousWallet?: string | null; previousChainId?: number | null; sourcesFailed?: boolean }): FarmsMyFarmsViewModel {
  const account = input.account ?? null, chainId = input.chainId ?? null, generation = input.generation ?? 0
  if (!account) return { ...base('disconnected', null, chainId, generation), liveRegion: 'Connect your wallet to view farms' }
  if (!chainId) return base('unavailable', account, null, generation)
  const changed = (input.previousWallet && input.previousWallet.toLowerCase() !== account.toLowerCase()) || (input.previousChainId != null && input.previousChainId !== chainId)
  const previous = !changed && input.previous?.length ? input.previous : null
  if (input.sourcesFailed && !previous) return base('unavailable', account, chainId, generation)
  if (input.sourcesFailed || input.farmsLoading || !input.userDataLoaded || farmsUserDataPresence(input.portfolioFarms) === 'absent') {
    if (!previous) return { ...base('loading', account, chainId, generation), liveRegion: 'Loading farm positions' }
    return { ...base('stale', account, chainId, generation), positions: previous, visiblePositions: previous.slice(0, farmsMyFarms.maxVisibleDesktop), totalCount: previous.length, showCountBadge: true, showViewAll: previous.length > farmsMyFarms.maxVisibleDesktop, moduleDisclosure: 'Some position data is temporarily unavailable.', liveRegion: 'Showing last confirmed farm positions.', freshness: 'stale' }
  }
  const positions = input.portfolioFarms.map((card) => cardToFarmsWalletPosition(card, { wallet: account, chainId })).filter((p): p is FarmsWalletPosition => Boolean(p)).sort(compareFarmsWalletPositions)
  if (!positions.length) return { ...base('empty', account, chainId, generation), totalCount: 0, liveRegion: 'No farm positions yet', freshness: 'live', authoritativeEmpty: true }
  const partial = positions.some((p) => p.partialData)
  return { ...base(partial ? 'partial' : 'ready', account, chainId, generation), positions, visiblePositions: positions.slice(0, farmsMyFarms.maxVisibleDesktop), totalCount: positions.length, showCountBadge: true, showViewAll: positions.length > farmsMyFarms.maxVisibleDesktop, moduleDisclosure: partial ? 'Some position data is temporarily unavailable.' : null, liveRegion: `${positions.length} farm position${positions.length === 1 ? '' : 's'}`, freshness: partial ? 'partial' : 'live' }
}
