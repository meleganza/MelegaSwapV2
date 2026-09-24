# BSC SmartSwapExecutorV2 — mainnet deployment record

Factual record only. **No runtime activation. No canary. No cutover. Ethereum untouched.**

## Classification

| Gate | Status |
|---|---|
| `BSC_EXECUTOR` | `DEPLOYED_VERIFIED` |
| `BSC_ROUTERS` | `CONFIGURED_VERIFIED` |
| `PUBLIC_V2_EXECUTION` | `DISABLED` |
| `RUNTIME_CONFIG` | `NOT_CONFIGURED` |
| `CANARY` | `NOT_STARTED` |
| `CUTOVER` | `FALSE` |
| `ETHEREUM` | `NOT_AUTHORIZED` / `UNTOUCHED` |
| `BSC_SCAN` | `EXPLORER_VERIFICATION_PENDING` |

Package tip at record time: `e02f54ca45687febdc2450b9103f77e650b396f8` (merged Founder package `#90` + immutable runtime gate `#91`).

## Executor

| Field | Value |
|---|---|
| Address | [`0x7c07082839edd5797737640bba6af47992b9861e`](https://bscscan.com/address/0x7c07082839edd5797737640bba6af47992b9861e) |
| CREATE tx | [`0x7c34dc160b00c48a32a2ee115130570cc2803ef06327a4e306e28fb39701e3f8`](https://bscscan.com/tx/0x7c34dc160b00c48a32a2ee115130570cc2803ef06327a4e306e28fb39701e3f8) |
| Block / nonce | `123716629` / `3281` |
| Runtime SHA256 (`eth_getCode`) | `81328ab7fcce60fedb386a41fb17adceffcf897b25530a4504a8cff5c389845a` |
| Owner | `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` |
| Treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| WBNB | `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` |
| `paused` | `false` |

**Never** compare `eth_getCode` to compiler template `4ccb42b7…5594722` (corrected in `#91`).

## Routers (`setRouter`)

| Venue | Router | Founder tx | `allowedVenue` |
|---|---|---|---|
| Melega | `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3` | [`0xeefe048c…`](https://bscscan.com/tx/0xeefe048ce81a5b59aeeee1c2b0078163a42b7b7b648b4aee0763ebb2e3a8cfb6) | `0x877b20d585b9e74b8a131af0e7b570769017d6338d83cef67e371130e4125538` |
| Pancake V2 | `0x10ED43C718714eb63d5aA57B78B54704E256024E` | [`0xd802cb00…`](https://bscscan.com/tx/0xd802cb001599d38e4afa518970e1c8d0255292f52676f1cc5a2d32e0323aa5b1) | `0xd7e0d5c07ddc27357df5c45737f3b7506ed8b6a6631c211732cdda1dfcf56ba3` |

### Submission note (MetaMask wrapper)

CREATE went direct (`to = null` → executor).

Melega and Pancake `setRouter` were submitted by MetaMask through its `redeemDelegations` wrapper:

- Wrapper: `0xdb9b1e94b5b69df7e401ddbede43491141047db3`
- Selector: `0xcef6d209`
- Version: `1.3.0`

Outer receipt `to` is the wrapper. Embedded calldata is the **exact** package `setRouter` payload. Executor emitted allowlist events; on-executor `allowedVenue` reads **PASS**.

## Gas (wei)

| Step | Cost |
|---|---|
| Deploy | `76547950000000` |
| Melega | `6915150000000` |
| Pancake | `6916250000000` |
| **Total** | `90379350000000` (~`0.00009037935` BNB) |

## BscScan verification

Status: **`EXPLORER_VERIFICATION_PENDING`** (no API key used in this session).

Manual path:

1. Open [Verify & Publish](https://bscscan.com/verifyContract) for `0x7c07082839edd5797737640bba6af47992b9861e`
2. Use Standard JSON Input from `../founder-deployment-package/verification-standard-json-input.json`
3. Constructor ABI-encoded args from `../founder-deployment-package/bsc.json` → `constructor.abiEncodedArguments`

Explorer failure does **not** authorize redeploy.

## Explicit non-goals (this PR)

- No `v2ExecutionRuntimeConfig` edits
- No public V2 execution enablement
- No canary / cutover
- No Ethereum deploy

## Artifacts in this folder

- `evidence.json` — structured record
- `independent-verify.json` — independent on-chain verify snapshot
- `README.md` — this file
