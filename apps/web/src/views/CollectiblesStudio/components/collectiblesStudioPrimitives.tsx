import React from 'react'
import styled, { keyframes } from 'styled-components'
import type { CollectionCard } from '../collectiblesStudioData'
import {
  CS_FONT_BODY,
  CS_FONT_DISPLAY,
  collectiblesStudioColors,
  collectiblesStudioLayout,
} from '../collectiblesStudioTokens'

export const CsPanel = styled.div<{ $height?: string; $padding?: string }>`
  background: ${collectiblesStudioColors.panel};
  border: 1px solid ${collectiblesStudioColors.border};
  border-radius: ${collectiblesStudioLayout.cardRadius};
  box-sizing: border-box;
  overflow: hidden;
  transition: border-color ${collectiblesStudioColors.transition} ease;
  ${({ $height }) =>
    $height
      ? `
    height: ${$height};
    min-height: ${$height};
  `
      : ''}
  ${({ $padding }) => ($padding ? `padding: ${$padding};` : '')}

  &:hover {
    border-color: ${collectiblesStudioColors.gold};
  }
`

export const CsSectionTitle = styled.h2`
  margin: 0 0 14px;
  font-family: ${CS_FONT_DISPLAY};
  font-size: 32px;
  line-height: 1.1;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
`

export const CsCardTitle = styled.h3`
  margin: 0;
  font-family: ${CS_FONT_BODY};
  font-size: 18px;
  line-height: 1.25;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
`

export const CsLabel = styled.span`
  font-family: ${CS_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: ${collectiblesStudioColors.label};
  line-height: 16px;
`

export const CsBody = styled.p`
  margin: 0;
  font-family: ${CS_FONT_BODY};
  font-size: 16px;
  line-height: 26px;
  color: ${collectiblesStudioColors.body};
`

export const CsPrimaryBtn = styled.button<{ $width?: string; $height?: string }>`
  width: ${({ $width }) => $width || collectiblesStudioLayout.btnExploreW};
  height: ${({ $height }) => $height || '48px'};
  min-height: ${({ $height }) => $height || '48px'};
  padding: 0 16px;
  border: none;
  border-radius: 12px;
  background: ${collectiblesStudioColors.gold};
  color: #050505;
  font-family: ${CS_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  transition: filter ${collectiblesStudioColors.transition} ease;

  &:hover {
    filter: brightness(1.05);
  }

  @media (max-width: 767px) {
    width: 100%;
  }
`

export const CsOutlineBtn = styled.button<{ $width?: string; $height?: string }>`
  width: ${({ $width }) => $width || collectiblesStudioLayout.btnCreateW};
  height: ${({ $height }) => $height || '48px'};
  min-height: ${({ $height }) => $height || '48px'};
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid ${collectiblesStudioColors.gold};
  background: ${collectiblesStudioColors.goldBg};
  color: ${collectiblesStudioColors.gold};
  font-family: ${CS_FONT_BODY};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  transition: border-color ${collectiblesStudioColors.transition} ease;

  &:hover {
    border-color: ${collectiblesStudioColors.goldHover};
  }

  @media (max-width: 767px) {
    width: 100%;
  }
`

export const CsChip = styled.button<{ $active?: boolean }>`
  height: ${collectiblesStudioLayout.filterHeight};
  min-height: ${collectiblesStudioLayout.filterHeight};
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? collectiblesStudioColors.gold : collectiblesStudioColors.border)};
  background: ${({ $active }) => ($active ? collectiblesStudioColors.gold : 'transparent')};
  color: ${({ $active }) => ($active ? '#080808' : collectiblesStudioColors.secondary)};
  font-family: ${CS_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: border-color ${collectiblesStudioColors.transition} ease, background ${collectiblesStudioColors.transition} ease;

  &:hover {
    border-color: ${collectiblesStudioColors.gold};
  }
`

export const CsKpiCard = styled.div`
  height: ${collectiblesStudioLayout.kpiHeight};
  min-height: ${collectiblesStudioLayout.kpiHeight};
  padding: ${collectiblesStudioLayout.kpiPadding};
  border-radius: ${collectiblesStudioLayout.kpiRadius};
  background: ${collectiblesStudioColors.panel};
  border: 1px solid ${collectiblesStudioColors.border};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  max-width: 100%;
  position: relative;
  overflow: hidden;

  @container (max-width: 210px) {
    /* fallback via media on parent grid cells */
  }
`

