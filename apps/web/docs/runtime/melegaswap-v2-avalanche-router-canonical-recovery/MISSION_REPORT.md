# MELEGASWAP_V2_AVALANCHE_ROUTER_CANONICAL_RECOVERY

**Branch:** `melegaswap-v2-multichain-execution-program`  
**Baseline:** Arbitrum LIVE `17e339f7` · Avalanche blocker `ab1f41d2`

## Verdict

**AVALANCHE_CANONICAL_ROUTER_ADDRESS_REQUIRED**

No valid Melega Avalanche V2 Router was recovered. LIVE chains were not modified.

## Factory reality (Preferred `0xFF8EBf8…`)

| Check | Result |
|-------|--------|
| Bytecode | present (~10852 bytes) |
| allPairsLength | **0** |
| Routers pointing to it | **none** |
| Classification | **A** — canonical but unused empty Factory; AMM never operationally launched |

## Candidates checked (compact)

| Address | Provenance | Bytecode | factory() | Rejection |
|---------|------------|----------|-----------|-----------|
| `0x149ee924…` | Founder-labeled Router | yes | — | **MRT** token, not router |
| `0xeF3E56e4…` | Deployer candidate | yes (~17k) | `0xabd7a070…` | factory has **0 bytecode** |
| `0xFF8EBf8…` | Founder Factory / ETH router addr | yes | — | **Factory**, not router |
| `0x64935e2A…` | Founder Vault / Poly router addr | yes | — | **Vault** (`token()`) |
| `0x2541DBEa…` | Founder MasterBuilder | yes | — | **MasterChef** |
| `0x585364c7…` | Founder Pool deploy | yes | — | no `factory()` |
| `0x816ddf4e…` | Arb Factory / Avax deploy | yes | — | **MRT** token |
| BNB/Base/ETH/Poly routers | same-address probe | **0** | — | not deployed on 43114 |
| `0x60aE616a…` | TraderJoe (external) | yes | Joe factory | not Melega; `WETH()` missing |

## Repository / history

- `ROUTER_ADDRESS[AVAX]` has been `''` since first commit — never populated on any branch.
- No `FACTORY_ADDRESS_MAP[AVAX]` ever existed.
- Avalanche deployer created exactly 7 contracts; none is a coherent V2 Router↔live Factory pair.

## Next Founder action required

**Both are applicable; primary is (2) if no private/off-repo deployment exists:**

1. **Supply** an already-deployed factual Melega Avalanche V2 Router address whose `factory()` returns an address with live bytecode and `WETH()` = WAVAX `0xB31f66AA…66c7`; **or**
2. **Authorize deployment** of a new Melega Avalanche Factory + Router (and liquidity), because no valid historical Melega AMM Router deployment exists on 43114.

A valid empty Factory alone is **not** sufficient for Avalanche swap LIVE.

## Matrix (unchanged)

BNB / Base / Polygon / Ethereum / Arbitrum = **LIVE**  
Avalanche = **PREPARING**  
Liquidity Builder = BETA · BNB only
