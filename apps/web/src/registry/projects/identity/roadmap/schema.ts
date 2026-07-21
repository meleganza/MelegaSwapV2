export const PROJECT_ROADMAP_SCHEMA_VERSION = 'melega.project-roadmap.v1'

export type RoadmapStatus = 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' | 'PLANNED'

export interface ProjectRoadmapMilestone {
  id: string
  title: string
  description: string
  targetPeriod: string | null
  status: RoadmapStatus
  source: 'PROJECT_ATTESTED' | 'UNAVAILABLE'
  relatedUpdateId: string | null
}

export interface ProjectRoadmapDocument {
  schemaVersion: string
  projectId: string
  slug: string
  published: boolean
  milestones: ProjectRoadmapMilestone[]
  unpublishedReason: string | null
  generatedAt: string
}
