import { fingerprint } from '../evidence/evidenceId'
import { normalizeEvmAddress, toCaip2ChainId } from '../caip'
import type { ParticipationOpportunityType } from './schema'

export function buildParticipationId(parts: {
  projectId: string
  type: ParticipationOpportunityType
  chainId: number
  subjectKey: string
}): string {
  return `part_${fingerprint(
    [parts.projectId, parts.type, toCaip2ChainId(parts.chainId), parts.subjectKey].join('\u001f'),
  )}`
}

export function buildDestinationId(parts: {
  projectId: string
  module: string
  href: string
}): string {
  return `pdst_${fingerprint([parts.projectId, parts.module, parts.href].join('\u001f'))}`
}

export function buildParticipationRevision(parts: string[]): string {
  return fingerprint(parts.slice().sort().join('|'))
}

export function addressFromAssetRef(ref: string | null | undefined): string | null {
  if (!ref) return null
  const trimmed = ref.trim()
  const tokenMatch = /^token:\/\/(\d+)\/(0x[a-fA-F0-9]{40})$/i.exec(trimmed)
  if (tokenMatch) return normalizeEvmAddress(tokenMatch[2])
  const caip19 = /^eip155:\d+\/(?:erc20:)?(0x[a-fA-F0-9]{40})$/i.exec(trimmed)
  if (caip19) return normalizeEvmAddress(caip19[1])
  const uai = /\/(\d+)\/(0x[a-fA-F0-9]{40})@/i.exec(trimmed)
  if (uai) return normalizeEvmAddress(uai[2])
  return normalizeEvmAddress(trimmed)
}
