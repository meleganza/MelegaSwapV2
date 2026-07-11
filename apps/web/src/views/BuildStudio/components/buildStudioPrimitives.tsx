import styled, { keyframes } from 'styled-components'
import { BS_FONT_BODY, BS_FONT_DISPLAY, buildStudioColors, buildStudioLayout } from '../buildStudioTokens'

export const BsPanel = styled.div<{
  $height?: string
  $minHeight?: string
  $emphasis?: 'default' | 'reduced' | 'primary'
}>`
  background: ${buildStudioColors.panel};
  border: 1px solid
    ${({ $emphasis }) =>
      $emphasis === 'primary' ? buildStudioColors.gold : $emphasis === 'reduced' ? 'rgba(38,38,38,0.9)' : buildStudioColors.border};
  border-radius: ${buildStudioLayout.cardRadius};
  box-sizing: border-box;
  overflow: hidden;
  opacity: ${({ $emphasis }) => ($emphasis === 'reduced' ? 0.88 : 1)};
  transition: border-color ${buildStudioLayout.transition} ease;
  ${({ $height }) => ($height ? `height: ${$height}; min-height: ${$height};` : '')}
  ${({ $minHeight }) => ($minHeight ? `min-height: ${$minHeight};` : '')}

  &:hover {
    border-color: ${buildStudioColors.gold};
  }
`

export const BsCardTitle = styled.h3<{ $size?: 'default' | 'reduced' }>`
  margin: 0;
  font-family: ${BS_FONT_BODY};
  font-size: ${({ $size }) => ($size === 'reduced' ? '16px' : '18px')};
  font-weight: 700;
  line-height: 1.2;
  color: ${buildStudioColors.white};
`

export const BsSectionTitle = styled.h2`
  margin: 0 0 16px;
  font-family: ${BS_FONT_DISPLAY};
  font-size: 32px;
  font-weight: 600;
  color: ${buildStudioColors.white};
`

export const BsBody = styled.p`
  margin: 0;
  font-family: ${BS_FONT_BODY};
  font-size: 16px;
  line-height: 26px;
  color: ${buildStudioColors.body};
`

export const BsLabel = styled.span`
  font-family: ${BS_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: ${buildStudioColors.label};
`

