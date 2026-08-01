# MISSION REPORT — Create Token Factory Mainnet Deployment Preparation

## Verdict

`MELEGA_DEX_V1_CREATE_TOKEN_FACTORY_READY_FOR_FOUNDER_SIGNATURE`

## Package

| Item | Value |
| --- | --- |
| Contract | CreateTokenFactoryV1 · MelegaTokenFactory |
| Source | `contracts/create-token/` |
| Script | `script/create-token/DeployMelegaTokenFactoryMainnet.s.sol` |
| Certified artifact | `ct-v1-certified.json` |
| Creation SHA-256 | `0xf429bda6cb2176b096039f8c20b577db8eb40365154f82a69323df38a6f89530` |
| Runtime SHA-256 | `0xfb743044873edfe222585c801213aaccde9db2ac9bbfb863ff33406d2bf57c3f` |
| Fee | **0.10 BNB** (`100000000000000000` wei) |
| Treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| Deployer | MELEGA DEPLOYER `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` |

## Founder UI

- Page: `/runtime/deployment/`
- Order: Liquidity Builder → **Create Token Factory** → Public Farm Factory
- Unlocked after Liquidity Builder READY
- States: Certified artifact loaded · Artifact hash verified · Constructor review · Gas estimate · Ready for Founder signature
- CTA: **Deploy Create Token Factory**
- `factoryAddress` remains **null** (not fabricated)
- No KMS · No server signer · No automatic broadcast · No Treasury Runtime

## Gates

- Tests: **147 passed**
- `next build`: **passed**
- Liquidity Builder / fee schedule / LB deployed addresses: **untouched**
