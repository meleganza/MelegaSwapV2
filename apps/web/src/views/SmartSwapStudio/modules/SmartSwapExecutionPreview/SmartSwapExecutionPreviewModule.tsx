import { SmartSwapExecutionPreviewPanel } from './SmartSwapExecutionPreviewPanel'
import { useSmartSwapExecutionPreview } from './useSmartSwapExecutionPreview'
import {
  SmartSwapFeeTransparencyPanel,
  useSmartSwapFeeTransparency,
} from 'views/SmartSwapStudio/modules/SmartSwapFeeTransparency'

/**
 * Module 003 + 004 mount — preview then fee transparency.
 * SmartSwapForm remains the execution engine.
 */
export function SmartSwapExecutionPreviewModule() {
  const result = useSmartSwapExecutionPreview()
  const feeModel = useSmartSwapFeeTransparency(result)
  return (
    <>
      <SmartSwapExecutionPreviewPanel result={result} />
      <SmartSwapFeeTransparencyPanel model={feeModel} />
    </>
  )
}
