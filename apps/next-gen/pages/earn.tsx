import React from 'react'
import { ProductPage } from '../components/ProductPage'
import EarnCatalogPanel from '../modules/earn/EarnCatalog'
import EarnPositionPanel from '../modules/earn/EarnPositions'
import EarnReadPanel from '../modules/earn/EarnRead'
import RetiredNativeEarn from '../modules/earn/RetiredNativeEarn'
import { getBetaPageProps } from '../lib/page'
import { sectionById } from '../lib/sections'

export default function EarnPage() {
  return (
    <ProductPage section={sectionById('earn')}>
      <EarnCatalogPanel native={<EarnReadPanel />} positions={
        <>
          <details className="secondary-positions"><summary>Your Beefy positions</summary><EarnPositionPanel /></details>
          <details className="secondary-positions terminated-section"><summary>Terminated native farms and pools</summary><RetiredNativeEarn /></details>
        </>
      } />
    </ProductPage>
  )
}

export const getServerSideProps = getBetaPageProps
