// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { SmartSwapExecutorV2 } from "../../contracts/smartswap/SmartSwapExecutorV2.sol";
import { ISmartSwapV2Router } from "../../contracts/smartswap/interfaces/ISmartSwapV2Router.sol";
import { MockSmartSwapV2Router } from "../../contracts/smartswap/mocks/MockSmartSwapV2Router.sol";
import { MockERC20 } from "../../contracts/mocks/MockERC20.sol";
import { MockWBNB } from "../../contracts/mocks/MockWBNB.sol";

/// @dev Test-local router that returns a fixed output so minUserOut can fail.
contract MockFixedOutRouter is ISmartSwapV2Router {
    uint256 public fixedOut;
    uint256 public lastAmountIn;

    constructor(uint256 fixedOut_) {
        fixedOut = fixedOut_;
    }

    function setFixedOut(uint256 value) external {
        fixedOut = value;
    }

    function swapExactTokensForTokens(uint256 amountIn, uint256, address[] calldata path, address to, uint256)
        external
        returns (uint256[] memory amounts)
    {
        lastAmountIn = amountIn;
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        IERC20(path[path.length - 1]).transfer(to, fixedOut);
        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = fixedOut;
    }

    function swapExactETHForTokens(uint256, address[] calldata path, address to, uint256)
        external
        payable
        returns (uint256[] memory amounts)
    {
        lastAmountIn = msg.value;
        IERC20(path[path.length - 1]).transfer(to, fixedOut);
        amounts = new uint256[](2);
        amounts[0] = msg.value;
        amounts[1] = fixedOut;
    }

    function swapExactTokensForETH(uint256 amountIn, uint256, address[] calldata path, address to, uint256)
        external
        returns (uint256[] memory amounts)
    {
        lastAmountIn = amountIn;
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        (bool ok,) = to.call{ value: fixedOut }("");
        require(ok, "ETH_OUT");
        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = fixedOut;
    }

    receive() external payable { }
}

/// @dev Test-local router that reenters execute during the venue swap.
contract MockReentrantRouter is ISmartSwapV2Router {
    SmartSwapExecutorV2 public executor;
    SmartSwapExecutorV2.ExecutionIntent public armedIntent;
    address[] public armedPath;
    bool public armed;

    function arm(
        SmartSwapExecutorV2 executor_,
        SmartSwapExecutorV2.ExecutionIntent memory intent,
        address[] memory path
    ) external {
        executor = executor_;
        armedIntent = intent;
        delete armedPath;
        for (uint256 i = 0; i < path.length; i++) {
            armedPath.push(path[i]);
        }
        armed = true;
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256
    ) external returns (uint256[] memory amounts) {
        if (armed) {
            armed = false;
            executor.execute(armedIntent, armedPath);
        }
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        uint256 amountOut = amountOutMin + 1;
        IERC20(path[path.length - 1]).transfer(to, amountOut);
        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = amountOut;
    }

    function swapExactETHForTokens(uint256 amountOutMin, address[] calldata path, address to, uint256)
        external
        payable
        returns (uint256[] memory amounts)
    {
        uint256 amountOut = amountOutMin + 1;
        IERC20(path[path.length - 1]).transfer(to, amountOut);
        amounts = new uint256[](2);
        amounts[0] = msg.value;
        amounts[1] = amountOut;
    }

    function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256)
        external
        returns (uint256[] memory amounts)
    {
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        uint256 amountOut = amountOutMin + 1;
        (bool ok,) = to.call{ value: amountOut }("");
        require(ok, "ETH_OUT");
        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = amountOut;
    }

    receive() external payable { }
}

