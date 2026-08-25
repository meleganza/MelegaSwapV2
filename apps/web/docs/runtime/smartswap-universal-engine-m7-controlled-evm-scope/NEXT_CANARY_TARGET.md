# NEXT_CANARY_TARGET

Status: **TARGET_DEFINED_NOT_PREPARED**

Preferred roadmap target after certified M6 WBNB→USDT: an additional BNB pair on the **already-allowlisted** Pancake V2 router. Repository support exists. No substitute venue or chain.

Source: `FIRST_CANARY_PAIR.md` (“M4’s WBNB→USDC remains a later candidate”), M4 `FIRST_CANARY_SPEC`, and M4 `CANARY_READINESS.md`.

| Field | Value |
|-------|--------|
| Chain | BNB Smart Chain (56) |
| Venue | pancakeswap (already allowlisted by mined M6 `setRouter`) |
| Router | `0x10ED43C718714eb63d5aA57B78B54704E256024E` |
| Factory | `0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73` |
| Input | WBNB `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` decimals 18 |
| Output | USDC `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` decimals 18 |
| Pair | `0xd99c7f6c65857ac913a8f880a4cb84032ab2fc5b` = `factory.getPair(WBNB, USDC)` of those documented addresses |
| Distinct from M6 | yes (`0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE` is WBNB-USDT) |
| Planned notional | `10000000000000000` (0.01 WBNB) from M4 spec |
| Expected fee band | 20 bps from structural 25 bps |
| Treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| Executor | `0x296015b106F4b2FB94249cf398cbF05d4CcE0391` |
| Production | `ACTIVE_V2_ROLLOUT=LEGACY_PRODUCTION` |

## Readiness

Defined only. **Not prepared. Not signed. Not broadcast.**

Still required before any later package mission: Founder M7 authorization, fresh `getAmountsOut` on venue input, unused intent nonce, and an unsigned package. This mission does not create those artifacts.

`UNAUTHORIZED_UI_CHANGE=0`
