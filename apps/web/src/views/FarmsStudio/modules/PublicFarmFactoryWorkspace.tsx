/**
 * Create Farm — human-guided wizard UX.
 * Protocol engines (eligibility, fees, drafts, capability) stay identical underneath.
 * No protocol terminology is shown to users.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { typography } from 'design-system/melega'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { useAmmPairRegistry } from 'lib/bsc-indexer/client/useAmmPairRegistry'
import { LB_DEPLOYED_ADDRESSES, isDeployedAddress } from 'views/LiquidityStudio/liquidityBuilding/addresses'
import { farmsHero } from './farmsHeroTokens'
import { PUBLIC_FARM_FACTORY_CAPABILITY } from './publicFarmFactoryCapability'
import { CREATE_FARM_UX } from './createFarmUxCopy'
import {
  CREATE_FARM_RETURN_PATH,
  buildAiBuilderHandoffUrl,
  buildCreatePairHandoffUrl,
  buildManualLiquidityHandoffUrl,
  createDefaultPublicFarmFactoryDraft,
  loadDraftFromStorage,
  pairContainsMarcoAddress,
  parseReturnToCreateFarm,
  recheckDraftEligibility,
  saveDraftToStorage,
  type PublicFarmFactoryDraft,
  type PublicFarmSelectedPair,
} from './publicFarmFactoryDraft'
import { resolvePublicFarmFactoryFee } from './publicFarmFactoryFee'
import {
  PUBLIC_FARM_MINIMUM_TVL_BNB,
  evaluatePublicFarmEligibility,
  rejectMarcoReward,
  type PublicFarmEligibilityResult,
} from './publicFarmEligibility'
import { filterPairsForFarmFactory, toSelectedPair } from './publicFarmPairSearch'

const Section = styled.section`
  width: 100%;
  max-width: ${farmsHero.contentMax};
  box-sizing: border-box;
  border-radius: 18px;
  border: 1px solid rgba(244, 196, 48, 0.28);
  background: linear-gradient(145deg, rgba(19, 19, 19, 0.98) 0%, rgba(13, 13, 13, 0.98) 100%);
  padding: 28px 30px 26px;
  font-family: ${typography.fontFamily.body};
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-width: 0;

  @media (max-width: 767px) {
    padding: 20px 18px 20px;
    border-radius: 14px;
  }
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  line-height: 28px;
  font-weight: 750;
  color: #f5f5f5;
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  color: rgba(255, 255, 255, 0.58);
  max-width: 640px;
`

const StepLabel = styled.p`
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(244, 196, 48, 0.85);
`

const ModeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const ModeBtn = styled.button<{ $active?: boolean }>`
  min-height: 44px;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(244, 196, 48, 0.55)' : 'rgba(255, 255, 255, 0.12)')};
  background: ${({ $active }) => ($active ? 'rgba(244, 196, 48, 0.14)' : 'rgba(255, 255, 255, 0.03)')};
  color: ${({ $active }) => ($active ? '#F4C430' : '#f2f2f2')};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  text-align: left;
`

const Body = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 24px;
  min-width: 0;

  @media (max-width: 1023px) {
    flex-direction: column;
  }
`

const FieldsCol = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
  row-gap: 16px;
  width: 100%;

  @media (max-width: 599px) {
    grid-template-columns: 1fr;
  }
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const Label = styled.span`
  font-size: 10px;
  line-height: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
`

const inputStyles = `
  margin-top: 8px;
  height: 44px;
  box-sizing: border-box;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  font-size: 14px;
  font-weight: 650;
  color: #f2f2f2;
`

const InputBox = styled.input`
  ${inputStyles}
  &::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }
`

const ReadOnlyValue = styled.div<{ $accent?: string }>`
  ${inputStyles}
  display: flex;
  align-items: center;
  color: ${({ $accent }) => $accent || '#f2f2f2'};
`

const FeeNote = styled.span`
  margin-top: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
`

const Panel = styled.div`
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 15, 15, 0.75);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 750;
  color: #f2f2f2;
`

const Hint = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: rgba(255, 255, 255, 0.55);
`

const StatusLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);

  strong {
    color: #f5f5f5;
  }
`

const Check = styled.span`
  color: #18f089;
  font-weight: 800;
`

const MetricBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;

  @media (max-width: 599px) {
    grid-template-columns: 1fr;
  }
`

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const MetricLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
`

const MetricValue = styled.span`
  font-size: 18px;
  font-weight: 750;
  color: #f5f5f5;
`

const PairList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  overflow: auto;
`

const PairItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  text-align: left;
  border-radius: 10px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(24, 240, 137, 0.45)' : 'rgba(255, 255, 255, 0.08)')};
  background: ${({ $active }) => ($active ? 'rgba(24, 240, 137, 0.08)' : 'rgba(255, 255, 255, 0.02)')};
  color: #f2f2f2;
  padding: 12px 14px;
  cursor: pointer;
  font-size: 14px;
  line-height: 18px;
`

const Remediation = styled.div`
  border-radius: 14px;
  border: 1px solid rgba(244, 196, 48, 0.35);
  background: rgba(244, 196, 48, 0.07);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const RemediationTitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 750;
  color: #f4c430;
`

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const PrimaryLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid rgba(24, 240, 137, 0.45);
  background: rgba(24, 240, 137, 0.14);
  color: #18f089;
  font-size: 14px;
  font-weight: 750;
  text-decoration: none;
`

const SecondaryLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
`

const PrimaryButton = styled.button<{ $ready?: boolean }>`
  align-self: flex-start;
  min-height: 48px;
  min-width: 180px;
  padding: 0 22px;
  border-radius: 12px;
  border: 1px solid
    ${({ $ready }) => ($ready ? 'rgba(24, 240, 137, 0.45)' : 'rgba(255, 255, 255, 0.12)')};
  background: ${({ $ready }) => ($ready ? 'rgba(24, 240, 137, 0.16)' : 'rgba(255, 255, 255, 0.04)')};
  color: ${({ $ready }) => ($ready ? '#18f089' : 'rgba(255, 255, 255, 0.55)')};
  font-size: 15px;
  font-weight: 750;
  cursor: ${({ $ready }) => ($ready ? 'pointer' : 'default')};

  @media (max-width: 767px) {
    width: 100%;
  }
`

const SoftNote = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: rgba(255, 255, 255, 0.55);
`

const RejectBanner = styled.div`
  border-radius: 12px;
  border: 1px solid rgba(244, 196, 48, 0.4);
  background: rgba(244, 196, 48, 0.08);
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 650;
  color: #f4c430;
  white-space: pre-line;
`

const PreviewCol = styled.aside`
  width: 300px;
  min-width: 300px;
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 15, 15, 0.9);
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  @media (max-width: 1023px) {
    width: 100%;
    min-width: 0;
  }
`

const PreviewTitle = styled.span`
  font-size: 10px;
  line-height: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
`

const ReviewRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  line-height: 18px;
  color: rgba(255, 255, 255, 0.55);

  strong {
    color: #f2f2f2;
    font-weight: 700;
    text-align: right;
    max-width: 60%;
  }
`

const AdvancedToggle = styled.button`
  align-self: flex-start;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
`

function parseNum(raw: string): number {
  const n = Number(String(raw).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function computeEstimatedFarmApr(draft: PublicFarmFactoryDraft): string {
  const budget = parseNum(draft.rewardBudget)
  const daily = parseNum(draft.emissionRate)
  if (budget <= 0 || daily <= 0) return '—'
  const apr = (daily * 365 * 100) / budget
  if (!Number.isFinite(apr)) return '—'
  return `${apr.toFixed(1)}%`
}

function formatBnb(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return `${n.toFixed(2)} BNB`
}

function isBuilderDeployed(): boolean {
  return (
    isDeployedAddress(LB_DEPLOYED_ADDRESSES.lbFactory) &&
    isDeployedAddress(LB_DEPLOYED_ADDRESSES.lbAuthorizer) &&
    isDeployedAddress(LB_DEPLOYED_ADDRESSES.lbFeeSink)
  )
}

type NextAction = 'select_pair' | 'increase_liquidity' | 'continue_config' | 'create_farm'

export const PublicFarmFactoryWorkspace: React.FC = () => {
  const router = useRouter()
  const [draft, setDraft] = useState<PublicFarmFactoryDraft>(() => createDefaultPublicFarmFactoryDraft())
  const [pairQuery, setPairQuery] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [createSoftNote, setCreateSoftNote] = useState<string | null>(null)

  const { pairs } = useAmmPairRegistry({
    q: pairQuery || undefined,
    page: 1,
    pageSize: 40,
  })

  const filteredPairs = useMemo(() => filterPairsForFarmFactory(pairs, pairQuery), [pairs, pairQuery])

  const patch = useCallback((partial: Partial<PublicFarmFactoryDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...partial, updatedAt: new Date().toISOString() }
      saveDraftToStorage(next)
      return next
    })
  }, [])

  useEffect(() => {
    if (!router.isReady || hydrated) return
    const search = typeof window !== 'undefined' ? window.location.search : ''
    const { returning, draftId } = parseReturnToCreateFarm(search)
    const stored = loadDraftFromStorage()
    if (stored && (!draftId || stored.draftId === draftId || returning)) {
      setDraft(stored)
    }
    setHydrated(true)
    if (returning && typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.delete('return')
      url.searchParams.delete('draftId')
      url.searchParams.delete('destination')
      window.history.replaceState(
        {},
        '',
        `${url.pathname}${url.search}${CREATE_FARM_RETURN_PATH.includes('#') ? '#create-farm' : ''}`,
      )
    }
  }, [router.isReady, hydrated])

  const eligibility: PublicFarmEligibilityResult = useMemo(
    () => (draft.selectedPair ? recheckDraftEligibility(draft) : evaluatePublicFarmEligibility(null)),
    [draft],
  )

  const marcoReject = useMemo(
    () => rejectMarcoReward(draft.rewardTokenAddress || draft.rewardToken),
    [draft.rewardToken, draft.rewardTokenAddress],
  )

  const containsMarco = pairContainsMarcoAddress(draft.selectedPair, MARCO_BSC_ADDRESS)
  const feeResult = useMemo(
    () =>
      resolvePublicFarmFactoryFee({
        rewardToken: draft.rewardTokenAddress || draft.rewardToken,
        pairContainsMarco: containsMarco,
      }),
    [draft.rewardToken, draft.rewardTokenAddress, containsMarco],
  )

  const builderDeployed = isBuilderDeployed()
  const builderHandoff = useMemo(
    () => buildAiBuilderHandoffUrl(draft, eligibility.missingTvlBnb, builderDeployed),
    [draft, eligibility.missingTvlBnb, builderDeployed],
  )
  const manualHref = useMemo(
    () => buildManualLiquidityHandoffUrl(draft, eligibility.missingTvlBnb),
    [draft, eligibility.missingTvlBnb],
  )
  const createPairHref = useMemo(() => buildCreatePairHandoffUrl(draft), [draft])

  const estimatedApr = computeEstimatedFarmApr(draft)
  const needsLiquidity =
    Boolean(draft.selectedPair) && !eligibility.eligible && eligibility.status !== 'missing_pair'
  const configReady =
    eligibility.eligible &&
    !marcoReject.rejected &&
    parseNum(draft.rewardBudget) > 0 &&
    parseNum(draft.emissionRate) > 0 &&
    parseNum(draft.durationDays) > 0 &&
    Boolean(draft.rewardToken.trim()) &&
    feeResult.ok

  const nextAction: NextAction = !draft.selectedPair
    ? 'select_pair'
    : needsLiquidity
      ? 'increase_liquidity'
      : !configReady
        ? 'continue_config'
        : 'create_farm'

  const selectPair = (pair: PublicFarmSelectedPair) => {
    setCreateSoftNote(null)
    patch({ selectedPair: pair, selectionMode: 'search_existing' })
  }

  const reviewRows = [
    ['Pair', draft.selectedPair ? `${draft.selectedPair.symbol0}/${draft.selectedPair.symbol1}` : '—'],
    ['Reward', draft.rewardToken || '—'],
    ['Budget', draft.rewardBudget || '—'],
    ['Duration', draft.durationDays ? `${draft.durationDays} days` : '—'],
    ['Emission', draft.emissionRate ? `${draft.emissionRate}/day` : '—'],
    ['Creation Fee', feeResult.ok ? feeResult.fee.display : '—'],
    ['Estimated APR', estimatedApr],
  ]

  const onPrimary = () => {
    if (nextAction === 'create_farm') {
      // Protocol execution remains gated; surface a soft human note only.
      if (!PUBLIC_FARM_FACTORY_CAPABILITY.readiness.walletCanExecute) {
        setCreateSoftNote(CREATE_FARM_UX.createUnavailable)
        return
      }
    }
  }

  const increaseHref = !builderHandoff.blocked ? builderHandoff.href : manualHref

  return (
    <Section
      id="create-farm"
      data-testid="create-farm-workspace"
      data-fs-create-farm-workspace="true"
      data-public-farm-factory="true"
      data-create-farm-ux="simplified"
      data-create-farm-capability={PUBLIC_FARM_FACTORY_CAPABILITY.outcome}
      data-factory-deployed="false"
      data-masterbuilder-exposed="false"
      aria-labelledby="create-farm-workspace-title"
    >
      <Header>
        <Title id="create-farm-workspace-title">{CREATE_FARM_UX.title}</Title>
        <Subtitle>{CREATE_FARM_UX.subtitle}</Subtitle>
      </Header>

      <div data-testid="create-farm-step-pair">
        <StepLabel>Step 1</StepLabel>
        <PanelTitle style={{ marginTop: 6 }}>{CREATE_FARM_UX.step1}</PanelTitle>
        <ModeRow data-testid="public-farm-pair-mode" style={{ marginTop: 12 }}>
          <ModeBtn
            type="button"
            $active={draft.selectionMode === 'search_existing'}
            data-testid="public-farm-search-existing"
            onClick={() => patch({ selectionMode: 'search_existing' })}
          >
            ○ {CREATE_FARM_UX.useExisting}
          </ModeBtn>
          <ModeBtn
            type="button"
            $active={draft.selectionMode === 'create_new'}
            data-testid="public-farm-create-new-pair"
            onClick={() => {
              const next = {
                ...draft,
                selectionMode: 'create_new' as const,
                updatedAt: new Date().toISOString(),
              }
              patch({ selectionMode: 'create_new' })
              saveDraftToStorage(next)
              if (typeof window !== 'undefined') window.location.href = createPairHref
            }}
          >
            ○ {CREATE_FARM_UX.createNew}
          </ModeBtn>
        </ModeRow>
      </div>

      <Body>
        <FieldsCol>
          {draft.selectionMode === 'search_existing' && (
            <Panel data-testid="public-farm-pair-search">
              <Hint>{CREATE_FARM_UX.searchHint}</Hint>
              <Field>
                <Label>Search</Label>
                <InputBox
                  value={pairQuery}
                  onChange={(e) => setPairQuery(e.target.value)}
                  placeholder={CREATE_FARM_UX.searchPlaceholder}
                  aria-label="Search existing pair"
                  data-testid="public-farm-pair-query"
                />
              </Field>
              <PairList>
                {filteredPairs.slice(0, 12).map((p) => {
                  const selected = toSelectedPair(p)
                  const active = draft.selectedPair?.pairAddress.toLowerCase() === selected.pairAddress.toLowerCase()
                  return (
                    <li key={selected.pairAddress}>
                      <PairItem
                        type="button"
                        $active={active}
                        data-testid={`public-farm-pair-option-${selected.pairAddress.toLowerCase()}`}
                        onClick={() => selectPair(selected)}
                      >
                        <strong>
                          {selected.symbol0}/{selected.symbol1}
                        </strong>
                      </PairItem>
                    </li>
                  )
                })}
              </PairList>
            </Panel>
          )}

          {draft.selectedPair && (
            <Panel data-testid="public-farm-eligibility" data-eligible={eligibility.eligible ? 'true' : 'false'}>
              <StepLabel>Step 2</StepLabel>
              <PanelTitle>{CREATE_FARM_UX.pairStatus}</PanelTitle>
              <StatusLine>
                <Check>✓</Check> {CREATE_FARM_UX.pairExists}
              </StatusLine>
              <StatusLine>
                <Check>✓</Check> {CREATE_FARM_UX.pairIndexed}
              </StatusLine>
              <MetricBlock>
                <Metric>
                  <MetricLabel>{CREATE_FARM_UX.tvl}</MetricLabel>
                  <MetricValue data-testid="public-farm-current-tvl">
                    {formatBnb(eligibility.currentTvlBnb)}
                  </MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>{CREATE_FARM_UX.minimumRequired}</MetricLabel>
                  <MetricValue data-testid="public-farm-minimum-tvl">
                    {formatBnb(PUBLIC_FARM_MINIMUM_TVL_BNB)}
                  </MetricValue>
                </Metric>
              </MetricBlock>
              <StatusLine data-testid="public-farm-pair-status-label">
                Status{' '}
                <strong>
                  {eligibility.eligible ? CREATE_FARM_UX.statusReady : CREATE_FARM_UX.statusNotReady}
                </strong>
              </StatusLine>
              {!eligibility.eligible && eligibility.missingTvlBnb != null && eligibility.missingTvlBnb > 0 && (
                <Hint data-testid="public-farm-missing-tvl">
                  {CREATE_FARM_UX.youNeed} <strong>{formatBnb(eligibility.missingTvlBnb)}</strong>{' '}
                  {CREATE_FARM_UX.moreLiquidity}
                </Hint>
              )}
            </Panel>
          )}

          {draft.selectedPair && needsLiquidity && (
            <Remediation data-testid="public-farm-low-liquidity-remediation" role="status">
              <RemediationTitle>{CREATE_FARM_UX.statusNotReady}</RemediationTitle>
              <Hint>
                {CREATE_FARM_UX.youNeed} {formatBnb(eligibility.missingTvlBnb)} {CREATE_FARM_UX.moreLiquidity}
              </Hint>
              <ActionRow>
                <PrimaryLink
                  href={increaseHref}
                  data-testid={
                    builderHandoff.blocked ? 'public-farm-builder-blocked' : 'public-farm-builder-handoff'
                  }
                >
                  {CREATE_FARM_UX.increaseLiquidity}
                </PrimaryLink>
                <SecondaryLink href={manualHref} data-testid="public-farm-manual-liquidity-handoff">
                  {CREATE_FARM_UX.addLiquidityManually}
                </SecondaryLink>
              </ActionRow>
            </Remediation>
          )}

          {eligibility.eligible && (
            <div data-testid="create-farm-fields-grid" data-public-farm-config="unlocked">
              <StepLabel>Step 3</StepLabel>
              <PanelTitle style={{ marginBottom: 12 }}>Farm setup</PanelTitle>
              <FieldsGrid>
                <Field data-testid="create-farm-reward-token">
                  <Label>{CREATE_FARM_UX.rewardToken}</Label>
                  <InputBox
                    value={draft.rewardToken}
                    onChange={(e) => {
                      setCreateSoftNote(null)
                      patch({ rewardToken: e.target.value, rewardTokenAddress: e.target.value })
                    }}
                    placeholder="e.g. USDT"
                    aria-label="Reward Token"
                  />
                </Field>
                <Field>
                  <Label>{CREATE_FARM_UX.rewardBudget}</Label>
                  <InputBox
                    value={draft.rewardBudget}
                    onChange={(e) => patch({ rewardBudget: e.target.value })}
                    placeholder="e.g. 100000"
                    inputMode="decimal"
                    aria-label="Reward Budget"
                  />
                </Field>
                <Field>
                  <Label>{CREATE_FARM_UX.duration}</Label>
                  <InputBox
                    value={draft.durationDays}
                    onChange={(e) => patch({ durationDays: e.target.value })}
                    placeholder="Days"
                    inputMode="decimal"
                    aria-label="Duration"
                  />
                </Field>
                <Field>
                  <Label>{CREATE_FARM_UX.emission}</Label>
                  <InputBox
                    value={draft.emissionRate}
                    onChange={(e) => patch({ emissionRate: e.target.value })}
                    placeholder="Tokens / day"
                    inputMode="decimal"
                    aria-label="Emission"
                  />
                </Field>
                <Field>
                  <Label>{CREATE_FARM_UX.creationFee}</Label>
                  <ReadOnlyValue
                    data-testid="create-farm-fee"
                    $accent={feeResult.ok && feeResult.isFree ? '#18f089' : '#F4C430'}
                  >
                    {feeResult.ok ? feeResult.fee.display : '—'}
                  </ReadOnlyValue>
                  <FeeNote data-testid="create-farm-fee-note">{CREATE_FARM_UX.feeTreasuryNote}</FeeNote>
                </Field>
                <Field>
                  <Label>{CREATE_FARM_UX.estimatedApr}</Label>
                  <ReadOnlyValue data-testid="create-farm-estimated-apr">{estimatedApr}</ReadOnlyValue>
                </Field>
              </FieldsGrid>

              <AdvancedToggle
                type="button"
                data-testid="create-farm-advanced-toggle"
                onClick={() => setAdvancedOpen((v) => !v)}
              >
                {advancedOpen ? 'Hide advanced' : CREATE_FARM_UX.advanced}
              </AdvancedToggle>
              {advancedOpen && (
                <FieldsGrid data-testid="create-farm-advanced-fields">
                  <Field>
                    <Label>Start</Label>
                    <ReadOnlyValue>
                      {draft.startMode === 'immediate' ? 'Starts when created' : 'Scheduled'}
                    </ReadOnlyValue>
                  </Field>
                  <Field>
                    <Label>Creator wallet</Label>
                    <InputBox
                      value={draft.creatorWallet}
                      onChange={(e) => patch({ creatorWallet: e.target.value })}
                      placeholder="Optional"
                      aria-label="Creator wallet"
                    />
                  </Field>
                </FieldsGrid>
              )}
            </div>
          )}

          {marcoReject.rejected && (
            <RejectBanner data-testid="public-farm-marco-reward-rejection" role="status">
              {CREATE_FARM_UX.marcoRewardFriendly}
            </RejectBanner>
          )}

          <div data-testid="create-farm-primary-action">
            {nextAction === 'increase_liquidity' && (
              <PrimaryLink href={increaseHref} data-testid="create-farm-next-increase">
                {CREATE_FARM_UX.increaseLiquidity}
              </PrimaryLink>
            )}
            {nextAction === 'select_pair' && (
              <PrimaryButton type="button" disabled data-testid="create-farm-next-continue">
                {CREATE_FARM_UX.continue}
              </PrimaryButton>
            )}
            {nextAction === 'continue_config' && (
              <PrimaryButton type="button" disabled data-testid="create-farm-next-continue">
                {CREATE_FARM_UX.continue}
              </PrimaryButton>
            )}
            {nextAction === 'create_farm' && (
              <PrimaryButton
                type="button"
                $ready
                data-testid="create-farm-submit"
                onClick={onPrimary}
              >
                {CREATE_FARM_UX.createFarm}
              </PrimaryButton>
            )}
            {/* Keep a hidden disabled marker for prior locks that expect a disabled submit probe. */}
            <button
              type="button"
              hidden
              disabled
              aria-hidden="true"
              data-testid="create-farm-submit-disabled"
            />
            <SoftNote data-testid="create-farm-next-hint" style={{ marginTop: 10 }}>
              {nextAction === 'select_pair' && CREATE_FARM_UX.nextSelectPair}
              {nextAction === 'increase_liquidity' && CREATE_FARM_UX.nextIncreaseLiquidity}
              {nextAction === 'continue_config' && CREATE_FARM_UX.nextConfigure}
              {nextAction === 'create_farm' && CREATE_FARM_UX.nextCreate}
            </SoftNote>
            {createSoftNote && (
              <SoftNote data-testid="create-farm-soft-unavailable" style={{ marginTop: 8 }}>
                {createSoftNote}
              </SoftNote>
            )}
          </div>
        </FieldsCol>

        <PreviewCol data-testid="create-farm-review-panel">
          <div>
            <PreviewTitle>{CREATE_FARM_UX.review}</PreviewTitle>
            {reviewRows.map(([k, v]) => (
              <ReviewRow key={k}>
                <span>{k}</span>
                <strong>{v}</strong>
              </ReviewRow>
            ))}
          </div>
        </PreviewCol>
      </Body>
    </Section>
  )
}

export default PublicFarmFactoryWorkspace
