import React from 'react'
import { TokenPairImage, ImageProps } from '@pancakeswap/uikit'
import { bscTokens } from '@pancakeswap/tokens'
import { getAddress } from 'utils/addressHelpers'

const CakeVaultTokenPairImage: React.FC<Omit<ImageProps, 'src'>> = (props) => {
  const primaryTokenSrc = `/images/56/tokens/${getAddress(bscTokens.cake.address)}.png`

  return <TokenPairImage primarySrc={primaryTokenSrc} secondarySrc="/images/tokens/autorenew.svg" {...props} />
}

export default CakeVaultTokenPairImage
