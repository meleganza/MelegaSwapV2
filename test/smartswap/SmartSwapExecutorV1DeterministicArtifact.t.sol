// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {stdJson} from "forge-std/StdJson.sol";
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

/// @notice Deploys the stored deterministic artifact. Fork canary is read-only vs mainnet.
contract SmartSwapExecutorV1DeterministicArtifactTest is Test {
    using stdJson for string;

    address internal constant TREASURY = 0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b;
    address internal constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address internal constant USDT = 0x55d398326f99059fF775485246999027B3197955;
    address internal constant PANCAKE = 0x10ED43C718714eb63d5aA57B78B54704E256024E;
    address internal constant FACTORY = 0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73;
    address internal constant PAIR = 0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE;
    uint256 internal constant AMOUNT = 0.01 ether;
    uint256 internal constant STRUCTURAL_PANCAKE_V2_BPS = 25;
    bytes32 internal constant VENUE = keccak256("pancakeswap");
    bytes32 internal constant EXPECTED_CREATION_KECCAK =
        0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791;
    bytes32 internal constant EXPECTED_DEPLOYED_KECCAK =
        0x22b936d04dda69aa1fc31e031793ce922a18013fa9c2f0587043a627e75da0e1;

    uint256 internal signerPk = 0xA11CE;
    address internal signer;
    address internal user;
    SmartSwapExecutorV1 internal executor;
    bytes internal creationBytecode;
    bytes internal deployedTemplate;
    bool internal forked;

    function setUp() public {
        signer = vm.addr(signerPk);
        user = makeAddr("canaryUser");
        string memory json = vm.readFile("deployments/smartswap-executor-v1/smart-swap-executor-v1-artifact.json");
        creationBytecode = json.readBytes(".creationBytecode");
        deployedTemplate = json.readBytes(".deployedBytecode");
        require(keccak256(creationBytecode) == EXPECTED_CREATION_KECCAK, "creation keccak");
        require(keccak256(deployedTemplate) == EXPECTED_DEPLOYED_KECCAK, "deployed keccak");

        try this.tryFork() returns (bool ok) {
            forked = ok;
        } catch {
            forked = false;
        }
        if (!forked) {
            console2.log("SKIP_FORK: BNB fork unavailable");
            return;
        }
        executor = SmartSwapExecutorV1(payable(_deployArtifact(TREASURY, signer, WBNB, address(this))));
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

    function testArtifactFileHashes() public view {
        assertEq(creationBytecode.length, 8584);
        assertEq(deployedTemplate.length, 8062);
        assertEq(keccak256(creationBytecode), EXPECTED_CREATION_KECCAK);
        assertEq(keccak256(deployedTemplate), EXPECTED_DEPLOYED_KECCAK);
    }

    function testForkDeployedRuntimeMatchesTemplateAfterZeroingImmutables() public forkOnly {
        bytes memory onchain = address(executor).code;
        assertEq(onchain.length, deployedTemplate.length);
        bytes memory stripped = _zeroKnownAddressWords(onchain);
        bytes memory template = _zeroKnownAddressWords(deployedTemplate);
        assertEq(keccak256(stripped), keccak256(template));
        assertEq(executor.treasury(), TREASURY);
        assertEq(executor.intentSigner(), signer);
        assertEq(executor.wrappedNative(), WBNB);
        assertEq(executor.owner(), address(this));
        assertFalse(executor.paused());
        assertEq(executor.MAX_PROTOCOL_FEE_BPS(), 25);
    }

    function testForkCanonicalConstructorRuntime() public forkOnly {
        address deployed = _deployArtifact(TREASURY, 0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0, WBNB, 0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0);
        SmartSwapExecutorV1 exec = SmartSwapExecutorV1(payable(deployed));
        assertEq(exec.treasury(), TREASURY);
        assertEq(exec.intentSigner(), 0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0);
        assertEq(exec.wrappedNative(), WBNB);
        assertEq(exec.owner(), 0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0);
        assertEq(address(exec).code.length, deployedTemplate.length);
        console2.logBytes32(keccak256(address(exec).code));
        console2.log("canonicalRuntimeLen", address(exec).code.length);
    }

    function testForkCanaryFromDeterministicArtifact() public forkOnly {
        assertEq(block.chainid, 56);
        assertEq(IPancakeFactory(FACTORY).getPair(WBNB, USDT), PAIR);
        uint16 feeBps = executor.authorizedFeeBps(STRUCTURAL_PANCAKE_V2_BPS);
        assertEq(feeBps, 20);
        uint256 fee = (AMOUNT * feeBps) / 10_000;
        uint256 net = AMOUNT - fee;
        address[] memory path = _path();
        uint256 expectedOut = IPancakeRouter02Ext(PANCAKE).getAmountsOut(net, path)[1];
        SmartSwapExecutorV1.ExecutionIntent memory intent = _intent(path, expectedOut, 1, feeBps);
        bytes memory sig = _sign(intent);

        uint256 treasuryBefore = IERC20(WBNB).balanceOf(TREASURY);
        uint256 userUsdtBefore = IERC20(USDT).balanceOf(user);
        uint256 userWbnbBefore = IERC20(WBNB).balanceOf(user);

        vm.prank(user);
        uint256 out = executor.execute(intent, path, sig);

        assertEq(IERC20(WBNB).balanceOf(TREASURY) - treasuryBefore, fee);
        assertEq(userWbnbBefore - IERC20(WBNB).balanceOf(user), AMOUNT);
        assertEq(IERC20(USDT).balanceOf(user) - userUsdtBefore, out);
        assertGe(out, expectedOut);
        assertEq(IERC20(WBNB).balanceOf(address(executor)), 0);
        assertEq(IERC20(USDT).balanceOf(address(executor)), 0);
        assertEq(address(executor).balance, 0);
        assertTrue(executor.usedNonce(user, 1));
        console2.log("DETERMINISTIC_FORK_CANARY_OK");
        console2.log("userOutput", out);
        console2.log("treasuryFee", fee);
        console2.log("venueInput", net);
        console2.log("FEE_VERIFIED", uint256(0));
    }

    function testForkArtifactRejectsFeeBypassWrongRouterReplay() public forkOnly {
        uint16 feeBps = executor.authorizedFeeBps(STRUCTURAL_PANCAKE_V2_BPS);
        address[] memory path = _path();
        uint256 minOut = IPancakeRouter02Ext(PANCAKE).getAmountsOut((AMOUNT * (10_000 - feeBps)) / 10_000, path)[1];

        SmartSwapExecutorV1.ExecutionIntent memory bypass = _intent(path, minOut, 2, 0);
        bytes memory bypassSig = _sign(bypass);
        vm.prank(user);
        vm.expectRevert(SmartSwapExecutorV1.FeeBypass.selector);
        executor.execute(bypass, path, bypassSig);

        SmartSwapExecutorV1.ExecutionIntent memory ok = _intent(path, minOut, 3, feeBps);
        bytes memory okSig = _sign(ok);
        vm.prank(user);
        executor.execute(ok, path, okSig);
        vm.prank(user);
        vm.expectRevert(SmartSwapExecutorV1.Replay.selector);
        executor.execute(ok, path, okSig);
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

    function _zeroKnownAddressWords(bytes memory code) internal view returns (bytes memory out) {
        out = code;
        _blankWord(out, bytes32(uint256(uint160(TREASURY))));
        _blankWord(out, bytes32(uint256(uint160(signer))));
        _blankWord(out, bytes32(uint256(uint160(WBNB))));
    }

    function _blankWord(bytes memory code, bytes32 word) internal pure {
        for (uint256 i = 0; i + 32 <= code.length; i++) {
            bytes32 slice;
            assembly {
                slice := mload(add(add(code, 32), i))
            }
            if (slice == word) {
                assembly {
                    mstore(add(add(code, 32), i), 0)
                }
            }
        }
    }

    function _path() internal pure returns (address[] memory path) {
        path = new address[](2);
        path[0] = WBNB;
        path[1] = USDT;
    }

    function _intent(address[] memory path, uint256 minUserOut, uint256 nonce, uint16 feeBps)
        internal
        view
        returns (SmartSwapExecutorV1.ExecutionIntent memory intent)
    {
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
            structuralRouteCostBps: STRUCTURAL_PANCAKE_V2_BPS,
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
