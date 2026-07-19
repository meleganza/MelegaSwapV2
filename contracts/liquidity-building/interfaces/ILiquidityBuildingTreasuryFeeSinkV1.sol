// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ILiquidityBuildingTreasuryFeeSinkV1
 * @notice Atomic exact-fee forwarder Program → immutable Treasury receiver contract.
 * @dev No owner, no withdrawal, no local fee custody. Direct donations are stuck and unaccounted.
 */
interface ILiquidityBuildingTreasuryFeeSinkV1 {
    event LiquidityBuildingFeeSettled(
        bytes32 indexed settlementKey,
        bytes32 indexed programId,
        bytes32 indexed executionId,
        address program,
        address quoteAsset,
        uint256 amount,
        address treasuryReceiver,
        bytes32 authorizationReference,
        bytes32 settlementReceipt
    );

    struct SettlementRecord {
        address program;
        address quoteAsset;
        uint256 amount;
        bytes32 authorizationReference;
        bytes32 settlementReceipt;
        uint64 settledAt;
        uint64 settledBlock;
    }

    function treasurySinkVersion() external view returns (bytes32);
    function treasuryReceiver() external view returns (address);

    function settleLiquidityBuildingFee(
        bytes32 programId,
        bytes32 executionId,
        address quoteAsset,
        uint256 amount,
        bytes32 authorizationReference
    ) external returns (bytes32 settlementReceipt);

    function isSettled(bytes32 settlementKey) external view returns (bool);

    function settlementRecord(bytes32 settlementKey) external view returns (SettlementRecord memory);

    function settlementKeyFor(address program, bytes32 programId, bytes32 executionId) external view returns (bytes32);
}
