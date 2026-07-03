import type { ExecutionInstruction } from '../execution-layer/types'
import type { HANDOFF_MODE_DRY_RUN, HANDOFF_PACKAGE_VERSION } from './constants'
import type {
  CompatibilityCertificationOutcome,
  KERL_REMOTE_CONTRACT_COMPATIBILITY_CERTIFIED,
} from './certification'

/**
 * Dry-run manifest embedded in a KERL Dry-Run Handoff Package.
 * Documents RC1 / Swarm handoff shape — validated locally, no Swarm imports.
 */
export interface DryRunHandoffManifest {
  executionMode: 'DRY_RUN_ONLY'
  executionPerformed: false
  walletInteraction: 'none'
  networkCommunication: false
  transmitted: false | 'internal-test'
  transactionHash: null
  receipt: null
  settlement: null
  treasurySubmission?: null
}

/** Static routing metadata summary — no live balances, quotes, or liquidity. */
export interface Rc1RoutingMetadataSummary {
  domain: 'swap' | 'bridge'
  adapter: string
  chainId: number
  routeLabel: string
  instructionType: string
}

/** Instruction identity snapshot carried in RC1 handoff envelope. */
export interface Rc1InstructionIdentitySnapshot {
  id: string
  correlationId: string
  version: string
  source: string
}

/** Correlation identity for offline handoff tracing. */
export interface Rc1CorrelationIdentity {
  handoffCorrelationId: string
  swarmSessionRef: string
}

/** Evidence summary — proposal only, no execution artifacts. */
export interface Rc1EvidenceSummary {
  evidenceClass: 'dry_run_proposal'
  proposalStatus: 'eligible' | 'ineligible'
  networkSourced: false
}

/** Proposal eligibility for DEX dry-run consumption. */
export interface Rc1ProposalEligibility {
  eligible: boolean
  dexDryRunOnly: true
  executionPermitted: false
  notes: string
}

/**
 * KERL Remote Contract Compatibility Certification — carried on certified handoff packages.
 * Validated locally without Swarm runtime.
 */
export interface KerlCompatibilityCertification {
  certificationVerdict: typeof KERL_REMOTE_CONTRACT_COMPATIBILITY_CERTIFIED | string
  outcome: CompatibilityCertificationOutcome
  executionContractVersion: string
  dexCompatibilityVersion: string
  certifiedAt: string
}

/**
 * KERL Swarm RC1 offline handoff envelope fields.
 * Test-only fixture shape — no live network data.
 */
export interface KerlRc1HandoffEnvelope {
  routingDecisionSnapshotRef: string
  routingMetadataSummary: Rc1RoutingMetadataSummary
  executionInstructionContractVersion: string
  instructionIdentity: Rc1InstructionIdentitySnapshot
  correlationIdentity: Rc1CorrelationIdentity
  evidenceSummary: Rc1EvidenceSummary
  proposalEligibility: Rc1ProposalEligibility
  dexCompatibilityVersion: string
  handoffTimestamp: string
}

/**
 * KERL Dry-Run Handoff Package — internal DEX consumer input shape.
 * Swarm RC1 certified reference; validated without calling Swarm runtime.
 *
 * RC1 envelope fields are required for offline fixture validation (Phase 4)
 * but optional for minimal Phase 3 consumer packages.
 */
export interface DryRunHandoffPackage {
  packageVersion: typeof HANDOFF_PACKAGE_VERSION | string
  packageId: string
  correlationId: string
  handoffMode: typeof HANDOFF_MODE_DRY_RUN | string
  createdAt: string
  dryRunManifest: DryRunHandoffManifest
  proposedInstruction: ExecutionInstruction
  /** Optional KERL metadata — must not imply execution or settlement. */
  kerlReference?: {
    swarmVerdict?: string
    rcVersion?: string
  }
  /** RC1 Swarm envelope — present on offline fixtures. */
  routingDecisionSnapshotRef?: string
  routingMetadataSummary?: Rc1RoutingMetadataSummary
  executionInstructionContractVersion?: string
  instructionIdentity?: Rc1InstructionIdentitySnapshot
  correlationIdentity?: Rc1CorrelationIdentity
  evidenceSummary?: Rc1EvidenceSummary
  proposalEligibility?: Rc1ProposalEligibility
  dexCompatibilityVersion?: string
  handoffTimestamp?: string
  /** Remote contract compatibility certification — required for certified handshake. */
  compatibilityCertification?: KerlCompatibilityCertification
}

/** Full RC1 offline fixture package with all envelope fields required. */
export type Rc1OfflineDryRunHandoffPackage = DryRunHandoffPackage & KerlRc1HandoffEnvelope

/**
 * Certified dry-run handoff package — RC1 envelope + compatibility certification required.
 */
export type CertifiedDryRunHandoffPackage = DryRunHandoffPackage &
  KerlRc1HandoffEnvelope & {
    compatibilityCertification: KerlCompatibilityCertification
  }

export type { ExecutionInstruction }
