import React from 'react'

/** MARCO token logo — SVG fallback when remote asset fails. */
export const MarcoLogoSvg: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
    <circle cx="14" cy="14" r="13" fill="#050505" stroke="#D4AF37" strokeWidth="1.5" />
    <circle cx="14" cy="14" r="6" fill="#D4AF37" opacity="0.85" />
  </svg>
)

export default MarcoLogoSvg
