/**
 * Public Farm Factory capability — factual readiness.
 * Outcome B until factoryAddress is bound after Founder-signed deploy.
 * MasterBuilder never exposed.
 */
export type PublicFarmFactoryCapabilityOutcome =
  | 'A_PERMISSIONLESS_FACTORY_AVAILABLE'
  | 'B_FACTORY_DEPLOYMENT_REQUIRED'
  | 'C_ADMIN_ONLY_MASTERBUILDER'

export const PUBLIC_FARM_FACTORY_CAPABILITY = {
  schema: 'melega.dex.v1.public-farm-factory-capability',
  outcome: 'B_FACTORY_DEPLOYMENT_REQUIRED' as PublicFarmFactoryCapabilityOutcome,
  summary:
    'Public Farm Factory package is certified and ready for Founder-signed mainnet deployment. On-chain createFarm remains blocked until PublicFarmFactoryV1 is deployed, validated, and bound. MasterBuilder / MasterChef.add stay protocol-only.',
  blockerLabel: 'Public Farm Factory awaiting Founder signature — create execution blocked',
  facts: [
    'Certified PublicFarmFactoryV1 artifact is loaded for Founder wallet deploy.',
    'factoryAddress remains null until live mainnet validation + bind (not fabricated).',
    'MasterChef.add() / MasterBuilder remain protocol-admin only and are never exposed to public users.',
    'MARCO reward farms are rejected by the Public Farm Factory with no admin bypass.',
    'MARCO LP pairs are FREE; other pairs pay 0.25 BNB to MELEGA TREASURY WALLET.',
  ],
  readiness: {
    walletCanExecute: false,
    requiresAdminAction: false,
    requiresFactoryDeployment: true,
    masterBuilderExposed: false,
    readyForFounderSignature: true,
  },
  contracts: {
    publicFarmFactory: null as string | null,
    publicFarmFactoryTx: null as string | null,
    masterChef: 'MasterChef.add() — protocol-only (not exposed)',
    package: 'contracts/public-farm-factory/',
    certifiedArtifact: 'apps/web/src/lib/deployment-orchestrator/artifacts/pff-v1-certified.json',
  },
  deployment: {
    status: 'READY_FOR_FOUNDER_SIGNATURE',
    address: null,
    transaction: null,
    completedPackage: 'contracts/public-farm-factory/',
    blockers: [
      'PublicFarmFactoryV1 not yet deployed on BNB Chain',
      'factoryAddress must not be fabricated',
      'Awaiting MELEGA DEPLOYER browser-wallet signature (no KMS / no server signer)',
    ],
    resumeSequence: [
      'Open /runtime/deployment/ as MELEGA DEPLOYER',
      'Review constructor · estimate gas · Deploy Public Farm Factory',
      'Validate receipt + masked runtime hash, then bind factoryAddress',
      'Enable walletCanExecute after deployment verification',
      'Index FarmCreated events into canonical farm discovery pipeline',
    ],
  },
} as const

export type PublicFarmFactoryCapability = typeof PUBLIC_FARM_FACTORY_CAPABILITY
