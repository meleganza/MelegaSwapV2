// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SmartSwapExecutorV1} from "../../contracts/smartswap/SmartSwapExecutorV1.sol";
import {MockSmartSwapV2Router} from "../../contracts/smartswap/mocks/MockSmartSwapV2Router.sol";
import {MockERC20} from "../../contracts/mocks/MockERC20.sol";
import {MockWBNB} from "../../contracts/mocks/MockWBNB.sol";

contract SmartSwapExecutorV1Test is Test {
    SmartSwapExecutorV1 internal executor;
    MockSmartSwapV2Router internal router;
    MockERC20 internal usdc;
    MockWBNB internal wbnb;

    address internal treasury = makeAddr("treasury");
    uint256 internal signerPk = 0xA11CE;
    address internal signer;
    address internal user = makeAddr("user");
    bytes32 internal pancakeVenue = keccak256("pancakeswap");

    uint256 internal constant AMOUNT = 1_000_000;

    function setUp() public {
        signer = vm.addr(signerPk);
        router = new MockSmartSwapV2Router();
        usdc = new MockERC20("USDC", "USDC");
        wbnb = new MockWBNB();
        executor = new SmartSwapExecutorV1(treasury, signer, address(wbnb), address(this));
        executor.setRouter(address(router), pancakeVenue, true);

        wbnb.mint(user, AMOUNT * 10);
        usdc.mint(address(router), AMOUNT * 10);
        vm.deal(address(router), 100 ether);
        vm.deal(user, 100 ether);
        vm.prank(user);
        wbnb.approve(address(executor), type(uint256).max);
    }

    function testExactInFee20BpsAndAtomicVenueRevert() public {
        SmartSwapExecutorV1.ExecutionIntent memory intent = _intent(20, 25, AMOUNT, false, false);
        bytes memory sig = _sign(intent);
        address[] memory path = new address[](2);
        path[0] = address(wbnb);
        path[1] = address(usdc);

        uint256 treasuryBefore = wbnb.balanceOf(treasury);
        vm.prank(user);
        uint256 out = executor.execute(intent, path, sig);
        assertEq(wbnb.balanceOf(treasury) - treasuryBefore, 2_000);
        assertEq(router.lastAmountIn(), 998_000);
        assertGt(out, 0);

        router.setRevertNext(true);
        intent.nonce = 2;
        sig = _sign(intent);
        uint256 treasuryMid = wbnb.balanceOf(treasury);
        vm.prank(user);
        vm.expectRevert();
        executor.execute(intent, path, sig);
        assertEq(wbnb.balanceOf(treasury), treasuryMid);
    }

    function testFeeBypassAndWrongBeneficiaryRevert() public {
        SmartSwapExecutorV1.ExecutionIntent memory intent = _intent(0, 25, AMOUNT, false, false);
        bytes memory sig = _sign(intent);
        address[] memory path = new address[](2);
        path[0] = address(wbnb);
        path[1] = address(usdc);
        vm.prank(user);
        vm.expectRevert(SmartSwapExecutorV1.FeeBypass.selector);
        executor.execute(intent, path, sig);
    }

    function testReplayAndWrongChain() public {
        SmartSwapExecutorV1.ExecutionIntent memory intent = _intent(20, 25, AMOUNT, false, false);
        bytes memory sig = _sign(intent);
        address[] memory path = new address[](2);
        path[0] = address(wbnb);
        path[1] = address(usdc);
        vm.prank(user);
        executor.execute(intent, path, sig);
        vm.prank(user);
        vm.expectRevert(SmartSwapExecutorV1.Replay.selector);
        executor.execute(intent, path, sig);

        intent.nonce = 99;
        intent.chainId = 1;
        sig = _sign(intent);
        vm.prank(user);
        vm.expectRevert(SmartSwapExecutorV1.WrongChain.selector);
        executor.execute(intent, path, sig);
    }

    function testNativeInRefundsExcess() public {
        SmartSwapExecutorV1.ExecutionIntent memory intent = _intent(20, 25, 1 ether, true, false);
        intent.inputAsset = executor.NATIVE();
        intent.feeAsset = executor.NATIVE();
        intent.feeAmount = (1 ether * 20) / 10_000;
        address[] memory path = new address[](2);
        path[0] = address(wbnb);
        path[1] = address(usdc);
        intent.routeHash = executor.routeHashOf(path, true, false);
        bytes memory sig = _sign(intent);
        uint256 userBefore = user.balance;
        vm.prank(user);
        executor.execute{value: 1 ether + 0.05 ether}(intent, path, sig);
        assertEq(user.balance, userBefore - 1 ether);
        assertEq(wbnb.balanceOf(treasury), (1 ether * 20) / 10_000);
    }

    function _intent(uint16 feeBps, uint256 structural, uint256 amount, bool nativeIn, bool nativeOut)
        internal
        view
        returns (SmartSwapExecutorV1.ExecutionIntent memory intent)
    {
        address[] memory path = new address[](2);
        path[0] = address(wbnb);
        path[1] = address(usdc);
        intent = SmartSwapExecutorV1.ExecutionIntent({
            version: 1,
            policyId: executor.POLICY_ID(),
            policyVersion: executor.POLICY_VERSION(),
            chainId: block.chainid,
            user: user,
            inputAsset: address(wbnb),
            outputAsset: address(usdc),
            inputAmount: amount,
            minUserOut: 1,
            venueId: pancakeVenue,
            router: address(router),
            routeHash: executor.routeHashOf(path, nativeIn, nativeOut),
            feeBps: feeBps,
            feeAmount: (amount * feeBps) / 10_000,
            feeAsset: address(wbnb),
            beneficiary: treasury,
            structuralRouteCostBps: structural,
            deadline: block.timestamp + 100,
            nonce: 1,
            nativeIn: nativeIn,
            nativeOut: nativeOut
        });
    }

    function _sign(SmartSwapExecutorV1.ExecutionIntent memory intent) internal view returns (bytes memory) {
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", executor.intentHash(intent)));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, digest);
        return abi.encodePacked(r, s, v);
    }
}
