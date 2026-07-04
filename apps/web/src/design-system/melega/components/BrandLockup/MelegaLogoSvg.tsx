import React from 'react'
import { MELEGA_LOGO_URI } from '../../constants/brand'

/** Official Melega / MARCO round logo (double-M). */
export const MelegaLogoSvg: React.FC<{ size: number }> = ({ size }) => (
  <img
    src={MELEGA_LOGO_URI}
    alt=""
    width={size}
    height={size}
    aria-hidden
    style={{ display: 'block', borderRadius: '50%', objectFit: 'cover' }}
  />
)

export default MelegaLogoSvg
