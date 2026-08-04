import React, { useCallback, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { liqOne } from './onePageTokens'
import { LiquidityPageHeader } from './LiquidityPageHeader'
import { LiquidityBuildingCard } from './LiquidityBuildingCard'
import { AddLiquidityCard } from './AddLiquidityCard'
import { DexLiquiditySnapshot } from './DexLiquiditySnapshot'
import { WalletLiquidityOverview } from './WalletLiquidityOverview'
import { LiquidityPositions } from './LiquidityPositions'
import { LiquidityEducationRail } from './LiquidityEducationRail'
import { LiquidityOnePagePolishStyle } from './LiquidityOnePagePolishStyle'

const Page = styled.div`
  width: 100%;
  max-width: ${liqOne.contentMax};
  margin: 0 auto;
  /* Hero owns trending→hero gap (24px). Product row starts 24px below hero. */
  padding: 0 0 ${liqOne.bottomPad};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
  font-family: ${liqOne.font};

  @media (max-width: 767px) {
    padding: 0 0 ${liqOne.bottomPad};
  }
`

/** Desktop: 672 + 32 + 672 = 1376. Fixed row height 860. */
const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: ${liqOne.col} ${liqOne.col};
  column-gap: ${liqOne.colGap};
  align-items: start;
  width: ${liqOne.contentMax};
  max-width: 100%;
  height: ${liqOne.mainRowH};
  min-height: ${liqOne.mainRowH};
  max-height: ${liqOne.mainRowH};
  margin-top: 24px;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 1375px) {
    width: 100%;
    grid-template-columns: 1fr;
    height: auto;
    min-height: 0;
    max-height: none;
    row-gap: 16px;
    overflow: visible;
  }
`

const RightCol = styled.div`
  width: ${liqOne.col};
  max-width: 100%;
  height: ${liqOne.mainRowH};
  min-height: ${liqOne.mainRowH};
  max-height: ${liqOne.mainRowH};
  display: flex;
  flex-direction: column;
  gap: ${liqOne.rightGap};
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 1375px) {
    width: 100%;
    height: auto;
    min-height: 0;
    max-height: none;
    overflow: visible;
  }
`

const Below = styled.div`
  margin-top: ${liqOne.belowMainGap};
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-width: 0;
`

function viewRaw(view: unknown): string | null {
  const raw = Array.isArray(view) ? view[0] : view
  return typeof raw === 'string' ? raw.trim().toLowerCase() : null
}

/**
 * Pixel-perfect unified Liquidity page (LIQUIDITY_PIXEL_PERFECTION_001).
 * Fixed 860px main row. Wizard never changes page layout.
 */
export const UnifiedLiquidityPage: React.FC = () => {
  const router = useRouter()
  const { setMode } = useLiquidityRuntime()
  const buildingRef = useRef<HTMLElement | null>(null)
  const addRef = useRef<HTMLElement | null>(null)

  const scrollTo = useCallback((el: HTMLElement | null) => {
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const focusPositions = useCallback(() => {
    const el = document.getElementById('liq-your-positions')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    if (!router.isReady) return
    const v = viewRaw(router.query.view)
    if (v === 'explore') {
      void router.replace('/pools')
      return
    }
    if (v === 'building' || v === 'liquidity-building') {
      setMode('Liquidity Building')
      requestAnimationFrame(() => scrollTo(buildingRef.current))
      return
    }
    if (v === 'add' || v === 'add-liquidity') {
      setMode('Add Liquidity')
      requestAnimationFrame(() => scrollTo(addRef.current))
      return
    }
    if (v === 'positions' || v === 'my-positions') {
      requestAnimationFrame(() => focusPositions())
      return
    }
    if (v === 'remove' || v === 'remove-liquidity') {
      setMode('Remove Liquidity')
      requestAnimationFrame(() => scrollTo(addRef.current))
      return
    }
    if (v === 'simulation') {
      setMode('Simulation')
      requestAnimationFrame(() => scrollTo(addRef.current))
    }
  }, [router.isReady, router.query.view, router, setMode, scrollTo, focusPositions])

  return (
    <Page data-testid="liq-one-unified-page" data-liquidity-one-page="true" data-pixel-perfection="001">
      <LiquidityOnePagePolishStyle />
      <LiquidityPageHeader />

      <ProductGrid data-testid="liq-one-product-grid" data-pixel-main-row="860">
        <LiquidityBuildingCard
          ref={(node) => {
            buildingRef.current = node
          }}
        />
        <RightCol data-testid="liq-one-right-col" data-pixel-right="860">
          <AddLiquidityCard
            ref={(node) => {
              addRef.current = node
            }}
            onViewPositions={focusPositions}
          />
          <DexLiquiditySnapshot />
        </RightCol>
      </ProductGrid>

      <Below>
        <WalletLiquidityOverview lbProgramCount={0} />
        <LiquidityPositions
          onAddLiquidity={() => {
            setMode('Add Liquidity')
            requestAnimationFrame(() => scrollTo(addRef.current))
          }}
          onOpenBuilding={() => {
            setMode('Liquidity Building')
            requestAnimationFrame(() => scrollTo(buildingRef.current))
          }}
        />
        <LiquidityEducationRail />
      </Below>
    </Page>
  )
}

export default UnifiedLiquidityPage
