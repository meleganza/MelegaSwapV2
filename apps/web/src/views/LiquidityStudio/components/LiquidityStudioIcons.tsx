import React from 'react'

const base = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
}

type P = { size?: number; strokeWidth?: number }

export const IconDroplets: React.FC<P> = ({ size = 22, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={strokeWidth}>
    <path d="M7 16.5a4 4 0 108 0c0-3.5-4-8.5-4-8.5s-4 5-4 8.5z" />
    <path d="M15.5 9.5S18 12.5 18 14.5a2.5 2.5 0 11-5 0c0-2 2.5-5 2.5-5z" />
  </svg>
)

export const IconDroplet: React.FC<P> = ({ size = 24, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={strokeWidth}>
    <path d="M12 3s6 7 6 11a6 6 0 11-12 0c0-4 6-11 6-11z" />
  </svg>
)

export const IconChartIncreasing: React.FC<P> = ({ size = 23, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={strokeWidth}>
    <path d="M3 3v18h18" />
    <path d="M7 14v4M12 10v8M17 6v12" />
  </svg>
)

export const IconCircleCheck: React.FC<P> = ({ size = 16, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={strokeWidth}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.5 2.5 5-5" />
  </svg>
)

export const IconArrowRight: React.FC<P> = ({ size = 18, strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={strokeWidth}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const IconArrowLeft: React.FC<P> = ({ size = 16, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={strokeWidth}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
)

export const IconInfo: React.FC<P> = ({ size = 15, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={strokeWidth}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
)

export const IconShieldCheck: React.FC<P> = ({ size = 28, strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={strokeWidth}>
    <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9.5C7.5 20.5 4 17 4 12V6l8-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

export const IconLockKeyhole: React.FC<P> = ({ size = 28, strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={strokeWidth}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 018 0v3" />
    <circle cx="12" cy="15.5" r="1.2" />
  </svg>
)

export const IconBrainCircuit: React.FC<P> = ({ size = 28, strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={strokeWidth}>
    <path d="M12 4a4 4 0 00-4 4v1a3 3 0 00-2 2.7V14a3 3 0 003 3h1" />
    <path d="M12 4a4 4 0 014 4v1a3 3 0 012 2.7V14a3 3 0 01-3 3h-1" />
    <path d="M9 17v2M15 17v2M12 14v5" />
    <circle cx="9" cy="10" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="15" cy="10" r="0.8" fill="currentColor" stroke="none" />
  </svg>
)

export const IconBadgePercent: React.FC<P> = ({ size = 28, strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={strokeWidth}>
    <path d="M12 3l2.2 1.2L16.8 4l.8 2.4L19.5 8l-.5 2.5.5 2.5-1.9 1.6-.8 2.4-2.6-.2L12 21l-2.2-1.2L7.2 20l-.8-2.4L4.5 16l.5-2.5L4.5 11l1.9-1.6.8-2.4 2.6.2L12 3z" />
    <path d="M9 15l6-6M9.5 9.5h.01M14.5 14.5h.01" />
  </svg>
)
