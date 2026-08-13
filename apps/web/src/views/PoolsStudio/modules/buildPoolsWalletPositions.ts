/**
 * POOLS_MODULE_003 — pure wallet-scoped position builder.
 * Composes portfolioPools (SmartChef / historical staking). No Farms / LP / Factory ownership.
 */

import BigNumber from 'bignumber.js'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import type { PoolPreviewCard } from '../poolsStudioData'
import type {
  PoolsMyPositionsModuleState,
  PoolsMyPositionsViewModel,
  PoolsPositionAction,
  PoolsPositionStatus,
  PoolsWalletPosition,
} from './poolsMyPositionsTypes'
import { poolsMyPositions } from './poolsMyPositionsTokens'

const STATUS_PRIORITY: Record<PoolsPositionStatus, number> = {
  EMERGENCY: 1,
  WITHDRAW_ONLY: 2,
  ACTIVE: 3,
  ENDED: 4,
  PARTIAL: 5,
  UNAVAILABLE: 6,
  LOADING: 7,
}

export function formatPositionTokenAmount(
  amount: BigNumber | undefined | null,
  decimals: number | null | undefined,
  symbol: string,
  options?: { allowZero?: boolean; unavailable?: boolean },
): { formatted: string; raw: string | null; ok: boolean } {
  if (options?.unavailable) {
    return { formatted: '—', raw: null, ok: false }
  }
  if (amount == null || decimals == null || !Number.isFinite(decimals)) {
    return { formatted: '—', raw: null, ok: false }
  }
  const raw = amount.toFixed(0)
  if (amount.isZero()) {
    if (options?.allowZero) {
      return { formatted: `0 ${symbol}`, raw, ok: true }
    }
    return { formatted: '—', raw, ok: false }
  }
  const n = getBalanceNumber(amount, decimals)
  if (!Number.isFinite(n)) {
    return { formatted: '—', raw, ok: false }
  }
  const text = n.toLocaleString(undefined, {
    maximumFractionDigits: n >= 1000 ? 2 : n >= 1 ? 2 : 4,
    minimumFractionDigits: 0,
  })
  return { formatted: `${text} ${symbol}`, raw, ok: true }
}

export function formatPositionUsd(value: number | null | undefined): string | null {
  if (value == null || !Number.isFinite(value) || value <= 0) return null
  if (value >= 1_000_000) return `($${(value / 1_000_000).toFixed(2)}M)`
  if (value >= 1_000) return `($${(value / 1_000).toFixed(1)}K)`
  return `($${value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })})`
}

export function positionInclusionEligible(card: PoolPreviewCard): boolean {
  const staked = card.userStaked
  const pending = card.pendingReward
  const stakedPos = Boolean(staked?.gt(0))
  const claimPos = Boolean(pending?.gt(0))
  return stakedPos || claimPos
}

function resolvePoolStatus(card: PoolPreviewCard): PoolsWalletPosition['poolStatus'] {
  if (card.displayStatus === 'ENDED' || card.status === 'ended') return 'ENDED'
  if (card.displayStatus === 'INDEXING' || card.status === 'indexing') return 'INDEXING'
  if (card.displayStatus === 'LIVE' || card.status === 'live') return 'ACTIVE'
  return 'UNAVAILABLE'
}

function resolvePositionStatus(card: PoolPreviewCard, poolStatus: PoolsWalletPosition['poolStatus']): {
  status: PoolsPositionStatus
  label: PoolsWalletPosition['statusLabel']
} {
  const stakedPos = Boolean(card.userStaked?.gt(0))
  const emergency = Boolean(card.rawPool?.enableEmergencyWithdraw) && stakedPos && poolStatus === 'ENDED'

  if (emergency) {
    return { status: 'EMERGENCY', label: 'Emergency' }
  }
  if (poolStatus === 'ENDED' && stakedPos) {
    return { status: 'WITHDRAW_ONLY', label: 'Withdraw' }
  }
  if (poolStatus === 'ENDED' && !stakedPos && Boolean(card.pendingReward?.gt(0))) {
    return { status: 'ENDED', label: 'Finished' }
  }
  if (poolStatus === 'ACTIVE' || poolStatus === 'INDEXING') {
    if (stakedPos || Boolean(card.pendingReward?.gt(0))) {
      return { status: 'ACTIVE', label: 'Active' }
    }
  }
  return { status: 'UNAVAILABLE', label: 'Unavailable' }
}

