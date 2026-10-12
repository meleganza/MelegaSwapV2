import React from 'react'
import { ProductPage } from '../components/ProductPage'
import { getBetaPageProps } from '../lib/page'
import { sectionById } from '../lib/sections'

export default function SwapPage() {
  return <ProductPage section={sectionById('swap')} />
}

export const getServerSideProps = getBetaPageProps