export const CsKpiValue = styled.div`
  font-family: ${CS_FONT_DISPLAY};
  font-size: 50px;
  line-height: 54px;
  font-weight: 700;
  color: ${collectiblesStudioColors.green};
  letter-spacing: -1px;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 1099px) {
    font-size: 44px;
    line-height: 48px;
  }
`

export const CsKpiDelta = styled.span<{ $positive?: boolean }>`
  font-family: ${CS_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? collectiblesStudioColors.green : collectiblesStudioColors.red)};
`

export const CsMetricLabel = styled.span`
  font-family: ${CS_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: ${collectiblesStudioColors.label};
`

export const CsMetricValue = styled.span`
  font-family: ${CS_FONT_BODY};
  font-size: 16px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
`

export const CsScoreRing = styled.div<{ $size?: string; $score: number }>`
  width: ${({ $size }) => $size || collectiblesStudioLayout.scoreRingSm};
  height: ${({ $size }) => $size || collectiblesStudioLayout.scoreRingSm};
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: conic-gradient(
    ${collectiblesStudioColors.green} var(--ring-angle, 0deg),
    rgba(255, 255, 255, 0.06) 0
  );
  position: relative;
  animation: ${({ $score }) => keyframes`
    from { --ring-angle: 0deg; }
    to { --ring-angle: ${$score * 3.6}deg; }
  `} 1200ms ease-out both;

  &::before {
    content: '';
    position: absolute;
    inset: 4px;
    border-radius: 50%;
    background: ${collectiblesStudioColors.panel};
  }
`

const ScoreNum = styled.span<{ $large?: boolean }>`
  position: relative;
  z-index: 1;
  font-family: ${CS_FONT_DISPLAY};
  font-size: ${({ $large }) => ($large ? '22px' : '14px')};
  font-weight: 700;
  color: ${collectiblesStudioColors.green};
  line-height: 1;
`

const ScoreSub = styled.span`
  position: relative;
  z-index: 1;
  font-family: ${CS_FONT_BODY};
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${collectiblesStudioColors.label};
  margin-top: 2px;
`

export const ScoreRingDisplay: React.FC<{ score: number; size?: string; large?: boolean; sub?: string; $compact?: boolean }> = ({
  score,
  size,
  large,
  sub,
  $compact,
}) =>
  $compact ? (
    <CompactScoreRing data-cs-score-ring $size={size || collectiblesStudioLayout.scoreRingSm} $score={score}>
      <CompactScoreNum>{score}</CompactScoreNum>
    </CompactScoreRing>
  ) : (
    <CsScoreRing $size={size} $score={score} data-cs-score-ring>
      <ScoreNum $large={large}>{score}</ScoreNum>
      {sub ? <ScoreSub>{sub}</ScoreSub> : null}
    </CsScoreRing>
  )

const CompactScoreRing = styled.div<{ $size: string; $score: number }>`
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  border-radius: 50%;
  background: conic-gradient(
    ${collectiblesStudioColors.green} var(--ring-angle, 0deg),
    rgba(255, 255, 255, 0.06) 0
  );
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  animation: ${({ $score }) => keyframes`
    from { --ring-angle: 0deg; }
    to { --ring-angle: ${$score * 3.6}deg; }
  `} 1200ms ease-out both;

  &::before {
    content: '';
    position: absolute;
    inset: 4px;
    border-radius: 50%;
    background: #0b0b0b;
  }
`

const CompactScoreNum = styled.span`
  position: relative;
  z-index: 1;
  font-family: ${CS_FONT_DISPLAY};
  font-size: 18px;
  font-weight: 700;
  color: ${collectiblesStudioColors.green};
  line-height: 1;
`

