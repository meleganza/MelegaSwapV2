// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IExecutionAdapter} from "../interfaces/IExecutionAdapter.sol";
import {IPancakeSmartRouter} from "../interfaces/IPancakeSmartRouter.sol";

/// @title SmartRouterExecutionAdapter
/// @notice Translates IExecutionAdapter calls into Pancake Smart Router swap / swapMulti execution.
/// @dev Does not implement IUnderlyingSwapRouter — incompatible with frozen Wrapper v1 bytecode.
contract SmartRouterExecutionAdapter is IExecutionAdapter {
    using SafeERC20 for IERC20;

    IPancakeSmartRouter public immutable smartRouter;

    error InvalidPath();
    error Expired();
    error QuoteUnsupported();
    error NativePathUnsupported();

    constructor(address smartRouter_) {
        if (smartRouter_ == address(0)) revert InvalidPath();
        smartRouter = IPancakeSmartRouter(smartRouter_);
    }

    function routerType() external pure returns (RouterType routerType_) {
        return RouterType.SMART_ROUTER;
    }

    function routerAddress() external view returns (address routerAddress_) {
        return address(smartRouter);
    }

    /// @inheritdoc IExecutionAdapter
    function supportsExecution(address tokenIn, address tokenOut, bool exactInput) external pure returns (bool) {
        tokenIn;
        tokenOut;
        return exactInput;
    }

    /// @dev Smart Router quotes are route-dependent — off-chain discovery required before execution.
    function quote(uint256, address[] calldata) external pure returns (uint256 amountOut) {
        revert QuoteUnsupported();
    }

    function executeExactInput(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address recipient,
        uint256 deadline
    ) external returns (uint256 amountOut) {
        if (block.timestamp > deadline) revert Expired();
        if (path.length < 2) revert InvalidPath();

        address srcToken = path[0];
        address dstToken = path[path.length - 1];

        IERC20(srcToken).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(srcToken).forceApprove(address(smartRouter), amountIn);

        amountOut = smartRouter.swap(
            IERC20(srcToken), IERC20(dstToken), amountIn, amountOutMin, IPancakeSmartRouter.FLAG._0
        );

        if (dstToken != address(0) && recipient != address(this)) {
            IERC20(dstToken).safeTransfer(recipient, amountOut);
        }

        IERC20(srcToken).forceApprove(address(smartRouter), 0);
    }

    function executeNativeInput(
        uint256 amountOutMin,
        address[] calldata path,
        address recipient,
        uint256 deadline
    ) external payable returns (uint256 amountOut) {
        if (block.timestamp > deadline) revert Expired();
        if (path.length < 2) revert InvalidPath();
        if (msg.value == 0) revert InvalidPath();

        recipient;
        amountOutMin;
        path;
        revert NativePathUnsupported();
    }
}
