# Melega DEX Token Registry — Product V1

**Status:** Product blueprint  
**Version:** 1.0  
**Date:** 2026-06-26  
**Audience:** Product, design, founder success, civilization operators  
**Companion specs:** `MELEGA_DEX_TOKEN_REGISTRY_SPEC_V1.md` (technical), `MELEGA_DEX_ENTITY_MODEL_V1.md` (logical model)  
**Nature:** Complete product experience — **not** backend, **not** API

---

## SECTION 1 — Product Vision

### Why the Token Registry exists

Melega DEX is the economic execution layer of **Melega AI** and **Kiri Civilization**. Today, tokens appear as contract addresses in swap lists — anonymous, easy to impersonate, hard to reason about, impossible for agents to trust without scraping.

The **Token Registry** exists to change that.

It is the **human and machine front door** for every fungible asset that participates in Melega economic life. It answers three questions that a raw address cannot:

1. **What is this?** — Name, project, narrative, logo, links — bound to a real identity (UPI), not a spoofed ticker.
2. **How should I treat it?** — Risk tier, verification state, warnings, AI summary — honest, sourced, never hyped.
3. **What can I do with it?** — Tradable, poolable, farmable, lockable, campaign-eligible — a capability map, not a marketing page.

The Registry is **not** an endorsement shop. It does not say “safe” or “official.” It says: **here is what we know, here is what we checked, here is what you can do next — and here is what we do not know.**

For founders, the Registry is the path from **“I deployed a contract”** to **“my project is legible inside civilization.”**  
For traders, it is **informed choice** before every swap.  
For institutions, it is **audit-friendly discovery** without fabricated metrics.  
For agents, it is the **canonical read model** that makes Melega DEX machine-native.

**Product promise:** Every token in Melega DEX has a profile. Every profile links to a project. Every claim is labeled. Every fee is accounted. **Listed ≠ audited.**

---

## SECTION 2 — Target Users

### Founder

**Who:** Token deployer, protocol team, launch lead.  
**Job to be done:** Register my token, tell my story, pay the listing fee, pass verification, appear in discovery, unlock downstream capabilities (liquidity, farms, campaigns).  
**Success:** Token profile live, project linked, verification badge earned, Space profile connected, first liquidity/farm path clear.  
**Fears:** Paying a fee with no visibility; being confused with a scam clone; opaque rejection.

### Community

**Who:** Holders, moderators, Space participants, DAO members.  
**Job to be done:** Find the **real** project token, report impersonators, read risk and lock status, share a trustworthy profile link.  
**Success:** One canonical URL per token; Radar incidents visible; no “which contract is real?” confusion.  
**Fears:** Fake logos, duplicate tickers, hidden team wallets.

### Trader

**Who:** Retail and pro traders using swap, farms, pools.  
**Job to be done:** Discover tokens, assess risk quickly, swap with eyes open, avoid honeypots.  
**Success:** Risk visible before confirm; AI summary on demand; warnings that are clear not alarmist.  
**Fears:** Honeypots, tax tokens, impersonation, surprise illiquidity.

### Institution

**Who:** Funds, market makers, compliance desks, integrators.  
**Job to be done:** Bulk discovery, consistent metadata, exportable profiles, treasury fee transparency, no marketing fluff.  
**Success:** Machine-readable exports; `as_of` on every number; clear verification vs endorsement separation.  
**Fears:** Liability from implied endorsement; stale data presented as live.

### AI Agent

**Who:** MELEGA AI agents, Kiri operators, external bots, institutional automation.  
**Job to be done:** Resolve `token://` → full profile + risk + capabilities; reason; warn; never hallucinate trust.  
**Success:** Manifest discovery → registry fetch → structured reports → human-parity disclaimers in output.  
**Fears:** Ambiguous badges; merged “verified” and “safe”; missing `data_source`.

---

## SECTION 3 — Founder Journey

**From:** “I have a token.”  
**To:** “My token is fully integrated into Melega DEX.”

### Step 0 — Orientation

Founder lands on **Registry home** or **Launch → List your token** CTA.  
Sees: what listing includes, MARCO fee estimate, timeline (~minutes to hours for verification), and **“Listed ≠ audited”** upfront.  
Optional: **AI Launch Assistant** chat — “What do I need before I submit?”

### Step 1 — Connect wallet

