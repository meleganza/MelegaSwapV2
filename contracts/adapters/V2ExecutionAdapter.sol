// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IExecutionAdapter} from "../interfaces/IExecutionAdapter.sol";
import {IUnderlyingSwapRouter} from "../interfaces/IUnderlyingSwapRouter.sol";
import {IPancakeRouter02} from "../interfaces/IPancakeRouter02.sol";

/// @title V2ExecutionAdapter
/// @notice Translates IExecutionAdapter / IUnderlyingSwapRouter calls into Pancake V2 router execution.
/// @dev Also implements IUnderlyingSwapRouter so frozen Wrapper bytecode can target this adapter address.
contract V2ExecutionAdapter is IExecutionAdapter, IUnderlyingSwapRouter {
    using SafeERC20 for IERC20;

    IPancakeRouter02 public immutable v2Router;

    error InvalidPath();
    error Expired();

    constructor(address v2Router_) {
        if (v2Router_ == address(0)) revert InvalidPath();
        v2Router = IPancakeRouter02(v2Router_);
    }

    function routerType() external pure returns (RouterType routerType_) {
        return RouterType.V2;
    }

    function routerAddress() external view returns (address routerAddress_) {
        return address(v2Router);
    }

    /// @inheritdoc IExecutionAdapter
    function supportsExecution(address, address, bool exactInput) external pure returns (bool) {
        return exactInput;
    }

    function quote(uint256 amountIn, address[] calldata path) external view returns (uint256 amountOut) {
        if (path.length < 2) revert InvalidPath();
        uint256[] memory amounts = v2Router.getAmountsOut(amountIn, path);
        return amounts[amounts.length - 1];
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

        address inputToken = path[0];
        IERC20(inputToken).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(inputToken).forceApprove(address(v2Router), amountIn);

        uint256[] memory amounts =
            v2Router.swapExactTokensForTokens(amountIn, amountOutMin, path, recipient, deadline);
        IERC20(inputToken).forceApprove(address(v2Router), 0);
        return amounts[amounts.length - 1];
    }

    function executeNativeInput(
        uint256 amountOutMin,
        address[] calldata path,
        address recipient,
        uint256 deadline
    ) external payable returns (uint256 amountOut) {
        if (block.timestamp > deadline) revert Expired();
        if (path.length < 2) revert InvalidPath();
        uint256[] memory amounts =
            v2Router.swapExactETHForTokens{value: msg.value}(amountOutMin, path, recipient, deadline);
        return amounts[amounts.length - 1];
    }

    /// @inheritdoc IUnderlyingSwapRouter
    /// @dev Wrapper approves this adapter then calls — pull netAmountIn from Wrapper (msg.sender).
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address recipient,
        uint256 deadline
    ) external returns (uint256 amountOut) {
        if (block.timestamp > deadline) revert Expired();
        if (path.length < 2) revert InvalidPath();

        address inputToken = path[0];
        IERC20(inputToken).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(inputToken).forceApprove(address(v2Router), amountIn);

        uint256[] memory amounts =
            v2Router.swapExactTokensForTokens(amountIn, amountOutMin, path, recipient, deadline);
        IERC20(inputToken).forceApprove(address(v2Router), 0);
        return amounts[amounts.length - 1];
    }

    /// @inheritdoc IUnderlyingSwapRouter
    /// @dev Wrapper forwards net native value — relay to V2 router unchanged.
    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address recipient,
        uint256 deadline
    ) external payable returns (uint256 amountOut) {
        if (block.timestamp > deadline) revert Expired();
        if (path.length < 2) revert InvalidPath();
        uint256[] memory amounts =
            v2Router.swapExactETHForTokens{value: msg.value}(amountOutMin, path, recipient, deadline);
        return amounts[amounts.length - 1];
    }
}
