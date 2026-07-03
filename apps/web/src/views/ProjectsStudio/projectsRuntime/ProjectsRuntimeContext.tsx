import React, { createContext, useContext } from 'react'
import {
  useProjectsIntelligenceRuntime,
  type ProjectsIntelligenceRuntime,
} from './useProjectsIntelligenceRuntime'

const ProjectsRuntimeContext = createContext<ProjectsIntelligenceRuntime | null>(null)

export const ProjectsRuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const runtime = useProjectsIntelligenceRuntime()
  return <ProjectsRuntimeContext.Provider value={runtime}>{children}</ProjectsRuntimeContext.Provider>
}

export function useProjectsRuntime(): ProjectsIntelligenceRuntime {
  const ctx = useContext(ProjectsRuntimeContext)
  if (!ctx) {
    throw new Error('useProjectsRuntime must be used within ProjectsRuntimeProvider')
  }
  return ctx
}

export default ProjectsRuntimeProvider
