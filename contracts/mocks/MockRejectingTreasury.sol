// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Treasury mock that rejects inbound native value for revert-path tests.
contract MockRejectingTreasury {
    bool public rejectEth;

    function setRejectEth(bool value) external {
        rejectEth = value;
    }

    receive() external payable {
        if (rejectEth) revert("REJECT_ETH");
    }
}
