# R738 — Wrapper Deploy Environment Checklist

Copy root `.env.example` to `.env` (never commit). Fill before `forge script` broadcast.

## Required for broadcast

| Variable | Chain 56 | Chain 97 | Notes |
|---|---|---|---|
| `BNB_MAINNET_RPC_URL` / `BNB_TESTNET_RPC_URL` | mainnet | testnet | Mapped in `foundry.toml` as `bsc_mainnet` / `bsc_testnet` |
| `MAINNET_DEPLOYER` / `TESTNET_DEPLOYER` | mainnet key | testnet key | Hex private key; never log |
| `DEPLOYER_OWNER` | yes | yes | Wrapper `Ownable` owner (multisig) |
| `UNDERLYING_ROUTER` | `0xC6665d98Efd81f47B03801187eB46cbC63F328B0` (registry) | `0x9a489505a00cE272eAa5e07Dba6491314CaE3796` (discovered — see R738_CHAIN_97_DISCOVERY.json) | Not auto-filled |
| `TREASURY_INTAKE` | **NULL until Treasury Runtime publishes** | **NULL** | Alias: `TREASURY_COLLECTOR` |
| `MARCO_TOKEN` | `0x963556de0eb8138E97A85F0A86eE0acD159D210b` | `0x963556de0eb8138E97A85F0A86eE0acD159D210b` (R744B Treasury Runtime confirmed) | Registry: `/registry/assets/marco-bsc-testnet.json` |
| `BSCSCAN_API_KEY` | verify | verify | Also accepts `BSCSCAN_API_KEY` alias in docs |

## Dry-run (no broadcast)

```bash
# Simulation — reverts if any constructor arg null
forge script script/DryRunWrapperDeploy.s.sol -vvv

# Fork deploy simulation (skips if RPC or env incomplete)
forge test --match-test test_forkSimulateMainnetDeploy -vvv
```

## Broadcast (when unblocked)

```bash
# Mainnet example — DO NOT RUN until Treasury Intake published
forge script script/DeployMelegaSmartRouterWrapper.s.sol \
  --rpc-url bsc_mainnet \
  --broadcast \
  --verify \
  -vvvv
```

## Post-deploy (after on-chain address known)

```bash
WRAPPER_ADDRESS=0x... WRAPPER_CHAIN_ID=56 node apps/web/scripts/smart-router/publish-wrapper-registry.mjs
node apps/web/scripts/smart-router/publish-wrapper-abi.mjs
node apps/web/scripts/smart-router/regenerate-civilization-router-contract.mjs
```

## Rollback to ADAPTER

```bash
WRAPPER_CHAIN_ID=56 node apps/web/scripts/smart-router/rollback-wrapper-to-adapter.mjs
```
