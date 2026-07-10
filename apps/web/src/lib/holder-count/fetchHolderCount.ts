import type { HolderCountResult } from './types'

/** Etherscan API V2 unified endpoint — BscScan V1 returns NOTOK as of 2025. */
const ETHERSCAN_V2_URL = 'https://api.etherscan.io/v2/api'
const BSC_CHAIN_ID = 56

function unavailable(reason: string, diagnostic: string): HolderCountResult {
  return {
    status: 'unavailable',
    reason,
    source: 'unavailable',
    diagnostic,
    checkedAt: new Date().toISOString(),
  }
}

export async function fetchHolderCount(
  chainId: number,
  tokenAddress: string,
  apiKeyOverride?: string,
): Promise<HolderCountResult> {
  const normalized = tokenAddress.trim().toLowerCase()
  if (!/^0x[a-f0-9]{40}$/.test(normalized)) {
    return unavailable('Invalid token address', `Holder count requires a valid contract address, got "${tokenAddress}"`)
  }

  if (chainId !== BSC_CHAIN_ID) {
    return unavailable(
      'Source not configured',
      `Holder count provider is not configured for chain ${chainId}`,
    )
  }

  const apiKey = apiKeyOverride ?? process.env.BSCSCAN_API_KEY ?? process.env.NEXT_PUBLIC_BSCSCAN_API_KEY ?? process.env.NEXT_PUBLIC_BSCSAN_API_KEY
  if (!apiKey) {
    return unavailable(
      'Source not configured',
      'Set BSCSCAN_API_KEY in Vercel Production (server-side) and redeploy',
    )
  }

  try {
    const params = new URLSearchParams({
      chainid: String(BSC_CHAIN_ID),
      module: 'token',
      action: 'tokenholdercount',
      contractaddress: normalized,
      apikey: apiKey,
    })
    const res = await fetch(`${ETHERSCAN_V2_URL}?${params.toString()}`, {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) {
      return unavailable('Explorer request failed', `Etherscan V2 HTTP ${res.status}`)
    }

    const json = (await res.json()) as { status?: string; message?: string; result?: string }
    if (json.status === '1' && json.result != null) {
      const count = Number.parseInt(String(json.result), 10)
      if (Number.isFinite(count) && count >= 0) {
        return {
          status: 'ready',
          count,
          source: 'bscscan',
          checkedAt: new Date().toISOString(),
        }
      }
    }

    return unavailable(
      json.message?.trim() || 'Explorer returned no holder count',
      `Etherscan V2 tokenholdercount: ${json.message ?? json.result ?? 'empty result'}`,
    )
  } catch (error) {
    return unavailable(
      'Explorer request failed',
      error instanceof Error ? error.message : 'Network error while fetching holder count',
    )
  }
}
