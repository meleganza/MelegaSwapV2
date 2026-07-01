import React from 'react'

/** Official Melega round logo — SVG fallback when raster asset fails. */
export const MelegaLogoSvg: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 42 42" fill="none" aria-hidden>
    <circle cx="21" cy="21" r="20" fill="#050505" stroke="#D4AF37" strokeWidth="2" />
    <path
      d="M12 28V14h4.2l4.8 8.4L25.8 14H30v14h-3.6V19.8L22.2 28h-2.4l-4.2-8.2V28H12z"
      fill="#FFFFFF"
    />
  </svg>
)

export default MelegaLogoSvg
