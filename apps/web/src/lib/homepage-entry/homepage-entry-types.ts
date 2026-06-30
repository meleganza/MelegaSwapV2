export type HomepageEntryManifest = {
  manifest: string
  api_version: string
  phase: string
  as_of: string
  implementation: 'live'
  mission: string
  blueprint_uri: string
  constitutional: {
    canonicalChain: string
    canonicalAsset: string
    status: string
    framing: string
  }
  core_routes: string[]
  secondary_routes: string[]
  advanced_routes: string[]
  legacy_routes: string[]
  machine_discovery: Array<{ label: string; uri: string }>
  removed_from_homepage: string[]
  disclaimer: string
}
