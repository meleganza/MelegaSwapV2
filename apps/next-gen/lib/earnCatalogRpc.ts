import { buildEarnCatalog, EARN_CATALOG_SOURCE, EARN_CATALOG_TIMEOUT_MS, EARN_NETWORKS, emptyCatalog, type EarnCatalog } from './earnCatalog'

const PATHS = ['/vaults', '/apy', '/tvl'] as const
const TOKEN_LISTS = ['pancakeswap-extended', 'coingecko', 'cmc'].map((name) => `https://tokens.pancakeswap.finance/${name}.json`)
let tokenListCache: { expires: number; pending: Promise<unknown[]> } | undefined

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; signal: AbortSignal }) => Promise<{
  ok: boolean
  json: () => Promise<unknown>
}>

export async function readEarnCatalog(
  deps: { fetchImpl?: FetchLike; now?: () => number; timeoutMs?: number; chainId?: number } = {},
): Promise<EarnCatalog> {
  if (deps.chainId !== undefined && !EARN_NETWORKS.some(({ id }) => id === deps.chainId)) return emptyCatalog('CHAIN_MISMATCH')
  const now = deps.now ?? Date.now
  const timeoutMs = deps.timeoutMs ?? EARN_CATALOG_TIMEOUT_MS
  const fetchImpl = deps.fetchImpl ?? (fetch as unknown as FetchLike)
  const signal = AbortSignal.timeout(timeoutMs)
  try {
    const read = async (url: string, requestSignal = signal) => {
        const response = await fetchImpl(url, {
          method: 'GET',
          headers: { accept: 'application/json' },
          signal: requestSignal,
        })
        if (!response.ok) return null
        return response.json()
    }
    const optionalSignal = AbortSignal.timeout(Math.min(timeoutMs, 2500))
    if (!deps.fetchImpl && (!tokenListCache || tokenListCache.expires < now())) {
      tokenListCache = { expires: now() + 5 * 60_000, pending: Promise.all(TOKEN_LISTS.map((url) => read(url, optionalSignal).catch(() => null))) }
    }
    const [vaults, apy, tvl, tokens, tokenLists] = await Promise.all([
      read(EARN_CATALOG_SOURCE + PATHS[0]),
      read(EARN_CATALOG_SOURCE + PATHS[1]),
      read(EARN_CATALOG_SOURCE + PATHS[2]),
      read(EARN_CATALOG_SOURCE + '/tokens', optionalSignal).catch(() => null),
      deps.fetchImpl ? Promise.resolve([]) : tokenListCache?.pending,
    ] as const)
    if (vaults === null) return emptyCatalog('UNAVAILABLE')
    return buildEarnCatalog({
      vaults, apy, tvl, tokens, tokenLists, chainId: deps.chainId,
      fetchedAt: new Date(now()).toISOString(),
      nowMs: now(),
    })
  } catch (cause) {
    const timedOut = signal.aborted || (cause instanceof Error && (cause.name === 'TimeoutError' || cause.name === 'AbortError'))
    return emptyCatalog(timedOut ? 'TIMEOUT' : 'UNAVAILABLE')
  }
}
