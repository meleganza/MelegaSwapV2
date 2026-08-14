/**
 * Canonical Create Token factory binding — single source of truth.
 * Do not scatter factory literals. Do not fabricate mainnet addresses.
 * Creation fee reads from Founder fee-schedule.json.
 */

import { CREATE_TOKEN_FEE_FROM_SCHEDULE, MELEGA_TREASURY_FEE_DESTINATION } from './feeSchedule'

export const CREATE_TOKEN_FACTORY_CHAIN_ID = 56 as const

/** Canonical MELEGA TREASURY WALLET — creation fee recipient. */
export const CREATE_TOKEN_FEE_RECIPIENT = MELEGA_TREASURY_FEE_DESTINATION

/**
 * Founder-approved immutable constructor fee: 0.10 BNB (18 decimals).
 * CT_CREATION_FEE_WEI = 100000000000000000
 * Supersedes prior 0.05 BNB certification.
 */
export const CREATE_TOKEN_CREATION_FEE_BNB = CREATE_TOKEN_FEE_FROM_SCHEDULE.bnb as '0.10'
export const CREATE_TOKEN_CREATION_FEE_WEI = CREATE_TOKEN_FEE_FROM_SCHEDULE.wei as '100000000000000000'

/** Factual mainnet CreateTokenFactoryV1 — validated against ct-v1-certified.json. */
export const CREATE_TOKEN_FACTORY_ADDRESS = '0x6DbB5d7162842dA94ef9172AedC8D148d203d311' as const
export const CREATE_TOKEN_FACTORY_DEPLOYMENT_TX =
  '0x79fe42294e6a43f0e16d09101f4ba6846977c0267a0fc1e6d237fa1441de79d8' as const
export const CREATE_TOKEN_FACTORY_DEPLOYMENT_BLOCK = 113510808 as const

export const CREATE_TOKEN_CANONICAL_DEPLOYMENT = {
  schema: 'melega.create-token.factory-deployment.v1',
  chainId: CREATE_TOKEN_FACTORY_CHAIN_ID,
  /** Bound after receipt + masked runtime hash + constructor validation. */
  factoryAddress: CREATE_TOKEN_FACTORY_ADDRESS as string | null,
  feeRecipient: CREATE_TOKEN_FEE_RECIPIENT,
  /** Founder-approved immutable constructor input — confirmed on-chain. */
  creationFeeWei: CREATE_TOKEN_CREATION_FEE_WEI as string | null,
  creationFeeDecision: 'APPROVED' as const,
  creationFeeBnb: CREATE_TOKEN_CREATION_FEE_BNB,
  feeScheduleRef: 'config/constants/fee-schedule.json#services.createToken',
  tokenTemplate: 'MelegaFixedSupplyToken',
  factoryContract: 'MelegaTokenFactory',
  deploymentTx: CREATE_TOKEN_FACTORY_DEPLOYMENT_TX as string | null,
  deploymentBlock: CREATE_TOKEN_FACTORY_DEPLOYMENT_BLOCK as number | null,
  verified: true,
  /**
   * Mainnet factory DEPLOYED · VALIDATED · BOUND · READY.
   * User Create Token unlocked via LIST_CREATE_TOKEN_AVAILABLE.
   */
  status: 'READY' as const,
} as const

export type CreateTokenFactoryDeployment = typeof CREATE_TOKEN_CANONICAL_DEPLOYMENT

export function getCreateTokenFactoryDeployment(): CreateTokenFactoryDeployment {
  return CREATE_TOKEN_CANONICAL_DEPLOYMENT
}

export function isCreateTokenFactoryBound(): boolean {
  return Boolean(CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress)
}
