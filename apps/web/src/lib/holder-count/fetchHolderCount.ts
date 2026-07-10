import type { HolderCountResult } from './types'

const BSCSCAN_HOLDER_COUNT_URL = 'https://api.bscscan.com/api'

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

  if (chainId !== 56) {
    return unavailable(
      'Source not configured',
      `Holder count provider is not configured for chain ${chainId}`,
    )
  }

  const apiKey = apiKeyOverride ?? process.env.NEXT_PUBLIC_BSCSCAN_API_KEY ?? process.env.NEXT_PUBLIC_BSCSAN_API_KEY
  if (!apiKey) {
    return unavailable(
      'Source not configured',
      'Set NEXT_PUBLIC_BSCSCAN_API_KEY in Vercel (Production + Preview) and redeploy',
    )
  }

  try {
    const params = new URLSearchParams({
      module: 'token',
      action: 'tokenholdercount',
      contractaddress: normalized,
      apikey: apiKey,
    })
    const res = await fetch(`${BSCSCAN_HOLDER_COUNT_URL}?${params.toString()}`, {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) {
      return unavailable('Explorer request failed', `BscScan HTTP ${res.status}`)
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
      `BscScan tokenholdercount: ${json.message ?? 'empty result'}`,
    )
  } catch (error) {
    return unavailable(
      'Explorer request failed',
      error instanceof Error ? error.message : 'Network error while fetching holder count',
    )
  }
}
