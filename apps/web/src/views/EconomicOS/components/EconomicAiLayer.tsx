import React from 'react'
import { EconomicDetailToggle, EconomicDetailToggleProps } from './EconomicDetailToggle'

export const AI_AGENT_DETAILS_TITLE = 'AI agent details'
export const MANIFEST_TITLE = 'Manifest'
export const TECHNICAL_DETAILS_TITLE = 'Technical details'

export type EconomicAiLayerProps = Omit<EconomicDetailToggleProps, 'variant'>

/** Collapsed machine / manifest / schema layer — never shown by default. */
export const EconomicAiLayer: React.FC<EconomicAiLayerProps> = ({
  title = AI_AGENT_DETAILS_TITLE,
  children,
  defaultOpen = false,
}) => (
  <EconomicDetailToggle title={title} variant="ai" defaultOpen={defaultOpen}>
    {children}
  </EconomicDetailToggle>
)

export default EconomicAiLayer
