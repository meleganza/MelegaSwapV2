import { GetStaticPaths, GetStaticProps } from 'next'
import { NotFound } from '@pancakeswap/uikit'
import { CHAIN_IDS } from 'utils/wagmi'
import { getAllPresenceSlugs, getPresenceBySlug } from 'registry/presence/getPresenceBySlug'
import { serializePresenceManifest, stripPresenceManifest } from 'registry/presence/presence-manifest'
import { StaticPresenceRecord } from 'registry/presence/presence-types'
import Page from 'components/Layout/Page'
import PresenceDetail from 'views/Presence/PresenceDetail'

interface PresencePageProps {
  record: StaticPresenceRecord | null
  manifest: Record<string, unknown> | null
}

const PresenceSlugPage = ({ record, manifest }: PresencePageProps) => {
  if (!record || !manifest) {
    return <NotFound />
  }

  return (
    <Page>
      <PresenceDetail record={record} manifest={manifest} />
    </Page>
  )
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: getAllPresenceSlugs().map((slug) => ({ params: { slug } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<PresencePageProps> = async ({ params }) => {
  const slug = params?.slug as string
  const record = getPresenceBySlug(slug) ?? null

  if (!record) {
    return { notFound: true }
  }

  return {
    props: {
      record,
      manifest: stripPresenceManifest(serializePresenceManifest(record)),
    },
  }
}

PresenceSlugPage.chains = CHAIN_IDS

export default PresenceSlugPage
