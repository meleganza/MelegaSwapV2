import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing, radius } from '../../tokens'

export type MelegaIntelligenceVariant = 'radar' | 'space' | 'chart'

export interface MelegaIntelligenceTileProps {
  title: string
  description: string
  href: string
  variant: MelegaIntelligenceVariant
}

const Tile = styled.a`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 0 0 160px;
  height: 108px;
  border-radius: ${radius.md};
  border: 1px solid ${colors.border};
  overflow: hidden;
  text-decoration: none;
  background: ${colors.surface2};
  box-sizing: border-box;
  box-shadow: none;
  transition: border-color 150ms ease, transform 150ms ease;

  &:hover {
    border-color: rgba(212, 175, 55, 0.4);
    transform: translateY(-1px);
  }

  @media (min-width: 768px) {
    flex: unset;
  }
`

const TextBlock = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: ${spacing[3]};
  z-index: 2;
`

const Title = styled.div`
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.textPrimary};
  margin-bottom: 2px;
  line-height: 1.3;
`

const Desc = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.textMuted};
  line-height: 1.35;
`

const Thumb = styled.div<{ $variant: MelegaIntelligenceVariant }>`
  position: absolute;
  inset: 0;
  pointer-events: none;

  ${({ $variant }) =>
    $variant === 'radar' &&
    `
    &::before {
      content: '';
      position: absolute;
      right: -10%;
      bottom: -20%;
      width: 90%;
      height: 90%;
      border-radius: 50%;
      border: 1px solid rgba(212,175,55,0.3);
      background: repeating-conic-gradient(from 0deg, transparent 0deg 10deg, rgba(212,175,55,0.1) 10deg 11deg);
    }
    &::after {
      content: '';
      position: absolute;
      right: 8%;
      bottom: 8%;
      width: 55%;
      height: 55%;
      border-radius: 50%;
      border: 1px solid rgba(212,175,55,0.2);
    }
  `}

  ${({ $variant }) =>
    $variant === 'space' &&
    `
    &::before {
      content: '';
      position: absolute;
      right: -5%;
      bottom: -30%;
      width: 100%;
      height: 80%;
      background: radial-gradient(ellipse 80% 70% at 75% 95%, rgba(244,197,66,0.6) 0%, rgba(212,175,55,0.25) 35%, transparent 60%);
    }
  `}

  ${({ $variant }) =>
    $variant === 'chart' &&
    `
    &::before {
      content: '';
      position: absolute;
      right: 12px;
      bottom: 10px;
      width: 12px;
      height: 42px;
      background: linear-gradient(180deg, ${colors.goldHover}, ${colors.gold});
      border-radius: 2px;
      opacity: 0.85;
    }
    &::after {
      content: '';
      position: absolute;
      right: 30px;
      bottom: 10px;
      width: 12px;
      height: 28px;
      background: linear-gradient(180deg, ${colors.goldHover}, #8f6d16);
      border-radius: 2px;
      opacity: 0.55;
    }
  `}
`

export const MelegaIntelligenceTile: React.FC<MelegaIntelligenceTileProps> = ({
  title,
  description,
  href,
  variant,
}) => (
  <Tile href={href}>
    <Thumb $variant={variant} />
    <TextBlock>
      <Title>{title}</Title>
      <Desc>{description}</Desc>
    </TextBlock>
  </Tile>
)

export default MelegaIntelligenceTile