Founder connects wallet on target chain (BSC first for MARCO fees).  
Product shows supported chains with clear “fee on BSC” note if paying cross-chain later.

### Step 2 — Paste contract address

Founder enters `chain + address`.  
Product **instantly reads on-chain** symbol, name, decimals, supply — displays preview card.  
If contract is not ERC-20 or has no code → friendly block with explanation, no fee charged.

### Step 3 — Project identity (UPI)

Founder must **link or create a Project**:

| Path | Experience |
|------|------------|
| **Existing project** | Search UPI slug or name → select → token attaches as new resource |
| **New project** | Short form: display name, slug, one-line description → draft UPI created |

Project card preview shows: “This token will appear under **[Project Name]**.”

### Step 4 — Metadata

Founder fills: short description, website, docs, socials, tags.  
**Live validation:** character limits, HTTPS, banned phrases (“guaranteed”, “100x”).  
**AI Suggestions:** improve description clarity, flag hype language, suggest missing links.  
**Completeness Score** updates in sidebar (see §8).

### Step 5 — Logo upload

Drag-and-drop square logo; instant crop preview.  
Validation feedback: size, format, similarity warning if near known scam asset.  
Logo approval ≠ token verification — copy explains both.

### Step 6 — Review & pay

Summary screen:

- On-chain facts (read-only)
- Project link
- Metadata
- Logo thumbnail
- **MARCO listing fee** with link to fee schedule
- Treasury disclosure: “Fee recorded on-chain; receipt in your dashboard”

Founder signs MARCO transfer → **payment confirmed** animation → status **Verification in progress**.

### Step 7 — Verification wait

Progress tracker with stages: Contract ✓ → Metadata ✓ → Risk scan → Logo ✓ → Decision.  
Founder can leave; email/Space notification on completion (optional).  
**AI Summary** draft visible when done.

### Step 8 — Outcome

| Result | Founder experience |
|--------|-------------------|
| **Listed** | Profile URL live; share button; “Next steps” checklist |
| **Listed with warnings** | Profile live with yellow banner; explain what failed soft checks |
| **Rejected** | Clear reasons + re-submit path; fee policy stated |

### Step 9 — Integration checklist (post-listing)

Product surfaces **“Complete your integration”** hub:

1. Add liquidity → `/add` deep link with token pre-filled  
2. Apply for farm (future) / view existing farms  
3. Connect Space profile  
4. Set up lock (Lock Center)  
5. Plan SmartDrop campaign  
6. Download **Machine Manifest** snippet for agents  

### Step 10 — Ongoing stewardship

Founder dashboard: submissions, fee receipts, verification refresh date, Radar incidents, edit metadata (re-verification), upgrade to **Premium profile** (§12).

**Emotional arc:** Anxiety → clarity → payment → wait → pride (or honest rejection) → guided growth.

---

## SECTION 4 — Trader Journey

### Discovery entry points

| Entry | Experience |
|-------|------------|
| **Registry browse** | `/registry/tokens` — search-first grid |
| **Swap token selector** | Registry-enriched rows for known tokens |
| **Project page (Space)** | Tokens tab → registry profiles |
| **Shared link** | `melega.finance/registry/tokens/{chain}/{address}` |
| **AI chat** | “Tell me about token X on BSC” → profile + risk summary |

### How traders discover tokens

1. **Search** by symbol, name, address, project name, tag.  
2. **Filters** — chain, risk tier, verification badge, has liquidity, has farm.  
3. **Sort** — recently verified, recently updated, AI suggested (not “trending volume” unless sourced).  
4. **Categories** — Ecosystem, DeFi, Gaming, Infrastructure (curated, not endorsement).

### How AI helps

| Moment | AI behavior |
|--------|---------------|
| Token detail page | **AI Summary** — neutral paragraph: what token is, project, liquidity note, risk headline |
| Before swap | **AI Warnings** — honeypot flags, tax, low liquidity, impersonation risk |
| Compare | Side-by-side two tokens — contract addresses prominent |
| Ask | Natural language Q&A grounded in registry + on-chain facts only |

AI never says “buy” or “safe.” It says “here is what we observe” and links evidence.

### How risk is shown

**Layered disclosure** (never collapsed into one icon):

