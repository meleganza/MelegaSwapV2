// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IUnderlyingSwapRouter} from "./interfaces/IUnderlyingSwapRouter.sol";

/// @title MelegaSmartRouterWrapper
/// @notice Constitutional economic entrypoint v1 — exact-input swaps only.
/// @dev Forwards D87 protocol fee to treasury collector; delegates net amount to underlying router.
///      Never executes FSC-01 splits or referral settlement locally.
contract MelegaSmartRouterWrapper is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint16 public constant STANDARD_PROTOCOL_FEE_BPS = 30;
    uint16 public constant BUY_MARCO_PROTOCOL_FEE_BPS = 20;

    bytes32 public constant ROUTE_TYPE_STANDARD_SWAP = keccak256("STANDARD_SWAP");

    address public immutable underlyingRouter;
    address public immutable treasuryCollector;
    address public immutable marcoToken;
    bytes32 public immutable pricingRefHash;
    bytes32 public immutable treasuryPolicyRefHash;

    error ZeroAddress();
    error InvalidPath();
    error Expired();
    error ExactOutputUnsupported();
    error FeeOnTransferUnsupported();

    event ProtocolFeeCollected(
        address indexed user,
        address indexed inputToken,
        address indexed outputToken,
        address feeToken,
        uint256 grossAmountIn,
        uint256 netAmountIn,
        uint256 feeAmount,
        uint16 protocolFeeBps,
        bool buyMarcoIncentiveApplied,
        address underlyingRouter,
        address treasuryCollector,
        bytes32 pricingRefHash,
        bytes32 treasuryPolicyRefHash
    );

    event SmartRouterSwapRouted(
        address indexed user,
        address indexed inputToken,
        address indexed outputToken,
        uint256 grossAmountIn,
        uint256 netAmountIn,
        uint256 amountOut,
        address underlyingRouter,
        bytes32 routeHash
    );

    event TreasuryHandoffPrepared(
        bytes32 indexed executionId,
        bytes32 indexed routeType,
        address treasuryCollector,
        uint256 protocolFee,
        bytes32 treasuryPolicyRefHash,
        bytes32 pricingRefHash
    );

    constructor(
        address underlyingRouter_,
        address treasuryCollector_,
        address marcoToken_,
        bytes32 pricingRefHash_,
        bytes32 treasuryPolicyRefHash_,
        address owner_
    ) Ownable(owner_) {
        if (
            underlyingRouter_ == address(0) || treasuryCollector_ == address(0) || marcoToken_ == address(0)
                || owner_ == address(0)
        ) {
            revert ZeroAddress();
        }
        if (pricingRefHash_ == bytes32(0) || treasuryPolicyRefHash_ == bytes32(0)) {
            revert ZeroAddress();
        }

        underlyingRouter = underlyingRouter_;
        treasuryCollector = treasuryCollector_;
        marcoToken = marcoToken_;
        pricingRefHash = pricingRefHash_;
        treasuryPolicyRefHash = treasuryPolicyRefHash_;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Quote D87 protocol fee — BUY MARCO when output token equals immutable MARCO address.
    function quoteProtocolFee(address inputToken, address outputToken, uint256 amountIn)
        external
        view
        returns (uint256 feeAmount, uint256 netAmountIn, uint16 protocolFeeBps, bool buyMarcoIncentiveApplied)
    {
        (protocolFeeBps, buyMarcoIncentiveApplied) = _resolveProtocolFeeBps(outputToken);
        feeAmount = (amountIn * protocolFeeBps) / 10_000;
        netAmountIn = amountIn - feeAmount;
        inputToken;
    }

    /// @notice Exact-input ERC20 swap — fee deducted from amountIn before underlying router call.
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address recipient,
        uint256 deadline
    ) external whenNotPaused nonReentrant returns (uint256 amountOut) {
        if (block.timestamp > deadline) revert Expired();
        if (path.length < 2) revert InvalidPath();

        address inputToken = path[0];
        address outputToken = path[path.length - 1];

        (uint256 feeAmount, uint256 netAmountIn, uint16 protocolFeeBps, bool buyMarcoApplied) =
            _computeFee(outputToken, amountIn);

        IERC20(inputToken).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(inputToken).safeTransfer(treasuryCollector, feeAmount);

        IERC20(inputToken).forceApprove(underlyingRouter, netAmountIn);
        amountOut = IUnderlyingSwapRouter(underlyingRouter).swapExactTokensForTokens(
            netAmountIn, amountOutMin, path, recipient, deadline
        );
        IERC20(inputToken).forceApprove(underlyingRouter, 0);

        _emitSwapEvents(
            inputToken, outputToken, amountIn, netAmountIn, feeAmount, protocolFeeBps, buyMarcoApplied, amountOut
        );
    }

    /// @notice Exact-input native BNB swap when path starts with WBNB.
    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address recipient,
        uint256 deadline
    ) external payable whenNotPaused nonReentrant returns (uint256 amountOut) {
        if (block.timestamp > deadline) revert Expired();
        if (path.length < 2) revert InvalidPath();

        uint256 grossAmountIn = msg.value;
        address inputToken = path[0];
        address outputToken = path[path.length - 1];

        (uint256 feeAmount, uint256 netAmountIn, uint16 protocolFeeBps, bool buyMarcoApplied) =
            _computeFee(outputToken, grossAmountIn);

        (bool feeOk,) = treasuryCollector.call{value: feeAmount}("");
        require(feeOk, "TREASURY_FEE_TRANSFER_FAILED");

        amountOut = IUnderlyingSwapRouter(underlyingRouter).swapExactETHForTokens{value: netAmountIn}(
            amountOutMin, path, recipient, deadline
        );

        _emitSwapEvents(
            inputToken, outputToken, grossAmountIn, netAmountIn, feeAmount, protocolFeeBps, buyMarcoApplied, amountOut
        );
    }

    /// @notice Exact-output swaps are not certified in v1.
    function swapTokensForExactTokens(
        uint256,
        uint256,
        address[] calldata,
        address,
        uint256
    ) external pure returns (uint256) {
        revert ExactOutputUnsupported();
    }

    /// @notice Fee-on-transfer tokens are blocked in v1.
    function swapExactTokensForTokensSupportingFeeOnTransfer(
        uint256,
        uint256,
        address[] calldata,
        address,
        uint256
    ) external pure returns (uint256) {
        revert FeeOnTransferUnsupported();
    }

    function _resolveProtocolFeeBps(address outputToken)
        internal
        view
        returns (uint16 protocolFeeBps, bool buyMarcoIncentiveApplied)
    {
        buyMarcoIncentiveApplied = outputToken == marcoToken;
        protocolFeeBps = buyMarcoIncentiveApplied ? BUY_MARCO_PROTOCOL_FEE_BPS : STANDARD_PROTOCOL_FEE_BPS;
    }

    function _computeFee(address outputToken, uint256 grossAmountIn)
        internal
        view
        returns (uint256 feeAmount, uint256 netAmountIn, uint16 protocolFeeBps, bool buyMarcoApplied)
    {
        (protocolFeeBps, buyMarcoApplied) = _resolveProtocolFeeBps(outputToken);
        feeAmount = (grossAmountIn * protocolFeeBps) / 10_000;
        netAmountIn = grossAmountIn - feeAmount;
    }

    function _emitSwapEvents(
        address inputToken,
        address outputToken,
        uint256 grossAmountIn,
        uint256 netAmountIn,
        uint256 feeAmount,
        uint16 protocolFeeBps,
        bool buyMarcoApplied,
        uint256 amountOut
    ) internal {
        bytes32 routeHash = keccak256(abi.encodePacked(inputToken, outputToken, underlyingRouter));

        emit ProtocolFeeCollected(
            msg.sender,
            inputToken,
            outputToken,
            inputToken,
            grossAmountIn,
            netAmountIn,
            feeAmount,
            protocolFeeBps,
            buyMarcoApplied,
            underlyingRouter,
            treasuryCollector,
            pricingRefHash,
            treasuryPolicyRefHash
        );

        emit SmartRouterSwapRouted(
            msg.sender,
            inputToken,
            outputToken,
            grossAmountIn,
            netAmountIn,
            amountOut,
            underlyingRouter,
            routeHash
        );

        bytes32 executionId = keccak256(
            abi.encodePacked(msg.sender, inputToken, outputToken, grossAmountIn, feeAmount, block.timestamp)
        );

        emit TreasuryHandoffPrepared(
            executionId,
            ROUTE_TYPE_STANDARD_SWAP,
            treasuryCollector,
            feeAmount,
            treasuryPolicyRefHash,
            pricingRefHash
        );
    }
}
