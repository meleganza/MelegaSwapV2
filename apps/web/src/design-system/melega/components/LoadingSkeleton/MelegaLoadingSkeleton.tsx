import React from 'react'
import styled, { keyframes } from 'styled-components'
import { colors, radius, spacing } from '../../tokens'
import { layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

const shimmer = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.85; }
  100% { opacity: 0.45; }
`

export interface MelegaLoadingSkeletonProps extends MelegaLayoutProps {
  width?: string
  height?: string
  lines?: number
}

const Block = styled.div<{
  $width?: string
  $height?: string
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
  $radius?: MelegaLayoutProps['radius']
}>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '16px'};
  border-radius: ${({ $radius }) => ($radius ? radius[$radius] : radius.sm)};
  background: ${colors.surface3};
  border: 1px solid ${colors.border};
  box-shadow: none;
  animation: ${shimmer} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.65;
  }

  ${({ $padding, $margin }) => layoutStyles({ padding: $padding, margin: $margin })}
`

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[2]};
  width: 100%;
`

export const MelegaLoadingSkeleton: React.FC<MelegaLoadingSkeletonProps> = ({
  width,
  height,
  lines = 1,
  padding,
  margin,
  radius: radiusToken,
}) => {
  if (lines <= 1) {
    return <Block $width={width} $height={height} $padding={padding} $margin={margin} $radius={radiusToken} aria-hidden />
  }

  return (
    <Stack aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Block
          key={i}
          $width={i === lines - 1 ? '70%' : width}
          $height={height}
          $radius={radiusToken}
        />
      ))}
    </Stack>
  )
}

export default MelegaLoadingSkeleton
