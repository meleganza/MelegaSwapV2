export type CollectiblesRuntimeErrorCode =
  | 'NO_COLLECTION'
  | 'NO_METADATA'
  | 'NO_OWNER'
  | 'NOT_ELIGIBLE'
  | 'IDENTITY_LOCKED'
  | 'MEMBERSHIP_EXPIRED'
  | 'PRIVILEGE_UNAVAILABLE'
  | 'NO_WALLET'
  | 'UNKNOWN'

export interface CollectiblesRuntimeError {
  code: CollectiblesRuntimeErrorCode
  message: string
}

const ERROR_CATALOG: Record<CollectiblesRuntimeErrorCode, string> = {
  NO_COLLECTION: 'No collectible collection is indexed in the registry.',
  NO_METADATA: 'Collection metadata is unavailable from registry or on-chain sources.',
  NO_OWNER: 'Wallet is not connected — ownership cannot be verified.',
  NOT_ELIGIBLE: 'Wallet is not eligible for this identity collectible.',
  IDENTITY_LOCKED: 'Identity collectible is locked for this wallet.',
  MEMBERSHIP_EXPIRED: 'Membership tier has expired or is not active.',
  PRIVILEGE_UNAVAILABLE: 'Requested privilege is not available for this collectible.',
  NO_WALLET: 'Connect a wallet to verify collectible ownership.',
  UNKNOWN: 'An unexpected error occurred in Collectibles runtime.',
}

export function createCollectiblesRuntimeError(code: CollectiblesRuntimeErrorCode): CollectiblesRuntimeError {
  return { code, message: ERROR_CATALOG[code] }
}
