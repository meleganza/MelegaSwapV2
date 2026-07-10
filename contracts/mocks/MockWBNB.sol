// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MockERC20} from "./MockERC20.sol";

/// @notice WBNB mock with payable deposit for native wrapper tests.
contract MockWBNB is MockERC20 {
    address public blockedRecipient;

    error RecipientBlocked(address recipient);

    constructor() MockERC20("WBNB", "WBNB") {}

    function setBlockedRecipient(address recipient) external {
        blockedRecipient = recipient;
    }

    function deposit() external payable {
        _mint(msg.sender, msg.value);
    }

    function _update(address from, address to, uint256 value) internal override {
        if (to == blockedRecipient && blockedRecipient != address(0)) {
            revert RecipientBlocked(to);
        }
        super._update(from, to, value);
    }
}
