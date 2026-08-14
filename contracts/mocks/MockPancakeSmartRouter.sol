// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IPancakeSmartRouter } from "../interfaces/IPancakeSmartRouter.sol";

contract MockPancakeSmartRouter is IPancakeSmartRouter {
    using SafeERC20 for IERC20;

    address internal constant NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    bool public shouldRevert;

    error ForcedRevert();
    error NativeTransferFailed();

    function setShouldRevert(bool value) external {
        shouldRevert = value;
    }

    function swap(IERC20 srcToken, IERC20 dstToken, uint256 amount, uint256 minReturn, FLAG)
        external
        payable
        returns (uint256 returnAmount)
    {
        if (shouldRevert) revert ForcedRevert();
        _takeInput(srcToken, amount);
        returnAmount = amount > minReturn ? amount : minReturn;
        _sendOutput(dstToken, returnAmount);
    }

    function swapMulti(IERC20[] calldata tokens, uint256 amount, uint256 minReturn, FLAG[] calldata)
        external
        payable
        returns (uint256 returnAmount)
    {
        if (shouldRevert) revert ForcedRevert();
        _takeInput(tokens[0], amount);
        returnAmount = amount > minReturn ? amount : minReturn;
        _sendOutput(tokens[tokens.length - 1], returnAmount);
    }

    function _takeInput(IERC20 srcToken, uint256 amount) private {
        if (address(srcToken) == NATIVE_TOKEN) {
            require(msg.value == amount, "native amount");
        } else {
            require(msg.value == 0, "unexpected native");
            srcToken.safeTransferFrom(msg.sender, address(this), amount);
        }
    }

    function _sendOutput(IERC20 dstToken, uint256 amount) private {
        if (address(dstToken) == NATIVE_TOKEN) {
            (bool sent,) = payable(msg.sender).call{ value: amount }("");
            if (!sent) revert NativeTransferFailed();
        } else {
            dstToken.safeTransfer(msg.sender, amount);
        }
    }

    receive() external payable { }
}
