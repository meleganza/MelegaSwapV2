# MISSION REPORT — Public Farm Factory Mainnet Deployment Preparation

## Verdict

`MELEGA_DEX_V1_PUBLIC_FARM_FACTORY_READY_FOR_FOUNDER_SIGNATURE`

## Prior systems (untouched)

| System | Status |
| --- | --- |
| Liquidity Builder | MAINNET READY |
| Create Token Factory | MAINNET READY |
| Smart Swap | FEE SETTLEMENT CERTIFIED |

## Package

| Field | Value |
| --- | --- |
| Contract | PublicFarmFactoryV1 |
| Certified artifact | `apps/web/src/lib/deployment-orchestrator/artifacts/pff-v1-certified.json` |
| Creation SHA-256 | `0x0580aecb43e30edfadc66770ff05202e888ae8fbb9c2aac2d33dfb3bdde26363` |
| Expected runtime SHA-256 | `0x02aab35245724fc9c8e756a0643c8dbbb1aef28a20d4e3ff111b5a183a36cee9` |
| Deployer | MELEGA DEPLOYER `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` |
| factoryAddress | **null** (not fabricated) |

## Constructor (Founder review)

| Arg | Value |
| --- | --- |
| treasury_ | MELEGA TREASURY WALLET `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| marcoToken_ | `0x963556de0eb8138E97A85F0A86eE0acD159D210b` |
| pairFactory_ | `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C` |
| eligibilitySigner_ | MELEGA DEPLOYER (Founder-approved attestation EOA) |

Economics: MARCO pair **FREE** · other pairs **0.25 BNB** · min TVL **0.25 BNB** → `REQUIRE_LIQUIDITY_INCREASE`

## Founder UI

Path: `/runtime/deployment/`  
Order: Liquidity Builder → Create Token Factory → **Public Farm Factory**  
CTA: **Deploy Public Farm Factory**  
States: Certified artifact loaded · Artifact hash verified · Constructor review · Gas estimate ready · Ready for Founder signature  

No KMS · no server signer · no automatic broadcast · no manual bytecode upload.

## User flow prepared (post-deploy)

Create Farm → Select LP Pair (existing or create) → Check liquidity → if TVL &lt; 0.25 BNB prompt **Increase liquidity required** → Configure reward token (MARCO reward forbidden) → Create Farm. No MasterBuilder.

## Gates

- Tests: **318 passed** (34 files)
- `next build`: **passed**
- LB / Create Token / Smart Swap cores: **untouched**

## Evidence

Directory: `apps/web/docs/runtime/melega-dex-v1-public-farm-factory-mainnet-deployment/`
