import { buildEarnCatalog, EARN_CATALOG_SOURCE, EARN_CATALOG_TIMEOUT_MS, emptyCatalog, type EarnCatalog } from './earnCatalog'

const PATHS = ['/vaults', '/apy', '/tvl'] as const

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; signal: AbortSignal }) => Promise<{
  ok: boolean
  json: () => Promise<unknown>
}>

export async function readEarnCatalog(
  deps: { fetchImpl?: FetchLike; now?: () => number; timeoutMs?: number; chainId?: number } = {},
): Promise<EarnCatalog> {
  if (deps.chainId !== undefined && deps.chainId !== 56) return emptyCatalog('CHAIN_MISMATCH')
  const now = deps.now ?? Date.now
  const timeoutMs = deps.timeoutMs ?? EARN_CATALOG_TIMEOUT_MS
  const fetchImpl = deps.fetchImpl ?? (fetch as unknown as FetchLike)
  const signal = AbortSignal.timeout(timeoutMs)
  try {
    const payloads = await Promise.all(
      PATHS.map(async (pathname) => {
        const response = await fetchImpl(`${EARN_CATALOG_SOURCE}${pathname}`, {
          method: 'GET',
          headers: { accept: 'application/json' },
          signal,
        })
        if (!response.ok) return null
        return response.json()
      }),
    )
    if (payloads[0] === null) return emptyCatalog('UNAVAILABLE')
    return buildEarnCatalog({
      vaults: payloads[0],
      apy: payloads[1],
      tvl: payloads[2],
      fetchedAt: new Date(now()).toISOString(),
      nowMs: now(),
    })
  } catch (cause) {
    const timedOut = signal.aborted || (cause instanceof Error && (cause.name === 'TimeoutError' || cause.name === 'AbortError'))
    return emptyCatalog(timedOut ? 'TIMEOUT' : 'UNAVAILABLE')
  }
}
