import {
  ADVANCED_SURFACES,
  CORE_SURFACES,
  LEGACY_SURFACES,
  REMOVE_FROM_HOMEPAGE,
  SECONDARY_SURFACES,
  resolveHomepageBlueprint,
} from 'lib/homepage-blueprint'
import { HomepageEntryManifest } from './homepage-entry-types'

export const HOMEPAGE_ENTRY_VERSION = '0.1.0'

export const HOMEPAGE_ENTRY_AS_OF = '2026-06-29'

export const HOMEPAGE_ENTRY_DISCLAIMER =
  'Civilization Entry Point (Mission 22) — orientation layer only. No on-chain execution on homepage.'

export const HOMEPAGE_MACHINE_DISCOVERY = [
  { label: 'Surface Map', uri: '/map' },
  { label: 'Mainnet Readiness Gate', uri: '/registry/readiness/mainnet-gate.json' },
  { label: 'Homepage Blueprint', uri: '/registry/blueprints/homepage-entry-point.json' },
  { label: 'Homepage Manifest', uri: '/registry/homepage/index.json' },
  { label: 'Surface Index', uri: '/registry/surfaces/index.json' },
]

export const resolveHomepageEntryManifest = (): HomepageEntryManifest => {
  const blueprint = resolveHomepageBlueprint()

  return {
    manifest: 'manifest://melega/platform/homepage-entry-point@0.1.0',
    api_version: HOMEPAGE_ENTRY_VERSION,
    phase: 'civilization_entry_point',
    as_of: HOMEPAGE_ENTRY_AS_OF,
    implementation: 'live',
    mission: 'Mission 22 — Civilization Entry Point Implementation',
    blueprint_uri: '/registry/blueprints/homepage-entry-point.json',
    constitutional: { ...blueprint.constitutional },
    core_routes: CORE_SURFACES.map((surface) => surface.route),
    secondary_routes: SECONDARY_SURFACES.map((surface) => surface.route),
    advanced_routes: ADVANCED_SURFACES.map((surface) => surface.route),
    legacy_routes: LEGACY_SURFACES.map((surface) => surface.route),
    machine_discovery: HOMEPAGE_MACHINE_DISCOVERY.map((entry) => ({ ...entry })),
    removed_from_homepage: [...REMOVE_FROM_HOMEPAGE],
    disclaimer: HOMEPAGE_ENTRY_DISCLAIMER,
  }
}
