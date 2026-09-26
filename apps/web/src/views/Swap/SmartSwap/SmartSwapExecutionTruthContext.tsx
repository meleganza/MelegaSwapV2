/**
 * One SmartSwap request = one execution truth.
 *
 * The SmartSwap form owns the single V2 CTA binding and derives the canonical execution display
 * (resolveSmartSwapExecutionDisplay, #101) that already drives To (estimated), the details rows, the Swap CTA and the
 * V2 confirmation modal. The execution preview (route card + metrics) is read-only presentation and renders that SAME
 * display object: no second plan, allowance read, nonce, preparation or venue competition.
 *
 * Sharing is local and minimal:
 * - inside the form tree (Trade cockpit `executionPreview` slot) the form provides its display directly;
 * - where the preview is a sibling of the form (Home), `SmartSwapExecutionTruthScope` receives the display the form
 *   publishes (layout effect, so it is applied before paint) and provides it to the sibling preview.
 * No provider (a standalone preview) => null => the existing legacy preview.
 */

import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react'
import type { SmartSwapExecutionDisplay } from './utils/v2ExecutionDisplay'

export const SmartSwapExecutionTruthContext = createContext<SmartSwapExecutionDisplay | null>(null)

type PublishExecutionTruth = (display: SmartSwapExecutionDisplay | null) => void
const SmartSwapExecutionTruthPublishContext = createContext<PublishExecutionTruth | null>(null)

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/** Scope for surfaces where the execution preview is a sibling of the SmartSwap form (Home). */
export function SmartSwapExecutionTruthScope({ children }: { children: React.ReactNode }) {
  const [display, setDisplay] = useState<SmartSwapExecutionDisplay | null>(null)
  return (
    <SmartSwapExecutionTruthPublishContext.Provider value={setDisplay}>
      <SmartSwapExecutionTruthContext.Provider value={display}>{children}</SmartSwapExecutionTruthContext.Provider>
    </SmartSwapExecutionTruthPublishContext.Provider>
  )
}

/** Called by the SmartSwap form with its canonical display; no-op outside a scope. */
export function usePublishSmartSwapExecutionTruth(display: SmartSwapExecutionDisplay): void {
  const publish = useContext(SmartSwapExecutionTruthPublishContext)
  useIsomorphicLayoutEffect(() => {
    if (publish) publish(display)
  }, [publish, display])
  useIsomorphicLayoutEffect(
    () => () => {
      if (publish) publish(null)
    },
    [publish],
  )
}

/** The canonical SmartSwap execution display for the current request, or null when no form provides one. */
export function useSmartSwapExecutionTruth(): SmartSwapExecutionDisplay | null {
  return useContext(SmartSwapExecutionTruthContext)
}
