# FOUNDER_HELPER

Standalone local helper for the already-defined M7 WBNB→USDC canary.

| | |
|--|--|
| Path | `deployments/mainnet/m7-founder-helper.html` |
| Architecture | Same as M6: finite WBNB `approve` → `personal_sign` of 32-byte intentHash → one `execute(ExecutionIntent,address[],bytes)` |
| Auto-send | No. Each step is a Founder click. |
| Private key | Never present. |
| Unlimited approval | Forbidden. |
| Retry / second canary | Forbidden. |
| Production | `ACTIVE_V2_ROLLOUT=LEGACY_PRODUCTION` |

## Serve locally

```bash
python3 -m http.server 8765 --directory deployments/mainnet
```

Open `http://127.0.0.1:8765/m7-founder-helper.html` in a browser with Founder MetaMask.

## Operating sequence

1. Confirm the helper embeds the current `m7-unsigned-approve-tx.json` and `m7-unsigned-canary-execute.json` (tests assert byte-for-byte).
2. Connect Founder MetaMask. Account must be `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` on BNB Chain (56).
3. Run fail-closed preflight. Helper reads two public BSC RPCs and STOPs on any listed mismatch.
4. Send the exact finite WBNB approve at nonce **3207**. Not unlimited.
5. `personal_sign` `0x114a067a72ac33c8033aec60264fc9870e7e741bbd17e8f238620dab848e5ce6`.
6. Send execute once at nonce **3208** before `1788010572` (2026-08-29 15:36:12 Europe/Rome). Stop. No retry.

Do not use a stale package after its deadline. Do not merge, activate V2, or change UX.