1. **Trust badge** (§11) — verification state  
2. **Risk tier chip** — unknown / low / medium / high / critical  
3. **Dimension bars** — contract, liquidity, holders, metadata (sourced)  
4. **Radar incidents** — if any, with date  
5. **Static disclaimer** — Listed ≠ audited  

Color supports text; never color alone (D87).

### How warnings work

| Severity | Trader experience |
|----------|-------------------|
| **Info** | Blue/neutral banner on profile |
| **Caution** | Yellow banner; swap still allowed if token in wallet/import path |
| **Strong** | Orange modal on swap select: extra checkbox “I understand the risks” |
| **Critical** | Profile hidden from browse; import-by-address shows red block screen with facts |

Warnings cite **why** and **as_of**. Trader can expand **AI Report** for reasoning chain.

---

## SECTION 5 — Agent Journey

### Machine discovery

1. Agent fetches `/.well-known/melega-dex-manifest.json` or platform manifest.  
2. Locates registry schema URL and `GET /api/public/dex/tokens` (product-level: agents know **where** to look, not implementation here).  
3. Caches `token_id` URI namespace: `token://{chainId}/{address}`.

### Machine reasoning

Agent workflow:

```
resolve(token_ref)
  → fetch TokenRecord
  → fetch TokenRiskReport
  → fetch project_upi → Project summary
  → read capability flags (§7)
  → emit recommendation with verified_facts[] vs inferences[]
```

Agent **must** attach `disclaimer: Listed ≠ audited` to any user-facing output.

### Machine manifests

Each listed token profile exposes a **token-scoped manifest fragment**:

- Identity refs, schema version, capability matrix snapshot, last verification timestamp.  
- Agents use manifests to avoid re-querying full profile on every route quote.

### Agent personas (product-facing)

| Persona | Registry use |
|---------|--------------|
| Route Analyst | Token risk in route tradeoffs |
| Token Risk Analyst | Full risk dimensions |
| Project Verifier | UPI + metadata consistency |
| Treasury Fee Interpreter | Listing fee context for founders |

**Agent journey success:** Zero HTML scraping; one canonical profile per token; deterministic trust labels.

---

## SECTION 6 — Project Identity

### Binding to Universal Project Identity (UPI)

Every registry token profile displays:

- **Primary:** Project name (links to Project / Space page)  
- **Secondary:** Token symbol + chain badge  
- **Tertiary:** Contract address (copy, explorer link)

Submission **requires** UPI for new tokens. The wizard creates or links Project **before** metadata feels “real.”

### Why projects — not contracts — are primary identity

| Contract-centric world | Project-centric world (Melega) |
|------------------------|--------------------------------|
| Same team, multi-chain = fragmented | One UPI, many `token://` refs |
| Scam copies same ticker | UPI + verification disambiguates |
| Reputation lost on redeploy | Reputation lives on Project |
| Campaigns tied to address | SmartDrop / Radar / Space use UPI |
| Agents grep addresses | Agents resolve UPI graph |

**Product rule:** The **hero line** on a token page is `{Project Name} · {SYMBOL} on {Chain}` — never symbol alone.

**Founder benefit:** One dashboard for all chains.  
**Trader benefit:** “Is this the real Acme Protocol?” → check UPI, not just ticker.  
**Civilization benefit:** Economic memory accumulates on projects, not disposable contracts.

---

## SECTION 7 — Capability Matrix

Each token profile exposes a **capability grid** — what this token can do **inside Melega DEX today** vs **coming soon**.  
Capabilities are **observed or registered**, never invented.

### Tradable

| | |
|--|--|
| **Purpose** | Token can be swapped via Melega DEX routers |
| **Current status** | Shown if on legacy list or user-importable; registry does not auto-enable |
| **Future status** | Governance promotion from registry → extended swap list; smart-router graph node |

### Liquidity

| | |
|--|--|
| **Purpose** | LP pairs exist or can be created |
| **Current status** | Link to pairs with sourced depth; “Add liquidity” CTA |
| **Future status** | Depth thresholds, zap hints, routing priority badges |

### Farm

| | |
|--|--|
| **Purpose** | LP staking programs earn rewards |
| **Current status** | Show linked farms if live on-chain; APR only if sourced |
| **Future status** | Apply-for-farm flow from profile; stale farm warnings |

### Pool

| | |
|--|--|
| **Purpose** | Single-asset staking / vaults |
| **Current status** | Link to MARCO/partner pools if configured |
| **Future status** | Pool application + health score on profile |

