// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IMelegaV2RouterMinimal
 * @notice Canonical Melega V2 Router surface used by Liquidity Building execution (Pancake-compatible ABI).
 * @dev Does not import stale Pancake smart-router package math/constants.
 */
interface IMelegaV2RouterMinimal {
    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity);
}
