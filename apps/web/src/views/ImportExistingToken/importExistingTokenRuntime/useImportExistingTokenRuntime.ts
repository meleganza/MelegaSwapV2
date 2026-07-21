import { useCallback, useMemo, useState } from 'react'
import { runImportAnalysis, type ImportAnalysisResult } from 'views/BuildStudio/buildRuntime/buildImportAnalysis'
import { buildAiManifest } from 'views/BuildStudio/buildRuntime/buildManifest'
import { buildAdvisorData } from 'views/BuildStudio/buildRuntime/buildAdvisor'
import { IMPORT_PIPELINE_STEPS } from 'views/BuildStudio/buildStudioData'
import { enrichProject } from 'registry/projects/discovery'
import type { StaticProjectRecord } from 'registry/projects/types'
import type { PendingProjectRecord } from 'registry/projects/pending/types'
import { createBuildRuntimeError } from 'views/BuildStudio/buildRuntime/buildRuntimeErrors'
import { buildInfrastructureScore } from 'views/BuildStudio/buildRuntime/buildInfrastructureScore'

const CHAIN_KEY_BY_LABEL: Record<string, string> = {
  BNB: 'bnb',
  ETH: 'eth',
  Base: 'base',
  Polygon: 'polygon',
}

const CHAIN_ID_BY_LABEL: Record<string, number> = {
  BNB: 56,
  ETH: 1,
  Base: 8453,
  Polygon: 137,
}

export function useImportExistingTokenRuntime() {
  const [contract, setContract] = useState('')
  const [chainLabel, setChainLabel] = useState('BNB')
  const [analyzed, setAnalyzed] = useState(false)
  const [analysisExpanded, setAnalysisExpanded] = useState(false)
  const [machineOpen, setMachineOpen] = useState(false)
  const [analysis, setAnalysis] = useState<ImportAnalysisResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const chainKey = CHAIN_KEY_BY_LABEL[chainLabel] ?? 'bnb'
  const chainId = CHAIN_ID_BY_LABEL[chainLabel] ?? 56

  const runAnalysis = useCallback(async () => {
    const trimmed = contract.trim()
    setAnalyzed(true)
    setAnalysisExpanded(true)
    if (!trimmed || !trimmed.startsWith('0x')) {
      setAnalysis(runImportAnalysis(trimmed, chainKey))
      return
    }
    setAnalyzing(true)
    try {
      const res = await fetch('/api/registry/projects/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract: trimmed, chainId }),
      })
      const data = (await res.json()) as Record<string, unknown>
      const onChain = data.onChain as
        | { name?: string | null; symbol?: string | null; reasonUnavailable?: string | null }
        | undefined

      if (!res.ok || data.ok === false) {
        setAnalysis({
          found: false,
          score: { score: 0, confidence: 0, reason: 'Discovery failed.' },
          suggestions: [],
          summary: typeof data.reason === 'string' ? data.reason : 'Contract discovery failed.',
          detections: [],
          pipelineComplete: [true, false, false, false, false],
          errors: [createBuildRuntimeError('PROJECT_NOT_FOUND')],
          discoveryReason:
            typeof data.reason === 'string'
              ? data.reason
              : onChain?.reasonUnavailable ?? 'Onboard API failed.',
        })
        return
      }

      if (data.tier === 'canonical' && data.project) {
        const project = data.project as StaticProjectRecord
        const sync = runImportAnalysis(trimmed, chainKey, {
          name: onChain?.name ?? null,
          symbol: onChain?.symbol ?? null,
        })
        if (sync.found && sync.project) {
          setAnalysis(sync)
          return
        }
        const enriched = enrichProject(project)
        setAnalysis({
          found: true,
          project: enriched,
          projectName: project.displayName,
          symbol: project.resources.tokens[0]?.symbol,
          score: buildInfrastructureScore(enriched),
          suggestions: [],
          summary: `${project.displayName} — canonical Melega registry project (/@${project.slug}/).`,
          detections: [
            { label: 'Name', available: true },
            { label: 'Ticker', available: Boolean(project.resources.tokens[0]?.symbol) },
            { label: 'Contract', available: true },
          ],
          pipelineComplete: [true, true, true, true, true],
          errors: [],
          discoveryReason: null,
        })
        return
      }

      if (data.tier === 'pending' && data.profile) {
        const pending = data.profile as PendingProjectRecord
        const sync = runImportAnalysis(trimmed, chainKey, {
          name: onChain?.name ?? (pending.name.available ? pending.name.value : null),
          symbol: onChain?.symbol ?? (pending.symbol.available ? pending.symbol.value : null),
        })
        setAnalysis({
          ...sync,
          pending: true,
          pendingProject: pending,
          discoveryReason:
            (typeof data.discoveryReason === 'string' ? data.discoveryReason : null) ??
            onChain?.reasonUnavailable ??
            sync.discoveryReason ??
            null,
        })
        return
      }

      setAnalysis({
        found: false,
        score: { score: 0, confidence: 0, reason: 'Discovery failed.' },
        suggestions: [],
        summary: 'Unexpected discovery response.',
        detections: [],
        pipelineComplete: [true, false, false, false, false],
        errors: [createBuildRuntimeError('PROJECT_NOT_FOUND')],
        discoveryReason: 'Unexpected discovery response from onboard API.',
      })
    } catch {
      setAnalysis({
        ...runImportAnalysis(trimmed, chainKey),
        discoveryReason:
          'Live on-chain discovery unavailable (API/RPC). Showing registry-only result; retry to fetch ERC-20 metadata.',
      })
    } finally {
      setAnalyzing(false)
    }
  }, [contract, chainKey, chainId])

  const refreshAnalysis = useCallback(() => {
    void runAnalysis()
  }, [runAnalysis])

  const resetAnalysis = useCallback(() => {
    setAnalyzed(false)
    setAnalysisExpanded(false)
    setAnalysis(null)
  }, [])

  const toggleAnalysisExpanded = useCallback(() => {
    setAnalysisExpanded((prev) => !prev)
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
      analyzing,
      pending: analysis?.pending ?? false,
      pendingId: analysis?.pendingProject?.pending_id ?? null,
      found: analysis?.found ?? false,
      projectSlug: analysis?.project?.slug ?? null,
      infrastructureScore: analysis?.score?.score ?? 0,
      detections: analysis?.detections ?? [],
      errors: analysis?.errors?.map((e) => e.code) ?? [],
      discoveryReason: analysis?.discoveryReason ?? null,
      manifestStatus: manifest.status,
    }),
    [contract, chainLabel, analyzed, analyzing, analysis, manifest.status],
  )

  const validationError = useMemo(() => {
    if (!analyzed) return null
    if (!contract.trim()) return 'Enter a contract address to analyze.'
    if (analysis?.errors.some((e) => e.code === 'NO_CONTRACT')) return 'Invalid contract address.'
    return null
  }, [analyzed, contract, analysis])

  return {
    contract,
    setContract,
    chainLabel,
    setChainLabel,
    analyzed,
    analyzing,
    analysisExpanded,
    runAnalysis,
    refreshAnalysis,
    resetAnalysis,
    toggleAnalysisExpanded,
    analysis,
    pipelineSteps,
    manifest,
    advisor,
    machine,
    machineOpen,
    setMachineOpen,
    validationError,
    phase: analyzing ? ('analyzing' as const) : analyzed ? ('ready' as const) : ('idle' as const),
  }
}

export type ImportExistingTokenRuntime = ReturnType<typeof useImportExistingTokenRuntime>
