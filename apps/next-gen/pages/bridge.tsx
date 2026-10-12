import React from 'react'
import { ProductPage } from '../components/ProductPage'
import { getBetaPageProps } from '../lib/page'
import { sectionById } from '../lib/sections'

export default function BridgePage() {
  return <ProductPage section={sectionById('bridge')} />
}

export const getServerSideProps = getBetaPageProps
