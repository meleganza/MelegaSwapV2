// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import { ILiquidityBuildingTreasuryFeeSinkV1 } from "./interfaces/ILiquidityBuildingTreasuryFeeSinkV1.sol";

/// @dev Minimal Program views already present as public state on LiquidityBuildingProgramV1.
interface ILB006ProgramViews {
    function programId() external view returns (bytes32);
    function factory() external view returns (address);
    function quoteAsset() external view returns (address);
}

interface ILB006FactoryViews {
    function isRegisteredProgram(address program) external view returns (bool);
    function treasuryFeeSink() external view returns (address);
}

/**
 * @title LiquidityBuildingTreasuryFeeSinkV1
 * @notice Atomic Program→Treasury exact-fee forwarder with idempotent settlement receipts.
 * @dev Direct ERC20 transfers to this contract are accidental donations: not settled, not withdrawable.
 *
 * Residual spoofing risk: a fake Factory that registers a fake Program and points treasuryFeeSink()
 * at this Sink can emit receipts. Treasury Runtime must filter by the canonical Melega LB Factory.
 */
contract LiquidityBuildingTreasuryFeeSinkV1 is ILiquidityBuildingTreasuryFeeSinkV1, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant TREASURY_SINK_VERSION = keccak256("LiquidityBuildingTreasuryFeeSinkV1");

    error ZeroTreasuryReceiver();
    error TreasuryReceiverWithoutCode();
    error InvalidProgramCaller();
    error InvalidProgramId();
    error InvalidExecutionId();
    error InvalidQuoteAsset();
    error ZeroFeeAmount();
    error InvalidAuthorizationReference();
    error ProgramIdentityMismatch();
    error ProgramQuoteMismatch();
    error UnregisteredProgram();
    error IncompatibleFactorySink();
    error SettlementAlreadyCompleted();
    error TreasuryTransferFailed();
    error UnsupportedQuoteTransferBehavior();
    error SettlementInvariantFailure();

    address public immutable override treasuryReceiver;

    mapping(bytes32 => bool) private _settled;
    mapping(bytes32 => SettlementRecord) private _records;

    constructor(address treasuryReceiver_) {
        if (treasuryReceiver_ == address(0)) revert ZeroTreasuryReceiver();
        if (treasuryReceiver_.code.length == 0) revert TreasuryReceiverWithoutCode();
        treasuryReceiver = treasuryReceiver_;
    }

    function treasurySinkVersion() external pure override returns (bytes32) {
        return TREASURY_SINK_VERSION;
    }

    function settlementKeyFor(address program, bytes32 programId, bytes32 executionId)
        public
        view
        override
        returns (bytes32)
    {
        return keccak256(abi.encode(block.chainid, address(this), program, programId, executionId));
    }

    function isSettled(bytes32 settlementKey) external view override returns (bool) {
        return _settled[settlementKey];
    }

    function settlementRecord(bytes32 settlementKey) external view override returns (SettlementRecord memory) {
        return _records[settlementKey];
    }

    function settleLiquidityBuildingFee(
        bytes32 programId,
        bytes32 executionId,
        address quoteAsset,
        uint256 amount,
        bytes32 authorizationReference
    ) external override nonReentrant returns (bytes32 settlementReceipt) {
        if (msg.sender.code.length == 0) revert InvalidProgramCaller();
        if (programId == bytes32(0)) revert InvalidProgramId();
        if (executionId == bytes32(0)) revert InvalidExecutionId();
        if (quoteAsset == address(0) || quoteAsset.code.length == 0) revert InvalidQuoteAsset();
        if (amount == 0) revert ZeroFeeAmount();
        if (authorizationReference == bytes32(0)) revert InvalidAuthorizationReference();

        ILB006ProgramViews program = ILB006ProgramViews(msg.sender);
        if (program.programId() != programId) revert ProgramIdentityMismatch();
        if (program.quoteAsset() != quoteAsset) revert ProgramQuoteMismatch();

        address factory = program.factory();
        ILB006FactoryViews factoryViews = ILB006FactoryViews(factory);
        if (!factoryViews.isRegisteredProgram(msg.sender)) revert UnregisteredProgram();
        if (factoryViews.treasuryFeeSink() != address(this)) revert IncompatibleFactorySink();

        bytes32 settlementKey = settlementKeyFor(msg.sender, programId, executionId);
        if (_settled[settlementKey]) revert SettlementAlreadyCompleted();

        // Effects before interaction: duplicate settlement / reentrancy on same key fails.
        _settled[settlementKey] = true;

        IERC20 token = IERC20(quoteAsset);
        uint256 sinkBefore = token.balanceOf(address(this));
        uint256 receiverBefore = token.balanceOf(treasuryReceiver);

        // Direct Program → Treasury receiver; Sink must not retain economic balance of the fee.
        if (!token.trySafeTransferFrom(msg.sender, treasuryReceiver, amount)) {
            revert TreasuryTransferFailed();
        }

        uint256 sinkAfter = token.balanceOf(address(this));
        uint256 receiverAfter = token.balanceOf(treasuryReceiver);

        if (sinkAfter != sinkBefore) revert SettlementInvariantFailure();
        if (receiverAfter < receiverBefore || receiverAfter - receiverBefore != amount) {
            revert UnsupportedQuoteTransferBehavior();
        }

        settlementReceipt = keccak256(
            abi.encode(
                block.chainid,
                address(this),
                treasuryReceiver,
                msg.sender,
                programId,
                executionId,
                quoteAsset,
                amount,
                authorizationReference,
                settlementKey
            )
        );

        _records[settlementKey] = SettlementRecord({
            program: msg.sender,
            quoteAsset: quoteAsset,
            amount: amount,
            authorizationReference: authorizationReference,
            settlementReceipt: settlementReceipt,
            settledAt: uint64(block.timestamp),
            settledBlock: uint64(block.number)
        });

        emit LiquidityBuildingFeeSettled(
            settlementKey,
            programId,
            executionId,
            msg.sender,
            quoteAsset,
            amount,
            treasuryReceiver,
            authorizationReference,
            settlementReceipt
        );
    }
}
