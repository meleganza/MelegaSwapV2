import React, { useCallback, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { liquidityStudioLayout } from '../liquidityStudioTokens'
import { liqOne } from './onePageTokens'
import { LiquidityPageHeader } from './LiquidityPageHeader'
import { LiquidityBuildingCard } from './LiquidityBuildingCard'
import { AddLiquidityCard } from './AddLiquidityCard'
import { DexLiquiditySnapshot } from './DexLiquiditySnapshot'
import { WalletLiquidityOverview } from './WalletLiquidityOverview'
import { LiquidityPositions } from './LiquidityPositions'
import { LiquidityEducationRail } from './LiquidityEducationRail'

const Page = styled.div`
  width: 100%;
  max-width: ${liqOne.contentMax};
  margin: 0 auto;
  padding: ${liqOne.mainTopPad} 0 ${liqOne.bottomPad};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${liqOne.sectionGap};
  min-width: 0;

  @media (max-width: 767px) {
    padding: 20px 0 calc(${liquidityStudioLayout.mobileBottomPad});
    gap: 14px;
  }
`

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
  min-width: 0;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
  }
`

const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

function viewRaw(view: unknown): string | null {
  const raw = Array.isArray(view) ? view[0] : view
  return typeof raw === 'string' ? raw.trim().toLowerCase() : null
}

/**
 * Unified one-page Liquidity experience (DEX-LIQ-ONE-002).
 * No public tab rail. Deep links focus/scroll sections in place.
 *
 * Liquidity Building state lives only inside LiquidityBuildingPanel
 * (single useLiquidityBuildingCard instance).
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

  const focusBuilding = useCallback(
    (step?: string) => {
      setMode('Liquidity Building')
      const query: Record<string, string> = { view: 'building' }
      if (step) query.step = step
      void router.replace({ pathname: '/liquidity-studio', query }, undefined, { shallow: true })
      requestAnimationFrame(() => scrollTo(buildingRef.current))
    },
    [router, scrollTo, setMode],
  )

  const focusAdd = useCallback(() => {
    setMode('Add Liquidity')
    void router.replace({ pathname: '/liquidity-studio', query: { view: 'add' } }, undefined, { shallow: true })
    requestAnimationFrame(() => scrollTo(addRef.current))
  }, [router, scrollTo, setMode])

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
    <Page data-testid="liq-one-unified-page" data-liquidity-one-page="true">
      <LiquidityPageHeader />

      <ProductGrid data-testid="liq-one-product-grid">
        <LiquidityBuildingCard
          ref={(node) => {
            buildingRef.current = node
          }}
        />
        <RightCol>
          <AddLiquidityCard
            ref={(node) => {
              addRef.current = node
            }}
            onViewPositions={focusPositions}
          />
          <DexLiquiditySnapshot />
        </RightCol>
      </ProductGrid>

      <WalletLiquidityOverview lbProgramCount={0} />

      <LiquidityPositions
        lbPrograms={[]}
        onManageLb={() => focusBuilding('manage')}
        onAddManual={() => focusAdd()}
      />

      <LiquidityEducationRail />
    </Page>
  )
}

export default UnifiedLiquidityPage
