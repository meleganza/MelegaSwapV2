// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IPancakeSmartRouter } from "./interfaces/IPancakeSmartRouter.sol";

/// @title MelegaGasFeeSmartRouterWrapper
/// @notice Atomic exact-input Smart Router execution with a native protocol fee
///         fixed at 25% of the confirmation-time gas quote.
/// @dev This contract is deliberately separate from MelegaSmartRouterWrapper,
///      whose certified 20/30 bps input-token economics must remain immutable.
contract MelegaGasFeeSmartRouterWrapper is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint16 public constant GAS_PROTOCOL_FEE_BPS = 2500;
    uint256 public constant MIN_GAS_UNITS_QUOTE = 160_000;
    uint256 public constant MAX_GAS_UNITS_QUOTE = 2_000_000;
    uint256 private constant POST_ROUTER_GAS_ALLOWANCE = 35_000;
    address public constant NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    IPancakeSmartRouter public immutable smartRouter;
    address payable public immutable feeRecipient;

    error ZeroAddress();
    error InvalidAmount();
    error InvalidPath();
    error InvalidGasQuote();
    error IncorrectNativeValue(uint256 expected, uint256 received);
    error UnderquotedGas(uint256 quoted, uint256 observed);
    error NativeTransferFailed();

    event AtomicGasFeeSwap(
        address indexed user,
        address indexed inputToken,
        address indexed outputToken,
        uint256 amountIn,
        uint256 amountOut,
        uint256 gasUnitsQuote,
        uint256 gasPriceWei,
        uint256 protocolFeeWei,
        address recipient
    );

    constructor(address smartRouter_, address payable feeRecipient_, address owner_) Ownable(owner_) {
        if (smartRouter_ == address(0) || feeRecipient_ == address(0) || owner_ == address(0)) revert ZeroAddress();
        smartRouter = IPancakeSmartRouter(smartRouter_);
        feeRecipient = feeRecipient_;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function quoteProtocolFee(uint256 gasUnitsQuote, uint256 gasPriceWei) public pure returns (uint256) {
        if (gasUnitsQuote < MIN_GAS_UNITS_QUOTE || gasUnitsQuote > MAX_GAS_UNITS_QUOTE) {
            revert InvalidGasQuote();
        }
        return (gasUnitsQuote * gasPriceWei * GAS_PROTOCOL_FEE_BPS) / 10_000;
    }

    function swapExactInputSingle(
        IERC20 srcToken,
        IERC20 dstToken,
        uint256 amountIn,
        uint256 minReturn,
        IPancakeSmartRouter.FLAG flag,
        address recipient,
        uint256 gasUnitsQuote
    ) external payable whenNotPaused nonReentrant returns (uint256 amountOut) {
        if (recipient == address(0)) revert ZeroAddress();
        if (amountIn == 0) revert InvalidAmount();

        uint256 startGas = gasleft();
        uint256 protocolFeeWei = quoteProtocolFee(gasUnitsQuote, tx.gasprice);
        bool nativeIn = address(srcToken) == NATIVE_TOKEN;
        _checkAndPrepareInput(srcToken, amountIn, protocolFeeWei, nativeIn);

        amountOut = smartRouter.swap{ value: nativeIn ? amountIn : 0 }(srcToken, dstToken, amountIn, minReturn, flag);
        if (!nativeIn) srcToken.forceApprove(address(smartRouter), 0);

        _deliverOutput(dstToken, recipient, amountOut);
        _settleFee(protocolFeeWei);
        _assertGasQuote(startGas, gasUnitsQuote);

        emit AtomicGasFeeSwap(
            msg.sender,
            address(srcToken),
            address(dstToken),
            amountIn,
            amountOut,
            gasUnitsQuote,
            tx.gasprice,
            protocolFeeWei,
            recipient
        );
    }

    function swapExactInputMulti(
        IERC20[] calldata tokens,
        uint256 amountIn,
        uint256 minReturn,
        IPancakeSmartRouter.FLAG[] calldata flags,
        address recipient,
        uint256 gasUnitsQuote
    ) external payable whenNotPaused nonReentrant returns (uint256 amountOut) {
        if (tokens.length < 2 || flags.length != tokens.length - 1) revert InvalidPath();
        if (recipient == address(0)) revert ZeroAddress();
        if (amountIn == 0) revert InvalidAmount();

        uint256 startGas = gasleft();
        uint256 protocolFeeWei = quoteProtocolFee(gasUnitsQuote, tx.gasprice);
        IERC20 srcToken = tokens[0];
        IERC20 dstToken = tokens[tokens.length - 1];
        bool nativeIn = address(srcToken) == NATIVE_TOKEN;
        _checkAndPrepareInput(srcToken, amountIn, protocolFeeWei, nativeIn);

        amountOut = smartRouter.swapMulti{ value: nativeIn ? amountIn : 0 }(tokens, amountIn, minReturn, flags);
        if (!nativeIn) srcToken.forceApprove(address(smartRouter), 0);

        _deliverOutput(dstToken, recipient, amountOut);
        _settleFee(protocolFeeWei);
        _assertGasQuote(startGas, gasUnitsQuote);

        emit AtomicGasFeeSwap(
            msg.sender,
            address(srcToken),
            address(dstToken),
            amountIn,
            amountOut,
            gasUnitsQuote,
            tx.gasprice,
            protocolFeeWei,
            recipient
        );
    }

    function _checkAndPrepareInput(IERC20 srcToken, uint256 amountIn, uint256 feeWei, bool nativeIn) private {
        uint256 expectedValue = feeWei + (nativeIn ? amountIn : 0);
        if (msg.value != expectedValue) revert IncorrectNativeValue(expectedValue, msg.value);
        if (!nativeIn) {
            srcToken.safeTransferFrom(msg.sender, address(this), amountIn);
            srcToken.forceApprove(address(smartRouter), amountIn);
        }
    }

    function _deliverOutput(IERC20 dstToken, address recipient, uint256 amountOut) private {
        if (address(dstToken) == NATIVE_TOKEN) {
            (bool sent,) = payable(recipient).call{ value: amountOut }("");
            if (!sent) revert NativeTransferFailed();
        } else {
            dstToken.safeTransfer(recipient, amountOut);
        }
    }

    function _settleFee(uint256 feeWei) private {
        if (feeWei == 0) return;
        (bool sent,) = feeRecipient.call{ value: feeWei }("");
        if (!sent) revert NativeTransferFailed();
    }

    function _assertGasQuote(uint256 startGas, uint256 gasUnitsQuote) private view {
        uint256 observed = startGas - gasleft() + POST_ROUTER_GAS_ALLOWANCE;
        if (gasUnitsQuote < observed) revert UnderquotedGas(gasUnitsQuote, observed);
    }

    receive() external payable { }
}
