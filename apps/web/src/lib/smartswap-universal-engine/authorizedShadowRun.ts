/**
 * Engine-owned authorized SHADOW run. Hosts submit request + production quote only.
 * Registry and adapters stay inside the engine. No execution.
 */

import type { SmartSwapAuthorizedSession } from './widget'
import { assertAuthorizedHostContext, assertHostDoesNotOwnVenues } from './widget'
import type { NormalizedQuote, SmartSwapRequest } from './quote'
import { createFactualV2QuoteSource } from './evmV2Quote'
import { buildEvmShadowVenueRegistry } from './evmShadowRegistry'
import { runEvmShadowCompetition, type ShadowCompetitionResult } from './shadowCompetition'
import type { LegacyMelegaQuoteSnapshot } from './melegaDexAdapter'

export async function runAuthorizedEvmShadowCompetition(input: {
  session: SmartSwapAuthorizedSession
  request: SmartSwapRequest
  productionQuote: NormalizedQuote | null
  melegaSnapshot: LegacyMelegaQuoteSnapshot | null
  nowIso?: string
  rpcUrlByChain: Partial<Record<number, string>>
  fetchImpl?: typeof fetch
}): Promise<ShadowCompetitionResult> {
  if (input.session.engine.mode !== 'SHADOW') throw new Error('SMARTSWAP_SESSION_NOT_SHADOW')
  if (input.session.widget.surface !== 'SmartSwapForm') throw new Error('SMARTSWAP_SESSION_WIDGET_MISMATCH')
  assertAuthorizedHostContext(input.session.host)
  assertHostDoesNotOwnVenues(input.session.host)
  const source = createFactualV2QuoteSource({
    rpcUrlByChain: input.rpcUrlByChain,
    fetchImpl: input.fetchImpl,
  })
  const registry = buildEvmShadowVenueRegistry({
    melegaSnapshot: input.melegaSnapshot,
    pancakeSource: source,
    uniswapSource: source,
  })
  return runEvmShadowCompetition({
    request: input.request,
    productionQuote: input.productionQuote,
    adapters: registry.adapters,
    nowIso: input.nowIso,
  })
}
