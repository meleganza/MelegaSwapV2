/**
 * Public Farm Factory capability — factual readiness.
 * Outcome B: factory package required / not deployed. MasterBuilder never exposed.
 */
export type PublicFarmFactoryCapabilityOutcome =
  | 'A_PERMISSIONLESS_FACTORY_AVAILABLE'
  | 'B_FACTORY_DEPLOYMENT_REQUIRED'
  | 'C_ADMIN_ONLY_MASTERBUILDER'

export const PUBLIC_FARM_FACTORY_CAPABILITY = {
  schema: 'melega.dex.v1.public-farm-factory-capability',
  outcome: 'B_FACTORY_DEPLOYMENT_REQUIRED' as PublicFarmFactoryCapabilityOutcome,
  summary:
    'Public Farm Factory orchestration is live in the UI. On-chain createFarm execution remains blocked until the PublicFarmFactoryV1 package is deployed. MasterBuilder / MasterChef.add stay protocol-only.',
  blockerLabel: 'Public Farm Factory deployment required — create execution blocked',
  facts: [
    'No reusable permissionless farm factory is deployed on BNB Chain for Melega DEX.',
    'PublicFarmFactoryV1 package ships under contracts/public-farm-factory/ (undeployed).',
    'MasterChef.add() / MasterBuilder remain protocol-admin only and are never exposed to public users.',
    'MARCO reward farms are rejected by the Public Farm Factory with no admin bypass.',
  ],
  readiness: {
    walletCanExecute: false,
    requiresAdminAction: false,
    requiresFactoryDeployment: true,
    masterBuilderExposed: false,
  },
  contracts: {
    publicFarmFactory: null as string | null,
    publicFarmFactoryTx: null as string | null,
    masterChef: 'MasterChef.add() — protocol-only (not exposed)',
    package: 'contracts/public-farm-factory/',
  },
  deployment: {
    status: 'BLOCKED',
    address: null,
    transaction: null,
    completedPackage: 'contracts/public-farm-factory/',
    blockers: [
      'PublicFarmFactoryV1 not deployed on BNB Chain',
      'No deployer credentials authorized for this mission',
      'Factory address must not be fabricated',
    ],
    resumeSequence: [
      'Deploy PublicFarmFactoryV1 with treasury fee recipient + MARCO reject address + Melega pair factory',
      'Wire factory address into apps/web config (non-null)',
      'Enable walletCanExecute after deployment verification',
      'Index FarmCreated events into canonical farm discovery pipeline',
    ],
  },
} as const

export type PublicFarmFactoryCapability = typeof PUBLIC_FARM_FACTORY_CAPABILITY
