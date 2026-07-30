// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console2 } from "forge-std/Script.sol";
import { MelegaTokenFactory } from "../../contracts/create-token/MelegaTokenFactory.sol";

/**
 * @title DeployMelegaTokenFactoryMainnet
 * @notice Production BSC mainnet deploy for MelegaTokenFactory.
 * @dev Fail-closed. Requires:
 *      - chainid == 56 at broadcast time
 *      - env CT_MAINNET_DEPLOY_AUTHORIZED=1
 *      - env CT_FEE_FOUNDER_APPROVED=1
 *      - env CT_CREATION_FEE_WEI=50000000000000000 (Founder-approved 0.05 BNB, 18 decimals)
 *      - env CT_FEE_RECIPIENT (must equal canonical treasury)
 *      - forge --broadcast with MAINNET_DEPLOYER
 *
 * NEVER invent addresses. NEVER commit private keys.
 */
contract DeployMelegaTokenFactoryMainnet is Script {
    address constant CANONICAL_TREASURY = 0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b;
    uint256 constant BSC_MAINNET = 56;

    error DeployNotAuthorized(string reason);
    error WrongChain(uint256 got);
    error InvalidFeeRecipient(address got);
    error InvalidCreationFee();

    function run() external {
        if (block.chainid != BSC_MAINNET) revert WrongChain(block.chainid);
        if (!_flag("CT_MAINNET_DEPLOY_AUTHORIZED")) {
            revert DeployNotAuthorized("Set CT_MAINNET_DEPLOY_AUTHORIZED=1");
        }
        if (!_flag("CT_FEE_FOUNDER_APPROVED")) {
            revert DeployNotAuthorized("Set CT_FEE_FOUNDER_APPROVED=1 after Founder fee decision");
        }

        address feeRecipient = vm.envAddress("CT_FEE_RECIPIENT");
        uint256 creationFeeWei = vm.envUint("CT_CREATION_FEE_WEI");
        if (feeRecipient != CANONICAL_TREASURY) revert InvalidFeeRecipient(feeRecipient);
        if (creationFeeWei == 0) revert InvalidCreationFee();

        console2.log("=== MelegaTokenFactory mainnet deploy inputs ===");
        console2.log("chainId", block.chainid);
        console2.log("feeRecipient", feeRecipient);
        console2.log("creationFeeWei", creationFeeWei);
        console2.log("tokenTemplate", "MelegaFixedSupplyToken (CREATE via factory)");

        uint256 deployerKey = vm.envUint("MAINNET_DEPLOYER");
        address deployer = vm.addr(deployerKey);
        console2.log("deployer", deployer);

        vm.startBroadcast(deployerKey);
        MelegaTokenFactory factory = new MelegaTokenFactory(feeRecipient, creationFeeWei);
        vm.stopBroadcast();

        console2.log("factory", address(factory));
        console2.log("factory.feeRecipient", factory.feeRecipient());
        console2.log("factory.creationFee", factory.creationFee());
        console2.log("factory.balance", address(factory).balance);
        require(factory.feeRecipient() == CANONICAL_TREASURY, "fee recipient mismatch");
        require(factory.creationFee() == creationFeeWei, "fee mismatch");
        require(address(factory).balance == 0, "factory residual balance");
        require(address(factory).code.length > 0, "missing bytecode");
    }

    function _flag(string memory key) internal view returns (bool) {
        try vm.envBool(key) returns (bool ok) {
            return ok;
        } catch {
            return false;
        }
    }
}
