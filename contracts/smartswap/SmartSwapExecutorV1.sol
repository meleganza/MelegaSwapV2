// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ISmartSwapV2Router} from "./interfaces/ISmartSwapV2Router.sol";
import {IWBNB} from "../interfaces/IWBNB.sol";

/// @title SmartSwapExecutorV1
/// @notice Venue-independent exact-in executor that enforces SMARTSWAP_REVENUE_POLICY_V1.
/// @dev Simulation / canary-prepared only. Not production-activated. Not an arbitrary-call proxy.
contract SmartSwapExecutorV1 is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public constant NATIVE = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    uint16 public constant MAX_PROTOCOL_FEE_BPS = 25;
    bytes32 public constant POLICY_ID = keccak256("SMARTSWAP_REVENUE_POLICY_V1");
    bytes32 public constant POLICY_VERSION = keccak256("1.0.0");
    uint256 public constant INTENT_VERSION = 1;

    address public immutable treasury;
    address public immutable intentSigner;
    address public immutable wrappedNative;

    mapping(address => bytes32) public allowedVenue;
    mapping(address => mapping(uint256 => bool)) public usedNonce;

    error ZeroAddress();
    error Expired();
    error Replay();
    error WrongChain();
    error WrongUser();
    error WrongBeneficiary();
    error WrongFee();
    error WrongPolicy();
    error WrongRouter();
    error WrongRoute();
    error WrongSigner();
    error InvalidPath();
    error NativeValue();
    error FeeBypass();
    error UnsupportedToken();

    event RouterAllowlisted(address indexed router, bytes32 venueId, bool allowed);
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

    struct ExecutionIntent {
        uint256 version;
        bytes32 policyId;
        bytes32 policyVersion;
        uint256 chainId;
        address user;
        address inputAsset;
        address outputAsset;
        uint256 inputAmount;
        uint256 minUserOut;
        bytes32 venueId;
        address router;
        bytes32 routeHash;
        uint16 feeBps;
        uint256 feeAmount;
        address feeAsset;
        address beneficiary;
        uint256 structuralRouteCostBps;
        uint256 deadline;
        uint256 nonce;
        bool nativeIn;
        bool nativeOut;
    }

    constructor(address treasury_, address intentSigner_, address wrappedNative_, address owner_) Ownable(owner_) {
        if (treasury_ == address(0) || intentSigner_ == address(0) || wrappedNative_ == address(0) || owner_ == address(0)) {
            revert ZeroAddress();
        }
        treasury = treasury_;
        intentSigner = intentSigner_;
        wrappedNative = wrappedNative_;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setRouter(address router, bytes32 venueId, bool allowed) external onlyOwner {
        if (router == address(0)) revert ZeroAddress();
        allowedVenue[router] = allowed ? venueId : bytes32(0);
        emit RouterAllowlisted(router, venueId, allowed);
    }

    function authorizedFeeBps(uint256 structuralRouteCostBps) public pure returns (uint16) {
        if (structuralRouteCostBps <= 10) return 25;
        if (structuralRouteCostBps <= 25) return 20;
        if (structuralRouteCostBps <= 40) return 15;
        if (structuralRouteCostBps <= 60) return 10;
        return 5;
    }

    function routeHashOf(address[] memory path, bool nativeIn, bool nativeOut) public pure returns (bytes32) {
        return keccak256(abi.encode(path, nativeIn, nativeOut));
    }

    function intentHash(ExecutionIntent memory intent) public pure returns (bytes32) {
        return keccak256(
            abi.encode(
                intent.version,
                intent.policyId,
                intent.policyVersion,
                intent.chainId,
                intent.user,
                intent.inputAsset,
                intent.outputAsset,
                intent.inputAmount,
                intent.minUserOut,
                intent.venueId,
                intent.router,
                intent.routeHash,
                intent.feeBps,
                intent.feeAmount,
                intent.feeAsset,
                intent.beneficiary,
                intent.structuralRouteCostBps,
                intent.deadline,
                intent.nonce,
                intent.nativeIn,
                intent.nativeOut
            )
        );
    }

    function execute(ExecutionIntent calldata intent, address[] calldata path, bytes calldata signature)
        external
        payable
        whenNotPaused
        nonReentrant
        returns (uint256 userOutput)
    {
        _validate(intent, path, signature);
        usedNonce[intent.user][intent.nonce] = true;

        uint256 feeAmount = (intent.inputAmount * intent.feeBps) / 10_000;
        if (feeAmount != intent.feeAmount) revert WrongFee();
        uint256 netIn = intent.inputAmount - feeAmount;

        if (intent.nativeIn) {
            if (intent.inputAsset != NATIVE) revert WrongRoute();
            if (path[0] != wrappedNative) revert InvalidPath();
            if (msg.value < intent.inputAmount) revert NativeValue();
            IWBNB(wrappedNative).deposit{value: feeAmount}();
            IERC20(wrappedNative).safeTransfer(treasury, feeAmount);
            userOutput = ISmartSwapV2Router(intent.router).swapExactETHForTokens{value: netIn}(
                intent.minUserOut, path, intent.user, intent.deadline
            )[path.length - 1];
            uint256 extra = msg.value - intent.inputAmount;
            if (extra > 0) {
                (bool ok,) = intent.user.call{value: extra}("");
                if (!ok) revert NativeValue();
            }
        } else {
            if (msg.value != 0) revert NativeValue();
            IERC20 token = IERC20(intent.inputAsset);
            token.safeTransferFrom(msg.sender, address(this), intent.inputAmount);
            token.safeTransfer(treasury, feeAmount);
            token.forceApprove(intent.router, netIn);
            if (intent.nativeOut) {
                userOutput = ISmartSwapV2Router(intent.router).swapExactTokensForETH(
                    netIn, intent.minUserOut, path, intent.user, intent.deadline
                )[path.length - 1];
            } else {
                userOutput = ISmartSwapV2Router(intent.router).swapExactTokensForTokens(
                    netIn, intent.minUserOut, path, intent.user, intent.deadline
                )[path.length - 1];
            }
            token.forceApprove(intent.router, 0);
        }

        if (userOutput < intent.minUserOut) revert WrongFee();

        emit SmartSwapExecuted(
            keccak256(abi.encode(intent.user, intent.nonce, intent.router)),
            intent.venueId,
            intent.inputAsset,
            intent.outputAsset,
            intent.inputAmount,
            userOutput,
            intent.feeAsset,
            feeAmount,
            treasury
        );
    }

    function _validate(ExecutionIntent calldata intent, address[] calldata path, bytes calldata signature) internal view {
        if (block.timestamp > intent.deadline) revert Expired();
        if (intent.chainId != block.chainid) revert WrongChain();
        if (intent.user != msg.sender) revert WrongUser();
        if (intent.beneficiary != treasury) revert WrongBeneficiary();
        if (intent.version != INTENT_VERSION || intent.policyId != POLICY_ID || intent.policyVersion != POLICY_VERSION) {
            revert WrongPolicy();
        }
        if (intent.feeBps == 0 || intent.feeBps > MAX_PROTOCOL_FEE_BPS) revert FeeBypass();
        if (intent.feeBps != authorizedFeeBps(intent.structuralRouteCostBps)) revert WrongFee();
        if (intent.feeAmount != (intent.inputAmount * intent.feeBps) / 10_000) revert WrongFee();
        if (intent.feeAsset != (intent.nativeIn ? NATIVE : intent.inputAsset)) revert WrongFee();
        if (allowedVenue[intent.router] == bytes32(0) || allowedVenue[intent.router] != intent.venueId) revert WrongRouter();
        if (path.length < 2) revert InvalidPath();
        if (routeHashOf(path, intent.nativeIn, intent.nativeOut) != intent.routeHash) revert WrongRoute();
        if (intent.nativeIn) {
            if (intent.inputAsset != NATIVE || path[0] != wrappedNative) revert InvalidPath();
        } else if (path[0] != intent.inputAsset) {
            revert WrongRoute();
        }
        if (intent.nativeOut) {
            if (intent.outputAsset != NATIVE || path[path.length - 1] != wrappedNative) revert InvalidPath();
        } else if (path[path.length - 1] != intent.outputAsset) {
            revert WrongRoute();
        }
        if (usedNonce[intent.user][intent.nonce]) revert Replay();
        address recovered = ECDSA.recover(_ethSigned(intentHash(intent)), signature);
        if (recovered != intentSigner) revert WrongSigner();
    }

    function _ethSigned(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}
