import React from 'react'
import { buildStudioColors } from '../buildStudioTokens'

type IconProps = { size?: number; color?: string }

const stroke = (color: string, w = 1.75) => ({ stroke: color, strokeWidth: w, fill: 'none' as const })

export const IconCoins: React.FC<IconProps> = ({ size = 18, color = buildStudioColors.gold }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke(color)}>
    <circle cx="9" cy="14" r="5" />
    <circle cx="15" cy="10" r="5" />
  </svg>
)

export const IconWheat: React.FC<IconProps> = ({ size = 18, color = buildStudioColors.gold }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke(color)}>
    <path d="M12 3v18M8 7c2-2 4-2 4 0s2 2 4 0M8 11c2-2 4-2 4 0s2 2 4 0M8 15c2-2 4-2 4 0s2 2 4 0" />
  </svg>
)

export const IconDroplets: React.FC<IconProps> = ({ size = 18, color = buildStudioColors.gold }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke(color)}>
    <path d="M12 3c3 4 6 7 6 10a6 6 0 11-12 0c0-3 3-6 6-10z" />
  </svg>
)

export const IconBlocks: React.FC<IconProps> = ({ size = 18, color = buildStudioColors.gold }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke(color)}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

export const IconSparkles: React.FC<IconProps> = ({ size = 16, color = buildStudioColors.gold }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke(color)}>
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
  </svg>
)

export const IconHammer: React.FC<IconProps> = ({ size = 18, color = buildStudioColors.gold }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke(color)}>
    <path d="m15 4 5 5-4 4-5-5zM4 20l5-5" />
    <path d="M9 9 4 14" />
  </svg>
)

export const IconDownload: React.FC<IconProps> = ({ size = 18, color = buildStudioColors.gold }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke(color)}>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </svg>
)

export const IconRadar: React.FC<IconProps> = ({ size = 18, color = buildStudioColors.green }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke(color)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 12 16 8" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const IconFolder: React.FC<IconProps> = ({ size = 18, color = buildStudioColors.gold }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke(color)}>
    <path d="M4 7h6l2 2h8v10H4z" />
  </svg>
)

export const IconCheck: React.FC<IconProps> = ({ size = 14, color = buildStudioColors.green }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke(color, 2)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const IconChevronDown: React.FC<IconProps> = ({ size = 16, color = buildStudioColors.muted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke(color)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export const IconBook: React.FC<IconProps> = ({ size = 16, color = buildStudioColors.gold }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke(color)}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)
