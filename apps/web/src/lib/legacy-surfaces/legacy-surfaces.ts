import { LegacySurfaceRecord } from './legacy-types'

export const LEGACY_SURFACES_VERSION = '0.1.0'

export const LEGACY_ILO_RETIRED_AS_OF = '2026-06-28'

export const LEGACY_ILO_DISCLAIMER =
  'Legacy ILO route preserved for link compatibility only. No active launch mechanism. Historical IFO code remains in repository but is not rendered at /ilo.'

export const LEGACY_ILO_SURFACE: LegacySurfaceRecord = {
  id: 'legacy_ilo',
  legacyRoute: '/ilo',
  label: 'Legacy ILO',
  status: 'retired',
  retiredAsOf: LEGACY_ILO_RETIRED_AS_OF,
  summary:
    'The legacy ILO/IFO pad has been superseded by Economic Activation and the User Launch layer. This route no longer exposes active launch functionality.',
  historicalModule: 'views/Ilos',
  contractLogicUntouched: true,
  supersededBy: [
    {
      route: '/build-studio#build-import',
      label: 'Operational Launch Console',
      purpose: 'User creation and listing capabilities',
    },
    {
      route: '/new-project',
      label: 'Economic Activation Runtime',
      purpose: 'Labs → DEX activation read model',
    },
    {
      route: '/command-center',
      label: 'User Economic Workspace',
      purpose: 'Operational center for indexed economic activity',
    },
  ],
  warnings: [
    'Do not treat /ilo as an active launch mechanism',
    'No fake launch buttons or execution on this route',
    'IFO contract logic and views/Ilos/ historical code not removed',
  ],
}
