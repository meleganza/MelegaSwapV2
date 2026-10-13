import React from 'react'
import { ProductPage } from '../components/ProductPage'
import { getBetaPageProps } from '../lib/page'
import { uxSectionById } from '../lib/uxSections'

export default function ExplorePage() {
  return <ProductPage section={uxSectionById('explore')} />
}

export const getServerSideProps = getBetaPageProps
