/** Minimal fragments for LB Program / Factory reads + Founder activate writes. */

export const LB_PROGRAM_VIEW_ABI = [
  'function getProgramView() view returns (tuple(bytes32 schemaVersion, bytes32 programId, address factory, address owner, address projectToken, address quoteAsset, address pair, address lpRecipient, uint8 lifecycle, tuple(uint8 mode, uint16 minimumRateBps, uint16 maximumRateBps) strategy, uint32 epochDurationSeconds, uint64 configNonce, uint256 totalDepositedBudget, uint256 remainingBudget, uint256 tokensSold, uint256 tokensMatched, uint256 withdrawnUnusedBudget, uint256 quoteResidual, uint256 grossQuoteAcquired, uint256 totalFeePaid, uint256 totalQuoteAdded, uint256 totalLpMinted, uint256 executionCount, bool solvent, uint64 createdAt, uint64 activatedAt, uint64 pausedAt, uint64 stoppedAt))',
  'function latestExecution() view returns (tuple(bytes32 executionId, uint256 epochId, uint256 executionNonce, uint16 effectiveStrategyRateBps, uint256 eligibleNetBuyFlow, uint256 grossQuoteTarget, uint256 projectTokenSold, uint256 grossQuoteAcquired, uint256 feePaid, uint256 projectTokenMatched, uint256 quoteAssetAdded, uint256 quoteResidualAfter, uint256 lpMinted, address lpRecipient, bytes32 settlementReceipt, uint64 successBlock, uint64 successTimestamp, uint64 configNonceUsed))',
  'function depositBudget(uint256 amount)',
  'function activate()',
  'event BudgetDeposited(bytes32 indexed programId, uint256 amount, uint256 totalDeposited, uint64 configNonce)',
  'event ProgramActivated(bytes32 indexed programId, uint64 configNonce)',
] as const

export const LB_FACTORY_READ_ABI = [
  'function activeProgram(address owner, address projectToken, address quoteAsset, address pair) view returns (address)',
  'function getProgram(bytes32 programId) view returns (address)',
  'function melegaFactory() view returns (address)',
  'function melegaRouter() view returns (address)',
  'function isQuoteEnabled(address quoteAsset) view returns (bool)',
  'function quotePolicy(address quoteAsset) view returns (tuple(address asset, uint8 decimals, bool enabled, uint256 minimumGrossQuoteFloor, uint256 minimumQuoteReserve, uint8 gasConversionMode, address gasConversionReference))',
  'function successFeeBps() view returns (uint16)',
  'function predictProgramAddress(bytes32 programId) view returns (address)',
  'function computeBaseKey(address owner, address projectToken, address quoteAsset, address pair) pure returns (bytes32)',
  'function computeProgramId(bytes32 baseKey, uint64 generation) view returns (bytes32)',
  'function generationCount(address owner, address projectToken, address quoteAsset, address pair) view returns (uint64)',
] as const

export const LB_FACTORY_WRITE_ABI = [
  ...LB_FACTORY_READ_ABI,
  'function createProgram(address projectToken, address quoteAsset, address pair, tuple(uint8 mode, uint16 minimumRateBps, uint16 maximumRateBps) strategy, uint32 epochDurationSeconds) returns (address program, bytes32 programId)',
  'event ProgramCreated(bytes32 indexed programId, address indexed owner, address indexed program, address projectToken, address quoteAsset, address pair, uint64 generation, bytes32 factoryVersion)',
] as const

export const MELEGA_FACTORY_PAIR_ABI = [
  'function getPair(address tokenA, address tokenB) view returns (address pair)',
] as const

export const ERC20_APPROVE_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address account) view returns (uint256)',
] as const
