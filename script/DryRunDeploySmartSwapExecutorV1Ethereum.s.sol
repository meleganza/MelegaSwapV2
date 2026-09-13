// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {SmartSwapExecutorV1} from "../contracts/smartswap/SmartSwapExecutorV1.sol";

/// @notice Simulates SmartSwapExecutorV1 construction for Ethereum WETH. Never broadcasts.
contract DryRunDeploySmartSwapExecutorV1Ethereum is Script {
    address internal constant TREASURY = 0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b;
    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    function run() external {
        uint256 pk = uint256(keccak256("smartswap-eth-dry-run-owner"));
        address owner = vm.addr(pk);
        address intentSigner = vm.addr(uint256(keccak256("smartswap-eth-dry-run-signer")));

        uint256 gasBefore = gasleft();
        SmartSwapExecutorV1 executor = new SmartSwapExecutorV1(TREASURY, intentSigner, WETH, owner);
        uint256 gasUsed = gasBefore - gasleft();

        require(executor.treasury() == TREASURY, "treasury");
        require(executor.intentSigner() == intentSigner, "signer");
        require(executor.wrappedNative() == WETH, "weth");

        console2.log("ETH_DRY_RUN_OK");
        console2.log("executor", address(executor));
        console2.log("treasury", executor.treasury());
        console2.log("wrappedNative", executor.wrappedNative());
        console2.log("gasUsed", gasUsed);
        console2.log("broadcast", uint256(0));
    }
}
