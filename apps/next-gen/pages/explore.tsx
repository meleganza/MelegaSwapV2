import React from 'react'
import dynamic from 'next/dynamic'
import { ProductPage } from '../components/ProductPage'
import { getBetaPageProps } from '../lib/page'
import { uxSectionById } from '../lib/uxSections'

const ExploreDiscovery = dynamic(() => import('../modules/explore/ExploreDiscovery'), { ssr: false })

export default function ExplorePage() {
  return (
    <ProductPage section={uxSectionById('explore')}>
      <ExploreDiscovery />
    </ProductPage>
  )
}

export const getServerSideProps = getBetaPageProps
