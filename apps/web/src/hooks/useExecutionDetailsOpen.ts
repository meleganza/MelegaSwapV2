import { useEffect, useState, useCallback } from 'react'
import {
  getExecutionDetailsOpen,
  setExecutionDetailsOpen,
  subscribeExecutionDetailsOpen,
  toggleExecutionDetailsOpen,
} from 'lib/smart-swap-ux-stability'

/** Shared Execution Details accordion state — open/close without layout corruption. */
export function useExecutionDetailsOpen() {
  const [open, setOpen] = useState(getExecutionDetailsOpen)

  useEffect(() => subscribeExecutionDetailsOpen(setOpen), [])

  const set = useCallback((next: boolean) => {
    setExecutionDetailsOpen(next)
  }, [])

  const toggle = useCallback(() => toggleExecutionDetailsOpen(), [])

  return { executionDetailsOpen: open, setExecutionDetailsOpen: set, toggleExecutionDetailsOpen: toggle }
}
