/** Minimal fragments for LB Program / Factory reads — no full ABI dump. */

export const LB_PROGRAM_VIEW_ABI = [
  'function getProgramView() view returns (tuple(bytes32 schemaVersion, bytes32 programId, address factory, address owner, address projectToken, address quoteAsset, address pair, address lpRecipient, uint8 lifecycle, tuple(uint8 mode, uint16 minimumRateBps, uint16 maximumRateBps) strategy, uint32 epochDurationSeconds, uint64 configNonce, uint256 totalDepositedBudget, uint256 remainingBudget, uint256 tokensSold, uint256 tokensMatched, uint256 withdrawnUnusedBudget, uint256 quoteResidual, uint256 grossQuoteAcquired, uint256 totalFeePaid, uint256 totalQuoteAdded, uint256 totalLpMinted, uint256 executionCount, bool solvent, uint64 createdAt, uint64 activatedAt, uint64 pausedAt, uint64 stoppedAt))',
  'function latestExecution() view returns (tuple(bytes32 executionId, uint256 epochId, uint256 executionNonce, uint16 effectiveStrategyRateBps, uint256 eligibleNetBuyFlow, uint256 grossQuoteTarget, uint256 projectTokenSold, uint256 grossQuoteAcquired, uint256 feePaid, uint256 projectTokenMatched, uint256 quoteAssetAdded, uint256 quoteResidualAfter, uint256 lpMinted, address lpRecipient, bytes32 settlementReceipt, uint64 successBlock, uint64 successTimestamp, uint64 configNonceUsed))',
] as const

export const LB_FACTORY_READ_ABI = [
  'function activeProgram(address owner, address projectToken) view returns (address)',
  'function getProgram(bytes32 programId) view returns (address)',
  'function melegaFactory() view returns (address)',
  'function melegaRouter() view returns (address)',
] as const

export const MELEGA_FACTORY_PAIR_ABI = [
  'function getPair(address tokenA, address tokenB) view returns (address pair)',
] as const
