/**
 * PASSPORT_MODULE_003 — Assets rail (desktop 1376×176).
 * Four cards 320×144 with 16px gaps. Does not modify Modules 001–002.
 */
import React from 'react'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import { PassportAssetsCryptoCard } from './PassportAssetsCryptoCard'
import { PassportAssetsMCreditsCard } from './PassportAssetsMCreditsCard'
import { PassportAssetsWalletsCard } from './PassportAssetsWalletsCard'
import { PassportAssetsActionsCard } from './PassportAssetsActionsCard'
import { usePassportAssets, type UsePassportAssetsOptions } from './usePassportAssets'
import type { PassportAssetsViewModel } from './passportAssetsTypes'

const Module = styled.section`
  position: relative;
  width: 100%;
  max-width: ${passportOne.contentMax};
  height: ${passportOne.assetsH};
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: ${passportOne.assetsModuleRadius};
  border: ${passportOne.assetsModuleBorder};
  background: ${passportOne.assetsModuleBg};
  box-shadow: ${passportOne.assetsModuleShadow};
  padding: ${passportOne.assetsModulePadY} ${passportOne.assetsModulePadX};
  font-family: ${passportOne.font};
  color: ${passportOne.text};

  @media (max-width: 1199px) {
    height: auto;
    overflow: visible;
    padding: 16px;
  }

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    height: auto;
    padding: 16px 0;
    border-radius: 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Inner = styled.div`
  width: 100%;
  height: 144px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${passportOne.assetsCardGap};
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: 1199px) {
    height: auto;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`

export type PassportAssetsProps = UsePassportAssetsOptions & {
  model?: PassportAssetsViewModel
}

export const PassportAssets: React.FC<PassportAssetsProps> = ({ model: injected, fixture }) => {
  const live = usePassportAssets({ fixture })
  const model = injected ?? live

  return (
    <Module
      data-testid="passport-assets-module"
      data-passport-module="003"
      data-pixel-passport-assets="1376x176"
      aria-label="Assets"
    >
      <Inner data-testid="passport-assets-inner">
        <PassportAssetsCryptoCard crypto={model.crypto} />
        <PassportAssetsMCreditsCard mCredits={model.mCredits} />
        <PassportAssetsWalletsCard wallets={model.wallets} />
        <PassportAssetsActionsCard actions={model.actions} />
      </Inner>
    </Module>
  )
}

export default PassportAssets
