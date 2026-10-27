/**
 * On-demand call into the shared preparer.
 * A getAmountsOut quote is not a sealed candidate and must fail closed.
 */
import type { PrepareV2UserTransactionsInput, ShadowCandidate } from '@melega/smartswap-v2-prepare'

export interface UnsignedPreparation {
  ok: boolean
  code?: string
  unsignedTx: unknown
  broadcast: false
  signed: false
  approved: false
}

/** Cited from apps/web v2ExecutionRuntimeConfig. Not an encoder. */
const CERTIFIED_BSC_EXECUTOR = '0x7c07082839edd5797737640bba6af47992b9861e'

export async function prepareUnsignedFromSealed(
  candidate: unknown,
  rest: {
    request: unknown
    user: string
    deadline: number
    nonce: string
    nowIso: string
    currentChainId: number
  },
): Promise<UnsignedPreparation> {
  if (rest.currentChainId !== 56) {
    return { ok: false, code: 'CHAIN_MISMATCH', unsignedTx: null, broadcast: false, signed: false, approved: false }
  }
  const preparer = await import('@melega/smartswap-v2-prepare')
  const assertSealed: (value: unknown) => asserts value is ShadowCandidate = preparer.assertSealedShadowCandidate
  if (typeof assertSealed !== 'function') {
    return { ok: false, code: 'RAW_QUOTE_NOT_SEALED_CANDIDATE', unsignedTx: null, broadcast: false, signed: false, approved: false }
  }
  try {
    assertSealed(candidate)
  } catch (error) {
    return {
      ok: false,
      code: error instanceof Error ? error.message : 'RAW_QUOTE_NOT_SEALED_CANDIDATE',
      unsignedTx: null,
      broadcast: false,
      signed: false,
      approved: false,
    }
  }
  const unsignedTx = preparer.prepareV2UserTransactions({
    request: rest.request as PrepareV2UserTransactionsInput['request'],
    winner: candidate,
    user: rest.user,
    deadline: rest.deadline,
    nonce: rest.nonce,
    nowIso: rest.nowIso,
    currentChainId: rest.currentChainId,
    executorAddress: CERTIFIED_BSC_EXECUTOR,
  })
  return { ok: true, unsignedTx, broadcast: false, signed: false, approved: false }
}
