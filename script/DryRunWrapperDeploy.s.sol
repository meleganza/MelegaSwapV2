// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {MelegaSmartRouterWrapper} from "../contracts/MelegaSmartRouterWrapper.sol";
import {DeployEnv} from "./DeployEnv.sol";

/// @notice Simulates wrapper deploy without broadcast. Reverts if any constructor arg is null.
contract DryRunWrapperDeploy is DeployEnv {
    function run() external {
        WrapperDeployConfig memory cfg = resolveWrapperDeployConfig();
        assertNoNullAddresses(cfg);

        uint256 gasBefore = gasleft();
        MelegaSmartRouterWrapper wrapper = new MelegaSmartRouterWrapper(
            cfg.underlyingRouter,
            cfg.treasuryIntake,
            cfg.marcoToken,
            cfg.pricingRefHash,
            cfg.treasuryPolicyRefHash,
            cfg.owner
        );
        uint256 gasUsed = gasBefore - gasleft();

        console2.log("DRY_RUN_OK");
        console2.log("chainId", cfg.chainId);
        console2.log("wrapper", address(wrapper));
        console2.log("gasUsed", gasUsed);
    }
}