function resolveUnlockLine(card: PoolPreviewCard, positionStatus: PoolsPositionStatus): {
  unlockLine: string | null
  lockType: PoolsWalletPosition['lockType']
} {
  if (positionStatus === 'EMERGENCY') {
    return { unlockLine: 'Emergency withdrawal only', lockType: 'emergency' }
  }
  if (positionStatus === 'WITHDRAW_ONLY') {
    return { unlockLine: 'Ended — withdrawal available', lockType: 'ended' }
  }
  if (positionStatus === 'ENDED') {
    return { unlockLine: 'Ended — withdrawal available', lockType: 'ended' }
  }
  const visual = card.visualType?.toLowerCase() ?? ''
  const lock = card.lockPeriod?.toLowerCase() ?? ''
  if (visual.includes('flexible') || lock.includes('flexible') || card.poolTypeLabel?.toLowerCase().includes('flexible')) {
    return { unlockLine: 'Flexible', lockType: 'flexible' }
  }
  if (card.lockPeriod && card.lockPeriod !== '—' && !card.lockPeriod.toLowerCase().includes('unavailable')) {
    return { unlockLine: card.lockPeriod, lockType: 'locked' }
  }
  if (card.poolTypeLabel?.toLowerCase().includes('locked')) {
    return { unlockLine: card.poolTypeLabel, lockType: 'locked' }
  }
  return { unlockLine: 'Flexible', lockType: 'flexible' }
}

function buildTitle(stakeSymbol: string, rewardSymbol: string): string {
  if (!stakeSymbol && !rewardSymbol) return 'Pool'
  if (!rewardSymbol || stakeSymbol === rewardSymbol) return stakeSymbol || rewardSymbol
  return `${stakeSymbol} → ${rewardSymbol}`
}

function buildActions(
  card: PoolPreviewCard,
  positionStatus: PoolsPositionStatus,
  stakeSymbol: string,
  rewardSymbol: string,
  hasClaimable: boolean,
  hasPrincipal: boolean,
  account: string | null | undefined,
): PoolsPositionAction[] {
  if (!account) {
    return [
      {
        kind: 'connect',
        label: 'Connect Wallet',
        enabled: true,
        accessibleName: 'Connect wallet to manage pool positions',
      },
    ]
  }

  const actions: PoolsPositionAction[] = []
  const hasRaw = Boolean(card.rawPool)

  if (positionStatus === 'EMERGENCY' && hasPrincipal && hasRaw) {
    actions.push({
      kind: 'emergency_withdraw',
      label: 'Emergency Withdraw',
      modalAction: 'unstake',
      enabled: true,
      accessibleName: `Emergency withdraw ${stakeSymbol} from ${stakeSymbol} pool`,
    })
    if (hasClaimable) {
      actions.push({
        kind: 'claim',
        label: 'Claim',
        modalAction: 'claim',
        enabled: true,
        accessibleName: `Claim ${rewardSymbol} rewards from ${stakeSymbol} pool`,
      })
    }
    return actions.slice(0, 2)
  }

  if (positionStatus === 'WITHDRAW_ONLY' || (positionStatus === 'ENDED' && hasPrincipal)) {
    if (hasPrincipal && hasRaw) {
      actions.push({
        kind: 'withdraw',
        label: 'Withdraw',
        modalAction: 'unstake',
        enabled: true,
        accessibleName: `Withdraw ${stakeSymbol} from ended pool`,
      })
    }
    if (hasClaimable && hasRaw) {
      actions.push({
        kind: 'claim',
        label: 'Claim',
        modalAction: 'claim',
        enabled: true,
        accessibleName: `Claim ${rewardSymbol} rewards from ${stakeSymbol} pool`,
      })
    }
    if (actions.length < 2 && hasRaw) {
      actions.push({
        kind: 'withdraw',
        label: 'Withdraw',
        modalAction: 'unstake',
        enabled: true,
        accessibleName: `Withdraw ${stakeSymbol} from finished pool`,
      })
    }
    return actions.slice(0, 2)
  }

  if (positionStatus === 'ENDED' && hasClaimable && !hasPrincipal && hasRaw) {
    actions.push({
      kind: 'claim',
      label: 'Claim',
      modalAction: 'claim',
      enabled: true,
      accessibleName: `Claim ${rewardSymbol} rewards from ${stakeSymbol} pool`,
    })
    return actions
  }

  if (positionStatus === 'ACTIVE' || positionStatus === 'PARTIAL') {
    if (hasClaimable && hasRaw) {
      actions.push({
        kind: 'claim',
        label: 'Claim',
        modalAction: 'claim',
        enabled: true,
        accessibleName: `Claim ${rewardSymbol} rewards from ${stakeSymbol} pool`,
      })
      actions.push({
        kind: 'manage',
        label: 'Stake More',
        modalAction: 'stake',
        enabled: true,
        accessibleName: `Stake more ${stakeSymbol} into pool`,
      })
      return actions.slice(0, 2)
    }
    if (hasPrincipal && hasRaw) {
      actions.push({
        kind: 'manage',
        label: 'Stake More',
        modalAction: 'stake',
        enabled: true,
        accessibleName: `Stake more ${stakeSymbol} into pool`,
      })
      return actions
    }
  }

  return actions
}

