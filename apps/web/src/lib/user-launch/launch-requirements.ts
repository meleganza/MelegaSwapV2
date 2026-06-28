import { LaunchCapabilityId } from './launch-capabilities'
import { LaunchRequiredInput } from './launch-types'

export const LAUNCH_REQUIREMENTS: Record<LaunchCapabilityId, LaunchRequiredInput[]> = {
  create_token: [
    { id: 'token_name', label: 'Token name', required: true, notes: 'Labs handoff — not live on DEX' },
    { id: 'symbol', label: 'Symbol', required: true },
    { id: 'decimals', label: 'Decimals', required: true },
    { id: 'total_supply', label: 'Total supply policy', required: true, notes: 'Defined at deployment — no DEX deployer' },
  ],
  submit_token_metadata: [
    { id: 'contract_address', label: 'Contract address', required: true },
    { id: 'chain_id', label: 'Chain ID', required: true },
    { id: 'metadata_uri', label: 'Metadata URI', required: false, notes: 'Token list submission — Phase 2' },
  ],
  upload_logo: [
    { id: 'logo_asset', label: 'Logo asset', required: true, notes: 'CDN / token list pipeline — Phase 2' },
    { id: 'contract_address', label: 'Contract address', required: true },
  ],
  create_liquidity: [
    { id: 'token_a', label: 'Token A', required: true },
    { id: 'token_b', label: 'Token B', required: true },
    { id: 'amount_a', label: 'Amount A', required: true },
    { id: 'amount_b', label: 'Amount B', required: true },
  ],
  create_pool: [
    { id: 'token_a', label: 'Token A', required: true },
    { id: 'token_b', label: 'Token B', required: true },
    { id: 'initial_liquidity', label: 'Initial liquidity', required: true },
  ],
  create_farm: [
    { id: 'lp_pair', label: 'LP pair', required: true, notes: 'Protocol-governed farm creation' },
    { id: 'reward_token', label: 'Reward token', required: true },
    { id: 'allocation', label: 'Reward allocation', required: true },
  ],
  create_staking_pool: [
    { id: 'staking_token', label: 'Staking token', required: true },
    { id: 'reward_token', label: 'Reward token', required: true, notes: 'Sous Chef pool — protocol indexed' },
  ],
  launch_through_labs: [
    { id: 'labs_narrative', label: 'Validated Labs narrative', required: true },
    { id: 'project_slug', label: 'Project slug', required: false },
    { id: 'constitutional_validation', label: 'Constitutional validation', required: true },
  ],
  activate_economic_presence: [
    { id: 'project_binding', label: 'Project binding', required: true, notes: 'Read model activation — no on-chain writes' },
    { id: 'presence_targets', label: 'Presence targets', required: true },
  ],
}
