/**
 * Pure builder for Passport My Projects.
 * No Passport-level controlled-projects producer today — empty + create CTA.
 */
import {
  PROJECTS_CREATE_HREF,
  type PassportProjectCardModel,
  type PassportProjectsViewModel,
} from './passportProjectsTypes'

export type PassportProjectsInput = {
  address?: string | null
  loading?: boolean
  /** Test-only controlled project rows — never ship production mocks. */
  fixtureProjects?: readonly PassportProjectCardModel[] | null
  sourceUnavailable?: boolean
}

export function buildPassportProjectsViewModel(
  input: PassportProjectsInput = {},
): PassportProjectsViewModel {
  const loading = Boolean(input.loading)
  const walletConnected = Boolean(input.address)
  const sourceAvailable = !input.sourceUnavailable

  if (!sourceAvailable) {
    return {
      loading,
      walletConnected,
      sourceAvailable: false,
      projects: [],
      emptyExplanation: 'Controlled projects source unavailable. Create a project on List when ready.',
      createHref: PROJECTS_CREATE_HREF,
    }
  }

  if (input.fixtureProjects) {
    return {
      loading,
      walletConnected,
      sourceAvailable: true,
      projects: input.fixtureProjects,
      emptyExplanation:
        'Projects you control will appear here. Ownership is never inferred from token holdings.',
      createHref: PROJECTS_CREATE_HREF,
    }
  }

  // Production: no Passport controlled-projects feed yet.
  return {
    loading,
    walletConnected,
    sourceAvailable: true,
    projects: [],
    emptyExplanation: walletConnected
      ? 'No controlled projects yet. Ownership is never inferred from token holdings.'
      : 'Connect a wallet to manage projects you control, or create a new project on List.',
    createHref: PROJECTS_CREATE_HREF,
  }
}
