// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ILiquidityBuildingExecutionAuthorizerV1
 * @notice Immutable, no-custody EIP-712 / EIP-1271 execution-intent verifier.
 * @dev No owner, no signer rotation, no replay state. Replay belongs to Program execution (LB007+).
 */
interface ILiquidityBuildingExecutionAuthorizerV1 {
    enum AuthorityType {
        EOA,
        ERC1271
    }

    struct ExecutionIntentV1 {
        bytes32 schemaVersion;
        uint256 chainId;
        address factory;
        bytes32 factoryVersion;
        address program;
        address pair;
        address projectToken;
        address quoteAsset;
        uint256 epochId;
        uint64 epochStartTimestamp;
        uint64 epochEndTimestamp;
        uint64 observationStartBlock;
        uint64 observationEndBlock;
        uint64 anchorBlock;
        uint256 anchorProjectReserve;
        uint256 anchorQuoteReserve;
        uint256 eligibleNetBuyFlow;
        uint8 strategyMode;
        uint16 effectiveStrategyRateBps;
        uint256 grossQuoteTarget;
        uint256 maximumProjectTokenIn;
        uint256 configNonce;
        uint256 executionNonce;
        bytes32 strategyEngineVersion;
        uint64 decisionDeadline;
        uint256 maximumGasPrice;
        bytes32 observationRoot;
        bytes32 excludedFlowCommitment;
        bytes32 treasuryAuthorizationReference;
    }

    function authorizerVersion() external view returns (bytes32);
    function signingAuthority() external view returns (address);
    function authorityType() external view returns (AuthorityType);
    function executionIntentSchemaVersion() external view returns (bytes32);
    function executionIntentTypeHash() external view returns (bytes32);

    function domainSeparatorFor(address program, address factory, bytes32 factoryVersion)
        external
        view
        returns (bytes32);

    function hashExecutionIntent(ExecutionIntentV1 calldata intent) external view returns (bytes32 digest);

    function validateExecutionIntent(ExecutionIntentV1 calldata intent, bytes calldata signature)
        external
        view
        returns (bytes32 digest);
}
