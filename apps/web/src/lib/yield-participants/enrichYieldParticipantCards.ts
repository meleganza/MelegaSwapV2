import type { FarmPreviewCard } from 'views/FarmsStudio/farmsStudioData'
import type { PoolPreviewCard } from 'views/PoolsStudio/poolsStudioData'
import type { YieldParticipantSnapshot } from './types'

const ADDRESS = /^0x[a-f0-9]{40}$/i
const INDEXING_LABEL = 'Indexing…'

// Keep these identities local. Importing globalYieldInventory here would pull every
// chain's farm config into a client hook just to concatenate three primitives.
function farmIdentity(chainId: number, masterChef: string, pid: number): string {
  return `${chainId}:${masterChef.toLowerCase()}:${pid}`
}

function poolIdentity(chainId: number, contractAddress: string): string {
  return `${chainId}:${contractAddress.toLowerCase()}`
}

function participantLabel(value: number): string {
  return Math.max(0, Math.trunc(value)).toLocaleString('en-US')
}

function farmKey(card: FarmPreviewCard, fallbackChainId: number, fallbackMasterChef: string): string | null {
  if (card.id.includes(':')) return card.id.toLowerCase()
  const chainId = card.rawFarm?.token?.chainId ?? fallbackChainId
  const rawFarm = card.rawFarm as unknown as { masterChefAddress?: string } | undefined
  const masterChef = String(rawFarm?.masterChefAddress ?? fallbackMasterChef ?? '').toLowerCase()
  const pid = card.pid ?? card.rawFarm?.pid
  if (!ADDRESS.test(masterChef) || typeof pid !== 'number' || !Number.isFinite(pid)) return null
  return farmIdentity(chainId, masterChef, pid)
}

function poolKey(card: PoolPreviewCard, fallbackChainId: number): string | null {
  if (/^\d+:0x[a-f0-9]{40}$/i.test(card.id)) return card.id.toLowerCase()
  const chainId = card.chainId ?? card.rawPool?.stakingToken?.chainId ?? fallbackChainId
  const rawPool = card.rawPool as unknown as { contractAddress?: Record<number, string> } | undefined
  const contract = String(card.contractAddress || rawPool?.contractAddress?.[chainId] || '').toLowerCase()
  return ADDRESS.test(contract) ? poolIdentity(chainId, contract) : null
}

export function enrichFarmParticipantCounts(
  cards: FarmPreviewCard[],
  snapshot: YieldParticipantSnapshot | null,
  fallbackChainId: number,
  fallbackMasterChef: string,
): FarmPreviewCard[] {
  if (!snapshot) return cards
  return cards.map((card) => {
    const key = farmKey(card, fallbackChainId, fallbackMasterChef)
    const count = key ? snapshot.farms[key] : null
    if (count && Number.isFinite(count.participants) && count.participants >= 0) {
      return {
        ...card,
        participants: participantLabel(count.participants),
        participantsSource: 'masterchef_event_index' as const,
      }
    }
    if (card.participantsSource && card.participantsSource !== 'participant_index_pending') return card
    return { ...card, participants: INDEXING_LABEL, participantsSource: 'participant_index_pending' as const }
  })
}

export function enrichPoolParticipantCounts(
  cards: PoolPreviewCard[],
  snapshot: YieldParticipantSnapshot | null,
  fallbackChainId: number,
): PoolPreviewCard[] {
  if (!snapshot) return cards
  return cards.map((card) => {
    const key = poolKey(card, fallbackChainId)
    const count = key ? snapshot.pools[key] : null
    if (count && Number.isFinite(count.participants) && count.participants >= 0) {
      return {
        ...card,
        participants: participantLabel(count.participants),
        participantsSource: 'smartchef_event_index' as const,
      }
    }
    if (card.participantsSource && card.participantsSource !== 'participant_index_pending') return card
    return { ...card, participants: INDEXING_LABEL, participantsSource: 'participant_index_pending' as const }
  })
}
