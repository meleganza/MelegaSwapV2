import React from 'react'
import { ProductPage } from '../components/ProductPage'
import EarnCatalogPanel from '../modules/earn/EarnCatalog'
import EarnReadPanel from '../modules/earn/EarnRead'
import { getBetaPageProps } from '../lib/page'
import { sectionById } from '../lib/sections'

export default function EarnPage() {
  return (
    <ProductPage section={sectionById('earn')}>
      <EarnReadPanel />
      <EarnCatalogPanel />
    </ProductPage>
  )
}

export const getServerSideProps = getBetaPageProps
