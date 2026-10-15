import React from 'react'
import { ProductPage } from '../components/ProductPage'
import EarnCatalogPanel from '../modules/earn/EarnCatalog'
import EarnPositionPanel from '../modules/earn/EarnPositions'
import { getBetaPageProps } from '../lib/page'
import { sectionById } from '../lib/sections'

export default function EarnPage() {
  return (
    <ProductPage section={sectionById('earn')}>
      <EarnCatalogPanel />
      <details className="secondary-disclosure"><summary>Find my Beefy positions</summary><EarnPositionPanel /></details>
    </ProductPage>
  )
}

export const getServerSideProps = getBetaPageProps
