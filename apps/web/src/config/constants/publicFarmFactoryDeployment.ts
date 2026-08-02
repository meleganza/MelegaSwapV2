/**
 * Canonical Public Farm Factory binding — single source of truth.
 * Do not fabricate mainnet addresses. factoryAddress stays null until live validation + bind.
 */

import { MELEGA_TREASURY_FEE_DESTINATION } from './feeSchedule'
import { LB_MELEGA_AMM } from './liquidityBuildingDeployment'

export const PUBLIC_FARM_FACTORY_CHAIN_ID = 56 as const

/** Canonical MELEGA TREASURY WALLET — creation fee recipient. */
export const PUBLIC_FARM_FACTORY_FEE_RECIPIENT = MELEGA_TREASURY_FEE_DESTINATION

/**
 * Founder-approved eligibility attestation signer for v1.
 * Same EOA as MELEGA DEPLOYER — signs TVL attestations only (no KMS / no server signer).
 */
export const PUBLIC_FARM_ELIGIBILITY_SIGNER =
  '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0' as const

export const PUBLIC_FARM_MARCO_TOKEN = '0x963556de0eb8138E97A85F0A86eE0acD159D210b' as const
export const PUBLIC_FARM_PAIR_FACTORY = LB_MELEGA_AMM.factory

export const PUBLIC_FARM_DEFAULT_FEE_BNB = '0.25' as const
export const PUBLIC_FARM_DEFAULT_FEE_WEI = '250000000000000000' as const
export const PUBLIC_FARM_MINIMUM_TVL_BNB = '0.25' as const

export const PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT = {
  schema: 'melega.public-farm-factory.deployment.v1',
  chainId: PUBLIC_FARM_FACTORY_CHAIN_ID,
  /** Null until authorized mainnet deploy + verification. Do not fabricate. */
  factoryAddress: null as string | null,
  farmTemplate: 'PublicFarmTemplateV1',
  factoryContract: 'PublicFarmFactoryV1',
  packagePath: 'contracts/public-farm-factory/',
  feeRecipient: PUBLIC_FARM_FACTORY_FEE_RECIPIENT,
  marcoToken: PUBLIC_FARM_MARCO_TOKEN,
  pairFactory: PUBLIC_FARM_PAIR_FACTORY,
  eligibilitySigner: PUBLIC_FARM_ELIGIBILITY_SIGNER,
  feePolicy: {
    marcoPair: 'FREE' as const,
    otherwiseBnb: PUBLIC_FARM_DEFAULT_FEE_BNB,
    otherwiseWei: PUBLIC_FARM_DEFAULT_FEE_WEI,
    minimumTvlBnb: PUBLIC_FARM_MINIMUM_TVL_BNB,
    marcoReward: 'UNSUPPORTED' as const,
    lowLiquidityAction: 'REQUIRE_LIQUIDITY_INCREASE' as const,
  },
  deploymentTx: null as string | null,
  deploymentBlock: null as number | null,
  verified: false,
  /**
   * Execution path wired for Founder-signed CREATE.
   * factoryAddress stays null until live receipt validation + SSOT bind.
   * After Founder signature + receipt capture → AWAITING_VALIDATION (no fabricate / no premature bind).
   */
  status: 'AWAITING_VALIDATION' as const,
  certifiedArtifact: 'apps/web/src/lib/deployment-orchestrator/artifacts/pff-v1-certified.json',
  execution: {
    founderSignatureRequired: true,
    noKms: true,
    noServerSigner: true,
    noAutomaticBroadcast: true,
    cta: 'Deploy Public Farm Factory',
    uiPath: '/runtime/deployment/',
  },
} as const

export type PublicFarmFactoryDeployment = typeof PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT

export function getPublicFarmFactoryDeployment(): PublicFarmFactoryDeployment {
  return PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT
}

export function isPublicFarmFactoryBound(): boolean {
  return Boolean(PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.factoryAddress)
}
