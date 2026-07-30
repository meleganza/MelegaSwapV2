// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MelegaFixedSupplyToken
 * @notice Canonical Melega-created BEP-20/ERC-20 token: fixed supply, minted once to owner.
 * @dev No Ownable, no mint after construction, no pause, no blacklist, no tax, no upgradeability.
 *      Uses OpenZeppelin ERC20 already vendored in this repository.
 */
contract MelegaFixedSupplyToken is ERC20 {
    uint8 private immutable _tokenDecimals;

    error ZeroOwner();
    error ZeroSupply();
    error DecimalsTooHigh(uint8 decimals_);

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 totalSupply_,
        address owner_
    ) ERC20(name_, symbol_) {
        if (owner_ == address(0)) revert ZeroOwner();
        if (totalSupply_ == 0) revert ZeroSupply();
        if (decimals_ > 18) revert DecimalsTooHigh(decimals_);
        _tokenDecimals = decimals_;
        _mint(owner_, totalSupply_);
    }

    function decimals() public view override returns (uint8) {
        return _tokenDecimals;
    }
}
