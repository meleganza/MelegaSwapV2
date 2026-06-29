import { stripUndefinedDeep } from 'registry/venues/manifest'
import { resolveHomepageBlueprint } from './homepage-blueprint-data'
import { HomepageBlueprint } from './homepage-blueprint-types'

export const serializeHomepageBlueprintManifest = (): HomepageBlueprint => {
  const blueprint = resolveHomepageBlueprint()
  return stripUndefinedDeep(blueprint) as HomepageBlueprint
}
