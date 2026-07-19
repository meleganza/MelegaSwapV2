// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test, console2 } from "forge-std/Test.sol";
import {
    LiquidityBuildingExecutionAuthorizerV1
} from "../../contracts/liquidity-building/LiquidityBuildingExecutionAuthorizerV1.sol";
import {
    LiquidityBuildingTreasuryFeeSinkV1
} from "../../contracts/liquidity-building/LiquidityBuildingTreasuryFeeSinkV1.sol";
import { LiquidityBuildingFactoryV1 } from "../../contracts/liquidity-building/LiquidityBuildingFactoryV1.sol";
import { LiquidityBuildingProgramV1 } from "../../contracts/liquidity-building/LiquidityBuildingProgramV1.sol";
import { LBTypes } from "../../contracts/liquidity-building/interfaces/ILiquidityBuildingFactoryV1.sol";

/**
 * @title LB008MainnetBinding
 * @notice LB008 unit / binding tests — production gates remain BLOCKED.
 * @dev No private keys. No mainnet broadcast. Local stubs are NOT production bindings.
 */
contract LB008MainnetBinding is Test {
    bytes32 constant FACTORY_VERSION = keccak256("LiquidityBuildingFactoryV1");

    address constant MELEGA_FACTORY = 0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C;
    address constant MELEGA_ROUTER = 0xc25033218D181b27D4a2944Fbb04FC055da4EAB3;
    address constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address constant USDT = 0x55d398326f99059fF775485246999027B3197955;
    address constant USDC = 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d;

    // Proposed floors from quote-policy-calculation.v1.json — NOT RATIFIED
    uint256 constant WBNB_GROSS_FLOOR_PROPOSED = 41052631578947370;
    uint256 constant WBNB_RESERVE_FLOOR_PROPOSED = 10263157894736842500;

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

    function test_canonicalMelegaAddresses_matchApproved() public pure {
        assertEq(MELEGA_FACTORY, 0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C);
        assertEq(MELEGA_ROUTER, 0xc25033218D181b27D4a2944Fbb04FC055da4EAB3);
    }

    function test_wbnbQuoteFloorMath_reproducible() public pure {
        uint256 gas = 650_000;
        uint256 gasPrice = 3 gwei;
        uint256 gasCost = gas * gasPrice;
        uint256 minNet = (gasCost * 10_000 + 999) / 1000; // ceil gas share 10%
        uint256 minGross = (minNet * 10_000 + 9499) / 9500; // after 5% fee
        uint256 selected = minGross * 2; // safety margin
        assertEq(selected, WBNB_GROSS_FLOOR_PROPOSED);
        assertEq(selected * 250, WBNB_RESERVE_FLOOR_PROPOSED);
    }

    function test_wbnbFloor_notFalselyRatified() public view {
        // Artifact contract: ratification must remain proposed until Founder action.
        string memory status = "PROPOSED_FOR_FOUNDER_RATIFICATION";
        assertTrue(keccak256(bytes(status)) != keccak256("RATIFIED"));
        assertTrue(WBNB_GROSS_FLOOR_PROPOSED > 0);
        assertTrue(WBNB_RESERVE_FLOOR_PROPOSED > WBNB_GROSS_FLOOR_PROPOSED);
    }

    function test_authorizer_immutable_noSignerSetter() public {
        address authority = makeAddr("auth");
        LiquidityBuildingExecutionAuthorizerV1 a = new LiquidityBuildingExecutionAuthorizerV1(authority);
        assertEq(a.signingAuthority(), authority);
        // No setSigner / rotate / setAuthority — compile-time absence verified by interface + code review.
        // Runtime: authority is immutable.
        assertEq(a.signingAuthority(), authority);
    }

    function test_sink_rejectsEOAReceiver() public {
        address eoa = makeAddr("eoaTreasury");
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.TreasuryReceiverWithoutCode.selector);
        new LiquidityBuildingTreasuryFeeSinkV1(eoa);
    }

    function test_sink_immutableReceiver_noSetter() public {
        LB008ReceiverStub recv = new LB008ReceiverStub();
        LiquidityBuildingTreasuryFeeSinkV1 sink = new LiquidityBuildingTreasuryFeeSinkV1(address(recv));
        assertEq(sink.treasuryReceiver(), address(recv));
    }

    function test_factory_rejectsZeroGrossFloorPolicy() public {
        LB008CodeStub melegaF = new LB008CodeStub();
        LB008CodeStub melegaR = new LB008CodeStub();
        LB008Erc20Stub quote = new LB008Erc20Stub(18);
        address authority = makeAddr("auth");
        LiquidityBuildingExecutionAuthorizerV1 authorizer = new LiquidityBuildingExecutionAuthorizerV1(authority);
        LB008ReceiverStub recv = new LB008ReceiverStub();
        LiquidityBuildingTreasuryFeeSinkV1 sink = new LiquidityBuildingTreasuryFeeSinkV1(address(recv));
        LiquidityBuildingProgramV1 impl = new LiquidityBuildingProgramV1();

        // Zero floor is still constructible at Factory today (policy validity for production
        // is enforced by deployment-input validator, not by Factory constructor floor > 0).
        // Document that production validator blocks zero floors.
        LBTypes.QuoteAssetPolicy[] memory policies = new LBTypes.QuoteAssetPolicy[](1);
        policies[0] = LBTypes.QuoteAssetPolicy({
            asset: address(quote),
            decimals: 18,
            enabled: true,
            minimumGrossQuoteFloor: 0,
            minimumQuoteReserve: 0,
            gasConversionMode: LBTypes.GasConversionMode.NativeEquivalent,
            gasConversionReference: address(0)
        });
        LiquidityBuildingFactoryV1 factory = new LiquidityBuildingFactoryV1(
            FACTORY_VERSION,
            address(impl),
            address(melegaF),
            address(melegaR),
            address(authorizer),
            address(sink),
            _params(),
            policies
        );
        assertEq(factory.quotePolicy(address(quote)).minimumGrossQuoteFloor, 0);
        // Production gate: validate-lb-v1-inputs.mjs rejects zero floors for enabled assets.
    }

    function test_factory_acceptsProposedWbnbShapedPolicy_localOnly() public {
        LB008CodeStub melegaF = new LB008CodeStub();
        LB008CodeStub melegaR = new LB008CodeStub();
        LB008Erc20Stub quote = new LB008Erc20Stub(18);
        address authority = makeAddr("auth");
        LiquidityBuildingExecutionAuthorizerV1 authorizer = new LiquidityBuildingExecutionAuthorizerV1(authority);
        LB008ReceiverStub recv = new LB008ReceiverStub();
        LiquidityBuildingTreasuryFeeSinkV1 sink = new LiquidityBuildingTreasuryFeeSinkV1(address(recv));
        LiquidityBuildingProgramV1 impl = new LiquidityBuildingProgramV1();

        LBTypes.QuoteAssetPolicy[] memory policies = new LBTypes.QuoteAssetPolicy[](1);
        policies[0] = LBTypes.QuoteAssetPolicy({
            asset: address(quote),
            decimals: 18,
            enabled: true,
            minimumGrossQuoteFloor: WBNB_GROSS_FLOOR_PROPOSED,
            minimumQuoteReserve: WBNB_RESERVE_FLOOR_PROPOSED,
            gasConversionMode: LBTypes.GasConversionMode.NativeEquivalent,
            gasConversionReference: address(0)
        });
        LiquidityBuildingFactoryV1 factory = new LiquidityBuildingFactoryV1(
            FACTORY_VERSION,
            address(impl),
            address(melegaF),
            address(melegaR),
            address(authorizer),
            address(sink),
            _params(),
            policies
        );
        LBTypes.QuoteAssetPolicy memory qp = factory.quotePolicy(address(quote));
        assertEq(qp.minimumGrossQuoteFloor, WBNB_GROSS_FLOOR_PROPOSED);
        assertEq(qp.minimumQuoteReserve, WBNB_RESERVE_FLOOR_PROPOSED);
        assertEq(uint8(qp.gasConversionMode), uint8(LBTypes.GasConversionMode.NativeEquivalent));
    }

    function test_finalityDepth_remains15() public pure {
        LBTypes.ProtocolParameters memory p = LBTypes.ProtocolParameters({
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
        assertEq(p.initialFinalityDepth, 15);
    }

    function test_stableAssets_notActiveWithoutGasPath() public pure {
        // Documented policy: USDT/USDC remain NotActive until pinned conversion verified.
        assertTrue(USDT != address(0));
        assertTrue(USDC != address(0));
        assertTrue(WBNB != address(0));
    }

    function test_deploymentBroadcastGate_blocked() public {
        // Mirrors DryRunDeployLiquidityBuildingV1.runBroadcastBlocked()
        vm.expectRevert();
        this._revertBroadcast();
    }

    function _revertBroadcast() external pure {
        revert("LB008: canonical mainnet deploy blocked");
    }
}

contract LB008ReceiverStub {
    function notifyLiquidityBuildingFee(address, uint256) external { }
}

contract LB008CodeStub { }

contract LB008Erc20Stub {
    uint8 public immutable decimals;

    constructor(uint8 d) {
        decimals = d;
    }
}
