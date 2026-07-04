# Pools Canonical Recovery Report

**Mission:** POOLS_REACTIVATION_POLICY (D87 Product Recovery)  
**Type:** Read-only canonical recovery — no code, config, or contract changes  
**As of:** 2026-06-26  
**On-chain snapshot:** BSC block ~107,392,599 · Polygon ~89,453,602 · Base verified · Ethereum block ~25,435,717  

---

## Executive summary

The historical **10–15 visible staking pools** on MelegaSwap were **not** 10–15 permanent pools. They were:

| Layer | Count (typical peak) | Nature |
| --- | ---: | --- |
| **Permanent MARCO surfaces** | 2–3 | Auto MARCO, Manual MARCO, Flexible MARCO (conditional) |
| **Concurrent partner campaigns** | 8–12 | Finite `bonusEndBlock` sousChef pools (stake MARCO → earn partner token) |
| **Total UI cards** | **10–15** | Sum of permanent + concurrently open campaigns |

**Today on BSC (primary chain):** **0** campaign pools remain within `bonusEndBlock`. Only **Manual MARCO** (`sousId 0`) and **Auto MARCO** (vault composite) are live → **~2 visible cards**. This matches intended lifecycle behaviour, not a missing config regression.

**Canonical reactivation candidates (Category A hidden only by obsolete `bonusEndBlock`):** **None identified.**

All 162 BSC campaign pools in `livePools56` use **finite** on-chain end blocks (~10M block windows). None use `MAX_UINT` or effectively infinite end blocks. Permanent pools (`sousId 0`) are **explicitly excluded** from `bonusEndBlock` fetching in `fetchPools.ts` and therefore do not get incorrectly marked finished.

---

## Sources recovered

| Source | Location | Pools found |
| --- | --- | ---: |
| Current BSC live + finished export | `apps/web/src/config/constants/pools.tsx` → `livePools56` + `finishedPools` | 241 |
| Ethereum live | `livePools1` | 2 |
| Polygon live | `livePools137` | 12 |
| Base live | `livePools8453` | 12 |
| **Total canonical inventory** | Same file, all chains | **267** |
| First repository commit (`e3389a2`) | `pools.tsx` | ~203 `sousId` entries (structure unchanged since import) |
| Archived JSON / migration files | Repository search | **None** — no separate pool JSON or deploy scripts |
| Historical commits | `git log -- pools.tsx` (30+ updates) | Additive partner campaigns; no permanent-pool definitions removed |
| Prior audit | `docs/POOLS_VISIBILITY_AUDIT.md` | Confirms runtime `bonusEndBlock` filter |

No duplicate pool definitions were found across files. The inflation from “~15 visible” to “267 configured” is **historical campaign accumulation**, not accidental duplication.

---

## Permanent pool architecture (Category A)

These are the **only** pools intended to have no campaign expiry in product design:

| Pool name (UI) | Config key | sousId | Stake | Earn | Chain(s) | `bonusEndBlock` behaviour | Currently visible? |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| **Auto MARCO** | `VaultKey.CakeVault` | 0 (composite) | MARCO | MARCO | 56 (primary) | Not read from sousChef; vault contract | **Yes** (BSC) |
| **Manual MARCO** | `livePools*.sousId 0` | 0 | MARCO | MARCO | 56, 1, 137, 8453 | Excluded from `fetchPoolsBlockLimits` | **Yes** (all chains) |
| **Flexible MARCO** | `VaultKey.CakeFlexibleSideVault` | 0 (composite) | MARCO | MARCO | 56 | Vault side-contract; no campaign end | **Conditional** (shown when user has locked/flexible stake) |

Evidence:

- `vaultPoolConfig` names: “Auto MARCO”, “Flexible MARCO” (`pools.tsx` lines 16–46)
- `poolsWithVaultSelector` always prepends Auto MARCO when `sousId 0` is not finished (`state/pools/selectors.ts`)
- `PoolCard` labels `sousId 0` as “Manual MARCO” (`packages/uikit/src/widgets/Pool/PoolCard.tsx`)
- `fetchPools.ts` line 14: `sousId !== 0` filter for `bonusEndBlock` multicall

---

## Classification summary

| Category | Definition | Count | Correct UI bucket |
| --- | --- | ---: | --- |
| **A — Permanent** | MARCO core / vault surfaces; no campaign expiry | 4 entries (3 chains × sousId 0 + vault composites) | **LIVE** |
| **B — Long-term / still active** | Partner pools with finite end block **still open on-chain** | 5 | **LIVE** (chain-specific) |
| **C — Campaign (ended)** | Partner pools past `bonusEndBlock` or failed contract read | 180 | **ENDED** |
| **D — Deprecated** | Explicit `isFinished: true` in `finishedPools` | 78 | **ARCHIVE** |

### Category B — Currently open campaign pools (verified on-chain)

