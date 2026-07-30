// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console2 } from "forge-std/Script.sol";
import { MelegaTokenFactory } from "../../contracts/create-token/MelegaTokenFactory.sol";

/**
 * @title DryRunDeployMelegaTokenFactory
 * @notice Local/anvil dry-run — never treat addresses as production.
 */
contract DryRunDeployMelegaTokenFactory is Script {
    address constant CANONICAL_TREASURY = 0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b;

    function run() external {
        uint256 fee = vm.envOr("CT_CREATION_FEE_WEI", uint256(0.01 ether));
        vm.startBroadcast();
        MelegaTokenFactory factory = new MelegaTokenFactory(CANONICAL_TREASURY, fee);
        vm.stopBroadcast();
        console2.log("DRY_RUN_ONLY factory", address(factory));
        console2.log("DRY_RUN_ONLY fee", fee);
        console2.log("DRY_RUN_ONLY treasury", CANONICAL_TREASURY);
        console2.log("DO_NOT_BIND_AS_PRODUCTION");
    }
}
