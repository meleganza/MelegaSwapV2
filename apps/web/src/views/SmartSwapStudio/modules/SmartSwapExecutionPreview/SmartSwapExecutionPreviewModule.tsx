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

/**
 * Modules 003 + 004 + 006 — preview, fee transparency, then optional AI assistance.
 * SmartSwapForm remains the execution engine. AI never blocks confirmation.
 */
export function SmartSwapExecutionPreviewModule() {
  const result = useSmartSwapExecutionPreview()
  const feeModel = useSmartSwapFeeTransparency(result)
  const aiResult = useSmartSwapAIAssistance(result, feeModel)
  return (
    <>
      <SmartSwapExecutionPreviewPanel result={result} />
      <SmartSwapFeeTransparencyPanel model={feeModel} />
      <SmartSwapAIAssistancePanel result={aiResult} />
    </>
  )
}
