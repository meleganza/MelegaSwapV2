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
 * Merge active-chain runtime cards (preferred for metrics) with global config cards.
 * Runtime wins on matching identity; other chains remain as configured stubs.
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
    byId.set(identity, chainTagged)
  }

  return [...byId.values()]
}
