import { getConstitutionalCanonicalEconomy } from 'lib/economic-activation'
import { SMART_EXECUTION_DISCLAIMER } from './execution-constraints'
import { ExecutionCandidate } from './execution-types'

const ILLUSTRATIVE_NOTE =
  'Illustrative sample — not a live quote, route, or on-chain price.'

export const SAMPLE_EXECUTION_CANDIDATES: ExecutionCandidate[] = [
  {
    id: 'melega-v2-canonical',
    label: 'Melega V2 Canonical Pool',
    venue: 'Melega DEX V2',
    chain: 'BNB Chain',
    illustrative: true,
    disclaimer: ILLUSTRATIVE_NOTE,
    dimensions: [
      { id: 'price_quality', label: 'Price Quality', score: 92, weight: 0.22, notes: 'Best illustrative effective price on canonical MARCO/BNB' },
      { id: 'slippage_risk', label: 'Slippage Risk', score: 88, weight: 0.18, notes: 'Low illustrative slippage at sample size' },
      { id: 'gas_efficiency', label: 'Gas Efficiency', score: 85, weight: 0.14, notes: 'Direct V2 swap path on BNB Chain' },
      { id: 'liquidity_confidence', label: 'Liquidity Confidence', score: 90, weight: 0.18, notes: 'Canonical pool depth indexed in registry' },
      { id: 'venue_health', label: 'Venue Health', score: 94, weight: 0.14, notes: 'Primary DEX venue — observed LIVE' },
      { id: 'canonical_alignment', label: 'Canonical Alignment', score: 98, weight: 0.14, notes: 'MARCO on BNB Chain — constitutional match' },
      { id: 'civilization_benefit', label: 'Civilization Benefit', score: 72, weight: 0, notes: 'Moderate ecosystem routing benefit — cannot override quality' },
    ],
  },
  {
    id: 'melega-v2-alt-route',
    label: 'Melega V2 Alt Route',
    venue: 'Melega DEX V2',
    chain: 'BNB Chain',
    illustrative: true,
    disclaimer: ILLUSTRATIVE_NOTE,
    dimensions: [
      { id: 'price_quality', label: 'Price Quality', score: 86, weight: 0.22, notes: 'Slightly worse illustrative price via multi-hop sample' },
      { id: 'slippage_risk', label: 'Slippage Risk', score: 82, weight: 0.18, notes: 'Higher illustrative slippage on alt hop' },
      { id: 'gas_efficiency', label: 'Gas Efficiency', score: 78, weight: 0.14, notes: 'Extra hop increases illustrative gas' },
      { id: 'liquidity_confidence', label: 'Liquidity Confidence', score: 84, weight: 0.18, notes: 'Adequate depth on secondary hop' },
      { id: 'venue_health', label: 'Venue Health', score: 94, weight: 0.14, notes: 'Same venue family — observed LIVE' },
      { id: 'canonical_alignment', label: 'Canonical Alignment', score: 95, weight: 0.14, notes: 'Still on canonical chain and asset' },
      { id: 'civilization_benefit', label: 'Civilization Benefit', score: 68, weight: 0, notes: 'Minor routing diversity benefit' },
    ],
  },
  {
    id: 'ecosystem-treasury-route',
    label: 'Ecosystem Treasury Route',
    venue: 'Treasury Runtime (sample)',
    chain: 'BNB Chain',
    illustrative: true,
    disclaimer: ILLUSTRATIVE_NOTE,
    dimensions: [
      { id: 'price_quality', label: 'Price Quality', score: 74, weight: 0.22, notes: 'Worse illustrative price — treasury fee sample' },
      { id: 'slippage_risk', label: 'Slippage Risk', score: 70, weight: 0.18, notes: 'Higher illustrative slippage envelope' },
      { id: 'gas_efficiency', label: 'Gas Efficiency', score: 72, weight: 0.14, notes: 'Additional illustrative routing overhead' },
      { id: 'liquidity_confidence', label: 'Liquidity Confidence', score: 76, weight: 0.18, notes: 'Thinner illustrative liquidity window' },
      { id: 'venue_health', label: 'Venue Health', score: 88, weight: 0.14, notes: 'Phase 2 treasury surface — sample only' },
      { id: 'canonical_alignment', label: 'Canonical Alignment', score: 90, weight: 0.14, notes: 'Canonical chain — non-primary venue path' },
      { id: 'civilization_benefit', label: 'Civilization Benefit', score: 95, weight: 0, notes: 'High ecosystem benefit — rejected if quality gap is material' },
    ],
  },
  {
    id: 'presence-bridge-sample',
    label: 'Economic Presence Bridge',
    venue: 'Bridge Sample (Polygon)',
    chain: 'Polygon',
    illustrative: true,
    disclaimer: ILLUSTRATIVE_NOTE,
    dimensions: [
      { id: 'price_quality', label: 'Price Quality', score: 68, weight: 0.22, notes: 'Illustrative cross-presence price — not canonical' },
      { id: 'slippage_risk', label: 'Slippage Risk', score: 62, weight: 0.18, notes: 'Bridge + swap illustrative slippage stack' },
      { id: 'gas_efficiency', label: 'Gas Efficiency', score: 55, weight: 0.14, notes: 'Multi-chain illustrative gas burden' },
      { id: 'liquidity_confidence', label: 'Liquidity Confidence', score: 65, weight: 0.18, notes: 'Presence chain liquidity — not canonical pool' },
      { id: 'venue_health', label: 'Venue Health', score: 42, weight: 0.14, notes: 'Below venue health floor — bridge sample unverified' },
      { id: 'canonical_alignment', label: 'Canonical Alignment', score: 45, weight: 0.14, notes: 'Economic Presence only — not BNB Chain canonical' },
      { id: 'civilization_benefit', label: 'Civilization Benefit', score: 80, weight: 0, notes: 'Presence expansion benefit — insufficient to override quality' },
    ],
  },
]

export const getSampleCandidates = (): ExecutionCandidate[] =>
  SAMPLE_EXECUTION_CANDIDATES.map((candidate) => ({
    ...candidate,
    dimensions: candidate.dimensions.map((dimension) => ({ ...dimension })),
  }))

export const getSmartExecutionConstitutional = () => getConstitutionalCanonicalEconomy()

export const getSmartExecutionDisclaimer = (): string => SMART_EXECUTION_DISCLAIMER
