// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {stdJson} from "forge-std/StdJson.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SmartSwapExecutorV1} from "../../contracts/smartswap/SmartSwapExecutorV1.sol";
import {MockSmartSwapV2Router} from "../../contracts/smartswap/mocks/MockSmartSwapV2Router.sol";
import {MockERC20} from "../../contracts/mocks/MockERC20.sol";
import {MockWBNB} from "../../contracts/mocks/MockWBNB.sol";
import {IWBNB} from "../../contracts/interfaces/IWBNB.sol";

interface IUniswapV2Router {
    function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts);

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

/// @notice Ethereum constructor/config reuse + optional mainnet-fork certified canary.
/// @dev Fork path is the architect-certified exact-in 0.002 WETH→USDC canary. No broadcast.
contract SmartSwapExecutorV1EthereumCanaryPrepTest is Test {
    using stdJson for string;
    address internal constant TREASURY = 0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b;
    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address internal constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address internal constant UNISWAP = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address internal constant FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    uint256 internal constant STRUCTURAL_UNISWAP_V2_BPS = 30;
    uint256 internal constant CANARY_AMOUNT = 0.002 ether;
    bytes32 internal constant VENUE = keccak256("uniswap");
    bytes32 internal constant EXPECTED_CREATION_KECCAK =
        0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791;
    bytes32 internal constant EXPECTED_DEPLOYED_KECCAK =
        0x22b936d04dda69aa1fc31e031793ce922a18013fa9c2f0587043a627e75da0e1;

    uint256 internal signerPk = 0xA11CE;
    address internal signer;
    address internal user;
    SmartSwapExecutorV1 internal localExecutor;
    SmartSwapExecutorV1 internal forkExecutor;
    MockSmartSwapV2Router internal mockRouter;
    MockERC20 internal mockUsdc;
    MockWBNB internal mockWeth;
    bytes internal creationBytecode;
    bytes internal deployedTemplate;
    bool internal forked;

    function setUp() public {
        signer = vm.addr(signerPk);
        user = makeAddr("ethUser");
        mockRouter = new MockSmartSwapV2Router();
        mockUsdc = new MockERC20("USDC", "USDC");
        mockWeth = new MockWBNB();
        string memory json = vm.readFile("deployments/smartswap-executor-v1/smart-swap-executor-v1-artifact.json");
        creationBytecode = json.readBytes(".creationBytecode");
        deployedTemplate = json.readBytes(".deployedBytecode");
        require(keccak256(creationBytecode) == EXPECTED_CREATION_KECCAK, "creation keccak");
        require(keccak256(deployedTemplate) == EXPECTED_DEPLOYED_KECCAK, "deployed keccak");

        localExecutor = new SmartSwapExecutorV1(TREASURY, signer, WETH, address(this));
        localExecutor.setRouter(address(mockRouter), VENUE, true);
        mockWeth.mint(user, 10_000_000);
        mockUsdc.mint(address(mockRouter), 10_000_000);
        vm.prank(user);
        mockWeth.approve(address(localExecutor), type(uint256).max);

        try this.tryFork() returns (bool ok) {
            forked = ok;
        } catch {
            forked = false;
        }
        if (!forked) {
            console2.log("SKIP_ETH_FORK: Ethereum mainnet RPC unavailable");
            return;
        }
        forkExecutor = SmartSwapExecutorV1(payable(_deployArtifact(TREASURY, signer, WETH, address(this))));
        forkExecutor.setRouter(UNISWAP, VENUE, true);
        vm.deal(user, 1 ether);
        vm.prank(user);
        IWBNB(WETH).deposit{value: CANARY_AMOUNT}();
        vm.prank(user);
        IERC20(WETH).approve(address(forkExecutor), CANARY_AMOUNT);
    }

    function tryFork() external returns (bool) {
        string memory rpc = vm.envOr("ETHEREUM_RPC_URL", string("https://ethereum.publicnode.com"));
        vm.createSelectFork(rpc);
        return block.chainid == 1;
    }

    modifier forkOnly() {
        if (!forked) return;
        _;
    }

    function testCertifiedArtifactHashes() public view {
        assertEq(creationBytecode.length, 8584);
        assertEq(deployedTemplate.length, 8062);
        assertEq(keccak256(creationBytecode), EXPECTED_CREATION_KECCAK);
        assertEq(keccak256(deployedTemplate), EXPECTED_DEPLOYED_KECCAK);
    }

    function testEthereumConstructorConfigReusesCertifiedSource() public view {
        assertEq(localExecutor.treasury(), TREASURY);
        assertEq(localExecutor.wrappedNative(), WETH);
        assertEq(localExecutor.intentSigner(), signer);
        assertEq(localExecutor.allowedVenue(address(mockRouter)), VENUE);
        assertEq(localExecutor.allowedVenue(UNISWAP), bytes32(0));
        assertEq(localExecutor.MAX_PROTOCOL_FEE_BPS(), 25);
        assertEq(localExecutor.authorizedFeeBps(STRUCTURAL_UNISWAP_V2_BPS), 15);
        assertEq(localExecutor.authorizedFeeBps(25), 20);
        assertFalse(localExecutor.paused());
    }

    function testLocalAtomicFeeSwapTreasuryMinOutRevertReplayNoTrap() public {
        uint256 amount = 1_000_000;
        address[] memory path = new address[](2);
        path[0] = address(mockWeth);
        path[1] = address(mockUsdc);
        SmartSwapExecutorV1.ExecutionIntent memory intent = _localIntent(path, amount, 15, 30, 1, 1);
        bytes memory sig = _sign(localExecutor, intent);

        uint256 treasuryBefore = mockWeth.balanceOf(TREASURY);
        vm.prank(user);
        uint256 out = localExecutor.execute(intent, path, sig);
        assertEq(mockWeth.balanceOf(TREASURY) - treasuryBefore, 1_500);
        assertEq(mockRouter.lastAmountIn(), 998_500);
        assertGt(out, 0);
        assertEq(mockWeth.balanceOf(address(localExecutor)), 0);
        assertEq(mockUsdc.balanceOf(address(localExecutor)), 0);
        assertEq(address(localExecutor).balance, 0);

        vm.prank(user);
        vm.expectRevert(SmartSwapExecutorV1.Replay.selector);
        localExecutor.execute(intent, path, sig);

        mockRouter.setRevertNext(true);
        intent.nonce = 2;
        sig = _sign(localExecutor, intent);
        uint256 treasuryMid = mockWeth.balanceOf(TREASURY);
        vm.prank(user);
        vm.expectRevert();
        localExecutor.execute(intent, path, sig);
        assertEq(mockWeth.balanceOf(TREASURY), treasuryMid);
        assertEq(mockWeth.balanceOf(address(localExecutor)), 0);
        assertEq(address(localExecutor).balance, 0);
    }

    function testLocalMinOutProtectsUser() public {
        uint256 amount = 1_000_000;
        address[] memory path = new address[](2);
        path[0] = address(mockWeth);
        path[1] = address(mockUsdc);
        SmartSwapExecutorV1.ExecutionIntent memory intent = _localIntent(path, amount, 15, 30, type(uint256).max, 3);
        bytes memory sig = _sign(localExecutor, intent);
        uint256 treasuryBefore = mockWeth.balanceOf(TREASURY);
        vm.prank(user);
        vm.expectRevert();
        localExecutor.execute(intent, path, sig);
        assertEq(mockWeth.balanceOf(TREASURY), treasuryBefore);
        assertEq(mockWeth.balanceOf(address(localExecutor)), 0);
    }

    function testForkCertifiedCanary002WethToUsdc() public forkOnly {
        assertEq(block.chainid, 1);
        assertEq(forkExecutor.wrappedNative(), WETH);
        assertEq(forkExecutor.treasury(), TREASURY);
        assertEq(forkExecutor.allowedVenue(UNISWAP), VENUE);
        assertEq(forkExecutor.authorizedFeeBps(STRUCTURAL_UNISWAP_V2_BPS), 15);
        address pair = IUniswapV2Factory(FACTORY).getPair(WETH, USDC);
        assertTrue(pair != address(0));

        address[] memory path = _forkPath();
        uint16 feeBps = forkExecutor.authorizedFeeBps(STRUCTURAL_UNISWAP_V2_BPS);
        uint256 fee = (CANARY_AMOUNT * feeBps) / 10_000;
        uint256 net = CANARY_AMOUNT - fee;
        uint256 expectedOut = IUniswapV2Router(UNISWAP).getAmountsOut(net, path)[1];
        SmartSwapExecutorV1.ExecutionIntent memory intent = _forkIntent(path, expectedOut, 1);
        bytes memory sig = _sign(forkExecutor, intent);

        uint256 treasuryBefore = IERC20(WETH).balanceOf(TREASURY);
        uint256 userUsdcBefore = IERC20(USDC).balanceOf(user);
        uint256 userWethBefore = IERC20(WETH).balanceOf(user);

        vm.prank(user);
        uint256 out = forkExecutor.execute(intent, path, sig);

        assertEq(IERC20(WETH).balanceOf(TREASURY) - treasuryBefore, fee);
        assertEq(userWethBefore - IERC20(WETH).balanceOf(user), CANARY_AMOUNT);
        assertEq(fee, 3_000_000_000_000);
        assertEq(net, 1_997_000_000_000_000);
        assertEq(IERC20(USDC).balanceOf(user) - userUsdcBefore, out);
        assertGe(out, expectedOut);
        assertEq(IERC20(WETH).balanceOf(address(forkExecutor)), 0);
        assertEq(IERC20(USDC).balanceOf(address(forkExecutor)), 0);
        assertEq(address(forkExecutor).balance, 0);
        assertTrue(forkExecutor.usedNonce(user, 1));
        console2.log("ETH_FORK_CANARY_002_WETH_OK");
        console2.log("userOutput", out);
        console2.log("treasuryFee", fee);
        console2.log("venueInput", net);

        vm.prank(user);
        vm.expectRevert(SmartSwapExecutorV1.Replay.selector);
        forkExecutor.execute(intent, path, sig);
    }

    function testForkVenueRevertRollsBack() public forkOnly {
        address[] memory path = _forkPath();
        SmartSwapExecutorV1.ExecutionIntent memory intent = _forkIntent(path, type(uint256).max, 2);
        bytes memory sig = _sign(forkExecutor, intent);
        uint256 treasuryBefore = IERC20(WETH).balanceOf(TREASURY);
        uint256 userWethBefore = IERC20(WETH).balanceOf(user);
        vm.prank(user);
        vm.expectRevert();
        forkExecutor.execute(intent, path, sig);
        assertEq(IERC20(WETH).balanceOf(TREASURY), treasuryBefore);
        assertEq(IERC20(WETH).balanceOf(user), userWethBefore);
        assertEq(IERC20(WETH).balanceOf(address(forkExecutor)), 0);
        assertEq(IERC20(USDC).balanceOf(address(forkExecutor)), 0);
        assertEq(address(forkExecutor).balance, 0);
    }

    function _deployArtifact(address treasury, address intentSigner, address wrappedNative, address owner)
        internal
        returns (address addr)
    {
        bytes memory payload = bytes.concat(creationBytecode, abi.encode(treasury, intentSigner, wrappedNative, owner));
        assembly {
            addr := create(0, add(payload, 0x20), mload(payload))
        }
        require(addr != address(0), "create failed");
    }

    function _forkPath() internal pure returns (address[] memory path) {
        path = new address[](2);
        path[0] = WETH;
        path[1] = USDC;
    }

    function _localIntent(
        address[] memory path,
        uint256 amount,
        uint16 feeBps,
        uint256 structural,
        uint256 minUserOut,
        uint256 nonce
    ) internal view returns (SmartSwapExecutorV1.ExecutionIntent memory intent) {
        intent = SmartSwapExecutorV1.ExecutionIntent({
            version: 1,
            policyId: localExecutor.POLICY_ID(),
            policyVersion: localExecutor.POLICY_VERSION(),
            chainId: block.chainid,
            user: user,
            inputAsset: address(mockWeth),
            outputAsset: address(mockUsdc),
            inputAmount: amount,
            minUserOut: minUserOut,
            venueId: VENUE,
            router: address(mockRouter),
            routeHash: localExecutor.routeHashOf(path, false, false),
            feeBps: feeBps,
            feeAmount: (amount * feeBps) / 10_000,
            feeAsset: address(mockWeth),
            beneficiary: TREASURY,
            structuralRouteCostBps: structural,
            deadline: block.timestamp + 100,
            nonce: nonce,
            nativeIn: false,
            nativeOut: false
        });
    }

    function _forkIntent(address[] memory path, uint256 minUserOut, uint256 nonce)
        internal
        view
        returns (SmartSwapExecutorV1.ExecutionIntent memory intent)
    {
        uint16 feeBps = forkExecutor.authorizedFeeBps(STRUCTURAL_UNISWAP_V2_BPS);
        intent = SmartSwapExecutorV1.ExecutionIntent({
            version: 1,
            policyId: forkExecutor.POLICY_ID(),
            policyVersion: forkExecutor.POLICY_VERSION(),
            chainId: 1,
            user: user,
            inputAsset: WETH,
            outputAsset: USDC,
            inputAmount: CANARY_AMOUNT,
            minUserOut: minUserOut,
            venueId: VENUE,
            router: UNISWAP,
            routeHash: forkExecutor.routeHashOf(path, false, false),
            feeBps: feeBps,
            feeAmount: (CANARY_AMOUNT * feeBps) / 10_000,
            feeAsset: WETH,
            beneficiary: TREASURY,
            structuralRouteCostBps: STRUCTURAL_UNISWAP_V2_BPS,
            deadline: block.timestamp + 120,
            nonce: nonce,
            nativeIn: false,
            nativeOut: false
        });
    }

    function _sign(SmartSwapExecutorV1 exec, SmartSwapExecutorV1.ExecutionIntent memory intent)
        internal
        view
        returns (bytes memory)
    {
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", exec.intentHash(intent)));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, digest);
        return abi.encodePacked(r, s, v);
    }
}
