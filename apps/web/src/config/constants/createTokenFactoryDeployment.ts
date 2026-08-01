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

export const CREATE_TOKEN_CANONICAL_DEPLOYMENT = {
  schema: 'melega.create-token.factory-deployment.v1',
  chainId: CREATE_TOKEN_FACTORY_CHAIN_ID,
  /** Null until authorized mainnet deploy + verification. Do not fabricate. */
  factoryAddress: null as string | null,
  feeRecipient: CREATE_TOKEN_FEE_RECIPIENT,
  /** Founder-approved immutable constructor input (not yet on-chain until deploy). */
  creationFeeWei: CREATE_TOKEN_CREATION_FEE_WEI as string | null,
  creationFeeDecision: 'APPROVED' as const,
  creationFeeBnb: CREATE_TOKEN_CREATION_FEE_BNB,
  feeScheduleRef: 'config/constants/fee-schedule.json#services.createToken',
  tokenTemplate: 'MelegaFixedSupplyToken',
  factoryContract: 'MelegaTokenFactory',
  deploymentTx: null as string | null,
  deploymentBlock: null as number | null,
  verified: false,
  /**
   * Package + Founder UI ready for MELEGA DEPLOYER signature.
   * factoryAddress stays null until live mainnet deploy + validation + bind.
   */
  status: 'READY_FOR_FOUNDER_SIGNATURE' as const,
} as const

export type CreateTokenFactoryDeployment = typeof CREATE_TOKEN_CANONICAL_DEPLOYMENT

export function getCreateTokenFactoryDeployment(): CreateTokenFactoryDeployment {
  return CREATE_TOKEN_CANONICAL_DEPLOYMENT
}

export function isCreateTokenFactoryBound(): boolean {
  return Boolean(CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress)
}
