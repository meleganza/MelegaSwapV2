/** Constitutional wrapper specification — deployment-ready design, no Solidity in this phase. */

export const WRAPPER_SPEC_VERSION = '0.2.0' as const

export const WRAPPER_STORAGE_LAYOUT = [
  'owner (address)',
  'paused (bool)',
  'underlyingRouter (address)',
  'treasuryCollector (address)',
  'marcoToken (address)',
  'standardProtocolFeeBps (uint16) = 30',
  'buyMarcoProtocolFeeBps (uint16) = 20',
  'pricingRefHash (bytes32)',
  'treasuryPolicyRefHash (bytes32)',
  'permit2 (address, optional)',
] as const

export const WRAPPER_EXECUTION_SEQUENCE = [
  '1. User calls Wrapper swap (exact-input only in v1)',
  '2. Wrapper reads MARCO token from immutable registry slot',
  '3. Wrapper computes protocolFeeBps (20 if output==MARCO else 30)',
  '4. Wrapper pulls grossAmountIn from user (ERC20) or receives msg.value (native)',
  '5. Wrapper transfers feeAmount to treasuryCollector',
  '6. Wrapper approves underlyingRouter for netAmountIn only',
  '7. Wrapper calls Pancake Smart Router with netAmountIn',
  '8. Wrapper emits ProtocolFeeCollected + SmartRouterSwapRouted',
  '9. DEX submits Treasury Runtime handoff receipt (off-chain, post-confirmation)',
  '10. Treasury Runtime executes FSC-01 — never inside Wrapper',
] as const

export const WRAPPER_SECURITY_MODEL = {
  allowanceHandling:
    'User approves Wrapper once. Wrapper approves underlying router per-swap for netAmountIn only. No infinite router approval from user.',
  approvalRacePrevention:
    'Use exact-input swaps with amount bounds. Reset router allowance to zero after swap when using legacy routers.',
  reentrancy:
    'Checks-Effects-Interactions. Fee transfer before external router call. ReentrancyGuard on swap entrypoints.',
  exactInputFlow: 'Supported in v1. Fee deducted from amountIn before router call.',
  exactOutputFlow: 'Blocked in v1 — SMART_ROUTER_EXACT_OUTPUT_UNSUPPORTED until inverse fee math certified.',
  feeOnTransferFlow: 'Blocked in v1 unless explicit supported-token allowlist and balance-delta verification.',
  permit2Compatibility: 'Optional Permit2 transfer path in v2 — same fee deduction before router forwarding.',
  routerUpgrades: 'Owner-gated underlyingRouter pointer update with timelock + event UnderlyingRouterUpdated.',
  failureRollback: 'If router call reverts, entire tx reverts including fee transfer (atomic).',
  treasuryCollectorUnavailable: 'Constructor requires non-zero collector. swap reverts if collector rejects transfer.',
  registryUnavailable: 'On-chain immutables set at deploy from ratified registry snapshot — no runtime registry in v1 contract.',
  chainMismatch: 'Immutable chainId guard or deploy-per-chain instance.',
  wrongMarcoAddress: 'Deploy blocked unless MARCO matches registry snapshot hash attestation.',
  wrapperPause: 'Pausable owner role — swaps revert when paused. Emergency bypass: none for production.',
  emergencyBypassPolicy: 'No DEX-side bypass of Wrapper once canonical. Incident response via pause only.',
} as const

export const WRAPPER_DEPLOYMENT_CHECKLIST = [
  'Treasury Runtime registry publishes collector address for chain',
  'KERL registry attestation for MARCO address',
  'Security review + audit complete',
  'Underlying Pancake Smart Router address verified on-chain',
  'Wrapper bytecode matches ABI draft hash',
  'Collector accepts fee token (native + ERC20 paths tested)',
  'ProtocolFeeCollected event indexed by Treasury Runtime',
  'DEX UI points to Wrapper address from smart-router registry',
  'Rollback plan: pause Wrapper + revert UI to Adapter handoff mode',
] as const

export const FUTURE_EXECUTION_PIPELINE = [
  'User',
  'Melega Smart Router Wrapper',
  'Protocol Fee collection',
  'Treasury Collector',
  'Underlying Pancake Router',
  'Swap execution',
  'Receipt',
  'Treasury Runtime',
  'FSC-01 settlement',
  'Referral Runtime (SRD-01)',
] as const
