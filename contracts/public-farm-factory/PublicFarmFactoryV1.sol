// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { PublicFarmTemplateV1 } from "./PublicFarmTemplateV1.sol";
import { IMelegaPairFactoryMinimal } from "./interfaces/IMelegaPairFactoryMinimal.sol";
import { IPublicFarmFactoryV1 } from "./interfaces/IPublicFarmFactoryV1.sol";

/**
 * @title PublicFarmFactoryV1
 * @notice Permissionless factory that deploys only PublicFarmTemplateV1.
 * @dev Does not expose MasterBuilder / MasterChef. Rejects MARCO rewards.
 *      Creation fee is forwarded immediately to the treasury (no custody).
 *      TVL eligibility is enforced via signed attestation (not an unsafe on-chain oracle).
 *      NOT DEPLOYED — package only. Do not fabricate addresses.
 */
contract PublicFarmFactoryV1 is IPublicFarmFactoryV1 {
    address public immutable treasury;
    address public immutable marcoToken;
    address public immutable pairFactory;
    address public immutable eligibilitySigner;

    uint256 public constant FREE_FEE = 0;
    uint256 public constant DEFAULT_FEE = 0.25 ether;

    mapping(address => uint256) public eligibilityNonce;

    error ZeroAddress();
    error MarcoRewardForbidden();
    error InvalidLpPair();
    error InvalidSchedule();
    error IncorrectCreationFee(uint256 expected, uint256 provided);
    error FeeForwardFailed();
    error RewardFundingFailed();
    error InvalidAttestation();
    error AttestationExpired();
    error BadNonce();

    constructor(
        address treasury_,
        address marcoToken_,
        address pairFactory_,
        address eligibilitySigner_
    ) {
        if (
            treasury_ == address(0) ||
            marcoToken_ == address(0) ||
            pairFactory_ == address(0) ||
            eligibilitySigner_ == address(0)
        ) revert ZeroAddress();
        treasury = treasury_;
        marcoToken = marcoToken_;
        pairFactory = pairFactory_;
        eligibilitySigner = eligibilitySigner_;
    }

    function createFarm(
        address token0,
        address token1,
        address rewardToken,
        uint256 rewardBudget,
        uint256 start,
        uint256 end,
        uint256 emissionPerSecond,
        bytes calldata eligibilityAttestation
    ) external payable returns (address farm) {
        if (rewardToken == address(0) || token0 == address(0) || token1 == address(0)) revert ZeroAddress();
        if (rewardToken == marcoToken) revert MarcoRewardForbidden();
        if (end <= start || emissionPerSecond == 0 || rewardBudget == 0) revert InvalidSchedule();

        address lpToken = IMelegaPairFactoryMinimal(pairFactory).getPair(token0, token1);
        if (lpToken == address(0)) revert InvalidLpPair();

        bool pairContainsMarco = token0 == marcoToken || token1 == marcoToken;
        uint256 expectedFee = pairContainsMarco ? FREE_FEE : DEFAULT_FEE;
        if (msg.value != expectedFee) revert IncorrectCreationFee(expectedFee, msg.value);

        _consumeEligibilityAttestation(
            msg.sender,
            lpToken,
            eligibilityAttestation
        );

        farm = address(
            new PublicFarmTemplateV1(
                msg.sender,
                lpToken,
                rewardToken,
                rewardBudget,
                start,
                end,
                emissionPerSecond
            )
        );

        // Creator funds reward budget — factory does not retain rewards.
        if (!IERC20Pull(rewardToken).transferFrom(msg.sender, farm, rewardBudget)) revert RewardFundingFailed();
        PublicFarmTemplateV1(farm).notifyFunded();

        if (expectedFee > 0) {
            (bool ok,) = treasury.call{ value: msg.value }("");
            if (!ok) revert FeeForwardFailed();
        }

        emit FarmCreated(
            msg.sender,
            farm,
            lpToken,
            rewardToken,
            rewardBudget,
            start,
            end,
            emissionPerSecond,
            expectedFee,
            block.timestamp
        );
    }

    function _consumeEligibilityAttestation(
        address creator,
        address lpToken,
        bytes calldata attestation
    ) internal {
        // abi.encode(lpToken, currentTvlBnbRay, minimumTvlBnbRay, sourceBlock, deadline, nonce, v, r, s)
        // Minimum TVL must be >= 0.25e18 ray units. Signature must recover eligibilitySigner.
        if (attestation.length < 32 * 9) revert InvalidAttestation();
        (
            address attestedLp,
            uint256 currentTvlBnbRay,
            uint256 minimumTvlBnbRay,
            ,
            uint256 deadline,
            uint256 nonce,
            uint8 v,
            bytes32 r,
            bytes32 s
        ) = abi.decode(
            attestation,
            (address, uint256, uint256, uint256, uint256, uint256, uint8, bytes32, bytes32)
        );

        if (attestedLp != lpToken) revert InvalidAttestation();
        if (minimumTvlBnbRay < 0.25 ether) revert InvalidAttestation();
        if (currentTvlBnbRay < minimumTvlBnbRay) revert InvalidAttestation();
        if (block.timestamp > deadline) revert AttestationExpired();
        if (nonce != eligibilityNonce[creator]) revert BadNonce();

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(
                    abi.encode(
                        block.chainid,
                        address(this),
                        creator,
                        lpToken,
                        currentTvlBnbRay,
                        minimumTvlBnbRay,
                        deadline,
                        nonce
                    )
                )
            )
        );
        address recovered = ecrecover(digest, v, r, s);
        if (recovered == address(0) || recovered != eligibilitySigner) revert InvalidAttestation();

        eligibilityNonce[creator] = nonce + 1;
    }
}

interface IERC20Pull {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
