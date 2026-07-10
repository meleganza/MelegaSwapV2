// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MelegaSmartRouterWrapper} from "../contracts/MelegaSmartRouterWrapper.sol";
import {MockERC20} from "../contracts/mocks/MockERC20.sol";
import {MockWBNB} from "../contracts/mocks/MockWBNB.sol";
import {MockUnderlyingSwapRouter} from "../contracts/mocks/MockUnderlyingSwapRouter.sol";

/// @notice Economic invariant proofs for wrapper v1 scaffold.
contract MelegaSmartRouterWrapperInvariantsTest is Test {
    MelegaSmartRouterWrapper internal wrapper;
    MockUnderlyingSwapRouter internal router;
    MockERC20 internal usdt;
    MockERC20 internal marco;
    MockWBNB internal wbnb;

    address internal collector = makeAddr("treasuryCollector");
    address internal user = makeAddr("user");
    address internal civilizationTreasury = makeAddr("civilizationTreasury");
    address internal buyback = makeAddr("buyback");
    address internal referral = makeAddr("referral");

    bytes32 internal constant PRICING_REF = keccak256(bytes("D87_DEX_PRICING_RATIFIED"));
    bytes32 internal constant TREASURY_REF = keccak256(bytes("FSC-01"));

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

        usdt.mint(user, type(uint256).max / 2);
        marco.mint(user, type(uint256).max / 2);
        marco.mint(address(router), type(uint256).max / 4);
        wbnb.mint(address(router), type(uint256).max / 4);
        usdt.mint(address(router), type(uint256).max / 4);
        vm.deal(user, 100 ether);

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

    function _assertGrossNetFeeInvariant(uint256 gross, uint256 net, uint256 fee) internal pure {
        assertEq(gross, net + fee, "grossAmountIn != netAmountIn + protocolFee");
    }

    function _assertNoLocalSettlement(address feeToken) internal view {
        assertEq(IERC20(feeToken).balanceOf(civilizationTreasury), 0, "FSC-01 civilization treasury touched");
        assertEq(IERC20(feeToken).balanceOf(buyback), 0, "buyback touched");
        assertEq(IERC20(feeToken).balanceOf(referral), 0, "referral touched");
    }

    function test_invariant_standardErc20Swap() public {
        uint256 gross = 10_000 ether;
        uint256 collectorBefore = usdt.balanceOf(collector);

        vm.prank(user);
        wrapper.swapExactTokensForTokens(gross, 1, _path(address(usdt), address(wbnb)), user, block.timestamp + 600);

        uint256 fee = (gross * 30) / 10_000;
        uint256 net = gross - fee;

        _assertGrossNetFeeInvariant(gross, net, fee);
        assertEq(usdt.balanceOf(collector) - collectorBefore, fee, "protocol fee not at collector");
        assertEq(router.lastTokenAmountIn(), net, "router did not receive net");
        _assertNoLocalSettlement(address(usdt));
    }

    function test_invariant_buyMarcoErc20Swap() public {
        uint256 gross = 10_000 ether;
        uint256 collectorBefore = usdt.balanceOf(collector);

        vm.prank(user);
        wrapper.swapExactTokensForTokens(gross, 1, _path(address(usdt), address(marco)), user, block.timestamp + 600);

        uint256 fee = (gross * 20) / 10_000;
        uint256 net = gross - fee;

        _assertGrossNetFeeInvariant(gross, net, fee);
        assertEq(usdt.balanceOf(collector) - collectorBefore, fee);
        assertEq(router.lastTokenAmountIn(), net);
        _assertNoLocalSettlement(address(usdt));
    }

    function test_invariant_sellMarcoErc20Swap() public {
        uint256 gross = 10_000 ether;
        uint256 collectorBefore = marco.balanceOf(collector);

        vm.prank(user);
        wrapper.swapExactTokensForTokens(gross, 1, _path(address(marco), address(usdt)), user, block.timestamp + 600);

        uint256 fee = (gross * 30) / 10_000;
        uint256 net = gross - fee;

        _assertGrossNetFeeInvariant(gross, net, fee);
        assertEq(marco.balanceOf(collector) - collectorBefore, fee);
        assertEq(router.lastTokenAmountIn(), net);
        _assertNoLocalSettlement(address(marco));
    }

    function test_invariant_nativeBnbSwap() public {
        uint256 gross = 5 ether;
        uint256 collectorBefore = wbnb.balanceOf(collector);

        vm.prank(user);
        wrapper.swapExactETHForTokens{value: gross}(1, _path(address(wbnb), address(usdt)), user, block.timestamp + 600);

        uint256 fee = (gross * 30) / 10_000;
        uint256 net = gross - fee;

        _assertGrossNetFeeInvariant(gross, net, fee);
        assertEq(wbnb.balanceOf(collector) - collectorBefore, fee, "native protocol fee not at collector as WBNB");
        assertEq(router.lastEthAmountIn(), net, "router did not receive net native");
    }

    function test_invariant_minimumNonZeroAmount() public {
        uint256 gross = 1;
        uint256 collectorBefore = usdt.balanceOf(collector);

        vm.prank(user);
        wrapper.swapExactTokensForTokens(gross, 0, _path(address(usdt), address(wbnb)), user, block.timestamp + 600);

        uint256 fee = (gross * 30) / 10_000;
        uint256 net = gross - fee;

        _assertGrossNetFeeInvariant(gross, net, fee);
        assertEq(usdt.balanceOf(collector) - collectorBefore, fee);
        assertEq(router.lastTokenAmountIn(), net);
    }

    function test_invariant_largeAmount() public {
        uint256 gross = 1_000_000_000 ether;
        uint256 collectorBefore = usdt.balanceOf(collector);

        vm.prank(user);
        wrapper.swapExactTokensForTokens(gross, 1, _path(address(usdt), address(wbnb)), user, block.timestamp + 600);

        uint256 fee = (gross * 30) / 10_000;
        uint256 net = gross - fee;

        _assertGrossNetFeeInvariant(gross, net, fee);
        assertEq(usdt.balanceOf(collector) - collectorBefore, fee);
        assertEq(router.lastTokenAmountIn(), net);
    }

    function test_invariant_roundingEdgeCase() public {
        uint256 gross = 333;
        (uint256 quotedFee, uint256 quotedNet,,) = wrapper.quoteProtocolFee(address(usdt), address(wbnb), gross);
        _assertGrossNetFeeInvariant(gross, quotedNet, quotedFee);

        uint256 collectorBefore = usdt.balanceOf(collector);

        vm.prank(user);
        wrapper.swapExactTokensForTokens(gross, 0, _path(address(usdt), address(wbnb)), user, block.timestamp + 600);

        assertEq(usdt.balanceOf(collector) - collectorBefore, quotedFee);
        assertEq(router.lastTokenAmountIn(), quotedNet);
        _assertGrossNetFeeInvariant(gross, quotedNet, quotedFee);
    }

    function test_invariant_lpFeeUntouched() public {
        uint256 routerUsdtBefore = usdt.balanceOf(address(router));
        uint256 gross = 10_000 ether;

        vm.prank(user);
        wrapper.swapExactTokensForTokens(gross, 1, _path(address(usdt), address(wbnb)), user, block.timestamp + 600);

        uint256 net = gross - ((gross * 30) / 10_000);
        assertEq(usdt.balanceOf(address(router)) - routerUsdtBefore, net, "LP/router only received net input");
    }
}
