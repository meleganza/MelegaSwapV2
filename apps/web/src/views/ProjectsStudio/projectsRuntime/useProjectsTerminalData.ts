import { useMemo } from 'react'
import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import type { ProjectsActivityRow } from '../projectsStudioData'
import { buildActivityFromRegistry } from './formatProjectsRuntime'

export default function useProjectsTerminalData(projects: EnrichedProjectRecord[]) {
  return useMemo(() => {
    const rows: ProjectsActivityRow[] = buildActivityFromRegistry(projects)
    return {
      rows,
      isEmpty: rows.length === 0,
      label: rows.length ? undefined : 'No project activity indexed yet.',
    }
  }, [projects])
}
