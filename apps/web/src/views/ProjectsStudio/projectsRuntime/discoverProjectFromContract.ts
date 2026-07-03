import { getAllProjects } from 'registry/projects/getAllProjects'
import type { StaticProjectRecord } from 'registry/projects/types'
import { createProjectsRuntimeError, type ProjectsRuntimeError } from './projectsRuntimeErrors'

export interface ContractDiscoveryResult {
  found: boolean
  project?: StaticProjectRecord
  name?: string
  ticker?: string
  logo?: string
  website?: string
  twitter?: string
  telegram?: string
  discord?: string
  github?: string
  whitepaper?: string
  explorer?: string
  errors: ProjectsRuntimeError[]
}

function normalizeAddress(address: string): string {
  return address.trim().toLowerCase()
}

function socialUrl(project: StaticProjectRecord, type: string): string | undefined {
  return project.socialLinks?.find((s) => s.type === type)?.url
}

function mapRegistryProject(project: StaticProjectRecord): ContractDiscoveryResult {
  const token = project.resources.tokens[0]
  const errors: ProjectsRuntimeError[] = []
  if (!token?.address) errors.push(createProjectsRuntimeError('NO_CONTRACT'))
  if (!project.displayName) errors.push(createProjectsRuntimeError('NO_METADATA'))

  return {
    found: true,
    project,
    name: project.displayName,
    ticker: token?.symbol,
    logo: token?.symbol?.slice(0, 2),
    website: project.websiteUrl,
    twitter: socialUrl(project, 'twitter'),
    telegram: socialUrl(project, 'telegram'),
    discord: socialUrl(project, 'discord'),
    github: socialUrl(project, 'github'),
    whitepaper: project.docsUrl,
    explorer: token?.address,
    errors,
  }
}

export function discoverProjectFromContract(
  contract: string,
  chainId?: number,
): ContractDiscoveryResult {
  const normalized = normalizeAddress(contract)
  if (!normalized || !normalized.startsWith('0x') || normalized.length < 10) {
    return {
      found: false,
      errors: [createProjectsRuntimeError('NO_CONTRACT')],
    }
  }

  const projects = getAllProjects()
  const match = projects.find((project) =>
    project.resources.tokens.some(
      (token) =>
        token.address.toLowerCase() === normalized && (chainId == null || token.chainId === chainId),
    ),
  )

  if (match) return mapRegistryProject(match)

  return {
    found: false,
    errors: [createProjectsRuntimeError('PROJECT_NOT_FOUND')],
  }
}

export function findProjectBySlug(slug: string): StaticProjectRecord | undefined {
  return getAllProjects().find((p) => p.slug === slug)
}