export function cardToPoolsWalletPosition(
  card: PoolPreviewCard,
  opts: { wallet: string; chainId: number },
): PoolsWalletPosition | null {
  if (!positionInclusionEligible(card)) return null

  const raw = card.rawPool
  const stakeSymbol = card.stakeToken || raw?.stakingToken?.symbol || card.tokens?.[0] || 'TOKEN'
  const rewardSymbol = card.rewardToken || raw?.earningToken?.symbol || 'REWARD'
  const stakeDecimals = raw?.stakingToken?.decimals ?? null
  const rewardDecimals = raw?.earningToken?.decimals ?? null
  const stakeAddress = card.stakeContractAddress || raw?.stakingToken?.address || null
  const rewardAddress = card.rewardContractAddress || raw?.earningToken?.address || null

  const hasPrincipal = Boolean(card.userStaked?.gt(0))
  const hasClaimable = Boolean(card.pendingReward?.gt(0))
  const claimReadOk = card.pendingReward != null
  const stakeReadOk = card.userStaked != null

  const staked = formatPositionTokenAmount(card.userStaked, stakeDecimals, stakeSymbol, {
    allowZero: false,
    unavailable: !stakeReadOk && !hasPrincipal,
  })
  const claimable = formatPositionTokenAmount(card.pendingReward, rewardDecimals, rewardSymbol, {
    allowZero: claimReadOk,
    unavailable: !claimReadOk,
  })

  const stakePrice = raw?.stakingTokenPrice
  const rewardPrice = raw?.earningTokenPrice
  const stakedNum =
    card.userStaked && stakeDecimals != null ? getBalanceNumber(card.userStaked, stakeDecimals) : null
  const claimNum =
    card.pendingReward && rewardDecimals != null ? getBalanceNumber(card.pendingReward, rewardDecimals) : null

  const stakedUsd =
    stakedNum != null && stakePrice && stakePrice > 0 ? stakedNum * stakePrice : null
  const claimableUsd =
    claimNum != null && rewardPrice && rewardPrice > 0 ? claimNum * rewardPrice : null

  const poolStatus = resolvePoolStatus(card)
  const { status, label } = resolvePositionStatus(card, poolStatus)

  const partialReasons: string[] = []
  if (!claimReadOk) partialReasons.push('Reward unavailable')
  if (stakedNum != null && stakedNum > 0 && !(stakePrice && stakePrice > 0)) {
    partialReasons.push('Valuation unavailable')
  }
  if (card.lockPeriod == null && status === 'ACTIVE' && card.visualType == null) {
    // unlock optional — do not force partial
  }

  // Missing valuation/reward enrichment must never downgrade a confirmed
  // wallet position or hide its available on-chain actions.

  const { unlockLine, lockType } = resolveUnlockLine(card, status)
  const sousKey = card.sousId != null ? String(card.sousId) : card.id
  const positionId = `pool:${opts.chainId}:${(opts.wallet || '').toLowerCase()}:${sousKey}`

  const actions = buildActions(card, status, stakeSymbol, rewardSymbol, hasClaimable, hasPrincipal, opts.wallet)

  const source: PoolsWalletPosition['source'] = raw?.vaultKey
    ? 'vault'
    : card.status === 'ended' || card.displayStatus === 'ENDED'
      ? 'historical'
      : 'smartchef'

  return {
    positionId,
    poolId: sousKey,
    poolContract: card.contractAddress || null,
    chainId: opts.chainId,
    stakeToken: {
      symbol: stakeSymbol,
      address: stakeAddress,
      decimals: stakeDecimals,
      chainId: opts.chainId,
    },
    rewardToken: {
      symbol: rewardSymbol,
      address: rewardAddress,
      decimals: rewardDecimals,
      chainId: opts.chainId,
    },
    stakedRaw: staked.raw,
    stakedFormatted: hasPrincipal ? staked.formatted : claimReadOk && !hasPrincipal ? `0 ${stakeSymbol}` : staked.formatted,
    stakedValue: formatPositionUsd(stakedUsd),
    claimableRaw: claimable.raw,
    claimableFormatted: claimable.formatted,
    claimableValue: formatPositionUsd(claimableUsd),
    unlockLine,
    lockType,
    poolStatus,
    positionStatus: status,
    statusLabel: label,
    actions,
    source,
    freshness: partialReasons.length ? 'partial' : 'live',
    partialData: partialReasons.length > 0,
    partialReasons,
    errorState: null,
    provenance: 'portfolioPools → userData.stakedBalance / pendingReward (SmartChef)',
    sourceCard: card,
    sortClaimableUsd: claimableUsd ?? (hasClaimable ? 1 : 0),
    sortStakedUsd: stakedUsd ?? (hasPrincipal ? 1 : 0),
    title: buildTitle(stakeSymbol, rewardSymbol),
    subtitle: card.poolTypeLabel || 'Pool position',
  }
}

