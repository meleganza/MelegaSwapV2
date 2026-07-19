// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { IERC1271 } from "@openzeppelin/contracts/interfaces/IERC1271.sol";

import { ILiquidityBuildingExecutionAuthorizerV1 } from "./interfaces/ILiquidityBuildingExecutionAuthorizerV1.sol";

/**
 * @title LiquidityBuildingExecutionAuthorizerV1
 * @notice Non-upgradeable EIP-712 ExecutionIntent verifier with immutable EOA or EIP-1271 authority.
 * @dev No custody, no nonce/replay storage, no setters, no relayer awareness.
 *      SignatureChecker (OZ ≥0.8.24) is not used; ECDSA + IERC1271 mirrors its EOA/1271 behavior under 0.8.20.
 */
contract LiquidityBuildingExecutionAuthorizerV1 is ILiquidityBuildingExecutionAuthorizerV1 {
    bytes32 public constant AUTHORIZER_VERSION = keccak256("LiquidityBuildingExecutionAuthorizerV1");

    /// @dev keccak256("LIQUIDITY_BUILDING_EXECUTION_INTENT_V1")
    bytes32 public constant EXECUTION_INTENT_SCHEMA_VERSION = keccak256("LIQUIDITY_BUILDING_EXECUTION_INTENT_V1");

    bytes32 private constant _EIP712_DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)");

    bytes32 private constant _NAME_HASH = keccak256(bytes("Melega Liquidity Building"));
    bytes32 private constant _VERSION_HASH = keccak256(bytes("1"));

    /// @dev Frozen type string — field order must match ExecutionIntentV1.
    bytes32 public constant EXECUTION_INTENT_TYPEHASH = keccak256(
        "ExecutionIntentV1(bytes32 schemaVersion,uint256 chainId,address factory,bytes32 factoryVersion,address program,address pair,address projectToken,address quoteAsset,uint256 epochId,uint64 epochStartTimestamp,uint64 epochEndTimestamp,uint64 observationStartBlock,uint64 observationEndBlock,uint64 anchorBlock,uint256 anchorProjectReserve,uint256 anchorQuoteReserve,uint256 eligibleNetBuyFlow,uint8 strategyMode,uint16 effectiveStrategyRateBps,uint256 grossQuoteTarget,uint256 maximumProjectTokenIn,uint256 configNonce,uint256 executionNonce,bytes32 strategyEngineVersion,uint64 decisionDeadline,uint256 maximumGasPrice,bytes32 observationRoot,bytes32 excludedFlowCommitment,bytes32 treasuryAuthorizationReference)"
    );

    uint8 private constant _STRATEGY_MODE_MAX = 1; // FullAi=0, DynamicRange=1
    uint16 private constant _STRUCTURAL_RATE_BPS_MAX = 10_000;

    error ZeroAuthority();
    error InvalidSchemaVersion();
    error WrongChain();
    error InvalidIntentAddress();
    error InvalidTokenPair();
    error InvalidEpochWindow();
    error InvalidObservationRange();
    error ExpiredDecision();
    error InvalidStrategyMode();
    error InvalidStructuralStrategyRate();
    error InvalidSignature();

    address public immutable override signingAuthority;
    AuthorityType public immutable override authorityType;

    constructor(address signingAuthority_) {
        if (signingAuthority_ == address(0)) revert ZeroAuthority();
        signingAuthority = signingAuthority_;
        authorityType = signingAuthority_.code.length == 0 ? AuthorityType.EOA : AuthorityType.ERC1271;
    }

    function authorizerVersion() external pure override returns (bytes32) {
        return AUTHORIZER_VERSION;
    }

    function executionIntentSchemaVersion() external pure override returns (bytes32) {
        return EXECUTION_INTENT_SCHEMA_VERSION;
    }

    function executionIntentTypeHash() external pure override returns (bytes32) {
        return EXECUTION_INTENT_TYPEHASH;
    }

    function domainSeparatorFor(address program, address factory, bytes32 factoryVersion)
        public
        view
        override
        returns (bytes32)
    {
        bytes32 salt = keccak256(abi.encode(address(this), factory, factoryVersion));
        return keccak256(abi.encode(_EIP712_DOMAIN_TYPEHASH, _NAME_HASH, _VERSION_HASH, block.chainid, program, salt));
    }

    function hashExecutionIntent(ExecutionIntentV1 calldata intent) public view override returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                EXECUTION_INTENT_TYPEHASH,
                intent.schemaVersion,
                intent.chainId,
                intent.factory,
                intent.factoryVersion,
                intent.program,
                intent.pair,
                intent.projectToken,
                intent.quoteAsset,
                intent.epochId,
                intent.epochStartTimestamp,
                intent.epochEndTimestamp,
                intent.observationStartBlock,
                intent.observationEndBlock,
                intent.anchorBlock,
                intent.anchorProjectReserve,
                intent.anchorQuoteReserve,
                intent.eligibleNetBuyFlow,
                intent.strategyMode,
                intent.effectiveStrategyRateBps,
                intent.grossQuoteTarget,
                intent.maximumProjectTokenIn,
                intent.configNonce,
                intent.executionNonce,
                intent.strategyEngineVersion,
                intent.decisionDeadline,
                intent.maximumGasPrice,
                intent.observationRoot,
                intent.excludedFlowCommitment,
                intent.treasuryAuthorizationReference
            )
        );
        bytes32 domainSeparator = domainSeparatorFor(intent.program, intent.factory, intent.factoryVersion);
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
    }

    function validateExecutionIntent(ExecutionIntentV1 calldata intent, bytes calldata signature)
        external
        view
        override
        returns (bytes32 digest)
    {
        if (intent.schemaVersion != EXECUTION_INTENT_SCHEMA_VERSION) revert InvalidSchemaVersion();
        if (intent.chainId != block.chainid) revert WrongChain();
        if (
            intent.factory == address(0) || intent.program == address(0) || intent.pair == address(0)
                || intent.projectToken == address(0) || intent.quoteAsset == address(0)
        ) {
            revert InvalidIntentAddress();
        }
        if (intent.projectToken == intent.quoteAsset) revert InvalidTokenPair();
        if (intent.epochStartTimestamp >= intent.epochEndTimestamp) revert InvalidEpochWindow();
        if (
            intent.observationStartBlock > intent.observationEndBlock || intent.observationEndBlock > intent.anchorBlock
        ) {
            revert InvalidObservationRange();
        }
        if (intent.decisionDeadline < block.timestamp) revert ExpiredDecision();
        if (intent.strategyMode > _STRATEGY_MODE_MAX) revert InvalidStrategyMode();
        if (intent.effectiveStrategyRateBps > _STRUCTURAL_RATE_BPS_MAX) {
            revert InvalidStructuralStrategyRate();
        }

        digest = hashExecutionIntent(intent);
        if (!_isValidSignatureNow(signingAuthority, digest, signature)) revert InvalidSignature();
    }

    /// @dev Mirrors OpenZeppelin SignatureChecker.isValidSignatureNow for EOA + ERC-1271 under solc 0.8.20.
    function _isValidSignatureNow(address signer, bytes32 hash, bytes calldata signature) private view returns (bool) {
        if (signer.code.length == 0) {
            (address recovered, ECDSA.RecoverError err,) = ECDSA.tryRecoverCalldata(hash, signature);
            return err == ECDSA.RecoverError.NoError && recovered == signer;
        }
        try IERC1271(signer).isValidSignature(hash, signature) returns (bytes4 magicValue) {
            return magicValue == IERC1271.isValidSignature.selector;
        } catch {
            return false;
        }
    }
}
