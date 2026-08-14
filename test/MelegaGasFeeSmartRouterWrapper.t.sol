// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IPancakeSmartRouter } from "../contracts/interfaces/IPancakeSmartRouter.sol";
import { MelegaGasFeeSmartRouterWrapper } from "../contracts/MelegaGasFeeSmartRouterWrapper.sol";
import { MockERC20 } from "../contracts/mocks/MockERC20.sol";
import { MockPancakeSmartRouter } from "../contracts/mocks/MockPancakeSmartRouter.sol";

contract MelegaGasFeeSmartRouterWrapperTest is Test {
    uint256 internal constant GAS_PRICE = 5 gwei;
    uint256 internal constant GAS_QUOTE = 350_000;
    uint256 internal constant AMOUNT = 10 ether;

    MockPancakeSmartRouter internal router;
    MelegaGasFeeSmartRouterWrapper internal wrapper;
    MockERC20 internal tokenIn;
    MockERC20 internal tokenOut;
    address payable internal treasury = payable(makeAddr("treasury"));
    address internal user = makeAddr("user");

    function setUp() public {
        router = new MockPancakeSmartRouter();
        wrapper = new MelegaGasFeeSmartRouterWrapper(address(router), treasury, address(this));
        tokenIn = new MockERC20("Input", "IN");
        tokenOut = new MockERC20("Output", "OUT");
        tokenIn.mint(user, 100 ether);
        tokenOut.mint(address(router), 100 ether);
        vm.deal(user, 100 ether);
        vm.txGasPrice(GAS_PRICE);
        vm.prank(user);
        tokenIn.approve(address(wrapper), type(uint256).max);
    }

    function test_feeIsExactlyTwentyFivePercentOfQuotedGas() public view {
        uint256 fee = wrapper.quoteProtocolFee(GAS_QUOTE, GAS_PRICE);
        assertEq(fee, (GAS_QUOTE * GAS_PRICE) / 4);
    }

    function test_tokenSwapAndNativeFeeSettleAtomically() public {
        uint256 fee = wrapper.quoteProtocolFee(GAS_QUOTE, GAS_PRICE);
        uint256 treasuryBefore = treasury.balance;

        vm.prank(user);
        uint256 amountOut = wrapper.swapExactInputSingle{ value: fee }(
            IERC20(address(tokenIn)), IERC20(address(tokenOut)), AMOUNT, 1, IPancakeSmartRouter.FLAG._1, user, GAS_QUOTE
        );

        assertEq(amountOut, AMOUNT);
        assertEq(tokenOut.balanceOf(user), AMOUNT);
        assertEq(treasury.balance - treasuryBefore, fee);
        assertEq(tokenIn.balanceOf(address(wrapper)), 0);
    }

    function test_routerFailureRollsBackFeeAndTokens() public {
        uint256 fee = wrapper.quoteProtocolFee(GAS_QUOTE, GAS_PRICE);
        uint256 treasuryBefore = treasury.balance;
        uint256 userBefore = tokenIn.balanceOf(user);
        router.setShouldRevert(true);

        vm.prank(user);
        vm.expectRevert(MockPancakeSmartRouter.ForcedRevert.selector);
        wrapper.swapExactInputSingle{ value: fee }(
            IERC20(address(tokenIn)), IERC20(address(tokenOut)), AMOUNT, 1, IPancakeSmartRouter.FLAG._1, user, GAS_QUOTE
        );

        assertEq(treasury.balance, treasuryBefore);
        assertEq(tokenIn.balanceOf(user), userBefore);
    }

    function test_rejectsIncorrectFeeValue() public {
        uint256 fee = wrapper.quoteProtocolFee(GAS_QUOTE, GAS_PRICE);
        vm.prank(user);
        vm.expectRevert();
        wrapper.swapExactInputSingle{ value: fee - 1 }(
            IERC20(address(tokenIn)), IERC20(address(tokenOut)), AMOUNT, 1, IPancakeSmartRouter.FLAG._1, user, GAS_QUOTE
        );
    }

    function test_rejectsUnrealisticallyLowGasQuote() public {
        vm.expectRevert(MelegaGasFeeSmartRouterWrapper.InvalidGasQuote.selector);
        wrapper.quoteProtocolFee(10_000, GAS_PRICE);
    }
}
