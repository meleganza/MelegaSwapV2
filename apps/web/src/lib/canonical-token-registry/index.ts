export type { CanonicalTokenRecord, CanonicalTokenRegistryPayload } from './types'
export {
  getCanonicalTokenRegistry,
  buildCanonicalTokenRegistryPayload,
  lookupCanonicalToken,
  searchCanonicalTokens,
  getCanonicalTradeTokens,
  getHistoricalTokenListCount,
  getDexAssetIndexCount,
} from './buildCanonicalTokenRegistry'

/** Implementation backing — do not invent a second registry. */
export {
  buildDexAssetIndex,
  buildDexAssetIndexPayload,
  getCanonicalIndexedAssets,
  getTradeSurfaceAssets,
  getProjectSurfaceAssets,
  getTrendingSurfaceAssets,
  resolveAssetLogo,
} from 'lib/dex-asset-index'
