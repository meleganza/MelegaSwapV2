// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { Clones } from "@openzeppelin/contracts/proxy/Clones.sol";

import { LiquidityBuildingFactoryV1 } from "../../contracts/liquidity-building/LiquidityBuildingFactoryV1.sol";
import { LiquidityBuildingProgramV1 } from "../../contracts/liquidity-building/LiquidityBuildingProgramV1.sol";
import {
    LBTypes,
    ILiquidityBuildingFactoryV1
} from "../../contracts/liquidity-building/interfaces/ILiquidityBuildingFactoryV1.sol";
import {
    ILiquidityBuildingProgramV1
} from "../../contracts/liquidity-building/interfaces/ILiquidityBuildingProgramV1.sol";

import {
    LB005MockERC20,
    LB005FeeOnTransferERC20,
    LB005FalseReturnERC20,
    LB005ReenteringERC20,
    LB005RebaseERC20,
    LB005MockPair,
    LB005MockMelegaFactory,
    LB005MockCodeDependency
} from "./mocks/LB005TestDependencies.sol";

/**
 * @title LB005CoreContracts
 * @notice Deterministic + fuzz suite for Liquidity Building core custody (LB005).
 */
contract LB005CoreContracts is Test {
    bytes32 constant FACTORY_VERSION = keccak256("LiquidityBuildingFactoryV1");

    LiquidityBuildingFactoryV1 internal factory;
    LiquidityBuildingProgramV1 internal impl;
    LB005MockMelegaFactory internal melegaFactory;
    LB005MockCodeDependency internal routerDep;
    LB005MockCodeDependency internal authorizer;
    LB005MockCodeDependency internal treasury;

    LB005MockERC20 internal project;
    LB005MockERC20 internal quote; // TEST-ONLY POLICY VALUE — NOT A MAINNET QUOTE FLOOR
    LB005MockPair internal pair;

    address internal owner = address(0xA11CE);
    address internal stranger = address(0xB0B);

    function setUp() public {
        impl = new LiquidityBuildingProgramV1();
        melegaFactory = new LB005MockMelegaFactory();
        routerDep = new LB005MockCodeDependency();
        authorizer = new LB005MockCodeDependency();
        treasury = new LB005MockCodeDependency();

        project = new LB005MockERC20("Project", "PRJ", 18);
        quote = new LB005MockERC20("Quote", "QTE", 18);

        pair = new LB005MockPair(address(project), address(quote), 1e18, 1e18);
        melegaFactory.setPair(address(project), address(quote), address(pair));

        LBTypes.QuoteAssetPolicy[] memory policies = new LBTypes.QuoteAssetPolicy[](1);
        policies[0] = LBTypes.QuoteAssetPolicy({
            asset: address(quote),
            decimals: 18,
            enabled: true,
            minimumGrossQuoteFloor: 1, // TEST-ONLY POLICY VALUE — NOT A MAINNET QUOTE FLOOR
            minimumQuoteReserve: 1,
            gasConversionMode: LBTypes.GasConversionMode.NotActive,
            gasConversionReference: address(0)
        });

        factory = new LiquidityBuildingFactoryV1(
            FACTORY_VERSION,
            address(impl),
            address(melegaFactory),
            address(routerDep),
            address(authorizer),
            address(treasury),
            _params(),
            policies
        );

        project.mint(owner, 1_000_000 ether);
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

    function _fullAi() internal pure returns (LBTypes.StrategyConfig memory) {
        return LBTypes.StrategyConfig(LBTypes.StrategyMode.FullAi, 0, 0);
    }

    function _create() internal returns (address program, bytes32 programId) {
        vm.prank(owner);
        return factory.createProgram(address(project), address(quote), address(pair), _fullAi(), 300);
    }

    function _approveProgram(address program, uint256 amount) internal {
        vm.prank(owner);
        project.approve(program, amount);
    }

    // --- Factory construction ---

    function test_factory_immutables_and_noAdmin() public view {
        assertEq(factory.factoryVersion(), FACTORY_VERSION);
        assertEq(factory.deploymentChainId(), block.chainid);
        assertEq(factory.implementation(), address(impl));
        assertEq(factory.melegaFactory(), address(melegaFactory));
        assertEq(factory.successFeeBps(), 500);
        assertEq(factory.strategyCeilingBps(), 5000);
        assertEq(factory.initialFinalityDepth(), 15);
        assertTrue(factory.isQuoteEnabled(address(quote)));
    }

    function test_factory_rejectsZeroAndNoCodeDeps() public {
        LBTypes.QuoteAssetPolicy[] memory policies = new LBTypes.QuoteAssetPolicy[](0);
        vm.expectRevert(LiquidityBuildingFactoryV1.ZeroAddress.selector);
        new LiquidityBuildingFactoryV1(
            FACTORY_VERSION,
            address(0),
            address(melegaFactory),
            address(routerDep),
            address(authorizer),
            address(treasury),
            _params(),
            policies
        );
        vm.expectRevert(LiquidityBuildingFactoryV1.DependencyWithoutCode.selector);
        new LiquidityBuildingFactoryV1(
            FACTORY_VERSION,
            address(impl),
            address(melegaFactory),
            address(routerDep),
            address(authorizer),
            address(0x1234),
            _params(),
            policies
        );
    }

    function test_factory_rejectsDuplicateQuoteAndBadDecimals() public {
        LBTypes.QuoteAssetPolicy[] memory policies = new LBTypes.QuoteAssetPolicy[](2);
        policies[0] =
            LBTypes.QuoteAssetPolicy(address(quote), 18, true, 1, 1, LBTypes.GasConversionMode.NotActive, address(0));
        policies[1] = policies[0];
        vm.expectRevert(LiquidityBuildingFactoryV1.DuplicateQuotePolicy.selector);
        new LiquidityBuildingFactoryV1(
            FACTORY_VERSION,
            address(impl),
            address(melegaFactory),
            address(routerDep),
            address(authorizer),
            address(treasury),
            _params(),
            policies
        );

        policies = new LBTypes.QuoteAssetPolicy[](1);
        policies[0] =
            LBTypes.QuoteAssetPolicy(address(quote), 6, true, 1, 1, LBTypes.GasConversionMode.NotActive, address(0));
        vm.expectRevert(LiquidityBuildingFactoryV1.InvalidQuotePolicy.selector);
        new LiquidityBuildingFactoryV1(
            FACTORY_VERSION,
            address(impl),
            address(melegaFactory),
            address(routerDep),
            address(authorizer),
            address(treasury),
            _params(),
            policies
        );
    }

    // --- Creation / pair / identity ---

    function test_createProgram_happyPath_registry_prediction() public {
        bytes32 baseKey = factory.computeBaseKey(owner, address(project), address(quote), address(pair));
        bytes32 expectedId = factory.computeProgramId(baseKey, 1);
        address predicted = factory.predictProgramAddress(expectedId);

        (address program, bytes32 programId) = _create();
        assertEq(program, predicted);
        assertEq(programId, expectedId);
        assertTrue(factory.isRegisteredProgram(program));
        assertEq(factory.getProgram(programId), program);
        assertEq(factory.programIdOf(program), programId);
        assertEq(factory.programCount(), 1);
        assertEq(factory.programAt(0), program);
        assertEq(factory.activeProgram(owner, address(project), address(quote), address(pair)), program);
        assertEq(factory.generationCount(owner, address(project), address(quote), address(pair)), 1);

        ILiquidityBuildingProgramV1.ProgramView memory v = ILiquidityBuildingProgramV1(program).getProgramView();
        assertEq(v.owner, owner);
        assertEq(v.lpRecipient, owner);
        assertEq(uint8(v.lifecycle), uint8(LBTypes.Lifecycle.Created));
        assertEq(v.configNonce, 1);
        assertEq(v.epochDurationSeconds, 300);
    }

    function test_createProgram_rejectsMissingFakeZeroReserveMismatchUnsupported() public {
        // getPair returns 0 when tokens have no mapping
        LB005MockERC20 orphan = new LB005MockERC20("Orphan", "ORN", 18);
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingFactoryV1.PairMissing.selector);
        factory.createProgram(address(orphan), address(quote), address(pair), _fullAi(), 300);

        LB005MockPair fake = new LB005MockPair(address(project), address(quote), 1, 1);
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingFactoryV1.NonCanonicalPair.selector);
        factory.createProgram(address(project), address(quote), address(fake), _fullAi(), 300);

        pair.setReserves(0, 1);
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingFactoryV1.PairReservesZero.selector);
        factory.createProgram(address(project), address(quote), address(pair), _fullAi(), 300);
        pair.setReserves(1e18, 1e18);

        LB005MockERC20 other = new LB005MockERC20("X", "X", 18);
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingFactoryV1.UnsupportedQuoteAsset.selector);
        factory.createProgram(address(project), address(other), address(pair), _fullAi(), 300);
    }

    function test_createProgram_rejectsInvalidEpochStrategyEqualsQuoteDuplicate() public {
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingFactoryV1.InvalidEpoch.selector);
        factory.createProgram(address(project), address(quote), address(pair), _fullAi(), 60);

        LBTypes.StrategyConfig memory bad = LBTypes.StrategyConfig(LBTypes.StrategyMode.DynamicRange, 0, 100);
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingFactoryV1.InvalidStrategy.selector);
        factory.createProgram(address(project), address(quote), address(pair), bad, 300);

        bad = LBTypes.StrategyConfig(LBTypes.StrategyMode.DynamicRange, 100, 50);
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingFactoryV1.InvalidStrategy.selector);
        factory.createProgram(address(project), address(quote), address(pair), bad, 300);

        bad = LBTypes.StrategyConfig(LBTypes.StrategyMode.DynamicRange, 100, 6000);
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingFactoryV1.InvalidStrategy.selector);
        factory.createProgram(address(project), address(quote), address(pair), bad, 300);

        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingFactoryV1.ProjectEqualsQuote.selector);
        factory.createProgram(address(quote), address(quote), address(pair), _fullAi(), 300);

        _create();
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingFactoryV1.DuplicateActiveProgram.selector);
        factory.createProgram(address(project), address(quote), address(pair), _fullAi(), 300);
    }

    function test_generation_after_stop() public {
        (address p1,) = _create();
        vm.prank(owner);
        ILiquidityBuildingProgramV1(p1).stop();
        (address p2, bytes32 id2) = _create();
        assertTrue(p1 != p2);
        assertEq(factory.generationCount(owner, address(project), address(quote), address(pair)), 2);
        assertEq(factory.activeProgram(owner, address(project), address(quote), address(pair)), p2);
        assertTrue(factory.isRegisteredProgram(p1));
        assertTrue(factory.isRegisteredProgram(p2));
        id2;
    }

    // --- Initialization / clone safety ---

    function test_implementation_locked_and_clone_reinit_blocked() public {
        vm.expectRevert();
        LiquidityBuildingProgramV1(address(impl))
            .initialize(
                address(factory),
                bytes32(uint256(1)),
                owner,
                address(project),
                address(quote),
                address(pair),
                owner,
                _fullAi(),
                300,
                5000
            );

        (address program,) = _create();
        vm.expectRevert();
        ILiquidityBuildingProgramV1(program)
            .initialize(
                address(factory),
                bytes32(uint256(2)),
                stranger,
                address(project),
                address(quote),
                address(pair),
                stranger,
                _fullAi(),
                300,
                5000
            );
    }

    function test_unofficial_clone_not_registered() public {
        address rogue = Clones.clone(address(impl));
        LiquidityBuildingProgramV1(rogue)
            .initialize(
                address(factory),
                keccak256("rogue"),
                owner,
                address(project),
                address(quote),
                address(pair),
                owner,
                _fullAi(),
                300,
                5000
            );
        assertFalse(factory.isRegisteredProgram(rogue));
    }

    function test_clone_storage_isolation() public {
        (address a,) = _create();
        // stop and create second
        vm.prank(owner);
        ILiquidityBuildingProgramV1(a).stop();
        (address b,) = _create();

        _approveProgram(a, 10 ether);
        // a is stopped — deposit should fail
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingProgramV1.ProgramIsStopped.selector);
        ILiquidityBuildingProgramV1(a).depositBudget(1 ether);

        _approveProgram(b, 5 ether);
        vm.prank(owner);
        ILiquidityBuildingProgramV1(b).depositBudget(5 ether);
        assertEq(ILiquidityBuildingProgramV1(b).getProgramView().remainingBudget, 5 ether);
        assertEq(ILiquidityBuildingProgramV1(a).getProgramView().remainingBudget, 0);
    }

    // --- Deposits / accounting ---

    function test_deposit_add_lifecycle_and_invariant() public {
        (address program,) = _create();
        _approveProgram(program, 100 ether);
        uint64 n0 = ILiquidityBuildingProgramV1(program).configNonce();
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).depositBudget(10 ether);
        ILiquidityBuildingProgramV1.ProgramView memory v = ILiquidityBuildingProgramV1(program).getProgramView();
        assertEq(uint8(v.lifecycle), uint8(LBTypes.Lifecycle.Ready));
        assertEq(v.remainingBudget, 10 ether);
        assertEq(v.totalDepositedBudget, 10 ether);
        assertEq(v.configNonce, n0 + 1);
        assertTrue(v.solvent);

        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).addBudget(5 ether);
        v = ILiquidityBuildingProgramV1(program).getProgramView();
        assertEq(v.remainingBudget + v.withdrawnUnusedBudget, v.totalDepositedBudget);
        assertEq(v.tokensSold + v.tokensMatched + v.executionCount, 0);
    }

    function test_deposit_rejects_zero_feeOnTransfer_falseReturn_reentrancy() public {
        (address program,) = _create();
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingProgramV1.ZeroAmount.selector);
        ILiquidityBuildingProgramV1(program).depositBudget(0);

        // fee-on-transfer as project requires new factory+pair — use direct program with fee token
        LB005FeeOnTransferERC20 feeTok = new LB005FeeOnTransferERC20();
        feeTok.mint(owner, 1000 ether);
        // Build dedicated stack
        LB005MockPair feePair = new LB005MockPair(address(feeTok), address(quote), 1e18, 1e18);
        melegaFactory.setPair(address(feeTok), address(quote), address(feePair));
        vm.prank(owner);
        (address feeProg,) = factory.createProgram(address(feeTok), address(quote), address(feePair), _fullAi(), 300);
        vm.prank(owner);
        feeTok.approve(feeProg, 100 ether);
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingProgramV1.UnsupportedTokenBehavior.selector);
        ILiquidityBuildingProgramV1(feeProg).depositBudget(100 ether);

        LB005FalseReturnERC20 falseTok = new LB005FalseReturnERC20();
        falseTok.mint(owner, 100 ether);
        LB005MockPair falsePair = new LB005MockPair(address(falseTok), address(quote), 1e18, 1e18);
        melegaFactory.setPair(address(falseTok), address(quote), address(falsePair));
        vm.prank(owner);
        (address falseProg,) =
            factory.createProgram(address(falseTok), address(quote), address(falsePair), _fullAi(), 300);
        vm.prank(owner);
        falseTok.approve(falseProg, 10 ether);
        vm.prank(owner);
        vm.expectRevert(); // SafeERC20
        ILiquidityBuildingProgramV1(falseProg).depositBudget(10 ether);

        LB005ReenteringERC20 ree = new LB005ReenteringERC20();
        ree.mint(owner, 100 ether);
        LB005MockPair reePair = new LB005MockPair(address(ree), address(quote), 1e18, 1e18);
        melegaFactory.setPair(address(ree), address(quote), address(reePair));
        vm.prank(owner);
        (address reeProg,) = factory.createProgram(address(ree), address(quote), address(reePair), _fullAi(), 300);
        ree.setAttack(reeProg, true);
        vm.prank(owner);
        ree.approve(reeProg, 10 ether);
        vm.prank(owner);
        // nested deposit fails (reentrancy or lifecycle); outer should still complete or revert — expect revert on reentrancy guard
        // Attack runs during transferFrom after balance credit of outer; nested depositBudget hits nonReentrant
        ILiquidityBuildingProgramV1(reeProg).depositBudget(10 ether);
        // If attack swallowed, ensure accounting exact
        assertEq(ILiquidityBuildingProgramV1(reeProg).getProgramView().remainingBudget, 10 ether);
    }

    function test_direct_donation_does_not_change_accounting() public {
        (address program,) = _create();
        _approveProgram(program, 10 ether);
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).depositBudget(10 ether);
        project.mint(address(this), 7 ether);
        project.transfer(program, 7 ether);
        ILiquidityBuildingProgramV1.ProgramView memory v = ILiquidityBuildingProgramV1(program).getProgramView();
        assertEq(v.remainingBudget, 10 ether);
        assertEq(v.totalDepositedBudget, 10 ether);
        assertEq(project.balanceOf(program), 17 ether);
    }

    // --- Strategy / epoch / LP recipient ---

    function test_strategy_epoch_recipient_updates() public {
        (address program,) = _create();
        LBTypes.StrategyConfig memory dyn = LBTypes.StrategyConfig(LBTypes.StrategyMode.DynamicRange, 100, 2500);
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).updateStrategy(dyn);
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).updateEpochDuration(900);
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).updateLpRecipient(stranger);
        ILiquidityBuildingProgramV1.ProgramView memory v = ILiquidityBuildingProgramV1(program).getProgramView();
        assertEq(uint8(v.strategy.mode), uint8(LBTypes.StrategyMode.DynamicRange));
        assertEq(v.epochDurationSeconds, 900);
        assertEq(v.lpRecipient, stranger);
        assertTrue(v.configNonce > 1);

        _approveProgram(program, 1 ether);
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).depositBudget(1 ether);
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).activate();
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingProgramV1.InvalidLifecycle.selector);
        ILiquidityBuildingProgramV1(program).updateLpRecipient(owner);

        vm.prank(stranger);
        vm.expectRevert(LiquidityBuildingProgramV1.UnauthorizedOwner.selector);
        ILiquidityBuildingProgramV1(program).updateLpRecipient(stranger);
    }

    // --- Lifecycle ---

    function test_lifecycle_activate_pause_resume_stop() public {
        (address program,) = _create();
        // Created without budget → not Ready
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingProgramV1.InvalidLifecycle.selector);
        ILiquidityBuildingProgramV1(program).activate();

        _approveProgram(program, 2 ether);
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).depositBudget(2 ether);
        // Drain while Ready then activate → InsufficientBudget
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).withdrawUnusedBudget(2 ether);
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingProgramV1.InsufficientBudget.selector);
        ILiquidityBuildingProgramV1(program).activate();

        _approveProgram(program, 2 ether);
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).addBudget(2 ether);
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).activate();
        assertEq(uint8(ILiquidityBuildingProgramV1(program).lifecycle()), uint8(LBTypes.Lifecycle.Active));

        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).pause();
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).resume();

        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).stop();
        assertEq(uint8(ILiquidityBuildingProgramV1(program).lifecycle()), uint8(LBTypes.Lifecycle.Stopped));
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingProgramV1.ProgramIsStopped.selector);
        ILiquidityBuildingProgramV1(program).activate();
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingProgramV1.ProgramIsStopped.selector);
        ILiquidityBuildingProgramV1(program).addBudget(1);
    }

    // --- Withdrawals ---

    function test_withdraw_unused_and_stopped_assets() public {
        (address program,) = _create();
        _approveProgram(program, 20 ether);
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).depositBudget(20 ether);
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).activate();
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingProgramV1.InvalidLifecycle.selector);
        ILiquidityBuildingProgramV1(program).withdrawUnusedBudget(1 ether);

        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).pause();
        uint256 before = project.balanceOf(owner);
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).withdrawUnusedBudget(5 ether);
        assertEq(project.balanceOf(owner), before + 5 ether);

        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).stop();
        before = project.balanceOf(owner);
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).withdrawStoppedAssets();
        assertEq(project.balanceOf(owner), before + 15 ether);
        assertEq(ILiquidityBuildingProgramV1(program).getProgramView().remainingBudget, 0);
        // idempotent
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).withdrawStoppedAssets();

        vm.prank(stranger);
        vm.expectRevert(LiquidityBuildingProgramV1.UnauthorizedOwner.selector);
        ILiquidityBuildingProgramV1(program).withdrawStoppedAssets();
    }

    function test_insolvency_blocks_withdrawal() public {
        LB005RebaseERC20 reb = new LB005RebaseERC20();
        reb.mint(owner, 100 ether);
        LB005MockPair rebPair = new LB005MockPair(address(reb), address(quote), 1e18, 1e18);
        melegaFactory.setPair(address(reb), address(quote), address(rebPair));
        vm.prank(owner);
        (address program,) = factory.createProgram(address(reb), address(quote), address(rebPair), _fullAi(), 300);
        vm.prank(owner);
        reb.approve(program, 10 ether);
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).depositBudget(10 ether);
        reb.burnFrom(program, 3 ether);
        assertFalse(ILiquidityBuildingProgramV1(program).isSolvent());
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingProgramV1.InsolventProgram.selector);
        ILiquidityBuildingProgramV1(program).withdrawUnusedBudget(1 ether);
    }

    function test_factory_never_holds_tokens() public {
        (address program,) = _create();
        _approveProgram(program, 3 ether);
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).depositBudget(3 ether);
        assertEq(project.balanceOf(address(factory)), 0);
    }

    // --- Fuzz / invariants ---

    function testFuzz_deposit_withdraw_conservation(uint128 dep, uint128 wit) public {
        dep = uint128(bound(dep, 1, 1000 ether));
        wit = uint128(bound(wit, 0, dep));
        (address program,) = _create();
        project.mint(owner, dep);
        _approveProgram(program, dep);
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).depositBudget(dep);
        if (wit > 0) {
            vm.prank(owner);
            ILiquidityBuildingProgramV1(program).withdrawUnusedBudget(wit);
        }
        ILiquidityBuildingProgramV1.ProgramView memory v = ILiquidityBuildingProgramV1(program).getProgramView();
        assertEq(v.remainingBudget + v.withdrawnUnusedBudget, v.totalDepositedBudget);
        assertTrue(v.remainingBudget <= v.totalDepositedBudget);
        assertTrue(v.withdrawnUnusedBudget <= v.totalDepositedBudget);
    }

    function testFuzz_config_nonce_increases(uint8 actions) public {
        actions = uint8(bound(actions, 1, 8));
        (address program,) = _create();
        uint64 nonce = ILiquidityBuildingProgramV1(program).configNonce();
        project.mint(owner, 100 ether);
        _approveProgram(program, 100 ether);
        vm.startPrank(owner);
        ILiquidityBuildingProgramV1(program).depositBudget(10 ether);
        assertTrue(ILiquidityBuildingProgramV1(program).configNonce() > nonce);
        nonce = ILiquidityBuildingProgramV1(program).configNonce();
        if (actions > 1) {
            ILiquidityBuildingProgramV1(program).updateEpochDuration(900);
            assertTrue(ILiquidityBuildingProgramV1(program).configNonce() > nonce);
        }
        vm.stopPrank();
    }

    function testFuzz_invalid_epoch_reverts(uint32 e) public {
        vm.assume(!(e == 300 || e == 900 || e == 1800 || e == 3600));
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingFactoryV1.InvalidEpoch.selector);
        factory.createProgram(address(project), address(quote), address(pair), _fullAi(), e);
    }

    function testFuzz_stopped_is_terminal(uint8) public {
        (address program,) = _create();
        vm.prank(owner);
        ILiquidityBuildingProgramV1(program).stop();
        vm.prank(owner);
        vm.expectRevert(LiquidityBuildingProgramV1.ProgramIsStopped.selector);
        ILiquidityBuildingProgramV1(program).updateEpochDuration(300);
    }

    function testFuzz_prediction_stable(address, uint64) public view {
        bytes32 baseKey = factory.computeBaseKey(owner, address(project), address(quote), address(pair));
        bytes32 id = factory.computeProgramId(baseKey, 1);
        address a = factory.predictProgramAddress(id);
        address b = factory.predictProgramAddress(id);
        assertEq(a, b);
    }
}
