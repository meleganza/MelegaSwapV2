import styled, { keyframes } from 'styled-components'
import { uxRebuildColors, uxRebuildFont, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'

export const ac = {
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
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`

export const Page = styled.main`
  min-height: 70vh;
  color: ${ac.text};
  font-family: ${uxRebuildFont};
  background:
    radial-gradient(ellipse 80% 40% at 50% -8%, rgba(221, 185, 47, 0.1), transparent 55%),
    radial-gradient(ellipse 50% 30% at 90% 20%, rgba(80, 160, 255, 0.05), transparent 50%),
    linear-gradient(180deg, #070707 0%, ${ac.bg} 40%, #050505 100%);
  padding: 28px 16px 72px;
  box-sizing: border-box;

  @media (min-width: 960px) {
    padding: 36px 24px 88px;
  }
`

export const Inner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`

export const Band = styled.section`
  animation: ${rise} 0.4s ease both;
  margin: 0 0 14px;
  padding: 16px 16px 14px;
  border-radius: ${ac.radius};
  border: 1px solid ${ac.line};
  background: linear-gradient(165deg, ${ac.panel2} 0%, ${ac.panel} 100%);
  min-width: 0;

  @media (min-width: 768px) {
    padding: 18px 20px 16px;
  }
`

export const BandTitle = styled.h2`
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.88);
`

export const BandMeta = styled.span`
  font-size: 11px;
  font-weight: 650;
  color: ${ac.mute2};
`

export const BandHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
`

export const Muted = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: ${ac.mute};
`

export const toneColor = (tone: 'ok' | 'warn' | 'bad' | 'mute') =>
  tone === 'ok' ? ac.ok : tone === 'warn' ? ac.warn : tone === 'bad' ? ac.bad : ac.mute2
