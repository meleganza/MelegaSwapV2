import type { HolderCountResult } from './types'
import { resolveBscScanApiKey } from './resolveBscScanApiKey'

export type HolderMachineStatus = 'configured' | 'not_configured' | 'error'

export interface HolderMachinePayload {
  holder_source: 'bscscan'
  holder_status: HolderMachineStatus
  holder_reason?: string
}

const DEPLOYMENT_INSTRUCTION =
  'Set NEXT_PUBLIC_BSCSCAN_API_KEY in Vercel project melega-swap-v2-web (Production + Preview) and apps/web/.env.local'

export function resolveHolderMachinePayload(result?: HolderCountResult | null): HolderMachinePayload {
  const keyInfo = resolveBscScanApiKey()

  if (result?.status === 'ready') {
    return { holder_source: 'bscscan', holder_status: 'configured' }
  }

  if (!keyInfo.apiKey) {
    return {
      holder_source: 'bscscan',
      holder_status: 'not_configured',
      holder_reason: DEPLOYMENT_INSTRUCTION,
    }
  }

  return {
    holder_source: 'bscscan',
    holder_status: 'error',
    holder_reason:
      result?.status === 'unavailable'
        ? result.diagnostic
        : keyInfo.typoAliasUsed
          ? `${DEPLOYMENT_INSTRUCTION} (legacy typo env NEXT_PUBLIC_BSCSAN_API_KEY detected — rename to NEXT_PUBLIC_BSCSCAN_API_KEY)`
          : 'BscScan tokenholdercount request pending or failed',
  }
}
