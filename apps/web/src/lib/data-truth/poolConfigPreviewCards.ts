/**
 * Hydrate PoolPreviewCard stubs from certified LIVE pool inventory.
 * Off-active-chain explore cards use Unavailable metrics — never fabricated APR/TVL.
 */
import type { PoolPreviewCard } from 'views/PoolsStudio/poolsStudioData'
import { poolIdentity } from './globalYieldInventory'
import generated from './poolsLiveInventory.generated.json'

export type GeneratedPoolRow = {
  sousId: number
  chainId: number
  contractAddress: string
  stakeSymbol: string
  rewardSymbol: string
  isFinished?: boolean
}

const BY_CHAIN = generated as Record<string, GeneratedPoolRow[]>

export function listGeneratedLivePools(): GeneratedPoolRow[] {
  const out: GeneratedPoolRow[] = []
  for (const rows of Object.values(BY_CHAIN)) {
    for (const row of rows) {
      if (!row?.contractAddress || !/^0x[a-f0-9]{40}$/.test(row.contractAddress)) continue
      if (row.isFinished) continue
      out.push(row)
    }
  }
  return out
}

function rowToPreviewCard(row: GeneratedPoolRow): PoolPreviewCard {
  const identity = poolIdentity(row.chainId, row.contractAddress)
  return {
    id: identity,
    sousId: row.sousId,
    name: `${row.stakeSymbol} → ${row.rewardSymbol}`,
    tokens: [row.stakeSymbol, row.rewardSymbol],
    stakeToken: row.stakeSymbol,
    rewardToken: row.rewardSymbol,
    status: 'live',
    displayStatus: 'LIVE',
    tvl: '—',
    dailyRewards: '—',
    participants: '—',
    cta: 'stake',
    contractAddress: row.contractAddress,
    stakeContractAddress: undefined,
    rewardContractAddress: undefined,
    lifecycle: { active: true, rewarding: true } as PoolPreviewCard['lifecycle'],
    rawPool: {
      sousId: row.sousId,
      contractAddress: { [row.chainId]: row.contractAddress },
      stakingToken: {
        symbol: row.stakeSymbol,
        address: undefined,
        decimals: 18,
        chainId: row.chainId,
      },
      earningToken: {
        symbol: row.rewardSymbol,
        address: undefined,
        decimals: 18,
        chainId: row.chainId,
      },
    } as unknown as PoolPreviewCard['rawPool'],
  }
}

/** All LIVE-chain configured SmartChef pools as explore-ready preview cards. */
export function buildGlobalPoolPreviewCards(): PoolPreviewCard[] {
  return listGeneratedLivePools().map(rowToPreviewCard)
}

function resolveRuntimePoolIdentity(card: PoolPreviewCard, activeChainId: number): string | null {
  const addr = (card.contractAddress || '').toLowerCase()
  if (/^0x[a-f0-9]{40}$/.test(addr)) return poolIdentity(activeChainId, addr)
  if (card.sousId != null) return `${activeChainId}:sous-${card.sousId}`
  return null
}

/**
 * Merge active-chain runtime cards (preferred for metrics) with global config cards.
 * Runtime wins on matching identity; other chains remain as configured stubs.
 */
export function mergePoolPreviewCards(
  runtimeCards: PoolPreviewCard[],
  activeChainId: number,
): PoolPreviewCard[] {
  const global = buildGlobalPoolPreviewCards()
  const byId = new Map<string, PoolPreviewCard>()

  for (const card of global) {
    byId.set(card.id, card)
  }

  for (const card of runtimeCards) {
    const identity = resolveRuntimePoolIdentity(card, activeChainId)
    if (!identity) continue
    byId.set(identity, {
      ...card,
      id: identity,
    })
  }

  return [...byId.values()]
}
