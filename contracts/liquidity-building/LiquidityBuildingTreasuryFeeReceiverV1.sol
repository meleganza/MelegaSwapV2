// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title LiquidityBuildingTreasuryFeeReceiverV1
 * @notice Minimal purpose-specific on-chain intake for Liquidity Building success fees.
 * @dev FeeSink requires a contract with bytecode (rejects EOAs). This receiver:
 *      - accepts ERC-20 balances pushed via FeeSink transferFrom → receiver
 *      - does NOT authorize epochs, issue tickets, or own user LP
 *      - exposes governor-controlled recovery to a fixed beneficiary
 *
 * NOT a Melega Vault wrapper. Vault 0xb2d57B1A40E61AAb3F88361228E1188E0fB6A21C remains
 * INVALID as LB fee receiver unless separate role evidence overturns that rejection.
 */
contract LiquidityBuildingTreasuryFeeReceiverV1 {
    using SafeERC20 for IERC20;

    error ZeroGovernor();
    error ZeroBeneficiary();
    error NotGovernor();
    error ZeroToken();
    error ZeroAmount();

    address public immutable governor;
    address public immutable beneficiary;

    event LiquidityBuildingFeeAssetRecovered(
        address indexed token,
        address indexed to,
        uint256 amount,
        address indexed operator
    );

    constructor(address governor_, address beneficiary_) {
        if (governor_ == address(0)) revert ZeroGovernor();
        if (beneficiary_ == address(0)) revert ZeroBeneficiary();
        governor = governor_;
        beneficiary = beneficiary_;
    }

    function recoverERC20(address token, uint256 amount) external {
        if (msg.sender != governor) revert NotGovernor();
        if (token == address(0)) revert ZeroToken();
        if (amount == 0) revert ZeroAmount();
        IERC20(token).safeTransfer(beneficiary, amount);
        emit LiquidityBuildingFeeAssetRecovered(token, beneficiary, amount, msg.sender);
    }
}
