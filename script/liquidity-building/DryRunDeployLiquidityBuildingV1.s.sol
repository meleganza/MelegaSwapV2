// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console2 } from "forge-std/Script.sol";
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
 * @title DryRunDeployLiquidityBuildingV1
 * @notice LB008 dry-run / simulation-only deployment script.
 * @dev NEVER reads a private key. NEVER broadcasts unless every production gate is green.
 *      Canonical mainnet broadcast remains BLOCKED while LB008 blockers remain open.
 *
 * Usage (simulation only):
 *   forge script script/liquidity-building/DryRunDeployLiquidityBuildingV1.s.sol \
 *     --sig "run()" -vv
 *
 * Broadcast is explicitly rejected by `runBroadcastBlocked()`.
 */
contract DryRunDeployLiquidityBuildingV1 is Script {
    bytes32 constant FACTORY_VERSION = keccak256("LiquidityBuildingFactoryV1");

    /// @dev Canonical Melega addresses — asserted in comments / docs; local dry-run uses mocks
    /// because Factory requires bytecode at dependency addresses (cannot use bare mainnet addrs on anvil).
    address constant MELEGA_FACTORY_CANONICAL = 0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C;
    address constant MELEGA_ROUTER_CANONICAL = 0xc25033218D181b27D4a2944Fbb04FC055da4EAB3;

    error BroadcastBlocked(string reason);

    /// @notice Local dry-run: deploys bytecode-equivalent instances with ephemeral local authority/receiver.
    /// @dev Local instances are NOT production bindings. Marked LOCAL / NO MAINNET BROADCAST.
    function run() external {
        console2.log("LB008 DryRunDeployLiquidityBuildingV1");
        console2.log("MODE: SIMULATION / LOCAL ONLY - NO MAINNET BROADCAST");
        console2.log("canonicalMelegaFactory", MELEGA_FACTORY_CANONICAL);
        console2.log("canonicalMelegaRouter", MELEGA_ROUTER_CANONICAL);

        // Ephemeral local-only authority — NOT production KMS authority.
        address localAuthority = address(uint160(uint256(keccak256("lb008-local-authority-not-production"))));
        address localReceiver = address(new LocalTreasuryReceiverStub());
        address localMelegaFactory = address(new LocalCodeStub());
        address localMelegaRouter = address(new LocalCodeStub());
        address localQuote = address(new LocalErc20DecimalsStub(18));

        LiquidityBuildingExecutionAuthorizerV1 authorizer = new LiquidityBuildingExecutionAuthorizerV1(localAuthority);
        LiquidityBuildingTreasuryFeeSinkV1 sink = new LiquidityBuildingTreasuryFeeSinkV1(localReceiver);
        LiquidityBuildingProgramV1 impl = new LiquidityBuildingProgramV1();

        LBTypes.QuoteAssetPolicy[] memory policies = new LBTypes.QuoteAssetPolicy[](1);
        // LOCAL DRY-RUN ONLY — NOT MAINNET QUOTE FLOORS / NOT RATIFIED
        policies[0] = LBTypes.QuoteAssetPolicy({
            asset: localQuote,
            decimals: 18,
            enabled: true,
            minimumGrossQuoteFloor: 1,
            minimumQuoteReserve: 1,
            gasConversionMode: LBTypes.GasConversionMode.NativeEquivalent,
            gasConversionReference: address(0)
        });

        LiquidityBuildingFactoryV1 factory = new LiquidityBuildingFactoryV1(
            FACTORY_VERSION,
            address(impl),
            localMelegaFactory,
            localMelegaRouter,
            address(authorizer),
            address(sink),
            _params(),
            policies
        );

        require(factory.executionAuthorizer() == address(authorizer), "authorizer");
        require(factory.treasuryFeeSink() == address(sink), "sink");
        require(authorizer.signingAuthority() == localAuthority, "authority");
        require(sink.treasuryReceiver() == localReceiver, "receiver");
        require(factory.successFeeBps() == 500, "fee");
        require(factory.initialFinalityDepth() == 15, "finality");

        console2.log("localAuthorizer", address(authorizer));
        console2.log("localSink", address(sink));
        console2.log("localImpl", address(impl));
        console2.log("localFactory", address(factory));
        console2.log("VERDICT: DRY_RUN_STRUCTURE_OK - PRODUCTION_BROADCAST_BLOCKED");
    }

    /// @notice Explicitly rejects any broadcast attempt until LB008 gates are green.
    function runBroadcastBlocked() external pure {
        revert BroadcastBlocked("LB008: canonical mainnet deploy blocked - authority/treasury/quote/runtime gates incomplete");
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

/// @dev Minimal contract stub so FeeSink constructor accepts a non-EOA receiver in local dry-run.
/// NOT a production Treasury receiver. NOT deployable as canonical intake.
contract LocalTreasuryReceiverStub {
    event StubIntake(address token, uint256 amount);

    function notifyLiquidityBuildingFee(address token, uint256 amount) external {
        emit StubIntake(token, amount);
    }
}

contract LocalCodeStub { }

contract LocalErc20DecimalsStub {
    uint8 public immutable decimals;

    constructor(uint8 d) {
        decimals = d;
    }
}
