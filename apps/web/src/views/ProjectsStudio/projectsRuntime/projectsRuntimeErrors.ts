export type ProjectsRuntimeErrorCode =
  | 'PROJECT_NOT_FOUND'
  | 'NO_METADATA'
  | 'NO_WEBSITE'
  | 'NO_SOCIAL'
  | 'NO_MARKET_DATA'
  | 'NO_CONTRACT'
  | 'INDEXING_PENDING'
  | 'UNKNOWN'

export interface ProjectsRuntimeError {
  code: ProjectsRuntimeErrorCode
  message: string
}

const ERROR_CATALOG: Record<ProjectsRuntimeErrorCode, string> = {
  PROJECT_NOT_FOUND: 'No project matches this contract in the Melega registry.',
  NO_METADATA: 'Token metadata is not available from registry or explorer.',
  NO_WEBSITE: 'No official website discovered for this project.',
  NO_SOCIAL: 'No social channels discovered for this project.',
  NO_MARKET_DATA: 'Market data is unavailable from integrated sources.',
  NO_CONTRACT: 'No contract address is linked to this project.',
  INDEXING_PENDING: 'Project indexing is in progress — check back shortly.',
  UNKNOWN: 'An unexpected error occurred while loading project intelligence.',
}

export function createProjectsRuntimeError(code: ProjectsRuntimeErrorCode): ProjectsRuntimeError {
  return { code, message: ERROR_CATALOG[code] }
}

export function resolveProjectErrors(project: {
  slug?: string
  websiteUrl?: string
  socialLinks?: { type: string; url: string }[]
  resources?: { tokens: { address: string }[] }
  registryStatus?: string
}): ProjectsRuntimeError[] {
  const errors: ProjectsRuntimeError[] = []
  if (!project.slug) errors.push(createProjectsRuntimeError('PROJECT_NOT_FOUND'))
  if (!project.resources?.tokens?.length) errors.push(createProjectsRuntimeError('NO_CONTRACT'))
  if (!project.websiteUrl) errors.push(createProjectsRuntimeError('NO_WEBSITE'))
  if (!project.socialLinks?.length) errors.push(createProjectsRuntimeError('NO_SOCIAL'))
  if (project.registryStatus === 'archived') errors.push(createProjectsRuntimeError('INDEXING_PENDING'))
  return errors
}
