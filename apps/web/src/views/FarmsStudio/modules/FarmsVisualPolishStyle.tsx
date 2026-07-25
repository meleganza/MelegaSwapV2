/**
 * FARMS_MODULE_008 — Final Visual Polish style layer.
 * Scoped to [data-farms-studio-screen].
 * Does NOT alter width / height / padding / margin / grid / module geometry.
 * Parity target: Liquidity / Pools / Passport / List premium surfaces.
 */

import { createGlobalStyle } from 'styled-components'
import { farmsVisualPolish } from './farmsVisualPolishTokens'

const S = farmsVisualPolish.scope
const ms = farmsVisualPolish.transitionMs
const ease = farmsVisualPolish.transitionEase

export const FarmsVisualPolishStyle = createGlobalStyle`
  ${S} {
    --farms-polish-ease: ${ease};
    --farms-polish-ms: ${ms};
    --farms-polish-gold: ${farmsVisualPolish.gold};
    color-scheme: dark;
  }

  /* Premium layered surfaces — color / shadow only (no size) */
  ${S} [data-testid='farms-hero-module'],
  ${S} [data-testid='farms-hero-trust'],
  ${S} [data-testid='farms-my-farms-surface'],
  ${S} [data-testid='farms-my-farm-card'],
  ${S} [data-testid='farms-explore-card'],
  ${S} [data-testid='farms-finished-card'],
  ${S} [data-testid='farms-advisor-card'],
  ${S} [data-testid='farms-analytics-panel'],
  ${S} [data-testid='farms-yield-advisor-module'],
  ${S} [data-testid^='farms-kpi-'] {
    background-image:
      radial-gradient(circle at 88% 10%, rgba(255, 255, 255, 0.04) 0%, transparent 42%),
      radial-gradient(circle at 12% 92%, rgba(0, 0, 0, 0.05) 0%, transparent 48%);
    box-shadow: ${farmsVisualPolish.cardShadow};
  }

  ${S} [data-testid='farms-my-farm-card'],
  ${S} [data-testid='farms-explore-card'],
  ${S} [data-testid='farms-finished-card'],
  ${S} [data-testid='farms-advisor-card'],
  ${S} [data-testid='farms-analytics-panel'],
  ${S} [data-testid^='farms-kpi-'],
  ${S} [data-testid='farms-hero-trust'],
  ${S} [data-testid='farms-my-farms-surface'] {
    border-color: ${farmsVisualPolish.borderSoft} !important;
    transition:
      border-color var(--farms-polish-ms) var(--farms-polish-ease),
      box-shadow var(--farms-polish-ms) var(--farms-polish-ease),
      background-color var(--farms-polish-ms) var(--farms-polish-ease);
  }

  ${S} [data-testid='farms-my-farm-card']:hover,
  ${S} [data-testid='farms-explore-card']:hover,
  ${S} [data-testid='farms-finished-card']:hover,
  ${S} [data-testid='farms-advisor-card']:hover,
  ${S} [data-testid='farms-analytics-panel']:hover,
  ${S} [data-testid^='farms-kpi-']:hover {
    border-color: ${farmsVisualPolish.borderHover} !important;
  }

  /* Buttons — hover / pressed / focus only */
  ${S} button {
    transition:
      opacity var(--farms-polish-ms) var(--farms-polish-ease),
      transform var(--farms-polish-ms) var(--farms-polish-ease),
      background-color var(--farms-polish-ms) var(--farms-polish-ease),
      border-color var(--farms-polish-ms) var(--farms-polish-ease),
      color var(--farms-polish-ms) var(--farms-polish-ease),
      box-shadow var(--farms-polish-ms) var(--farms-polish-ease);
  }

  ${S} button:hover:not(:disabled) {
    opacity: 0.96;
  }

  ${S} button:active:not(:disabled) {
    transform: translateY(0.5px);
    opacity: 0.92;
  }

  ${S} button:disabled {
    opacity: 0.45;
  }

  ${S} button:focus-visible,
  ${S} a:focus-visible,
  ${S} [role='button']:focus-visible,
  ${S} input:focus-visible,
  ${S} select:focus-visible,
  ${S} textarea:focus-visible {
    outline: ${farmsVisualPolish.focusOutline};
    outline-offset: ${farmsVisualPolish.focusOffset};
  }

  ${S} input:not([type='checkbox']):not([type='radio']),
  ${S} select,
  ${S} textarea {
    transition:
      border-color var(--farms-polish-ms) var(--farms-polish-ease),
      box-shadow var(--farms-polish-ms) var(--farms-polish-ease),
      background-color var(--farms-polish-ms) var(--farms-polish-ease);
  }

  ${S} input:focus-visible,
  ${S} select:focus-visible,
  ${S} textarea:focus-visible {
    box-shadow: 0 0 0 1px ${farmsVisualPolish.goldFocusSoft};
    border-color: rgba(201, 168, 74, 0.4);
  }

  /* Status badge contrast (meaning unchanged — text remains visible) */
  ${S} [data-position-status='ACTIVE'],
  ${S} [data-position-status='EMERGENCY'],
  ${S} [data-position-status='WITHDRAW_ONLY'],
  ${S} [data-position-status='PARTIAL'],
  ${S} [data-position-status='UNAVAILABLE'],
  ${S} [data-position-status='ENDED'] {
    letter-spacing: 0.01em;
  }

  /* Skeleton polish — softer pulse, no layout change */
  ${S} [data-testid$='-skeleton'],
  ${S} [data-testid*='skeleton'] {
    background-color: rgba(255, 255, 255, 0.045) !important;
    border-color: ${farmsVisualPolish.borderSoft} !important;
  }

  /* Icons — optical crispness (no box resize) */
  ${S} svg {
    display: block;
    shape-rendering: geometricPrecision;
    transform: translateZ(0);
  }

  ${S} button svg {
    flex-shrink: 0;
  }

  /* Empty / unavailable / disconnected copy contrast */
  ${S} [data-testid$='-empty'],
  ${S} [data-testid$='-unavailable'],
  ${S} [data-testid$='-disconnected'] {
    color: rgba(245, 245, 245, 0.92);
  }

  /* Reduced motion — kill polish transitions / live pulses inside studio */
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

export default FarmsVisualPolishStyle
