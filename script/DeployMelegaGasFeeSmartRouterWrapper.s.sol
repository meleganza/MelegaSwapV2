// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console2 } from "forge-std/Script.sol";
import { MelegaGasFeeSmartRouterWrapper } from "../contracts/MelegaGasFeeSmartRouterWrapper.sol";

/// @notice Mainnet deployment script. Broadcast only after external review.
/// Required env: SMART_ROUTER, MELEGA_TREASURY_WALLET, DEPLOYER_OWNER.
contract DeployMelegaGasFeeSmartRouterWrapper is Script {
    function run() external returns (MelegaGasFeeSmartRouterWrapper wrapper) {
        address router = vm.envAddress("SMART_ROUTER");
        address payable treasury = payable(vm.envAddress("MELEGA_TREASURY_WALLET"));
        address owner = vm.envAddress("DEPLOYER_OWNER");

        vm.startBroadcast();
        wrapper = new MelegaGasFeeSmartRouterWrapper(router, treasury, owner);
        vm.stopBroadcast();

        console2.log("MelegaGasFeeSmartRouterWrapper", address(wrapper));
    }
}
