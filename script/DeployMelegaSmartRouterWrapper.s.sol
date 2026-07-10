// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {MelegaSmartRouterWrapper} from "../contracts/MelegaSmartRouterWrapper.sol";
import {DeployEnv} from "./DeployEnv.sol";

/// @notice Deployment scaffold — broadcast only with verified registry addresses.
/// @dev Required env: UNDERLYING_ROUTER, TREASURY_INTAKE (or TREASURY_COLLECTOR), MARCO_TOKEN, DEPLOYER_OWNER
/// Optional: CHAIN_ID, PRICING_REF_HASH, TREASURY_POLICY_REF_HASH
/// RPC: forge script ... --rpc-url bsc_mainnet | bsc_testnet
/// Verify: add --verify --etherscan-api-key $BSCSCAN_API_KEY
contract DeployMelegaSmartRouterWrapper is DeployEnv {
    function run() external {
        WrapperDeployConfig memory cfg = resolveWrapperDeployConfig();
        assertNoNullAddresses(cfg);

        console2.log("Scaffold deploy - chainId", cfg.chainId);
        console2.log("Scaffold deploy - underlyingRouter", cfg.underlyingRouter);
        console2.log("Scaffold deploy - treasuryIntake", cfg.treasuryIntake);
        console2.log("Scaffold deploy - marcoToken", cfg.marcoToken);
        console2.log("Scaffold deploy - owner", cfg.owner);

        vm.startBroadcast();
        MelegaSmartRouterWrapper wrapper = new MelegaSmartRouterWrapper(
            cfg.underlyingRouter,
            cfg.treasuryIntake,
            cfg.marcoToken,
            cfg.pricingRefHash,
            cfg.treasuryPolicyRefHash,
            cfg.owner
        );
        vm.stopBroadcast();

        console2.log("MelegaSmartRouterWrapper", address(wrapper));
    }
}
