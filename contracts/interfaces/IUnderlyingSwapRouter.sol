// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal underlying router surface for Melega wrapper v1 scaffold.
/// @dev Production may target PancakeSwap Smart Router `swap` — mock implements this for tests.
interface IUnderlyingSwapRouter {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address recipient,
        uint256 deadline
    ) external returns (uint256 amountOut);

    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address recipient,
        uint256 deadline
    ) external payable returns (uint256 amountOut);
}
