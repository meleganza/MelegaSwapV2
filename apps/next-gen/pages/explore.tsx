import React from 'react'
import { ProductPage } from '../components/ProductPage'
import { getBetaPageProps } from '../lib/page'
import { uxSectionById } from '../lib/uxSections'

import ExploreDiscovery from '../modules/explore/ExploreDiscovery'

export default function ExplorePage() {
  return (
    <ProductPage section={uxSectionById('explore')}>
      <ExploreDiscovery />
    </ProductPage>
  )
}

export const getServerSideProps = getBetaPageProps
