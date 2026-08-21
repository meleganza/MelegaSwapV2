# POST_DEPLOY_CONFIG

Not executed. `setRouter` is prepared as an unsigned follow-up only.

Unsigned calldata (broadcast only after runtime certification):

```
setRouter(
  0x10ED43C718714eb63d5aA57B78B54704E256024E,
  keccak256("pancakeswap") = 0xd7e0d5c07ddc27357df5c45737f3b7506ed8b6a6631c211732cdda1dfcf56ba3,
  true
)
```

If nonce 3194 CREATE succeeds, this would be nonce **3195** to `0x296015b106F4b2FB94249cf398cbF05d4CcE0391`. Rebuild if the CREATE address changes.

Melega DEX router must remain unallowlisted for this canary.
