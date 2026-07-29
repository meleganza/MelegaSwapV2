/**
 * Project Page Zero Rebuild V1 — dense premium tokens.
 * One continuous vertical composition. No giant empty cards.
 */
import styled, { css, keyframes } from 'styled-components'

export const pp = {
  gold: '#F2C84C',
  goldDim: 'rgba(242, 200, 76, 0.14)',
  goldLine: 'rgba(242, 200, 76, 0.32)',
  bg: '#070707',
  panel: 'rgba(14, 14, 14, 0.96)',
  panel2: 'rgba(18, 18, 18, 0.98)',
  line: 'rgba(255, 255, 255, 0.08)',
  text: '#F4F4F4',
  mute: '#9A9A9A',
  mute2: '#6E6E6E',
  ok: '#3DDC97',
  warn: '#FFB020',
  bad: '#FF6B6B',
  radius: '10px',
} as const

const rise = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`

export const Page = styled.main`
  box-sizing: border-box;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 12px 14px 48px;
  color: ${pp.text};
  background:
    radial-gradient(ellipse 90% 40% at 50% -10%, rgba(242, 200, 76, 0.08), transparent 55%),
    linear-gradient(180deg, #0a0a0a 0%, ${pp.bg} 28%, #050505 100%);
  min-height: 100vh;
  font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  @media (min-width: 768px) {
    padding: 16px 20px 64px;
  }
`

export const Band = styled.section`
  animation: ${rise} 0.35s ease both;
  margin: 0 0 10px;
  padding: 12px 12px 10px;
  border-radius: ${pp.radius};
  border: 1px solid ${pp.line};
  background: linear-gradient(165deg, ${pp.panel2} 0%, ${pp.panel} 100%);
  min-width: 0;

  @media (min-width: 768px) {
    padding: 14px 16px 12px;
    margin-bottom: 12px;
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
  color: ${pp.gold};
`

export const BandMeta = styled.span`
  font-size: 11px;
  color: ${pp.mute2};
  white-space: nowrap;
`

export const Grid = styled.div<{ $cols?: number }>`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 10px;
  min-width: 0;

  @media (min-width: 640px) {
    grid-template-columns: repeat(${({ $cols }) => $cols ?? 4}, minmax(0, 1fr));
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
  color: ${pp.mute2};
  margin-bottom: 2px;
`

export const MetricValue = styled.div<{ $tone?: 'ok' | 'bad' | 'mute' | 'gold' }>`
  font-size: 14px;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
  line-height: 1.25;
  color: ${({ $tone }) =>
    $tone === 'ok' ? pp.ok : $tone === 'bad' ? pp.bad : $tone === 'gold' ? pp.gold : $tone === 'mute' ? pp.mute : pp.text};
  word-break: break-word;
`

export const MetricSource = styled.div`
  margin-top: 2px;
  font-size: 10px;
  color: ${pp.mute2};
  line-height: 1.3;
`

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

export const Btn = styled.a<{ $primary?: boolean; $ghost?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 750;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid
    ${({ $primary, $ghost }) => ($primary ? pp.goldLine : $ghost ? pp.line : 'rgba(255,255,255,0.14)')};
  background: ${({ $primary, $ghost }) =>
    $primary ? 'linear-gradient(180deg, #F2C84C 0%, #D4A017 100%)' : $ghost ? 'transparent' : 'rgba(255,255,255,0.04)'};
  color: ${({ $primary }) => ($primary ? '#111' : pp.text)};

  &:hover {
    filter: brightness(1.05);
  }

  &:focus-visible {
    outline: 2px solid ${pp.gold};
    outline-offset: 2px;
  }
`

export const Chip = styled.span<{ $on?: boolean }>`
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid ${({ $on }) => ($on ? pp.goldLine : pp.line)};
  background: ${({ $on }) => ($on ? pp.goldDim : 'rgba(255,255,255,0.03)')};
  color: ${({ $on }) => ($on ? pp.gold : pp.mute)};
`

export const Muted = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: ${pp.mute};
`

export const Prose = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #d6d6d6;
`

export const List = styled.ul`
  margin: 0;
  padding: 0 0 0 16px;
  font-size: 13px;
  line-height: 1.45;
  color: #d0d0d0;

  li {
    margin-bottom: 4px;
  }
`

export const Split = styled.div`
  display: grid;
  gap: 10px;
  min-width: 0;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
    align-items: start;
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
  grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 0.7fr));
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 12px;
  align-items: center;

  @media (max-width: 639px) {
    grid-template-columns: 1fr 1fr;
    gap: 4px 10px;
  }
`

export const linkCss = css`
  color: ${pp.gold};
  text-decoration: none;
  font-weight: 650;
  &:hover {
    text-decoration: underline;
  }
`
