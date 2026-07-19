// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { LBTypes } from "../interfaces/ILiquidityBuildingFactoryV1.sol";

/**
 * @title LiquidityBuildingExecutionMathV1
 * @notice Pure LB003/Melega V2 math + plan builders (external to keep Program under EIP-170).
 */
library LiquidityBuildingExecutionMathV1 {
    uint256 internal constant FEE_NUMERATOR = 9975;
    uint256 internal constant FEE_DENOMINATOR = 10_000;
    uint256 internal constant SUCCESS_FEE_BPS = 500;
    uint256 internal constant BPS = 10_000;

    error MathZeroInput();
    error MathZeroReserves();
    error MathInsufficientLiquidity();
    error InvalidExactOutput();
    error SignedMaximumInputInvalid();
    error MaximumInputExceeded();
    error CurvePriceImpactExceeded();
    error EffectiveDeviationExceeded();
    error InsufficientBudget();
    error CurrentNetQuoteCannotBeMatched();
    error EpochBudgetCapExceeded();
    error RollingBudgetCapExceeded();
    error EligibleFlowZero();
    error StrategyModeMismatch();
    error StrategyRateOutOfBounds();
    error GrossTargetZero();
    error GrossTargetExceedsEligibleFlow();
    error QuoteAssetNotActive();
    error GrossQuoteBelowFloor();
    error QuoteReserveBelowFloor();
    error GasConversionNotActive();
    error AnchorReserveInvalid();
    error ReserveDriftExceeded();
    error ReserveReductionExceeded();
    error InvalidEpochIdentity();
    error EpochNotFinalized();
    error DecisionExpired();
    error ObservationFinalityInsufficient();
    error InvalidExecutionNonce();
    error ExecutionAlreadyUsed();
    error EpochAlreadyExecuted();

    struct OrientedReserves {
        uint256 projectReserve;
        uint256 quoteReserve;
    }

    struct Plan {
        uint256 requiredIn;
        uint256 fee;
        uint256 netCurrentQuote;
        uint256 projectForCurrentNet;
        uint256 priorResidualSelected;
        uint256 quoteForLiq;
        uint256 desiredProjectForLiq;
        uint256 plannedConsumption;
        uint256 projectMin;
        uint256 quoteMin;
    }

    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut)
        public
        pure
        returns (uint256 amountIn)
    {
        if (amountOut == 0) revert MathZeroInput();
        if (reserveIn == 0 || reserveOut == 0) revert MathZeroReserves();
        if (amountOut >= reserveOut) revert MathInsufficientLiquidity();
        amountIn = (reserveIn * amountOut * FEE_DENOMINATOR) / ((reserveOut - amountOut) * FEE_NUMERATOR) + 1;
    }

    function melegaSuccessFee(uint256 grossQuoteAcquired) public pure returns (uint256) {
        return (grossQuoteAcquired * SUCCESS_FEE_BPS) / BPS;
    }

    function ceilDiv(uint256 a, uint256 b) public pure returns (uint256) {
        if (b == 0) revert MathZeroInput();
        return a == 0 ? 0 : (a + b - 1) / b;
    }

    function curvePriceImpactBps(uint256 dx, uint256 X, uint256 Y) public pure returns (uint256) {
        if (X == 0) revert MathZeroReserves();
        uint256 spot = (dx * Y) / X;
        if (spot == 0) revert MathZeroInput();
        uint256 curve = (dx * Y) / (X + dx);
        if (curve >= spot) return 0;
        return ceilDiv((spot - curve) * BPS, spot);
    }

    function effectiveDeviationBps(uint256 dx, uint256 X, uint256 Y, uint256 actualQuoteOut)
        public
        pure
        returns (uint256)
    {
        if (X == 0) revert MathZeroReserves();
        uint256 spot = (dx * Y) / X;
        if (spot == 0) revert MathZeroInput();
        if (actualQuoteOut >= spot) return 0;
        return ceilDiv((spot - actualQuoteOut) * BPS, spot);
    }

    function reservePriceDriftBps(uint256 X, uint256 Y, uint256 X2, uint256 Y2) public pure returns (uint256) {
        if (X == 0 || Y == 0 || X2 == 0 || Y2 == 0) revert MathZeroReserves();
        uint256 left = X2 * Y;
        uint256 right = X * Y2;
        uint256 diff = left > right ? left - right : right - left;
        return ceilDiv(diff * BPS, X * Y);
    }

    function reserveReductionExceeded(uint256 anchor, uint256 current, uint256 maxBps) public pure returns (bool) {
        if (anchor == 0) revert MathZeroReserves();
        return current * BPS < anchor * (BPS - maxBps);
    }

    function candidateGrossQuoteTarget(uint256 eligibleNetBuyFlow, uint256 rateBps) public pure returns (uint256) {
        return (eligibleNetBuyFlow * rateBps) / BPS;
    }

    function matchedProjectForQuote(uint256 quoteAmount, uint256 X1, uint256 Y1) public pure returns (uint256) {
        if (Y1 == 0) revert MathZeroReserves();
        return (quoteAmount * X1) / Y1;
    }

    function hardMaximumProjectTokenIn(uint256 anchorRequiredIn, uint256 hardSlippageBps)
        public
        pure
        returns (uint256)
    {
        return ceilDiv(anchorRequiredIn * (BPS + hardSlippageBps), BPS);
    }

    function amountMinWithSlippage(uint256 desired, uint256 operatingSlippageBps) public pure returns (uint256) {
        return (desired * (BPS - operatingSlippageBps)) / BPS;
    }

    function validateReplayAndEpoch(
        uint64 epochStart,
        uint64 epochEnd,
        uint256 epochId,
        uint64 decisionDeadline,
        uint64 observationStart,
        uint64 observationEnd,
        uint64 anchorBlock,
        uint32 epochDuration,
        uint256 executionNonce,
        uint256 executionCount,
        bool digestUsed,
        bool epochUsed,
        uint16 finalityDepth,
        uint256 blockNumber,
        uint256 blockTimestamp
    ) external pure {
        if (digestUsed) revert ExecutionAlreadyUsed();
        if (epochUsed) revert EpochAlreadyExecuted();
        if (executionNonce != executionCount + 1) revert InvalidExecutionNonce();
        if (epochEnd <= epochStart || epochEnd - epochStart != epochDuration) revert InvalidEpochIdentity();
        if (epochStart % epochDuration != 0) revert InvalidEpochIdentity();
        if (epochId != epochStart / epochDuration) revert InvalidEpochIdentity();
        if (blockTimestamp < epochEnd) revert EpochNotFinalized();
        if (blockTimestamp > decisionDeadline) revert DecisionExpired();
        if (observationStart > observationEnd || observationEnd > anchorBlock) revert InvalidEpochIdentity();
        if (anchorBlock >= blockNumber || blockNumber < uint256(anchorBlock) + uint256(finalityDepth)) {
            revert ObservationFinalityInsufficient();
        }
    }

    function validateAnchorAndDrift(
        uint256 anchorProject,
        uint256 anchorQuote,
        uint256 liveProject,
        uint256 liveQuote,
        uint16 driftBps
    ) external pure {
        if (anchorProject == 0 || anchorQuote == 0) revert AnchorReserveInvalid();
        if (reservePriceDriftBps(anchorProject, anchorQuote, liveProject, liveQuote) > driftBps) {
            revert ReserveDriftExceeded();
        }
        if (reserveReductionExceeded(anchorProject, liveProject, driftBps)) revert ReserveReductionExceeded();
        if (reserveReductionExceeded(anchorQuote, liveQuote, driftBps)) revert ReserveReductionExceeded();
    }

    function validateStrategyAndFlow(
        uint256 eligibleNetBuyFlow,
        uint16 effectiveRateBps,
        uint8 intentMode,
        uint8 programMode,
        uint16 ceilingBps,
        uint16 ownerMinBps,
        uint16 ownerMaxBps,
        uint256 grossQuoteTarget
    ) external pure {
        if (eligibleNetBuyFlow == 0) revert EligibleFlowZero();
        if (effectiveRateBps == 0 || effectiveRateBps > ceilingBps) revert StrategyRateOutOfBounds();
        if (intentMode != programMode) revert StrategyModeMismatch();
        if (programMode == uint8(LBTypes.StrategyMode.DynamicRange)) {
            if (effectiveRateBps < ownerMinBps || effectiveRateBps > ownerMaxBps) revert StrategyRateOutOfBounds();
        }
        uint256 candidate = candidateGrossQuoteTarget(eligibleNetBuyFlow, effectiveRateBps);
        if (grossQuoteTarget == 0) revert GrossTargetZero();
        if (grossQuoteTarget > candidate) revert GrossTargetExceedsEligibleFlow();
    }

    function validateQuotePolicy(
        bool enabled,
        uint8 gasMode,
        uint256 grossQuoteTarget,
        uint256 minimumGrossQuoteFloor,
        uint256 liveQuoteReserve,
        uint256 minimumQuoteReserve
    ) external pure {
        if (!enabled) revert QuoteAssetNotActive();
        if (gasMode == uint8(LBTypes.GasConversionMode.NotActive)) revert GasConversionNotActive();
        if (grossQuoteTarget < minimumGrossQuoteFloor) revert GrossQuoteBelowFloor();
        if (liveQuoteReserve < minimumQuoteReserve) revert QuoteReserveBelowFloor();
    }

    function buildPlan(
        uint256 G,
        uint256 maximumProjectTokenIn,
        uint256 liveProject,
        uint256 liveQuote,
        uint256 anchorProject,
        uint256 anchorQuote,
        uint256 remainingBudget,
        uint256 quoteResidual,
        uint16 hardSlippageBps,
        uint16 hardCurveImpactBps,
        uint16 hardEffectiveDeviationBps,
        uint16 operatingSlippageBps
    ) external pure returns (Plan memory plan) {
        if (G >= liveQuote) revert InvalidExactOutput();
        plan.requiredIn = getAmountIn(G, liveProject, liveQuote);
        if (plan.requiredIn == 0) revert InvalidExactOutput();

        uint256 hardMax = hardMaximumProjectTokenIn(getAmountIn(G, anchorProject, anchorQuote), hardSlippageBps);
        if (maximumProjectTokenIn == 0 || maximumProjectTokenIn > hardMax) revert SignedMaximumInputInvalid();
        if (maximumProjectTokenIn < plan.requiredIn) revert MaximumInputExceeded();

        if (curvePriceImpactBps(plan.requiredIn, liveProject, liveQuote) > hardCurveImpactBps) {
            revert CurvePriceImpactExceeded();
        }
        if (effectiveDeviationBps(plan.requiredIn, liveProject, liveQuote, G) > hardEffectiveDeviationBps) {
            revert EffectiveDeviationExceeded();
        }

        plan.fee = melegaSuccessFee(G);
        plan.netCurrentQuote = G - plan.fee;
        uint256 X1 = liveProject + plan.requiredIn;
        uint256 Y1 = liveQuote - G;
        plan.projectForCurrentNet = matchedProjectForQuote(plan.netCurrentQuote, X1, Y1);

        uint256 afterCurrent = plan.requiredIn + plan.projectForCurrentNet;
        if (afterCurrent > remainingBudget) revert InsufficientBudget();
        if (plan.projectForCurrentNet == 0 && plan.netCurrentQuote > 0) revert CurrentNetQuoteCannotBeMatched();

        uint256 spare = remainingBudget - afterCurrent;
        if (spare == 0 || quoteResidual == 0) {
            plan.priorResidualSelected = 0;
        } else {
            uint256 maxPriorMatch = matchedProjectForQuote(quoteResidual, X1, Y1);
            if (maxPriorMatch <= spare) {
                plan.priorResidualSelected = quoteResidual;
            } else {
                plan.priorResidualSelected = (spare * Y1) / X1;
                if (plan.priorResidualSelected > quoteResidual) plan.priorResidualSelected = quoteResidual;
            }
        }

        plan.quoteForLiq = plan.netCurrentQuote + plan.priorResidualSelected;
        plan.desiredProjectForLiq = matchedProjectForQuote(plan.quoteForLiq, X1, Y1);
        if (plan.desiredProjectForLiq < plan.projectForCurrentNet) revert CurrentNetQuoteCannotBeMatched();
        plan.plannedConsumption = plan.requiredIn + plan.desiredProjectForLiq;
        if (plan.plannedConsumption > remainingBudget) revert InsufficientBudget();

        plan.projectMin = amountMinWithSlippage(plan.desiredProjectForLiq, operatingSlippageBps);
        plan.quoteMin = amountMinWithSlippage(plan.quoteForLiq, operatingSlippageBps);
    }

    function validateCaps(
        uint256 plannedConsumption,
        uint256 remainingBudget,
        uint256 totalDepositedBudget,
        uint256 existingRolling,
        uint16 remainingCapBps,
        uint16 totalCapBps,
        uint16 rollingCapBps
    ) external pure {
        uint256 remainingCap = (remainingBudget * remainingCapBps) / BPS;
        uint256 totalCap = (totalDepositedBudget * totalCapBps) / BPS;
        uint256 epochCap = remainingCap < totalCap ? remainingCap : totalCap;
        if (plannedConsumption > epochCap) revert EpochBudgetCapExceeded();
        if (plannedConsumption > remainingBudget) revert InsufficientBudget();
        uint256 rollingCap = (totalDepositedBudget * rollingCapBps) / BPS;
        if (existingRolling + plannedConsumption > rollingCap) revert RollingBudgetCapExceeded();
    }
}
