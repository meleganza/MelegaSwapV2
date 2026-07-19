// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Shared Liquidity Building V1 types (Factory + Program).
library LBTypes {
    enum Lifecycle {
        Created,
        Ready,
        Active,
        Paused,
        SafetyPaused,
        Stopped
    }

    enum StrategyMode {
        FullAi,
        DynamicRange
    }

    enum GasConversionMode {
        NativeEquivalent,
        PinnedOnchainPair,
        NotActive
    }

    struct StrategyConfig {
        StrategyMode mode;
        uint16 minimumRateBps;
        uint16 maximumRateBps;
    }

    struct QuoteAssetPolicy {
        address asset;
        uint8 decimals;
        bool enabled;
        uint256 minimumGrossQuoteFloor;
        uint256 minimumQuoteReserve;
        GasConversionMode gasConversionMode;
        address gasConversionReference;
    }

    struct ProtocolParameters {
        uint16 successFeeBps;
        uint16 strategyCeilingBps;
        uint16 operatingCurveImpactBps;
        uint16 hardCurveImpactBps;
        uint16 hardEffectiveDeviationBps;
        uint16 decisionExecutionDriftBps;
        uint16 swapSlippageOperatingBps;
        uint16 hardSlippageBps;
        uint16 remainingBudgetEpochCapBps;
        uint16 totalBudgetEpochCapBps;
        uint16 rolling24hTotalBudgetCapBps;
        uint16 maximumGasCostShareBps;
        uint16 initialFinalityDepth;
        uint8 maxSuccessfulExecutionsPerEpoch;
    }
}

interface IMelegaV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

interface IMelegaV2Pair {
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

interface ILiquidityBuildingFactoryV1 {
    event ProgramCreated(
        bytes32 indexed programId,
        address indexed owner,
        address indexed program,
        address projectToken,
        address quoteAsset,
        address pair,
        uint64 generation,
        bytes32 factoryVersion
    );

    function createProgram(
        address projectToken,
        address quoteAsset,
        address pair,
        LBTypes.StrategyConfig calldata strategy,
        uint32 epochDurationSeconds
    ) external returns (address program, bytes32 programId);

    function factoryVersion() external view returns (bytes32);
    function deploymentChainId() external view returns (uint256);
    function implementation() external view returns (address);
    function melegaFactory() external view returns (address);
    function melegaRouter() external view returns (address);
    function executionAuthorizer() external view returns (address);
    function treasuryFeeSink() external view returns (address);
    function protocolParameters() external view returns (LBTypes.ProtocolParameters memory);
    function quotePolicy(address quoteAsset) external view returns (LBTypes.QuoteAssetPolicy memory);
    function isQuoteEnabled(address quoteAsset) external view returns (bool);
    function programCount() external view returns (uint256);
    function programAt(uint256 index) external view returns (address);
    function getProgram(bytes32 programId) external view returns (address);
    function programIdOf(address program) external view returns (bytes32);
    function isRegisteredProgram(address program) external view returns (bool);
    function activeProgram(address owner, address projectToken, address quoteAsset, address pair)
        external
        view
        returns (address);
    function generationCount(address owner, address projectToken, address quoteAsset, address pair)
        external
        view
        returns (uint64);
    function computeBaseKey(address owner, address projectToken, address quoteAsset, address pair)
        external
        pure
        returns (bytes32);
    function computeProgramId(bytes32 baseKey, uint64 generation) external view returns (bytes32);
    function predictProgramAddress(bytes32 programId) external view returns (address);
}
