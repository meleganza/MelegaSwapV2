# DUST_REFUND

After successful and failed fork cases:

| asset | executor residual |
|-------|-------------------|
| WBNB | 0 |
| USDT | 0 |
| native BNB | 0 |

No intentional dust. Floor remainder of fee math stays in **venue input** (user swap), not in the executor and not added to Treasury.

Native-in excess refund path exists on the executor but was not used for this ERC-20 WBNB canary.
