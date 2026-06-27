import { GetStaticPaths, GetStaticProps } from 'next'
import { NotFound } from '@pancakeswap/uikit'
import { CHAIN_IDS } from 'utils/wagmi'
import { getAllVenueSlugs, getVenueBySlug } from 'registry/venues/getVenueBySlug'
import { serializeVenueManifest } from 'registry/venues/manifest'
import { StaticVenueRecord } from 'registry/venues/types'
import Page from 'components/Layout/Page'
import VenueDetail from 'views/Venues/VenueDetail'

interface VenuePageProps {
  venue: StaticVenueRecord | null
  manifest: Record<string, unknown> | null
}

const VenuePage = ({ venue, manifest }: VenuePageProps) => {
  if (!venue || !manifest) {
    return <NotFound />
  }

  return (
    <Page>
      <VenueDetail venue={venue} manifest={manifest} />
    </Page>
  )
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: getAllVenueSlugs().map((slug) => ({ params: { slug } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<VenuePageProps> = async ({ params }) => {
  const slug = params?.slug as string
  const venue = getVenueBySlug(slug) ?? null

  if (!venue) {
    return { notFound: true }
  }

  return {
    props: {
      venue,
      manifest: serializeVenueManifest(venue),
    },
  }
}

VenuePage.chains = CHAIN_IDS

export default VenuePage
