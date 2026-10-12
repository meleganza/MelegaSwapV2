import React, { createContext, useContext, useEffect, useState } from 'react'

export type HomeYieldVisibility = {
  /** KPI rail is actually on screen, so farm liquidity for TVL may load. */
  kpiNear: boolean
  /** Top Farms / Top Pools are actually on screen. */
  discoveryNear: boolean
}

/**
 * Default stays eager for callers that render the data hook outside Dex Home
 * (tests and the legacy row). Dex Home latches these from real intersection.
 */
const EAGER: HomeYieldVisibility = { kpiNear: true, discoveryNear: true }

const HomeYieldVisibilityContext = createContext<HomeYieldVisibility>(EAGER)

function observeSection(
  selector: string,
  onVisible: () => void,
): () => void {
  const node = document.querySelector(selector)
  if (!node || typeof IntersectionObserver === 'undefined') {
    onVisible()
    return () => undefined
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.2)) onVisible()
    },
    { threshold: [0, 0.2, 0.5] },
  )
  observer.observe(node)
  return () => observer.disconnect()
}

/** Latches once a section is meaningfully visible. A few peeked pixels do not count. */
export const HomeYieldVisibilityProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [value, setValue] = useState<HomeYieldVisibility>({ kpiNear: false, discoveryNear: false })

  useEffect(() => {
    const stopKpi = observeSection('[data-testid="dex-home-kpi-rail"]', () => {
      setValue((prev) => (prev.kpiNear ? prev : { ...prev, kpiNear: true }))
    })
    const stopDiscovery = observeSection('[data-testid="dex-home-discovery"]', () => {
      setValue((prev) => (prev.discoveryNear ? prev : { ...prev, discoveryNear: true }))
    })
    return () => {
      stopKpi()
      stopDiscovery()
    }
  }, [])

  return <HomeYieldVisibilityContext.Provider value={value}>{children}</HomeYieldVisibilityContext.Provider>
}

export function useHomeYieldVisibility(): HomeYieldVisibility {
  return useContext(HomeYieldVisibilityContext)
}
