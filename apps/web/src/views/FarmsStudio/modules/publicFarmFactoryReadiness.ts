/**
 * Public Farm Factory deployment readiness — honest measured state.
 * Factory bound after mainnet validation against pff-v1-certified.json.
 */

import {
  PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT,
  PUBLIC_FARM_FACTORY_CHAIN_ID,
  isPublicFarmFactoryBound,
} from 'config/constants/publicFarmFactoryDeployment'
import { loadCertifiedPffArtifacts } from 'lib/deployment-orchestrator/founderPffArtifacts'
import { PUBLIC_FARM_FACTORY_CAPABILITY } from './publicFarmFactoryCapability'

export type PublicFarmFactoryReadinessStatus =
  | 'DEPLOYMENT_BLOCKED'
  | 'READY_FOR_FOUNDER_SIGNATURE'
  | 'AWAITING_VALIDATION'
  | 'FACTORY_BOUND'
  | 'READY'
  | 'CONFIGURATION_INVALID'

const bound = isPublicFarmFactoryBound()
const artifacts = loadCertifiedPffArtifacts()
const packageValid = artifacts.status === 'ARTIFACTS_VALID'
const executionEnabled = bound && PUBLIC_FARM_FACTORY_CAPABILITY.readiness.walletCanExecute

export const PUBLIC_FARM_FACTORY_READINESS = {
  schema: 'melega.public-farm-factory-readiness.v3',
  capability: 'public_farm_factory',
  status: (bound && executionEnabled
    ? 'READY'
    : bound
      ? 'FACTORY_BOUND'
      : packageValid
        ? 'AWAITING_VALIDATION'
        : 'DEPLOYMENT_BLOCKED') as PublicFarmFactoryReadinessStatus,
  chainId: PUBLIC_FARM_FACTORY_CHAIN_ID,
  factoryAddress: PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.factoryAddress,
  factoryDeployed: bound,
  bytecodePresent: packageValid,
  packageValid,
  deploymentAuthorityReady: true,
  executionEnabled,
  executionPathReady: packageValid,
  readyForFounderSignature: !bound && packageValid,
  feeRecipient: PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.feeRecipient,
  feePolicy: PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.feePolicy,
  eligibilitySigner: PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.eligibilitySigner,
  lifecycle: bound
    ? (['DEPLOYED', 'VALIDATED', 'BOUND', 'READY'] as const)
    : (['AWAITING_VALIDATION'] as const),
  noKms: true,
  noServerSigner: true,
  noTreasuryRuntime: true,
  noAutomaticBroadcast: true,
  blockerCode: bound && executionEnabled ? null : bound ? null : 'PUBLIC_FARM_FACTORY_AWAITING_VALIDATION',
  blockerSummary: bound && executionEnabled
    ? 'Public Farm Factory is DEPLOYED · VALIDATED · BOUND · READY. Users create farms permissionlessly. Founder is not involved. MARCO rewards unsupported. Min TVL 0.25 BNB → REQUIRE_LIQUIDITY_INCREASE.'
    : packageValid
      ? 'Awaiting Founder deploy + validation + bind.'
      : 'Public Farm Factory certified package invalid — deployment blocked.',
  blockers: bound && executionEnabled
    ? ([] as string[])
    : packageValid
      ? [
          'factoryAddress is null in publicFarmFactoryDeployment (not fabricated)',
          'Awaiting Founder browser-wallet signature + receipt validation',
        ]
      : [...artifacts.invalidReasons],
  nextActions: bound && executionEnabled
    ? [
        'Open Create Farm',
        'Select LP pair (existing or create)',
        'If TVL < 0.25 BNB → increase liquidity',
        'Configure non-MARCO reward token · Create Farm',
      ]
    : [
        'Open /runtime/deployment/ as MELEGA DEPLOYER',
        'Validate receipt + bind factoryAddress',
      ],
  captureAfterSignature: ['transactionHash', 'receipt', 'contractAddress'],
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
  updatedAt: '2026-08-02T06:10:00.000Z',
} as const

export type PublicFarmFactoryReadiness = typeof PUBLIC_FARM_FACTORY_READINESS

export function getPublicFarmFactoryReadiness(): PublicFarmFactoryReadiness {
  return PUBLIC_FARM_FACTORY_READINESS
}
