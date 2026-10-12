import React from 'react'
import { ProductPage } from '../components/ProductPage'
import { getBetaPageProps } from '../lib/page'
import { sectionById } from '../lib/sections'

export default function PortfolioPage() {
  return <ProductPage section={sectionById('portfolio')} />
}

export const getServerSideProps = getBetaPageProps