### Lock

| | |
|--|--|
| **Purpose** | LP or token locks as trust signal |
| **Current status** | Link to Lock Center entries if verified on-chain |
| **Future status** | “No lock found” with founder CTA to create lock |

### Vesting

| | |
|--|--|
| **Purpose** | Team/investor unlock schedules |
| **Current status** | Display if indexed; else “Not disclosed” |
| **Future status** | Founder attestation + on-chain proof merge |

### SmartDrop

| | |
|--|--|
| **Purpose** | Incentive campaigns tied to token/UPI |
| **Current status** | Badge if active campaign; link to campaign rules |
| **Future status** | Eligibility preview for holders |

### Radar

| | |
|--|--|
| **Purpose** | Monitoring, incidents, impersonation flags |
| **Current status** | Incident timeline on profile if any |
| **Future status** | Subscribe to alerts; community report button |

### Space

| | |
|--|--|
| **Purpose** | Kiri community / project presence |
| **Current status** | Link if Space profile bound to UPI |
| **Future status** | Embedded Space feed on profile |

### Labs

| | |
|--|--|
| **Purpose** | Experimental analytics (non-production) |
| **Current status** | “Labs experimental” section if opted in |
| **Future status** | Founder-toggle experiments with clear labeling |

### AI Report

| | |
|--|--|
| **Purpose** | Structured reasoning artifacts |
| **Current status** | Latest summary + expandable report history |
| **Future status** | On-demand “Generate fresh analysis” (rate-limited) |

### Machine Manifest

| | |
|--|--|
| **Purpose** | Agent discovery fragment per token |
| **Current status** | JSON download / copy link |
| **Future status** | Signed manifests, version diff |

### Treasury Compatible

| | |
|--|--|
| **Purpose** | MARCO fee SKUs apply; fee history visible |
| **Current status** | Listing fee receipt on profile |
| **Future status** | Renewal, premium, campaign fee ledger |

**Visual:** Capability grid uses ✓ (live), ○ (available path), — (not applicable), clock (coming soon). No ✓ implies endorsement.

---

## SECTION 8 — AI Layer

### AI Verification

Automated pipeline after founder pays fee.  
**Product surface:** Progress steps, estimated time, notification on complete.  
**User sees:** Pass/fail per check with plain language (“Contract responds as ERC-20”, “Source code not verified on explorer”).  
**Not shown:** Black-box “AI approved.”

### AI Summary

Neutral 3–5 sentence overview on every listed token.  
Sections: **What it is · Project context · Liquidity note · Risk headline.**  
Labeled **“AI-generated summary”** with timestamp. Expand for sources.

### AI Risk

Structured **risk story** alongside tier chip:  
“Elevated holder concentration (top 10 hold 62%, source: indexer, as of DATE).”  
Traders drill into dimensions without reading JSON.

### AI Warnings

Context-triggered banners: swap select, profile visit, import by address.  
Short, actionable: **what · why · what we cannot verify.**  
Strong warnings require acknowledgment checkbox before trade.

### AI Suggestions

**For founders (submission):** metadata improvements, missing links, hype language rewrites.  
**For traders (browse):** “Tokens similar by project sector” — never “you might like this investment.”  
**For agents:** Completeness gaps as `suggested_actions[]`.

### AI Completeness Score

0–100 **profile completeness** for founders (not a quality/trust score).

| Factor | Weight |
|--------|--------|
| Logo uploaded | Medium |
| Description quality | Medium |
| Website + docs | Medium |
| Space linked | Low |
| Lock/vesting disclosed | Medium |
| Liquidity exists | Low (observed) |

**Display:** Progress ring on founder dashboard.  
**Copy:** “Completeness helps discovery; it does not mean verified or safe.”

---

## SECTION 9 — Visual Experience

### Design language

KIRI-aligned: black / `#0a0a0f` backgrounds, `#31d0aa` accent, subtle `rgba(255,255,255,0.12)` borders, Kanit typography.  
Calm, technical, no meme aesthetics on registry chrome.

### Desktop

- **Browse:** Left filters sidebar + main card grid (logo, symbol, project, badges).  
- **Detail:** Two-column — left: identity + capabilities; right: risk + AI summary + activity.  
- **Submit:** Centered wizard with sticky progress stepper.

