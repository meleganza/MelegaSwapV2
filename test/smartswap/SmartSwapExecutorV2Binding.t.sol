// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { SmartSwapExecutorV2 } from "../../contracts/smartswap/SmartSwapExecutorV2.sol";
import { MockSmartSwapV2Router } from "../../contracts/smartswap/mocks/MockSmartSwapV2Router.sol";
import { MockERC20 } from "../../contracts/mocks/MockERC20.sol";
import { MockWBNB } from "../../contracts/mocks/MockWBNB.sol";

/// @notice Local proof that V2-shaped values from the TS SHADOW binding are accepted by ExecutorV2.
///         Uses mock routers only. No RPC, no broadcast, no Founder wallet.
contract SmartSwapExecutorV2BindingTest is Test {
    SmartSwapExecutorV2 internal executor;
    MockSmartSwapV2Router internal pancakeRouter;
    MockSmartSwapV2Router internal uniRouter;
    MockERC20 internal tokenIn;
    MockERC20 internal tokenOut;
    MockWBNB internal wbnb;

    address internal owner = makeAddr("owner");
    address internal treasury = makeAddr("treasury");
    address internal userA = makeAddr("userA");
    address internal userB = makeAddr("userB");
    address internal attacker = makeAddr("attacker");

    bytes32 internal pancakeVenue = keccak256("pancakeswap");
    bytes32 internal uniVenue = keccak256("uniswap");

    uint256 internal constant AMOUNT = 1_000_000;
    uint16 internal constant PANCAKE_FEE_BPS = 20;
    uint16 internal constant UNISWAP_FEE_BPS = 15;
    uint256 internal constant PANCAKE_COST = 25;
    uint256 internal constant UNISWAP_COST = 30;

    address internal constant FIXTURE_WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address internal constant FIXTURE_USDC_BSC = 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d;
    bytes32 internal constant TS_PANCAKE_ERC20_ROUTE_HASH =
        0x03acd7f030e88592939ebd720a2704354c6dfd4d1d55e07e62bf3d18b6bc9e9f;
    bytes32 internal constant TS_PANCAKE_NATIVE_IN_ROUTE_HASH =
        0x3c02b43ea145fbec00b7713bf95774a86a1ec935cfa2c897ad882cf976f783d7;
    bytes32 internal constant TS_PANCAKE_NATIVE_OUT_ROUTE_HASH =
        0xea0db4a9725bb2f74d1e228dd22b71a6f686aea94bd0eb954efdc305bfc9a425;

    function setUp() public {
        tokenIn = new MockERC20("IN", "IN");
        tokenOut = new MockERC20("OUT", "OUT");
        wbnb = new MockWBNB();
        pancakeRouter = new MockSmartSwapV2Router();
        uniRouter = new MockSmartSwapV2Router();

        vm.prank(owner);
        executor = new SmartSwapExecutorV2(treasury, address(wbnb), owner);

        vm.startPrank(owner);
        executor.setRouter(address(pancakeRouter), pancakeVenue, true);
        executor.setRouter(address(uniRouter), uniVenue, true);
        vm.stopPrank();

        _fundUser(userA);
        _fundUser(userB);
        tokenOut.mint(address(pancakeRouter), AMOUNT * 100);
        tokenOut.mint(address(uniRouter), AMOUNT * 100);
        vm.deal(address(pancakeRouter), 100 ether);
        vm.deal(address(uniRouter), 100 ether);
    }

    function testTsRouteHashFixturesMatchSolidityAbiEncode() public view {
        address[] memory erc20Path = new address[](2);
        erc20Path[0] = FIXTURE_WBNB;
        erc20Path[1] = FIXTURE_USDC_BSC;
        assertEq(executor.routeHashOf(erc20Path, false, false), TS_PANCAKE_ERC20_ROUTE_HASH);

        assertEq(executor.routeHashOf(erc20Path, true, false), TS_PANCAKE_NATIVE_IN_ROUTE_HASH);

        address[] memory nativeOutPath = new address[](2);
        nativeOutPath[0] = FIXTURE_USDC_BSC;
        nativeOutPath[1] = FIXTURE_WBNB;
        assertEq(executor.routeHashOf(nativeOutPath, false, true), TS_PANCAKE_NATIVE_OUT_ROUTE_HASH);
    }

    function testPolicyAndVenueHashesMatchCanonicalStrings() public view {
        assertEq(executor.POLICY_ID(), keccak256("SMARTSWAP_REVENUE_POLICY_V1"));
        assertEq(executor.POLICY_VERSION(), keccak256("1.0.0"));
        assertEq(executor.INTENT_VERSION(), 2);
        assertEq(pancakeVenue, keccak256("pancakeswap"));
        assertEq(uniVenue, keccak256("uniswap"));
    }

    function testUserAErc20ExactInThenUserBDifferentNonce() public {
        uint256 fee = (AMOUNT * PANCAKE_FEE_BPS) / 10_000;
        uint256 netIn = AMOUNT - fee;

        (SmartSwapExecutorV2.ExecutionIntent memory intentA, address[] memory path) =
            _bindingIntent(userA, address(pancakeRouter), pancakeVenue, PANCAKE_FEE_BPS, PANCAKE_COST, 11);
        uint256 treasuryBefore = tokenIn.balanceOf(treasury);
        uint256 userAOutBefore = tokenOut.balanceOf(userA);

        vm.prank(userA);
        uint256 outA = executor.execute(intentA, path);
        assertEq(outA, 2);
        assertEq(tokenIn.balanceOf(treasury) - treasuryBefore, fee);
        assertEq(pancakeRouter.lastAmountIn(), netIn);
        assertEq(pancakeRouter.lastRecipient(), userA);
        assertEq(tokenOut.balanceOf(userA) - userAOutBefore, outA);
        assertEq(tokenIn.balanceOf(address(executor)), 0);

        (SmartSwapExecutorV2.ExecutionIntent memory intentB,) =
            _bindingIntent(userB, address(uniRouter), uniVenue, UNISWAP_FEE_BPS, UNISWAP_COST, 22);
        uint256 uniFee = (AMOUNT * UNISWAP_FEE_BPS) / 10_000;
        uint256 treasuryMid = tokenIn.balanceOf(treasury);
        uint256 userBOutBefore = tokenOut.balanceOf(userB);

        vm.prank(userB);
        uint256 outB = executor.execute(intentB, path);
        assertEq(outB, 2);
        assertEq(tokenIn.balanceOf(treasury) - treasuryMid, uniFee);
        assertEq(uniRouter.lastAmountIn(), AMOUNT - uniFee);
        assertEq(uniRouter.lastRecipient(), userB);
        assertEq(tokenOut.balanceOf(userB) - userBOutBefore, outB);
        assertTrue(executor.usedNonce(userA, 11));
        assertTrue(executor.usedNonce(userB, 22));
        assertFalse(executor.usedNonce(userA, 22));
    }

    function testFeeBypassWrongRouterWrongVenueBadHashExpiredReplayWrongUser() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) =
            _bindingIntent(userA, address(pancakeRouter), pancakeVenue, PANCAKE_FEE_BPS, PANCAKE_COST, 1);

        intent.feeBps = 0;
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.FeeBypass.selector);
        executor.execute(intent, path);

        (intent, path) = _bindingIntent(userA, address(pancakeRouter), pancakeVenue, PANCAKE_FEE_BPS, PANCAKE_COST, 1);
        intent.router = address(uniRouter);
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongRouter.selector);
        executor.execute(intent, path);

        (intent, path) = _bindingIntent(userA, address(pancakeRouter), pancakeVenue, PANCAKE_FEE_BPS, PANCAKE_COST, 1);
        intent.venueId = uniVenue;
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongRouter.selector);
        executor.execute(intent, path);

        (intent, path) = _bindingIntent(userA, address(pancakeRouter), pancakeVenue, PANCAKE_FEE_BPS, PANCAKE_COST, 1);
        intent.routeHash = bytes32(uint256(1));
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongRoute.selector);
        executor.execute(intent, path);

        (intent, path) = _bindingIntent(userA, address(pancakeRouter), pancakeVenue, PANCAKE_FEE_BPS, PANCAKE_COST, 1);
        intent.deadline = block.timestamp - 1;
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.Expired.selector);
        executor.execute(intent, path);

        (intent, path) = _bindingIntent(userA, address(pancakeRouter), pancakeVenue, PANCAKE_FEE_BPS, PANCAKE_COST, 1);
        vm.prank(userB);
        vm.expectRevert(SmartSwapExecutorV2.WrongUser.selector);
        executor.execute(intent, path);

        vm.prank(userA);
        executor.execute(intent, path);
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.Replay.selector);
        executor.execute(intent, path);
    }

    function _fundUser(address user) internal {
        tokenIn.mint(user, AMOUNT * 10);
        vm.prank(user);
        tokenIn.approve(address(executor), type(uint256).max);
        vm.prank(user);
        wbnb.approve(address(executor), type(uint256).max);
        vm.deal(user, 10 ether);
    }

    function _bindingIntent(
        address user,
        address router,
        bytes32 venueId,
        uint16 feeBps,
        uint256 structural,
        uint256 nonce
    ) internal view returns (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) {
        path = new address[](2);
        path[0] = address(tokenIn);
        path[1] = address(tokenOut);
        intent = SmartSwapExecutorV2.ExecutionIntent({
            version: 2,
            policyId: executor.POLICY_ID(),
            policyVersion: executor.POLICY_VERSION(),
            chainId: block.chainid,
            user: user,
            inputAsset: address(tokenIn),
            outputAsset: address(tokenOut),
            inputAmount: AMOUNT,
            minUserOut: 1,
            venueId: venueId,
            router: router,
            routeHash: executor.routeHashOf(path, false, false),
            feeBps: feeBps,
            feeAmount: (AMOUNT * feeBps) / 10_000,
            feeAsset: address(tokenIn),
            beneficiary: treasury,
            structuralRouteCostBps: structural,
            deadline: block.timestamp + 100,
            nonce: nonce,
            nativeIn: false,
            nativeOut: false
        });
    }
}
