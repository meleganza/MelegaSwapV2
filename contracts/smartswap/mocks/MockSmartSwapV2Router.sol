// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISmartSwapV2Router} from "../interfaces/ISmartSwapV2Router.sol";

/// @notice Exact-in V2 mock for SmartSwapExecutorV1 local simulation.
contract MockSmartSwapV2Router is ISmartSwapV2Router {
    uint256 public lastAmountIn;
    uint256 public lastNativeIn;
    address public lastRecipient;
    bool public revertNext;

    error ForcedRevert();

    function setRevertNext(bool value) external {
        revertNext = value;
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256
    ) external returns (uint256[] memory amounts) {
        if (revertNext) revert ForcedRevert();
        lastAmountIn = amountIn;
        lastRecipient = to;
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        uint256 amountOut = amountOutMin + 1;
        IERC20(path[path.length - 1]).transfer(to, amountOut);
        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = amountOut;
    }

    function swapExactETHForTokens(uint256 amountOutMin, address[] calldata path, address to, uint256)
        external
        payable
        returns (uint256[] memory amounts)
    {
        if (revertNext) revert ForcedRevert();
        lastNativeIn = msg.value;
        lastRecipient = to;
        uint256 amountOut = amountOutMin + 1;
        IERC20(path[path.length - 1]).transfer(to, amountOut);
        amounts = new uint256[](2);
        amounts[0] = msg.value;
        amounts[1] = amountOut;
    }

    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256
    ) external returns (uint256[] memory amounts) {
        if (revertNext) revert ForcedRevert();
        lastAmountIn = amountIn;
        lastRecipient = to;
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        uint256 amountOut = amountOutMin + 1;
        (bool ok,) = to.call{value: amountOut}("");
        require(ok, "ETH_OUT");
        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = amountOut;
    }

    receive() external payable {}
}
