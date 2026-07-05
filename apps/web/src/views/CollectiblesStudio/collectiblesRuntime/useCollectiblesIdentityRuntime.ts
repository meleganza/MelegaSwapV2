import { useCallback, useMemo, useState } from 'react'
import { buildSurfaceEnvelope, type MelegaSurfaceEnvelope } from 'lib/surface-envelope'
import { enrichProject } from 'registry/projects/discovery'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { buildAiAdvisorRows } from './buildAiAdvisor'
import { buildMachineProfile } from './buildMachineProfile'
import { createCollectiblesRuntimeError, type CollectiblesRuntimeError } from './collectiblesRuntimeErrors'
import {
  aggregateCollectiblesKpis,
  buildFeaturedCollection,
  buildSidebarLists,
  filterCardsByChip,
  mapRecordToCollectionCard,
} from './formatCollectiblesRuntime'
import { useWalletCollectibleOwnership } from './useWalletCollectibleOwnership'
import { useBabyMarcoIdentityData } from './useBabyMarcoIdentityData'

export function useCollectiblesIdentityRuntime() {
  const wallet = useWalletCollectibleOwnership()
  const babyMarco = useBabyMarcoIdentityData(wallet.ownershipBySlug, wallet.account)
  const [filter, setFilter] = useState<string>('All')
  const [machineOpen, setMachineOpen] = useState(false)

  const projects = useMemo(() => getAllProjects().map(enrichProject), [])
  const featuredProject = projects[0]

  const cards = useMemo(
    () =>
      wallet.records.map((record) =>
        mapRecordToCollectionCard(
          record,
          wallet.ownershipBySlug[record.slug] ?? {
            slug: record.slug,
            balance: 0,
            status: 'Not owned',
            transferable: record.contract.indexed ? true : null,
            tokenIds: [],
          },
          featuredProject,
        ),
      ),
    [wallet.records, wallet.ownershipBySlug, featuredProject],
  )

  const filteredCards = useMemo(() => filterCardsByChip(cards, filter), [cards, filter])

  const kpis = useMemo(
    () => aggregateCollectiblesKpis(wallet.records, wallet.totalOwned, wallet.account),
    [wallet.records, wallet.totalOwned, wallet.account],
  )

  const featured = useMemo(
    () => buildFeaturedCollection(cards, wallet.records, wallet.ownershipBySlug),
    [cards, wallet.records, wallet.ownershipBySlug],
  )

  const advisorRows = useMemo(
    () => buildAiAdvisorRows(wallet.records, wallet.ownershipBySlug),
    [wallet.records, wallet.ownershipBySlug],
  )

  const sidebar = useMemo(() => buildSidebarLists(cards), [cards])

  const runtimeErrors: CollectiblesRuntimeError[] = useMemo(() => {
    const errs: CollectiblesRuntimeError[] = []
    if (wallet.records.length === 0) errs.push(createCollectiblesRuntimeError('NO_COLLECTION'))
    if (!wallet.account) errs.push(createCollectiblesRuntimeError('NO_WALLET'))
    if (wallet.totalOwned === 0 && wallet.account) errs.push(createCollectiblesRuntimeError('NO_OWNER'))
    return errs
  }, [wallet.records.length, wallet.account, wallet.totalOwned])

  const machine: MelegaSurfaceEnvelope = useMemo(() => {
    const reasonCodes: Record<string, string> = {}
    runtimeErrors.forEach((e) => {
      reasonCodes[e.code] = e.message
    })
    return buildSurfaceEnvelope({
      module: 'collectibles',
      runtime: buildMachineProfile({
        account: wallet.account,
        chainId: wallet.chainId,
        records: wallet.records,
        ownershipBySlug: wallet.ownershipBySlug,
        totalOwned: wallet.totalOwned,
        primaryRarityLabel: babyMarco.yourIdentity.rarityLabel,
        primaryTokenId: babyMarco.yourIdentity.primaryTokenId,
      }),
      reasonCodes,
      sources: ['registry', 'wallet-nft-rpc'],
    })
  }, [wallet, babyMarco.yourIdentity.rarityLabel, babyMarco.yourIdentity.primaryTokenId, runtimeErrors])

  const setFilterCb = useCallback((chip: string) => setFilter(chip), [])

  return {
    filter,
    setFilter: setFilterCb,
    cards: filteredCards,
    allCards: cards,
    kpis,
    featured,
    advisorRows,
    sidebar,
    machine,
    machineOpen,
    setMachineOpen,
    wallet,
    babyMarco,
    runtimeErrors,
    projects,
    featuredProject,
  }
}

export type CollectiblesIdentityRuntime = ReturnType<typeof useCollectiblesIdentityRuntime>
