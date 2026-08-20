// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SmartSwapExecutorV1} from "../../contracts/smartswap/SmartSwapExecutorV1.sol";
import {IWBNB} from "../../contracts/interfaces/IWBNB.sol";

interface IPancakeRouter02Ext {
    function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts);

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

interface IPancakeFactory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

/// @notice BNB mainnet-fork canary. Skips if RPC/fork unavailable. Never broadcasts to mainnet.
contract SmartSwapExecutorV1BnbForkTest is Test {
    address internal constant TREASURY = 0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b;
    address internal constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address internal constant USDT = 0x55d398326f99059fF775485246999027B3197955;
    address internal constant PANCAKE = 0x10ED43C718714eb63d5aA57B78B54704E256024E;
    address internal constant MELEGA = 0xc25033218D181b27D4a2944Fbb04FC055da4EAB3;
    address internal constant FACTORY = 0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73;
    address internal constant PAIR = 0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE;
    uint256 internal constant AMOUNT = 0.01 ether;
    uint256 internal constant STRUCTURAL = 25;
    bytes32 internal constant VENUE = keccak256("pancakeswap");

    uint256 internal signerPk = 0xA11CE;
    address internal signer;
    address internal user;
    SmartSwapExecutorV1 internal executor;
    bool internal forked;

    function setUp() public {
        signer = vm.addr(signerPk);
        user = makeAddr("canaryUser");
        try this.tryFork() returns (bool ok) {
            forked = ok;
        } catch {
            forked = false;
        }
        if (!forked) {
            console2.log("SKIP: BNB fork unavailable");
            return;
        }
        executor = new SmartSwapExecutorV1(TREASURY, signer, WBNB, address(this));
        executor.setRouter(PANCAKE, VENUE, true);
        vm.deal(user, 1 ether);
        vm.prank(user);
        IWBNB(WBNB).deposit{value: AMOUNT}();
        vm.prank(user);
        IERC20(WBNB).approve(address(executor), AMOUNT);
    }

    function tryFork() external returns (bool) {
        string memory rpc = vm.envOr("BNB_MAINNET_RPC_URL", string("https://bsc.publicnode.com"));
        vm.createSelectFork(rpc);
        return block.chainid == 56;
    }

    modifier forkOnly() {
        if (!forked) return;
        _;
    }

    function testForkDeployConfig() public forkOnly {
        assertEq(block.chainid, 56);
        assertEq(executor.treasury(), TREASURY);
        assertEq(executor.wrappedNative(), WBNB);
        assertEq(executor.allowedVenue(PANCAKE), VENUE);
        assertEq(executor.allowedVenue(MELEGA), bytes32(0));
        assertEq(executor.MAX_PROTOCOL_FEE_BPS(), 25);
        assertEq(executor.authorizedFeeBps(STRUCTURAL), 20);
        assertEq(IPancakeFactory(FACTORY).getPair(WBNB, USDT), PAIR);
    }

    function testForkSuccessfulAtomicCanary() public forkOnly {
        address[] memory path = _path();
        uint256 fee = (AMOUNT * 20) / 10_000;
        uint256 net = AMOUNT - fee;
        uint256 expectedOut = IPancakeRouter02Ext(PANCAKE).getAmountsOut(net, path)[1];
        SmartSwapExecutorV1.ExecutionIntent memory intent = _intent(path, expectedOut, 1);
        bytes memory sig = _sign(intent);

        uint256 treasuryBefore = IERC20(WBNB).balanceOf(TREASURY);
        uint256 userUsdtBefore = IERC20(USDT).balanceOf(user);
        uint256 userWbnbBefore = IERC20(WBNB).balanceOf(user);

        uint256 gasBefore = gasleft();
        vm.prank(user);
        uint256 out = executor.execute(intent, path, sig);
        uint256 executorGas = gasBefore - gasleft();

        assertEq(IERC20(WBNB).balanceOf(TREASURY) - treasuryBefore, fee);
        assertEq(userWbnbBefore - IERC20(WBNB).balanceOf(user), AMOUNT);
        assertEq(IERC20(USDT).balanceOf(user) - userUsdtBefore, out);
        assertGe(out, expectedOut);
        assertEq(IERC20(WBNB).balanceOf(address(executor)), 0);
        assertEq(IERC20(USDT).balanceOf(address(executor)), 0);
        assertEq(address(executor).balance, 0);
        assertTrue(executor.usedNonce(user, 1));
        console2.log("FORK_CANARY_OK");
        console2.log("userOutput", out);
        console2.log("treasuryFee", fee);
        console2.log("venueInput", net);
        console2.log("executorGas", executorGas);
        console2.log("FEE_VERIFIED", uint256(0));
    }

    function testForkDirectVsExecutorGas() public forkOnly {
        address[] memory path = _path();
        address directUser = makeAddr("directUser");
        vm.deal(directUser, 1 ether);
        vm.prank(directUser);
        IWBNB(WBNB).deposit{value: AMOUNT}();
        vm.prank(directUser);
        IERC20(WBNB).approve(PANCAKE, AMOUNT);
        uint256 minDirect = IPancakeRouter02Ext(PANCAKE).getAmountsOut(AMOUNT, path)[1];
        uint256 gasDirectBefore = gasleft();
        vm.prank(directUser);
        IPancakeRouter02Ext(PANCAKE).swapExactTokensForTokens(AMOUNT, minDirect, path, directUser, block.timestamp + 60);
        uint256 directGas = gasDirectBefore - gasleft();

        uint256 fee = (AMOUNT * 20) / 10_000;
        uint256 net = AMOUNT - fee;
        uint256 minExec = IPancakeRouter02Ext(PANCAKE).getAmountsOut(net, path)[1];
        SmartSwapExecutorV1.ExecutionIntent memory intent = _intent(path, minExec, 7);
        bytes memory sig = _sign(intent);
        uint256 gasExecBefore = gasleft();
        vm.prank(user);
        executor.execute(intent, path, sig);
        uint256 execGas = gasExecBefore - gasleft();
        console2.log("directGas", directGas);
        console2.log("executorGas", execGas);
        console2.log("incrementalGas", execGas > directGas ? execGas - directGas : 0);
        assertGt(execGas, 0);
        assertGt(directGas, 0);
    }

    function testForkVenueRevertRollsBackTreasury() public forkOnly {
        address[] memory path = _path();
        SmartSwapExecutorV1.ExecutionIntent memory intent = _intent(path, type(uint256).max, 2);
        bytes memory sig = _sign(intent);
        uint256 treasuryBefore = IERC20(WBNB).balanceOf(TREASURY);
        uint256 userWbnbBefore = IERC20(WBNB).balanceOf(user);
        vm.prank(user);
        vm.expectRevert();
        executor.execute(intent, path, sig);
        assertEq(IERC20(WBNB).balanceOf(TREASURY), treasuryBefore);
        assertEq(IERC20(WBNB).balanceOf(user), userWbnbBefore);
        assertEq(IERC20(WBNB).balanceOf(address(executor)), 0);
        assertEq(IERC20(USDT).balanceOf(address(executor)), 0);
        assertEq(address(executor).balance, 0);
    }

    function testForkWrongBeneficiaryRouterExpiredReplayChain() public forkOnly {
        address[] memory path = _path();
        uint256 minOut = IPancakeRouter02Ext(PANCAKE).getAmountsOut((AMOUNT * 9980) / 10_000, path)[1];

        SmartSwapExecutorV1.ExecutionIntent memory badBen = _intent(path, minOut, 3);
        badBen.beneficiary = user;
        bytes memory badBenSig = _sign(badBen);
        vm.prank(user);
        vm.expectRevert(SmartSwapExecutorV1.WrongBeneficiary.selector);
        executor.execute(badBen, path, badBenSig);

        SmartSwapExecutorV1.ExecutionIntent memory badRouter = _intent(path, minOut, 4);
        badRouter.router = MELEGA;
        badRouter.routeHash = executor.routeHashOf(path, false, false);
        bytes memory badRouterSig = _sign(badRouter);
        vm.prank(user);
        vm.expectRevert(SmartSwapExecutorV1.WrongRouter.selector);
        executor.execute(badRouter, path, badRouterSig);

        SmartSwapExecutorV1.ExecutionIntent memory expired = _intent(path, minOut, 5);
        expired.deadline = block.timestamp - 1;
        bytes memory expiredSig = _sign(expired);
        vm.prank(user);
        vm.expectRevert(SmartSwapExecutorV1.Expired.selector);
        executor.execute(expired, path, expiredSig);

        SmartSwapExecutorV1.ExecutionIntent memory ok = _intent(path, minOut, 6);
        bytes memory okSig = _sign(ok);
        vm.prank(user);
        executor.execute(ok, path, okSig);
        vm.prank(user);
        vm.expectRevert(SmartSwapExecutorV1.Replay.selector);
        executor.execute(ok, path, okSig);

        SmartSwapExecutorV1.ExecutionIntent memory chain = _intent(path, minOut, 8);
        chain.chainId = 1;
        bytes memory chainSig = _sign(chain);
        vm.prank(user);
        vm.expectRevert(SmartSwapExecutorV1.WrongChain.selector);
        executor.execute(chain, path, chainSig);
    }

    function testForkInvalidIntentAndWrongSigner() public forkOnly {
        address[] memory path = _path();
        uint256 minOut = IPancakeRouter02Ext(PANCAKE).getAmountsOut((AMOUNT * 9980) / 10_000, path)[1];
        uint256 treasuryBefore = IERC20(WBNB).balanceOf(TREASURY);

        SmartSwapExecutorV1.ExecutionIntent memory badPolicy = _intent(path, minOut, 10);
        badPolicy.version = 2;
        bytes memory badPolicySig = _sign(badPolicy);
        vm.prank(user);
        vm.expectRevert(SmartSwapExecutorV1.WrongPolicy.selector);
        executor.execute(badPolicy, path, badPolicySig);

        SmartSwapExecutorV1.ExecutionIntent memory ok = _intent(path, minOut, 11);
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", executor.intentHash(ok)));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(0xB0B, digest);
        bytes memory wrongSig = abi.encodePacked(r, s, v);
        vm.prank(user);
        vm.expectRevert(SmartSwapExecutorV1.WrongSigner.selector);
        executor.execute(ok, path, wrongSig);

        assertEq(IERC20(WBNB).balanceOf(TREASURY), treasuryBefore);
        assertEq(IERC20(WBNB).balanceOf(address(executor)), 0);
    }

    function testForkPauseKeepsLegacyPath() public forkOnly {
        executor.pause();
        address[] memory path = _path();
        uint256 minOut = IPancakeRouter02Ext(PANCAKE).getAmountsOut(AMOUNT, path)[1];
        address legacy = makeAddr("legacy");
        vm.deal(legacy, 1 ether);
        vm.prank(legacy);
        IWBNB(WBNB).deposit{value: AMOUNT}();
        vm.prank(legacy);
        IERC20(WBNB).approve(PANCAKE, AMOUNT);
        vm.prank(legacy);
        IPancakeRouter02Ext(PANCAKE).swapExactTokensForTokens(AMOUNT, minOut, path, legacy, block.timestamp + 60);
        assertGt(IERC20(USDT).balanceOf(legacy), 0);

        SmartSwapExecutorV1.ExecutionIntent memory intent = _intent(path, 1, 12);
        bytes memory sig = _sign(intent);
        vm.prank(user);
        vm.expectRevert();
        executor.execute(intent, path, sig);
    }

    function testForkApprovalThenExecute() public forkOnly {
        address fresh = makeAddr("fresh");
        vm.deal(fresh, 1 ether);
        vm.prank(fresh);
        IWBNB(WBNB).deposit{value: AMOUNT}();
        assertEq(IERC20(WBNB).allowance(fresh, address(executor)), 0);
        assertEq(IERC20(WBNB).allowance(fresh, PANCAKE), 0);
        vm.prank(fresh);
        IERC20(WBNB).approve(address(executor), AMOUNT);
        assertEq(IERC20(WBNB).allowance(fresh, address(executor)), AMOUNT);
        address[] memory path = _path();
        uint256 minOut = IPancakeRouter02Ext(PANCAKE).getAmountsOut((AMOUNT * 9980) / 10_000, path)[1];
        SmartSwapExecutorV1.ExecutionIntent memory intent = _intent(path, minOut, 9);
        intent.user = fresh;
        bytes memory sig = _sign(intent);
        vm.prank(fresh);
        uint256 out = executor.execute(intent, path, sig);
        assertGt(out, 0);
        assertEq(IERC20(WBNB).balanceOf(address(executor)), 0);
        assertEq(IERC20(USDT).balanceOf(address(executor)), 0);
        assertEq(address(executor).balance, 0);
    }

    function _path() internal pure returns (address[] memory path) {
        path = new address[](2);
        path[0] = WBNB;
        path[1] = USDT;
    }

    function _intent(address[] memory path, uint256 minUserOut, uint256 nonce)
        internal
        view
        returns (SmartSwapExecutorV1.ExecutionIntent memory intent)
    {
        uint16 feeBps = 20;
        intent = SmartSwapExecutorV1.ExecutionIntent({
            version: 1,
            policyId: executor.POLICY_ID(),
            policyVersion: executor.POLICY_VERSION(),
            chainId: 56,
            user: user,
            inputAsset: WBNB,
            outputAsset: USDT,
            inputAmount: AMOUNT,
            minUserOut: minUserOut,
            venueId: VENUE,
            router: PANCAKE,
            routeHash: executor.routeHashOf(path, false, false),
            feeBps: feeBps,
            feeAmount: (AMOUNT * feeBps) / 10_000,
            feeAsset: WBNB,
            beneficiary: TREASURY,
            structuralRouteCostBps: STRUCTURAL,
            deadline: block.timestamp + 120,
            nonce: nonce,
            nativeIn: false,
            nativeOut: false
        });
    }

    function _sign(SmartSwapExecutorV1.ExecutionIntent memory intent) internal view returns (bytes memory) {
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", executor.intentHash(intent)));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, digest);
        return abi.encodePacked(r, s, v);
    }
}
