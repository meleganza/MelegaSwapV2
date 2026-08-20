// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {SmartSwapExecutorV1} from "../contracts/smartswap/SmartSwapExecutorV1.sol";

/// @notice Simulates SmartSwapExecutorV1 construction. Never broadcasts.
contract DryRunDeploySmartSwapExecutorV1 is Script {
    address internal constant TREASURY = 0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b;
    address internal constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;

    function run() external {
        uint256 pk = uint256(keccak256("smartswap-m5-dry-run-owner"));
        address owner = vm.addr(pk);
        address intentSigner = vm.addr(uint256(keccak256("smartswap-m5-dry-run-signer")));

        uint256 gasBefore = gasleft();
        SmartSwapExecutorV1 executor = new SmartSwapExecutorV1(TREASURY, intentSigner, WBNB, owner);
        uint256 gasUsed = gasBefore - gasleft();

        require(executor.treasury() == TREASURY, "treasury");
        require(executor.intentSigner() == intentSigner, "signer");
        require(executor.wrappedNative() == WBNB, "wbnb");

        console2.log("DRY_RUN_OK");
        console2.log("executor", address(executor));
        console2.log("treasury", executor.treasury());
        console2.log("gasUsed", gasUsed);
        console2.log("broadcast", uint256(0));
    }
}
