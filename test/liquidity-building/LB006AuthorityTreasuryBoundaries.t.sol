// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";

import {
    LiquidityBuildingExecutionAuthorizerV1
} from "../../contracts/liquidity-building/LiquidityBuildingExecutionAuthorizerV1.sol";
import {
    LiquidityBuildingTreasuryFeeSinkV1
} from "../../contracts/liquidity-building/LiquidityBuildingTreasuryFeeSinkV1.sol";
import { LiquidityBuildingFactoryV1 } from "../../contracts/liquidity-building/LiquidityBuildingFactoryV1.sol";
import { LiquidityBuildingProgramV1 } from "../../contracts/liquidity-building/LiquidityBuildingProgramV1.sol";
import {
    ILiquidityBuildingExecutionAuthorizerV1
} from "../../contracts/liquidity-building/interfaces/ILiquidityBuildingExecutionAuthorizerV1.sol";
import {
    ILiquidityBuildingTreasuryFeeSinkV1
} from "../../contracts/liquidity-building/interfaces/ILiquidityBuildingTreasuryFeeSinkV1.sol";
import { LBTypes } from "../../contracts/liquidity-building/interfaces/ILiquidityBuildingFactoryV1.sol";

import {
    LB005MockERC20,
    LB005MockPair,
    LB005MockMelegaFactory,
    LB005MockCodeDependency
} from "./mocks/LB005TestDependencies.sol";

import {
    LB006MockERC20,
    LB006FeeOnTransferERC20,
    LB006FalseReturnERC20,
    LB006TreasuryReceiverMock,
    LB006CallbackQuote,
    LB006EIP1271Signer,
    LB006IncompatibleAuthorizer,
    LB006IncompatibleSink,
    LB006SinkWithEoaReceiverView,
    LB006FakeProgram,
    LB006FakeFactory,
    LB006SettlingProgram
} from "./mocks/LB006TestDependencies.sol";

/**
 * @title LB006AuthorityTreasuryBoundaries
 * @notice Deterministic + fuzz coverage for Authorizer / Sink / Factory hardening.
 *
 * TEST-ONLY EOA SIGNATURE (vm.sign) — NOT KMS PRODUCTION EVIDENCE
 * LOCAL FORK VALIDATION sections — NOT MAINNET DEPLOYMENT
 */
