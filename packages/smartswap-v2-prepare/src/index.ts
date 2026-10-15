/**
 * SmartSwap V2 unsigned-transaction preparer.
 * Next Gen must dynamic-import this module after an explicit user request.
 * Do not build a ShadowCandidate from a raw getAmountsOut quote.
 */

export { assertSealedShadowCandidate, RAW_QUOTE_NOT_SEALED_CANDIDATE } from './provenance'
export {
  EXECUTOR_V2_EXECUTE_FRAGMENT,
  EXECUTOR_V2_VENUE_IDS,
  MELEGA_V2_EXECUTION_BINDING_UNAVAILABLE,
  V2_BINDING_CHAIN_MISMATCH,
  V2_BINDING_DEADLINE_INVALID,
  V2_BINDING_ECONOMICS_MISSING,
  V2_BINDING_EXACT_OUT_UNSUPPORTED,
  V2_BINDING_FEE_MISMATCH,
  V2_BINDING_INPUT_MISMATCH,
  V2_BINDING_MIN_OUT_MISSING,
  V2_BINDING_MULTI_HOP_FORBIDDEN,
  V2_BINDING_NET_INPUT_MISMATCH,
  V2_BINDING_NONCE_INVALID,
  V2_BINDING_QUOTE_INVALID,
  V2_BINDING_QUOTE_MISSING,
  V2_BINDING_QUOTE_STALE,
  V2_BINDING_ROUTER_MISSING,
  V2_BINDING_SPLIT_ROUTE,
  V2_BINDING_UNSUPPORTED_VENUE,
  V2_BINDING_USER_INVALID,
  V2_BINDING_VENUE_MISMATCH,
  V2_BINDING_WINNER_MISSING,
  V2_BINDING_WINNER_NOT_OK,
  V2_INTENT_VERSION,
  V2_NATIVE_ASSET,
  V2_POLICY_ID_HASH,
  V2_POLICY_VERSION_HASH,
  V2_PREP_ALLOWANCE_IDENTITY,
  V2_PREP_ALLOWANCE_MISSING,
  V2_PREP_AMOUNT_BOUNDS,
  V2_PREP_CHAIN_MISMATCH,
  V2_PREP_DEADLINE_EXPIRED,
  V2_PREP_EXECUTOR_INVALID,
  V2_PREP_MIN_OUT_ZERO,
  V2_PREP_NOW_INVALID,
  assertNoV1SignerFields,
  buildV2ExecutionBinding,
  certifiedVenueForExecutorV2,
  prepareV2UserTransactions,
  v2RouteHashOf,
  v2VenueIdHash,
} from './prepare'
export type {
  BuildV2ExecutionBindingInput,
  ExecutorV2VenueId,
  ObservedAllowanceIdentity,
  PrepareV2UserTransactionsInput,
  UnsignedUserTransaction,
  V2ExecutionBinding,
  V2ExecutionIntent,
  V2UserTransactionPreparation,
} from './prepare'
export type { ShadowCandidate } from './shadowCandidate'
