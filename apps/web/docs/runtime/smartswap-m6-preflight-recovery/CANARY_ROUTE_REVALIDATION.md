# CANARY_ROUTE_REVALIDATION

Read-only. Block `117066237`. RPC `https://bsc.publicnode.com`.

| | |
|--|--|
| Venue | PancakeSwap V2 |
| Router | `0x10ED43C718714eb63d5aA57B78B54704E256024E` |
| Path | WBNB → USDT |
| Pair | `0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE` = factory.getPair |
| Reserves | USDT `43932921683466952763647015` / WBNB `67733867615582767237713` |
| Input | `10000000000000000` (0.01 WBNB) |
| Structural | 25 bps Pancake V2 LP |
| Policy band | **20 bps** (`SMARTSWAP_REVENUE_POLICY_V1`) |
| Fee | `20000000000000` WBNB |
| Venue input | `9980000000000000` |
| Fresh gross quote | `6469960151316933559` USDT |
| Fresh net quote | `6456956296307036867` USDT |
| Min received model | post-SmartSwap; 50 bps of **fresh net** at seal time, not this stale snapshot |
| Treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` (WBNB balance 0) |

Not executed.
