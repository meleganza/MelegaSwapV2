/**
 * Public Farm Factory — Create Farm orchestrator.
 * MasterBuilder never exposed. MARCO rewards rejected. Low-TVL remediation stays in-flow.
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
  MARCO_REWARD_REJECTION_MESSAGE,
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  line-height: 28px;
  font-weight: 750;
  color: #f5f5f5;
`

const Subtitle = styled.p`
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 18px;
  color: rgba(255, 255, 255, 0.55);
  max-width: 720px;
`

const ModeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const ModeBtn = styled.button<{ $active?: boolean }>`
  height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(244, 196, 48, 0.55)' : 'rgba(255, 255, 255, 0.12)')};
  background: ${({ $active }) => ($active ? 'rgba(244, 196, 48, 0.14)' : 'rgba(255, 255, 255, 0.03)')};
  color: ${({ $active }) => ($active ? '#F4C430' : '#f2f2f2')};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 16px;
  row-gap: 16px;
  width: 100%;

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

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
  height: 40px;
  box-sizing: border-box;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  font-size: 13px;
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
  color: ${({ $accent }) => $accent || '#18f089'};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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
  font-size: 14px;
  font-weight: 750;
  color: #f2f2f2;
`

const Hint = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 17px;
  color: rgba(255, 255, 255, 0.55);
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
  padding: 10px 12px;
  cursor: pointer;
  font-size: 12px;
  line-height: 16px;
`

const Remediation = styled.div`
  border-radius: 14px;
  border: 1px solid rgba(244, 196, 48, 0.35);
  background: rgba(244, 196, 48, 0.07);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const RemediationTitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 750;
  color: #f4c430;
`

const MetricRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);

  strong {
    color: #f5f5f5;
  }
`

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const ActionLink = styled.a`
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(24, 240, 137, 0.4);
  background: rgba(24, 240, 137, 0.1);
  color: #18f089;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
`

const ActionBtn = styled.button`
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`

const RejectBanner = styled.div`
  border-radius: 12px;
  border: 1px solid rgba(255, 107, 107, 0.4);
  background: rgba(255, 107, 107, 0.1);
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 650;
  color: #ff8a8a;
`

const Blocker = styled.div`
  border-radius: 14px;
  border: 1px solid rgba(255, 107, 107, 0.35);
  background: rgba(255, 107, 107, 0.08);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const BlockerTitle = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 750;
  color: #ff8a8a;
`

const BlockerList = styled.ul`
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const BlockerItem = styled.li`
  font-size: 12px;
  line-height: 17px;
  color: rgba(255, 255, 255, 0.65);
`

const DisabledButton = styled.button`
  align-self: flex-start;
  height: 46px;
  min-width: 220px;
  padding: 0 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  font-weight: 750;
  cursor: not-allowed;

  @media (max-width: 767px) {
    width: 100%;
    min-width: 0;
  }
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

const PreviewValue = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #f2f2f2;
  line-height: 1.35;
`

const ReviewRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  line-height: 17px;
  color: rgba(255, 255, 255, 0.55);

  strong {
    color: #f2f2f2;
    font-weight: 700;
    text-align: right;
    max-width: 60%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

function parseNum(raw: string): number {
  const n = Number(String(raw).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function computeEstimatedFarmApr(draft: PublicFarmFactoryDraft): string {
  const budget = parseNum(draft.rewardBudget)
  const daily = parseNum(draft.emissionRate)
  if (budget <= 0 || daily <= 0) return 'Calculated after reward configuration.'
  const apr = (daily * 365 * 100) / budget
  if (!Number.isFinite(apr)) return 'Complete farm parameters to estimate APR'
  return `${apr.toFixed(1)}%`
}

function computeFarmHealthScore(draft: PublicFarmFactoryDraft, eligible: boolean): number | null {
  if (!eligible || parseNum(draft.rewardBudget) <= 0 || parseNum(draft.emissionRate) <= 0) return null
  let score = 70
  if (pairContainsMarcoAddress(draft.selectedPair, MARCO_BSC_ADDRESS)) score += 8
  if (parseNum(draft.durationDays) >= 30) score += 6
  if (draft.creatorWallet.trim().length > 0) score += 4
  return Math.min(97, Math.max(40, score))
}

function isBuilderDeployed(): boolean {
  return (
    isDeployedAddress(LB_DEPLOYED_ADDRESSES.lbFactory) &&
    isDeployedAddress(LB_DEPLOYED_ADDRESSES.lbAuthorizer) &&
    isDeployedAddress(LB_DEPLOYED_ADDRESSES.lbFeeSink)
  )
}

export const PublicFarmFactoryWorkspace: React.FC = () => {
  const router = useRouter()
  const [draft, setDraft] = useState<PublicFarmFactoryDraft>(() => createDefaultPublicFarmFactoryDraft())
  const [pairQuery, setPairQuery] = useState('')
  const [hydrated, setHydrated] = useState(false)

  const { pairs, status: pairStatus } = useAmmPairRegistry({
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

  // Restore draft on return-to-Create-Farm and initial mount.
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
      // Clean return params without losing hash anchor.
      const url = new URL(window.location.href)
      url.searchParams.delete('return')
      url.searchParams.delete('draftId')
      url.searchParams.delete('destination')
      window.history.replaceState({}, '', `${url.pathname}${url.search}${CREATE_FARM_RETURN_PATH.includes('#') ? '#create-farm' : ''}`)
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
  const healthScore = computeFarmHealthScore(draft, eligibility.eligible)
  const configUnlocked = eligibility.eligible && !marcoReject.rejected

  const selectPair = (pair: PublicFarmSelectedPair) => {
    patch({ selectedPair: pair, selectionMode: 'search_existing' })
  }

  const reviewRows = [
    ['Pair', draft.selectedPair ? `${draft.selectedPair.symbol0}/${draft.selectedPair.symbol1}` : '—'],
    ['LP', draft.selectedPair?.lpTokenAddress || '—'],
    ['Eligible', eligibility.eligible ? 'Yes' : 'Not yet'],
    ['Reward', draft.rewardToken || '—'],
    ['Budget', draft.rewardBudget || '—'],
    ['Emission', draft.emissionRate ? `${draft.emissionRate}/day` : '—'],
    ['Duration', draft.durationDays ? `${draft.durationDays} days` : '—'],
    ['Creator', draft.creatorWallet || '—'],
    [
      'Creation Fee',
      feeResult.ok ? feeResult.fee.display : 'Unsupported',
    ],
    ['Treasury', feeResult.ok ? feeResult.fee.recipientLabel : 'MELEGA TREASURY WALLET'],
    ['Estimated APR', estimatedApr],
    ['Health', healthScore == null ? 'After eligibility + config' : `${healthScore}/100`],
  ]

  return (
    <Section
      id="create-farm"
      data-testid="create-farm-workspace"
      data-testid-public="public-farm-factory-workspace"
      data-fs-create-farm-workspace="true"
      data-public-farm-factory="true"
      data-create-farm-capability={PUBLIC_FARM_FACTORY_CAPABILITY.outcome}
      data-factory-deployed="false"
      data-masterbuilder-exposed="false"
      aria-labelledby="create-farm-workspace-title"
    >
      <Header>
        <div>
          <Title id="create-farm-workspace-title">Create Farm</Title>
          <Subtitle>
            Public Farm Factory — select or create an LP pair, meet the 0.25 BNB TVL eligibility threshold, then configure
            a non-MARCO reward farm. MasterBuilder stays protocol-only.
          </Subtitle>
        </div>
      </Header>

      <ModeRow data-testid="public-farm-pair-mode">
        <ModeBtn
          type="button"
          $active={draft.selectionMode === 'search_existing'}
          data-testid="public-farm-search-existing"
          onClick={() => patch({ selectionMode: 'search_existing' })}
        >
          Search Existing Pair
        </ModeBtn>
        <ModeBtn
          type="button"
          $active={draft.selectionMode === 'create_new'}
          data-testid="public-farm-create-new-pair"
          onClick={() => {
            patch({ selectionMode: 'create_new' })
            saveDraftToStorage({ ...draft, selectionMode: 'create_new', updatedAt: new Date().toISOString() })
            if (typeof window !== 'undefined') window.location.href = createPairHref
          }}
        >
          Create New Pair
        </ModeBtn>
      </ModeRow>

      <Body>
        <FieldsCol>
          {draft.selectionMode === 'search_existing' && (
            <Panel data-testid="public-farm-pair-search">
              <PanelTitle>Existing Pair Search</PanelTitle>
              <Hint>Search by pair name, token symbol, token address, pair contract, or LP token address.</Hint>
              <Field>
                <Label>Search</Label>
                <InputBox
                  value={pairQuery}
                  onChange={(e) => setPairQuery(e.target.value)}
                  placeholder="e.g. MARCO/BNB · 0x…"
                  aria-label="Search existing pair"
                  data-testid="public-farm-pair-query"
                />
              </Field>
              <Hint data-testid="public-farm-pair-search-status">
                Registry: {pairStatus} · {filteredPairs.length} match{filteredPairs.length === 1 ? '' : 'es'}
              </Hint>
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
                        <br />
                        {selected.pairAddress}
                        <br />
                        LP {selected.lpTokenAddress} · {selected.classification}
                      </PairItem>
                    </li>
                  )
                })}
              </PairList>
            </Panel>
          )}

          {draft.selectedPair && (
            <Panel data-testid="public-farm-eligibility" data-eligible={eligibility.eligible ? 'true' : 'false'}>
              <PanelTitle>Eligibility</PanelTitle>
              <MetricRow>
                <span>
                  Status <strong>{eligibility.status}</strong>
                </span>
                <span>
                  Indexed <strong>{eligibility.indexed ? 'yes' : 'no'}</strong>
                </span>
                <span>
                  Active <strong>{eligibility.active ? 'yes' : 'no'}</strong>
                </span>
                <span>
                  Current TVL{' '}
                  <strong data-testid="public-farm-current-tvl">
                    {eligibility.currentTvlBnb == null ? 'unavailable' : `${eligibility.currentTvlBnb.toFixed(4)} BNB`}
                  </strong>
                </span>
                <span>
                  Minimum <strong data-testid="public-farm-minimum-tvl">{PUBLIC_FARM_MINIMUM_TVL_BNB} BNB</strong>
                </span>
                <span>
                  Additional required{' '}
                  <strong data-testid="public-farm-missing-tvl">
                    {eligibility.missingTvlBnb == null ? '—' : `${eligibility.missingTvlBnb.toFixed(4)} BNB`}
                  </strong>
                </span>
              </MetricRow>
              {eligibility.eligible ? (
                <Hint data-testid="public-farm-eligible-banner">Eligible — continue to farm configuration.</Hint>
              ) : (
                <Hint>Not a terminal error — remediate liquidity and return to Create Farm.</Hint>
              )}
            </Panel>
          )}

          {draft.selectedPair && eligibility.status === 'below_minimum_tvl' && (
            <Remediation data-testid="public-farm-low-liquidity-remediation" role="status">
              <RemediationTitle>Not eligible yet</RemediationTitle>
              <MetricRow>
                <span>
                  Current TVL <strong>{eligibility.currentTvlBnb?.toFixed(4)} BNB</strong>
                </span>
                <span>
                  Minimum required <strong>{eligibility.minimumTvlBnb} BNB</strong>
                </span>
                <span>
                  Additional liquidity required <strong>{eligibility.missingTvlBnb?.toFixed(4)} BNB</strong>
                </span>
              </MetricRow>
              <ActionRow>
                {builderHandoff.blocked ? (
                  <ActionBtn
                    type="button"
                    data-testid="public-farm-builder-blocked"
                    title={builderHandoff.blockerLabel || undefined}
                    onClick={() => undefined}
                  >
                    Use AI Liquidity Builder (blocked)
                  </ActionBtn>
                ) : (
                  <ActionLink href={builderHandoff.href} data-testid="public-farm-builder-handoff">
                    Use AI Liquidity Builder
                  </ActionLink>
                )}
                <ActionLink href={manualHref} data-testid="public-farm-manual-liquidity-handoff">
                  Add Liquidity Manually
                </ActionLink>
              </ActionRow>
              {builderHandoff.blocked && (
                <Hint data-testid="public-farm-builder-blocker">{builderHandoff.blockerLabel}</Hint>
              )}
            </Remediation>
          )}

          {configUnlocked && (
            <FieldsGrid data-testid="create-farm-fields-grid" data-public-farm-config="unlocked">
              <Field data-testid="create-farm-reward-token">
                <Label>Reward Token</Label>
                <InputBox
                  value={draft.rewardToken}
                  onChange={(e) => patch({ rewardToken: e.target.value, rewardTokenAddress: e.target.value })}
                  placeholder="Symbol or 0x… (not MARCO)"
                  aria-label="Reward Token"
                />
              </Field>
              <Field>
                <Label>Reward Budget</Label>
                <InputBox
                  value={draft.rewardBudget}
                  onChange={(e) => patch({ rewardBudget: e.target.value })}
                  placeholder="e.g. 100000"
                  inputMode="decimal"
                  aria-label="Reward Budget"
                />
              </Field>
              <Field>
                <Label>Emission (tokens / day)</Label>
                <InputBox
                  value={draft.emissionRate}
                  onChange={(e) => patch({ emissionRate: e.target.value })}
                  placeholder="tokens / day"
                  inputMode="decimal"
                  aria-label="Emission Rate"
                />
              </Field>
              <Field>
                <Label>Duration / End (Days)</Label>
                <InputBox
                  value={draft.durationDays}
                  onChange={(e) => patch({ durationDays: e.target.value })}
                  placeholder="e.g. 60"
                  inputMode="decimal"
                  aria-label="Duration in Days"
                />
              </Field>
              <Field>
                <Label>Reward Schedule</Label>
                <ReadOnlyValue>
                  {draft.startMode === 'immediate' ? 'Starts on creation' : 'Scheduled'} · ends after duration
                </ReadOnlyValue>
              </Field>
              <Field>
                <Label>Creator Wallet</Label>
                <InputBox
                  value={draft.creatorWallet}
                  onChange={(e) => patch({ creatorWallet: e.target.value })}
                  placeholder="0x…"
                  aria-label="Creator Wallet"
                />
              </Field>
              <Field>
                <Label>Creation Fee</Label>
                <ReadOnlyValue
                  data-testid="create-farm-fee"
                  $accent={feeResult.ok && feeResult.isFree ? '#18f089' : '#F4C430'}
                >
                  {feeResult.ok ? `${feeResult.fee.display} · ${feeResult.fee.reason}` : 'Unsupported'}
                </ReadOnlyValue>
              </Field>
              <Field style={{ gridColumn: 'span 2' }}>
                <Label>Treasury Recipient</Label>
                <ReadOnlyValue data-testid="create-farm-treasury-recipient">
                  MELEGA TREASURY WALLET ·{' '}
                  {feeResult.ok ? feeResult.fee.recipient : '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b'}
                </ReadOnlyValue>
              </Field>
              <Field>
                <Label>Estimated APR</Label>
                <ReadOnlyValue data-testid="create-farm-estimated-apr">{estimatedApr}</ReadOnlyValue>
              </Field>
              <Field>
                <Label>Reward Consumption</Label>
                <ReadOnlyValue>
                  {parseNum(draft.emissionRate) > 0 && parseNum(draft.durationDays) > 0
                    ? `${(parseNum(draft.emissionRate) * parseNum(draft.durationDays)).toFixed(2)} tokens over farm life`
                    : 'Calculated after emission + duration'}
                </ReadOnlyValue>
              </Field>
              <Field>
                <Label>Farm Health</Label>
                <ReadOnlyValue data-testid="create-farm-health">
                  {healthScore == null ? 'Calculated after configuration' : `${healthScore} / 100`}
                </ReadOnlyValue>
              </Field>
            </FieldsGrid>
          )}

          {marcoReject.rejected && (
            <RejectBanner data-testid="public-farm-marco-reward-rejection" role="alert">
              {marcoReject.message || MARCO_REWARD_REJECTION_MESSAGE}
            </RejectBanner>
          )}

          <Blocker data-testid="create-farm-execution-blocker" role="status">
            <BlockerTitle>{PUBLIC_FARM_FACTORY_CAPABILITY.blockerLabel}</BlockerTitle>
            <BlockerList>
              {PUBLIC_FARM_FACTORY_CAPABILITY.facts.map((fact) => (
                <BlockerItem key={fact}>{fact}</BlockerItem>
              ))}
            </BlockerList>
            <DisabledButton type="button" disabled aria-disabled="true" data-testid="create-farm-submit-disabled">
              Create Farm — Factory Deployment Required
            </DisabledButton>
          </Blocker>
        </FieldsCol>

        <PreviewCol data-testid="create-farm-review-panel">
          <div>
            <PreviewTitle>Draft</PreviewTitle>
            <PreviewValue data-testid="public-farm-draft-id">{draft.draftId}</PreviewValue>
          </div>
          <div>
            <PreviewTitle>Review</PreviewTitle>
            {reviewRows.map(([k, v]) => (
              <ReviewRow key={k}>
                <span>{k}</span>
                <strong>{v}</strong>
              </ReviewRow>
            ))}
          </div>
          <Hint data-masterbuilder="hidden">MasterBuilder is not available in this workspace.</Hint>
        </PreviewCol>
      </Body>
    </Section>
  )
}

export default PublicFarmFactoryWorkspace
