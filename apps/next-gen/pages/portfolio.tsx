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
      <RetiredPositionLookup />
      <section className="quote-panel" aria-labelledby="portfolio-beefy-title">
        <h2 id="portfolio-beefy-title">Beefy receipts</h2>
        <p className="muted-copy">
          This page does not scan Beefy. Listed BNB receipt balances are read on Earn after you submit a public address. No position is assumed.
        </p>
        <a href="/earn#beefy-positions">Read listed Beefy receipts on Earn</a>
      </section>
    </ProductPage>
  )
}

export const getServerSideProps = getBetaPageProps