export function comparePoolsWalletPositions(a: PoolsWalletPosition, b: PoolsWalletPosition): number {
  const pa = STATUS_PRIORITY[a.positionStatus]
  const pb = STATUS_PRIORITY[b.positionStatus]
  if (pa !== pb) return pa - pb

  // Within ACTIVE: claimable first
  if (a.positionStatus === 'ACTIVE' && b.positionStatus === 'ACTIVE') {
    const aHas = a.sortClaimableUsd > 0 ? 0 : 1
    const bHas = b.sortClaimableUsd > 0 ? 0 : 1
    if (aHas !== bHas) return aHas - bHas
  }

  // Bucket claimable/staked to avoid micro-reorder on poll
  const claimBucket = (n: number) => Math.round(n * 100) / 100
  const c = claimBucket(b.sortClaimableUsd) - claimBucket(a.sortClaimableUsd)
  if (c !== 0) return c
  const s = claimBucket(b.sortStakedUsd) - claimBucket(a.sortStakedUsd)
  if (s !== 0) return s
  return a.positionId.localeCompare(b.positionId)
}

export function userDataPresence(cards: PoolPreviewCard[]): 'present' | 'absent' | 'empty_universe' {
  if (!cards.length) return 'empty_universe'
  const withData = cards.some(
    (c) => c.userStaked != null || c.pendingReward != null || c.rawPool?.userData != null,
  )
  return withData ? 'present' : 'absent'
}

