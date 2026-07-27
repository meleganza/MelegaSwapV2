/**
 * LIQUIDITY_MODULE_008 — Final Visual Polish style layer.
 * Scoped to [data-liquidity-studio-screen].
 * Does NOT alter width / height / padding / margin / grid / module geometry.
 * Parity target: Pools V1 / Farms V1 / Smart Swap premium surfaces.
 */

import { createGlobalStyle } from 'styled-components'
import { liquidityVisualPolish } from './liquidityVisualPolishTokens'

const S = liquidityVisualPolish.scope
const ms = liquidityVisualPolish.transitionMs
const ease = liquidityVisualPolish.transitionEase

export const LiquidityVisualPolishStyle = createGlobalStyle`
  ${S} {
    --liquidity-polish-ease: ${ease};
    --liquidity-polish-ms: ${ms};
    --liquidity-polish-gold: ${liquidityVisualPolish.gold};
    color-scheme: dark;
  }

  /* Premium layered surfaces — color / shadow / radius only (no size) */
  ${S} [data-testid='liquidity-hero-module'],
  ${S} [data-testid='liquidity-hero-trust'],
  ${S} [data-testid='liquidity-actions-manual'],
  ${S} [data-testid='liquidity-actions-ai'],
  ${S} [data-testid='liquidity-pool-discovery-card'],
  ${S} [data-testid='liquidity-add-form-panel'],
  ${S} [data-testid='liquidity-add-preview-panel'],
  ${S} [data-testid^='liquidity-snapshot-card-'],
  ${S} [data-testid='liquidity-my-positions-card'],
  ${S} [data-testid='liquidity-my-positions-reserved'],
  ${S} [data-testid^='liquidity-analytics-card-'] {
    background-image:
      radial-gradient(circle at 88% 10%, rgba(255, 255, 255, 0.04) 0%, transparent 42%),
      radial-gradient(circle at 12% 92%, rgba(0, 0, 0, 0.05) 0%, transparent 48%);
    box-shadow: ${liquidityVisualPolish.cardShadow};
    border-radius: ${liquidityVisualPolish.cardRadius};
  }

  ${S} [data-testid='liquidity-actions-manual'],
  ${S} [data-testid='liquidity-actions-ai'],
  ${S} [data-testid='liquidity-pool-discovery-card'],
  ${S} [data-testid='liquidity-add-form-panel'],
  ${S} [data-testid='liquidity-add-preview-panel'],
  ${S} [data-testid^='liquidity-snapshot-card-'],
  ${S} [data-testid='liquidity-my-positions-card'],
  ${S} [data-testid='liquidity-my-positions-reserved'],
  ${S} [data-testid^='liquidity-analytics-card-'],
  ${S} [data-testid='liquidity-hero-trust'] {
    border-color: ${liquidityVisualPolish.borderSoft} !important;
    transition:
      border-color var(--liquidity-polish-ms) var(--liquidity-polish-ease),
      box-shadow var(--liquidity-polish-ms) var(--liquidity-polish-ease),
      background-color var(--liquidity-polish-ms) var(--liquidity-polish-ease);
  }

  ${S} [data-testid='liquidity-actions-manual']:hover,
  ${S} [data-testid='liquidity-actions-ai']:hover,
  ${S} [data-testid='liquidity-pool-discovery-card']:hover,
  ${S} [data-testid^='liquidity-snapshot-card-']:hover,
  ${S} [data-testid='liquidity-my-positions-card']:hover,
  ${S} [data-testid^='liquidity-analytics-card-']:hover {
    border-color: ${liquidityVisualPolish.borderHover} !important;
  }

  /* Buttons — hover / pressed / focus / disabled only (no new actions) */
  ${S} button,
  ${S} a[data-testid*='-cta'],
  ${S} a[data-testid*='-explore'] {
    transition:
      opacity var(--liquidity-polish-ms) var(--liquidity-polish-ease),
      transform var(--liquidity-polish-ms) var(--liquidity-polish-ease),
      background-color var(--liquidity-polish-ms) var(--liquidity-polish-ease),
      border-color var(--liquidity-polish-ms) var(--liquidity-polish-ease),
      color var(--liquidity-polish-ms) var(--liquidity-polish-ease),
      box-shadow var(--liquidity-polish-ms) var(--liquidity-polish-ease);
  }

  ${S} button:hover:not(:disabled),
  ${S} a[data-testid*='-cta']:hover,
  ${S} a[data-testid*='-explore']:hover {
    opacity: 0.96;
  }

  ${S} button:active:not(:disabled),
  ${S} a[data-testid*='-cta']:active,
  ${S} a[data-testid*='-explore']:active {
    transform: translateY(0.5px);
    opacity: 0.92;
  }

  ${S} button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  ${S} button:focus-visible,
  ${S} a:focus-visible,
  ${S} [role='button']:focus-visible,
  ${S} input:focus-visible,
  ${S} select:focus-visible,
  ${S} textarea:focus-visible {
    outline: ${liquidityVisualPolish.focusOutline};
    outline-offset: ${liquidityVisualPolish.focusOffset};
  }

  ${S} input:not([type='checkbox']):not([type='radio']),
  ${S} select,
  ${S} textarea {
    transition:
      border-color var(--liquidity-polish-ms) var(--liquidity-polish-ease),
      box-shadow var(--liquidity-polish-ms) var(--liquidity-polish-ease),
      background-color var(--liquidity-polish-ms) var(--liquidity-polish-ease);
  }

  ${S} input:focus-visible,
  ${S} select:focus-visible,
  ${S} textarea:focus-visible {
    box-shadow: 0 0 0 1px ${liquidityVisualPolish.goldFocusSoft};
    border-color: rgba(201, 168, 74, 0.4);
  }

  /* Status badge contrast (meaning unchanged) */
  ${S} [data-position-status='ACTIVE'],
  ${S} [data-position-status='PARTIAL'],
  ${S} [data-position-status='UNAVAILABLE'],
  ${S} [data-testid='liquidity-pool-discovery-status'],
  ${S} [data-testid='liquidity-my-positions-status'] {
    letter-spacing: 0.01em;
  }

  /* Skeleton polish — softer pulse, no layout change */
  ${S} [data-testid$='-skeleton'],
  ${S} [data-testid*='skeleton'] {
    background-color: rgba(255, 255, 255, 0.045) !important;
    border-color: ${liquidityVisualPolish.borderSoft} !important;
  }

  /* Icons / token avatars — optical crispness (no box resize) */
  ${S} svg {
    display: block;
    shape-rendering: geometricPrecision;
    transform: translateZ(0);
  }

  ${S} button svg {
    flex-shrink: 0;
  }

  ${S} img {
    image-rendering: -webkit-optimize-contrast;
  }

  /* Empty / unavailable / disconnected copy contrast */
  ${S} [data-testid$='-empty'],
  ${S} [data-testid$='-unavailable'],
  ${S} [data-testid$='-disconnected'] {
    color: rgba(245, 245, 245, 0.92);
  }

  /* Reduced motion — kill polish transitions / live pulses */
  @media (prefers-reduced-motion: reduce) {
    ${S} *,
    ${S} *::before,
    ${S} *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Thin dark scrollbar (desktop) — chrome only */
  @media (min-width: 900px) {
    ${S} * {
      scrollbar-width: thin;
      scrollbar-color: #2a2a2a transparent;
    }

    ${S} *::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ${S} *::-webkit-scrollbar-track {
      background: transparent;
    }

    ${S} *::-webkit-scrollbar-thumb {
      background: #2a2a2a;
      border-radius: 999px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }

    ${S} *::-webkit-scrollbar-thumb:hover {
      background: #3a3a3a;
      background-clip: padding-box;
    }
  }
`

export default LiquidityVisualPolishStyle
