import React, { useState } from 'react'
import { MELEGA_LOGO_URI } from 'design-system/melega/constants/brand'
import { MelegaLogoSvg } from 'design-system/melega/components/BrandLockup/MelegaLogoSvg'

export interface TradeMelegaIsologoProps {
  size?: number
}

/** Official Melega isologo — attached asset with unmodified MelegaLogoSvg fallback. */
export const TradeMelegaIsologo: React.FC<TradeMelegaIsologoProps> = ({ size = 22 }) => {
  const [ok, setOk] = useState(true)

  return (
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
        borderRadius: '50%',
        overflow: 'hidden',
      }}
      aria-hidden
    >
      {ok ? (
        <img
          src={MELEGA_LOGO_URI}
          alt=""
          width={size}
          height={size}
          style={{ width: size, height: size, objectFit: 'cover' }}
          onError={() => setOk(false)}
        />
      ) : (
        <MelegaLogoSvg size={size} />
      )}
    </span>
  )
}

export default TradeMelegaIsologo
