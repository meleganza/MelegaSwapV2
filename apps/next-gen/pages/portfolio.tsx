import React from 'react'
import { ProductPage } from '../components/ProductPage'
import PortfolioGate from '../modules/portfolio/PortfolioGate'
import { getBetaPageProps } from '../lib/page'
import { sectionById } from '../lib/sections'

export default function PortfolioPage() {
  return (
    <ProductPage section={sectionById('portfolio')}>
      <PortfolioGate />
    </ProductPage>
  )
}

export const getServerSideProps = getBetaPageProps
