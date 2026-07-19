// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import { LBTypes } from "./interfaces/ILiquidityBuildingFactoryV1.sol";
import { ILiquidityBuildingProgramV1 } from "./interfaces/ILiquidityBuildingProgramV1.sol";

/**
 * @title LiquidityBuildingProgramV1
 * @notice Per-program isolated custody + owner lifecycle (LB005).
 * @dev No swap, Treasury, Authorizer, or add-liquidity calls in this version.
 *
 * ReentrancyGuard (OZ 5.x): clone storage starts at 0; entered check is `== 2`, so
 * zero-initialized clone storage is safe without upgradeable ReentrancyGuard.
 */
contract LiquidityBuildingProgramV1 is ILiquidityBuildingProgramV1, Initializable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant PROGRAM_VIEW_SCHEMA = keccak256("LiquidityBuildingProgramViewV1");

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
    error InvalidWithdrawal();
    error AccountingInvariantFailure();

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
        ) {
            revert InvalidLifecycle();
        }
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
        ) {
            revert InvalidLifecycle();
        }
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
        ) {
            revert InvalidLifecycle();
        }
        _validateEpoch(seconds_);
        epochDurationSeconds = seconds_;
        _bumpNonce();
        emit EpochDurationUpdated(programId, seconds_, _configNonce);
    }

    function updateLpRecipient(address newRecipient) external onlyOwner notStopped {
        if (newRecipient == address(0)) revert InvalidLpRecipient();
        // Forbidden while ACTIVE (LB004). Allowed in Created/Ready/Paused/SafetyPaused.
        LBTypes.Lifecycle life = _lifecycle;
        if (
            life != LBTypes.Lifecycle.Created && life != LBTypes.Lifecycle.Ready && life != LBTypes.Lifecycle.Paused
                && life != LBTypes.Lifecycle.SafetyPaused
        ) {
            revert InvalidLifecycle();
        }
        lpRecipient = newRecipient;
        _bumpNonce();
        emit LpRecipientUpdated(programId, newRecipient, _configNonce);
    }

    function withdrawUnusedBudget(uint256 amount) external onlyOwner notStopped nonReentrant {
        LBTypes.Lifecycle life = _lifecycle;
        if (
            life != LBTypes.Lifecycle.Ready && life != LBTypes.Lifecycle.Paused
                && life != LBTypes.Lifecycle.SafetyPaused
        ) {
            revert InvalidLifecycle();
        }
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
        // Allow Created/Ready/Active/Paused/SafetyPaused → Stopped (avoid stuck clones).
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
        // Second call with zeros is a no-op success.
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

    function _pullExact(uint256 amount) internal {
        IERC20 token = IERC20(projectToken);
        uint256 beforeBal = token.balanceOf(address(this));
        token.safeTransferFrom(_owner, address(this), amount);
        uint256 afterBal = token.balanceOf(address(this));
        if (afterBal - beforeBal != amount) revert UnsupportedTokenBehavior();
    }

    function _pushExact(address token, address to, uint256 amount) internal {
        IERC20 t = IERC20(token);
        uint256 beforeBal = t.balanceOf(address(this));
        uint256 beforeTo = t.balanceOf(to);
        t.safeTransfer(to, amount);
        uint256 afterBal = t.balanceOf(address(this));
        uint256 afterTo = t.balanceOf(to);
        if (beforeBal - afterBal != amount) revert UnsupportedTokenBehavior();
        if (afterTo < beforeTo || afterTo - beforeTo != amount) revert UnsupportedTokenBehavior();
    }

    function _bumpNonce() internal {
        _configNonce += 1;
    }

    function _assertBudgetInvariant() internal view {
        if (remainingBudget + tokensSold + tokensMatched + withdrawnUnusedBudget != totalDepositedBudget) {
            revert AccountingInvariantFailure();
        }
    }

    function _validateEpoch(uint32 seconds_) internal pure {
        if (!(seconds_ == 300 || seconds_ == 900 || seconds_ == 1800 || seconds_ == 3600)) {
            revert InvalidEpoch();
        }
    }

    function _validateStrategy(LBTypes.StrategyConfig calldata s, uint16 ceiling) internal pure {
        if (s.mode == LBTypes.StrategyMode.FullAi) {
            if (s.minimumRateBps != 0 || s.maximumRateBps != 0) revert InvalidStrategy();
            return;
        }
        if (s.mode != LBTypes.StrategyMode.DynamicRange) revert InvalidStrategy();
        if (s.minimumRateBps == 0) revert InvalidStrategy();
        if (s.maximumRateBps < s.minimumRateBps) revert InvalidStrategy();
        if (s.maximumRateBps > ceiling) revert InvalidStrategy();
    }
}
