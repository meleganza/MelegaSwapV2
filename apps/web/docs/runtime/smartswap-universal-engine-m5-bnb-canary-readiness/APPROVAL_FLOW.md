# APPROVAL_FLOW

Historical Melega liquidity flows have stalled after allowance. The canary must not approve the venue router as the user spender.

## ERC-20 approval (separate from execution)

| | |
|--|--|
| Token | WBNB |
| Owner | canary user |
| Spender | `SmartSwapExecutorV1` |
| Amount | exact `10000000000000000` (not unlimited) |
| Venue router allowance from user | 0 |

Fork test `testForkApprovalThenExecute`:

1. allowance(executor) = 0, allowance(Pancake) = 0
2. `approve(executor, 0.01 WBNB)`
3. allowance(executor) = 0.01
4. `execute` succeeds
5. executor residual 0

## SmartSwap execution

The executor then `forceApprove(Pancake, net)` and resets to 0. Approval is not fee payment (`APPROVAL_MODEL.approvalIsNotFeePayment`).
