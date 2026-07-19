/**
 * LB010 — binary activation gate matrix for first controlled mainnet cycle.
 * READY only when every blocking gate is PASS. Never fabricate PASS.
 */

export type GateStatus = 'PASS' | 'FAIL' | 'DEFERRED' | 'NOT_DONE'

export type ActivationGate = {
  id: string
  requiredEvidence: string
  status: GateStatus
  blocking: boolean
  notes: string
}

export function buildActivationGates(now = new Date().toISOString()): {
  schemaVersion: 'melega.liquidity-building.activation-gates.v1'
  assessedAt: string
  activationAuthorized: boolean
  gates: ActivationGate[]
} {
  const gates: ActivationGate[] = [
    {
      id: 'CANONICAL_MELEGA_FACTORY',
      requiredEvidence: 'on-chain code at 0xb7E584…039C',
      status: 'PASS',
      blocking: true,
      notes: 'Verified bytecode present on chain-56',
    },
    {
      id: 'CANONICAL_MELEGA_ROUTER',
      requiredEvidence: 'on-chain code at 0xc25033…EAB3',
      status: 'PASS',
      blocking: true,
      notes: 'Verified bytecode present on chain-56',
    },
    {
      id: 'PROGRAM_BYTECODE_FROZEN',
      requiredEvidence: 'compiler + size / hash',
      status: 'PASS',
      blocking: true,
      notes: 'Local bytecode frozen; linked hash deferred to deploy',
    },
    {
      id: 'AUTHORIZER_BYTECODE_FROZEN',
      requiredEvidence: 'compiler + hash',
      status: 'PASS',
      blocking: true,
      notes: 'Local Authorizer bytecode hashed in deployment inputs',
    },
    {
      id: 'NON_EXPORTABLE_AUTHORITY',
      requiredEvidence: 'provider evidence + address',
      status: 'FAIL',
      blocking: true,
      notes: 'AUTONOMOUS_AUTHORITY_NOT_READY — LB-G03B',
    },
    {
      id: 'SIGNATURE_NORMALIZATION',
      requiredEvidence: 'DER→65-byte + Authorizer accept with production key',
      status: 'FAIL',
      blocking: true,
      notes: 'Module implemented; production KMS validation pending — LB-G11',
    },
    {
      id: 'TREASURY_RECEIVER',
      requiredEvidence: 'contract + role + Runtime binding',
      status: 'FAIL',
      blocking: true,
      notes: 'PRODUCTION_BINDING_NOT_FOUND — LB-G04B',
    },
    {
      id: 'FEE_SINK_BINDING',
      requiredEvidence: 'immutable Sink→receiver',
      status: 'FAIL',
      blocking: true,
      notes: 'Sink not deployed; receiver unbound',
    },
    {
      id: 'RUNTIME_INGESTION',
      requiredEvidence: 'finalized LB receipt → ACCOUNTED',
      status: 'FAIL',
      blocking: true,
      notes: 'Treasury Runtime MVP development / smartdrop.v1 — no LB schema — LB-G04C/G12',
    },
    {
      id: 'WBNB_QUOTE_POLICY',
      requiredEvidence: 'calculated + ratified',
      status: 'FAIL',
      blocking: true,
      notes: 'PROPOSED_FOR_FOUNDER_RATIFICATION — LB-G08',
    },
    {
      id: 'USDT_GAS_PATH',
      requiredEvidence: 'pinned on-chain conversion',
      status: 'FAIL',
      blocking: true,
      notes: 'NotActive — LB-G09',
    },
    {
      id: 'USDC_GAS_PATH',
      requiredEvidence: 'pinned on-chain conversion',
      status: 'FAIL',
      blocking: true,
      notes: 'NotActive — LB-G09',
    },
    {
      id: 'FINALITY_DEPTH',
      requiredEvidence: 'ops certification',
      status: 'FAIL',
      blocking: true,
      notes: 'FINALITY_EVIDENCE_INSUFFICIENT (15 retained; indexer uses 12) — LB-G10',
    },
    {
      id: 'STALE_ROUTER_CLOSED',
      requiredEvidence: 'import/runtime audit',
      status: 'PASS',
      blocking: true,
      notes: 'LB-G07 closed in LB008',
    },
    {
      id: 'DEPLOYMENT_INPUTS',
      requiredEvidence: 'validator PASS',
      status: 'FAIL',
      blocking: true,
      notes: 'DEPLOYMENT_INPUTS_BLOCKED',
    },
    {
      id: 'AUTONOMOUS_DEPLOYMENT_MECHANISM',
      requiredEvidence: 'no raw key deploy',
      status: 'FAIL',
      blocking: true,
      notes: 'No approved autonomous deployer',
    },
    {
      id: 'PERMISSIONLESS_RELAY',
      requiredEvidence: 'relay liveness without economic authority',
      status: 'FAIL',
      blocking: true,
      notes: 'LB-G03C open',
    },
    {
      id: 'EXTERNAL_SECURITY_REVIEW',
      requiredEvidence: 'scheduled/completed',
      status: 'NOT_DONE',
      blocking: true,
      notes: 'Before economic activation',
    },
    {
      id: 'LOW_VALUE_REAL_CYCLE',
      requiredEvidence: 'LB011',
      status: 'NOT_DONE',
      blocking: false,
      notes: 'Deferred — DoD of next mission',
    },
  ]

  const activationAuthorized = gates.every((g) => !g.blocking || g.status === 'PASS')
  return {
    schemaVersion: 'melega.liquidity-building.activation-gates.v1',
    assessedAt: now,
    activationAuthorized,
    gates,
  }
}
