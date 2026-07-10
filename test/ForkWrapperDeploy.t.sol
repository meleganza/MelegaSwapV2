// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {MelegaSmartRouterWrapper} from "../contracts/MelegaSmartRouterWrapper.sol";
import {DeployEnv} from "../script/DeployEnv.sol";

/// @notice Fork simulation for chain 56 — skips safely when RPC or constructor args missing.
contract ForkWrapperDeployTest is Test, DeployEnv {
    uint256 internal constant BSC_MAINNET_CHAIN_ID = 56;

    function test_forkSimulateMainnetDeploy() public {
        string memory rpc = vm.envOr("BNB_MAINNET_RPC_URL", string(""));
        if (bytes(rpc).length == 0) {
            console2.log("SKIP: BNB_MAINNET_RPC_URL not set");
            return;
        }

        WrapperDeployConfig memory cfg = resolveWrapperDeployConfig();
        if (!_hasCompleteConfig(cfg)) {
            console2.log("SKIP: constructor env incomplete (need UNDERLYING_ROUTER, TREASURY_INTAKE, MARCO_TOKEN, DEPLOYER_OWNER)");
            return;
        }

        vm.createSelectFork(rpc);
        assertEq(block.chainid, BSC_MAINNET_CHAIN_ID, "unexpected fork chainId");

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

        assertEq(wrapper.underlyingRouter(), cfg.underlyingRouter);
        assertEq(wrapper.treasuryCollector(), cfg.treasuryIntake);
        assertEq(wrapper.marcoToken(), cfg.marcoToken);

        console2.log("FORK_DEPLOY_OK", address(wrapper));
        console2.log("gasUsed", gasUsed);
    }

    function _hasCompleteConfig(WrapperDeployConfig memory cfg) internal pure returns (bool) {
        return cfg.underlyingRouter != address(0) && cfg.treasuryIntake != address(0) && cfg.marcoToken != address(0)
            && cfg.owner != address(0);
    }
}
