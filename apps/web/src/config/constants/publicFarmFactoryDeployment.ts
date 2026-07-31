/**
 * Canonical Public Farm Factory binding — single source of truth.
 * Mirrors capability package; do not fabricate mainnet addresses.
 */

export const PUBLIC_FARM_FACTORY_CHAIN_ID = 56 as const

export const PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT = {
  schema: 'melega.public-farm-factory.deployment.v1',
  chainId: PUBLIC_FARM_FACTORY_CHAIN_ID,
  factoryAddress: null as string | null,
  farmTemplate: 'PublicFarmTemplateV1',
  factoryContract: 'PublicFarmFactoryV1',
  packagePath: 'contracts/public-farm-factory/',
  deploymentTx: null as string | null,
  deploymentBlock: null as number | null,
  verified: false,
  status: 'DEPLOYMENT_BLOCKED' as const,
} as const

export type PublicFarmFactoryDeployment = typeof PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT

export function getPublicFarmFactoryDeployment(): PublicFarmFactoryDeployment {
  return PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT
}

export function isPublicFarmFactoryBound(): boolean {
  return Boolean(PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.factoryAddress)
}
