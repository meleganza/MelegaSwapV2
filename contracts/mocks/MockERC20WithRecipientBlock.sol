// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice ERC20 that can block transfers to a configured recipient for revert-path tests.
contract MockERC20WithRecipientBlock is ERC20 {
    address public blockedRecipient;

    error RecipientBlocked(address recipient);

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function setBlockedRecipient(address recipient) external {
        blockedRecipient = recipient;
    }

    function _update(address from, address to, uint256 value) internal override {
        if (to == blockedRecipient && blockedRecipient != address(0)) {
            revert RecipientBlocked(to);
        }
        super._update(from, to, value);
    }
}
