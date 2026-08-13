import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

type MyMelegaContextValue = {
  open: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
}

const MyMelegaContext = createContext<MyMelegaContextValue | null>(null)

/** Warm the personal dashboard chunk on user intent, not during first paint. */
export const preloadMyMelegaDrawer = () => import('./MyMelegaDrawer')

export function MyMelegaProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const openDrawer = useCallback(() => setOpen(true), [])
  const closeDrawer = useCallback(() => setOpen(false), [])
  const toggleDrawer = useCallback(() => setOpen((v) => !v), [])
  const value = useMemo(
    () => ({ open, openDrawer, closeDrawer, toggleDrawer }),
    [open, openDrawer, closeDrawer, toggleDrawer],
  )
  return <MyMelegaContext.Provider value={value}>{children}</MyMelegaContext.Provider>
}

export function useMyMelegaDrawer(): MyMelegaContextValue {
  const ctx = useContext(MyMelegaContext)
  if (!ctx) {
    return {
      open: false,
      openDrawer: () => undefined,
      closeDrawer: () => undefined,
      toggleDrawer: () => undefined,
    }
  }
  return ctx
}
