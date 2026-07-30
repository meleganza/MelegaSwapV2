/**
 * Canonical Create Token factory binding — single source of truth.
 * Do not scatter factory literals. Do not fabricate mainnet addresses.
 */

export const CREATE_TOKEN_FACTORY_CHAIN_ID = 56 as const

/** Canonical MELEGA TREASURY WALLET — creation fee recipient. */
export const CREATE_TOKEN_FEE_RECIPIENT = '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b' as const

/**
 * Founder-approved immutable constructor fee: 0.05 BNB (18 decimals).
 * CT_CREATION_FEE_WEI = 50000000000000000
 */
export const CREATE_TOKEN_CREATION_FEE_BNB = '0.05' as const
export const CREATE_TOKEN_CREATION_FEE_WEI = '50000000000000000' as const

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
