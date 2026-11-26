import React from 'react'
import type { GetServerSideProps } from 'next'
import { earnSandboxUrl } from '../lib/earnSandbox'
import { ProductPage } from '../components/ProductPage'
import EarnCatalogPanel from '../modules/earn/EarnCatalog'
import EarnPositionPanel from '../modules/earn/EarnPositions'
import RetiredNativeEarn from '../modules/earn/RetiredNativeEarn'
import { getBetaPageProps } from '../lib/page'
import { sectionById } from '../lib/sections'

export default function EarnPage({ sandboxUrl }: { sandboxUrl: string | null }) {
  return (
    <ProductPage section={sectionById('earn')}>
      <EarnCatalogPanel sandboxUrl={sandboxUrl} positions={
        <>
          <details className="secondary-positions"><summary>Your Beefy positions</summary><EarnPositionPanel /></details>
          <details className="secondary-positions terminated-section"><summary>Terminated native farms and pools</summary><RetiredNativeEarn /></details>
        </>
      } />
    </ProductPage>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  await getBetaPageProps(ctx)
  return { props: { sandboxUrl: earnSandboxUrl(process.env) } }
}
