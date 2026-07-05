import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { runImportAnalysis } from 'views/BuildStudio/buildRuntime/buildImportAnalysis'
import { buildAiManifest } from 'views/BuildStudio/buildRuntime/buildManifest'
import { buildAdvisorData } from 'views/BuildStudio/buildRuntime/buildAdvisor'
import { IMPORT_PIPELINE_STEPS } from 'views/BuildStudio/buildStudioData'

const CHAIN_KEY_BY_LABEL: Record<string, string> = {
  BNB: 'bnb',
  ETH: 'eth',
  Base: 'base',
  Polygon: 'polygon',
}

export function useImportExistingTokenRuntime() {
  const router = useRouter()
  const [contract, setContract] = useState('')
  const [chainLabel, setChainLabel] = useState('BNB')
  const [analyzed, setAnalyzed] = useState(false)
  const [machineOpen, setMachineOpen] = useState(false)
  const [revision, setRevision] = useState(0)

  const chainKey = CHAIN_KEY_BY_LABEL[chainLabel] ?? 'bnb'

  const analysis = useMemo(() => {
    if (!analyzed) return null
    return runImportAnalysis(contract.trim(), chainKey)
  }, [analyzed, contract, chainKey, revision])

  const runAnalysis = useCallback(() => {
    const trimmed = contract.trim()
    if (!trimmed || !trimmed.startsWith('0x')) {
      setAnalyzed(true)
      return
    }
    setAnalyzed(true)
  }, [contract])

  const resetAnalysis = useCallback(() => {
    setAnalyzed(false)
  }, [])

  const refreshAnalysis = useCallback(() => {
    setRevision((r) => r + 1)
  }, [])

  const pipelineSteps = useMemo(() => {
    if (!analysis) {
      return IMPORT_PIPELINE_STEPS.map((label) => ({ label, complete: false }))
    }
    return IMPORT_PIPELINE_STEPS.map((label, i) => ({
      label,
      complete: analysis.pipelineComplete[i] ?? false,
    }))
  }, [analysis])

  const manifest = useMemo(
    () => buildAiManifest(analysis?.project, contract.trim() || undefined),
    [analysis?.project, contract],
  )

  const advisor = useMemo(() => {
    if (!analysis?.project) return null
    return buildAdvisorData(analysis.project)
  }, [analysis])

  const machine = useMemo(
    () => ({
      schema: 'melega.import-existing-token/v1' as const,
      generatedAt: new Date().toISOString(),
      contract: contract.trim() || null,
      chain: chainLabel,
      analyzed,
      pending: analysis?.pending ?? false,
      pendingId: analysis?.pendingProject?.id ?? null,
      found: analysis?.found ?? false,
      projectSlug: analysis?.project?.slug ?? null,
      infrastructureScore: analysis?.score?.score ?? 0,
      detections: analysis?.detections ?? [],
      errors: analysis?.errors?.map((e) => e.code) ?? [],
      manifestStatus: manifest.status,
    }),
    [contract, chainLabel, analyzed, analysis, manifest.status],
  )

  const validationError = useMemo(() => {
    if (!analyzed) return null
    if (!contract.trim()) return 'Enter a contract address to analyze.'
    if (analysis?.errors.some((e) => e.code === 'NO_CONTRACT')) return 'Invalid contract address.'
    return null
  }, [analyzed, contract, analysis])

  useEffect(() => {
    const q = router.query.contract
    if (typeof q === 'string' && q.startsWith('0x') && q !== contract) {
      setContract(q)
      setAnalyzed(true)
    }
  }, [router.query.contract, contract])

  return {
    contract,
    setContract,
    chainLabel,
    setChainLabel,
    analyzed,
    runAnalysis,
    refreshAnalysis,
    resetAnalysis,
    analysis,
    pipelineSteps,
    manifest,
    advisor,
    machine,
    machineOpen,
    setMachineOpen,
    validationError,
    phase: analyzed ? ('ready' as const) : ('idle' as const),
  }
}

export type ImportExistingTokenRuntime = ReturnType<typeof useImportExistingTokenRuntime>
