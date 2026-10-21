import React from 'react'
import { ProductPage } from '../components/ProductPage'
import QuoteGate from '../modules/trade/QuoteGate'
import { getBetaPageProps } from '../lib/page'
import { sectionById } from '../lib/sections'

export default function SwapPage() {
  return (
    <ProductPage section={sectionById('swap')}>
      <QuoteGate />
    </ProductPage>
  )
}

export const getServerSideProps = getBetaPageProps
