/**
 * Portfolio Studio surface tokens — same visual language as Farms / Pools / Project Pages.
 */
import styled, { css, keyframes } from 'styled-components'
import { uxRebuildColors, uxRebuildFont, uxRebuildLayout, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'

export const px = {
  gold: uxRebuildColors.gold,
  goldDim: 'rgba(221, 185, 47, 0.14)',
  goldLine: 'rgba(221, 185, 47, 0.32)',
  bg: uxRebuildColors.pageBg,
  panel: 'rgba(14, 14, 14, 0.96)',
  panel2: 'rgba(18, 18, 18, 0.98)',
  line: 'rgba(255, 255, 255, 0.08)',
  text: uxRebuildColors.text,
  mute: uxRebuildColors.secondary,
  mute2: uxRebuildColors.muted,
  ok: uxRebuildColors.positive,
  warn: uxRebuildColors.warning,
  bad: uxRebuildColors.error,
  radius: uxRebuildRadius.card,
} as const

const rise = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`

export const Page = styled.main`
  box-sizing: border-box;
  width: 100%;
  max-width: ${uxRebuildLayout.contentMax};
  margin: 0 auto;
  padding: 12px 14px 48px;
  color: ${px.text};
  background:
    radial-gradient(ellipse 90% 40% at 50% -10%, rgba(221, 185, 47, 0.08), transparent 55%),
    linear-gradient(180deg, #0a0a0a 0%, ${px.bg} 28%, #050505 100%);
  min-height: 100vh;
  font-family: ${uxRebuildFont};
  overflow-x: hidden;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  @media (min-width: 768px) {
    padding: 16px 20px 64px;
  }

  @media (max-width: 767px) {
    padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
  }
`

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;

  @media (max-width: 767px) {
    [data-portfolio-section='hero'] {
      order: 1;
    }
    [data-portfolio-section='assets'] {
      order: 2;
    }
    [data-portfolio-section='rewards'] {
      order: 3;
    }
    [data-portfolio-section='positions'] {
      order: 4;
    }
    [data-portfolio-section='activity'] {
      order: 5;
    }
    [data-portfolio-section='analytics'] {
      order: 6;
    }
  }
`

export const Band = styled.section`
  animation: ${rise} 0.35s ease both;
  margin: 0;
  padding: 12px 12px 10px;
  border-radius: ${px.radius};
  border: 1px solid ${px.line};
  background: linear-gradient(165deg, ${px.panel2} 0%, ${px.panel} 100%);
  min-width: 0;

  @media (min-width: 768px) {
    padding: 14px 16px 12px;
  }
`

export const BandHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  min-width: 0;
`

export const BandTitle = styled.h2`
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${px.gold};
`

export const BandMeta = styled.span`
  font-size: 11px;
  color: ${px.mute2};
  white-space: nowrap;
`

export const Grid = styled.div<{ $cols?: number }>`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 10px;
  min-width: 0;

  @media (min-width: 640px) {
    grid-template-columns: repeat(${({ $cols }) => $cols ?? 5}, minmax(0, 1fr));
  }
`

export const MetricCell = styled.div`
  min-width: 0;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
`

export const MetricLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${px.mute2};
  margin-bottom: 2px;
`

export const MetricValue = styled.div<{ $tone?: 'ok' | 'bad' | 'mute' | 'gold' }>`
  font-size: 14px;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
  line-height: 1.25;
  color: ${({ $tone }) =>
    $tone === 'ok'
      ? px.ok
      : $tone === 'bad'
        ? px.bad
        : $tone === 'gold'
          ? px.gold
          : $tone === 'mute'
            ? px.mute
            : px.text};
  word-break: break-word;
`

export const MetricSource = styled.div`
  margin-top: 2px;
  font-size: 10px;
  color: ${px.mute2};
  line-height: 1.3;
`

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

export const Btn = styled.a<{ $primary?: boolean; $ghost?: boolean; $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 750;
  text-decoration: none;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  white-space: nowrap;
  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  border: 1px solid
    ${({ $primary, $ghost }) => ($primary ? px.goldLine : $ghost ? px.line : 'rgba(255,255,255,0.14)')};
  background: ${({ $primary, $ghost }) =>
    $primary
      ? 'linear-gradient(180deg, #F2C84C 0%, #D4A017 100%)'
      : $ghost
        ? 'transparent'
        : 'rgba(255,255,255,0.04)'};
  color: ${({ $primary }) => ($primary ? '#111' : px.text)};

  &:hover {
    filter: ${({ $disabled }) => ($disabled ? 'none' : 'brightness(1.05)')};
  }

  &:focus-visible {
    outline: 2px solid ${px.gold};
    outline-offset: 2px;
  }
`

export const Chip = styled.span<{ $on?: boolean; $tone?: 'ok' | 'warn' | 'bad' | 'mute' }>`
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid
    ${({ $on, $tone }) =>
      $tone === 'ok'
        ? 'rgba(61,220,151,0.35)'
        : $tone === 'warn'
          ? 'rgba(255,176,32,0.35)'
          : $tone === 'bad'
            ? 'rgba(255,107,107,0.35)'
            : $on
              ? px.goldLine
              : px.line};
  background: ${({ $on, $tone }) =>
    $tone === 'ok'
      ? 'rgba(61,220,151,0.1)'
      : $tone === 'warn'
        ? 'rgba(255,176,32,0.1)'
        : $tone === 'bad'
          ? 'rgba(255,107,107,0.1)'
          : $on
            ? px.goldDim
            : 'rgba(255,255,255,0.03)'};
  color: ${({ $on, $tone }) =>
    $tone === 'ok'
      ? px.ok
      : $tone === 'warn'
        ? px.warn
        : $tone === 'bad'
          ? px.bad
          : $on
            ? px.gold
            : px.mute};
`

export const Muted = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: ${px.mute};
`

export const TabRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
`

export const TabBtn = styled.button<{ $active?: boolean }>`
  min-height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
  border: 1px solid ${({ $active }) => ($active ? px.goldLine : px.line)};
  background: ${({ $active }) => ($active ? px.goldDim : 'rgba(255,255,255,0.03)')};
  color: ${({ $active }) => ($active ? px.gold : px.mute)};

  &:focus-visible {
    outline: 2px solid ${px.gold};
    outline-offset: 2px;
  }
`

export const DenseTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
`

export const DenseRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) repeat(3, minmax(0, 0.8fr)) minmax(0, 1.1fr);
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 12px;
  align-items: center;

  @media (max-width: 767px) {
    grid-template-columns: 1fr 1fr;
    gap: 4px 10px;
  }
`

export const linkCss = css`
  color: ${px.gold};
  text-decoration: none;
  font-weight: 650;
  &:hover {
    text-decoration: underline;
  }
`

export const ExtLink = styled.a`
  ${linkCss}
`

export const AnalyticsDetails = styled.details`
  margin: 0;
  border-radius: ${px.radius};
  border: 1px solid ${px.line};
  background: linear-gradient(165deg, ${px.panel2} 0%, ${px.panel} 100%);
  padding: 0;
  min-width: 0;

  &[open] summary {
    border-bottom: 1px solid ${px.line};
  }
`

export const AnalyticsSummary = styled.summary`
  list-style: none;
  cursor: pointer;
  padding: 12px 12px 10px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${px.gold};

  &::-webkit-details-marker {
    display: none;
  }

  @media (min-width: 768px) {
    padding: 14px 16px 12px;
  }
`

export const AnalyticsBody = styled.div`
  padding: 10px 12px 12px;

  @media (min-width: 768px) {
    padding: 10px 16px 14px;
  }
`
