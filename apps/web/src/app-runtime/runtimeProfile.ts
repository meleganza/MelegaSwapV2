export type MelegaRuntimeProfile = 'static' | 'market' | 'transactional'

const STATIC_PREFIXES = ['/docs', '/support', '/review', '/451']
const TRANSACTIONAL_PREFIXES = [
  '/swap',
  '/trade',
  '/bridge',
  '/liquidity-studio',
  '/liquidity',
  '/add',
  '/remove',
  '/farms',
  '/pools',
  '/list',
  '/portfolio',
  '/command-center',
  '/workspace',
  '/launch',
  '/new-project',
  '/import-existing-token',
  '/build-studio',
  '/collectibles',
  '/nft',
  '/runtime/deployment',
  '/testnet',
]

function matches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

/**
 * Capability matrix for non-visual background work.
 * Static pages do no chain work, market pages read, transactional pages can write.
 */
export function resolveRuntimeProfile(pathname?: string): MelegaRuntimeProfile {
  const normalized = (pathname || '/').split('?')[0].replace(/\/$/, '') || '/'
  if (STATIC_PREFIXES.some((prefix) => matches(normalized, prefix))) return 'static'
  if (TRANSACTIONAL_PREFIXES.some((prefix) => matches(normalized, prefix))) return 'transactional'
  return 'market'
}
