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
 * Smart experience stack: preview → fee → AI → certified handoff.
 * SmartSwapForm remains the execution engine (user confirms there).
 */
export function SmartSwapExecutionPreviewModule({
  showSmartTransparency = true,
}: SmartSwapExecutionPreviewModuleProps) {
  const result = useSmartSwapExecutionPreview()
  const feeModel = useSmartSwapFeeTransparency(result)
  const aiResult = useSmartSwapAIAssistance(result, feeModel)
  const handoff = useSmartSwapExecutionHandoff(result, feeModel)

  if (!showSmartTransparency) return null

  return (
    <>
      <SmartSwapExecutionPreviewPanel result={result} />
      <SmartSwapFeeTransparencyPanel model={feeModel} />
      <SmartSwapAIAssistancePanel result={aiResult} />
      <SmartSwapExecutionHandoffPanel handoff={handoff} />
    </>
  )
}
