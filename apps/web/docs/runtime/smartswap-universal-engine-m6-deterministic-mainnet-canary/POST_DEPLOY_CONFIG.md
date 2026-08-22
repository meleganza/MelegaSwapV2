# POST_DEPLOY_CONFIG

`setRouter` is the next Founder-gated mutation. Not signed. Not broadcast.

Package: `deployments/mainnet/m6-unsigned-set-router-tx.json`

```
setRouter(
  0x10ED43C718714eb63d5aA57B78B54704E256024E,
  keccak256("pancakeswap") = 0xd7e0d5c07ddc27357df5c45737f3b7506ed8b6a6631c211732cdda1dfcf56ba3,
  true
)
```

| | |
|--|--|
| chainId | 56 |
| from | `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` |
| to | `0x296015b106F4b2FB94249cf398cbF05d4CcE0391` |
| value | 0 |
| nonce | **3195** |
| gas | 80000 (estimate 48875) |
| gasPrice | 50000000 wei |

Stop if nonce ≠ 3195. Melega DEX router must remain unallowlisted. Do not send approve or execute.