### Tablet

- Filters collapse to drawer.  
- Capability grid 2 columns.  
- Swap overlay enrichment: bottom sheet.

### Mobile

- Single column; search pinned top.  
- Token cards full-width; 44px min touch targets.  
- Warnings: full-width banners; confirm modals full-screen.  
- Founder wizard: one step per screen.

### Dark mode

Default dark; registry always dark-first for consistency with Melega DEX shell.  
Badges tested for contrast WCAG AA.

### Accessibility

- Icon + text on every badge.  
- Screen reader labels for risk tier.  
- No red/green-only distinction for risk.  
- Keyboard navigation on browse and wizard.  
- `aria-live` on verification status updates.

---

## SECTION 10 — Discovery

### Search

Unified search bar: symbol, name, contract (full or prefix), project name, UPI slug.  
Instant results with chain badge + trust badge.  
Address search shows exact match first — fights impersonation.

### Filters

| Filter | Options |
|--------|---------|
| Chain | BSC, Base, Polygon, Ethereum |
| Trust | Verified, Observed, Unverified, Suspicious, Deprecated |
| Risk tier | unknown → critical |
| Has liquidity | Yes / No / Any |
| Has farm | Yes / No |
| Project linked | Yes / No |

### Categories

Curated tags: Ecosystem, DeFi, Gaming, Infrastructure, Meme (neutral label), Bridge asset.  
Categories are **navigation**, not approval.

### Sorting

| Sort key | Rule |
|----------|------|
| Recently verified | `verification_completed_at` desc |
| Recently updated | `updated_at` desc |
| Newly listed | `listed_at` desc |
| AI Suggested | Personalization off by default; opt-in “for my watchlist sector” |
| ~~Trending~~ | **Not in V1** unless volume sourced from indexer with `as_of` |

### Trending

**V1 policy:** No fabricated trending.  
**Future:** “Trending” tab only when `data_source: indexer` and methodology published.

### Recently verified

Homepage module: cards of tokens that completed verification in last 7 days.  
Headline: **“Recently verified”** — not “Hot” or “Top”.

### Recently updated

Metadata or risk refresh — transparency for returning users.

### AI Suggested

Optional module: “Explore tokens in [DeFi] with complete profiles” — completeness + sector, not price prediction.  
Dismissible; no dark patterns.

---

## SECTION 11 — Trust

Every badge has **exact product meaning**. No badge implies endorsement.

### Verified

| | |
|--|--|
| **Means** | Registry automated verification pipeline completed; no critical failures |
| **Does NOT mean** | Audited, safe, official, team KYC, investment approval |
| **Visual** | Checkmark in hex outline + “Registry verified” |
| **Tooltip** | “Automated checks only. Listed ≠ audited.” |

### Observed

| | |
|--|--|
| **Means** | Token known on-chain or legacy import; partial data; not through full verification |
| **Does NOT mean** | Recommended |
| **Visual** | Eye icon + “Observed” |
| **Tooltip** | “Indexed but not registry-verified.” |

### Unverified

| | |
|--|--|
| **Means** | Listed or draft; verification pending or not started |
| **Visual** | Neutral dash circle + “Unverified” |
| **Tooltip** | “Verification not complete.” |

### Suspicious

| | |
|--|--|
| **Means** | Radar incident, failed critical check, impersonation flag, or dispute |
| **Visual** | Warning triangle + “Suspicious” (amber, with text) |
| **Tooltip** | “Review incidents before interacting.” Link to detail. |

### Deprecated

| | |
|--|--|
| **Means** | Delisted, superseded by new contract, or project sunset |
| **Visual** | Muted card + “Deprecated” strikethrough on symbol |
| **Tooltip** | “Retained for history. Do not use for new trades.” Tombstone page. |

**Hierarchy:** Suspicious > Deprecated > Unverified > Observed > Verified for warning prominence.  
**Verified + high risk** can coexist — both badges show.

---

## SECTION 12 — Economic Layer

### MARCO fees

| Product moment | Fee |
|----------------|-----|
| Standard listing | `TOKEN_LIST_STANDARD` — shown before pay |
| Profile renewal (future) | Annual metadata refresh |
| Expedited review (future) | Optional queue priority |

Fee amount fetched live from fee schedule — UI shows MARCO equivalent and “recorded in Treasury.”

