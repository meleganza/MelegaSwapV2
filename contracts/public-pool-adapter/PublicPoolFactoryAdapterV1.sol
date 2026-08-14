// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ILegacySmartChef } from "./interfaces/ILegacySmartChef.sol";
import { ILegacySmartChefFactory } from "./interfaces/ILegacySmartChefFactory.sol";

/**
 * @title PublicPoolFactoryAdapterV1
 * @notice Permission adapter for the production Melega SmartChefFactory.
 * @dev The legacy factory remains the sole SmartChef deployer. Its ownership is
 *      transferred to this adapter after deployment and validation.
 *
 *      - non-MARCO reward pools are permissionless;
 *      - MARCO reward pools remain owner-only;
 *      - the complete reward budget is transferred to the new pool in the same
 *        transaction that deploys it;
 *      - creation fees follow the canonical staking-token rule and are forwarded
 *        directly to the treasury;
 *      - the adapter owner can return legacy-factory ownership for recovery.
 */
contract PublicPoolFactoryAdapterV1 is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    ILegacySmartChefFactory public immutable smartChefFactory;
    address public immutable marcoToken;
    address payable public immutable treasury;
    bytes32 public immutable smartChefInitCodeHash;

    uint256 public constant DEFAULT_CREATION_FEE = 0.25 ether;

    bool public creationPaused;
    address[] private _allPools;
    mapping(address => bool) public isAdapterPool;
    mapping(address => address) public poolCreator;

    error ZeroAddress();
    error ZeroInitCodeHash();
    error AdapterNotFactoryOwner(address currentFactoryOwner);
    error CreationPaused();
    error MarcoRewardRequiresOwner();
    error IdenticalTokens();
    error InvalidSchedule();
    error InsufficientRewardBudget(uint256 required, uint256 provided);
    error IncorrectCreationFee(uint256 expected, uint256 provided);
    error PoolAlreadyExists(address pool);
    error PoolDeploymentFailed(address predictedPool);
    error PoolConfigurationMismatch();
    error RewardFundingMismatch(uint256 expected, uint256 received);
    error TreasuryForwardFailed();
    error OwnershipRenounceDisabled();

    event PoolCreated(
        address indexed creator,
        address indexed pool,
        address indexed stakedToken,
        address rewardToken,
        uint256 rewardBudget,
        uint256 rewardPerBlock,
        uint256 startBlock,
        uint256 bonusEndBlock,
        uint256 poolLimitPerUser,
        uint256 creationFee
    );
    event CreationPauseUpdated(bool paused);
    event LegacyFactoryOwnershipReleased(address indexed newOwner);

    constructor(
        address initialOwner,
        address smartChefFactory_,
        address marcoToken_,
        address payable treasury_,
        bytes32 smartChefInitCodeHash_
    ) Ownable(initialOwner) {
        if (
            initialOwner == address(0) || smartChefFactory_ == address(0) || marcoToken_ == address(0)
                || treasury_ == address(0)
        ) revert ZeroAddress();
        if (smartChefInitCodeHash_ == bytes32(0)) revert ZeroInitCodeHash();

        smartChefFactory = ILegacySmartChefFactory(smartChefFactory_);
        marcoToken = marcoToken_;
        treasury = treasury_;
        smartChefInitCodeHash = smartChefInitCodeHash_;
    }

    function allPoolsLength() external view returns (uint256) {
        return _allPools.length;
    }

    function allPools(uint256 index) external view returns (address) {
        return _allPools[index];
    }

    function creationFeeFor(address stakedToken) public view returns (uint256) {
        return stakedToken == marcoToken ? 0 : DEFAULT_CREATION_FEE;
    }

    function predictPoolAddress(address stakedToken, address rewardToken, uint256 startBlock)
        public
        view
        returns (address predicted)
    {
        bytes32 salt = keccak256(abi.encodePacked(stakedToken, rewardToken, startBlock));
        bytes32 digest =
            keccak256(abi.encodePacked(bytes1(0xff), address(smartChefFactory), salt, smartChefInitCodeHash));
        predicted = address(uint160(uint256(digest)));
    }

    function createPool(
        address stakedToken,
        address rewardToken,
        uint256 rewardBudget,
        uint256 rewardPerBlock,
        uint256 startBlock,
        uint256 bonusEndBlock,
        uint256 poolLimitPerUser
    ) external payable nonReentrant returns (address pool) {
        address currentFactoryOwner = smartChefFactory.owner();
        if (currentFactoryOwner != address(this)) revert AdapterNotFactoryOwner(currentFactoryOwner);
        if (creationPaused) revert CreationPaused();
        if (stakedToken == address(0) || rewardToken == address(0)) revert ZeroAddress();
        if (stakedToken == rewardToken) revert IdenticalTokens();
        if (rewardToken == marcoToken && msg.sender != owner()) revert MarcoRewardRequiresOwner();
        if (rewardBudget == 0 || rewardPerBlock == 0 || startBlock <= block.number || bonusEndBlock <= startBlock) {
            revert InvalidSchedule();
        }

        uint256 requiredRewardBudget = rewardPerBlock * (bonusEndBlock - startBlock);
        if (rewardBudget < requiredRewardBudget) {
            revert InsufficientRewardBudget(requiredRewardBudget, rewardBudget);
        }

        uint256 expectedFee = creationFeeFor(stakedToken);
        if (msg.value != expectedFee) revert IncorrectCreationFee(expectedFee, msg.value);

        pool = predictPoolAddress(stakedToken, rewardToken, startBlock);
        if (pool.code.length != 0) revert PoolAlreadyExists(pool);

        smartChefFactory.deployPool(
            stakedToken, rewardToken, rewardPerBlock, startBlock, bonusEndBlock, poolLimitPerUser, msg.sender
        );

        if (pool.code.length == 0) revert PoolDeploymentFailed(pool);
        _validatePool(
            pool, msg.sender, stakedToken, rewardToken, rewardPerBlock, startBlock, bonusEndBlock, poolLimitPerUser
        );

        uint256 balanceBefore = IERC20(rewardToken).balanceOf(pool);
        IERC20(rewardToken).safeTransferFrom(msg.sender, pool, rewardBudget);
        uint256 received = IERC20(rewardToken).balanceOf(pool) - balanceBefore;
        if (received != rewardBudget) revert RewardFundingMismatch(rewardBudget, received);

        isAdapterPool[pool] = true;
        poolCreator[pool] = msg.sender;
        _allPools.push(pool);

        if (expectedFee != 0) {
            (bool ok,) = treasury.call{ value: expectedFee }("");
            if (!ok) revert TreasuryForwardFailed();
        }

        emit PoolCreated(
            msg.sender,
            pool,
            stakedToken,
            rewardToken,
            rewardBudget,
            rewardPerBlock,
            startBlock,
            bonusEndBlock,
            poolLimitPerUser,
            expectedFee
        );
    }

    function setCreationPaused(bool paused) external onlyOwner {
        creationPaused = paused;
        emit CreationPauseUpdated(paused);
    }

    /**
     * @dev The adapter must always retain an accountable MARCO gate and a
     *      recovery authority for the legacy factory. Ownership can be moved
     *      through Ownable2Step, but never burned accidentally.
     */
    function renounceOwnership() public pure override {
        revert OwnershipRenounceDisabled();
    }

    /**
     * @notice Emergency rollback. Returns the legacy factory to a nominated owner.
     * @dev This disables adapter pool creation until factory ownership is restored.
     */
    function releaseLegacyFactoryOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        smartChefFactory.transferOwnership(newOwner);
        emit LegacyFactoryOwnershipReleased(newOwner);
    }

    function _validatePool(
        address pool,
        address expectedAdmin,
        address expectedStakedToken,
        address expectedRewardToken,
        uint256 expectedRewardPerBlock,
        uint256 expectedStartBlock,
        uint256 expectedBonusEndBlock,
        uint256 expectedPoolLimitPerUser
    ) private view {
        ILegacySmartChef chef = ILegacySmartChef(pool);
        if (
            chef.owner() != expectedAdmin || chef.stakedToken() != expectedStakedToken
                || chef.rewardToken() != expectedRewardToken || chef.rewardPerBlock() != expectedRewardPerBlock
                || chef.startBlock() != expectedStartBlock || chef.bonusEndBlock() != expectedBonusEndBlock
                || chef.poolLimitPerUser() != expectedPoolLimitPerUser
        ) revert PoolConfigurationMismatch();
    }
}
