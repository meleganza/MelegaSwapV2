import React from 'react'
import { importTokenColors } from '../importTokenTokens'

type IconProps = { size?: number; color?: string }

const stroke = (color: string, w = 1.75) => ({ stroke: color, strokeWidth: w, fill: 'none' as const })

export const IconCheck: React.FC<IconProps> = ({ size = 14, color = importTokenColors.green }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke(color, 2)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const IconChevronDown: React.FC<IconProps> = ({ size = 16, color = importTokenColors.muted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke(color)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export const IconExternal: React.FC<IconProps> = ({ size = 14, color = importTokenColors.gold }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke(color)}>
    <path d="M14 3h7v7M10 14 21 3M21 14v7h-7M3 10V3h7" />
  </svg>
)

export const IconWarning: React.FC<IconProps> = ({ size = 14, color = importTokenColors.yellow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke(color)}>
    <path d="M12 9v4M12 17h.01M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z" />
  </svg>
)
