/**
 * TEST-ONLY — Invalid certified handshake fixture variants.
 */
import { EXECUTION_INSTRUCTION_SCHEMA_VERSION } from 'lib/execution-contract'
import {
  COMPATIBILITY_OUTCOME_INCOMPATIBLE,
  COMPATIBILITY_OUTCOME_UNKNOWN,
  KERL_REMOTE_CONTRACT_COMPATIBILITY_CERTIFIED,
} from '../certification'
import { HANDOFF_PACKAGE_VERSION } from '../constants'
import type { CertifiedDryRunHandoffPackage, DryRunHandoffPackage } from '../types'
import {
  CERTIFIED_DRY_RUN_HANDOFF_FIXTURE,
  RC1_OFFLINE_FIXTURE_ID,
  buildCertifiedDryRunHandoffFixture,
} from './rc1-offline-dry-run-handoff.fixture'

export function buildCertifiedFixtureMissingCertification(): DryRunHandoffPackage {
  const base = buildCertifiedDryRunHandoffFixture()
  const { compatibilityCertification: _removed, ...broken } = base
  return { ...broken, packageId: `${RC1_OFFLINE_FIXTURE_ID}-no-cert` }
}

export function buildCertifiedFixtureUnknownOutcome(): CertifiedDryRunHandoffPackage {
  const base = buildCertifiedDryRunHandoffFixture()
  return {
    ...base,
    packageId: `${RC1_OFFLINE_FIXTURE_ID}-unknown-cert`,
    compatibilityCertification: {
      ...base.compatibilityCertification,
      outcome: COMPATIBILITY_OUTCOME_UNKNOWN,
    },
  }
}

export function buildCertifiedFixtureIncompatibleOutcome(): CertifiedDryRunHandoffPackage {
  const base = buildCertifiedDryRunHandoffFixture()
  return {
    ...base,
    packageId: `${RC1_OFFLINE_FIXTURE_ID}-incompatible-cert`,
    compatibilityCertification: {
      ...base.compatibilityCertification,
      outcome: COMPATIBILITY_OUTCOME_INCOMPATIBLE,
    },
  }
}

export function buildCertifiedFixtureVersionMismatch(): CertifiedDryRunHandoffPackage {
  const base = buildCertifiedDryRunHandoffFixture()
  return {
    ...base,
    packageId: `${RC1_OFFLINE_FIXTURE_ID}-version-mismatch`,
    dexCompatibilityVersion: '9.9.9',
    compatibilityCertification: {
      ...base.compatibilityCertification,
      dexCompatibilityVersion: HANDOFF_PACKAGE_VERSION,
    },
  }
}

export function buildCertifiedFixtureIdentityMismatch(): CertifiedDryRunHandoffPackage {
  const base = buildCertifiedDryRunHandoffFixture()
  return {
    ...base,
    packageId: `${RC1_OFFLINE_FIXTURE_ID}-identity-mismatch`,
    instructionIdentity: {
      ...base.instructionIdentity,
      id: 'mismatched-instruction-id',
    },
  }
}

export function buildCertifiedFixtureIneligible(): CertifiedDryRunHandoffPackage {
  const base = buildCertifiedDryRunHandoffFixture()
  return {
    ...base,
    packageId: `${RC1_OFFLINE_FIXTURE_ID}-ineligible`,
    proposalEligibility: {
      ...base.proposalEligibility,
      eligible: false,
      notes: 'Test fixture — proposal ineligible',
    },
  }
}

export function buildCertifiedFixtureInvalidManifest(): CertifiedDryRunHandoffPackage {
  const base = buildCertifiedDryRunHandoffFixture()
  return {
    ...base,
    packageId: `${RC1_OFFLINE_FIXTURE_ID}-invalid-manifest`,
    dryRunManifest: {
      ...base.dryRunManifest,
      walletInteraction: 'sign' as unknown as 'none',
    },
  }
}

export function buildCertifiedFixtureInvalidVerdict(): CertifiedDryRunHandoffPackage {
  const base = buildCertifiedDryRunHandoffFixture()
  return {
    ...base,
    packageId: `${RC1_OFFLINE_FIXTURE_ID}-invalid-verdict`,
    compatibilityCertification: {
      ...base.compatibilityCertification,
      certificationVerdict: 'KERL_UNCERTIFIED',
    },
  }
}

export function buildCertifiedFixtureContractVersionMismatch(): CertifiedDryRunHandoffPackage {
  const base = buildCertifiedDryRunHandoffFixture()
  return {
    ...base,
    packageId: `${RC1_OFFLINE_FIXTURE_ID}-contract-version-mismatch`,
    executionInstructionContractVersion: EXECUTION_INSTRUCTION_SCHEMA_VERSION,
    compatibilityCertification: {
      ...base.compatibilityCertification,
      certificationVerdict: KERL_REMOTE_CONTRACT_COMPATIBILITY_CERTIFIED,
      executionContractVersion: '9.9',
    },
  }
}

/** Reference to canonical certified fixture for convenience in tests. */
export { CERTIFIED_DRY_RUN_HANDOFF_FIXTURE }
