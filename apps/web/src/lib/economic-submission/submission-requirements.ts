import { SubmissionCategoryId } from './submission-types'

export interface CategoryFieldRequirements {
  category: SubmissionCategoryId
  required: string[]
  optional: string[]
}

export const SUBMISSION_REQUIREMENTS: CategoryFieldRequirements[] = [
  { category: 'token_metadata', required: ['token_name', 'token_symbol', 'decimals', 'asset_slug'], optional: ['description'] },
  { category: 'token_logo', required: ['asset_slug', 'logo_uri'], optional: ['attribution'] },
  { category: 'website', required: ['project_slug', 'website_url'], optional: [] },
  { category: 'social_links', required: ['project_slug'], optional: ['twitter', 'telegram', 'discord'] },
  {
    category: 'project_narrative',
    required: ['narrative_title', 'narrative_summary', 'constitutional_fit'],
    optional: ['creator_contact'],
  },
  { category: 'whitepaper', required: ['project_slug', 'whitepaper_uri'], optional: [] },
  { category: 'audit_reference', required: ['asset_slug', 'audit_uri', 'auditor_name'], optional: ['audit_date'] },
  { category: 'category_classification', required: ['asset_slug', 'taxonomy_ids'], optional: [] },
  {
    category: 'economic_presence_request',
    required: ['presence_slug', 'chain_role', 'target_chain'],
    optional: ['bridge_notes'],
  },
  { category: 'launch_request', required: ['capability_type', 'project_slug'], optional: ['wallet_address'] },
  { category: 'future_ai_review', required: ['review_subject'], optional: ['agent_id'] },
]

export const getRequirementsForCategory = (category: SubmissionCategoryId) =>
  SUBMISSION_REQUIREMENTS.find((req) => req.category === category)