contract SmartSwapExecutorV2Test is Test {
    event SmartSwapExecuted(
        bytes32 indexed executionId,
        bytes32 venueId,
        address inputAsset,
        address outputAsset,
        uint256 inputAmount,
        uint256 userOutput,
        address feeAsset,
        uint256 feeAmount,
        address beneficiary
    );

    SmartSwapExecutorV2 internal executor;
    MockSmartSwapV2Router internal melegaRouter;
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

    bytes32 internal melegaVenue = keccak256("melega-dex");
    bytes32 internal pancakeVenue = keccak256("pancakeswap");
    bytes32 internal uniVenue = keccak256("uniswap");

    uint256 internal constant AMOUNT = 1_000_000;
    uint16 internal constant MELEGA_PANCAKE_FEE_BPS = 20;
    uint16 internal constant UNISWAP_FEE_BPS = 15;
    uint256 internal constant MELEGA_PANCAKE_COST = 25;
    uint256 internal constant UNISWAP_COST = 30;

    function setUp() public {
        tokenIn = new MockERC20("IN", "IN");
        tokenOut = new MockERC20("OUT", "OUT");
        wbnb = new MockWBNB();
        melegaRouter = new MockSmartSwapV2Router();
        pancakeRouter = new MockSmartSwapV2Router();
        uniRouter = new MockSmartSwapV2Router();

        vm.prank(owner);
        executor = new SmartSwapExecutorV2(treasury, address(wbnb), owner);

        vm.startPrank(owner);
        executor.setRouter(address(melegaRouter), melegaVenue, true);
        executor.setRouter(address(pancakeRouter), pancakeVenue, true);
        executor.setRouter(address(uniRouter), uniVenue, true);
        vm.stopPrank();

        _fundUser(userA);
        _fundUser(userB);
        tokenOut.mint(address(melegaRouter), AMOUNT * 100);
        tokenOut.mint(address(pancakeRouter), AMOUNT * 100);
        tokenOut.mint(address(uniRouter), AMOUNT * 100);
        tokenOut.mint(address(this), AMOUNT * 100);
        vm.deal(address(melegaRouter), 100 ether);
        vm.deal(address(pancakeRouter), 100 ether);
        vm.deal(address(uniRouter), 100 ether);
    }

    function testUserAAndUserBExecuteWithoutPlatformSignatureSameNonce() public {
        uint256 treasuryBefore = tokenIn.balanceOf(treasury);
        uint256 userAOutBefore = tokenOut.balanceOf(userA);
        uint256 userBOutBefore = tokenOut.balanceOf(userB);

        (SmartSwapExecutorV2.ExecutionIntent memory intentA, address[] memory path) = _erc20Intent(
            userA, address(melegaRouter), melegaVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        uint256 feeA = (AMOUNT * MELEGA_PANCAKE_FEE_BPS) / 10_000;
        uint256 netA = AMOUNT - feeA;

        vm.prank(userA);
        vm.expectEmit(true, false, false, true, address(executor));
        emit SmartSwapExecuted(
            keccak256(abi.encode(userA, uint256(1), address(melegaRouter))),
            melegaVenue,
            address(tokenIn),
            address(tokenOut),
            AMOUNT,
            2,
            address(tokenIn),
            feeA,
            treasury
        );
        uint256 outA = executor.execute(intentA, path);
        assertEq(outA, 2);
        assertEq(tokenIn.balanceOf(treasury) - treasuryBefore, feeA);
        assertEq(melegaRouter.lastAmountIn(), netA);
        assertEq(tokenOut.balanceOf(userA) - userAOutBefore, outA);
        assertEq(tokenIn.allowance(address(executor), address(melegaRouter)), 0);
        assertEq(tokenIn.balanceOf(address(executor)), 0);
        assertEq(tokenOut.balanceOf(address(executor)), 0);

        SmartSwapExecutorV2.ExecutionIntent memory intentB;
        (intentB, path) = _erc20Intent(
            userB, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        uint256 feeB = (AMOUNT * MELEGA_PANCAKE_FEE_BPS) / 10_000;
        uint256 netB = AMOUNT - feeB;
        uint256 treasuryMid = tokenIn.balanceOf(treasury);

        vm.prank(userB);
        uint256 outB = executor.execute(intentB, path);
        assertEq(outB, 2);
        assertEq(tokenIn.balanceOf(treasury) - treasuryMid, feeB);
        assertEq(pancakeRouter.lastAmountIn(), netB);
        assertEq(tokenOut.balanceOf(userB) - userBOutBefore, outB);
        assertTrue(executor.usedNonce(userA, 1));
        assertTrue(executor.usedNonce(userB, 1));
        assertEq(tokenIn.allowance(address(executor), address(pancakeRouter)), 0);
    }

    function testVenueFeesMelegaPancakeUniswapAndTransfers() public {
        (SmartSwapExecutorV2.ExecutionIntent memory melegaIntent, address[] memory path) = _erc20Intent(
            userA, address(melegaRouter), melegaVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        uint256 treasuryBefore = tokenIn.balanceOf(treasury);
        uint256 userBefore = tokenOut.balanceOf(userA);
        vm.prank(userA);
        uint256 melegaOut = executor.execute(melegaIntent, path);
        assertEq(tokenIn.balanceOf(treasury) - treasuryBefore, 2_000);
        assertEq(melegaRouter.lastAmountIn(), 998_000);
        assertEq(tokenOut.balanceOf(userA) - userBefore, melegaOut);

        (SmartSwapExecutorV2.ExecutionIntent memory pancakeIntent,) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 2
        );
        treasuryBefore = tokenIn.balanceOf(treasury);
        userBefore = tokenOut.balanceOf(userA);
        vm.prank(userA);
        uint256 pancakeOut = executor.execute(pancakeIntent, path);
        assertEq(tokenIn.balanceOf(treasury) - treasuryBefore, 2_000);
        assertEq(pancakeRouter.lastAmountIn(), 998_000);
        assertEq(tokenOut.balanceOf(userA) - userBefore, pancakeOut);

        (SmartSwapExecutorV2.ExecutionIntent memory uniIntent,) =
            _erc20Intent(userA, address(uniRouter), uniVenue, UNISWAP_FEE_BPS, UNISWAP_COST, AMOUNT, 3);
        treasuryBefore = tokenIn.balanceOf(treasury);
        userBefore = tokenOut.balanceOf(userA);
        vm.prank(userA);
        uint256 uniOut = executor.execute(uniIntent, path);
        assertEq(tokenIn.balanceOf(treasury) - treasuryBefore, 1_500);
        assertEq(uniRouter.lastAmountIn(), 998_500);
        assertEq(tokenOut.balanceOf(userA) - userBefore, uniOut);
    }

    function testForgedCostLowerFeeReverts() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) =
            _erc20Intent(userA, address(pancakeRouter), pancakeVenue, 5, 61, AMOUNT, 1);
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongFee.selector);
        executor.execute(intent, path);

        (intent, path) = _erc20Intent(userA, address(melegaRouter), melegaVenue, 5, 61, AMOUNT, 1);
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongFee.selector);
        executor.execute(intent, path);
    }

    function testFalseCostWithCorrectFeeReverts() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) =
            _erc20Intent(userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, 61, AMOUNT, 1);
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongFee.selector);
        executor.execute(intent, path);
    }

    function testFalseFeeWithCorrectCostReverts() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) =
            _erc20Intent(userA, address(pancakeRouter), pancakeVenue, UNISWAP_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1);
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongFee.selector);
        executor.execute(intent, path);
    }

    function testFalseFeeAmountReverts() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        intent.feeAmount = intent.feeAmount + 1;
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongFee.selector);
        executor.execute(intent, path);
    }

    function testWrongBeneficiaryReverts() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        intent.beneficiary = attacker;
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongBeneficiary.selector);
        executor.execute(intent, path);
    }

    function testUnknownOrDisabledRouterReverts() public {
        MockSmartSwapV2Router unknown = new MockSmartSwapV2Router();
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) =
            _erc20Intent(userA, address(unknown), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1);
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongRouter.selector);
        executor.execute(intent, path);

        vm.prank(owner);
        executor.setRouter(address(pancakeRouter), pancakeVenue, false);
        (intent, path) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongRouter.selector);
        executor.execute(intent, path);
    }

    function testRequestVenueMismatchReverts() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) =
            _erc20Intent(userA, address(pancakeRouter), uniVenue, UNISWAP_FEE_BPS, UNISWAP_COST, AMOUNT, 1);
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongRouter.selector);
        executor.execute(intent, path);
    }

    function testCallerNotIntentUserReverts() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        vm.prank(userB);
        vm.expectRevert(SmartSwapExecutorV2.WrongUser.selector);
        executor.execute(intent, path);
    }

    function testWrongChainReverts() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        intent.chainId = 1;
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongChain.selector);
        executor.execute(intent, path);
    }

    function testWrongPolicyAndVersionReverts() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        intent.version = 1;
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongPolicy.selector);
        executor.execute(intent, path);

        (intent, path) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        intent.policyId = keccak256("OTHER");
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongPolicy.selector);
        executor.execute(intent, path);

        (intent, path) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        intent.policyVersion = keccak256("9.9.9");
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongPolicy.selector);
        executor.execute(intent, path);
    }

    function testExpiredDeadlineReverts() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        intent.deadline = block.timestamp - 1;
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.Expired.selector);
        executor.execute(intent, path);
    }

    function testInconsistentPathHashAndEndsRevert() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        intent.routeHash = bytes32(uint256(1));
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongRoute.selector);
        executor.execute(intent, path);

        (intent, path) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        path[0] = address(tokenOut);
        intent.routeHash = executor.routeHashOf(path, false, false);
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongRoute.selector);
        executor.execute(intent, path);

        (intent, path) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        path[1] = address(tokenIn);
        intent.routeHash = executor.routeHashOf(path, false, false);
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongRoute.selector);
        executor.execute(intent, path);

        address[] memory shortPath = new address[](1);
        shortPath[0] = address(tokenIn);
        intent.routeHash = executor.routeHashOf(shortPath, false, false);
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.InvalidPath.selector);
        executor.execute(intent, shortPath);
    }

    function testZeroInputReverts() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) =
            _erc20Intent(userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, 0, 1);
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.InvalidAmount.selector);
        executor.execute(intent, path);
    }

    function testReplaySameUserNonceReverts() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        vm.prank(userA);
        executor.execute(intent, path);
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.Replay.selector);
        executor.execute(intent, path);
    }

    function testMinUserOutNotReachedReverts() public {
        MockFixedOutRouter lowRouter = new MockFixedOutRouter(1);
        tokenOut.mint(address(lowRouter), 10);
        vm.prank(owner);
        executor.setRouter(address(lowRouter), pancakeVenue, true);

        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) = _erc20Intent(
            userA, address(lowRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        intent.minUserOut = 100;
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.WrongFee.selector);
        executor.execute(intent, path);
    }

    function testRouterRevertRollsBackFundsFeeAndNonce() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 7
        );
        pancakeRouter.setRevertNext(true);
        uint256 userInBefore = tokenIn.balanceOf(userA);
        uint256 treasuryBefore = tokenIn.balanceOf(treasury);
        vm.prank(userA);
        vm.expectRevert();
        executor.execute(intent, path);
        assertEq(tokenIn.balanceOf(userA), userInBefore);
        assertEq(tokenIn.balanceOf(treasury), treasuryBefore);
        assertEq(tokenIn.balanceOf(address(executor)), 0);
        assertFalse(executor.usedNonce(userA, 7));
    }

    function testNativeInWithoutPlatformSignatureAndExcessRefund() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) = _nativeInIntent(userA, 1 ether, 1);
        uint256 fee = (uint256(1 ether) * uint256(MELEGA_PANCAKE_FEE_BPS)) / 10_000;
        uint256 userBefore = userA.balance;
        uint256 treasuryWbnbBefore = wbnb.balanceOf(treasury);
        uint256 userOutBefore = tokenOut.balanceOf(userA);
        vm.prank(userA);
        uint256 out = executor.execute{ value: 1 ether + 0.05 ether }(intent, path);
        assertEq(userA.balance, userBefore - 1 ether);
        assertEq(wbnb.balanceOf(treasury) - treasuryWbnbBefore, fee);
        assertEq(pancakeRouter.lastNativeIn(), 1 ether - fee);
        assertEq(tokenOut.balanceOf(userA) - userOutBefore, out);
        assertEq(address(executor).balance, 0);
        assertEq(wbnb.balanceOf(address(executor)), 0);
    }

    function testNativeOutArrivesToUser() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) = _nativeOutIntent(userA, AMOUNT, 1);
        uint256 fee = (AMOUNT * MELEGA_PANCAKE_FEE_BPS) / 10_000;
        uint256 userNativeBefore = userA.balance;
        uint256 treasuryBefore = tokenIn.balanceOf(treasury);
        vm.prank(userA);
        uint256 out = executor.execute(intent, path);
        assertEq(out, 2);
        assertEq(userA.balance - userNativeBefore, out);
        assertEq(tokenIn.balanceOf(treasury) - treasuryBefore, fee);
        assertEq(pancakeRouter.lastAmountIn(), AMOUNT - fee);
        assertEq(tokenIn.allowance(address(executor), address(pancakeRouter)), 0);
    }

    function testInconsistentMsgValueReverts() public {
        (SmartSwapExecutorV2.ExecutionIntent memory erc20Intent, address[] memory erc20Path) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.NativeValue.selector);
        executor.execute{ value: 1 }(erc20Intent, erc20Path);

        (SmartSwapExecutorV2.ExecutionIntent memory nativeIntent, address[] memory nativePath) =
            _nativeInIntent(userA, 1 ether, 1);
        vm.prank(userA);
        vm.expectRevert(SmartSwapExecutorV2.NativeValue.selector);
        executor.execute{ value: 1 ether - 1 }(nativeIntent, nativePath);
    }

    function testNonOwnerCannotConfigureOrPause() public {
        vm.prank(attacker);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, attacker));
        executor.setRouter(address(pancakeRouter), pancakeVenue, false);

        vm.prank(attacker);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, attacker));
        executor.pause();

        vm.prank(attacker);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, attacker));
        executor.unpause();
    }

    function testPauseBlocksSwapAndUnpauseRestores() public {
        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1
        );
        vm.prank(owner);
        executor.pause();
        vm.prank(userA);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        executor.execute(intent, path);

        vm.prank(owner);
        executor.unpause();
        vm.prank(userA);
        uint256 out = executor.execute(intent, path);
        assertGt(out, 0);
    }

    function testReentrancyRejected() public {
        MockReentrantRouter evil = new MockReentrantRouter();
        tokenOut.mint(address(evil), AMOUNT);
        vm.prank(owner);
        executor.setRouter(address(evil), pancakeVenue, true);

        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) =
            _erc20Intent(userA, address(evil), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, AMOUNT, 1);
        evil.arm(executor, intent, path);

        vm.prank(userA);
        vm.expectRevert(ReentrancyGuard.ReentrancyGuardReentrantCall.selector);
        executor.execute(intent, path);
    }

    function testAuthorizedFeeBpsBoundaries() public view {
        assertEq(executor.authorizedFeeBps(0), 25);
        assertEq(executor.authorizedFeeBps(10), 25);
        assertEq(executor.authorizedFeeBps(11), 20);
        assertEq(executor.authorizedFeeBps(25), 20);
        assertEq(executor.authorizedFeeBps(26), 15);
        assertEq(executor.authorizedFeeBps(40), 15);
        assertEq(executor.authorizedFeeBps(41), 10);
        assertEq(executor.authorizedFeeBps(60), 10);
        assertEq(executor.authorizedFeeBps(61), 5);
    }

    function testSetRouterRejectsUnknownVenueAndZeroRouter() public {
        vm.prank(owner);
        vm.expectRevert(SmartSwapExecutorV2.UnknownVenue.selector);
        executor.setRouter(address(pancakeRouter), keccak256("sushiswap"), true);

        vm.prank(owner);
        vm.expectRevert(SmartSwapExecutorV2.ZeroAddress.selector);
        executor.setRouter(address(0), pancakeVenue, true);
    }

    function testConstructorRejectsZeroAddresses() public {
        vm.expectRevert(SmartSwapExecutorV2.ZeroAddress.selector);
        new SmartSwapExecutorV2(address(0), address(wbnb), owner);
        vm.expectRevert(SmartSwapExecutorV2.ZeroAddress.selector);
        new SmartSwapExecutorV2(treasury, address(0), owner);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableInvalidOwner.selector, address(0)));
        new SmartSwapExecutorV2(treasury, address(wbnb), address(0));
    }

    function testFuzzAmountFeeFloorAndNetIn(uint256 inputAmount) public {
        inputAmount = bound(inputAmount, 1, AMOUNT * 10);
        tokenIn.mint(userA, inputAmount);
        vm.prank(userA);
        tokenIn.approve(address(executor), inputAmount);

        (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path) = _erc20Intent(
            userA, address(pancakeRouter), pancakeVenue, MELEGA_PANCAKE_FEE_BPS, MELEGA_PANCAKE_COST, inputAmount, 99
        );
        uint256 expectedFee = (inputAmount * uint256(MELEGA_PANCAKE_FEE_BPS)) / 10_000;
        uint256 expectedNet = inputAmount - expectedFee;
        uint256 treasuryBefore = tokenIn.balanceOf(treasury);

        vm.prank(userA);
        executor.execute(intent, path);
        assertEq(tokenIn.balanceOf(treasury) - treasuryBefore, expectedFee);
        assertEq(pancakeRouter.lastAmountIn(), expectedNet);
        assertEq(tokenIn.allowance(address(executor), address(pancakeRouter)), 0);
        assertEq(tokenIn.balanceOf(address(executor)), 0);
    }

    function _fundUser(address user) internal {
        tokenIn.mint(user, AMOUNT * 20);
        wbnb.mint(user, AMOUNT * 20);
        vm.deal(user, 100 ether);
        vm.prank(user);
        tokenIn.approve(address(executor), type(uint256).max);
        vm.prank(user);
        wbnb.approve(address(executor), type(uint256).max);
    }

    function _erc20Intent(
        address user,
        address router,
        bytes32 venueId,
        uint16 feeBps,
        uint256 structural,
        uint256 amount,
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
            inputAmount: amount,
            minUserOut: 1,
            venueId: venueId,
            router: router,
            routeHash: executor.routeHashOf(path, false, false),
            feeBps: feeBps,
            feeAmount: (amount * feeBps) / 10_000,
            feeAsset: address(tokenIn),
            beneficiary: treasury,
            structuralRouteCostBps: structural,
            deadline: block.timestamp + 100,
            nonce: nonce,
            nativeIn: false,
            nativeOut: false
        });
    }

    function _nativeInIntent(address user, uint256 amount, uint256 nonce)
        internal
        view
        returns (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path)
    {
        path = new address[](2);
        path[0] = address(wbnb);
        path[1] = address(tokenOut);
        intent = SmartSwapExecutorV2.ExecutionIntent({
            version: 2,
            policyId: executor.POLICY_ID(),
            policyVersion: executor.POLICY_VERSION(),
            chainId: block.chainid,
            user: user,
            inputAsset: executor.NATIVE(),
            outputAsset: address(tokenOut),
            inputAmount: amount,
            minUserOut: 1,
            venueId: pancakeVenue,
            router: address(pancakeRouter),
            routeHash: executor.routeHashOf(path, true, false),
            feeBps: MELEGA_PANCAKE_FEE_BPS,
            feeAmount: (amount * MELEGA_PANCAKE_FEE_BPS) / 10_000,
            feeAsset: executor.NATIVE(),
            beneficiary: treasury,
            structuralRouteCostBps: MELEGA_PANCAKE_COST,
            deadline: block.timestamp + 100,
            nonce: nonce,
            nativeIn: true,
            nativeOut: false
        });
    }

    function _nativeOutIntent(address user, uint256 amount, uint256 nonce)
        internal
        view
        returns (SmartSwapExecutorV2.ExecutionIntent memory intent, address[] memory path)
    {
        path = new address[](2);
        path[0] = address(tokenIn);
        path[1] = address(wbnb);
        intent = SmartSwapExecutorV2.ExecutionIntent({
            version: 2,
            policyId: executor.POLICY_ID(),
            policyVersion: executor.POLICY_VERSION(),
            chainId: block.chainid,
            user: user,
            inputAsset: address(tokenIn),
            outputAsset: executor.NATIVE(),
            inputAmount: amount,
            minUserOut: 1,
            venueId: pancakeVenue,
            router: address(pancakeRouter),
            routeHash: executor.routeHashOf(path, false, true),
            feeBps: MELEGA_PANCAKE_FEE_BPS,
            feeAmount: (amount * MELEGA_PANCAKE_FEE_BPS) / 10_000,
            feeAsset: address(tokenIn),
            beneficiary: treasury,
            structuralRouteCostBps: MELEGA_PANCAKE_COST,
            deadline: block.timestamp + 100,
            nonce: nonce,
            nativeIn: false,
            nativeOut: true
        });
    }
}
