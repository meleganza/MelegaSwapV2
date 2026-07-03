import { useCallback, useMemo, useState } from 'react'
import { enrichProject } from 'registry/projects/discovery'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { useFarms } from 'state/farms/hooks'
import { usePoolsWithVault } from 'state/pools/hooks'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { buildAdvisorData } from './buildAdvisor'
import { buildBuilderTemplates, buildTokenPreparation } from './buildBuilderTemplates'
import { buildInfrastructureExtensions } from './buildExtensions'
import { runImportAnalysis } from './buildImportAnalysis'
import { buildAiManifest } from './buildManifest'
import {
  buildFarmPreviewFromRuntime,
  buildPoolPreviewFromRuntime,
  farmsRuntimeErrorIfEmpty,
  poolsRuntimeErrorIfEmpty,
} from './buildPoolsFarmsPreview'
import type { BuildRuntimeError } from './buildRuntimeErrors'
import { aggregateBuildKpis, buildRecentBuilds } from './formatBuildRuntime'
import { buildValidationChecks } from './buildValidationChecks'

export function useBuildOrchestrationRuntime() {
  const { chainId } = useActiveChainId()
  const { data: farms = [] } = useFarms()
  const pools = usePoolsWithVault()

  const [contractInput, setContractInput] = useState('')
  const [chainKey, setChainKey] = useState('bnb')
  const [importResult, setImportResult] = useState<ReturnType<typeof runImportAnalysis> | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  const enriched = useMemo(() => getAllProjects().map(enrichProject), [])
  const activeProject = importResult?.project ?? enriched[0]

  const runAnalysis = useCallback(() => {
    const result = runImportAnalysis(contractInput, chainKey)
    if (result.found && result.project) {
      setImportResult({ ...result, project: enrichProject(result.project) })
    } else {
      setImportResult(result)
    }
  }, [contractInput, chainKey])

  const poolPreview = useMemo(() => buildPoolPreviewFromRuntime(pools), [pools])
  const farmPreview = useMemo(() => buildFarmPreviewFromRuntime(farms), [farms])

  const activePools = useMemo(
    () => pools.filter((p) => !p.isFinished).length,
    [pools],
  )
  const activeFarms = useMemo(
    () => farms.filter((f) => f.multiplier?.toString() !== '0X').length,
    [farms],
  )

  const kpis = useMemo(
    () =>
      aggregateBuildKpis(
        enriched.length,
        activePools,
        activeFarms,
        enriched.filter((p) => p.capabilities.machineManifest.status === 'live').length,
      ),
    [enriched, activePools, activeFarms],
  )

  const advisor = useMemo(() => buildAdvisorData(activeProject), [activeProject])
  const manifest = useMemo(
    () => buildAiManifest(activeProject, contractInput || undefined),
    [activeProject, contractInput],
  )
  const validationChecks = useMemo(() => buildValidationChecks(activeProject), [activeProject])
  const extensions = useMemo(() => buildInfrastructureExtensions(activeProject), [activeProject])
  const recentBuilds = useMemo(() => buildRecentBuilds(enriched), [enriched])
  const builderTemplates = useMemo(() => buildBuilderTemplates(activeProject), [activeProject])
  const tokenPreparation = useMemo(() => buildTokenPreparation(activeProject), [activeProject])

  const runtimeErrors: BuildRuntimeError[] = useMemo(() => {
    const errs: BuildRuntimeError[] = [...(importResult?.errors ?? [])]
    const poolErr = poolsRuntimeErrorIfEmpty(activePools)
    const farmErr = farmsRuntimeErrorIfEmpty(activeFarms)
    if (poolErr && chainId) errs.push(poolErr)
    if (farmErr && chainId) errs.push(farmErr)
    return errs
  }, [importResult?.errors, activePools, activeFarms, chainId])

  const machine = useMemo(
    () => ({
      schema: 'https://melega.finance/schemas/build-runtime/v1',
      status: 'ready',
      chainId,
      project: activeProject?.slug ?? null,
      infrastructureScore: importResult?.score ?? null,
      poolPreview,
      farmPreview,
      errors: runtimeErrors,
      timestamp: new Date().toISOString(),
    }),
    [chainId, activeProject, importResult, poolPreview, farmPreview, runtimeErrors],
  )

  const generatedInfrastructure = useMemo(() => {
    const items = ['Create Project Profile']
    if (activeProject?.capabilities.pool.status !== 'live') items.push('Create Staking Pool')
    if (activeProject?.capabilities.farm.status !== 'live') items.push('Create Farm')
    if (activeProject?.capabilities.radar.status !== 'live') items.push('Radar Index')
    if (importResult?.score && importResult.score.score >= 70) items.push('Trending eligibility')
    return items
  }, [activeProject, importResult])

  return {
    contractInput,
    setContractInput,
    chainKey,
    setChainKey,
    runAnalysis,
    importResult,
    activeProject,
    kpis,
    advisor,
    manifest,
    validationChecks,
    extensions,
    recentBuilds,
    builderTemplates,
    tokenPreparation,
    poolPreview,
    farmPreview,
    generatedInfrastructure,
    suggestions: importResult?.suggestions ?? [],
    detections: importResult?.detections ?? [],
    pipelineComplete: importResult?.pipelineComplete ?? [false, false, false, false, false],
    selectedTemplateId,
    setSelectedTemplateId,
    machine,
    runtimeErrors,
  }
}

export type BuildOrchestrationRuntime = ReturnType<typeof useBuildOrchestrationRuntime>