const FeaturedScoreRing = styled.div<{ $score: number }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: conic-gradient(
    ${collectiblesStudioColors.green} var(--ring-angle, 0deg),
    rgba(255, 255, 255, 0.06) 0
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  position: relative;
  animation: ${({ $score }) => keyframes`
    from { --ring-angle: 0deg; }
    to { --ring-angle: ${$score * 3.6}deg; }
  `} 1200ms ease-out both;

  &::before {
    content: '';
    position: absolute;
    inset: 5px;
    border-radius: 50%;
    background: #0b0b0b;
  }
`

const FeaturedScoreNum = styled.span`
  position: relative;
  z-index: 1;
  font-family: ${CS_FONT_DISPLAY};
  font-size: 18px;
  font-weight: 700;
  color: ${collectiblesStudioColors.green};
  line-height: 1;
`

const FeaturedScoreLabel = styled.span`
  position: relative;
  z-index: 1;
  font-family: ${CS_FONT_BODY};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${collectiblesStudioColors.secondary};
`

export const FeaturedScoreRingDisplay: React.FC<{ score: number; label?: string }> = ({ score, label = 'Utility' }) => (
  <FeaturedScoreRing data-cs-score-ring $score={score}>
    <FeaturedScoreNum>{score}</FeaturedScoreNum>
    <FeaturedScoreLabel>{label}</FeaturedScoreLabel>
  </FeaturedScoreRing>
)

const ART_THEMES: Record<CollectionCard['artTheme'], string> = {
  hooded:
    'radial-gradient(ellipse at 50% 80%, rgba(214,180,69,0.45) 0%, transparent 55%), linear-gradient(180deg, #1a1208 0%, #080808 100%)',
  lion: 'radial-gradient(ellipse at 50% 60%, rgba(214,180,69,0.5) 0%, transparent 50%), linear-gradient(180deg, #1a1008 0%, #0a0806 100%)',
  city: 'radial-gradient(ellipse at 50% 30%, rgba(77,163,255,0.25) 0%, transparent 50%), linear-gradient(180deg, #0a1020 0%, #080808 100%)',
  ai: 'radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.35) 0%, transparent 55%), linear-gradient(180deg, #120a1a 0%, #080808 100%)',
  cube: 'radial-gradient(ellipse at 50% 50%, rgba(214,180,69,0.3) 0%, transparent 50%), linear-gradient(135deg, #141008 0%, #080808 100%)',
  validator:
    'radial-gradient(ellipse at 50% 50%, rgba(27,231,122,0.25) 0%, transparent 50%), linear-gradient(180deg, #081208 0%, #080808 100%)',
  builder:
    'radial-gradient(ellipse at 50% 50%, rgba(214,180,69,0.2) 0%, transparent 50%), linear-gradient(180deg, #100e08 0%, #080808 100%)',
  genesis:
    'radial-gradient(ellipse at 50% 50%, rgba(214,180,69,0.55) 0%, transparent 45%), linear-gradient(180deg, #1a1408 0%, #080808 100%)',
  membership:
    'radial-gradient(ellipse at 50% 50%, rgba(240,75,75,0.2) 0%, transparent 50%), linear-gradient(180deg, #140808 0%, #080808 100%)',
  gaming:
    'radial-gradient(ellipse at 50% 50%, rgba(77,163,255,0.3) 0%, transparent 50%), linear-gradient(180deg, #080e18 0%, #080808 100%)',
}

export const CsArtwork = styled.div<{ $theme: CollectionCard['artTheme']; $height?: string }>`
  width: 100%;
  height: ${({ $height }) => $height || collectiblesStudioLayout.artworkH};
  border-radius: ${collectiblesStudioLayout.artworkRadius};
  background: radial-gradient(
      circle at 50% 40%,
      rgba(214, 180, 69, 0.26) 0%,
      rgba(0, 0, 0, 0.25) 60%,
      #0a0a0a 100%
    ),
    ${({ $theme }) => ART_THEMES[$theme]};
  position: relative;
  overflow: hidden;
  transition: transform 220ms ease;
`

export const CsThumbnail = styled.div<{ $theme: CollectionCard['artTheme'] }>`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  flex-shrink: 0;
  background: radial-gradient(circle at 50% 40%, rgba(214, 180, 69, 0.26), #0a0a0a 100%),
    ${({ $theme }) => ART_THEMES[$theme]};
  border: 1px solid ${collectiblesStudioColors.border};
`