### Premium profile

**Future product tier:**

- Custom banner, video embed, extended links  
- Featured placement in **Recently verified** (labeled “Sponsored placement”, not endorsement)  
- Priority support channel  
- Still subject to risk tier and Radar

### Verification

Core listing includes one verification run.  
Re-verification after material metadata change — included or small MARCO fee per policy.

### Future services

| Service | Product hook |
|---------|--------------|
| Audit badge hosting | Third-party audit PDF link — separate attestation |
| Lock promotion | Highlight verified locks on profile |
| Campaign boost | SmartDrop co-marketing SKU |
| Institutional export | Compliance PDF pack |

### Treasury accounting

Founder **Fee history** tab: tx hash, SKU, amount MARCO, date, link to public treasury aggregate.  
Institutions see same data via export.  
**No hidden fees.** Failed submission fee policy stated at pay step.

---

## SECTION 13 — Machine Experience

How AI agents **consume the product** (experience, not endpoints):

### Discovery

Agent reads platform manifest → learns registry exists → stores capability expectations.

### Profile consumption

Agent requests token by `token_id` → receives profile optimized for machines:

- Flat fields for identity, UPI, tiers, badges  
- Nested `capabilities` object (§7)  
- Embedded `risk_report_ref`  
- `disclaimer` string mandatory

### Reasoning consumption

Agent fetches AI Report artifacts → separates `verified_facts` / `inferences` / `reasoning` → never flattens to human hype.

### Manifest consumption

Per-token manifest fragment for offline cache and civ-wide sync.

### Comparison consumption

Agent batch-fetches profiles for route legs → ranks by policy (risk ceiling, liquidity floor) → explains tradeoffs in `RouteRecommendation`.

### Founder automation

Agent assists founder **only** with signed messages — drafts metadata, suggests completeness actions, does not pay fees or submit without wallet.

### Observability consumption

Agent subscribes to registry events (listed, tier_changed, suspended) for watchlists and Radar sync.

**Machine experience principle:** If a human sees a badge, an agent sees the same enum — no parallel trust vocabulary.

---

## SECTION 14 — Future Evolution

Reserve product space for economic objects beyond vanilla ERC-20:

### RWA (Real-world assets)

Token profiles gain **attestation layer**: issuer, jurisdiction, custody, redemption rights.  
Separate trust track: **“RWA attested”** ≠ **“Registry verified”**.  
Capability matrix adds **Compliance export**, **NAV feed** (sourced).

### Institutional assets

Bulk onboarding, mTLS profiles, white-label registry embed, dedicated **Institution** sort filters.  
No retail hype modules on institutional views.

### AI-generated assets

Label **“AI-origin disclosure”** on profile if token metadata or supply rules tie to AI mint policy.  
Extra risk dimension; Labs-only scoring until governance promotes.

### Real-world credentials

Link physical credentials, audit certs, ISO docs — **credential objects** attached to UPI, not token address.  
Display as **Credentials** tab; verify hash on chain or signed PDF.

### Cross-chain identities

One UPI → many `token://` refs in capability grid **“Sister deployments”** view.  
Trader sees project once; switches chain tab.  
Agent resolves UPI → all chain tokens in one manifest.

**Product rule for all future types:** New asset classes **extend** the profile schema; they do not bypass trust badges or UPI.

---

## SECTION 15 — Product Doctrine

The Token Registry is designed around five product laws:

1. **Identity is project-first** — contracts are instances; civilization remembers projects.  
2. **Trust is labeled, not implied** — every badge defines what it does and does not mean.  
3. **AI informs, humans decide** — summaries, warnings, and suggestions never replace wallet consent.  
4. **Discovery without deception** — no fake trending, volume, or APR on registry surfaces.  
5. **One profile, two audiences** — humans get clarity; agents get schemas; both get the same truth.

---

### Closing statement

**The Token Registry is the canonical identity layer of every economic object inside Melega DEX.**

---

## Document lineage

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-06-26 | Initial product blueprint V1 |

**Related:** `MELEGA_DEX_TOKEN_REGISTRY_SPEC_V1.md`, `MELEGA_DEX_ENTITY_MODEL_V1.md`, `MELEGA_DEX_WP2_UX_SHELL_SPEC.md`

---

*Melega DEX Token Registry Product V1 — product blueprint for the AI-native token identity experience.*