export const BsPrimaryBtn = styled.button<{ $width?: string; $height?: string }>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || buildStudioLayout.btnHeight};
  min-height: ${({ $height }) => $height || buildStudioLayout.btnHeight};
  border: none;
  border-radius: ${buildStudioLayout.btnRadius};
  background: ${buildStudioColors.gold};
  color: #050505;
  font-family: ${BS_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: filter ${buildStudioLayout.btnTransition} ease;

  &:hover {
    filter: brightness(1.05);
  }
`

export const BsOutlineBtn = styled.button<{ $width?: string; $height?: string }>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || buildStudioLayout.btnHeight};
  min-height: ${({ $height }) => $height || buildStudioLayout.btnHeight};
  border-radius: ${buildStudioLayout.btnRadius};
  border: 1px solid ${buildStudioColors.gold};
  background: ${buildStudioColors.goldBg};
  color: ${buildStudioColors.gold};
  font-family: ${BS_FONT_BODY};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: border-color ${buildStudioLayout.transition} ease;

  &:hover {
    border-color: ${buildStudioColors.goldHover};
  }
`

export const BsComingSoonBtn = styled(BsPrimaryBtn)`
  margin-top: auto;
  opacity: 0.72;
  cursor: not-allowed;
  font-size: 13px;
`

export const BsComingSoonOutlineBtn = styled(BsOutlineBtn)`
  opacity: 0.72;
  cursor: not-allowed;
  font-size: 13px;
`

export const BsComingSoonBadge = styled.span`
  display: inline-flex;
  margin-top: 8px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${buildStudioColors.border};
  font-family: ${BS_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  color: ${buildStudioColors.muted};
`

export const BsInput = styled.input`
  width: 100%;
  height: 56px;
  border-radius: 14px;
  border: 1px solid ${buildStudioColors.border};
  background: #0a0a0a;
  color: ${buildStudioColors.white};
  font-family: ${BS_FONT_BODY};
  font-size: 15px;
  padding: 0 16px;
  box-sizing: border-box;

  &::placeholder {
    color: ${buildStudioColors.muted};
  }

  &:focus {
    outline: none;
    border-color: ${buildStudioColors.gold};
  }
`

export const BsSelect = styled.select`
  height: 56px;
  border-radius: 14px;
  border: 1px solid ${buildStudioColors.border};
  background: #0a0a0a;
  color: ${buildStudioColors.white};
  font-family: ${BS_FONT_BODY};
  font-size: 14px;
  padding: 0 14px;
  box-sizing: border-box;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${buildStudioColors.gold};
  }
`

export const BsFieldLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-family: ${BS_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: ${buildStudioColors.label};
`

export const BsField = styled.div`
  margin-bottom: 12px;
`

export const BsBadge = styled.span<{ $variant?: 'green' | 'gold' }>`
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${({ $variant }) => ($variant === 'green' ? buildStudioColors.green : buildStudioColors.gold)};
  color: ${({ $variant }) => ($variant === 'green' ? buildStudioColors.green : buildStudioColors.gold)};
  background: ${({ $variant }) =>
    $variant === 'green' ? 'rgba(27,231,122,0.08)' : buildStudioColors.goldBg};
  font-family: ${BS_FONT_BODY};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
`

export const BsStatusChip = styled.span<{ $status: 'green' | 'yellow' | 'gray' | 'red' }>`
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  font-family: ${BS_FONT_BODY};
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  ${({ $status }) => {
    if ($status === 'green')
      return `border: 1px solid ${buildStudioColors.green}; color: ${buildStudioColors.green}; background: rgba(27,231,122,0.1);`
    if ($status === 'yellow')
      return `border: 1px solid ${buildStudioColors.yellow}; color: ${buildStudioColors.yellow}; background: rgba(244,197,66,0.1);`
    if ($status === 'gray')
      return `border: 1px solid ${buildStudioColors.gray}; color: ${buildStudioColors.gray}; background: rgba(107,107,107,0.12);`
    return `border: 1px solid ${buildStudioColors.red}; color: ${buildStudioColors.red}; background: rgba(240,75,75,0.1);`
  }}
`

const drawLine = keyframes`
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
`

export const BsSparkline = styled.svg`
  width: 72px;
  height: 28px;
  flex-shrink: 0;

  path {
    animation: ${drawLine} 2s ease-out both;
  }
`

export function MiniSparkline({ points }: { points: number[] }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const w = 72
  const h = 28
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((p - min) / range) * (h - 4) - 2
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <BsSparkline viewBox={`0 0 ${w} ${h}`} data-bs-sparkline aria-hidden>
      <path d={d} fill="none" stroke={buildStudioColors.green} strokeWidth="2" strokeLinecap="round" strokeDasharray="100" />
    </BsSparkline>
  )
}

export const BsGauge = styled.div<{ $score: number }>`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: conic-gradient(
    ${buildStudioColors.green} var(--ring-angle, 0deg),
    rgba(255, 255, 255, 0.06) 0
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  animation: ${({ $score }) => keyframes`
    from { --ring-angle: 0deg; }
    to { --ring-angle: ${$score * 3.6}deg; }
  `} ${buildStudioLayout.progressAnim} ease-out both;

  &::before {
    content: '';
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    background: ${buildStudioColors.panel};
  }
`

export const BsGaugeValue = styled.span`
  position: relative;
  z-index: 1;
  font-family: ${BS_FONT_DISPLAY};
  font-size: 24px;
  font-weight: 700;
  color: ${buildStudioColors.green};
  line-height: 1;
`

export const BsGaugeLabel = styled.span`
  position: relative;
  z-index: 1;
  font-family: ${BS_FONT_BODY};
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${buildStudioColors.muted};
  margin-top: 4px;
`

const progressFill = keyframes`
  from { width: 0; }
`

export const BsProgressTrack = styled.div`
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
`

export const BsProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  border-radius: 999px;
  background: ${buildStudioColors.green};
  animation: ${progressFill} ${buildStudioLayout.progressAnim} ease-out both;
`

const manifestFade = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

export const BsManifestPreview = styled.pre`
  animation: ${manifestFade} ${buildStudioLayout.manifestFade} ease-out both;
`
