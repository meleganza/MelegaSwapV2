import { GetStaticPaths, GetStaticProps } from 'next'
import { NotFound } from '@pancakeswap/uikit'
import { CHAIN_IDS } from 'utils/wagmi'
import { getAllAssetSlugs, getAssetBySlug } from 'registry/assets/getAssetBySlug'
import { serializeAssetManifest } from 'registry/assets/manifest'
import { StaticAssetRecord } from 'registry/assets/types'
import Page from 'components/Layout/Page'
import AssetDetail from 'views/Assets/AssetDetail'

interface AssetPageProps {
  asset: StaticAssetRecord | null
  manifest: Record<string, unknown> | null
}

const AssetPage = ({ asset, manifest }: AssetPageProps) => {
  if (!asset || !manifest) {
    return <NotFound />
  }

  return (
    <Page>
      <AssetDetail asset={asset} manifest={manifest} />
    </Page>
  )
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: getAllAssetSlugs().map((slug) => ({ params: { slug } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<AssetPageProps> = async ({ params }) => {
  const slug = params?.slug as string
  const asset = getAssetBySlug(slug) ?? null

  if (!asset) {
    return { notFound: true }
  }

  return {
    props: {
      asset,
      manifest: serializeAssetManifest(asset),
    },
  }
}

AssetPage.chains = CHAIN_IDS

export default AssetPage
