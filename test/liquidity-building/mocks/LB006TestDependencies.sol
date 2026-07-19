// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * TEST ONLY
 * NOT PRODUCTION
 * LOCAL FORK / UNIT TEST DEPENDENCY — NOT MAINNET DEPLOYMENT OR BINDING EVIDENCE
 */

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC1271 } from "@openzeppelin/contracts/interfaces/IERC1271.sol";

import {
    ILiquidityBuildingExecutionAuthorizerV1
} from "../../../contracts/liquidity-building/interfaces/ILiquidityBuildingExecutionAuthorizerV1.sol";
import {
    ILiquidityBuildingTreasuryFeeSinkV1
} from "../../../contracts/liquidity-building/interfaces/ILiquidityBuildingTreasuryFeeSinkV1.sol";

contract LB006MockERC20 is ERC20 {
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) { }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/// @dev Fee-on-transfer: receiver gets amount - 1%.
contract LB006FeeOnTransferERC20 is ERC20 {
    constructor() ERC20("FeeQuote", "FQ") { }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        uint256 fee = amount / 100;
        uint256 send = amount - fee;
        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, send);
        if (fee > 0) _transfer(from, address(0xFEe1), fee);
        return true;
    }
}

contract LB006FalseReturnERC20 is ERC20 {
    constructor() ERC20("FalseQ", "FQ") { }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function transferFrom(address, address, uint256) public pure override returns (bool) {
        return false;
    }
}

/// @dev Valid Treasury receiver contract (TEST ONLY).
contract LB006TreasuryReceiverMock {
    event Received(address token, uint256 amount);

    function ping() external pure returns (bool) {
        return true;
    }
}

/// @dev Attempts reentrancy into Sink.settle during transferFrom.
contract LB006ReenteringTreasuryReceiver {
    address public sink;
    bytes public attackCalldata;
    bool public attack;

    function configure(address sink_, bytes calldata data, bool on) external {
        sink = sink_;
        attackCalldata = data;
        attack = on;
    }

    // Token with callback to this receiver after credit — used via LB006CallbackQuote.
}

/// @dev Quote token that callbacks the Treasury receiver after transfer (simulates ERC777-like hook).
contract LB006CallbackQuote is ERC20 {
    address public hookTarget;
    bytes public hookData;
    bool public hookEnabled;

    constructor() ERC20("CbQ", "CBQ") { }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function setHook(address target, bytes calldata data, bool on) external {
        hookTarget = target;
        hookData = data;
        hookEnabled = on;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, amount);
        if (hookEnabled && hookTarget != address(0)) {
            (bool ok,) = hookTarget.call(hookData);
            require(ok, "hook-failed");
        }
        return true;
    }
}

contract LB006EIP1271Signer is IERC1271 {
    bytes4 private constant _MAGIC = 0x1626ba7e;
    bool public accept;
    bool public shouldRevert;
    bytes32 public expectedHash;

    function setPolicy(bool accept_, bool shouldRevert_, bytes32 expectedHash_) external {
        accept = accept_;
        shouldRevert = shouldRevert_;
        expectedHash = expectedHash_;
    }

    function isValidSignature(bytes32 hash, bytes calldata) external view returns (bytes4) {
        if (shouldRevert) revert("LB006_1271_REVERT");
        if (!accept) return 0xffffffff;
        if (expectedHash != bytes32(0) && hash != expectedHash) return 0xffffffff;
        return _MAGIC;
    }
}

contract LB006IncompatibleAuthorizer {
    function executionIntentSchemaVersion() external pure returns (bytes32) {
        return keccak256("WRONG_SCHEMA");
    }

    function executionIntentTypeHash() external pure returns (bytes32) {
        return bytes32(uint256(1));
    }

    function signingAuthority() external pure returns (address) {
        return address(0xBEEF);
    }

    function authorityType() external pure returns (uint8) {
        return 0;
    }
}

contract LB006IncompatibleSink {
    address public immutable treasuryReceiver;

    constructor(address receiver_) {
        treasuryReceiver = receiver_;
    }

    function treasurySinkVersion() external pure returns (bytes32) {
        return keccak256("WrongSink");
    }
}

contract LB006SinkWithEoaReceiverView {
    address public immutable treasuryReceiver;

    constructor(address eoa_) {
        treasuryReceiver = eoa_;
    }

    function treasurySinkVersion() external pure returns (bytes32) {
        return keccak256("LiquidityBuildingTreasuryFeeSinkV1");
    }
}

/// @dev Fake Program for Sink caller tests.
contract LB006FakeProgram {
    bytes32 public programId;
    address public factory;
    address public quoteAsset;

    function configure(bytes32 programId_, address factory_, address quoteAsset_) external {
        programId = programId_;
        factory = factory_;
        quoteAsset = quoteAsset_;
    }
}

contract LB006FakeFactory {
    address public treasuryFeeSink;
    mapping(address => bool) public registered;

    function setSink(address sink_) external {
        treasuryFeeSink = sink_;
    }

    function setRegistered(address program, bool ok) external {
        registered[program] = ok;
    }

    function isRegisteredProgram(address program) external view returns (bool) {
        return registered[program];
    }
}

/// @dev Minimal Program stand-in that holds quote and settles via Sink.
contract LB006SettlingProgram {
    bytes32 public programId;
    address public factory;
    address public quoteAsset;

    constructor(bytes32 programId_, address factory_, address quoteAsset_) {
        programId = programId_;
        factory = factory_;
        quoteAsset = quoteAsset_;
    }

    function settle(address sink, bytes32 executionId, uint256 amount, bytes32 authorizationReference)
        external
        returns (bytes32)
    {
        return ILiquidityBuildingTreasuryFeeSinkV1(sink)
            .settleLiquidityBuildingFee(programId, executionId, quoteAsset, amount, authorizationReference);
    }
}
