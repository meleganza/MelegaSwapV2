import { getAllAssets } from 'registry/assets/getAllAssets'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { getAllVenues } from 'registry/venues/getAllVenues'

export interface HomepageLiveItem {
  id: string
  label: string
  meta?: string
  href: string
}

const toProjectItems = (limit = 6): HomepageLiveItem[] =>
  getAllProjects()
    .slice(0, limit)
    .map((project) => ({
      id: project.slug,
      label: project.displayName ?? project.slug,
      meta: project.status,
      href: `/projects/${project.slug}`,
    }))

const toAssetItems = (limit = 6): HomepageLiveItem[] =>
  getAllAssets()
    .slice(0, limit)
    .map((asset) => ({
      id: asset.slug,
      label: asset.displayName ?? asset.symbol ?? asset.slug,
      meta: asset.canonical ? 'Canonical' : undefined,
      href: `/assets/${asset.slug}`,
    }))

const toFarmVenueItems = (limit = 6): HomepageLiveItem[] =>
  getAllVenues()
    .filter((venue) => venue.venueType === 'farm')
    .slice(0, limit)
    .map((venue) => ({
      id: venue.slug,
      label: venue.displayName,
      meta: venue.lifecycle,
      href: '/farms',
    }))

const toPoolVenueItems = (limit = 6): HomepageLiveItem[] =>
  getAllVenues()
    .filter((venue) => venue.venueType === 'stake_pool')
    .slice(0, limit)
    .map((venue) => ({
      id: venue.slug,
      label: venue.displayName,
      meta: 'Staking pool',
      href: '/pools',
    }))

/** Indexed registry data for homepage modules — no fabricated metrics. */
export const resolveHomepageLiveSections = () => ({
  trendingProjects: toProjectItems(),
  trendingAssets: toAssetItems(),
  topFarms: toFarmVenueItems(),
  topPools: toPoolVenueItems(),
  trendingRibbon: [...toProjectItems(3), ...toAssetItems(3)],
})

export default resolveHomepageLiveSections