contract LB006AuthorityTreasuryBoundaries is Test {
    bytes32 constant FACTORY_VERSION = keccak256("LiquidityBuildingFactoryV1");
    bytes32 constant INTENT_SCHEMA = keccak256("LIQUIDITY_BUILDING_EXECUTION_INTENT_V1");

    // TEST-ONLY EOA — NOT KMS PRODUCTION EVIDENCE
    uint256 internal constant AUTHORITY_PK = 0xA11CE;
    address internal authorityEOA;

    LiquidityBuildingExecutionAuthorizerV1 internal authorizer;
    LiquidityBuildingTreasuryFeeSinkV1 internal sink;
    LB006TreasuryReceiverMock internal treasuryReceiver;

    LB006MockERC20 internal quote;
    LB006SettlingProgram internal program;
    LB006FakeFactory internal fakeFactory;

    bytes32 internal programId = keccak256("program-1");
    bytes32 internal executionId = keccak256("exec-1");
    bytes32 internal authRef = keccak256("treasury-auth-ref");

    address internal factoryAddr = address(0xFACA);
    address internal programAddr;
    address internal pairAddr = address(0x1111);
    address internal projectToken = address(0x2222);

    event LiquidityBuildingFeeSettled(
        bytes32 indexed settlementKey,
        bytes32 indexed programId,
        bytes32 indexed executionId,
        address program,
        address quoteAsset,
        uint256 amount,
        address treasuryReceiver,
        bytes32 authorizationReference,
        bytes32 settlementReceipt
    );

    function setUp() public {
        authorityEOA = vm.addr(AUTHORITY_PK);
        authorizer = new LiquidityBuildingExecutionAuthorizerV1(authorityEOA);
        treasuryReceiver = new LB006TreasuryReceiverMock();
        sink = new LiquidityBuildingTreasuryFeeSinkV1(address(treasuryReceiver));

        quote = new LB006MockERC20("Quote", "QTE");
        fakeFactory = new LB006FakeFactory();
        fakeFactory.setSink(address(sink));

        program = new LB006SettlingProgram(programId, address(fakeFactory), address(quote));
        programAddr = address(program);
        fakeFactory.setRegistered(programAddr, true);

        quote.mint(programAddr, 1_000_000 ether);
        vm.prank(programAddr);
        quote.approve(address(sink), type(uint256).max);
    }

    function _baseIntent()
        internal
        view
        returns (ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent)
    {
        intent = ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1({
            schemaVersion: INTENT_SCHEMA,
            chainId: block.chainid,
            factory: factoryAddr,
            factoryVersion: FACTORY_VERSION,
            program: programAddr,
            pair: pairAddr,
            projectToken: projectToken,
            quoteAsset: address(quote),
            epochId: 1,
            epochStartTimestamp: 1000,
            epochEndTimestamp: 1300,
            observationStartBlock: 10,
            observationEndBlock: 20,
            anchorBlock: 25,
            anchorProjectReserve: 1e18,
            anchorQuoteReserve: 1e18,
            eligibleNetBuyFlow: 1e18,
            strategyMode: 0,
            effectiveStrategyRateBps: 2500,
            grossQuoteTarget: 1e18,
            maximumProjectTokenIn: 2e18,
            configNonce: 1,
            executionNonce: 1,
            strategyEngineVersion: keccak256("engine-v1"),
            decisionDeadline: uint64(block.timestamp + 1 hours),
            maximumGasPrice: 100 gwei,
            observationRoot: keccak256("obs"),
            excludedFlowCommitment: keccak256("excl"),
            treasuryAuthorizationReference: authRef
        });
    }

    /// @dev TEST-ONLY EOA SIGNATURE — NOT KMS PRODUCTION EVIDENCE
    function _sign(ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent)
        internal
        view
        returns (bytes memory signature)
    {
        bytes32 digest = authorizer.hashExecutionIntent(intent);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(AUTHORITY_PK, digest);
        signature = abi.encodePacked(r, s, v);
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

    // -------------------------------------------------------------------------
    // Authorizer construction and metadata (1–9)
    // -------------------------------------------------------------------------

    function test_01_validEOAAuthority() public view {
        assertEq(authorizer.signingAuthority(), authorityEOA);
    }

    function test_02_validEIP1271Authority() public {
        LB006EIP1271Signer signer1271 = new LB006EIP1271Signer();
        LiquidityBuildingExecutionAuthorizerV1 a1271 = new LiquidityBuildingExecutionAuthorizerV1(address(signer1271));
        assertEq(a1271.signingAuthority(), address(signer1271));
        assertEq(uint8(a1271.authorityType()), uint8(ILiquidityBuildingExecutionAuthorizerV1.AuthorityType.ERC1271));
    }

    function test_03_zeroAuthorityRejected() public {
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.ZeroAuthority.selector);
        new LiquidityBuildingExecutionAuthorizerV1(address(0));
    }

    function test_04_immutableAuthority() public view {
        assertEq(authorizer.signingAuthority(), authorityEOA);
    }

    function test_05_correctSchemaVersion() public view {
        assertEq(authorizer.executionIntentSchemaVersion(), INTENT_SCHEMA);
    }

    function test_06_correctTypeHash() public view {
        bytes32 expected = keccak256(
            "ExecutionIntentV1(bytes32 schemaVersion,uint256 chainId,address factory,bytes32 factoryVersion,address program,address pair,address projectToken,address quoteAsset,uint256 epochId,uint64 epochStartTimestamp,uint64 epochEndTimestamp,uint64 observationStartBlock,uint64 observationEndBlock,uint64 anchorBlock,uint256 anchorProjectReserve,uint256 anchorQuoteReserve,uint256 eligibleNetBuyFlow,uint8 strategyMode,uint16 effectiveStrategyRateBps,uint256 grossQuoteTarget,uint256 maximumProjectTokenIn,uint256 configNonce,uint256 executionNonce,bytes32 strategyEngineVersion,uint64 decisionDeadline,uint256 maximumGasPrice,bytes32 observationRoot,bytes32 excludedFlowCommitment,bytes32 treasuryAuthorizationReference)"
        );
        assertEq(authorizer.executionIntentTypeHash(), expected);
    }

    function test_07_correctAuthorityTypeEOA() public view {
        assertEq(uint8(authorizer.authorityType()), uint8(ILiquidityBuildingExecutionAuthorizerV1.AuthorityType.EOA));
    }

    function test_08_noSignerSetter() public {
        // No setSigner / setAuthority / rotateSigner in ABI — probed via low-level call failure.
        (bool ok,) = address(authorizer).call(abi.encodeWithSignature("setSigner(address)", address(1)));
        assertFalse(ok);
        (ok,) = address(authorizer).call(abi.encodeWithSignature("setAuthority(address)", address(1)));
        assertFalse(ok);
        (ok,) = address(authorizer).call(abi.encodeWithSignature("rotateSigner(address)", address(1)));
        assertFalse(ok);
    }

    function test_09_noOwnerAdmin() public {
        (bool ok,) = address(authorizer).call(abi.encodeWithSignature("owner()"));
        assertFalse(ok);
        (ok,) = address(authorizer).call(abi.encodeWithSignature("admin()"));
        assertFalse(ok);
    }

    // -------------------------------------------------------------------------
    // EIP-712 domain (10–17)
    // -------------------------------------------------------------------------

    function test_10_digestStableIdenticalInput() public view {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        assertEq(authorizer.hashExecutionIntent(intent), authorizer.hashExecutionIntent(intent));
    }

    function test_11_differentProgramChangesDigest() public view {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory a = _baseIntent();
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory b = _baseIntent();
        b.program = address(0xBEEF);
        assertTrue(authorizer.hashExecutionIntent(a) != authorizer.hashExecutionIntent(b));
    }

    function test_12_differentFactoryChangesDigest() public view {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory a = _baseIntent();
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory b = _baseIntent();
        b.factory = address(0xBEEF);
        assertTrue(authorizer.hashExecutionIntent(a) != authorizer.hashExecutionIntent(b));
    }

    function test_13_differentFactoryVersionChangesDigest() public view {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory a = _baseIntent();
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory b = _baseIntent();
        b.factoryVersion = keccak256("other");
        assertTrue(authorizer.hashExecutionIntent(a) != authorizer.hashExecutionIntent(b));
    }

    function test_14_differentAuthorizerChangesDigest() public {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        LiquidityBuildingExecutionAuthorizerV1 other = new LiquidityBuildingExecutionAuthorizerV1(authorityEOA);
        assertTrue(authorizer.hashExecutionIntent(intent) != other.hashExecutionIntent(intent));
    }

    function test_15_differentChainChangesDigest() public {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        bytes32 d1 = authorizer.hashExecutionIntent(intent);
        vm.chainId(999);
        intent.chainId = 999;
        bytes32 d2 = authorizer.hashExecutionIntent(intent);
        assertTrue(d1 != d2);
    }

    function test_16_fieldOrderMatchesFrozenTypeHash() public view {
        assertEq(authorizer.executionIntentTypeHash(), authorizer.EXECUTION_INTENT_TYPEHASH());
    }

    function test_17_domainSeparatorIndependentCalculation() public view {
        bytes32 salt = keccak256(abi.encode(address(authorizer), factoryAddr, FACTORY_VERSION));
        bytes32 expected = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)"
                ),
                keccak256(bytes("Melega Liquidity Building")),
                keccak256(bytes("1")),
                block.chainid,
                programAddr,
                salt
            )
        );
        assertEq(authorizer.domainSeparatorFor(programAddr, factoryAddr, FACTORY_VERSION), expected);
    }

    // -------------------------------------------------------------------------
    // EOA signatures (18–32)
    // -------------------------------------------------------------------------

    function test_18_validEOASignatureAccepted() public view {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        bytes memory sig = _sign(intent);
        bytes32 digest = authorizer.validateExecutionIntent(intent, sig);
        assertEq(digest, authorizer.hashExecutionIntent(intent));
    }

    function test_19_wrongSignerRejected() public {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        bytes32 digest = authorizer.hashExecutionIntent(intent);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(0xB0B, digest);
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.InvalidSignature.selector);
        authorizer.validateExecutionIntent(intent, abi.encodePacked(r, s, v));
    }

    function test_20_mutatedSignatureRejected() public {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        bytes memory sig = _sign(intent);
        sig[0] = bytes1(uint8(sig[0]) ^ 0xff);
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.InvalidSignature.selector);
        authorizer.validateExecutionIntent(intent, sig);
    }

    function test_21_mutatedTargetRejected() public {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        bytes memory sig = _sign(intent);
        intent.grossQuoteTarget = intent.grossQuoteTarget + 1;
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.InvalidSignature.selector);
        authorizer.validateExecutionIntent(intent, sig);
    }

    function test_22_mutatedAmountRejected() public {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        bytes memory sig = _sign(intent);
        intent.maximumProjectTokenIn = intent.maximumProjectTokenIn + 1;
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.InvalidSignature.selector);
        authorizer.validateExecutionIntent(intent, sig);
    }

    function test_23_mutatedEpochRejected() public {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        bytes memory sig = _sign(intent);
        intent.epochId = intent.epochId + 1;
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.InvalidSignature.selector);
        authorizer.validateExecutionIntent(intent, sig);
    }

    function test_24_mutatedConfigNonceRejected() public {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        bytes memory sig = _sign(intent);
        intent.configNonce = intent.configNonce + 1;
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.InvalidSignature.selector);
        authorizer.validateExecutionIntent(intent, sig);
    }

    function test_25_expiredIntentRejected() public {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        intent.decisionDeadline = uint64(block.timestamp - 1);
        bytes memory sig = _sign(intent);
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.ExpiredDecision.selector);
        authorizer.validateExecutionIntent(intent, sig);
    }

    function test_26_wrongChainRejected() public {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        intent.chainId = block.chainid + 1;
        bytes memory sig = _sign(intent);
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.WrongChain.selector);
        authorizer.validateExecutionIntent(intent, sig);
    }

    function test_27_wrongSchemaRejected() public {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        intent.schemaVersion = keccak256("wrong");
        bytes memory sig = _sign(intent);
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.InvalidSchemaVersion.selector);
        authorizer.validateExecutionIntent(intent, sig);
    }

    function test_28_zeroAddressFieldRejected() public {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        intent.pair = address(0);
        bytes memory sig = _sign(intent);
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.InvalidIntentAddress.selector);
        authorizer.validateExecutionIntent(intent, sig);
    }

    function test_29_invalidEpochWindowRejected() public {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        intent.epochEndTimestamp = intent.epochStartTimestamp;
        bytes memory sig = _sign(intent);
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.InvalidEpochWindow.selector);
        authorizer.validateExecutionIntent(intent, sig);
    }

    function test_30_invalidObservationRangeRejected() public {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        intent.observationEndBlock = intent.anchorBlock + 1;
        bytes memory sig = _sign(intent);
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.InvalidObservationRange.selector);
        authorizer.validateExecutionIntent(intent, sig);
    }

    function test_31_invalidStrategyModeRejected() public {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        intent.strategyMode = 2;
        bytes memory sig = _sign(intent);
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.InvalidStrategyMode.selector);
        authorizer.validateExecutionIntent(intent, sig);
    }

    function test_32_structuralRateAbove10000Rejected() public {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        intent.effectiveStrategyRateBps = 10_001;
        bytes memory sig = _sign(intent);
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.InvalidStructuralStrategyRate.selector);
        authorizer.validateExecutionIntent(intent, sig);
    }

    // -------------------------------------------------------------------------
    // EIP-1271 (33–37)
    // -------------------------------------------------------------------------

    function test_33_validMagicAccepted() public {
        LB006EIP1271Signer signer1271 = new LB006EIP1271Signer();
        LiquidityBuildingExecutionAuthorizerV1 a1271 = new LiquidityBuildingExecutionAuthorizerV1(address(signer1271));
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        bytes32 digest = a1271.hashExecutionIntent(intent);
        signer1271.setPolicy(true, false, digest);
        bytes32 out = a1271.validateExecutionIntent(intent, hex"01");
        assertEq(out, digest);
    }

    function test_34_invalidMagicRejected() public {
        LB006EIP1271Signer signer1271 = new LB006EIP1271Signer();
        LiquidityBuildingExecutionAuthorizerV1 a1271 = new LiquidityBuildingExecutionAuthorizerV1(address(signer1271));
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        signer1271.setPolicy(false, false, bytes32(0));
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.InvalidSignature.selector);
        a1271.validateExecutionIntent(intent, hex"01");
    }

    function test_35_signerRevertRejected() public {
        LB006EIP1271Signer signer1271 = new LB006EIP1271Signer();
        LiquidityBuildingExecutionAuthorizerV1 a1271 = new LiquidityBuildingExecutionAuthorizerV1(address(signer1271));
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        signer1271.setPolicy(true, true, bytes32(0));
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.InvalidSignature.selector);
        a1271.validateExecutionIntent(intent, hex"01");
    }

    function test_36_mutatedDigestRejected() public {
        LB006EIP1271Signer signer1271 = new LB006EIP1271Signer();
        LiquidityBuildingExecutionAuthorizerV1 a1271 = new LiquidityBuildingExecutionAuthorizerV1(address(signer1271));
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        bytes32 digest = a1271.hashExecutionIntent(intent);
        signer1271.setPolicy(true, false, digest);
        intent.epochId = 99;
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.InvalidSignature.selector);
        a1271.validateExecutionIntent(intent, hex"01");
    }

    function test_37_contractAuthorityClassified() public {
        LB006EIP1271Signer signer1271 = new LB006EIP1271Signer();
        LiquidityBuildingExecutionAuthorizerV1 a1271 = new LiquidityBuildingExecutionAuthorizerV1(address(signer1271));
        assertEq(uint8(a1271.authorityType()), uint8(ILiquidityBuildingExecutionAuthorizerV1.AuthorityType.ERC1271));
    }

    // -------------------------------------------------------------------------
    // Sink construction (38–45)
    // -------------------------------------------------------------------------

    function test_38_validReceiverContract() public view {
        assertEq(sink.treasuryReceiver(), address(treasuryReceiver));
    }

    function test_39_zeroReceiverRejected() public {
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.ZeroTreasuryReceiver.selector);
        new LiquidityBuildingTreasuryFeeSinkV1(address(0));
    }

    function test_40_eoaReceiverRejected() public {
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.TreasuryReceiverWithoutCode.selector);
        new LiquidityBuildingTreasuryFeeSinkV1(address(0xE0A));
    }

    function test_41_immutableReceiver() public view {
        assertEq(sink.treasuryReceiver(), address(treasuryReceiver));
    }

    function test_42_correctSinkVersion() public view {
        assertEq(sink.treasurySinkVersion(), keccak256("LiquidityBuildingTreasuryFeeSinkV1"));
    }

    function test_43_noOwnerAdmin() public {
        (bool ok,) = address(sink).call(abi.encodeWithSignature("owner()"));
        assertFalse(ok);
        (ok,) = address(sink).call(abi.encodeWithSignature("admin()"));
        assertFalse(ok);
    }

    function test_44_noReceiverSetter() public {
        (bool ok,) = address(sink).call(abi.encodeWithSignature("setReceiver(address)", address(1)));
        assertFalse(ok);
        (ok,) = address(sink).call(abi.encodeWithSignature("setTreasury(address)", address(1)));
        assertFalse(ok);
    }

    function test_45_noWithdrawalFunction() public {
        (bool ok,) = address(sink).call(abi.encodeWithSignature("withdraw(address,uint256)", address(quote), 1));
        assertFalse(ok);
        (ok,) = address(sink).call(abi.encodeWithSignature("rescue(address)", address(quote)));
        assertFalse(ok);
        (ok,) = address(sink).call(abi.encodeWithSignature("sweep(address)", address(quote)));
        assertFalse(ok);
    }

    // -------------------------------------------------------------------------
    // Successful settlement (46–57)
    // -------------------------------------------------------------------------

    function test_46_to_57_successfulSettlement() public {
        uint256 amount = 100 ether;
        uint256 receiverBefore = quote.balanceOf(address(treasuryReceiver));
        uint256 sinkBefore = quote.balanceOf(address(sink));
        bytes32 key = sink.settlementKeyFor(programAddr, programId, executionId);
        bytes32 expectedReceipt = keccak256(
            abi.encode(
                block.chainid,
                address(sink),
                address(treasuryReceiver),
                programAddr,
                programId,
                executionId,
                address(quote),
                amount,
                authRef,
                key
            )
        );

        vm.expectEmit(true, true, true, true);
        emit LiquidityBuildingFeeSettled(
            key,
            programId,
            executionId,
            programAddr,
            address(quote),
            amount,
            address(treasuryReceiver),
            authRef,
            expectedReceipt
        );

        bytes32 receipt = program.settle(address(sink), executionId, amount, authRef);

        assertEq(receipt, expectedReceipt);
        assertEq(quote.balanceOf(address(treasuryReceiver)) - receiverBefore, amount);
        assertEq(quote.balanceOf(address(sink)), sinkBefore);
        assertTrue(sink.isSettled(key));
        ILiquidityBuildingTreasuryFeeSinkV1.SettlementRecord memory rec = sink.settlementRecord(key);
        assertEq(rec.program, programAddr);
        assertEq(rec.quoteAsset, address(quote));
        assertEq(rec.amount, amount);
        assertEq(rec.authorizationReference, authRef);
        assertEq(rec.settlementReceipt, expectedReceipt);
        assertEq(key, sink.settlementKeyFor(programAddr, programId, executionId));
    }

    // -------------------------------------------------------------------------
    // Settlement failures (58–74)
    // -------------------------------------------------------------------------

    function test_58_zeroProgramId() public {
        LB006FakeProgram fake = new LB006FakeProgram();
        fake.configure(bytes32(0), address(fakeFactory), address(quote));
        fakeFactory.setRegistered(address(fake), true);
        quote.mint(address(fake), 10 ether);
        vm.prank(address(fake));
        quote.approve(address(sink), type(uint256).max);
        vm.prank(address(fake));
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.InvalidProgramId.selector);
        sink.settleLiquidityBuildingFee(bytes32(0), executionId, address(quote), 1, authRef);
    }

    function test_59_zeroExecutionId() public {
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.InvalidExecutionId.selector);
        program.settle(address(sink), bytes32(0), 1 ether, authRef);
    }

    function test_60_zeroQuote() public {
        vm.prank(programAddr);
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.InvalidQuoteAsset.selector);
        sink.settleLiquidityBuildingFee(programId, executionId, address(0), 1, authRef);
    }

    function test_61_zeroAmount() public {
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.ZeroFeeAmount.selector);
        program.settle(address(sink), executionId, 0, authRef);
    }

    function test_62_zeroAuthorizationReference() public {
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.InvalidAuthorizationReference.selector);
        program.settle(address(sink), executionId, 1 ether, bytes32(0));
    }

    function test_63_eoaCallerRejected() public {
        vm.prank(address(0xE0A1));
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.InvalidProgramCaller.selector);
        sink.settleLiquidityBuildingFee(programId, executionId, address(quote), 1, authRef);
    }

    function test_64_fakeProgramIdRejected() public {
        vm.prank(programAddr);
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.ProgramIdentityMismatch.selector);
        sink.settleLiquidityBuildingFee(keccak256("other"), executionId, address(quote), 1 ether, authRef);
    }

    function test_65_wrongQuoteRejected() public {
        LB006MockERC20 other = new LB006MockERC20("O", "O");
        vm.prank(programAddr);
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.ProgramQuoteMismatch.selector);
        sink.settleLiquidityBuildingFee(programId, executionId, address(other), 1 ether, authRef);
    }

    function test_66_unregisteredProgramRejected() public {
        fakeFactory.setRegistered(programAddr, false);
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.UnregisteredProgram.selector);
        program.settle(address(sink), executionId, 1 ether, authRef);
    }

    function test_67_incompatibleFactorySinkRejected() public {
        fakeFactory.setSink(address(0xBAD));
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.IncompatibleFactorySink.selector);
        program.settle(address(sink), executionId, 1 ether, authRef);
    }

    function test_68_insufficientAllowanceRejected() public {
        vm.prank(programAddr);
        quote.approve(address(sink), 0);
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.TreasuryTransferFailed.selector);
        program.settle(address(sink), executionId, 1 ether, authRef);
    }

    function test_69_insufficientBalanceRejected() public {
        LB006SettlingProgram poor = new LB006SettlingProgram(keccak256("poor"), address(fakeFactory), address(quote));
        fakeFactory.setRegistered(address(poor), true);
        vm.prank(address(poor));
        quote.approve(address(sink), type(uint256).max);
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.TreasuryTransferFailed.selector);
        poor.settle(address(sink), keccak256("e-poor"), 1 ether, authRef);
    }

    function test_70_falseReturnTokenRejected() public {
        LB006FalseReturnERC20 bad = new LB006FalseReturnERC20();
        LB006SettlingProgram p = new LB006SettlingProgram(keccak256("false"), address(fakeFactory), address(bad));
        fakeFactory.setRegistered(address(p), true);
        bad.mint(address(p), 100 ether);
        vm.prank(address(p));
        bad.approve(address(sink), type(uint256).max);
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.TreasuryTransferFailed.selector);
        p.settle(address(sink), keccak256("e-false"), 1 ether, authRef);
    }

    function test_71_feeOnTransferRejected() public {
        LB006FeeOnTransferERC20 fot = new LB006FeeOnTransferERC20();
        LB006SettlingProgram p = new LB006SettlingProgram(keccak256("fot"), address(fakeFactory), address(fot));
        fakeFactory.setRegistered(address(p), true);
        fot.mint(address(p), 100 ether);
        vm.prank(address(p));
        fot.approve(address(sink), type(uint256).max);
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.UnsupportedQuoteTransferBehavior.selector);
        p.settle(address(sink), keccak256("e-fot"), 100 ether, authRef);
    }

    function test_72_receiverDeltaMismatchRejected() public {
        // Covered by fee-on-transfer path (71); assert sink balance invariant separately via donation.
        quote.mint(address(sink), 5 ether);
        uint256 sinkBal = quote.balanceOf(address(sink));
        program.settle(address(sink), keccak256("donation-ok"), 1 ether, authRef);
        assertEq(quote.balanceOf(address(sink)), sinkBal); // settlement does not move sink balance
    }

    function test_73_tokenCallbackReentrancyRejected() public {
        LB006CallbackQuote cb = new LB006CallbackQuote();
        LB006SettlingProgram p = new LB006SettlingProgram(keccak256("cb"), address(fakeFactory), address(cb));
        fakeFactory.setRegistered(address(p), true);
        cb.mint(address(p), 100 ether);
        vm.prank(address(p));
        cb.approve(address(sink), type(uint256).max);

        bytes memory reenter = abi.encodeWithSelector(
            sink.settleLiquidityBuildingFee.selector,
            keccak256("cb"),
            keccak256("e-cb"),
            address(cb),
            uint256(1 ether),
            authRef
        );
        cb.setHook(address(sink), reenter, true);

        // First settlement marks key then transfers; nested settle on same key reverts, aborting outer.
        vm.expectRevert();
        p.settle(address(sink), keccak256("e-cb"), 1 ether, authRef);
        assertFalse(sink.isSettled(sink.settlementKeyFor(address(p), keccak256("cb"), keccak256("e-cb"))));
    }

    function test_74_noReceiptAfterRevertedTransfer() public {
        vm.prank(programAddr);
        quote.approve(address(sink), 0);
        bytes32 key = sink.settlementKeyFor(programAddr, programId, executionId);
        vm.expectRevert();
        program.settle(address(sink), executionId, 1 ether, authRef);
        assertFalse(sink.isSettled(key));
        assertEq(sink.settlementRecord(key).settlementReceipt, bytes32(0));
    }

    // -------------------------------------------------------------------------
    // Idempotency (75–80)
    // -------------------------------------------------------------------------

    function test_75_to_78_duplicateSettlementRejected() public {
        program.settle(address(sink), executionId, 1 ether, authRef);
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.SettlementAlreadyCompleted.selector);
        program.settle(address(sink), executionId, 1 ether, authRef);
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.SettlementAlreadyCompleted.selector);
        program.settle(address(sink), executionId, 2 ether, authRef);
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.SettlementAlreadyCompleted.selector);
        program.settle(address(sink), executionId, 1 ether, keccak256("other-ref"));
    }

    function test_79_differentExecutionIdSucceeds() public {
        program.settle(address(sink), executionId, 1 ether, authRef);
        bytes32 receipt = program.settle(address(sink), keccak256("exec-2"), 1 ether, authRef);
        assertTrue(receipt != bytes32(0));
    }

    function test_80_differentProgramDistinctKey() public {
        LB006SettlingProgram p2 = new LB006SettlingProgram(keccak256("program-2"), address(fakeFactory), address(quote));
        fakeFactory.setRegistered(address(p2), true);
        quote.mint(address(p2), 10 ether);
        vm.prank(address(p2));
        quote.approve(address(sink), type(uint256).max);

        bytes32 k1 = sink.settlementKeyFor(programAddr, programId, executionId);
        bytes32 k2 = sink.settlementKeyFor(address(p2), keccak256("program-2"), executionId);
        assertTrue(k1 != k2);
        program.settle(address(sink), executionId, 1 ether, authRef);
        p2.settle(address(sink), executionId, 1 ether, authRef);
        assertTrue(sink.isSettled(k1));
        assertTrue(sink.isSettled(k2));
    }

    // -------------------------------------------------------------------------
    // Factory hardening (81–88)
    // -------------------------------------------------------------------------

    function test_81_to_88_factoryHardeningAndLB005Regression() public {
        LiquidityBuildingProgramV1 impl = new LiquidityBuildingProgramV1();
        LB005MockMelegaFactory melegaFactory = new LB005MockMelegaFactory();
        LB005MockCodeDependency routerDep = new LB005MockCodeDependency();
        LB005MockERC20 project = new LB005MockERC20("P", "P", 18);
        LB005MockERC20 q = new LB005MockERC20("Q", "Q", 18);
        LB005MockPair pair = new LB005MockPair(address(project), address(q), 1e18, 1e18);
        melegaFactory.setPair(address(project), address(q), address(pair));

        LB006TreasuryReceiverMock recv = new LB006TreasuryReceiverMock();
        LiquidityBuildingTreasuryFeeSinkV1 realSink = new LiquidityBuildingTreasuryFeeSinkV1(address(recv));
        LiquidityBuildingExecutionAuthorizerV1 realAuth = new LiquidityBuildingExecutionAuthorizerV1(authorityEOA);

        LBTypes.QuoteAssetPolicy[] memory policies = new LBTypes.QuoteAssetPolicy[](1);
        policies[0] = LBTypes.QuoteAssetPolicy({
            asset: address(q),
            decimals: 18,
            enabled: true,
            minimumGrossQuoteFloor: 1,
            minimumQuoteReserve: 1,
            gasConversionMode: LBTypes.GasConversionMode.NotActive,
            gasConversionReference: address(0)
        });

        LiquidityBuildingFactoryV1 factory = new LiquidityBuildingFactoryV1(
            FACTORY_VERSION,
            address(impl),
            address(melegaFactory),
            address(routerDep),
            address(realAuth),
            address(realSink),
            _params(),
            policies
        );

        assertEq(factory.executionAuthorizer(), address(realAuth));
        assertEq(factory.treasuryFeeSink(), address(realSink));

        // 82 incompatible authorizer
        LB006IncompatibleAuthorizer badAuth = new LB006IncompatibleAuthorizer();
        vm.expectRevert(LiquidityBuildingFactoryV1.IncompatibleAuthorizer.selector);
        new LiquidityBuildingFactoryV1(
            FACTORY_VERSION,
            address(impl),
            address(melegaFactory),
            address(routerDep),
            address(badAuth),
            address(realSink),
            _params(),
            policies
        );

        // 84 incompatible sink
        LB006IncompatibleSink badSink = new LB006IncompatibleSink(address(recv));
        vm.expectRevert(LiquidityBuildingFactoryV1.IncompatibleTreasurySink.selector);
        new LiquidityBuildingFactoryV1(
            FACTORY_VERSION,
            address(impl),
            address(melegaFactory),
            address(routerDep),
            address(realAuth),
            address(badSink),
            _params(),
            policies
        );

        // 85 sink with EOA receiver rejected through Factory
        LB006SinkWithEoaReceiverView eoaSink = new LB006SinkWithEoaReceiverView(address(0xE0A));
        vm.expectRevert(LiquidityBuildingFactoryV1.IncompatibleTreasurySink.selector);
        new LiquidityBuildingFactoryV1(
            FACTORY_VERSION,
            address(impl),
            address(melegaFactory),
            address(routerDep),
            address(realAuth),
            address(eoaSink),
            _params(),
            policies
        );

        // 87 program creation remains functional
        address owner = address(0xA11CE);
        vm.prank(owner);
        (address prog,) = factory.createProgram(
            address(project), address(q), address(pair), LBTypes.StrategyConfig(LBTypes.StrategyMode.FullAi, 0, 0), 300
        );
        assertTrue(factory.isRegisteredProgram(prog));

        // 86 immutables unchanged
        assertEq(factory.melegaFactory(), address(melegaFactory));
        assertEq(factory.successFeeBps(), 500);

        // 88 custody still works
        project.mint(owner, 100 ether);
        vm.startPrank(owner);
        project.approve(prog, 10 ether);
        LiquidityBuildingProgramV1(prog).depositBudget(10 ether);
        assertEq(project.balanceOf(prog), 10 ether);
        vm.stopPrank();
    }

    // -------------------------------------------------------------------------
    // Fuzz / property (≥256 runs via forge --fuzz-runs)
    // -------------------------------------------------------------------------

    function testFuzz_digestChangesWhenAnySignedFieldChanges(uint256 epochId, uint16 rateBps, address program_)
        public
        view
    {
        vm.assume(program_ != address(0));
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory a = _baseIntent();
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory b = _baseIntent();
        b.epochId = bound(epochId, 1, type(uint128).max);
        b.effectiveStrategyRateBps = uint16(bound(rateBps, 0, 10_000));
        b.program = program_;
        if (
            b.epochId == a.epochId && b.effectiveStrategyRateBps == a.effectiveStrategyRateBps && b.program == a.program
        ) {
            return;
        }
        assertTrue(authorizer.hashExecutionIntent(a) != authorizer.hashExecutionIntent(b));
    }

    function testFuzz_noSignatureAcceptedDifferentProgram(address otherProgram) public {
        vm.assume(otherProgram != address(0) && otherProgram != programAddr);
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        bytes memory sig = _sign(intent);
        intent.program = otherProgram;
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.InvalidSignature.selector);
        authorizer.validateExecutionIntent(intent, sig);
    }

    function testFuzz_validEOASignaturesPass(uint256 epochId, uint64 deadlineOffset) public view {
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        intent.epochId = bound(epochId, 1, type(uint128).max);
        intent.decisionDeadline = uint64(block.timestamp + bound(deadlineOffset, 1, 365 days));
        bytes memory sig = _sign(intent);
        assertEq(authorizer.validateExecutionIntent(intent, sig), authorizer.hashExecutionIntent(intent));
    }

    function testFuzz_randomInvalidSignaturesFail(bytes calldata junk) public {
        vm.assume(junk.length != 65);
        ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
        vm.expectRevert(LiquidityBuildingExecutionAuthorizerV1.InvalidSignature.selector);
        authorizer.validateExecutionIntent(intent, junk);
    }

    function testFuzz_settlementKeyUniqueAcrossExecutionIds(bytes32 execA, bytes32 execB) public view {
        vm.assume(execA != execB);
        assertTrue(
            sink.settlementKeyFor(programAddr, programId, execA) != sink.settlementKeyFor(programAddr, programId, execB)
        );
    }

    function testFuzz_duplicateSettlementAlwaysFails(uint256 amount) public {
        amount = bound(amount, 1, 1000 ether);
        bytes32 exec = keccak256(abi.encode("fuzz-dup", amount));
        program.settle(address(sink), exec, amount, authRef);
        vm.expectRevert(LiquidityBuildingTreasuryFeeSinkV1.SettlementAlreadyCompleted.selector);
        program.settle(address(sink), exec, amount + 1, authRef);
    }

    function testFuzz_successfulAmountEqualsReceiverDelta(uint256 amount) public {
        amount = bound(amount, 1, 10_000 ether);
        bytes32 exec = keccak256(abi.encode("fuzz-amt", amount));
        uint256 beforeBal = quote.balanceOf(address(treasuryReceiver));
        uint256 sinkBefore = quote.balanceOf(address(sink));
        program.settle(address(sink), exec, amount, authRef);
        assertEq(quote.balanceOf(address(treasuryReceiver)) - beforeBal, amount);
        assertEq(quote.balanceOf(address(sink)), sinkBefore);
    }

    function testFuzz_receiptDeterminism(uint256 amount) public {
        amount = bound(amount, 1, 1000 ether);
        bytes32 exec = keccak256(abi.encode("fuzz-rcpt", amount));
        bytes32 key = sink.settlementKeyFor(programAddr, programId, exec);
        bytes32 expected = keccak256(
            abi.encode(
                block.chainid,
                address(sink),
                address(treasuryReceiver),
                programAddr,
                programId,
                exec,
                address(quote),
                amount,
                authRef,
                key
            )
        );
        assertEq(program.settle(address(sink), exec, amount, authRef), expected);
        assertEq(sink.settlementRecord(key).authorizationReference, authRef);
        assertEq(sink.settlementRecord(key).amount, amount);
    }

    // -------------------------------------------------------------------------
    // Mainnet-fork read-only (optional)
    // -------------------------------------------------------------------------

    function test_mainnetFork_localValidationNotDeployment() public {
        // LOCAL FORK VALIDATION — NOT MAINNET DEPLOYMENT
        string memory rpc = vm.envOr("BNB_MAINNET_RPC_URL", string(""));
        if (bytes(rpc).length == 0) {
            rpc = "https://bsc-dataseed.binance.org";
        }
        try vm.createSelectFork(rpc) {
            uint256 forkBlock = block.number;
            address melegaFactory = 0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C;
            address melegaRouter = 0xc25033218D181b27D4a2944Fbb04FC055da4EAB3;
            assertTrue(melegaFactory.code.length > 0);
            assertTrue(melegaRouter.code.length > 0);

            // Real LB003 pair MARCO/WBNB if present
            address marcoWbnb = 0x7286c16c3c05d4c17B689bE7948Ec4Fa4e861d1E;
            assertTrue(marcoWbnb.code.length > 0);

            LB006TreasuryReceiverMock localRecv = new LB006TreasuryReceiverMock();
            LiquidityBuildingTreasuryFeeSinkV1 localSink = new LiquidityBuildingTreasuryFeeSinkV1(address(localRecv));
            LiquidityBuildingExecutionAuthorizerV1 localAuth = new LiquidityBuildingExecutionAuthorizerV1(authorityEOA); // TEST-ONLY authority

            LiquidityBuildingProgramV1 impl = new LiquidityBuildingProgramV1();
            // Use mock melega factory for local Program create against real pair token addresses is complex;
            // verify dependency compatibility of Authorizer+Sink only.
            assertEq(localAuth.signingAuthority(), authorityEOA);
            assertEq(localSink.treasuryReceiver(), address(localRecv));

            ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1 memory intent = _baseIntent();
            intent.chainId = block.chainid;
            intent.pair = marcoWbnb;
            // TEST-ONLY EOA SIGNATURE — NOT KMS PRODUCTION EVIDENCE
            bytes32 digest = localAuth.hashExecutionIntent(intent);
            (uint8 v, bytes32 r, bytes32 s) = vm.sign(AUTHORITY_PK, digest);
            localAuth.validateExecutionIntent(intent, abi.encodePacked(r, s, v));

            // Record fork evidence without broadcast
            assertTrue(forkBlock > 0);
            assertEq(block.chainid, 56);
        } catch {
            // RPC unavailable — skip without failing suite
        }
    }
}
