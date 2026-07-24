/**
 * LIQUIDITY_MODULE_007 — visual polish only.
 * Scoped to [data-liquidity-one-page]. Does not alter width/height/padding/layout.
 */
import { createGlobalStyle } from 'styled-components'
import { liqOne } from './onePageTokens'

/** Shared premium card surface (color/shadow only). */
export const liqOneCardSurface = `
  background-color: ${liqOne.card};
  background-image:
    radial-gradient(circle at 88% 10%, rgba(255, 255, 255, 0.045) 0%, transparent 42%),
    radial-gradient(circle at 12% 92%, rgba(0, 0, 0, 0.055) 0%, transparent 48%);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
`

export const LiquidityOnePagePolishStyle = createGlobalStyle`
  [data-liquidity-one-page] {
    --liq-polish-ease: ease;
    --liq-polish-ms: 120ms;
  }

  /* Premium layered surfaces — no size changes */
  [data-liquidity-one-page] [data-testid='liq-one-building-card'],
  [data-liquidity-one-page] [data-testid='liq-one-add-card'],
  [data-liquidity-one-page] [data-testid='liq-one-dex-snapshot'],
  [data-liquidity-one-page] [data-testid='liq-one-overview'],
  [data-liquidity-one-page] [data-testid='liq-positions-shell'],
  [data-liquidity-one-page] [data-testid='liq-one-education'] {
    background-color: ${liqOne.card} !important;
    background-image:
      radial-gradient(circle at 88% 10%, rgba(255, 255, 255, 0.045) 0%, transparent 42%),
      radial-gradient(circle at 12% 92%, rgba(0, 0, 0, 0.055) 0%, transparent 48%) !important;
    box-shadow:
      0 16px 40px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  /* Soft outer border (1px preserved) — gold reserved for CTA / active / KPI */
  [data-liquidity-one-page] [data-testid='liq-one-building-card'],
  [data-liquidity-one-page] [data-testid='liq-one-add-card'],
  [data-liquidity-one-page] [data-testid='liq-one-dex-snapshot'],
  [data-liquidity-one-page] [data-testid='liq-one-overview'],
  [data-liquidity-one-page] [data-testid='liq-positions-shell'],
  [data-liquidity-one-page] [data-testid='liq-one-education'] {
    border-color: rgba(255, 255, 255, 0.05) !important;
  }

  /* Nested elevated cells — depth without size change */
  [data-liquidity-one-page] [data-testid^='liq-overview-col-'],
  [data-liquidity-one-page] [data-testid^='liq-snap-kpi-'] {
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  /* Buttons / CTAs — hover, active, focus only */
  [data-liquidity-one-page] button {
    transition:
      opacity var(--liq-polish-ms) var(--liq-polish-ease),
      transform var(--liq-polish-ms) var(--liq-polish-ease),
      background-color var(--liq-polish-ms) var(--liq-polish-ease),
      border-color var(--liq-polish-ms) var(--liq-polish-ease),
      color var(--liq-polish-ms) var(--liq-polish-ease),
      box-shadow var(--liq-polish-ms) var(--liq-polish-ease);
  }

  [data-liquidity-one-page] button:hover:not(:disabled) {
    opacity: 0.96;
  }

  [data-liquidity-one-page] button:active:not(:disabled) {
    transform: translateY(0.5px);
    opacity: 0.92;
  }

  [data-liquidity-one-page] button:focus-visible {
    outline: 1px solid rgba(201, 168, 74, 0.55);
    outline-offset: 2px;
  }

  /* Primary gold CTAs — restrained gold, sharper interaction */
  [data-liquidity-one-page] [data-ls-primary-btn],
  [data-liquidity-one-page] [data-testid='liq-add-cta'],
  [data-liquidity-one-page] [data-testid='liq-positions-empty-add'] {
    background-color: ${liqOne.gold} !important;
    color: #111 !important;
  }

  [data-liquidity-one-page] [data-ls-primary-btn]:hover:not(:disabled),
  [data-liquidity-one-page] [data-testid='liq-add-cta']:hover:not(:disabled),
  [data-liquidity-one-page] [data-testid='liq-positions-empty-add']:hover:not(:disabled) {
    background-color: ${liqOne.goldHover} !important;
  }

  /* Inputs — depth + focus ring, no geometry */
  [data-liquidity-one-page] input,
  [data-liquidity-one-page] select,
  [data-liquidity-one-page] textarea {
    transition:
      border-color var(--liq-polish-ms) var(--liq-polish-ease),
      box-shadow var(--liq-polish-ms) var(--liq-polish-ease),
      background-color var(--liq-polish-ms) var(--liq-polish-ease);
  }

  [data-liquidity-one-page] input:not([type='checkbox']):not([type='radio']),
  [data-liquidity-one-page] select,
  [data-liquidity-one-page] textarea {
    background-color: rgba(18, 18, 18, 0.92);
  }

  [data-liquidity-one-page] input:focus-visible,
  [data-liquidity-one-page] select:focus-visible,
  [data-liquidity-one-page] textarea:focus-visible {
    outline: none;
    box-shadow: 0 0 0 1px rgba(201, 168, 74, 0.45);
    border-color: rgba(201, 168, 74, 0.4);
  }

  /* Positions table — subtle row hover, no zebra */
  [data-liquidity-one-page] [data-testid='liq-positions-table'] [data-pixel-pos-row='68'] {
    transition: background-color var(--liq-polish-ms) var(--liq-polish-ease);
  }

  [data-liquidity-one-page] [data-testid='liq-positions-table'] [data-pixel-pos-row='68']:hover {
    background-color: rgba(255, 255, 255, 0.025);
  }

  /* Donut antialiasing / crisp edges */
  [data-liquidity-one-page] [data-testid='liq-snap-donut'],
  [data-liquidity-one-page] [data-testid='liq-overview-donut'] {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transform: translateZ(0);
    will-change: transform;
  }

  /* Icons — optical alignment (no box resize) */
  [data-liquidity-one-page] svg {
    display: block;
    shape-rendering: geometricPrecision;
    transform: translateZ(0);
  }

  [data-liquidity-one-page] button svg {
    flex-shrink: 0;
  }

  /* Thin dark rounded scrollbar (desktop) */
  @media (min-width: 900px) {
    [data-liquidity-one-page] * {
      scrollbar-width: thin;
      scrollbar-color: #2a2a2a transparent;
    }

    [data-liquidity-one-page] *::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    [data-liquidity-one-page] *::-webkit-scrollbar-track {
      background: transparent;
    }

    [data-liquidity-one-page] *::-webkit-scrollbar-thumb {
      background: #2a2a2a;
      border-radius: 999px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }

    [data-liquidity-one-page] *::-webkit-scrollbar-thumb:hover {
      background: #3a3a3a;
      background-clip: padding-box;
    }
  }
`

export default LiquidityOnePagePolishStyle