| Pool | sousId | Chain | bonusEndBlock | Status |
| --- | ---: | ---: | ---: | --- |
| Stake MARCO → Earn ENJ | 4 | 137 | 95,203,518 | Open |
| Stake MARCO → Earn JONKY | 7 | 137 | 97,052,008 | Open |
| Stake MARCO → Earn PM | 9 | 137 | 99,648,600 | Open |
| Stake MARCO → Earn YUP | 1 | 8453 | (open at snapshot) | Open |
| Stake MARCO → Earn CLONERETH | 2 | 8453 | (open at snapshot) | Open |

### Category C — BSC campaign pattern (all ended)

Representative sample (all 162 BSC non-zero `livePools56` entries follow this pattern):

| Pool | sousId | startBlock | bonusEndBlock | Window | Reason hidden |
| --- | ---: | ---: | ---: | --- | --- |
| Stake MARCO → Earn MXMX | 14 | 89,681,294 | 99,681,294 | ~10M blocks | End block passed |
| Stake MARCO → Earn ZOLOTO | 4 | 89,677,284 | 99,888,284 | ~10.2M blocks | End block passed |
| Stake MARCO → Earn GCC2 | 22 | 89,677,284 | 99,999,999 | ~10.3M blocks | End block passed |

**No BSC campaign pool** uses `MAX_UINT`, `type(uint256).max`, or block height > 500M. All are **intentionally finite** partner campaigns (~35-day windows at historical BSC block times).

### Category D — Deprecated (`finishedPools`)

78 pools with `isFinished: true` in config (e.g. sousId 1 MXMX legacy contract, sousId 2 GITTO, sousId 3 GCC2 early deployment). These are **superseded deployments** and should remain archived.

---

## Step 1 — Canonical inventory (priority table)

Full machine-readable inventory: `docs/pools-canonical-inventory.json` (267 records, generated read-only for this mission).

| Pool Name | sousId | Staking | Earning | Chain | Start | bonusEndBlock | Config list | Visible now | Category | Reason hidden |
| --- | ---: | --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| Manual MARCO | 0 | cake | cake | 56 | — | — | livePools56 | Yes | A | — |
| Auto MARCO (vault) | 0 | cake | cake | 56 | — | — | vault composite | Yes | A | — |
| Flexible MARCO (vault) | 0 | cake | cake | 56 | — | — | vault composite | Conditional | A | — |
| Manual MARCO | 0 | cake | cake | 1 | — | — | livePools1 | Yes | A | — |
| Stake MARCO → Earn LOCO | 1 | cake | loco | 1 | 20,627,011 | 21,627,011 | livePools1 | No | C | bonusEndBlock passed |
| Manual MARCO | 0 | cake | cake | 137 | — | — | livePools137 | Yes | A | — |
| Stake MARCO → Earn ENJ | 4 | cake | enj | 137 | 65,203,518 | 95,203,518 | livePools137 | Yes | B | — |
| Stake MARCO → Earn JONKY | 7 | cake | jonky | 137 | 67,052,008 | 97,052,008 | livePools137 | Yes | B | — |
| Stake MARCO → Earn PM | 9 | cake | pm | 137 | 67,648,600 | 99,648,600 | livePools137 | Yes | B | — |
| Manual MARCO | 0 | cake | cake | 8453 | — | — | livePools8453 | Yes | A | — |
| Stake MARCO → Earn YUP | 1 | cake | yup | 8453 | — | open | livePools8453 | Yes | B | — |
| Stake MARCO → Earn CLONERETH | 2 | cake | clonereth | 8453 | — | open | livePools8453 | Yes | B | — |
| Stake MARCO → Earn MXMX | 14 | cake | mxmx | 56 | 89,681,294 | 99,681,294 | livePools56 | No | C | bonusEndBlock passed |
| … | … | … | … | … | … | … | … | … | … | … |

*Remaining 255 rows: see `docs/pools-canonical-inventory.json` and `docs/POOLS_VISIBILITY_AUDIT.md`.*

**Visibility by chain at snapshot:**

| Chain | Permanent visible | Campaign visible | Total visible |
| --- | ---: | ---: | ---: |
| BSC (56) | 2 (Auto + Manual MARCO) | 0 | **2** |
| Ethereum (1) | 1 (Manual MARCO) | 0 | **1** |
| Polygon (137) | 1 | 3 | **4** |
| Base (8453) | 1 | 2 | **3** |

---

## Step 3 — bonusEndBlock analysis

| Pattern | Found? | Pools affected | Interpretation |
| --- | --- | --- | --- |
| `MAX_UINT` / unlimited | **No** | 0 | No pool configured for infinite sousChef end |
| Very large block (>500M) | **No** | 0 | No “effectively infinite” campaigns |
| Finite ~10M block window | **Yes** | 162 BSC + most L2 campaigns | Standard partner campaign (~35 days historical) |
| `sousId 0` excluded from fetch | **Yes** | 4 chain entries | Permanent — correct |
| Vault (Auto/Flexible) | **Yes** | BSC | Permanent — separate contracts, no `bonusEndBlock` filter |
| Config `isFinished: true` | **Yes** | 78 | Explicit deprecation |
| Config `isFinished: false` but on-chain ended | **Yes** | 162 BSC | **Config drift** — should be classified Ended in UI (runtime already hides them) |

