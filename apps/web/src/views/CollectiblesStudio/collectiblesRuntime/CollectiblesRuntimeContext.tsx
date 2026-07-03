import React, { createContext, useContext } from 'react'
import {
  useCollectiblesIdentityRuntime,
  type CollectiblesIdentityRuntime,
} from './useCollectiblesIdentityRuntime'

const CollectiblesRuntimeContext = createContext<CollectiblesIdentityRuntime | null>(null)

export const CollectiblesRuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const runtime = useCollectiblesIdentityRuntime()
  return <CollectiblesRuntimeContext.Provider value={runtime}>{children}</CollectiblesRuntimeContext.Provider>
}

export function useCollectiblesRuntime(): CollectiblesIdentityRuntime {
  const ctx = useContext(CollectiblesRuntimeContext)
  if (!ctx) {
    throw new Error('useCollectiblesRuntime must be used within CollectiblesRuntimeProvider')
  }
  return ctx
}

export default CollectiblesRuntimeProvider
