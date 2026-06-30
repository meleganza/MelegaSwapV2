import { stripUndefinedDeep } from 'registry/venues/manifest'
import { resolveAiAgentExperienceAudit } from './experience-audit-data'
import { AiAgentExperienceAudit } from './experience-audit-types'

export const serializeAiAgentExperienceManifest = (): AiAgentExperienceAudit => {
  const audit = resolveAiAgentExperienceAudit()
  return stripUndefinedDeep(audit) as AiAgentExperienceAudit
}
