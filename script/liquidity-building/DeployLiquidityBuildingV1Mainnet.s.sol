// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console2 } from "forge-std/Script.sol";
import {
    LiquidityBuildingExecutionAuthorizerV1
} from "../../contracts/liquidity-building/LiquidityBuildingExecutionAuthorizerV1.sol";
import {
    LiquidityBuildingTreasuryFeeReceiverV1
} from "../../contracts/liquidity-building/LiquidityBuildingTreasuryFeeReceiverV1.sol";
import {
    LiquidityBuildingTreasuryFeeSinkV1
} from "../../contracts/liquidity-building/LiquidityBuildingTreasuryFeeSinkV1.sol";
import { LiquidityBuildingFactoryV1 } from "../../contracts/liquidity-building/LiquidityBuildingFactoryV1.sol";
import { LiquidityBuildingProgramV1 } from "../../contracts/liquidity-building/LiquidityBuildingProgramV1.sol";
import { LBTypes } from "../../contracts/liquidity-building/interfaces/ILiquidityBuildingFactoryV1.sol";

/**
 * @title DeployLiquidityBuildingV1Mainnet
 * @notice Production BSC mainnet deploy for Liquidity Building V1.
 * @dev Fail-closed. Requires:
 *      - env LB_MAINNET_DEPLOY_AUTHORIZED=1
 *      - env LB_PRODUCTION_AUTHORITY (non-exportable KMS-derived address)
 *      - env LB_FEE_RECEIVER_GOVERNOR
 *      - env LB_FEE_RECEIVER_BENEFICIARY
 *      - forge --broadcast with MAINNET_DEPLOYER
 *
 * Order: FeeReceiver → Authorizer → FeeSink → Program impl → Factory
 *
 * NEVER invent addresses. NEVER use hot private keys as productionAuthority.
 */
contract DeployLiquidityBuildingV1Mainnet is Script {
    bytes32 constant FACTORY_VERSION = keccak256("LiquidityBuildingFactoryV1");
    address constant MELEGA_FACTORY = 0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C;
    address constant MELEGA_ROUTER = 0xc25033218D181b27D4a2944Fbb04FC055da4EAB3;
    address constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;

    error DeployNotAuthorized(string reason);
    error ZeroAddress(string field);

    function run() external {
        if (!_authorized()) {
            revert DeployNotAuthorized(
                "Set LB_MAINNET_DEPLOY_AUTHORIZED=1 and provide LB_PRODUCTION_AUTHORITY + fee receiver roles"
            );
        }

        address authority = vm.envAddress("LB_PRODUCTION_AUTHORITY");
        address governor = vm.envAddress("LB_FEE_RECEIVER_GOVERNOR");
        address beneficiary = vm.envAddress("LB_FEE_RECEIVER_BENEFICIARY");
        if (authority == address(0)) revert ZeroAddress("LB_PRODUCTION_AUTHORITY");
        if (governor == address(0)) revert ZeroAddress("LB_FEE_RECEIVER_GOVERNOR");
        if (beneficiary == address(0)) revert ZeroAddress("LB_FEE_RECEIVER_BENEFICIARY");

        uint256 deployerKey = vm.envUint("MAINNET_DEPLOYER");
        vm.startBroadcast(deployerKey);

        LiquidityBuildingTreasuryFeeReceiverV1 receiver =
            new LiquidityBuildingTreasuryFeeReceiverV1(governor, beneficiary);
        LiquidityBuildingExecutionAuthorizerV1 authorizer =
            new LiquidityBuildingExecutionAuthorizerV1(authority);
        LiquidityBuildingTreasuryFeeSinkV1 sink = new LiquidityBuildingTreasuryFeeSinkV1(address(receiver));
        LiquidityBuildingProgramV1 impl = new LiquidityBuildingProgramV1();

        LBTypes.QuoteAssetPolicy[] memory policies = new LBTypes.QuoteAssetPolicy[](1);
        // Floors from quote-policy-calculation.v1.json (WBNB candidate) — only after founder ratification
        // is recorded in LiquidityBuildingV1.inputs.json. Broadcast remains gated by env authorization.
        policies[0] = LBTypes.QuoteAssetPolicy({
            asset: WBNB,
            decimals: 18,
            enabled: true,
            minimumGrossQuoteFloor: 41052631578947370,
            minimumQuoteReserve: 10263157894736842500,
            gasConversionMode: LBTypes.GasConversionMode.NativeEquivalent,
            gasConversionReference: address(0)
        });

        LiquidityBuildingFactoryV1 factory = new LiquidityBuildingFactoryV1(
            FACTORY_VERSION,
            address(impl),
            MELEGA_FACTORY,
            MELEGA_ROUTER,
            address(authorizer),
            address(sink),
            _params(),
            policies
        );

        vm.stopBroadcast();

        console2.log("lbFeeReceiver", address(receiver));
        console2.log("lbAuthorizer", address(authorizer));
        console2.log("lbFeeSink", address(sink));
        console2.log("lbProgramImplementation", address(impl));
        console2.log("lbFactory", address(factory));
        console2.log("MELEGA_FACTORY", MELEGA_FACTORY);
        console2.log("MELEGA_ROUTER", MELEGA_ROUTER);
    }

    function _authorized() internal view returns (bool) {
        try vm.envBool("LB_MAINNET_DEPLOY_AUTHORIZED") returns (bool ok) {
            return ok;
        } catch {
            return false;
        }
    }

    function _params() internal pure returns (LBTypes.ProtocolParameters memory p) {
        p = LBTypes.ProtocolParameters({
            successFeeBps: 500,
            strategyCeilingBps: 5000,
            operatingCurveImpactBps: 40,
            hardCurveImpactBps: 100,
            hardEffectiveDeviationBps: 150,
            decisionExecutionDriftBps: 100,
            swapSlippageOperatingBps: 50,
            hardSlippageBps: 100,
            remainingBudgetEpochCapBps: 500,
            totalBudgetEpochCapBps: 200,
            rolling24hTotalBudgetCapBps: 2000,
            maximumGasCostShareBps: 1000,
            initialFinalityDepth: 15,
            maxSuccessfulExecutionsPerEpoch: 1
        });
    }
}
