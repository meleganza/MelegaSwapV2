/**
 * Create Farm Workspace — superseded by Public Farm Factory.
 * Kept as a stable export so FarmsStudio mount / architecture locks continue to resolve
 * while PublicFarmFactoryWorkspace owns the orchestration UI
 * (data-testid="create-farm-workspace").
 */
import { PublicFarmFactoryWorkspace } from './PublicFarmFactoryWorkspace'

/** @deprecated Use PublicFarmFactoryWorkspace — alias retained for FarmsStudio mount locks. */
export const CreateFarmWorkspace = PublicFarmFactoryWorkspace
export { PublicFarmFactoryWorkspace }
