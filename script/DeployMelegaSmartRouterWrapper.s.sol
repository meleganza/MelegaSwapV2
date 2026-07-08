// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {MelegaSmartRouterWrapper} from "../contracts/MelegaSmartRouterWrapper.sol";

/// @notice Deployment scaffold only — do not broadcast without verified registry addresses.
/// @dev Required env:
///   UNDERLYING_ROUTER, TREASURY_COLLECTOR, MARCO_TOKEN, DEPLOYER_OWNER
/// Optional: PRICING_REF_HASH, TREASURY_POLICY_REF_HASH (defaults to D87 + FSC-01)
contract DeployMelegaSmartRouterWrapper is Script {
    function run() external {
        address underlyingRouter = vm.envAddress("UNDERLYING_ROUTER");
        address treasuryCollector = vm.envAddress("TREASURY_COLLECTOR");
        address marcoToken = vm.envAddress("MARCO_TOKEN");
        address owner = vm.envAddress("DEPLOYER_OWNER");

        bytes32 pricingRefHash = keccak256(bytes("D87_DEX_PRICING_RATIFIED"));
        bytes32 treasuryPolicyRefHash = keccak256(bytes("FSC-01"));

        console2.log("Scaffold deploy - underlyingRouter", underlyingRouter);
        console2.log("Scaffold deploy - treasuryCollector", treasuryCollector);
        console2.log("Scaffold deploy - marcoToken", marcoToken);
        console2.log("Scaffold deploy - owner", owner);

        vm.startBroadcast();
        MelegaSmartRouterWrapper wrapper = new MelegaSmartRouterWrapper(
            underlyingRouter,
            treasuryCollector,
            marcoToken,
            pricingRefHash,
            treasuryPolicyRefHash,
            owner
        );
        vm.stopBroadcast();

        console2.log("MelegaSmartRouterWrapper", address(wrapper));
    }
}
