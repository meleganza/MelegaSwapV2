/**
 * Public Farm Factory capability — factual readiness.
 * Outcome A when factoryAddress is bound after validated mainnet deploy.
 * MasterBuilder never exposed.
 */
import {
  PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT,
  isPublicFarmFactoryBound,
} from 'config/constants/publicFarmFactoryDeployment'

export type PublicFarmFactoryCapabilityOutcome =
  | 'A_PERMISSIONLESS_FACTORY_AVAILABLE'
  | 'B_FACTORY_DEPLOYMENT_REQUIRED'
  | 'C_ADMIN_ONLY_MASTERBUILDER'

const bound = isPublicFarmFactoryBound()
const factory = PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.factoryAddress

export const PUBLIC_FARM_FACTORY_CAPABILITY = {
  schema: 'melega.dex.v1.public-farm-factory-capability',
  outcome: (bound
    ? 'A_PERMISSIONLESS_FACTORY_AVAILABLE'
    : 'B_FACTORY_DEPLOYMENT_REQUIRED') as PublicFarmFactoryCapabilityOutcome,
  summary: bound
    ? 'PublicFarmFactoryV1 is DEPLOYED · VALIDATED · BOUND · READY on BNB Chain. Users create eligible farms permissionlessly. MasterBuilder / MasterChef.add stay protocol-only.'
    : 'Public Farm Factory package awaits Founder-signed mainnet deployment, validation, and bind.',
  blockerLabel: bound
    ? 'Public Farm Factory READY — create execution unlocked'
    : 'Public Farm Factory deployment required — create execution blocked',
  facts: bound
    ? [
        `PublicFarmFactoryV1 bound at ${factory}.`,
        'MARCO LP pairs are FREE; other pairs pay 0.25 BNB to MELEGA TREASURY WALLET.',
        'Minimum LP TVL 0.25 BNB — below threshold prompts REQUIRE_LIQUIDITY_INCREASE.',
        'MARCO reward farms are rejected by the Public Farm Factory with no admin bypass.',
        'MasterChef.add() / MasterBuilder remain protocol-admin only and are never exposed.',
      ]
    : [
        'Certified PublicFarmFactoryV1 artifact is loaded for Founder wallet deploy.',
        'factoryAddress remains null until live mainnet validation + bind (not fabricated).',
        'MasterChef.add() / MasterBuilder remain protocol-admin only and are never exposed to public users.',
        'MARCO reward farms are rejected by the Public Farm Factory with no admin bypass.',
      ],
  readiness: {
    walletCanExecute: bound,
    requiresAdminAction: false,
    requiresFactoryDeployment: !bound,
    masterBuilderExposed: false,
    readyForFounderSignature: !bound,
  },
  contracts: {
    publicFarmFactory: factory,
    publicFarmFactoryTx: PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.deploymentTx,
    masterChef: 'MasterChef.add() — protocol-only (not exposed)',
    package: 'contracts/public-farm-factory/',
    certifiedArtifact: 'apps/web/src/lib/deployment-orchestrator/artifacts/pff-v1-certified.json',
  },
  deployment: {
    status: bound ? 'READY' : 'AWAITING_VALIDATION',
    address: factory,
    transaction: PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.deploymentTx,
    completedPackage: 'contracts/public-farm-factory/',
    blockers: bound
      ? ([] as string[])
      : [
          'PublicFarmFactoryV1 SSOT factoryAddress still null (not fabricated)',
          'Awaiting Founder signature + receipt validation before bind',
        ],
    resumeSequence: bound
      ? [
          'Users open Create Farm',
          'Select LP pair · check liquidity · configure rewards · createFarm',
        ]
      : [
          'Open /runtime/deployment/ as MELEGA DEPLOYER',
          'Deploy · capture receipt · validate · bind factoryAddress',
        ],
  },
} as const

export type PublicFarmFactoryCapability = typeof PUBLIC_FARM_FACTORY_CAPABILITY
