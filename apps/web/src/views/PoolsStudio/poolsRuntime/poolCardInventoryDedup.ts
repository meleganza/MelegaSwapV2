import type { PoolPreviewCard } from '../poolsStudioData'

function normalizePoolCardAddress(value: unknown, chainId = 56): string {
  if (!value) return ''
  if (typeof value === 'string') return value.trim().toLowerCase()
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>
    if (typeof obj[chainId] === 'string') return (obj[chainId] as string).trim().toLowerCase()
    if (typeof obj[56] === 'string') return (obj[56] as string).trim().toLowerCase()
    if (typeof obj.address === 'string') return obj.address.trim().toLowerCase()
    if (typeof obj.checksumAddress === 'string') return obj.checksumAddress.trim().toLowerCase()
    if (typeof obj.value === 'string') return obj.value.trim().toLowerCase()
    if (obj.address) return normalizePoolCardAddress(obj.address, chainId)
  }
  return ''
}

/** Canonical display-card identity: chainId + normalized contract address. */
export function resolvePoolCardIdentity(card: PoolPreviewCard, chainId = 56): string | null {
  const address = normalizePoolCardAddress(card.contractAddress, chainId)
  if (!address || address.length < 10) return null
  return `${chainId}:${address}`
}

function scorePoolCardForDedupWinner(card: PoolPreviewCard, sourceIndex: number): number {
  let score = 0
  if (card.rawPool && !card.vaultKey) score += 1000
  if (card.vaultKey) score -= 500
  if (card.contractAddress && normalizePoolCardAddress(card.contractAddress).length >= 10) score += 100
  if (card.stakeToken && card.rewardToken && card.stakeContractAddress && card.rewardContractAddress) score += 50
  if (card.sousId === 0 && !card.vaultKey) score += 200
  if (card.rewardBadge === 'Official') score += 25
  return score * 1000 - sourceIndex
}

/** One deterministic winner per canonical pool identity before tab filtering. */
export function deduplicatePoolPreviewCards(cards: PoolPreviewCard[], chainId = 56): PoolPreviewCard[] {
  const winnerByIdentity = new Map<string, PoolPreviewCard>()
  const winnerScoreByIdentity = new Map<string, number>()

  cards.forEach((card, index) => {
    const identity = resolvePoolCardIdentity(card, chainId)
    if (!identity) return
    const score = scorePoolCardForDedupWinner(card, index)
    const prevScore = winnerScoreByIdentity.get(identity)
    if (prevScore === undefined || score > prevScore) {
      winnerByIdentity.set(identity, card)
      winnerScoreByIdentity.set(identity, score)
    }
  })

  const emitted = new Set<string>()
  const result: PoolPreviewCard[] = []
  for (const card of cards) {
    const identity = resolvePoolCardIdentity(card, chainId)
    if (!identity) {
      result.push(card)
      continue
    }
    if (emitted.has(identity)) continue
    result.push(winnerByIdentity.get(identity) ?? card)
    emitted.add(identity)
  }
  return result
}
