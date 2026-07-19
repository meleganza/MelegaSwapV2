// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Clones } from "@openzeppelin/contracts/proxy/Clones.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import {
    ILiquidityBuildingFactoryV1,
    IMelegaV2Factory,
    IMelegaV2Pair,
    LBTypes
} from "./interfaces/ILiquidityBuildingFactoryV1.sol";
import { ILiquidityBuildingProgramV1 } from "./interfaces/ILiquidityBuildingProgramV1.sol";
import { LiquidityBuildingProgramV1 } from "./LiquidityBuildingProgramV1.sol";

/**
 * @title LiquidityBuildingFactoryV1
 * @notice Immutable versioned factory / registry for Liquidity Building Program clones.
 * @dev No owner, no setters, no custody. Dependencies and quote policies are constructor-only.
 */
contract LiquidityBuildingFactoryV1 is ILiquidityBuildingFactoryV1 {
    using Clones for address;

    error ZeroAddress();
    error DependencyWithoutCode();
    error InvalidQuotePolicy();
    error DuplicateQuotePolicy();
    error UnsupportedQuoteAsset();
    error NonCanonicalPair();
    error PairMissing();
    error PairReservesZero();
    error InvalidPairTokens();
    error InvalidStrategy();
    error InvalidEpoch();
    error DuplicateActiveProgram();
    error ProjectEqualsQuote();

    bytes32 public immutable override factoryVersion;
    uint256 public immutable override deploymentChainId;
    address public immutable override implementation;
    address public immutable override melegaFactory;
    address public immutable override melegaRouter;
    address public immutable override executionAuthorizer;
    address public immutable override treasuryFeeSink;

    uint16 public immutable successFeeBps;
    uint16 public immutable strategyCeilingBps;
    uint16 public immutable operatingCurveImpactBps;
    uint16 public immutable hardCurveImpactBps;
    uint16 public immutable hardEffectiveDeviationBps;
    uint16 public immutable decisionExecutionDriftBps;
    uint16 public immutable swapSlippageOperatingBps;
    uint16 public immutable hardSlippageBps;
    uint16 public immutable remainingBudgetEpochCapBps;
    uint16 public immutable totalBudgetEpochCapBps;
    uint16 public immutable rolling24hTotalBudgetCapBps;
    uint16 public immutable maximumGasCostShareBps;
    uint16 public immutable initialFinalityDepth;
    uint8 public immutable maxSuccessfulExecutionsPerEpoch;

    mapping(address => LBTypes.QuoteAssetPolicy) private _quotePolicies;
    address[] private _quoteAssets;

    address[] private _programs;
    mapping(bytes32 => address) private _programById;
    mapping(address => bytes32) private _idByProgram;
    mapping(bytes32 => address) private _activeByBaseKey;
    mapping(bytes32 => uint64) private _generationByBaseKey;

    constructor(
        bytes32 factoryVersion_,
        address implementation_,
        address melegaFactory_,
        address melegaRouter_,
        address executionAuthorizer_,
        address treasuryFeeSink_,
        LBTypes.ProtocolParameters memory params_,
        LBTypes.QuoteAssetPolicy[] memory quotePolicies_
    ) {
        if (
            implementation_ == address(0) || melegaFactory_ == address(0) || melegaRouter_ == address(0)
                || executionAuthorizer_ == address(0) || treasuryFeeSink_ == address(0)
        ) {
            revert ZeroAddress();
        }
        _requireCode(implementation_);
        _requireCode(melegaFactory_);
        _requireCode(melegaRouter_);
        _requireCode(executionAuthorizer_);
        _requireCode(treasuryFeeSink_);

        if (params_.successFeeBps != 500) revert InvalidQuotePolicy();
        if (params_.strategyCeilingBps != 5000) revert InvalidQuotePolicy();
        if (params_.maxSuccessfulExecutionsPerEpoch != 1) revert InvalidQuotePolicy();

        factoryVersion = factoryVersion_;
        deploymentChainId = block.chainid;
        implementation = implementation_;
        melegaFactory = melegaFactory_;
        melegaRouter = melegaRouter_;
        executionAuthorizer = executionAuthorizer_;
        treasuryFeeSink = treasuryFeeSink_;

        successFeeBps = params_.successFeeBps;
        strategyCeilingBps = params_.strategyCeilingBps;
        operatingCurveImpactBps = params_.operatingCurveImpactBps;
        hardCurveImpactBps = params_.hardCurveImpactBps;
        hardEffectiveDeviationBps = params_.hardEffectiveDeviationBps;
        decisionExecutionDriftBps = params_.decisionExecutionDriftBps;
        swapSlippageOperatingBps = params_.swapSlippageOperatingBps;
        hardSlippageBps = params_.hardSlippageBps;
        remainingBudgetEpochCapBps = params_.remainingBudgetEpochCapBps;
        totalBudgetEpochCapBps = params_.totalBudgetEpochCapBps;
        rolling24hTotalBudgetCapBps = params_.rolling24hTotalBudgetCapBps;
        maximumGasCostShareBps = params_.maximumGasCostShareBps;
        initialFinalityDepth = params_.initialFinalityDepth;
        maxSuccessfulExecutionsPerEpoch = params_.maxSuccessfulExecutionsPerEpoch;

        for (uint256 i = 0; i < quotePolicies_.length; i++) {
            LBTypes.QuoteAssetPolicy memory p = quotePolicies_[i];
            if (p.asset == address(0)) revert ZeroAddress();
            _requireCode(p.asset);
            if (_quotePolicies[p.asset].asset != address(0)) revert DuplicateQuotePolicy();
            uint8 dec = IERC20Metadata(p.asset).decimals();
            if (dec != p.decimals) revert InvalidQuotePolicy();
            _quotePolicies[p.asset] = p;
            _quoteAssets.push(p.asset);
        }
    }

    function createProgram(
        address projectToken,
        address quoteAsset,
        address pair,
        LBTypes.StrategyConfig calldata strategy,
        uint32 epochDurationSeconds
    ) external returns (address program, bytes32 programId) {
        address owner_ = msg.sender;
        if (projectToken == address(0) || quoteAsset == address(0) || pair == address(0)) revert ZeroAddress();
        _requireCode(projectToken);
        if (projectToken == quoteAsset) revert ProjectEqualsQuote();

        LBTypes.QuoteAssetPolicy memory qp = _quotePolicies[quoteAsset];
        if (qp.asset == address(0) || !qp.enabled) revert UnsupportedQuoteAsset();

        address canonical = IMelegaV2Factory(melegaFactory).getPair(projectToken, quoteAsset);
        if (canonical == address(0)) revert PairMissing();
        if (canonical != pair) revert NonCanonicalPair();
        _requireCode(pair);

        address t0 = IMelegaV2Pair(pair).token0();
        address t1 = IMelegaV2Pair(pair).token1();
        bool ok = (t0 == projectToken && t1 == quoteAsset) || (t0 == quoteAsset && t1 == projectToken);
        if (!ok) revert InvalidPairTokens();
        (uint112 r0, uint112 r1,) = IMelegaV2Pair(pair).getReserves();
        if (r0 == 0 || r1 == 0) revert PairReservesZero();

        _validateEpoch(epochDurationSeconds);
        _validateStrategy(strategy);

        bytes32 baseKey = computeBaseKey(owner_, projectToken, quoteAsset, pair);
        address existing = _activeByBaseKey[baseKey];
        if (existing != address(0)) {
            if (ILiquidityBuildingProgramV1(existing).lifecycle() != LBTypes.Lifecycle.Stopped) {
                revert DuplicateActiveProgram();
            }
            _activeByBaseKey[baseKey] = address(0);
        }

        uint64 generation = _generationByBaseKey[baseKey] + 1;
        programId = computeProgramId(baseKey, generation);
        address predicted = predictProgramAddress(programId);

        program = implementation.cloneDeterministic(programId);
        if (program != predicted) revert NonCanonicalPair(); // should be impossible

        ILiquidityBuildingProgramV1(program)
            .initialize(
                address(this),
                programId,
                owner_,
                projectToken,
                quoteAsset,
                pair,
                owner_, // lpRecipient default = owner
                strategy,
                epochDurationSeconds,
                strategyCeilingBps
            );

        _generationByBaseKey[baseKey] = generation;
        _activeByBaseKey[baseKey] = program;
        _programById[programId] = program;
        _idByProgram[program] = programId;
        _programs.push(program);

        emit ProgramCreated(programId, owner_, program, projectToken, quoteAsset, pair, generation, factoryVersion);
    }

    /// @notice Called conceptually when a program stops — exposed via sync from Program stop.
    /// @dev Program.stop cannot call factory without coupling; Factory clears active on next create
    ///      by reading lifecycle. Use `clearActiveIfStopped` for explicit registry hygiene.
    function clearActiveIfStopped(address program) external {
        bytes32 id = _idByProgram[program];
        if (id == bytes32(0)) return;
        if (ILiquidityBuildingProgramV1(program).lifecycle() != LBTypes.Lifecycle.Stopped) return;
        // Reconstruct base key from program view
        ILiquidityBuildingProgramV1.ProgramView memory v = ILiquidityBuildingProgramV1(program).getProgramView();
        bytes32 baseKey = computeBaseKey(v.owner, v.projectToken, v.quoteAsset, v.pair);
        if (_activeByBaseKey[baseKey] == program) {
            _activeByBaseKey[baseKey] = address(0);
        }
    }

    function protocolParameters() external view returns (LBTypes.ProtocolParameters memory p) {
        p = LBTypes.ProtocolParameters({
            successFeeBps: successFeeBps,
            strategyCeilingBps: strategyCeilingBps,
            operatingCurveImpactBps: operatingCurveImpactBps,
            hardCurveImpactBps: hardCurveImpactBps,
            hardEffectiveDeviationBps: hardEffectiveDeviationBps,
            decisionExecutionDriftBps: decisionExecutionDriftBps,
            swapSlippageOperatingBps: swapSlippageOperatingBps,
            hardSlippageBps: hardSlippageBps,
            remainingBudgetEpochCapBps: remainingBudgetEpochCapBps,
            totalBudgetEpochCapBps: totalBudgetEpochCapBps,
            rolling24hTotalBudgetCapBps: rolling24hTotalBudgetCapBps,
            maximumGasCostShareBps: maximumGasCostShareBps,
            initialFinalityDepth: initialFinalityDepth,
            maxSuccessfulExecutionsPerEpoch: maxSuccessfulExecutionsPerEpoch
        });
    }

    function quotePolicy(address quoteAsset) external view returns (LBTypes.QuoteAssetPolicy memory) {
        return _quotePolicies[quoteAsset];
    }

    function isQuoteEnabled(address quoteAsset) external view returns (bool) {
        return _quotePolicies[quoteAsset].enabled;
    }

    function programCount() external view returns (uint256) {
        return _programs.length;
    }

    function programAt(uint256 index) external view returns (address) {
        return _programs[index];
    }

    function getProgram(bytes32 programId) external view returns (address) {
        return _programById[programId];
    }

    function programIdOf(address program) external view returns (bytes32) {
        return _idByProgram[program];
    }

    function isRegisteredProgram(address program) external view returns (bool) {
        return _idByProgram[program] != bytes32(0);
    }

    function activeProgram(address owner_, address projectToken, address quoteAsset, address pair)
        external
        view
        returns (address)
    {
        address prog = _activeByBaseKey[computeBaseKey(owner_, projectToken, quoteAsset, pair)];
        if (prog == address(0)) return address(0);
        if (ILiquidityBuildingProgramV1(prog).lifecycle() == LBTypes.Lifecycle.Stopped) return address(0);
        return prog;
    }

    function generationCount(address owner_, address projectToken, address quoteAsset, address pair)
        external
        view
        returns (uint64)
    {
        return _generationByBaseKey[computeBaseKey(owner_, projectToken, quoteAsset, pair)];
    }

    function computeBaseKey(address owner_, address projectToken, address quoteAsset, address pair)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(owner_, projectToken, quoteAsset, pair));
    }

    function computeProgramId(bytes32 baseKey, uint64 generation) public view returns (bytes32) {
        return keccak256(abi.encode(deploymentChainId, address(this), factoryVersion, baseKey, generation));
    }

    function predictProgramAddress(bytes32 programId) public view returns (address) {
        return implementation.predictDeterministicAddress(programId, address(this));
    }

    function _requireCode(address account) internal view {
        if (account.code.length == 0) revert DependencyWithoutCode();
    }

    function _validateEpoch(uint32 seconds_) internal pure {
        if (!(seconds_ == 300 || seconds_ == 900 || seconds_ == 1800 || seconds_ == 3600)) {
            revert InvalidEpoch();
        }
    }

    function _validateStrategy(LBTypes.StrategyConfig calldata s) internal view {
        if (s.mode == LBTypes.StrategyMode.FullAi) {
            if (s.minimumRateBps != 0 || s.maximumRateBps != 0) revert InvalidStrategy();
            return;
        }
        if (s.mode != LBTypes.StrategyMode.DynamicRange) revert InvalidStrategy();
        if (s.minimumRateBps == 0) revert InvalidStrategy();
        if (s.maximumRateBps < s.minimumRateBps) revert InvalidStrategy();
        if (s.maximumRateBps > strategyCeilingBps) revert InvalidStrategy();
    }
}
