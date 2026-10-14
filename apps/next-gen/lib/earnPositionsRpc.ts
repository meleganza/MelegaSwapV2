import { assertReadonlyRpc, BSC_CHAIN_ID, DEFAULT_BSC_READONLY_RPC, formatUnits } from './bscQuote'
import { EARN_CATALOG_TIMEOUT_MS } from './earnCatalog'
import { readEarnCatalog } from './earnCatalogRpc'
import { emptyPositions, listedReceipts, unsupportedRows, type EarnPositionRow, type EarnPositions } from './earnPositions'
import { decodeQuantity, encodeBalanceOf, isPublicAddress } from './portfolioRead'

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body?: string; signal: AbortSignal }) => Promise<{
  ok: boolean
  json: () => Promise<{ result?: string } | unknown>
}>

export async function readEarnPositions(
  input: { chainId?: number; address?: string },
  deps: { fetchImpl?: FetchLike; now?: () => number; timeoutMs?: number; rpcUrl?: string } = {},
): Promise<EarnPositions> {
  if (input.chainId !== undefined && input.chainId !== BSC_CHAIN_ID) return emptyPositions('CHAIN_MISMATCH')
  const address = input.address?.trim() ?? ''
  if (!isPublicAddress(address)) return emptyPositions('ADDRESS_REJECTED')

  const catalog = await readEarnCatalog({
    fetchImpl: deps.fetchImpl as never,
    now: deps.now,
    timeoutMs: deps.timeoutMs,
    chainId: BSC_CHAIN_ID,
  })
  if (!catalog.ok) return emptyPositions(catalog.code === 'TIMEOUT' ? 'TIMEOUT' : 'UNAVAILABLE')

  let rpc: string
  try {
    rpc = assertReadonlyRpc(deps.rpcUrl ?? process.env.BETA_BSC_READONLY_RPC ?? DEFAULT_BSC_READONLY_RPC)
  } catch {
    return emptyPositions('UNAVAILABLE')
  }
  const fetchImpl = deps.fetchImpl ?? (fetch as unknown as FetchLike)
  const timeoutMs = deps.timeoutMs ?? EARN_CATALOG_TIMEOUT_MS
  let rpcCalls = 0
  let timedOut = false
  const call = async (method: 'eth_chainId' | 'eth_call', params: unknown[]): Promise<string | null> => {
    rpcCalls += 1
    const signal = AbortSignal.timeout(timeoutMs)
    try {
      const response = await fetchImpl(rpc, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: rpcCalls, method, params }),
        signal,
      })
      if (!response.ok) return null
      const payload = (await response.json()) as { result?: string }
      return typeof payload.result === 'string' ? payload.result : null
    } catch (cause) {
      if (signal.aborted || (cause instanceof Error && (cause.name === 'TimeoutError' || cause.name === 'AbortError'))) timedOut = true
      return null
    }
  }

  const chainHex = await call('eth_chainId', [])
  if (chainHex === null) return emptyPositions(timedOut ? 'TIMEOUT' : 'UNAVAILABLE', rpcCalls)
  if (BigInt(chainHex) !== BigInt(BSC_CHAIN_ID)) return emptyPositions('CHAIN_MISMATCH', rpcCalls)

  const rows: EarnPositionRow[] = []
  for (const vault of listedReceipts(catalog)) {
    const raw = decodeQuantity(await call('eth_call', [{ to: vault.receiptAddress, data: encodeBalanceOf(address) }, 'latest']))
    if (raw === null) {
      rows.push({ id: vault.id, assets: vault.assets, href: vault.href, status: 'unavailable', raw: null, display: null })
      continue
    }
    rows.push({
      id: vault.id,
      assets: vault.assets,
      href: vault.href,
      status: 'balance',
      raw,
      display: vault.receiptDecimals === null ? null : formatUnits(raw, vault.receiptDecimals),
    })
  }
  rows.push(...unsupportedRows(catalog))
  if (timedOut && rows.every((row) => row.status !== 'balance')) return emptyPositions('TIMEOUT', rpcCalls)
  return {
    ok: true,
    chainId: 56,
    address,
    executable: false,
    deposit: false,
    withdraw: false,
    rpcCalls,
    rows,
  }
}
