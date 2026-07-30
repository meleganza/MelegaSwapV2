// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PublicFarmTemplateV1
 * @notice Minimal permissionless LP staking farm with fixed reward budget.
 * @dev No upgradeability, no arbitrary seizure, no unrestricted reward recovery.
 *      Only the factory deploys this template. Creator funds rewards at creation.
 */
interface IERC20Minimal {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract PublicFarmTemplateV1 {
    address public immutable factory;
    address public immutable creator;
    address public immutable lpToken;
    address public immutable rewardToken;
    uint256 public immutable rewardBudget;
    uint256 public immutable startTime;
    uint256 public immutable endTime;
    uint256 public immutable emissionPerSecond;

    uint256 public totalStaked;
    uint256 public rewardPerTokenStored;
    uint256 public lastUpdateTime;
    uint256 public rewardsPaid;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    error OnlyFactory();
    error FarmNotStarted();
    error FarmEnded();
    error ZeroAmount();
    error TransferFailed();

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    modifier onlyFactory() {
        if (msg.sender != factory) revert OnlyFactory();
        _;
    }

    constructor(
        address creator_,
        address lpToken_,
        address rewardToken_,
        uint256 rewardBudget_,
        uint256 startTime_,
        uint256 endTime_,
        uint256 emissionPerSecond_
    ) {
        factory = msg.sender;
        creator = creator_;
        lpToken = lpToken_;
        rewardToken = rewardToken_;
        rewardBudget = rewardBudget_;
        startTime = startTime_;
        endTime = endTime_;
        emissionPerSecond = emissionPerSecond_;
        lastUpdateTime = startTime_;
    }

    function notifyFunded() external onlyFactory {
        // Factory transfers rewardBudget before calling; no-op marker for clarity.
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        uint256 ts = block.timestamp;
        if (ts < startTime) return startTime;
        if (ts > endTime) return endTime;
        return ts;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) return rewardPerTokenStored;
        uint256 dt = lastTimeRewardApplicable() - lastUpdateTime;
        return rewardPerTokenStored + ((dt * emissionPerSecond * 1e18) / totalStaked);
    }

    function earned(address account) public view returns (uint256) {
        return
            ((balances[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) +
            rewards[account];
    }

    function _update(address account) internal {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
    }

    function stake(uint256 amount) external {
        if (block.timestamp < startTime) revert FarmNotStarted();
        if (block.timestamp >= endTime) revert FarmEnded();
        if (amount == 0) revert ZeroAmount();
        _update(msg.sender);
        totalStaked += amount;
        balances[msg.sender] += amount;
        if (!IERC20Minimal(lpToken).transferFrom(msg.sender, address(this), amount)) revert TransferFailed();
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        _update(msg.sender);
        totalStaked -= amount;
        balances[msg.sender] -= amount;
        if (!IERC20Minimal(lpToken).transfer(msg.sender, amount)) revert TransferFailed();
        emit Withdrawn(msg.sender, amount);
    }

    function getReward() external {
        _update(msg.sender);
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsPaid += reward;
            if (!IERC20Minimal(rewardToken).transfer(msg.sender, reward)) revert TransferFailed();
            emit RewardPaid(msg.sender, reward);
        }
    }
}
