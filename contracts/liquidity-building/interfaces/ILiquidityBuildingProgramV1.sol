// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { LBTypes } from "./ILiquidityBuildingFactoryV1.sol";

interface ILiquidityBuildingProgramV1 {
    event BudgetDeposited(bytes32 indexed programId, uint256 amount, uint256 totalDeposited, uint64 configNonce);
    event BudgetAdded(bytes32 indexed programId, uint256 amount, uint256 totalDeposited, uint64 configNonce);
    event ProgramActivated(bytes32 indexed programId, uint64 configNonce);
    event ProgramPaused(bytes32 indexed programId, uint64 configNonce);
    event ProgramResumed(bytes32 indexed programId, uint64 configNonce);
    event StrategyUpdated(
        bytes32 indexed programId, LBTypes.StrategyMode mode, uint16 minBps, uint16 maxBps, uint64 configNonce
    );
    event EpochDurationUpdated(bytes32 indexed programId, uint32 epochDurationSeconds, uint64 configNonce);
    event LpRecipientUpdated(bytes32 indexed programId, address lpRecipient, uint64 configNonce);
    event BudgetWithdrawn(bytes32 indexed programId, uint256 amount, uint256 remainingBudget, uint64 configNonce);
    event QuoteResidualWithdrawn(bytes32 indexed programId, uint256 amount);
    event ProgramStopped(bytes32 indexed programId, uint64 configNonce);

    struct ProgramView {
        bytes32 schemaVersion;
        bytes32 programId;
        address factory;
        address owner;
        address projectToken;
        address quoteAsset;
        address pair;
        address lpRecipient;
        LBTypes.Lifecycle lifecycle;
        LBTypes.StrategyConfig strategy;
        uint32 epochDurationSeconds;
        uint64 configNonce;
        uint256 totalDepositedBudget;
        uint256 remainingBudget;
        uint256 tokensSold;
        uint256 tokensMatched;
        uint256 withdrawnUnusedBudget;
        uint256 quoteResidual;
        uint256 grossQuoteAcquired;
        uint256 totalFeePaid;
        uint256 totalQuoteAdded;
        uint256 totalLpMinted;
        uint256 executionCount;
        bool solvent;
        uint64 createdAt;
        uint64 activatedAt;
        uint64 pausedAt;
        uint64 stoppedAt;
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
    ) external;

    function depositBudget(uint256 amount) external;
    function addBudget(uint256 amount) external;
    function activate() external;
    function pause() external;
    function resume() external;
    function updateStrategy(LBTypes.StrategyConfig calldata strategy) external;
    function updateEpochDuration(uint32 seconds_) external;
    function updateLpRecipient(address newRecipient) external;
    function withdrawUnusedBudget(uint256 amount) external;
    function stop() external;
    function withdrawStoppedAssets() external;

    function getProgramView() external view returns (ProgramView memory);
    function owner() external view returns (address);
    function lifecycle() external view returns (LBTypes.Lifecycle);
    function configNonce() external view returns (uint64);
    function isSolvent() external view returns (bool);
}
