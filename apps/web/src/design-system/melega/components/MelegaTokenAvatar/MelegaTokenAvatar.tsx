import React, { useCallback, useMemo, useState } from 'react'
import { colors } from '../../tokens'
import {
  resolveTokenLogoSources,
  type TokenLogoInput,
} from 'lib/token-logo/resolveTokenLogoSources'

export interface MelegaTokenAvatarProps extends TokenLogoInput {
  size?: number
  radius?: number | 'circle'
  className?: string
  alt?: string
}

export const MelegaTokenAvatar: React.FC<MelegaTokenAvatarProps> = ({
  symbol,
  name,
  address,
  chainId,
  logoURI,
  size = 48,
  radius = 12,
  className,
  alt = '',
}) => {
  const sources = useMemo(
    () => resolveTokenLogoSources({ symbol, name, address, chainId, logoURI }).filter(Boolean),
    [symbol, name, address, chainId, logoURI],
  )
  const [sourceIndex, setSourceIndex] = useState(0)

  const handleError = useCallback(() => {
    setSourceIndex((i) => Math.min(i + 1, sources.length))
  }, [sources.length])

  const borderRadius = radius === 'circle' ? '50%' : `${radius}px`
  const label = (name || symbol || '?').slice(0, 1).toUpperCase()
  const src = sourceIndex < sources.length ? sources[sourceIndex] : undefined

  if (src) {
    return (
      <span
        className={className}
        style={{ flexShrink: 0, display: 'inline-flex', width: size, height: size, borderRadius, overflow: 'hidden' }}
      >
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          onError={handleError}
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </span>
    )
  }

  return (
    <span
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius,
        border: `1px solid ${colors.border}`,
        background: colors.surface2,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: size * 0.36,
        fontWeight: 700,
        color: colors.gold,
      }}
    >
      {label}
    </span>
  )
}

export default MelegaTokenAvatar
