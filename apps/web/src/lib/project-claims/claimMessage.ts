import { ethers } from 'ethers'
import type { ProjectClaimMessageInput, ProjectClaimMetadata, ProjectClaimRecord, PublicProjectClaim } from './types'

export function normalizeProjectHandle(raw: string): string {
  return raw
    .trim()
    .replace(/^@+/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export function normalizeClaimMetadata(input: ProjectClaimMetadata): ProjectClaimMetadata {
  const text = (value: unknown, max: number) =>
    String(value ?? '')
      .trim()
      .slice(0, max)
  const optional = (value: unknown, max: number) => text(value, max) || null
  return {
    name: text(input?.name, 80),
    symbol: text(input?.symbol, 24).toUpperCase(),
    handle: normalizeProjectHandle(text(input?.handle, 80)),
    description: text(input?.description, 640),
    logo: optional(input?.logo, 500),
    website: optional(input?.website, 500),
    x: optional(input?.x, 500),
    telegram: optional(input?.telegram, 500),
    discord: optional(input?.discord, 500),
  }
}

export function buildProjectClaimMessage(input: ProjectClaimMessageInput): string {
  const metadata = normalizeClaimMetadata(input.metadata)
  const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(metadata)))
  return [
    'Melega DEX Project Claim',
    '',
    `Chain ID: ${input.chainId}`,
    `Contract: ${input.contract.toLowerCase()}`,
    `Claimant: ${input.claimant.toLowerCase()}`,
    `Project: @${metadata.handle}`,
    `Content hash: ${contentHash}`,
    `Issued at: ${input.issuedAt}`,
    '',
    'Signing proves wallet control. It does not authorize a token transfer.',
  ].join('\n')
}

export function toPublicProjectClaim(record: ProjectClaimRecord): PublicProjectClaim {
  const { schema, chainId, contract, slug, metadata, publishedAt } = record
  return { schema, chainId, contract, slug, metadata, publishedAt }
}
