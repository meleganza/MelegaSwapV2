// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";

/// @notice Shared deploy env resolution for wrapper pipeline scripts.
abstract contract DeployEnv is Script {
    error MissingDeployEnv(string name);
    error NullDeployAddress(string name);

    struct WrapperDeployConfig {
        uint256 chainId;
        address underlyingRouter;
        address treasuryIntake;
        address marcoToken;
        address owner;
        bytes32 pricingRefHash;
        bytes32 treasuryPolicyRefHash;
    }

    function resolveWrapperDeployConfig() internal view returns (WrapperDeployConfig memory cfg) {
        cfg.chainId = _envUintOr("CHAIN_ID", 0);
        cfg.underlyingRouter = _envAddressRequired("UNDERLYING_ROUTER");
        cfg.treasuryIntake = _envTreasuryIntake();
        cfg.marcoToken = _envAddressRequired("MARCO_TOKEN");
        cfg.owner = _envAddressRequired("DEPLOYER_OWNER");
        cfg.pricingRefHash = _envBytes32Or("PRICING_REF_HASH", keccak256(bytes("D87_DEX_PRICING_RATIFIED")));
        cfg.treasuryPolicyRefHash = _envBytes32Or("TREASURY_POLICY_REF_HASH", keccak256(bytes("FSC-01")));
    }

    function assertNoNullAddresses(WrapperDeployConfig memory cfg) internal pure {
        if (cfg.underlyingRouter == address(0)) revert NullDeployAddress("UNDERLYING_ROUTER");
        if (cfg.treasuryIntake == address(0)) revert NullDeployAddress("TREASURY_INTAKE");
        if (cfg.marcoToken == address(0)) revert NullDeployAddress("MARCO_TOKEN");
        if (cfg.owner == address(0)) revert NullDeployAddress("DEPLOYER_OWNER");
    }

    function _envTreasuryIntake() internal view returns (address intake) {
        intake = _tryEnvAddress("TREASURY_INTAKE");
        if (intake == address(0)) {
            intake = _tryEnvAddress("TREASURY_COLLECTOR");
        }
        if (intake == address(0)) revert MissingDeployEnv("TREASURY_INTAKE or TREASURY_COLLECTOR");
    }

    function _envAddressRequired(string memory name) internal view returns (address value) {
        value = _tryEnvAddress(name);
        if (value == address(0)) revert MissingDeployEnv(name);
    }

    function _tryEnvAddress(string memory name) internal view returns (address value) {
        try vm.envAddress(name) returns (address loaded) {
            return loaded;
        } catch {
            return address(0);
        }
    }

    function _envUintOr(string memory name, uint256 fallbackValue) internal view returns (uint256 value) {
        try vm.envUint(name) returns (uint256 loaded) {
            return loaded;
        } catch {
            return fallbackValue;
        }
    }

    function _envBytes32Or(string memory name, bytes32 fallbackValue) internal view returns (bytes32 value) {
        try vm.envBytes32(name) returns (bytes32 loaded) {
            return loaded;
        } catch {
            return fallbackValue;
        }
    }
}
