import React from 'react'
import { MelegaLogoSvg } from 'design-system/melega/components/BrandLockup/MelegaLogoSvg'

export interface TradeMelegaIsologoProps {
  size?: number
}

/** Official Melega isologo — same SVG as brand lockup fallback. */
export const TradeMelegaIsologo: React.FC<TradeMelegaIsologoProps> = ({ size = 22 }) => (
  <span
    data-trade-melega-isologo
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      flexShrink: 0,
      lineHeight: 0,
    }}
    aria-hidden
  >
    <MelegaLogoSvg size={size} />
  </span>
)

export default TradeMelegaIsologo
