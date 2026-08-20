# BASELINE_AUDIT

Branch: `mission-smartswap-universal-engine-m5-bnb-canary-readiness`  
HEAD at start: `40c2129f10335e7cf8d615318a8ed955f2bb1ac9`  
Parent mission: `MELEGASWAP_V2_SMARTSWAP_UNIVERSAL_ENGINE_M4_EVM_PROTOCOL_FEE_ENFORCEMENT_COMPLETE`

M4 was recovered, not rebuilt.

## Confirmed M4 source (unchanged)

| item | status |
|------|--------|
| `contracts/smartswap/SmartSwapExecutorV1.sol` | present; EXACT_IN; INPUT-ASSET FEE; atomic fee+swap |
| Treasury immutable | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| Policy | `SMARTSWAP_REVENUE_POLICY_V1` bands 25/20/15/10/5; max 25 bps; fee=0 `FeeBypass` |
| Sealed intent | abi.encode + eth_sign; nonce; deadline; chainId; beneficiary; routeHash |
| Router allowlist | `setRouter`; no arbitrary `call` |
| Selectors | internally encoded V2 exact-in only |
| Production | `ACTIVE_V2_ROLLOUT = LEGACY_PRODUCTION`; adapters `EXECUTE=false` |
| M4 canary spec | Pancake BSC WBNB→USDC 0.01; `executed: false` |
| Foundry local | `SmartSwapExecutorV1.t.sol` (mock; 4 passed) |
| Deployment tooling | `script/DryRunWrapperDeploy.s.sol` is `new`, not CREATE2. M5 follows that pattern. |
| Compiler | solc 0.8.20, optimizer 200, via_ir |

## Generated artifacts

Foundry `out/` and `cache/` were dirty at the M4 tip. They are **not** source. M5 does not commit them.

## Mainnet truth

No mainnet `SmartSwapExecutorV1` deployment was found. No canary has been broadcast. Production SmartSwap is unchanged.

## Discrepancy

None. Baseline matches the M5 brief.
