import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import {
  DEX_CANONICAL_PIPELINES,
  DEX_GRAVITY_SCHEMA_VERSION,
  MELEGA_DEX_SCHEMA,
  MELEGA_EXCHANGE_RECEIPT_SCHEMA,
} from './constants'
import { DEX_AUTHORITY_BOUNDARIES, buildProvenance } from './authorities'
import type { MelegaDexV1Payload } from './schemas/types'

export function buildMelegaDexV1(): MelegaDexV1Payload {
  return {
    schema: MELEGA_DEX_SCHEMA,
    schemaVersion: DEX_GRAVITY_SCHEMA_VERSION,
    role: 'Civilization Economic Exchange Engine',
    civilizationLiquidityOwner: true,
    pipelines: [...DEX_CANONICAL_PIPELINES],
    chains: [...SUPPORT_MULTI_CHAINS],
    venues: ['smart-router', 'v2-router', 'stable-swap'],
    capabilities: {
      swapRouting: true,
      lpRouting: true,
      executionIngress: true,
      treasuryHandoff: 'receipt-only',
      opportunityRefConsumption: true,
      gravityComputation: false,
      opportunityTruth: false,
    },
    routingPolicy: {
      quoteOwner: 'routing-layer',
      computationEngine: 'smart-router',
    },
    executionPolicy: {
      submitOwner: 'execution-ingress',
      evidenceOwner: 'execution-tracker',
    },
    treasuryHandoff: {
      schema: MELEGA_EXCHANGE_RECEIPT_SCHEMA,
      legacySchema: 'melega.dex-execution-receipt.v1',
      settlementBoundary: 'receipt-only',
    },
    opportunityRef: {
      consumption: 'read-only',
      detection: false,
      ranking: false,
    },
    authority: DEX_AUTHORITY_BOUNDARIES,
    provenance: buildProvenance(),
  }
}
