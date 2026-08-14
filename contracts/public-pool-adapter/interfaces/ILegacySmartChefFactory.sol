// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILegacySmartChefFactory {
    function owner() external view returns (address);

    function deployPool(
        address stakedToken,
        address rewardToken,
        uint256 rewardPerBlock,
        uint256 startBlock,
        uint256 bonusEndBlock,
        uint256 poolLimitPerUser,
        address admin
    ) external;

    function transferOwnership(address newOwner) external;
}
