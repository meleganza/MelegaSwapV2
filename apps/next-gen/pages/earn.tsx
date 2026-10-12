import React from 'react'
import { ProductPage } from '../components/ProductPage'
import { getBetaPageProps } from '../lib/page'
import { sectionById } from '../lib/sections'

export default function EarnPage() {
  return <ProductPage section={sectionById('earn')} />
}

export const getServerSideProps = getBetaPageProps
