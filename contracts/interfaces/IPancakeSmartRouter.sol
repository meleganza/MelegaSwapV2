// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Minimal PancakeSwap Smart Router surface for execution adapters.
interface IPancakeSmartRouter {
    enum FLAG {
        _0,
        _1,
        _2,
        _3
    }

    function swap(IERC20 srcToken, IERC20 dstToken, uint256 amount, uint256 minReturn, FLAG flag)
        external
        payable
        returns (uint256 returnAmount);

    function swapMulti(IERC20[] calldata tokens, uint256 amount, uint256 minReturn, FLAG[] calldata flags)
        external
        payable
        returns (uint256 returnAmount);
}
