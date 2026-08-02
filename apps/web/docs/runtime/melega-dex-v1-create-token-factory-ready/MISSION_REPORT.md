# MISSION REPORT — Create Token Factory Validation · Binding · READY

## Verdict

`MELEGA_DEX_V1_CREATE_TOKEN_FACTORY_MAINNET_READY`

## Factory

| Field | Value |
| --- | --- |
| Contract | CreateTokenFactoryV1 (`MelegaTokenFactory`) |
| Address | `0x6DbB5d7162842dA94ef9172AedC8D148d203d311` |
| Tx | `0x79fe42294e6a43f0e16d09101f4ba6846977c0267a0fc1e6d237fa1441de79d8` |
| Block | `113510808` |
| Deployer | MELEGA DEPLOYER `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` |
| Masked runtime SHA-256 | `0xfb743044873edfe222585c801213aaccde9db2ac9bbfb863ff33406d2bf57c3f` |
| Certified expected | match (`ct-v1-certified.json`) |
| Creation fee | **0.10 BNB** (`100000000000000000` wei) |
| Fee recipient | MELEGA TREASURY WALLET `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |

Lifecycle: **DEPLOYED · VALIDATED · BOUND · READY**

## Validation summary

- Receipt status success; sender = MELEGA DEPLOYER; created address matches factory
- Deployed bytecode present (4448 bytes); masked runtime hash matches certified artifact
- Constructor state on-chain: fee + treasury recipient correct
- No owner/admin probes; EIP-1967 proxy slots empty; no Treasury Runtime authority
- Fee path: user 0.10 BNB → CreateTokenFactoryV1 → MELEGA TREASURY WALLET

## Binding + frontend

- SSOT `createTokenFactoryAddress` = factual factory only
- `LIST_CREATE_TOKEN_AVAILABLE = true`
- Create Token user flow unlocked (Founder not involved in user creation)
- Liquidity Builder / Smart Swap / other factories untouched
- No redeploy · no contract modification · no fee economics change · no Treasury Runtime

## Gates

- Tests: **204 passed** (27 files)
- `next build`: **passed**
- Forbidden cores untouched

## Evidence

Directory: `apps/web/docs/runtime/melega-dex-v1-create-token-factory-ready/`

Screenshots:

- `01-factory-validated.png`
- `02-factory-bound.png`
- `03-create-token-ready.png`
