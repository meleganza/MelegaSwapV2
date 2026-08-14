/**
 * Isolated Smart Swap form island — real code-split target for Project Page.
 * Do not modify Smart Swap engine internals; this file only re-exports the form.
 */
import React from 'react'
import { Currency } from '@pancakeswap/sdk'
import { SmartSwapForm } from 'views/Swap/SmartSwap'

type Props = {
  handleOutputSelect: (currency: Currency) => void
}

const ProjectSwapFormIsland: React.FC<Props> = ({ handleOutputSelect }) => (
  <SmartSwapForm handleOutputSelect={handleOutputSelect} />
)

export default ProjectSwapFormIsland
