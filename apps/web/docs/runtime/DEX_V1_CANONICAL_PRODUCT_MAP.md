# DEX V1 — Canonical Product Map

**Mission:** `DEX_V1_GLOBAL_INFORMATION_ARCHITECTURE`  
**Certified base:** `PASSPORT_V1_CERTIFIED` @ `70d2bd19`  
**Branch:** `dex-v1-global-information-architecture`

Principle: every capability has exactly one canonical operational owner. Pages may summarize and deep-link; they must not duplicate another surface’s operational experience.

Visible navigation labels are not renamed in this mission. The product domains below map onto the existing chrome:

| Product domain | Visible nav / entry | Canonical route(s) |
| --- | --- | --- |
| Discover | Home (projects focus), Project Pages | `/?focus=projects`, `/@{slug}` |
| Trade | Home Instant Swap | `/?focus=swap` (alias `/swap`, redirect `/trade`) |
| Build | List | `/list` (+ `?intent=…`) |
| Liquidity | Liquidity | `/liquidity-studio` (+ `?view=…`) |
| Earn | Farms · Pools | `/farms`, `/pools` |
| Passport | Passport | `/passport` |

---

## GLOBAL DESTINATIONS

| Destination | Canonical URL | Notes |
| --- | --- | --- |
| Home | `/` | Default Discover + Trade composition |
| Discover (home) | `/?focus=projects` | `/projects` temporary redirect |
| Trade (home) | `/?focus=swap` | `/trade` temporary redirect |
| List / Build | `/list` | Token/project onboarding workspace |
| Liquidity | `/liquidity-studio` | Unified Liquidity Studio |
| Farms | `/farms` | Earn |
| Pools | `/pools` | Earn |
| Passport | `/passport` | MARCO Passport |
| Trending | `/trending` | Secondary (More / search) |
| DEX Intelligence | `/radar` | Secondary |

---

## CONTEXTUAL DESTINATIONS

| Destination | Canonical URL | Parent domain |
| --- | --- | --- |
| Project Page | `/@{slug}` (rewrite → `/project-hq/:slug`) | Discover |
| Liquidity positions | `/liquidity-studio?view=positions` | Liquidity |
| Add Liquidity | `/liquidity-studio?view=add` | Liquidity |
| Remove Liquidity | `/liquidity-studio?view=remove` | Liquidity |
| Liquidity Building | `/liquidity-studio?view=building` | Liquidity |
| Passport project create | `/list?intent=create-project` | Build (from Passport) |
| Passport position manage | `/liquidity-studio?view=positions&position=…` | Liquidity |
| Passport LB program | `/liquidity-studio?view=building&program=…` | Liquidity |

---

## OPERATIONAL OWNERS

| Capability | Sole operational owner | Must not own |
| --- | --- | --- |
| Swap execution | Trade (Home Instant Swap / `/swap`) | Passport, Project Page (deep-link only) |
| Token import | List (`intent=import-token`) | Project Page |
| Token create | List (`intent=create-token`) | Project Page, Passport |
| Project Page create / claim | List (`intent=create-project` / `claim-project`) | Passport (CTA → List only) |
| Project presentation | Project Page `/@{slug}` | List, Passport |
| Add / manage liquidity | Liquidity Studio | Passport, Project Page |
| Liquidity Building programs | Liquidity Studio `view=building` | List, Passport |
| Identity / ecosystem relationship | MARCO Passport `/passport` | — |
| Project discovery directory | Home Discover focus | — |
| Yield participation | Farms / Pools | Passport (deep-link only) |

---

## ALIASES (compatibility)

| Alias | Resolves to | Kind |
| --- | --- | --- |
| `/trade` | `/?focus=swap` | Temporary redirect |
| `/projects` | `/?focus=projects` | Temporary redirect |
| `/projects/:slug` | `/@:slug` | Permanent redirect |
| `/send` | `/swap` | Permanent redirect |
| `/pool` | `/liquidity` | Permanent redirect (legacy page; nav → Liquidity) |
| `/staking`, `/syrup` | `/pools` | Permanent redirect |
| `/command-center`, `/portfolio`, `/workspace` | Soft Passport aliases (Passport nav active) | Soft |
| `/import-existing-token`, `/launch`, `/new-project` | List domain (List nav active) | Soft / legacy pages |

---

## NAVIGATION ACTIVE-STATE RULES

1. Exactly one primary header item active.
2. Project Pages (`/project-hq/*`) activate **Home** (Discover parent).
3. `/swap` activates **Home** (Trade parent).
4. Liquidity Building and all `?view=` states activate **Liquidity**.
5. Leaving Passport for Project Page / Liquidity Studio clears Passport active state.
6. Mobile bottom rail agrees with header parent domains (List remains header-primary; not in bottom rail by design).
