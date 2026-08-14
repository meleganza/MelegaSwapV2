// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILegacySmartChef {
    function owner() external view returns (address);
    function stakedToken() external view returns (address);
    function rewardToken() external view returns (address);
    function rewardPerBlock() external view returns (uint256);
    function startBlock() external view returns (uint256);
    function bonusEndBlock() external view returns (uint256);
    function poolLimitPerUser() external view returns (uint256);
}
