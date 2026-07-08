// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IUnderlyingSwapRouter} from "../interfaces/IUnderlyingSwapRouter.sol";

/// @notice Underlying router mock that always reverts for failure-path tests.
contract MockRevertingRouter is IUnderlyingSwapRouter {
    error RouterForcedRevert();

    function swapExactTokensForTokens(
        uint256,
        uint256,
        address[] calldata,
        address,
        uint256
    ) external pure returns (uint256) {
        revert RouterForcedRevert();
    }

    function swapExactETHForTokens(
        uint256,
        address[] calldata,
        address,
        uint256
    ) external payable returns (uint256) {
        revert RouterForcedRevert();
    }
}
