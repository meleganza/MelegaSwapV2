import { GetStaticPaths, GetStaticProps } from 'next'
import { NotFound } from '@pancakeswap/uikit'
import { CHAIN_IDS } from 'utils/wagmi'
import { getAllCollectibleSlugs, getCollectibleBySlug } from 'registry/collectibles/getCollectibleBySlug'
import {
  serializeCollectibleManifest,
  stripCollectibleManifest,
} from 'registry/collectibles/collectible-manifest'
import { StaticCollectibleRecord } from 'registry/collectibles/collectible-types'
import Page from 'components/Layout/Page'
import CollectibleDetail from 'views/Collectibles/CollectibleDetail'

interface CollectiblePageProps {
  record: StaticCollectibleRecord | null
  manifest: Record<string, unknown> | null
}

const CollectibleSlugPage = ({ record, manifest }: CollectiblePageProps) => {
  if (!record || !manifest) {
    return <NotFound />
  }

  return (
    <Page>
      <CollectibleDetail record={record} manifest={manifest} />
    </Page>
  )
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: getAllCollectibleSlugs().map((slug) => ({ params: { slug } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<CollectiblePageProps> = async ({ params }) => {
  const slug = params?.slug as string
  const record = getCollectibleBySlug(slug) ?? null

  if (!record) {
    return { notFound: true }
  }

  return {
    props: {
      record,
      manifest: stripCollectibleManifest(serializeCollectibleManifest(record)),
    },
  }
}

CollectibleSlugPage.chains = CHAIN_IDS

export default CollectibleSlugPage
