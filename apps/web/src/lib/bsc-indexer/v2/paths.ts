/** R771 — versioned durable namespaces (legacy R768 bsc-indexer/* is not deleted). */
export const INDEXER_V2_ROOT = 'melega-indexer/v2'
export const FEATURED_PAIR_SLUG = 'marco-wbnb'
export const LEGACY_BLOB_PREFIX = 'bsc-indexer'
export const LEGACY_INDEXER_NOTE = 'LEGACY_UNIVERSAL_INDEXER_NOT_ACTIVE_SOURCE'

export function featuredPairPrefix(slug = FEATURED_PAIR_SLUG): string {
  return `${INDEXER_V2_ROOT}/featured-pairs/${slug}`
}

export function blobPathForSlug(slug = FEATURED_PAIR_SLUG): string {
  return featuredPairPrefix(slug)
}

export function registryBlobKey(): string {
  return `${INDEXER_V2_ROOT}/registry/bsc-mainnet.json`
}

export function registryMetaKey(): string {
  return `${INDEXER_V2_ROOT}/registry/meta.json`
}
