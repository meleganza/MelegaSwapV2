/**
 * Canonical Create Token factory binding — single source of truth.
 * Do not scatter factory literals. Do not fabricate mainnet addresses.
 */

export const CREATE_TOKEN_FACTORY_CHAIN_ID = 56 as const

/** Canonical MELEGA TREASURY WALLET — creation fee recipient. */
export const CREATE_TOKEN_FEE_RECIPIENT = '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b' as const

export const CREATE_TOKEN_CANONICAL_DEPLOYMENT = {
  schema: 'melega.create-token.factory-deployment.v1',
  chainId: CREATE_TOKEN_FACTORY_CHAIN_ID,
  /** Null until authorized mainnet deploy + verification. */
  factoryAddress: null as string | null,
  feeRecipient: CREATE_TOKEN_FEE_RECIPIENT,
  /** Null until Founder approves explicit wei amount for mainnet constructor. */
  creationFeeWei: null as string | null,
  creationFeeDecision: 'PENDING_FOUNDER_APPROVAL' as const,
  tokenTemplate: 'MelegaFixedSupplyToken',
  factoryContract: 'MelegaTokenFactory',
  deploymentTx: null as string | null,
  deploymentBlock: null as number | null,
  verified: false,
  status: 'DEPLOYMENT_BLOCKED' as const,
} as const

export type CreateTokenFactoryDeployment = typeof CREATE_TOKEN_CANONICAL_DEPLOYMENT

export function getCreateTokenFactoryDeployment(): CreateTokenFactoryDeployment {
  return CREATE_TOKEN_CANONICAL_DEPLOYMENT
}

export function isCreateTokenFactoryBound(): boolean {
  return Boolean(CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress)
}
