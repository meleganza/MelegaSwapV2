// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, Vm} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MelegaSmartRouterWrapper} from "../contracts/MelegaSmartRouterWrapper.sol";
import {MockERC20} from "../contracts/mocks/MockERC20.sol";
import {MockWBNB} from "../contracts/mocks/MockWBNB.sol";
import {MockERC20WithRecipientBlock} from "../contracts/mocks/MockERC20WithRecipientBlock.sol";
import {MockUnderlyingSwapRouter} from "../contracts/mocks/MockUnderlyingSwapRouter.sol";
import {MockRejectingTreasury} from "../contracts/mocks/MockRejectingTreasury.sol";
import {MockRevertingRouter} from "../contracts/mocks/MockRevertingRouter.sol";

contract MelegaSmartRouterWrapperTest is Test {
    MelegaSmartRouterWrapper internal wrapper;
    MockUnderlyingSwapRouter internal router;
    MockERC20 internal usdt;
    MockERC20 internal marco;
    MockWBNB internal wbnb;

    address internal collector = makeAddr("treasuryCollector");
    address internal user = makeAddr("user");

    bytes32 internal constant PRICING_REF = keccak256(bytes("D87_DEX_PRICING_RATIFIED"));
    bytes32 internal constant TREASURY_REF = keccak256(bytes("FSC-01"));

    uint256 internal constant GROSS = 10_000 ether;

    event ProtocolFeeCollected(
        address indexed user,
        address indexed inputToken,
        address indexed outputToken,
        address feeToken,
        uint256 grossAmountIn,
        uint256 netAmountIn,
        uint256 feeAmount,
        uint16 protocolFeeBps,
        bool buyMarcoIncentiveApplied,
        address underlyingRouter,
        address treasuryCollector,
        bytes32 pricingRefHash,
        bytes32 treasuryPolicyRefHash
    );

    event TreasuryHandoffPrepared(
        bytes32 indexed executionId,
        bytes32 indexed routeType,
        address treasuryCollector,
        uint256 protocolFee,
        bytes32 treasuryPolicyRefHash,
        bytes32 pricingRefHash
    );

    function setUp() public {
        router = new MockUnderlyingSwapRouter();
        usdt = new MockERC20("USDT", "USDT");
        marco = new MockERC20("MARCO", "MARCO");
        wbnb = new MockWBNB();

        wrapper = new MelegaSmartRouterWrapper(
            address(router),
            collector,
            address(marco),
            PRICING_REF,
            TREASURY_REF,
            address(this)
        );

        usdt.mint(user, GROSS);
        marco.mint(user, GROSS);
        marco.mint(address(router), GROSS * 10);
        usdt.mint(address(router), GROSS * 10);
        wbnb.mint(address(router), GROSS * 10);
        vm.deal(user, 100 ether);
        vm.deal(collector, 0);

        vm.prank(user);
        usdt.approve(address(wrapper), type(uint256).max);
        vm.prank(user);
        marco.approve(address(wrapper), type(uint256).max);
    }

    function _path(address inputToken, address outputToken) internal pure returns (address[] memory path) {
        path = new address[](2);
        path[0] = inputToken;
        path[1] = outputToken;
    }

    function _assertFeeMathExact(uint256 gross, uint16 bps) internal pure returns (uint256 fee, uint256 net) {
        fee = (gross * bps) / 10_000;
        net = gross - fee;
        assertEq(gross, net + fee, "fee math not exact");
    }

    // --- Original scaffold tests (preserved) ---

    function test_standardSwapFeeIs30Bps() public {
        (uint256 feeAmount,, uint16 bps,) = wrapper.quoteProtocolFee(address(usdt), address(wbnb), GROSS);
        assertEq(bps, 30);
        assertEq(feeAmount, (GROSS * 30) / 10_000);
    }

    function test_buyMarcoFeeIs20Bps() public {
        (uint256 feeAmount,, uint16 bps, bool buyMarco) = wrapper.quoteProtocolFee(address(usdt), address(marco), GROSS);
        assertTrue(buyMarco);
        assertEq(bps, 20);
        assertEq(feeAmount, (GROSS * 20) / 10_000);
    }

    function test_sellMarcoFeeIs30Bps() public {
        (uint256 feeAmount,, uint16 bps, bool buyMarco) = wrapper.quoteProtocolFee(address(marco), address(usdt), GROSS);
        assertFalse(buyMarco);
        assertEq(bps, 30);
        assertEq(feeAmount, (GROSS * 30) / 10_000);
    }

    function test_feeForwardedToCollector() public {
        uint256 beforeBal = usdt.balanceOf(collector);

        vm.prank(user);
        wrapper.swapExactTokensForTokens(GROSS, 1, _path(address(usdt), address(wbnb)), user, block.timestamp + 600);

        uint256 expectedFee = (GROSS * 30) / 10_000;
        assertEq(usdt.balanceOf(collector) - beforeBal, expectedFee);
    }

    function test_netAmountRoutedToUnderlyingRouter() public {
        vm.prank(user);
        wrapper.swapExactTokensForTokens(GROSS, 1, _path(address(usdt), address(marco)), user, block.timestamp + 600);

        uint256 expectedNet = GROSS - ((GROSS * 20) / 10_000);
        assertEq(router.lastTokenAmountIn(), expectedNet);
        assertEq(router.lastInputToken(), address(usdt));
        assertEq(router.lastOutputToken(), address(marco));
    }

    function test_fsc01NotExecutedLocally() public {
        address civilizationTreasury = makeAddr("civilizationTreasury");
        address buyback = makeAddr("buyback");
        address referral = makeAddr("referral");

        vm.prank(user);
        wrapper.swapExactTokensForTokens(GROSS, 1, _path(address(usdt), address(wbnb)), user, block.timestamp + 600);

        assertEq(usdt.balanceOf(civilizationTreasury), 0);
        assertEq(usdt.balanceOf(buyback), 0);
        assertEq(usdt.balanceOf(referral), 0);
        assertEq(usdt.balanceOf(collector), (GROSS * 30) / 10_000);
    }

    function test_exactOutputRevertsUnsupported() public {
        vm.expectRevert(MelegaSmartRouterWrapper.ExactOutputUnsupported.selector);
        wrapper.swapTokensForExactTokens(1, GROSS, _path(address(usdt), address(wbnb)), user, block.timestamp + 600);
    }

    function test_feeOnTransferRevertsUnsupported() public {
        vm.expectRevert(MelegaSmartRouterWrapper.FeeOnTransferUnsupported.selector);
        wrapper.swapExactTokensForTokensSupportingFeeOnTransfer(
            GROSS, 1, _path(address(usdt), address(wbnb)), user, block.timestamp + 600
        );
    }

    function test_pauseBlocksErc20Swap() public {
        wrapper.pause();

        vm.prank(user);
        vm.expectRevert();
        wrapper.swapExactTokensForTokens(GROSS, 1, _path(address(usdt), address(wbnb)), user, block.timestamp + 600);
    }

    function test_constructorRejectsZeroRouter() public {
        vm.expectRevert(MelegaSmartRouterWrapper.ZeroAddress.selector);
        new MelegaSmartRouterWrapper(address(0), collector, address(marco), PRICING_REF, TREASURY_REF, address(this));
    }

    function test_constructorRejectsZeroCollector() public {
        vm.expectRevert(MelegaSmartRouterWrapper.ZeroAddress.selector);
        new MelegaSmartRouterWrapper(address(router), address(0), address(marco), PRICING_REF, TREASURY_REF, address(this));
    }

    function test_constructorRejectsZeroMarco() public {
        vm.expectRevert(MelegaSmartRouterWrapper.ZeroAddress.selector);
        new MelegaSmartRouterWrapper(
            address(router), collector, address(0), PRICING_REF, TREASURY_REF, address(this)
        );
    }

    // --- R736 expanded tests ---

    function test_collectorRevertRevertsFullErc20Swap() public {
        MockERC20WithRecipientBlock blockedUsdt = new MockERC20WithRecipientBlock("USDT", "USDT");
        blockedUsdt.mint(user, GROSS);
        blockedUsdt.setBlockedRecipient(collector);

        MelegaSmartRouterWrapper localWrapper = new MelegaSmartRouterWrapper(
            address(router), collector, address(marco), PRICING_REF, TREASURY_REF, address(this)
        );

        vm.prank(user);
        blockedUsdt.approve(address(localWrapper), type(uint256).max);

        uint256 userBefore = blockedUsdt.balanceOf(user);
        uint256 collectorBefore = blockedUsdt.balanceOf(collector);

        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(MockERC20WithRecipientBlock.RecipientBlocked.selector, collector));
        localWrapper.swapExactTokensForTokens(
            GROSS, 1, _path(address(blockedUsdt), address(wbnb)), user, block.timestamp + 600
        );

        assertEq(blockedUsdt.balanceOf(user), userBefore, "user balance changed on failed swap");
        assertEq(blockedUsdt.balanceOf(collector), collectorBefore, "collector received fee on failed swap");
        assertEq(blockedUsdt.balanceOf(address(localWrapper)), 0, "wrapper retained tokens on failed swap");
    }

    function test_collectorRevertRevertsFullNativeSwap() public {
        MockWBNB blockedWbnb = new MockWBNB();
        blockedWbnb.setBlockedRecipient(collector);

        MelegaSmartRouterWrapper nativeWrapper = new MelegaSmartRouterWrapper(
            address(router), collector, address(marco), PRICING_REF, TREASURY_REF, address(this)
        );

        uint256 gross = 1 ether;
        uint256 collectorBefore = blockedWbnb.balanceOf(collector);

        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(MockWBNB.RecipientBlocked.selector, collector));
        nativeWrapper.swapExactETHForTokens{value: gross}(
            1, _path(address(blockedWbnb), address(usdt)), user, block.timestamp + 600
        );

        assertEq(blockedWbnb.balanceOf(collector), collectorBefore, "collector received WBNB fee on failed swap");
        assertEq(router.lastEthAmountIn(), 0, "router called on failed native swap");
    }

    function test_routerRevertRevertsFullErc20Swap() public {
        MockRevertingRouter revertingRouter = new MockRevertingRouter();
        MelegaSmartRouterWrapper localWrapper = new MelegaSmartRouterWrapper(
            address(revertingRouter), collector, address(marco), PRICING_REF, TREASURY_REF, address(this)
        );

        vm.prank(user);
        usdt.approve(address(localWrapper), type(uint256).max);

        uint256 userBefore = usdt.balanceOf(user);
        uint256 collectorBefore = usdt.balanceOf(collector);

        vm.prank(user);
        vm.expectRevert(MockRevertingRouter.RouterForcedRevert.selector);
        localWrapper.swapExactTokensForTokens(
            GROSS, 1, _path(address(usdt), address(wbnb)), user, block.timestamp + 600
        );

        assertEq(usdt.balanceOf(user), userBefore, "user balance changed on router revert");
        assertEq(usdt.balanceOf(collector), collectorBefore, "collector received fee on router revert");
        assertEq(IERC20(address(usdt)).allowance(address(localWrapper), address(revertingRouter)), 0);
    }

    function test_routerRevertRevertsFullNativeSwap() public {
        MockRevertingRouter revertingRouter = new MockRevertingRouter();
        MelegaSmartRouterWrapper nativeWrapper = new MelegaSmartRouterWrapper(
            address(revertingRouter), collector, address(marco), PRICING_REF, TREASURY_REF, address(this)
        );

        uint256 gross = 2 ether;
        uint256 collectorBefore = collector.balance;

        vm.prank(user);
        vm.expectRevert(MockRevertingRouter.RouterForcedRevert.selector);
        nativeWrapper.swapExactETHForTokens{value: gross}(
            1, _path(address(wbnb), address(usdt)), user, block.timestamp + 600
        );

        assertEq(collector.balance, collectorBefore, "collector received native fee on router revert");
    }

    function test_pauseBlocksNativeSwap() public {
        wrapper.pause();

        vm.prank(user);
        vm.expectRevert();
        wrapper.swapExactETHForTokens{value: 1 ether}(1, _path(address(wbnb), address(usdt)), user, block.timestamp + 600);
    }

    function test_pauseUnpauseLifecycle() public {
        wrapper.pause();
        assertTrue(wrapper.paused());

        wrapper.unpause();
        assertFalse(wrapper.paused());

        vm.prank(user);
        wrapper.swapExactTokensForTokens(GROSS, 1, _path(address(usdt), address(wbnb)), user, block.timestamp + 600);
    }

    function test_nativeFeeMathExact() public {
        uint256 gross = 7 ether;
        (uint256 fee, uint256 net) = _assertFeeMathExact(gross, 30);

        vm.prank(user);
        wrapper.swapExactETHForTokens{value: gross}(1, _path(address(wbnb), address(usdt)), user, block.timestamp + 600);

        assertEq(router.lastEthAmountIn(), net);
        assertEq(wbnb.balanceOf(collector), fee, "native fee not at collector as WBNB");
    }

    function test_erc20FeeMathExact() public {
        (uint256 fee, uint256 net) = _assertFeeMathExact(GROSS, 30);

        vm.prank(user);
        wrapper.swapExactTokensForTokens(GROSS, 1, _path(address(usdt), address(wbnb)), user, block.timestamp + 600);

        assertEq(router.lastTokenAmountIn(), net);
        assertEq(usdt.balanceOf(collector), fee);
    }

    function test_buyMarcoReducedFeeExact() public {
        (uint256 fee, uint256 net) = _assertFeeMathExact(GROSS, 20);

        vm.prank(user);
        wrapper.swapExactTokensForTokens(GROSS, 1, _path(address(usdt), address(marco)), user, block.timestamp + 600);

        assertEq(router.lastTokenAmountIn(), net);
        assertEq(usdt.balanceOf(collector), fee);
    }

    function test_sellMarcoStandardFeeExact() public {
        (uint256 fee, uint256 net) = _assertFeeMathExact(GROSS, 30);

        vm.prank(user);
        wrapper.swapExactTokensForTokens(GROSS, 1, _path(address(marco), address(usdt)), user, block.timestamp + 600);

        assertEq(router.lastTokenAmountIn(), net);
        assertEq(marco.balanceOf(collector), fee);
    }

    function test_routerAllowanceResetAfterSwap() public {
        vm.prank(user);
        wrapper.swapExactTokensForTokens(GROSS, 1, _path(address(usdt), address(wbnb)), user, block.timestamp + 600);

        assertEq(IERC20(address(usdt)).allowance(address(wrapper), address(router)), 0, "stale router allowance");
    }

    function test_eventsEmitCorrectFeeMetadata() public {
        uint256 expectedFee = (GROSS * 20) / 10_000;
        uint256 expectedNet = GROSS - expectedFee;

        vm.expectEmit(true, true, true, true, address(wrapper));
        emit ProtocolFeeCollected(
            user,
            address(usdt),
            address(marco),
            address(usdt),
            GROSS,
            expectedNet,
            expectedFee,
            20,
            true,
            address(router),
            collector,
            PRICING_REF,
            TREASURY_REF
        );

        vm.prank(user);
        wrapper.swapExactTokensForTokens(GROSS, 1, _path(address(usdt), address(marco)), user, block.timestamp + 600);
    }

    function test_treasuryHandoffEventIncludesPolicyRef() public {
        uint256 expectedFee = (GROSS * 30) / 10_000;

        vm.recordLogs();
        vm.prank(user);
        wrapper.swapExactTokensForTokens(GROSS, 1, _path(address(usdt), address(wbnb)), user, block.timestamp + 600);

        Vm.Log[] memory entries = vm.getRecordedLogs();
        bytes32 handoffTopic = keccak256(
            "TreasuryHandoffPrepared(bytes32,bytes32,address,uint256,bytes32,bytes32)"
        );
        bool found;
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] != handoffTopic) continue;
            assertEq(entries[i].topics[2], keccak256("STANDARD_SWAP"), "routeType mismatch");
            (address eventCollector, uint256 protocolFee, bytes32 policyRef, bytes32 pricingRef) =
                abi.decode(entries[i].data, (address, uint256, bytes32, bytes32));
            assertEq(eventCollector, collector);
            assertEq(protocolFee, expectedFee);
            assertEq(policyRef, TREASURY_REF, "treasuryPolicyRefHash missing");
            assertEq(pricingRef, PRICING_REF, "pricingRefHash missing");
            found = true;
            break;
        }
        assertTrue(found, "TreasuryHandoffPrepared not emitted");
    }

    // --- Gas benchmark hooks (used by gas report doc) ---

    function test_gas_directRouterBaselineErc20() public {
        uint256 net = GROSS - ((GROSS * 30) / 10_000);
        vm.prank(user);
        usdt.approve(address(router), net);
        vm.prank(user);
        router.swapExactTokensForTokens(net, 1, _path(address(usdt), address(wbnb)), user, block.timestamp + 600);
    }

    function test_gas_standardErc20Swap() public {
        vm.prank(user);
        wrapper.swapExactTokensForTokens(GROSS, 1, _path(address(usdt), address(wbnb)), user, block.timestamp + 600);
    }

    function test_gas_buyMarcoErc20Swap() public {
        vm.prank(user);
        wrapper.swapExactTokensForTokens(GROSS, 1, _path(address(usdt), address(marco)), user, block.timestamp + 600);
    }

    function test_gas_sellMarcoErc20Swap() public {
        vm.prank(user);
        wrapper.swapExactTokensForTokens(GROSS, 1, _path(address(marco), address(usdt)), user, block.timestamp + 600);
    }

    function test_gas_nativeBnbSwap() public {
        vm.prank(user);
        wrapper.swapExactETHForTokens{value: 1 ether}(1, _path(address(wbnb), address(usdt)), user, block.timestamp + 600);
    }

    function test_gas_pauseUnpause() public {
        wrapper.pause();
        wrapper.unpause();
    }
}
