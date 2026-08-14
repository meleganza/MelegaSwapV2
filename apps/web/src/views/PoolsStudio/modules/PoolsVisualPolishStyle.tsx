/**
 * POOLS_MODULE_008 — Final Visual Polish style layer.
 * Scoped to [data-pools-studio-screen].
 * Does NOT alter width / height / padding / margin / grid / module geometry.
 * Parity target: Liquidity / Passport / List premium surfaces.
 */

import { createGlobalStyle } from 'styled-components'
import { poolsVisualPolish } from './poolsVisualPolishTokens'

const S = poolsVisualPolish.scope
const ms = poolsVisualPolish.transitionMs
const ease = poolsVisualPolish.transitionEase

export const PoolsVisualPolishStyle = createGlobalStyle`
  ${S} {
    --pools-polish-ease: ${ease};
    --pools-polish-ms: ${ms};
    --pools-polish-gold: ${poolsVisualPolish.gold};
    color-scheme: dark;
  }

  /* Premium layered surfaces — color / shadow only (no size) */
  ${S} [data-testid='pools-hero-module'],
  ${S} [data-testid='pools-overview-kpis-module'] [data-testid^='pools-kpi-'],
  ${S} [data-testid='pools-my-position-card'],
  ${S} [data-testid='pools-explore-card'],
  ${S} [data-testid='pools-finished-card'],
  ${S} [data-testid='pools-advisor-card'],
  ${S} [data-testid='pools-analytics-panel'],
  ${S} [data-testid='pools-reward-advisor-module'],
  ${S} [data-testid='pools-hero-trust'] {
    background-image:
      radial-gradient(circle at 88% 10%, rgba(255, 255, 255, 0.045) 0%, transparent 42%),
      radial-gradient(circle at 12% 92%, rgba(0, 0, 0, 0.055) 0%, transparent 48%);
    box-shadow: ${poolsVisualPolish.cardShadow};
  }

  ${S} [data-testid='pools-my-position-card'],
  ${S} [data-testid='pools-explore-card'],
  ${S} [data-testid='pools-finished-card'],
  ${S} [data-testid='pools-advisor-card'],
  ${S} [data-testid='pools-analytics-panel'],
  ${S} [data-testid^='pools-kpi-'],
  ${S} [data-testid='pools-hero-trust'] {
    border-color: ${poolsVisualPolish.borderSoft} !important;
    transition:
      border-color var(--pools-polish-ms) var(--pools-polish-ease),
      box-shadow var(--pools-polish-ms) var(--pools-polish-ease),
      background-color var(--pools-polish-ms) var(--pools-polish-ease);
  }

  ${S} [data-testid='pools-my-position-card']:hover,
  ${S} [data-testid='pools-explore-card']:hover,
  ${S} [data-testid='pools-finished-card']:hover,
  ${S} [data-testid='pools-advisor-card']:hover,
  ${S} [data-testid='pools-analytics-panel']:hover,
  ${S} [data-testid^='pools-kpi-']:hover {
    border-color: ${poolsVisualPolish.borderHover} !important;
  }

  /* Buttons — hover / pressed / focus only */
  ${S} button {
    transition:
      opacity var(--pools-polish-ms) var(--pools-polish-ease),
      transform var(--pools-polish-ms) var(--pools-polish-ease),
      background-color var(--pools-polish-ms) var(--pools-polish-ease),
      border-color var(--pools-polish-ms) var(--pools-polish-ease),
      color var(--pools-polish-ms) var(--pools-polish-ease),
      box-shadow var(--pools-polish-ms) var(--pools-polish-ease);
  }

  ${S} button:hover:not(:disabled) {
    opacity: 0.96;
  }

  ${S} button:active:not(:disabled) {
    transform: translateY(0.5px);
    opacity: 0.92;
  }

  ${S} button:focus-visible,
  ${S} a:focus-visible,
  ${S} [role='button']:focus-visible,
  ${S} input:focus-visible,
  ${S} select:focus-visible,
  ${S} textarea:focus-visible {
    outline: ${poolsVisualPolish.focusOutline};
    outline-offset: ${poolsVisualPolish.focusOffset};
  }

  ${S} input:not([type='checkbox']):not([type='radio']),
  ${S} select,
  ${S} textarea {
    transition:
      border-color var(--pools-polish-ms) var(--pools-polish-ease),
      box-shadow var(--pools-polish-ms) var(--pools-polish-ease),
      background-color var(--pools-polish-ms) var(--pools-polish-ease);
  }

  ${S} input:focus-visible,
  ${S} select:focus-visible,
  ${S} textarea:focus-visible {
    box-shadow: 0 0 0 1px ${poolsVisualPolish.goldFocusSoft};
    border-color: rgba(201, 168, 74, 0.4);
  }

  /* Skeleton polish — softer pulse, no layout change */
  ${S} [data-testid$='-skeleton'],
  ${S} [data-testid*='skeleton'] {
    background-color: rgba(255, 255, 255, 0.045) !important;
    border-color: ${poolsVisualPolish.borderSoft} !important;
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

  /* Empty / unavailable copy contrast */
  ${S} [data-testid$='-empty'],
  ${S} [data-testid$='-unavailable'],
  ${S} [data-testid$='-disconnected'] {
    color: rgba(245, 245, 245, 0.92);
  }

  /* Mobile-only legibility: KPI labels and values must not be truncated. */
  @media (max-width: 767px) {
    ${S} [data-testid^='pools-kpi-'] {
      height: auto;
      min-height: 82px;
    }

    ${S} [data-testid^='pools-kpi-'] > div:first-child > div:last-child {
      display: -webkit-box;
      white-space: normal;
      overflow-wrap: anywhere;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    ${S} [data-testid^='pools-kpi-'] > div:last-child > div {
      font-size: 17px;
      line-height: 21px;
      white-space: normal;
      overflow: visible;
      overflow-wrap: anywhere;
      text-overflow: clip;
    }
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

export default PoolsVisualPolishStyle
