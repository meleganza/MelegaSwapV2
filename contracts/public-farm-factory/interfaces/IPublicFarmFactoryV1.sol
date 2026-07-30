// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPublicFarmFactoryV1 {
    event FarmCreated(
        address indexed creator,
        address indexed farm,
        address indexed lpToken,
        address rewardToken,
        uint256 rewardBudget,
        uint256 start,
        uint256 end,
        uint256 emissionPerSecond,
        uint256 creationFee,
        uint256 timestamp
    );

    function createFarm(
        address token0,
        address token1,
        address rewardToken,
        uint256 rewardBudget,
        uint256 start,
        uint256 end,
        uint256 emissionPerSecond,
        bytes calldata eligibilityAttestation
    ) external payable returns (address farm);
}
