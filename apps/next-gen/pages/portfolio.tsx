import React from 'react'
import { ProductPage } from '../components/ProductPage'
import PortfolioGate from '../modules/portfolio/PortfolioGate'
import RetiredPositionLookup from '../modules/earn/RetiredPositionLookup'
import { getBetaPageProps } from '../lib/page'
import { sectionById } from '../lib/sections'

export default function PortfolioPage() {
  return (
    <ProductPage section={sectionById('portfolio')}>
      <PortfolioGate />
      <details className="secondary-positions"><summary>Terminated positions</summary><RetiredPositionLookup /></details>
      <a className="portfolio-earn-link" href="/earn#beefy-positions">Check Beefy positions</a>
    </ProductPage>
  )
}

export const getServerSideProps = getBetaPageProps
