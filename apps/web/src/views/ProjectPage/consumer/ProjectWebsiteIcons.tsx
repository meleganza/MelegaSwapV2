import React from 'react'

const base = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
}

type IconProps = { size?: number }

export const IconCopy: React.FC<IconProps> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
)

export const IconCheck: React.FC<IconProps> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

export const IconExternal: React.FC<IconProps> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <path d="M15 3h6v6" />
    <path d="M10 14L21 3" />
  </svg>
)

export const IconMore: React.FC<IconProps> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
)

export const IconGlobe: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
  </svg>
)

export const IconX: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M4 4l16 16M20 4L4 20" />
  </svg>
)

export const IconTelegram: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M22 3L2 11l7 2 2 7 3-4 5 3 3-16z" />
  </svg>
)

export const IconDiscord: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M8 8c1.5-1 3-1.5 4-1.5S14.5 7 16 8" />
    <path d="M7 15c1 1 2.5 1.5 5 1.5s4-.5 5-1.5" />
    <path d="M6 9.5C4 12 4 16 5.5 18c1.2.3 2.4.5 3.5.6L10 17M18 9.5c2 2.5 2 6.5.5 8.5-1.2.3-2.4.5-3.5.6L14 17" />
    <circle cx="9" cy="12.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const IconInstagram: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const IconYoutube: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M3 8.5A3.5 3.5 0 016.5 5h11A3.5 3.5 0 0121 8.5v7a3.5 3.5 0 01-3.5 3.5h-11A3.5 3.5 0 013 15.5v-7z" />
    <path d="M10 9.5l6 2.5-6 2.5v-5z" fill="currentColor" stroke="none" />
  </svg>
)

export const IconGithub: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M9 19c-4 1.5-4-2-6-2m12 5v-3.5c0-1 .3-1.8.8-2.3A7 7 0 0018 5.5 6.5 6.5 0 0016 2s-1-.3-3.2.9a9 9 0 00-5.6 0C5 1.7 4 2 4 2a6.5 6.5 0 00-2 3.5A7 7 0 004.2 16c.5.5.8 1.3.8 2.3V22" />
  </svg>
)

export const IconLock: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 018 0v3" />
  </svg>
)

export const IconChevronRight: React.FC<IconProps> = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M9 6l6 6-6 6" />
  </svg>
)

export const IconDroplet: React.FC<IconProps> = ({ size = 21 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M12 3s6 7 6 11a6 6 0 11-12 0c0-4 6-11 6-11z" />
  </svg>
)

export const IconSprout: React.FC<IconProps> = ({ size = 21 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M12 22V11" />
    <path d="M12 11c-3-5-8-6-8-6s1 7 5 9" />
    <path d="M12 11c3-5 8-6 8-6s-1 7-5 9" />
  </svg>
)

export const IconCoins: React.FC<IconProps> = ({ size = 21 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <ellipse cx="9" cy="7" rx="6" ry="3" />
    <path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7" />
    <path d="M15 10c2.8.4 5 1.7 5 3.5v4c0 1.9-2.7 3.5-6 3.5-1.6 0-3.1-.4-4.2-1" />
  </svg>
)

export const IconRocket: React.FC<IconProps> = ({ size = 21 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M5 16l-2 5 5-2" />
    <path d="M14 4c4 1 7 4 8 8-4 1-7-1-9-3s-4-5-3-9c1 1 3 3 4 4z" />
    <circle cx="14" cy="10" r="1.5" />
  </svg>
)

export const IconZap: React.FC<IconProps> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
)

export function socialIconFor(label: string, resourceType: string, size = 20) {
  const key = `${label} ${resourceType}`.toLowerCase()
  if (/twitter|^x$|x\.com/.test(key)) return <IconX size={size} />
  if (/telegram/.test(key)) return <IconTelegram size={size} />
  if (/discord/.test(key)) return <IconDiscord size={size} />
  if (/instagram/.test(key)) return <IconInstagram size={size} />
  if (/youtube/.test(key)) return <IconYoutube size={size} />
  if (/github/.test(key)) return <IconGithub size={size} />
  return <IconGlobe size={size} />
}
