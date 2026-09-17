/**
 * Hydrate FarmPreviewCard stubs from certified multichain farm configs.
 * Used so Explore Farms can show off-active-chain inventory without live multicall.
 */
import type { FarmWithStakedValue } from '@pancakeswap/farms'
import type { FarmPreviewCard } from 'views/FarmsStudio/farmsStudioData'
import { listNormalizedFarms, type NormalizedFarmInventoryRow } from './globalYieldInventory'

function rowToPreviewCard(row: NormalizedFarmInventoryRow): FarmPreviewCard {
  const farm = row.config
  const token0 = farm.token
  const token1 = farm.quoteToken
  const raw = {
    ...farm,
    pid: row.pid,
    lpAddress: row.lpAddress,
    lpSymbol: row.lpSymbol,
    multiplier: row.multiplier,
    token: { ...token0, chainId: row.chainId },
    quoteToken: { ...token1, chainId: row.chainId },
    masterChefAddress: row.masterChef,
    isTokenOnly: false,
  } as unknown as FarmWithStakedValue

  return {
    id: row.identity,
    pid: row.pid,
    pair: `${row.token0Symbol} / ${row.token1Symbol}`,
    tokens: [row.token0Symbol, row.token1Symbol],
    status: 'live',
    tvl: '—',
    liquidity: '—',
    dailyRewards: '—',
    multiplier: row.multiplier,
    rewardToken: 'MARCO',
    cta: 'stake',
    displayApr: undefined,
    apr: undefined,
    emissionState: 'active',
    lpLabel: row.lpSymbol,
    rawFarm: raw,
  }
}

/** All LIVE-chain configured LP farms as explore-ready preview cards. */
export function buildGlobalFarmPreviewCards(): FarmPreviewCard[] {
  return listNormalizedFarms().map(rowToPreviewCard)
}

/**
 * Explore-visible preview: configured LP farms stay stakeable even when the
 * active-chain runtime card is still metric-less (indexing / analyze CTA).
 * Mirrors isActiveStakeableExploreFarm without importing the view module.
 */
export function isExploreStakeableFarmPreview(card: FarmPreviewCard): boolean {
  const raw = card.rawFarm
  if (!raw) return false
  if (raw.isTokenOnly || raw.pid === 0) return false
  const lp = String(raw.lpAddress ?? '').toLowerCase()
  if (!/^0x[a-f0-9]{40}$/.test(lp)) return false
  if (card.status === 'finished') return false
  if (String(raw.multiplier ?? '').toUpperCase() === '0X') return false
  if (card.emissionState === 'zero' || card.emissionState === 'no_allocation' || card.emissionState === 'paused') {
    return false
  }
  if (card.cta !== 'stake') return false
  if (card.status !== 'live' && card.status !== 'indexing') return false
  return true
}

/**
 * Merge active-chain runtime cards (preferred for metrics) with global config cards.
 * Runtime wins on matching identity only when it remains explore-stakeable.
 * Metric-less runtime must never hide certified inventory on the selected chain
 * (Ethereum public pricing / emission reads are often incomplete; config stubs
 * already carry pair, logos, and contracts).
 */
export function mergeFarmPreviewCards(
  runtimeCards: FarmPreviewCard[],
  activeChainId: number,
  masterChefAddress: string,
): FarmPreviewCard[] {
  const global = buildGlobalFarmPreviewCards()
  const byId = new Map<string, FarmPreviewCard>()

  for (const card of global) {
    byId.set(card.id, card)
  }

  for (const card of runtimeCards) {
    const pid = card.pid ?? card.rawFarm?.pid
    if (pid == null || pid === 0) continue
    const identity = `${activeChainId}:${(masterChefAddress || 'unknown').toLowerCase()}:${pid}`
    const chainTagged: FarmPreviewCard = {
      ...card,
      id: identity,
      rawFarm: card.rawFarm
        ? ({
            ...card.rawFarm,
            token: card.rawFarm.token
              ? { ...card.rawFarm.token, chainId: activeChainId }
              : card.rawFarm.token,
            quoteToken: card.rawFarm.quoteToken
              ? { ...card.rawFarm.quoteToken, chainId: activeChainId }
              : card.rawFarm.quoteToken,
            masterChefAddress,
          } as FarmWithStakedValue)
        : card.rawFarm,
    }
    const existing = byId.get(identity)
    if (existing && isExploreStakeableFarmPreview(existing) && !isExploreStakeableFarmPreview(chainTagged)) {
      const runtimeUser = chainTagged.rawFarm?.userData
      byId.set(identity, {
        ...existing,
        userStaked: chainTagged.userStaked ?? existing.userStaked,
        pendingReward: chainTagged.pendingReward ?? existing.pendingReward,
        rawFarm:
          existing.rawFarm && runtimeUser
            ? ({ ...existing.rawFarm, userData: runtimeUser } as FarmWithStakedValue)
            : existing.rawFarm,
      })
      continue
    }
    byId.set(identity, chainTagged)
  }

  return [...byId.values()]
}
