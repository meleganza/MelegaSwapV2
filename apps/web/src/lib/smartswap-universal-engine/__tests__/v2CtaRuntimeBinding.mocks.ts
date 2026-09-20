import type { SmartSwapRequest } from '../quote'
import type { V2ShadowRuntimeFacts } from '../v2UserExecutionPlan'

export const runtimeMocks = {
  walletChainId: 56,
  user: '0x1111111111111111111111111111111111111111',
  allowanceRaw: '1000000' as string | undefined,
  runtime: {
    request: null as SmartSwapRequest | null,
    requestKey: null as string | null,
    shadow: null as V2ShadowRuntimeFacts | null,
  },
  walletSends: [] as Array<{ to: string; data: string }>,
  walletShouldReject: false,
  walletExecuteFails: false,
  executor: '0x3333333333333333333333333333333333333333',
}

export function resetRuntimeMocks(): void {
  runtimeMocks.walletChainId = 56
  runtimeMocks.user = '0x1111111111111111111111111111111111111111'
  runtimeMocks.allowanceRaw = '1000000'
  runtimeMocks.runtime = { request: null, requestKey: null, shadow: null }
  runtimeMocks.walletSends.length = 0
  runtimeMocks.walletShouldReject = false
  runtimeMocks.walletExecuteFails = false
}
