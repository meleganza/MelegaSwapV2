# USER_OUTPUT_PROOF

Minimum received is **post-SmartSwap economics**: Pancake `amountOutMin` is the user’s USDT minimum after the 20 bps input fee.

Fork success:

| | |
|--|--|
| User USDT before | measured |
| User USDT after | before + `out` |
| `out` | `6401086816907500952` |
| Same-block `getAmountsOut(net)` | used as min |
| `actualUserOutput >= sealedMinimumReceived` | yes (`assertGe(out, expectedOut)`) |

WBNB spent by the user equals the full 0.01 input (fee + venue), not the net alone.