export function buildPoolsWalletPositionsViewModel(input: {
  account?: string | null
  chainId?: number | null
  portfolioPools: PoolPreviewCard[]
  userDataLoaded: boolean
  poolsLoading: boolean
  generation?: number
  previous?: PoolsWalletPosition[] | null
  previousWallet?: string | null
  previousChainId?: number | null
  sourcesFailed?: boolean
}): PoolsMyPositionsViewModel {
  const account = input.account ?? null
  const chainId = input.chainId ?? null
  const generation = input.generation ?? 0

  if (!account) {
    return {
      state: 'disconnected',
      wallet: null,
      chainId,
      positions: [],
      visiblePositions: [],
      totalCount: null,
      showCountBadge: false,
      showViewAll: false,
      moduleDisclosure: null,
      liveRegion: 'Connect your wallet to view pool positions',
      freshness: 'unavailable',
      authoritativeEmpty: false,
      generation,
    }
  }

  if (!chainId) {
    return {
      state: 'unavailable',
      wallet: account,
      chainId: null,
      positions: [],
      visiblePositions: [],
      totalCount: null,
      showCountBadge: false,
      showViewAll: false,
      moduleDisclosure: null,
      liveRegion: 'Pool positions are temporarily unavailable',
      freshness: 'unavailable',
      authoritativeEmpty: false,
      generation,
    }
  }

  const walletChanged =
    input.previousWallet != null && input.previousWallet.toLowerCase() !== account.toLowerCase()
  const chainChanged = input.previousChainId != null && input.previousChainId !== chainId

  if (walletChanged || chainChanged) {
    // Caller clears previous; treat as loading until fresh data.
  }

  const previous =
    !walletChanged && !chainChanged && input.previous?.length ? input.previous : null

  if (input.sourcesFailed && !previous) {
    return {
      state: 'unavailable',
      wallet: account,
      chainId,
      positions: [],
      visiblePositions: [],
      totalCount: null,
      showCountBadge: false,
      showViewAll: false,
      moduleDisclosure: null,
      liveRegion: 'Pool positions are temporarily unavailable. Your funds are not represented as zero.',
      freshness: 'unavailable',
      authoritativeEmpty: false,
      generation,
    }
  }

  if (input.sourcesFailed && previous) {
    return {
      state: 'stale',
      wallet: account,
      chainId,
      positions: previous,
      visiblePositions: previous.slice(0, poolsMyPositions.maxVisibleDesktop),
      totalCount: previous.length,
      showCountBadge: true,
      showViewAll: previous.length > poolsMyPositions.maxVisibleDesktop,
      moduleDisclosure: 'Some position data is temporarily unavailable.',
      liveRegion: 'Showing last confirmed positions. Refresh temporarily failed.',
      freshness: 'stale',
      authoritativeEmpty: false,
      generation,
    }
  }

  if ((input.poolsLoading || !input.userDataLoaded) && !previous) {
    return {
      state: 'loading',
      wallet: account,
      chainId,
      positions: [],
      visiblePositions: [],
      totalCount: null,
      showCountBadge: false,
      showViewAll: false,
      moduleDisclosure: null,
      liveRegion: 'Loading pool positions',
      freshness: 'loading',
      authoritativeEmpty: false,
      generation,
    }
  }

  if ((input.poolsLoading || !input.userDataLoaded) && previous) {
    return {
      state: 'stale',
      wallet: account,
      chainId,
      positions: previous,
      visiblePositions: previous.slice(0, poolsMyPositions.maxVisibleDesktop),
      totalCount: previous.length,
      showCountBadge: true,
      showViewAll: previous.length > poolsMyPositions.maxVisibleDesktop,
      moduleDisclosure: 'Some position data is temporarily unavailable.',
      liveRegion: 'Refreshing pool positions',
      freshness: 'stale',
      authoritativeEmpty: false,
      generation,
    }
  }

  // userDataLoaded — detect public-data wipe (userData absent on all cards)
  const presence = userDataPresence(input.portfolioPools)
  if (presence === 'absent' && previous) {
    return {
      state: 'stale',
      wallet: account,
      chainId,
      positions: previous,
      visiblePositions: previous.slice(0, poolsMyPositions.maxVisibleDesktop),
      totalCount: previous.length,
      showCountBadge: true,
      showViewAll: previous.length > poolsMyPositions.maxVisibleDesktop,
      moduleDisclosure: 'Some position data is temporarily unavailable.',
      liveRegion: 'Showing last confirmed positions during refresh',
      freshness: 'stale',
      authoritativeEmpty: false,
      generation,
    }
  }

  if (presence === 'absent' && !previous) {
    return {
      state: 'loading',
      wallet: account,
      chainId,
      positions: [],
      visiblePositions: [],
      totalCount: null,
      showCountBadge: false,
      showViewAll: false,
      moduleDisclosure: null,
      liveRegion: 'Loading pool positions',
      freshness: 'loading',
      authoritativeEmpty: false,
      generation,
    }
  }

  const built = input.portfolioPools
    .map((card) => cardToPoolsWalletPosition(card, { wallet: account, chainId }))
    .filter((p): p is PoolsWalletPosition => Boolean(p))
    .sort(comparePoolsWalletPositions)

  if (built.length === 0) {
    // Presence can be "present" with all-zero userData during a partial refresh wipe.
    // Never treat that as authoritative empty when we still hold last-good positions.
    if (previous?.length) {
      return {
        state: 'stale',
        wallet: account,
        chainId,
        positions: previous,
        visiblePositions: previous.slice(0, poolsMyPositions.maxVisibleDesktop),
        totalCount: previous.length,
        showCountBadge: true,
        showViewAll: previous.length > poolsMyPositions.maxVisibleDesktop,
        moduleDisclosure: 'Some position data is temporarily unavailable.',
        liveRegion: 'Showing last confirmed positions during refresh',
        freshness: 'stale',
        authoritativeEmpty: false,
        generation,
      }
    }
    return {
      state: 'empty',
      wallet: account,
      chainId,
      positions: [],
      visiblePositions: [],
      totalCount: 0,
      showCountBadge: false,
      showViewAll: false,
      moduleDisclosure: null,
      liveRegion: 'No pool positions yet',
      freshness: 'live',
      authoritativeEmpty: true,
      generation,
    }
  }

  // Preserve claimable token amounts when a refresh drops reward reads or prices to zero.
  const merged = built.map((pos) => {
    const prior = previous?.find((p) => p.positionId === pos.positionId)
    if (!prior) return pos
    let next = pos
    const claimLost =
      (pos.claimableFormatted === '—' || pos.claimableFormatted.startsWith('0 ')) &&
      prior.claimableFormatted &&
      !prior.claimableFormatted.startsWith('0 ') &&
      prior.claimableFormatted !== '—'
    if (claimLost) {
      next = {
        ...next,
        claimableFormatted: prior.claimableFormatted,
        claimableRaw: prior.claimableRaw,
        claimableValue: pos.claimableValue ?? prior.claimableValue,
        freshness: 'partial',
        partialData: true,
        partialReasons: [...new Set([...(next.partialReasons ?? []), 'Claimable refresh incomplete — retaining last confirmed amount'])],
      }
    }
    if (!next.claimableValue && next.claimableFormatted && !next.claimableFormatted.startsWith('0 ') && next.claimableFormatted !== '—') {
      next = {
        ...next,
        claimableValue: null,
        partialData: true,
        partialReasons: [...new Set([...(next.partialReasons ?? []), 'USD value unavailable'])],
      }
    }
    return next
  })

  const anyPartial = merged.some((p) => p.partialData)
  const state: PoolsMyPositionsModuleState = anyPartial ? 'partial' : 'ready'

  return {
    state,
    wallet: account,
    chainId,
    positions: merged,
    visiblePositions: merged.slice(0, poolsMyPositions.maxVisibleDesktop),
    totalCount: merged.length,
    showCountBadge: true,
    showViewAll: merged.length > poolsMyPositions.maxVisibleDesktop,
    moduleDisclosure: anyPartial ? 'Some position data is temporarily unavailable.' : null,
    liveRegion: `${merged.length} pool position${merged.length === 1 ? '' : 's'}`,
    freshness: anyPartial ? 'partial' : 'live',
    authoritativeEmpty: false,
    generation,
  }
}
