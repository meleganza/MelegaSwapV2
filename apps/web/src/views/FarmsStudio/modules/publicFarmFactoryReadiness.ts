/**
 * Public Farm Factory deployment readiness — honest measured state.
 * factoryAddress remains null until live mainnet validation + bind.
 */

import {
  PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT,
  PUBLIC_FARM_FACTORY_CHAIN_ID,
  isPublicFarmFactoryBound,
} from 'config/constants/publicFarmFactoryDeployment'
import { loadCertifiedPffArtifacts } from 'lib/deployment-orchestrator/founderPffArtifacts'

export type PublicFarmFactoryReadinessStatus =
  | 'DEPLOYMENT_BLOCKED'
  | 'READY_FOR_FOUNDER_SIGNATURE'
  | 'FACTORY_BOUND'
  | 'READY'
  | 'CONFIGURATION_INVALID'

const bound = isPublicFarmFactoryBound()
const artifacts = loadCertifiedPffArtifacts()
const packageValid = artifacts.status === 'ARTIFACTS_VALID'

export const PUBLIC_FARM_FACTORY_READINESS = {
  schema: 'melega.public-farm-factory-readiness.v1',
  capability: 'public_farm_factory',
  status: (bound
    ? 'FACTORY_BOUND'
    : packageValid
      ? 'READY_FOR_FOUNDER_SIGNATURE'
      : 'DEPLOYMENT_BLOCKED') as PublicFarmFactoryReadinessStatus,
  chainId: PUBLIC_FARM_FACTORY_CHAIN_ID,
  factoryAddress: PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.factoryAddress,
  factoryDeployed: bound,
  bytecodePresent: packageValid,
  packageValid,
  deploymentAuthorityReady: true,
  executionEnabled: false,
  feeRecipient: PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.feeRecipient,
  feePolicy: PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.feePolicy,
  eligibilitySigner: PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.eligibilitySigner,
  noKms: true,
  noServerSigner: true,
  noTreasuryRuntime: true,
  noAutomaticBroadcast: true,
  blockerCode: bound
    ? null
    : packageValid
      ? 'PUBLIC_FARM_FACTORY_AWAITING_FOUNDER_SIGNATURE'
      : 'PUBLIC_FARM_FACTORY_PACKAGE_INVALID',
  blockerSummary: bound
    ? 'Public Farm Factory bound — user create farm unlock pending certification flip.'
    : packageValid
      ? 'Public Farm Factory package is certified and ready for Founder-signed mainnet deployment via MELEGA DEPLOYER on /runtime/deployment/. factoryAddress remains null. User farm creation stays disabled until deploy, validate, and bind.'
      : 'Public Farm Factory certified package invalid — deployment blocked.',
  blockers: bound
    ? ([] as string[])
    : packageValid
      ? [
          'factoryAddress is null in publicFarmFactoryDeployment (not fabricated)',
          'Awaiting Founder browser-wallet signature by MELEGA DEPLOYER (no KMS / no server signer)',
          'User createFarm remains disabled until certified bind',
        ]
      : [...artifacts.invalidReasons],
  nextActions: packageValid
    ? [
        'Open /runtime/deployment/ as MELEGA DEPLOYER on BNB Smart Chain (56)',
        'Review PublicFarmFactoryV1 constructor: treasury, MARCO, pairFactory, eligibilitySigner',
        'Estimate gas · Ready for Founder signature · Deploy Public Farm Factory',
        'Validate receipt + masked runtime hash, then bind factoryAddress',
      ]
    : ['Repair certified artifact package'],
  userFlowPrepared: [
    'Create Farm',
    'Select LP Pair',
    'Existing pair OR Create Pair',
    'Check liquidity',
    'If TVL < 0.25 BNB → REQUIRE_LIQUIDITY_INCREASE',
    'Configure reward token (MARCO reward forbidden)',
    'Create Farm',
  ],
  contracts: {
    factory: 'contracts/public-farm-factory/PublicFarmFactoryV1.sol',
    template: 'contracts/public-farm-factory/PublicFarmTemplateV1.sol',
    certifiedArtifact: 'apps/web/src/lib/deployment-orchestrator/artifacts/pff-v1-certified.json',
  },
  updatedAt: '2026-08-02T04:30:00.000Z',
} as const

export type PublicFarmFactoryReadiness = typeof PUBLIC_FARM_FACTORY_READINESS

export function getPublicFarmFactoryReadiness(): PublicFarmFactoryReadiness {
  return PUBLIC_FARM_FACTORY_READINESS
}
