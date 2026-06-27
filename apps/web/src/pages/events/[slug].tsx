import { GetStaticPaths, GetStaticProps } from 'next'
import { NotFound } from '@pancakeswap/uikit'
import { CHAIN_IDS } from 'utils/wagmi'
import { getAllEventSlugs, getEventBySlug } from 'registry/events/getEventBySlug'
import { serializeEventManifest } from 'registry/events/manifest'
import { StaticEventRecord } from 'registry/events/types'
import { stripUndefinedDeep } from 'registry/venues/manifest'
import Page from 'components/Layout/Page'
import EventDetail from 'views/Events/EventDetail'

interface EventPageProps {
  event: StaticEventRecord | null
  manifest: Record<string, unknown> | null
}

const EventPage = ({ event, manifest }: EventPageProps) => {
  if (!event || !manifest) {
    return <NotFound />
  }

  return (
    <Page>
      <EventDetail event={event} manifest={manifest} />
    </Page>
  )
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: getAllEventSlugs().map((slug) => ({ params: { slug } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<EventPageProps> = async ({ params }) => {
  const slug = params?.slug as string
  const event = getEventBySlug(slug) ?? null

  if (!event) {
    return { notFound: true }
  }

  return {
    props: {
      event: stripUndefinedDeep(event),
      manifest: serializeEventManifest(event),
    },
  }
}

EventPage.chains = CHAIN_IDS

export default EventPage
