import type { HolderCountResult, HolderCountSource } from './types'

export type HolderMachineStatus = 'configured' | 'not_configured' | 'error'

export interface HolderMachinePayload {
  holder_source: Exclude<HolderCountSource, 'unavailable'>
  holder_status: HolderMachineStatus
  holder_reason?: string
}

export function resolveHolderMachinePayload(result?: HolderCountResult | null): HolderMachinePayload {
  if (result?.status === 'ready') {
    return {
      holder_source: result.source === 'bscscan' ? 'bscscan' : 'binplorer',
      holder_status: 'configured',
    }
  }

  return {
    holder_source: 'binplorer',
    holder_status: 'error',
    holder_reason:
      result?.status === 'unavailable' ? result.diagnostic : 'BNB Chain holder index request pending or failed',
  }
}
