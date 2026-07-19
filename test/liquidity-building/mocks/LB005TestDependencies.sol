// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * TEST ONLY
 * NOT PRODUCTION
 * LOCAL FORK TEST DEPENDENCY — NOT MAINNET DEPLOYMENT EVIDENCE
 */

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {
    IMelegaV2Factory,
    IMelegaV2Pair
} from "../../../contracts/liquidity-building/interfaces/ILiquidityBuildingFactoryV1.sol";

contract LB005MockERC20 is ERC20 {
    uint8 private immutable _decimals;

    constructor(string memory name_, string memory symbol_, uint8 decimals_) ERC20(name_, symbol_) {
        _decimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/// @dev Fee-on-transfer: recipient receives amount - 1%.
contract LB005FeeOnTransferERC20 is ERC20 {
    constructor() ERC20("FeeToken", "FEE") { }

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

/// @dev Returns false from transferFrom without reverting.
contract LB005FalseReturnERC20 is ERC20 {
    constructor() ERC20("FalseTok", "FALSE") { }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function transferFrom(address, address, uint256) public pure override returns (bool) {
        return false;
    }
}

/// @dev Callback token that attempts reentrancy into Program.depositBudget.
contract LB005ReenteringERC20 is ERC20 {
    address public target;
    bool public attack;

    constructor() ERC20("Reenter", "REEN") { }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function setAttack(address target_, bool on) external {
        target = target_;
        attack = on;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, amount);
        if (attack && target != address(0)) {
            // attempt nested deposit
            (bool ok,) = target.call(abi.encodeWithSignature("depositBudget(uint256)", 1));
            ok; // ignore
        }
        return true;
    }
}

/// @dev Allows balance manipulation to simulate negative rebase / insolvency.
contract LB005RebaseERC20 is ERC20 {
    constructor() ERC20("Rebase", "REB") { }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burnFrom(address from, uint256 amount) external {
        _burn(from, amount);
    }
}

contract LB005MockPair is IMelegaV2Pair {
    address public override token0;
    address public override token1;
    uint112 public r0;
    uint112 public r1;

    constructor(address t0, address t1, uint112 reserve0, uint112 reserve1) {
        token0 = t0;
        token1 = t1;
        r0 = reserve0;
        r1 = reserve1;
    }

    function getReserves() external view returns (uint112, uint112, uint32) {
        return (r0, r1, 0);
    }

    function setReserves(uint112 a, uint112 b) external {
        r0 = a;
        r1 = b;
    }
}

    contract LB005MockMelegaFactory is IMelegaV2Factory {
        mapping(address => mapping(address => address)) public pairs;

        function setPair(address a, address b, address pair) external {
            pairs[a][b] = pair;
            pairs[b][a] = pair;
        }

        function getPair(address tokenA, address tokenB) external view returns (address) {
            return pairs[tokenA][tokenB];
        }
    }

    /// @dev Minimal bytecode placeholders for Authorizer / Treasury / Router deps.
    contract LB005MockCodeDependency {
        function ping() external pure returns (bool) {
            return true;
        }
    }
