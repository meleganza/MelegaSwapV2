import React, { createContext, useContext } from 'react'
import {
  useImportExistingTokenRuntime,
  type ImportExistingTokenRuntime,
} from './useImportExistingTokenRuntime'

const ImportRuntimeContext = createContext<ImportExistingTokenRuntime | null>(null)

export const ImportRuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const runtime = useImportExistingTokenRuntime()
  return <ImportRuntimeContext.Provider value={runtime}>{children}</ImportRuntimeContext.Provider>
}

export function useImportRuntime(): ImportExistingTokenRuntime {
  const ctx = useContext(ImportRuntimeContext)
  if (!ctx) {
    throw new Error('useImportRuntime must be used within ImportRuntimeProvider')
  }
  return ctx
}

export default ImportRuntimeProvider
