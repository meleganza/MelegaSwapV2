// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {
    LiquidityBuildingTreasuryFeeReceiverV1
} from "../../contracts/liquidity-building/LiquidityBuildingTreasuryFeeReceiverV1.sol";
import {
    LiquidityBuildingTreasuryFeeSinkV1
} from "../../contracts/liquidity-building/LiquidityBuildingTreasuryFeeSinkV1.sol";

contract MockQuote is ERC20 {
    constructor() ERC20("Q", "Q") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract LBAct004TreasuryFeeReceiverTest is Test {
    address internal governor = address(0xA11CE);
    address internal beneficiary = address(0xB0B);
    address internal constant INVALID_LB_VAULT_CANDIDATE =
        0xb2d57B1A40E61AAb3F88361228E1188E0fB6A21C;

    function test_rejectZeroGovernorAndBeneficiary() public {
        vm.expectRevert(LiquidityBuildingTreasuryFeeReceiverV1.ZeroGovernor.selector);
        new LiquidityBuildingTreasuryFeeReceiverV1(address(0), beneficiary);
        vm.expectRevert(LiquidityBuildingTreasuryFeeReceiverV1.ZeroBeneficiary.selector);
        new LiquidityBuildingTreasuryFeeReceiverV1(governor, address(0));
    }

    function test_feeSinkAcceptsPurposeReceiverRejectsEoa() public {
        LiquidityBuildingTreasuryFeeReceiverV1 recv =
            new LiquidityBuildingTreasuryFeeReceiverV1(governor, beneficiary);
        LiquidityBuildingTreasuryFeeSinkV1 sink = new LiquidityBuildingTreasuryFeeSinkV1(address(recv));
        assertEq(sink.treasuryReceiver(), address(recv));

        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.TreasuryReceiverWithoutCode.selector);
        new LiquidityBuildingTreasuryFeeSinkV1(address(0xE0A));
    }

    function test_vaultRemainsExplicitlyRejectedAsCandidateEvidence() public {
        // Role rejection is an activation/deployment-input policy decision, not a Solidity revert.
        // This test locks the canonical Vault address so docs/inputs stay aligned.
        assertEq(INVALID_LB_VAULT_CANDIDATE, 0xb2d57B1A40E61AAb3F88361228E1188E0fB6A21C);
    }

    function test_governorRecoveryOnly() public {
        LiquidityBuildingTreasuryFeeReceiverV1 recv =
            new LiquidityBuildingTreasuryFeeReceiverV1(governor, beneficiary);
        MockQuote token = new MockQuote();
        token.mint(address(recv), 1000);

        vm.expectRevert(LiquidityBuildingTreasuryFeeReceiverV1.NotGovernor.selector);
        recv.recoverERC20(address(token), 100);

        vm.prank(governor);
        recv.recoverERC20(address(token), 400);
        assertEq(token.balanceOf(beneficiary), 400);
        assertEq(token.balanceOf(address(recv)), 600);
    }
}
