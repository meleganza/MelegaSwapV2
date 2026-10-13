# Melega DEX Next Gen — Premium UX system

Mission: `MELEGA-DEX-NEXT-GEN-PREMIUM-UX-001`

## Product principles

1. **One clear action per surface.** Trade is the dominant action; Earn, Portfolio, and Explore provide a quiet next step.
2. **Facts before decoration.** APY, TVL, balances, routes, gas, and price impact are shown only when the product has a factual source.
3. **Progressive disclosure.** Advanced tools, quote details, and address reads appear only after explicit user intent.
4. **Protected by default.** Read-only state, beta status, and the separation from the live DEX remain visible without becoming visual noise.
5. **Mobile is a first-class financial surface.** Four persistent destinations, 48px+ targets, no nested scrolling, no horizontal overflow.

## Visual language

- **Graphite** `#171816`: navigation, primary actions, high-confidence text.
- **Pearl** `#f8f6f1`: primary application sheet.
- **Stone canvas** `#e8e5de`: calm workspace background.
- **Melega gold** `#f0c52f`: brand mark, active state, and a single high-salience cue.
- **Muted ink** `#66645e`: explanatory copy that still clears WCAG AA against pearl.
- **Verified green** `#20784d`: factual safeguard and protected-state indicators only.

The system avoids decorative gradients, glass effects beyond navigation backdrop clarity, oversized hero areas, and competing colored calls to action.

## Typography and spacing

- System sans stack to avoid a blocking font request.
- Headings use tight tracking and restrained weight; body copy stays at readable line lengths.
- 4/8px rhythm with 12, 16, 20, 28px radii based on component hierarchy.
- Dense information is grouped by meaning rather than boxed into many cards.

## Component hierarchy

- `BetaShell`: responsive product frame, primary navigation, protected-state context, and production separation.
- `PremiumExperience`: visual-only composition for Trade, Bridge, Earn, Portfolio, and Explore.
- `NonOperational`: one consistent preview-state header.
- `AppIcon`: seven small inline SVG symbols; no icon dependency or font download.
- `QuoteGate` and `PortfolioGate`: existing functional boundaries preserved and visually integrated.

## Navigation

Primary: **Trade · Earn · Portfolio · Explore**.

Secondary: **Advanced Console**.

Trade contains Swap and MARCO Bridge. On desktop, the hierarchy is persistent in a graphite rail. Below 960px it becomes a four-item bottom bar designed for thumb reach.

## Interaction rules

- Minimum interactive height: 48px; primary controls use 52px.
- Keyboard focus is a visible three-pixel Melega-gold ring.
- Reduced-motion preference removes transition duration.
- Disabled execution remains visually explicit; no control implies a transaction can be sent.
- Loading and lookup states reuse existing functional behavior without adding polling or automatic RPC calls.

## Benchmark synthesis

- Uniswap: compact trade-first hierarchy and short primary navigation.
- PancakeSwap and Raydium: clear input/output fields and advanced details below the main decision.
- Aave and Morpho: factual data columns, explicit empty states, and restrained metric density.
- SuperEarn: plain-language opportunity framing, used here without promotional or unverifiable yield claims.

No proprietary branding, assets, or layouts were copied.
