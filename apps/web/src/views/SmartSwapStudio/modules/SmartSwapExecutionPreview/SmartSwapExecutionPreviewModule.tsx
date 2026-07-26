import { SmartSwapExecutionPreviewPanel } from './SmartSwapExecutionPreviewPanel'
import { useSmartSwapExecutionPreview } from './useSmartSwapExecutionPreview'
import {
  SmartSwapFeeTransparencyPanel,
  useSmartSwapFeeTransparency,
} from 'views/SmartSwapStudio/modules/SmartSwapFeeTransparency'
import {
  SmartSwapAIAssistancePanel,
  useSmartSwapAIAssistance,
} from 'views/SmartSwapStudio/modules/SmartSwapAIAssistance'
import {
  SmartSwapExecutionHandoffPanel,
  useSmartSwapExecutionHandoff,
} from 'views/SmartSwapStudio/modules/SmartSwapExecutionHandoff'

export type SmartSwapExecutionPreviewModuleProps = {
  /** When false, hide transparency + handoff (Instant mode). */
  showSmartTransparency?: boolean
}

/**
 * Smart-only stack. Mounted only when Smart experience is selected so Instant
 * never publishes Smart handoff state into the ingress bridge.
 */
function SmartTransparencyStack() {
  const result = useSmartSwapExecutionPreview()
  const feeModel = useSmartSwapFeeTransparency(result)
  const aiResult = useSmartSwapAIAssistance(result, feeModel)
  const handoff = useSmartSwapExecutionHandoff(result, feeModel)

  return (
    <>
      <SmartSwapExecutionPreviewPanel result={result} />
      <SmartSwapFeeTransparencyPanel model={feeModel} />
      <SmartSwapAIAssistancePanel result={aiResult} />
      <SmartSwapExecutionHandoffPanel handoff={handoff} />
    </>
  )
}

/**
 * Smart experience stack: preview → fee → AI → certified handoff.
 * SmartSwapForm remains the execution engine (user confirms there).
 */
export function SmartSwapExecutionPreviewModule({
  showSmartTransparency = true,
}: SmartSwapExecutionPreviewModuleProps) {
  // Early return BEFORE hooks in child — Instant must not touch handoff bridge.
  if (!showSmartTransparency) return null
  return <SmartTransparencyStack />
}
