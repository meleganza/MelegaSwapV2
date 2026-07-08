// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IUnderlyingSwapRouter} from "../interfaces/IUnderlyingSwapRouter.sol";

/// @notice Records net routed amounts for wrapper tests.
contract MockUnderlyingSwapRouter is IUnderlyingSwapRouter {
    uint256 public lastTokenAmountIn;
    uint256 public lastEthAmountIn;
    address public lastInputToken;
    address public lastOutputToken;
    address public lastRecipient;
    uint256 public lastAmountOutMin;

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address recipient,
        uint256 /* deadline */
    ) external returns (uint256 amountOut) {
        lastTokenAmountIn = amountIn;
        lastAmountOutMin = amountOutMin;
        lastRecipient = recipient;
        lastInputToken = path[0];
        lastOutputToken = path[path.length - 1];

        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        amountOut = amountOutMin + 1;
        IERC20(path[path.length - 1]).transfer(recipient, amountOut);
    }

    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address recipient,
        uint256 /* deadline */
    ) external payable returns (uint256 amountOut) {
        lastEthAmountIn = msg.value;
        lastAmountOutMin = amountOutMin;
        lastRecipient = recipient;
        lastInputToken = path[0];
        lastOutputToken = path[path.length - 1];

        amountOut = amountOutMin + 1;
        IERC20(path[path.length - 1]).transfer(recipient, amountOut);
    }

    receive() external payable {}
}
