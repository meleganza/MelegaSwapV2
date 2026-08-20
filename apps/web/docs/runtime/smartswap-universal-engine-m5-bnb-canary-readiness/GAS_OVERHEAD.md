# GAS_OVERHEAD

Kind: `FORK_BNB` (not used to select the M2 fee band).

Paired fork measurement, same 0.01 WBNB notional:

| | gas units |
|--|-----------|
| Direct Pancake V2 | 76,576 |
| SmartSwapExecutorV1 | 194,194 |
| Incremental | 117,618 |
| Overhead % | 153.6% |

Observed RPC gas price: 0.05 gwei (`50000000` wei).  
Incremental cost at that price: ≈ 0.00000588 BNB.

At a 1 gwei stress price the same units would cost ≈ 0.000117618 BNB. The fee band stays 20 bps either way.

Success-path `gasleft` around `execute` also logged 206,624 units (single-call, not paired). The paired comparison above is the overhead figure.
