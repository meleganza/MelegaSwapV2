import { STATIC_COLLECTIBLE_RECORDS } from './collectibles.data'
import { StaticCollectibleRecord } from './collectible-types'

export const getAllCollectibles = (): StaticCollectibleRecord[] =>
  STATIC_COLLECTIBLE_RECORDS.map((record) => ({
    ...record,
    warnings: [...record.warnings],
    relatedRoutes: [...record.relatedRoutes],
    links: { ...record.links },
    contract: { ...record.contract },
    metadata: { ...record.metadata },
    supply: { ...record.supply },
    mint: { ...record.mint },
  }))
