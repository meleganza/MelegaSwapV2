import React from 'react'

/** Lucide-compatible outline icons (stroke 1.75) — no third-party icon package. */
const base = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
}

export const IconChevronDown: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M6 9l6 6 6-6" />
  </svg>
)

export const IconSearch: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
)

export const IconGlobe: React.FC<{ size?: number }> = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
  </svg>
)

export const IconWallet: React.FC<{ size?: number; strokeWidth?: number }> = ({
  size = 15,
  strokeWidth = 2,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M3 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    <path d="M16 12h5v4h-5a2 2 0 010-4z" />
  </svg>
)

export const IconMenu: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const IconTrendingUp: React.FC<{ size?: number }> = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M3 17l6-6 4 4 7-7" />
    <path d="M14 8h6v6" />
  </svg>
)

export const IconGauge: React.FC<{ size?: number }> = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M12 14l4-4" />
    <path d="M4.9 19A9 9 0 1119.1 19" />
  </svg>
)

export const IconBadgeCheck: React.FC<{ size?: number }> = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M8.5 12.5l2.5 2.5 5-5" />
    <path d="M12 3l2.2 1.2L16.8 4l.8 2.4L19.5 8l-.5 2.5.5 2.5-1.9 1.6-.8 2.4-2.6-.2L12 21l-2.2-1.2L7.2 20l-.8-2.4L4.5 16l.5-2.5L4.5 11l1.9-1.6.8-2.4 2.6.2L12 3z" />
  </svg>
)

export const IconPanels: React.FC<{ size?: number }> = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <rect x="3" y="4" width="18" height="6" rx="1.5" />
    <rect x="3" y="14" width="8" height="6" rx="1.5" />
    <rect x="13" y="14" width="8" height="6" rx="1.5" />
  </svg>
)

export const IconSparkles: React.FC<{ size?: number }> = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M12 3l1.2 4.2L17.5 8.5 13.2 9.8 12 14l-1.2-4.2L6.5 8.5l4.3-1.3L12 3z" />
    <path d="M18 14l.7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7L18 14z" />
  </svg>
)

export const IconDashboard: React.FC<{ size?: number }> = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="5" rx="1.5" />
    <rect x="13" y="10" width="8" height="11" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
  </svg>
)

export const moreItemIcon = (id: string): React.ReactNode => {
  switch (id) {
    case 'trending':
    case 'analytics':
      return <IconTrendingUp />
    case 'radar':
      return <IconGauge />
    case 'collectibles':
      return <IconBadgeCheck />
    case 'identity-console':
      return <IconPanels />
    case 'build-studio':
      return <IconSparkles />
    case 'command-center':
      return <IconDashboard />
    default:
      return null
  }
}
