# UNSIGNED_PACKAGE

Prepared. Not signed. Not broadcast.

Fail-closed quotes (venue input `9980000000000000` WBNB):

| RPC | Block | ts | net USDC |
|--|--|--|--|
| dataseed | 118714900 | 1787982805 | `6876753540336322738` |
| 48.club | 118714910 | 1787982809 | `6876753540336322738` |

| | |
|--|--|
| failClosedNetUsdcOut | `6876753540336322738` |
| slippageBps | 50 (M6/M5 canary pattern) |
| minUserOut | `6842369772634641124` |
| deadline | `1787984605` (older quote ts + 1800s) |
| intentHash | `0x637825796aa0d15739e5a31dbaf9f650fe532acefdbd75a30bba07cd0e09e5f2` |

`executeCalldata` remains `INCOMPLETE_UNTIL_INTENTSIGNER_PERSONAL_SIGN`.
