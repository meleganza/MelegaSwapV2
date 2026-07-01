import React, { useRef } from 'react'
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
  height: 120px;
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
    transform: translateY(-2px);
  }

  @media (min-width: 768px) {
    flex: unset;
    height: 128px;
  }

  @media (max-width: 767px) {
    flex: 0 0 150px;
    height: 104px;
  }
`

const TextBlock = styled.div`
  position: relative;
  z-index: 2;
  padding: ${spacing[3]};
  flex: 1;
  min-height: 55%;
`

const Title = styled.div`
  font-size: ${typography.fontSize.md};
  font-weight: 800;
  color: ${colors.textPrimary};
  margin-bottom: 2px;
  line-height: 1.3;
`

const Desc = styled.div`
  font-size: ${typography.fontSize.sm};
  color: #8f8f8f;
  line-height: 1.35;
`

const Thumb = styled.div<{ $variant: MelegaIntelligenceVariant; $offsetX: number; $offsetY: number }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 45%;
  pointer-events: none;
  transform: translate(${({ $offsetX }) => $offsetX}px, ${({ $offsetY }) => $offsetY}px);
  transition: transform 400ms ease-out;

  ${({ $variant }) =>
    $variant === 'radar' &&
    `
    &::before {
      content: '';
      position: absolute;
      right: -10%;
      bottom: -30%;
      width: 100%;
      height: 120%;
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
      bottom: -40%;
      width: 110%;
      height: 120%;
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
}) => {
  const offset = useRef({ x: 0, y: 0 })
  const thumbRef = useRef<HTMLDivElement>(null)

  const handleMove = (e: React.MouseEvent) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    offset.current = { x: nx * 4, y: ny * 3 }
    if (thumbRef.current) {
      thumbRef.current.style.transform = `translate(${offset.current.x}px, ${offset.current.y}px)`
    }
  }

  const handleLeave = () => {
    offset.current = { x: 0, y: 0 }
    if (thumbRef.current) thumbRef.current.style.transform = 'translate(0, 0)'
  }

  return (
    <Tile href={href} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <TextBlock>
        <Title>{title}</Title>
        <Desc>{description}</Desc>
      </TextBlock>
      <Thumb
        ref={thumbRef}
        $variant={variant}
        $offsetX={0}
        $offsetY={0}
        aria-hidden
      />
    </Tile>
  )
}

export default MelegaIntelligenceTile
