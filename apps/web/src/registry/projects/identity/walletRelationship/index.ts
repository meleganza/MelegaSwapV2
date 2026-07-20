export {
  PROJECT_WALLET_RELATIONSHIP_SCHEMA_VERSION,
  PROJECT_PAGE_WALLET_RELATIONSHIP_SUPPORT_EXTENSION,
  WALLET_RELATIONSHIP_RESOLVER_REVISION,
  RELATIONSHIP_TYPES,
  LIVE_SUPPORTED_RELATIONSHIP_TYPES,
  WALLET_RELATIONSHIP_LIMITATIONS,
} from './schema'
export type {
  RelationshipType,
  RelationshipStatus,
  RelationshipAvailability,
  WalletConnectionState,
  RelationshipReasonCode,
} from './schema'

export type {
  WalletRelationshipRecord,
  ProjectWalletRelationshipDocument,
  LiveWalletObservation,
  LiveAssetBalanceFact,
  LiveLiquidityPositionFact,
  LiveFarmPositionFact,
  LivePoolPositionFact,
  WalletRelationshipSupportMetadata,
  RelevantCapability,
} from './types'

export {
  buildRelationshipId,
  normalizeWalletAccountInput,
  walletAccountFromAddressAndChain,
  toCaip10WalletAccount,
} from './ids'

export {
  buildWalletRelationshipDocument,
  buildWalletRelationshipSupportMetadata,
  disconnectedObservation,
} from './buildWalletRelationshipDocument'
