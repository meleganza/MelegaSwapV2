// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * TEST ONLY — NOT PRODUCTION
 * LOCAL FORK / UNIT DEPENDENCY — NOT MAINNET BINDING EVIDENCE
 */

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {
    IMelegaV2Factory,
    IMelegaV2Pair
} from "../../../contracts/liquidity-building/interfaces/ILiquidityBuildingFactoryV1.sol";
import { IMelegaV2RouterMinimal } from "../../../contracts/liquidity-building/interfaces/IMelegaV2RouterMinimal.sol";

contract LB007MockERC20 is ERC20 {
    constructor(string memory n, string memory s) ERC20(n, s) { }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/// @dev Minimal UniswapV2-style pair with 9975/10000 fee behavior applied by the router.
contract LB007MockPair is IMelegaV2Pair, ERC20 {
    address public override token0;
    address public override token1;
    uint112 private _r0;
    uint112 private _r1;

    constructor(address t0, address t1, uint112 r0_, uint112 r1_) ERC20("LP", "LP") {
        token0 = t0;
        token1 = t1;
        _r0 = r0_;
        _r1 = r1_;
    }

    function getReserves() external view returns (uint112, uint112, uint32) {
        return (_r0, _r1, 0);
    }

    function setReserves(uint112 a, uint112 b) external {
        _r0 = a;
        _r1 = b;
    }

    function balanceOf(address account) public view override(ERC20, IMelegaV2Pair) returns (uint256) {
        return ERC20.balanceOf(account);
    }

    function totalSupply() public view override(ERC20, IMelegaV2Pair) returns (uint256) {
        return ERC20.totalSupply();
    }

    function mintTo(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function pay(address token, address to, uint256 amount) external {
        IERC20(token).transfer(to, amount);
    }
}

    contract LB007MockMelegaFactory is IMelegaV2Factory {
        mapping(address => mapping(address => address)) public pairs;

        function setPair(address a, address b, address p) external {
            pairs[a][b] = p;
            pairs[b][a] = p;
        }

        function getPair(address a, address b) external view returns (address) {
            return pairs[a][b];
        }
    }

    /// @dev Melega-compatible router mock (9975/10000 exact-out + addLiquidity).
    contract LB007MockRouter is IMelegaV2RouterMinimal {
        uint256 internal constant FEE_NUM = 9975;
        uint256 internal constant FEE_DEN = 10_000;

        IMelegaV2Factory public immutable melegaFactory;
        bool public failSwap;
        bool public failAdd;
        bool public mismatchReturns;

        constructor(address factory_) {
            melegaFactory = IMelegaV2Factory(factory_);
        }

        function setFailSwap(bool v) external {
            failSwap = v;
        }

        function setFailAdd(bool v) external {
            failAdd = v;
        }

        function setMismatchReturns(bool v) external {
            mismatchReturns = v;
        }

        function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
            require(amountOut > 0 && amountOut < reserveOut, "LIQ");
            return (reserveIn * amountOut * FEE_DEN) / ((reserveOut - amountOut) * FEE_NUM) + 1;
        }

        function swapTokensForExactTokens(
            uint256 amountOut,
            uint256 amountInMax,
            address[] calldata path,
            address to,
            uint256 deadline
        ) external returns (uint256[] memory amounts) {
            require(deadline >= block.timestamp, "EXP");
            require(!failSwap, "FAIL_SWAP");
            require(path.length == 2, "PATH");
            address pair = melegaFactory.getPair(path[0], path[1]);
            LB007MockPair p = LB007MockPair(pair);
            (uint112 r0, uint112 r1,) = p.getReserves();
            bool projectIs0 = p.token0() == path[0];
            uint256 reserveIn = projectIs0 ? r0 : r1;
            uint256 reserveOut = projectIs0 ? r1 : r0;
            uint256 amountIn = getAmountIn(amountOut, reserveIn, reserveOut);
            require(amountIn <= amountInMax, "INMAX");

            IERC20(path[0]).transferFrom(msg.sender, pair, amountIn);
            LB007MockPair(pair).pay(path[1], to, amountOut);
            // Sync reserves: project reserve += amountIn, quote reserve -= amountOut
            if (projectIs0) {
                p.setReserves(uint112(reserveIn + amountIn), uint112(reserveOut - amountOut));
            } else {
                p.setReserves(uint112(reserveOut - amountOut), uint112(reserveIn + amountIn));
            }

            amounts = new uint256[](2);
            amounts[0] = mismatchReturns ? amountIn + 1 : amountIn;
            amounts[1] = mismatchReturns ? amountOut + 1 : amountOut;
        }

        function addLiquidity(
            address tokenA,
            address tokenB,
            uint256 amountADesired,
            uint256 amountBDesired,
            uint256 amountAMin,
            uint256 amountBMin,
            address to,
            uint256 deadline
        ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
            require(deadline >= block.timestamp, "EXP");
            require(!failAdd, "FAIL_ADD");
            address pair = melegaFactory.getPair(tokenA, tokenB);
            LB007MockPair p = LB007MockPair(pair);
            (uint112 r0, uint112 r1,) = p.getReserves();
            bool aIs0 = p.token0() == tokenA;
            uint256 reserveA = aIs0 ? r0 : r1;
            uint256 reserveB = aIs0 ? r1 : r0;

            amountA = amountADesired;
            amountB = (amountADesired * reserveB) / reserveA;
            if (amountB > amountBDesired) {
                amountB = amountBDesired;
                amountA = (amountBDesired * reserveA) / reserveB;
            }
            require(amountA >= amountAMin && amountB >= amountBMin, "MIN");

            IERC20(tokenA).transferFrom(msg.sender, pair, amountA);
            IERC20(tokenB).transferFrom(msg.sender, pair, amountB);

            if (aIs0) {
                p.setReserves(uint112(reserveA + amountA), uint112(reserveB + amountB));
            } else {
                p.setReserves(uint112(reserveB + amountB), uint112(reserveA + amountA));
            }

            liquidity = amountA; // TEST ONLY LP mint metric
            if (liquidity == 0) liquidity = 1;
            p.mintTo(to, liquidity);
            if (mismatchReturns) {
                amountA += 1;
            }
        }
    }

    contract LB007TreasuryReceiver {
        function ping() external pure returns (bool) {
            return true;
        }
    }

    contract LB007ReenteringERC20 is ERC20 {
        address public target;
        bytes public data;
        bool public attack;

        constructor() ERC20("R", "R") { }

        function mint(address to, uint256 amount) external {
            _mint(to, amount);
        }

        function setAttack(address t, bytes calldata d, bool on) external {
            target = t;
            data = d;
            attack = on;
        }

        function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
            _spendAllowance(from, msg.sender, amount);
            _transfer(from, to, amount);
            if (attack && target != address(0)) {
                (bool ok,) = target.call(data);
                require(ok, "reenter");
            }
            return true;
        }
    }
