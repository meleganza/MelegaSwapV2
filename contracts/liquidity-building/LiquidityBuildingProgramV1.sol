// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import {
    ILiquidityBuildingFactoryV1,
    IMelegaV2Factory,
    IMelegaV2Pair,
    LBTypes
} from "./interfaces/ILiquidityBuildingFactoryV1.sol";
import { ILiquidityBuildingProgramV1 } from "./interfaces/ILiquidityBuildingProgramV1.sol";
import { ILiquidityBuildingExecutionAuthorizerV1 } from "./interfaces/ILiquidityBuildingExecutionAuthorizerV1.sol";
import { ILiquidityBuildingTreasuryFeeSinkV1 } from "./interfaces/ILiquidityBuildingTreasuryFeeSinkV1.sol";
import { IMelegaV2RouterMinimal } from "./interfaces/IMelegaV2RouterMinimal.sol";
import { LiquidityBuildingExecutionMathV1 as Math } from "./libraries/LiquidityBuildingExecutionMathV1.sol";

/**
 * @title LiquidityBuildingProgramV1
 * @notice Isolated custody + permissionless atomic Liquidity Building execution (LB005+LB007).
 * @dev Relayer has no economic authority. Compromised signer cannot bypass hard Program caps.
 */
contract LiquidityBuildingProgramV1 is ILiquidityBuildingProgramV1, Initializable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant PROGRAM_VIEW_SCHEMA = keccak256("LiquidityBuildingProgramViewV1");
    bytes32 public constant SAFETY_PROJECT_INSOLVENT = keccak256("PROJECT_INSOLVENT");
    bytes32 public constant SAFETY_QUOTE_RESIDUAL_INSOLVENT = keccak256("QUOTE_RESIDUAL_INSOLVENT");
    bytes32 public constant SAFETY_PAIR_MISMATCH = keccak256("PAIR_MISMATCH");
    bytes32 public constant SAFETY_INVALID_PAIR_TOKENS = keccak256("INVALID_PAIR_TOKENS");
    bytes32 public constant SAFETY_ZERO_RESERVES = keccak256("ZERO_RESERVES");

    uint256 private constant _ROLLING_BUCKETS = 25;

    error UnauthorizedOwner();
    error InvalidLifecycle();
    error ProgramIsStopped();
    error ZeroAddress();
    error ZeroAmount();
    error InvalidStrategy();
    error InvalidEpoch();
    error InvalidLpRecipient();
    error UnsupportedTokenBehavior();
    error InsufficientBudget();
    error InsolventProgram();
    error AccountingInvariantFailure();
    error ProgramNotActive();
    error IntentProgramMismatch();
    error IntentFactoryMismatch();
    error IntentFactoryVersionMismatch();
    error IntentPairMismatch();
    error IntentProjectTokenMismatch();
    error IntentQuoteAssetMismatch();
    error StaleConfigNonce();
    error SwapBalanceMismatch();
    error SwapReturnMismatch();
    error TreasuryFeeMismatch();
    error TreasurySettlementFailed();
    error SettlementReceiptInvalid();
    error PostSwapReserveMismatch();
    error AddLiquidityReturnMismatch();
    error LpMintMismatch();
    error LpMintZero();
    error QuoteConservationFailure();
    error BudgetConservationFailure();
    error AllowanceCleanupFailure();
    error ProgramInsolvent();
    error QuoteResidualInsolvent();
    error NoDeterministicSafetyCondition();
    error SafetyConditionStillActive();
    error FactoryBindingMismatch();
    error AnchorReserveInvalid();

    address public factory;
    bytes32 public programId;
    address private _owner;
    address public projectToken;
    address public quoteAsset;
    address public pair;
    address public lpRecipient;

    LBTypes.Lifecycle private _lifecycle;
    LBTypes.StrategyConfig private _strategy;
    uint32 public epochDurationSeconds;
    uint64 private _configNonce;
    uint16 public strategyCeilingBps;

    uint256 public totalDepositedBudget;
    uint256 public remainingBudget;
    uint256 public tokensSold;
    uint256 public tokensMatched;
    uint256 public withdrawnUnusedBudget;
    uint256 public quoteResidual;
    uint256 public grossQuoteAcquired;
    uint256 public totalFeePaid;
    uint256 public totalQuoteAdded;
    uint256 public totalLpMinted;
    uint256 public executionCount;

    uint64 public createdAt;
    uint64 public activatedAt;
    uint64 public pausedAt;
    uint64 public stoppedAt;
    uint64 public override lastSuccessfulExecutionTimestamp;
    uint64 public override lastSuccessfulExecutionBlock;

    mapping(bytes32 => bool) private _usedExecutionDigest;
    mapping(uint256 => bool) private _executedEpoch;
    uint64[_ROLLING_BUCKETS] private _bucketHourId;
    uint256[_ROLLING_BUCKETS] private _bucketConsumption;
    LatestExecution private _latestExecution;

    modifier onlyOwner() {
        if (msg.sender != _owner) revert UnauthorizedOwner();
        _;
    }

    modifier notStopped() {
        if (_lifecycle == LBTypes.Lifecycle.Stopped) revert ProgramIsStopped();
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address factory_,
        bytes32 programId_,
        address owner_,
        address projectToken_,
        address quoteAsset_,
        address pair_,
        address lpRecipient_,
        LBTypes.StrategyConfig calldata strategy_,
        uint32 epochDurationSeconds_,
        uint16 strategyCeilingBps_
    ) external initializer {
        if (factory_ == address(0) || owner_ == address(0) || projectToken_ == address(0) || quoteAsset_ == address(0))
        {
            revert ZeroAddress();
        }
        if (pair_ == address(0) || lpRecipient_ == address(0)) revert ZeroAddress();
        if (projectToken_ == quoteAsset_) revert InvalidStrategy();
        _validateEpoch(epochDurationSeconds_);
        _validateStrategy(strategy_, strategyCeilingBps_);
        factory = factory_;
        programId = programId_;
        _owner = owner_;
        projectToken = projectToken_;
        quoteAsset = quoteAsset_;
        pair = pair_;
        lpRecipient = lpRecipient_;
        _strategy = strategy_;
        epochDurationSeconds = epochDurationSeconds_;
        strategyCeilingBps = strategyCeilingBps_;
        _lifecycle = LBTypes.Lifecycle.Created;
        _configNonce = 1;
        createdAt = uint64(block.timestamp);
    }

    function owner() external view returns (address) {
        return _owner;
    }

    function lifecycle() external view returns (LBTypes.Lifecycle) {
        return _lifecycle;
    }

    function configNonce() external view returns (uint64) {
        return _configNonce;
    }

    function isSolvent() public view returns (bool) {
        return IERC20(projectToken).balanceOf(address(this)) >= remainingBudget;
    }

    function usedExecutionDigest(bytes32 executionId) external view returns (bool) {
        return _usedExecutionDigest[executionId];
    }

    function executedEpoch(uint256 epochId) external view returns (bool) {
        return _executedEpoch[epochId];
    }

    function nextExecutionNonce() external view returns (uint256) {
        return executionCount + 1;
    }

    function latestExecution() external view returns (LatestExecution memory) {
        return _latestExecution;
    }

    function rollingBucket(uint256 index) external view returns (HourlyBucketView memory) {
        require(index < _ROLLING_BUCKETS, "idx");
        return HourlyBucketView({ hourId: _bucketHourId[index], consumption: _bucketConsumption[index] });
    }

    function currentRollingConsumption() public view returns (uint256 total) {
        uint64 currentHour = uint64(block.timestamp / 1 hours);
        for (uint256 i = 0; i < _ROLLING_BUCKETS; i++) {
            uint64 hid = _bucketHourId[i];
            if (hid != 0 && hid <= currentHour && currentHour - hid < _ROLLING_BUCKETS) {
                total += _bucketConsumption[i];
            }
        }
    }

    function depositBudget(uint256 amount) external onlyOwner notStopped nonReentrant {
        if (_lifecycle != LBTypes.Lifecycle.Created) revert InvalidLifecycle();
        if (amount == 0) revert ZeroAmount();
        _pullExact(amount);
        totalDepositedBudget += amount;
        remainingBudget += amount;
        _lifecycle = LBTypes.Lifecycle.Ready;
        _bumpNonce();
        _assertBudgetInvariant();
        if (!isSolvent()) revert InsolventProgram();
        emit BudgetDeposited(programId, amount, totalDepositedBudget, _configNonce);
    }

    function addBudget(uint256 amount) external onlyOwner notStopped nonReentrant {
        LBTypes.Lifecycle life = _lifecycle;
        if (
            life != LBTypes.Lifecycle.Ready && life != LBTypes.Lifecycle.Active && life != LBTypes.Lifecycle.Paused
                && life != LBTypes.Lifecycle.SafetyPaused
        ) revert InvalidLifecycle();
        if (amount == 0) revert ZeroAmount();
        _pullExact(amount);
        totalDepositedBudget += amount;
        remainingBudget += amount;
        _bumpNonce();
        _assertBudgetInvariant();
        if (!isSolvent()) revert InsolventProgram();
        emit BudgetAdded(programId, amount, totalDepositedBudget, _configNonce);
    }

    function activate() external onlyOwner notStopped {
        if (_lifecycle != LBTypes.Lifecycle.Ready) revert InvalidLifecycle();
        if (remainingBudget == 0) revert InsufficientBudget();
        if (!isSolvent()) revert InsolventProgram();
        _lifecycle = LBTypes.Lifecycle.Active;
        activatedAt = uint64(block.timestamp);
        _bumpNonce();
        emit ProgramActivated(programId, _configNonce);
    }

    function pause() external onlyOwner notStopped {
        if (_lifecycle != LBTypes.Lifecycle.Active) revert InvalidLifecycle();
        _lifecycle = LBTypes.Lifecycle.Paused;
        pausedAt = uint64(block.timestamp);
        _bumpNonce();
        emit ProgramPaused(programId, _configNonce);
    }

    function resume() external onlyOwner notStopped {
        if (_lifecycle != LBTypes.Lifecycle.Paused) revert InvalidLifecycle();
        _lifecycle = LBTypes.Lifecycle.Active;
        pausedAt = 0;
        _bumpNonce();
        emit ProgramResumed(programId, _configNonce);
    }

    function updateStrategy(LBTypes.StrategyConfig calldata strategy_) external onlyOwner notStopped {
        LBTypes.Lifecycle life = _lifecycle;
        if (
            life != LBTypes.Lifecycle.Active && life != LBTypes.Lifecycle.Paused && life != LBTypes.Lifecycle.Ready
                && life != LBTypes.Lifecycle.Created
        ) revert InvalidLifecycle();
        _validateStrategy(strategy_, strategyCeilingBps);
        _strategy = strategy_;
        _bumpNonce();
        emit StrategyUpdated(
            programId, strategy_.mode, strategy_.minimumRateBps, strategy_.maximumRateBps, _configNonce
        );
    }

    function updateEpochDuration(uint32 seconds_) external onlyOwner notStopped {
        LBTypes.Lifecycle life = _lifecycle;
        if (
            life != LBTypes.Lifecycle.Active && life != LBTypes.Lifecycle.Paused && life != LBTypes.Lifecycle.Ready
                && life != LBTypes.Lifecycle.Created
        ) revert InvalidLifecycle();
        _validateEpoch(seconds_);
        epochDurationSeconds = seconds_;
        _bumpNonce();
        emit EpochDurationUpdated(programId, seconds_, _configNonce);
    }

    function updateLpRecipient(address newRecipient) external onlyOwner notStopped {
        if (newRecipient == address(0)) revert InvalidLpRecipient();
        LBTypes.Lifecycle life = _lifecycle;
        if (
            life != LBTypes.Lifecycle.Created && life != LBTypes.Lifecycle.Ready && life != LBTypes.Lifecycle.Paused
                && life != LBTypes.Lifecycle.SafetyPaused
        ) revert InvalidLifecycle();
        lpRecipient = newRecipient;
        _bumpNonce();
        emit LpRecipientUpdated(programId, newRecipient, _configNonce);
    }

    function withdrawUnusedBudget(uint256 amount) external onlyOwner notStopped nonReentrant {
        LBTypes.Lifecycle life = _lifecycle;
        if (
            life != LBTypes.Lifecycle.Ready && life != LBTypes.Lifecycle.Paused
                && life != LBTypes.Lifecycle.SafetyPaused
        ) revert InvalidLifecycle();
        if (amount == 0) revert ZeroAmount();
        if (amount > remainingBudget) revert InsufficientBudget();
        if (!isSolvent()) revert InsolventProgram();
        remainingBudget -= amount;
        withdrawnUnusedBudget += amount;
        _bumpNonce();
        _assertBudgetInvariant();
        _pushExact(projectToken, _owner, amount);
        emit BudgetWithdrawn(programId, amount, remainingBudget, _configNonce);
    }

    function stop() external onlyOwner {
        if (_lifecycle == LBTypes.Lifecycle.Stopped) revert ProgramIsStopped();
        _lifecycle = LBTypes.Lifecycle.Stopped;
        stoppedAt = uint64(block.timestamp);
        _bumpNonce();
        emit ProgramStopped(programId, _configNonce);
    }

    function withdrawStoppedAssets() external onlyOwner nonReentrant {
        if (_lifecycle != LBTypes.Lifecycle.Stopped) revert InvalidLifecycle();
        uint256 projectAmt = remainingBudget;
        uint256 quoteAmt = quoteResidual;
        if (projectAmt > 0) {
            if (!isSolvent()) revert InsolventProgram();
            remainingBudget = 0;
            withdrawnUnusedBudget += projectAmt;
            _assertBudgetInvariant();
            _pushExact(projectToken, _owner, projectAmt);
            emit BudgetWithdrawn(programId, projectAmt, 0, _configNonce);
        }
        if (quoteAmt > 0) {
            quoteResidual = 0;
            _pushExact(quoteAsset, _owner, quoteAmt);
            emit QuoteResidualWithdrawn(programId, quoteAmt);
        }
    }

    function triggerDeterministicSafetyPause() external nonReentrant {
        bytes32 reason = _detectSafetyReason();
        if (reason == bytes32(0)) revert NoDeterministicSafetyCondition();
        if (_lifecycle == LBTypes.Lifecycle.Stopped) revert ProgramIsStopped();
        _lifecycle = LBTypes.Lifecycle.SafetyPaused;
        pausedAt = uint64(block.timestamp);
        _bumpNonce();
        emit ProgramSafetyPaused(programId, reason, msg.sender, _configNonce);
    }

    function clearDeterministicSafetyPause() external onlyOwner notStopped {
        if (_lifecycle != LBTypes.Lifecycle.SafetyPaused) revert InvalidLifecycle();
        if (_detectSafetyReason() != bytes32(0)) revert SafetyConditionStillActive();
        _lifecycle = LBTypes.Lifecycle.Paused;
        _bumpNonce();
        emit ProgramSafetyCleared(programId, _configNonce);
    }

    function executeLiquidityBuilding(
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 calldata intent,
        bytes calldata signature
    ) external nonReentrant returns (bytes32 executionId, bytes32 settlementReceipt, uint256 lpMinted) {
        if (_lifecycle != LBTypes.Lifecycle.Active) revert ProgramNotActive();

        ILiquidityBuildingFactoryV1 fac = ILiquidityBuildingFactoryV1(factory);
        LBTypes.ProtocolParameters memory params = fac.protocolParameters();
        address router = fac.melegaRouter();
        address sink = fac.treasuryFeeSink();

        executionId = ILiquidityBuildingExecutionAuthorizerV1(fac.executionAuthorizer())
            .validateExecutionIntent(intent, signature);
        _validateBinding(intent, fac);

        Math.validateReplayAndEpoch(
            intent.epochStartTimestamp,
            intent.epochEndTimestamp,
            intent.epochId,
            intent.decisionDeadline,
            intent.observationStartBlock,
            intent.observationEndBlock,
            intent.anchorBlock,
            epochDurationSeconds,
            intent.executionNonce,
            executionCount,
            _usedExecutionDigest[executionId],
            _executedEpoch[intent.epochId],
            params.initialFinalityDepth,
            block.number,
            block.timestamp
        );

        (uint256 liveX, uint256 liveY) = _readOrientedReserves();
        Math.validateAnchorAndDrift(
            intent.anchorProjectReserve, intent.anchorQuoteReserve, liveX, liveY, params.decisionExecutionDriftBps
        );
        Math.validateStrategyAndFlow(
            intent.eligibleNetBuyFlow,
            intent.effectiveStrategyRateBps,
            intent.strategyMode,
            uint8(_strategy.mode),
            strategyCeilingBps,
            _strategy.minimumRateBps,
            _strategy.maximumRateBps,
            intent.grossQuoteTarget
        );
        LBTypes.QuoteAssetPolicy memory qp = fac.quotePolicy(quoteAsset);
        Math.validateQuotePolicy(
            qp.enabled,
            uint8(qp.gasConversionMode),
            intent.grossQuoteTarget,
            qp.minimumGrossQuoteFloor,
            liveY,
            qp.minimumQuoteReserve
        );

        Math.Plan memory plan = Math.buildPlan(
            intent.grossQuoteTarget,
            intent.maximumProjectTokenIn,
            liveX,
            liveY,
            intent.anchorProjectReserve,
            intent.anchorQuoteReserve,
            remainingBudget,
            quoteResidual,
            params.hardSlippageBps,
            params.hardCurveImpactBps,
            params.hardEffectiveDeviationBps,
            params.swapSlippageOperatingBps
        );
        Math.validateCaps(
            plan.plannedConsumption,
            remainingBudget,
            totalDepositedBudget,
            currentRollingConsumption(),
            params.remainingBudgetEpochCapBps,
            params.totalBudgetEpochCapBps,
            params.rolling24hTotalBudgetCapBps
        );

        _usedExecutionDigest[executionId] = true;
        _executedEpoch[intent.epochId] = true;

        (uint256 sold, uint256 gross) =
            _executeSwap(intent.grossQuoteTarget, plan.requiredIn, intent.decisionDeadline, router);
        settlementReceipt = _settleFee(executionId, intent.treasuryAuthorizationReference, plan.fee, gross, sink);

        (uint256 postX, uint256 postY) = _readOrientedReserves();
        if (postX != liveX + sold || postY != liveY - gross) revert PostSwapReserveMismatch();

        uint256 matched;
        uint256 quoteAdded;
        (matched, quoteAdded, lpMinted) = _addLiquidity(
            plan.desiredProjectForLiq, plan.quoteForLiq, plan.projectMin, plan.quoteMin, intent.decisionDeadline, router
        );

        uint256 priorResidual = quoteResidual;
        uint256 newResidual = priorResidual + (gross - plan.fee) - quoteAdded;
        if (priorResidual + gross != plan.fee + quoteAdded + newResidual) revert QuoteConservationFailure();
        if (IERC20(quoteAsset).balanceOf(address(this)) < newResidual) revert QuoteResidualInsolvent();

        remainingBudget -= (sold + matched);
        tokensSold += sold;
        tokensMatched += matched;
        grossQuoteAcquired += gross;
        totalFeePaid += plan.fee;
        totalQuoteAdded += quoteAdded;
        totalLpMinted += lpMinted;
        quoteResidual = newResidual;
        executionCount += 1;
        _recordRolling(sold + matched);
        lastSuccessfulExecutionTimestamp = uint64(block.timestamp);
        lastSuccessfulExecutionBlock = uint64(block.number);

        _latestExecution = LatestExecution({
            executionId: executionId,
            epochId: intent.epochId,
            executionNonce: intent.executionNonce,
            effectiveStrategyRateBps: intent.effectiveStrategyRateBps,
            eligibleNetBuyFlow: intent.eligibleNetBuyFlow,
            grossQuoteTarget: intent.grossQuoteTarget,
            projectTokenSold: sold,
            grossQuoteAcquired: gross,
            feePaid: plan.fee,
            projectTokenMatched: matched,
            quoteAssetAdded: quoteAdded,
            quoteResidualAfter: newResidual,
            lpMinted: lpMinted,
            lpRecipient: lpRecipient,
            settlementReceipt: settlementReceipt,
            successBlock: uint64(block.number),
            successTimestamp: uint64(block.timestamp),
            configNonceUsed: _configNonce
        });

        _assertBudgetInvariant();
        if (!isSolvent()) revert ProgramInsolvent();
        if (sold + matched > plan.plannedConsumption) revert BudgetConservationFailure();

        emit ExecutionCompleted(
            executionId,
            intent.epochId,
            msg.sender,
            intent.executionNonce,
            intent.effectiveStrategyRateBps,
            intent.eligibleNetBuyFlow,
            sold,
            gross,
            plan.fee,
            matched,
            quoteAdded,
            newResidual,
            lpMinted,
            lpRecipient,
            settlementReceipt
        );
    }

    function getProgramView() external view returns (ProgramView memory v) {
        v = ProgramView({
            schemaVersion: PROGRAM_VIEW_SCHEMA,
            programId: programId,
            factory: factory,
            owner: _owner,
            projectToken: projectToken,
            quoteAsset: quoteAsset,
            pair: pair,
            lpRecipient: lpRecipient,
            lifecycle: _lifecycle,
            strategy: _strategy,
            epochDurationSeconds: epochDurationSeconds,
            configNonce: _configNonce,
            totalDepositedBudget: totalDepositedBudget,
            remainingBudget: remainingBudget,
            tokensSold: tokensSold,
            tokensMatched: tokensMatched,
            withdrawnUnusedBudget: withdrawnUnusedBudget,
            quoteResidual: quoteResidual,
            grossQuoteAcquired: grossQuoteAcquired,
            totalFeePaid: totalFeePaid,
            totalQuoteAdded: totalQuoteAdded,
            totalLpMinted: totalLpMinted,
            executionCount: executionCount,
            solvent: isSolvent(),
            createdAt: createdAt,
            activatedAt: activatedAt,
            pausedAt: pausedAt,
            stoppedAt: stoppedAt
        });
    }

    function _validateBinding(
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 calldata intent,
        ILiquidityBuildingFactoryV1 fac
    ) internal view {
        if (intent.chainId != block.chainid || intent.program != address(this)) {
            revert IntentProgramMismatch();
        }
        if (intent.factory != factory) revert IntentFactoryMismatch();
        if (intent.factoryVersion != fac.factoryVersion()) revert IntentFactoryVersionMismatch();
        if (intent.pair != pair) revert IntentPairMismatch();
        if (intent.projectToken != projectToken) revert IntentProjectTokenMismatch();
        if (intent.quoteAsset != quoteAsset) revert IntentQuoteAssetMismatch();
        if (intent.configNonce != _configNonce) revert StaleConfigNonce();
        if (!fac.isRegisteredProgram(address(this)) || fac.getProgram(programId) != address(this)) {
            revert FactoryBindingMismatch();
        }
        if (IMelegaV2Factory(fac.melegaFactory()).getPair(projectToken, quoteAsset) != pair) {
            revert FactoryBindingMismatch();
        }
        IMelegaV2Pair p = IMelegaV2Pair(pair);
        address t0 = p.token0();
        address t1 = p.token1();
        if (!((t0 == projectToken && t1 == quoteAsset) || (t0 == quoteAsset && t1 == projectToken))) {
            revert FactoryBindingMismatch();
        }
    }

    function _readOrientedReserves() internal view returns (uint256 projectReserve, uint256 quoteReserve) {
        IMelegaV2Pair p = IMelegaV2Pair(pair);
        address t0 = p.token0();
        (uint112 r0, uint112 r1,) = p.getReserves();
        if (r0 == 0 || r1 == 0) revert AnchorReserveInvalid();
        if (t0 == projectToken) {
            projectReserve = r0;
            quoteReserve = r1;
        } else if (t0 == quoteAsset) {
            projectReserve = r1;
            quoteReserve = r0;
        } else {
            revert IntentPairMismatch();
        }
    }

    function _executeSwap(uint256 amountOut, uint256 amountInMax, uint64 deadline, address router)
        internal
        returns (uint256 sold, uint256 gross)
    {
        IERC20 project = IERC20(projectToken);
        IERC20 quote = IERC20(quoteAsset);
        uint256 projectBefore = project.balanceOf(address(this));
        uint256 quoteBefore = quote.balanceOf(address(this));
        project.forceApprove(router, amountInMax);
        address[] memory path = new address[](2);
        path[0] = projectToken;
        path[1] = quoteAsset;
        uint256[] memory amounts = IMelegaV2RouterMinimal(router)
            .swapTokensForExactTokens(amountOut, amountInMax, path, address(this), deadline);
        _clearAllowance(project, router);
        sold = projectBefore - project.balanceOf(address(this));
        gross = quote.balanceOf(address(this)) - quoteBefore;
        if (amounts.length < 2 || amounts[0] != sold || amounts[1] != gross) revert SwapReturnMismatch();
        if (sold != amountInMax || gross != amountOut) revert SwapBalanceMismatch();
    }

    function _settleFee(bytes32 executionId, bytes32 authRef, uint256 expectedFee, uint256 gross, address sink)
        internal
        returns (bytes32 receipt)
    {
        uint256 actualFee = Math.melegaSuccessFee(gross);
        if (actualFee != expectedFee) revert TreasuryFeeMismatch();
        IERC20 quote = IERC20(quoteAsset);
        uint256 beforeBal = quote.balanceOf(address(this));
        quote.forceApprove(sink, actualFee);
        try ILiquidityBuildingTreasuryFeeSinkV1(sink)
            .settleLiquidityBuildingFee(programId, executionId, quoteAsset, actualFee, authRef) returns (
            bytes32 r
        ) {
            receipt = r;
        } catch {
            revert TreasurySettlementFailed();
        }
        _clearAllowance(quote, sink);
        if (beforeBal - quote.balanceOf(address(this)) != actualFee) revert TreasuryFeeMismatch();
        if (receipt == bytes32(0)) revert SettlementReceiptInvalid();
    }

    function _addLiquidity(
        uint256 projectDesired,
        uint256 quoteDesired,
        uint256 projectMin,
        uint256 quoteMin,
        uint64 deadline,
        address router
    ) internal returns (uint256 matched, uint256 quoteAdded, uint256 mint) {
        address recipient = lpRecipient;
        IERC20 project = IERC20(projectToken);
        IERC20 quote = IERC20(quoteAsset);
        IMelegaV2Pair pairToken = IMelegaV2Pair(pair);
        uint256 projectBefore = project.balanceOf(address(this));
        uint256 quoteBefore = quote.balanceOf(address(this));
        uint256 lpBefore = pairToken.balanceOf(recipient);
        project.forceApprove(router, projectDesired);
        quote.forceApprove(router, quoteDesired);
        (uint256 amountA, uint256 amountB, uint256 liquidity) = IMelegaV2RouterMinimal(router)
            .addLiquidity(
                projectToken, quoteAsset, projectDesired, quoteDesired, projectMin, quoteMin, recipient, deadline
            );
        _clearAllowance(project, router);
        _clearAllowance(quote, router);
        matched = projectBefore - project.balanceOf(address(this));
        quoteAdded = quoteBefore - quote.balanceOf(address(this));
        mint = pairToken.balanceOf(recipient) - lpBefore;
        if (amountA != matched || amountB != quoteAdded || liquidity != mint) revert AddLiquidityReturnMismatch();
        if (mint == 0) revert LpMintZero();
        if (mint != liquidity) revert LpMintMismatch();
        if (matched < projectMin || quoteAdded < quoteMin) revert AddLiquidityReturnMismatch();
        if (matched > projectDesired || quoteAdded > quoteDesired) revert AddLiquidityReturnMismatch();
    }

    function _clearAllowance(IERC20 token, address spender) internal {
        if (token.allowance(address(this), spender) != 0) {
            token.forceApprove(spender, 0);
            if (token.allowance(address(this), spender) != 0) revert AllowanceCleanupFailure();
        }
    }

    function _recordRolling(uint256 consumption) internal {
        uint64 currentHour = uint64(block.timestamp / 1 hours);
        uint256 idx = currentHour % _ROLLING_BUCKETS;
        if (_bucketHourId[idx] != currentHour) {
            _bucketHourId[idx] = currentHour;
            _bucketConsumption[idx] = consumption;
        } else {
            _bucketConsumption[idx] += consumption;
        }
    }

    function _detectSafetyReason() internal view returns (bytes32) {
        if (IERC20(projectToken).balanceOf(address(this)) < remainingBudget) return SAFETY_PROJECT_INSOLVENT;
        if (IERC20(quoteAsset).balanceOf(address(this)) < quoteResidual) return SAFETY_QUOTE_RESIDUAL_INSOLVENT;
        if (
            IMelegaV2Factory(ILiquidityBuildingFactoryV1(factory).melegaFactory()).getPair(projectToken, quoteAsset)
                != pair
        ) {
            return SAFETY_PAIR_MISMATCH;
        }
        IMelegaV2Pair p = IMelegaV2Pair(pair);
        address t0 = p.token0();
        address t1 = p.token1();
        if (!((t0 == projectToken && t1 == quoteAsset) || (t0 == quoteAsset && t1 == projectToken))) {
            return SAFETY_INVALID_PAIR_TOKENS;
        }
        (uint112 r0, uint112 r1,) = p.getReserves();
        if (r0 == 0 || r1 == 0) return SAFETY_ZERO_RESERVES;
        return bytes32(0);
    }

    function _pullExact(uint256 amount) internal {
        IERC20 token = IERC20(projectToken);
        uint256 beforeBal = token.balanceOf(address(this));
        token.safeTransferFrom(_owner, address(this), amount);
        if (token.balanceOf(address(this)) - beforeBal != amount) revert UnsupportedTokenBehavior();
    }

    function _pushExact(address token, address to, uint256 amount) internal {
        IERC20 t = IERC20(token);
        uint256 beforeBal = t.balanceOf(address(this));
        uint256 beforeTo = t.balanceOf(to);
        t.safeTransfer(to, amount);
        if (beforeBal - t.balanceOf(address(this)) != amount) revert UnsupportedTokenBehavior();
        if (t.balanceOf(to) - beforeTo != amount) revert UnsupportedTokenBehavior();
    }

    function _bumpNonce() internal {
        unchecked {
            _configNonce += 1;
        }
    }

    function _assertBudgetInvariant() internal view {
        if (remainingBudget + tokensSold + tokensMatched + withdrawnUnusedBudget != totalDepositedBudget) {
            revert AccountingInvariantFailure();
        }
    }

    function _validateEpoch(uint32 seconds_) internal pure {
        if (!(seconds_ == 300 || seconds_ == 900 || seconds_ == 1800 || seconds_ == 3600)) revert InvalidEpoch();
    }

    function _validateStrategy(LBTypes.StrategyConfig calldata s, uint16 ceiling) internal pure {
        if (s.mode == LBTypes.StrategyMode.FullAi) {
            if (s.minimumRateBps != 0 || s.maximumRateBps != 0) revert InvalidStrategy();
            return;
        }
        if (s.mode != LBTypes.StrategyMode.DynamicRange) revert InvalidStrategy();
        if (s.minimumRateBps == 0 || s.maximumRateBps < s.minimumRateBps || s.maximumRateBps > ceiling) {
            revert InvalidStrategy();
        }
    }
}
