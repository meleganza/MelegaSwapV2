import React, { createContext, useContext } from 'react'
import {
  useCommandCenterOrchestrationRuntime,
  type CommandCenterOrchestrationRuntime,
} from './useCommandCenterOrchestrationRuntime'

const CommandRuntimeContext = createContext<CommandCenterOrchestrationRuntime | null>(null)

export const CommandRuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const runtime = useCommandCenterOrchestrationRuntime()
  return <CommandRuntimeContext.Provider value={runtime}>{children}</CommandRuntimeContext.Provider>
}

export function useCommandRuntime(): CommandCenterOrchestrationRuntime {
  const ctx = useContext(CommandRuntimeContext)
  if (!ctx) {
    throw new Error('useCommandRuntime must be used within CommandRuntimeProvider')
  }
  return ctx
}

export default CommandRuntimeProvider
