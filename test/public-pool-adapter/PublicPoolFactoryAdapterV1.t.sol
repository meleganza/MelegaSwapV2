// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { PublicPoolFactoryAdapterV1 } from "../../contracts/public-pool-adapter/PublicPoolFactoryAdapterV1.sol";

contract AdapterTestToken is ERC20 {
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) { }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract AdapterTestFeeToken is AdapterTestToken {
    constructor() AdapterTestToken("Fee token", "FEE") { }

    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0) && to != address(0)) {
            uint256 fee = value / 100;
            super._update(from, address(0), fee);
            super._update(from, to, value - fee);
            return;
        }
        super._update(from, to, value);
    }
}

contract AdapterTestSmartChef {
    address public immutable SMART_CHEF_FACTORY;
    bool public isInitialized;
    address public owner;
    address public stakedToken;
    address public rewardToken;
    uint256 public rewardPerBlock;
    uint256 public startBlock;
    uint256 public bonusEndBlock;
    uint256 public poolLimitPerUser;

    constructor() {
        SMART_CHEF_FACTORY = msg.sender;
    }

    function initialize(
        address stakedToken_,
        address rewardToken_,
        uint256 rewardPerBlock_,
        uint256 startBlock_,
        uint256 bonusEndBlock_,
        uint256 poolLimitPerUser_,
        address admin_
    ) external {
        require(msg.sender == SMART_CHEF_FACTORY, "Not factory");
        require(!isInitialized, "Already initialized");
        isInitialized = true;
        owner = admin_;
        stakedToken = stakedToken_;
        rewardToken = rewardToken_;
        rewardPerBlock = rewardPerBlock_;
        startBlock = startBlock_;
        bonusEndBlock = bonusEndBlock_;
        poolLimitPerUser = poolLimitPerUser_;
    }
}

contract AdapterTestLegacyFactory {
    address public owner;

    error OnlyOwner();

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) external {
        if (msg.sender != owner) revert OnlyOwner();
        owner = newOwner;
    }

    function deployPool(
        address stakedToken,
        address rewardToken,
        uint256 rewardPerBlock,
        uint256 startBlock,
        uint256 bonusEndBlock,
        uint256 poolLimitPerUser,
        address admin
    ) external {
        if (msg.sender != owner) revert OnlyOwner();
        require(AdapterTestToken(stakedToken).totalSupply() >= 0);
        require(AdapterTestToken(rewardToken).totalSupply() >= 0);
        require(stakedToken != rewardToken, "Tokens must be different");

        bytes32 salt = keccak256(abi.encodePacked(stakedToken, rewardToken, startBlock));
        AdapterTestSmartChef pool = new AdapterTestSmartChef{ salt: salt }();
        pool.initialize(stakedToken, rewardToken, rewardPerBlock, startBlock, bonusEndBlock, poolLimitPerUser, admin);
    }
}

