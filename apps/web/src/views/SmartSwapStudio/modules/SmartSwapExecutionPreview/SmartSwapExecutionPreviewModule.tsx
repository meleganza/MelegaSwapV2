import { SmartSwapExecutionPreviewPanel } from './SmartSwapExecutionPreviewPanel'
import { useSmartSwapExecutionPreview } from './useSmartSwapExecutionPreview'

/**
 * Module 003 mount point — transparency only; SmartSwapForm remains the execution engine.
 */
export function SmartSwapExecutionPreviewModule() {
  const result = useSmartSwapExecutionPreview()
  return <SmartSwapExecutionPreviewPanel result={result} />
}