### CANONICAL REACTIVATION CANDIDATES

**None.**

No Category A pool is hidden because of an obsolete `bonusEndBlock`. Permanent pools either bypass end-block checks (`sousId 0`) or use vault contracts. Every hidden BSC pool is a **Category C campaign** whose on-chain reward period has legitimately ended.

Reactivating ended campaigns would require **on-chain admin action** (extend `bonusEndBlock` or deploy new sousChef) — out of scope and explicitly forbidden by this mission.

---

## Step 4 — Reactivation plan

### LIST A — Should be Live (permanent / legitimately open)

These pools **should** appear in the Live tab. **No config recovery needed** — they are already visible where chain + on-chain state allow:

| Pool | Chain | Action required |
| --- | --- | --- |
| Auto MARCO | BSC | **None** — already Live |
| Manual MARCO | 56, 1, 137, 8453 | **None** — already Live |
| Flexible MARCO | BSC | **None** — conditional display is correct |
| Stake → Earn ENJ, JONKY, PM | Polygon | **None** — already Live on Polygon |
| Stake → Earn YUP, CLONERETH | Base | **None** — already Live on Base |

**BSC-specific note:** The gap from ~15 → ~2 visible pools is **entirely explained** by ended partner campaigns, not missing permanent pools. Restoring “10–15 visible” on BSC requires **new or renewed partner campaigns** (product/ops decision), not reactivation of canonical config.

### LIST B — Correctly belong in Ended / Archive

| Group | Count | Decision |
| --- | ---: | --- |
| BSC campaigns past `bonusEndBlock` (still in `livePools56`) | 162 | **Ended** — rewards finished; users may still have stake to withdraw |
| `finishedPools` entries (`isFinished: true`) | 78 | **Archive** — superseded contracts |
| ETH LOCO campaign (sousId 1) | 1 | **Ended** — `bonusEndBlock` 21,627,011 passed |
| Polygon/Base campaigns when `bonusEndBlock` passes | future | **Ended** — same rules |

**Do not** move Category C pools back to Live without:

1. Product sign-off naming the partner/token  
2. Verified on-chain extension or new deployment  
3. Updated `pools.tsx` entry pointing to live contract  

---

## Step 5 — UI consequences (recommended)

| Tab | Contents | Rules |
| --- | --- | --- |
| **LIVE** | Category A + Category B only | Auto MARCO, Manual MARCO, Flexible MARCO (if applicable), plus campaigns where `bonusEndBlock > currentBlock` |
| **ENDED** | Category C | Finished campaigns; show “unstake” CTA; include user-staked finished pools via existing `/pools/history` + “Staked only” |
| **ARCHIVE** | Category D | `finishedPools` / `isFinished: true`; superseded contracts; no earn CTA |

**Never mix:**

- Do not show ended campaigns in Live because they remain in `livePools56` with `isFinished: false`  
- Do not hide Manual/Auto MARCO in Ended when campaigns end  
- Do not surface Archive pools in default Live sort  

**Chain switcher:** Users on Polygon/Base should see 3–4 Live pools today; users on BSC correctly see ~2. This is chain-state accurate, not a bug.

---

## Step 6 — Recommended implementation (future; not executed)

1. **Config hygiene:** Mark 162 ended BSC `livePools56` entries as `isFinished: true` or move to `finishedPools` to match on-chain truth (presentation/config only; no contract changes).  
2. **Metadata field:** Add `poolClass: 'permanent' | 'campaign' | 'deprecated'` to pool config for UI routing without inferring from `sousId`.  
3. **Permanent pool rule:** Document in config that only `sousId 0` + vault keys are permanent; all `sousId >= 1` partner pools are campaigns by default.  
4. **UI tabs:** Rename/clarify `/pools/history` as **Ended**; add **Archive** view for Category D.  
5. **Ops playbook:** New partner pool = new sousChef deployment + config add; renewal = on-chain `bonusEndBlock` extension + ops verification.  
6. **Do not:** Bulk re-enable 162 ended BSC pools in Live; invent pools; duplicate configs; modify contracts.

---

## Why the prior audit was “not enough”

The prior audit correctly identified the `bonusEndBlock` runtime filter but did not distinguish **permanent MARCO surfaces** from **accumulated partner campaigns**. This report closes that gap:

- **267 configured** ≠ **267 intended to be live today**  
- **~15 historical visible** ≈ **2–3 permanent + ~8–12 concurrent campaigns**  
- **~2 visible today on BSC** = permanent pools only, because **all BSC campaigns have ended**  

---

## Files touched by this mission

| File | Action |
| --- | --- |
| `docs/POOLS_CANONICAL_RECOVERY_REPORT.md` | Created (this report) |
| `docs/pools-canonical-inventory.json` | Created (machine-readable annex) |

**No application code, pool logic, contracts, or configs were modified.**

---

## Return code

`POOLS_CANONICAL_RECOVERY_READY`