contract PublicPoolFactoryAdapterV1Test is Test {
    uint256 private constant BUDGET = 1_000 ether;
    uint256 private constant REWARD_PER_BLOCK = 10 ether;
    uint256 private constant DURATION_BLOCKS = 100;

    address private constant USER = address(0xA11CE);
    address payable private constant TREASURY = payable(address(0xBEEF));

    AdapterTestToken private marco;
    AdapterTestToken private stake;
    AdapterTestToken private reward;
    AdapterTestLegacyFactory private legacyFactory;
    PublicPoolFactoryAdapterV1 private adapter;

    function setUp() external {
        marco = new AdapterTestToken("MARCO", "MARCO");
        stake = new AdapterTestToken("Stake", "STK");
        reward = new AdapterTestToken("Reward", "RWD");
        legacyFactory = new AdapterTestLegacyFactory();
        adapter = new PublicPoolFactoryAdapterV1(
            address(this),
            address(legacyFactory),
            address(marco),
            TREASURY,
            keccak256(type(AdapterTestSmartChef).creationCode)
        );
        legacyFactory.transferOwnership(address(adapter));

        reward.mint(USER, BUDGET * 10);
        marco.mint(USER, BUDGET * 10);
        vm.deal(USER, 10 ether);
    }

    function testNonMarcoRewardPoolIsPermissionlessAndAtomicallyFunded() external {
        uint256 start = block.number + 10;
        address predicted = adapter.predictPoolAddress(address(marco), address(reward), start);

        vm.startPrank(USER);
        reward.approve(address(adapter), BUDGET);
        address pool = adapter.createPool(
            address(marco), address(reward), BUDGET, REWARD_PER_BLOCK, start, start + DURATION_BLOCKS, 0
        );
        vm.stopPrank();

        assertEq(pool, predicted);
        assertEq(reward.balanceOf(pool), BUDGET);
        assertEq(AdapterTestSmartChef(pool).owner(), USER);
        assertEq(adapter.poolCreator(pool), USER);
        assertTrue(adapter.isAdapterPool(pool));
        assertEq(adapter.allPoolsLength(), 1);
    }

    function testNonMarcoStakeForwardsCanonicalCreationFee() external {
        uint256 start = block.number + 10;
        uint256 treasuryBefore = TREASURY.balance;

        vm.startPrank(USER);
        reward.approve(address(adapter), BUDGET);
        adapter.createPool{ value: 0.25 ether }(
            address(stake), address(reward), BUDGET, REWARD_PER_BLOCK, start, start + DURATION_BLOCKS, 0
        );
        vm.stopPrank();

        assertEq(TREASURY.balance - treasuryBefore, 0.25 ether);
        assertEq(address(adapter).balance, 0);
    }

    function testNonOwnerCannotCreateMarcoRewardPool() external {
        uint256 start = block.number + 10;
        vm.startPrank(USER);
        marco.approve(address(adapter), BUDGET);
        vm.expectRevert(PublicPoolFactoryAdapterV1.MarcoRewardRequiresOwner.selector);
        adapter.createPool(address(stake), address(marco), BUDGET, REWARD_PER_BLOCK, start, start + DURATION_BLOCKS, 0);
        vm.stopPrank();
    }

    function testOwnerCanCreateMarcoRewardPool() external {
        uint256 start = block.number + 10;
        marco.mint(address(this), BUDGET);
        marco.approve(address(adapter), BUDGET);

        address pool = adapter.createPool{ value: 0.25 ether }(
            address(stake), address(marco), BUDGET, REWARD_PER_BLOCK, start, start + DURATION_BLOCKS, 0
        );

        assertEq(marco.balanceOf(pool), BUDGET);
        assertEq(AdapterTestSmartChef(pool).owner(), address(this));
    }

    function testPoolCreationFailsClosedUntilAdapterOwnsLegacyFactory() external {
        adapter.releaseLegacyFactoryOwnership(address(this));
        uint256 start = block.number + 10;

        vm.startPrank(USER);
        reward.approve(address(adapter), BUDGET);
        vm.expectRevert(
            abi.encodeWithSelector(PublicPoolFactoryAdapterV1.AdapterNotFactoryOwner.selector, address(this))
        );
        adapter.createPool(address(marco), address(reward), BUDGET, REWARD_PER_BLOCK, start, start + DURATION_BLOCKS, 0);
        vm.stopPrank();
    }

    function testRejectsUnderfundedScheduleBeforeDeployment() external {
        uint256 start = block.number + 10;
        vm.startPrank(USER);
        reward.approve(address(adapter), BUDGET);
        vm.expectRevert(
            abi.encodeWithSelector(
                PublicPoolFactoryAdapterV1.InsufficientRewardBudget.selector, BUDGET + REWARD_PER_BLOCK, BUDGET
            )
        );
        adapter.createPool(
            address(marco), address(reward), BUDGET, REWARD_PER_BLOCK, start, start + DURATION_BLOCKS + 1, 0
        );
        vm.stopPrank();
    }

    function testRejectsFeeOnTransferRewardAndRevertsPoolDeployment() external {
        AdapterTestFeeToken feeToken = new AdapterTestFeeToken();
        feeToken.mint(USER, BUDGET);
        uint256 start = block.number + 10;
        address predicted = adapter.predictPoolAddress(address(marco), address(feeToken), start);

        vm.startPrank(USER);
        feeToken.approve(address(adapter), BUDGET);
        vm.expectRevert(
            abi.encodeWithSelector(
                PublicPoolFactoryAdapterV1.RewardFundingMismatch.selector, BUDGET, BUDGET - (BUDGET / 100)
            )
        );
        adapter.createPool(
            address(marco), address(feeToken), BUDGET, REWARD_PER_BLOCK, start, start + DURATION_BLOCKS, 0
        );
        vm.stopPrank();

        assertEq(predicted.code.length, 0);
    }

    function testOnlyOwnerCanPauseOrReleaseFactory() external {
        vm.startPrank(USER);
        vm.expectRevert();
        adapter.setCreationPaused(true);
        vm.expectRevert();
        adapter.releaseLegacyFactoryOwnership(USER);
        vm.stopPrank();

        adapter.setCreationPaused(true);
        assertTrue(adapter.creationPaused());
        adapter.releaseLegacyFactoryOwnership(USER);
        assertEq(legacyFactory.owner(), USER);
    }

    function testOwnershipCannotBeRenouncedAccidentally() external {
        vm.expectRevert(PublicPoolFactoryAdapterV1.OwnershipRenounceDisabled.selector);
        adapter.renounceOwnership();
        assertEq(adapter.owner(), address(this));
        assertEq(legacyFactory.owner(), address(adapter));
    }
}
