import React, { useState } from 'react'
import styled from 'styled-components'
import { ds001Layout } from 'design-system/melega/tokens/ds001'
import { melegaZIndex } from 'design-system/melega/tokens/melegaZIndex'
import SafeTrendingRibbon from 'views/CommandCenter/components/SafeTrendingRibbon'
import CommercialCheckoutModal from 'views/shared/monetization/CommercialCheckoutModal'

const TRENDING_BAR_DESKTOP_H = '44px'
const TRENDING_BAR_MOBILE_H = '36px'
const MOBILE_HEADER_H = '56px'

/**
 * Shared global Trending Bar — sits directly beneath the fixed header.
 * Reuses the existing Home/Command Center TrendingRibbon data path (no second ticker).
 */
const Bar = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: calc(${MOBILE_HEADER_H} + env(safe-area-inset-top, 0px));
  height: ${TRENDING_BAR_MOBILE_H};
  z-index: ${melegaZIndex.chromeTicker};
  width: 100%;
  background: #0a0a0a;
  border-top: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  box-sizing: border-box;
  overflow: hidden;
  overflow-x: hidden;
  max-width: 100vw;
  display: flex;
  align-items: center;

  @media (min-width: 1024px) {
    top: ${ds001Layout.headerHeight};
    height: ${TRENDING_BAR_DESKTOP_H};
    z-index: ${melegaZIndex.chromeTicker};
  }
`

const Inner = styled.div`
  width: 100%;
  max-width: ${ds001Layout.gridTotalWidth};
  margin: 0 auto;
  height: 100%;
  padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  overflow: hidden;
  min-width: 0;

  @media (min-width: 1024px) {
    padding: 0 ${ds001Layout.outerMargin};
  }

  /* Lock ticker inside viewport — never expand page horizontal scroll */
  > [data-global-ticker-slot] {
    flex: 1 1 auto;
    min-width: 0;
    width: auto;
    overflow: hidden;
  }

  /* Lock MelegaTicker to shell geometry without a second ticker implementation */
  [data-melega-ticker] {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    height: 100% !important;
    min-height: 0 !important;
    max-height: 100% !important;
    border-top: none !important;
    border-bottom: none !important;
    background: transparent !important;
    box-shadow: none !important;
    overflow: hidden;
  }

  /* Horizontal scroll stays inside the ticker track, never the document */
  [data-melega-ticker] [data-melega-ticker-track],
  [data-melega-ticker] > div {
    max-width: 100%;
    min-width: 0;
  }
`

const TickerSlot = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
`

const BoostSlot = styled.div`
  flex: 0 0 auto;
  display: none;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding-left: 14px;
  margin-left: 14px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  box-sizing: border-box;

  @media (min-width: 1024px) {
    display: flex;
  }
`

const BoostCta = styled.button`
  appearance: none;
  cursor: pointer;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 14px;
  border: 1px solid rgba(244, 196, 48, 0.58);
  border-radius: 999px;
  background: rgba(244, 196, 48, 0.08);
  color: #f4c430;
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.08em;
  white-space: nowrap;

  &:hover {
    color: #fff1ae;
    border-color: #f4c430;
    background: rgba(244, 196, 48, 0.14);
  }
`

export const MELEGA_TRENDING_BAR_DESKTOP_HEIGHT = TRENDING_BAR_DESKTOP_H
export const MELEGA_TRENDING_BAR_MOBILE_HEIGHT = TRENDING_BAR_MOBILE_H

export const GlobalTrendingBar: React.FC = () => {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  return (
    <>
      <Bar data-melega-global-trending-bar data-testid="melega-global-trending-bar">
        <Inner>
          <TickerSlot data-global-ticker-slot>
            <SafeTrendingRibbon />
          </TickerSlot>
          <BoostSlot data-global-boost-slot>
            <BoostCta type="button" onClick={() => setCheckoutOpen(true)} data-testid="global-boost-project">
              BOOST YOUR PROJECT
            </BoostCta>
          </BoostSlot>
        </Inner>
      </Bar>
      <CommercialCheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        projectId="boost-project"
        projectSlug=""
        identityReady={false}
      />
    </>
  )
}

export default GlobalTrendingBar
