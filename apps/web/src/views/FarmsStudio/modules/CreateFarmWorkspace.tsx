/**
 * Create Farm Workspace — permanently expanded operational config surface.
 * Not a teaser: every field is visible and editable at all times.
 *
 * Execution is intentionally DISABLED. MasterChef.add() is owner-gated and
 * there is no permissionless farm factory deployed for Melega DEX — see
 * createFarmCapability.ts (CREATE_FARM_CONTRACT_CAPABILITY, outcome
 * "C_ADMIN_ONLY_MASTERBUILDER") for the full readiness assessment.
 */
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { WBNB } from '@pancakeswap/sdk'
import { farmsHero } from './farmsHeroTokens'
import { CREATE_FARM_CONTRACT_CAPABILITY } from './createFarmCapability'
import {
  FARM_TOKEN_OPTIONS,
  computeEstimatedFarmApr,
  computeFarmHealthScore,
  createDefaultCreateFarmWorkspaceState,
  describeCreateFarmWorkspaceFee,
  describeFarmSchedule,
  type CreateFarmWorkspaceState,
} from './createFarmWorkspaceState'

const TOKEN_META: Record<string, { address?: string; chainId: number }> = {
  MARCO: { address: MARCO_BSC_ADDRESS, chainId: 56 },
  BNB: { address: WBNB[56].address, chainId: 56 },
}

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
  max-width: 620px;
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

const SelectRow = styled.div`
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const TokenPill = styled.button<{ $active?: boolean }>`
  flex: 1 1 calc(33.333% - 6px);
  min-width: 64px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 10px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(244, 196, 48, 0.55)' : 'rgba(255, 255, 255, 0.1)')};
  background: ${({ $active }) => ($active ? 'rgba(244, 196, 48, 0.14)' : 'rgba(255, 255, 255, 0.03)')};
  color: ${({ $active }) => ($active ? '#F4C430' : '#f2f2f2')};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RadioRow = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 8px;
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

const PreviewBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const PreviewTitle = styled.span`
  font-size: 10px;
  line-height: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
`

const PreviewValue = styled.span<{ $pending?: boolean }>`
  font-size: ${({ $pending }) => ($pending ? '12px' : '22px')};
  font-weight: ${({ $pending }) => ($pending ? 600 : 750)};
  color: ${({ $pending }) => ($pending ? 'rgba(255,255,255,0.5)' : '#18f089')};
  line-height: 1.3;
`

const HealthBar = styled.div`
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
`

const HealthFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  border-radius: inherit;
  background: linear-gradient(90deg, #18f089 0%, #0fb86a 100%);
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 60%;
  }
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

function TokenAvatar({ symbol }: { symbol: string }) {
  const meta = TOKEN_META[symbol]
  return <MelegaTokenAvatar name={symbol} symbol={symbol} size={20} address={meta?.address} chainId={meta?.chainId ?? 56} radius="circle" />
}

function TokenPicker({
  label,
  value,
  onChange,
  testId,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  testId: string
}) {
  return (
    <Field data-testid={testId}>
      <Label>{label}</Label>
      <SelectRow>
        {FARM_TOKEN_OPTIONS.map((token) => (
          <TokenPill
            key={token}
            type="button"
            $active={value === token}
            aria-pressed={value === token}
            onClick={() => onChange(token)}
          >
            <TokenAvatar symbol={token} />
            {token}
          </TokenPill>
        ))}
      </SelectRow>
    </Field>
  )
}

export const CreateFarmWorkspace: React.FC = () => {
  const [state, setState] = useState<CreateFarmWorkspaceState>(createDefaultCreateFarmWorkspaceState)

  const patch = useCallback((partial: Partial<CreateFarmWorkspaceState>) => {
    setState((prev) => ({ ...prev, ...partial }))
  }, [])

  const fee = useMemo(() => describeCreateFarmWorkspaceFee(state), [state])
  const schedule = useMemo(() => describeFarmSchedule(state), [state])
  const estimatedApr = useMemo(() => computeEstimatedFarmApr(state), [state])
  const healthScore = useMemo(() => computeFarmHealthScore(state), [state])
  const aprPending = estimatedApr === 'Calculated after reward configuration.'

  const reviewRows = useMemo(
    () => [
      ['LP Pair', `${state.lpTokenA} / ${state.lpTokenB}`],
      ['Reward Token', state.rewardToken],
      ['Reward Budget', state.rewardBudget || '—'],
      ['Start', schedule.start],
      ['Duration / End', schedule.end],
      ['Emission Rate', state.emissionRate ? `${state.emissionRate} / day` : '—'],
      ['Farm Owner', state.farmOwner || '—'],
      ['Creation Fee', fee.display],
      ['Treasury Recipient', fee.recipientLabel],
      ['Estimated APR', estimatedApr],
      ['Health', healthScore == null ? 'Calculated after configuration' : `${healthScore} / 100`],
    ],
    [state, schedule, fee, estimatedApr, healthScore],
  )

  return (
    <Section
      id="create-farm"
      data-testid="create-farm-workspace"
      data-fs-create-farm-workspace="true"
      data-create-farm-capability={CREATE_FARM_CONTRACT_CAPABILITY.outcome}
      aria-labelledby="create-farm-workspace-title"
    >
      <Header>
        <div>
          <Title id="create-farm-workspace-title">Create Farm</Title>
          <Subtitle>
            Configure an LP farm end-to-end — reward token, budget, schedule, emission rate, and creation fee.
          </Subtitle>
        </div>
      </Header>

      <Body>
        <FieldsCol>
          <FieldsGrid data-testid="create-farm-fields-grid">
            <TokenPicker
              label="LP Pair · Token A"
              value={state.lpTokenA}
              onChange={(lpTokenA) => patch({ lpTokenA })}
              testId="create-farm-lp-token-a"
            />
            <TokenPicker
              label="LP Pair · Token B"
              value={state.lpTokenB}
              onChange={(lpTokenB) => patch({ lpTokenB })}
              testId="create-farm-lp-token-b"
            />
            <TokenPicker
              label="Reward Token"
              value={state.rewardToken}
              onChange={(rewardToken) => patch({ rewardToken })}
              testId="create-farm-reward-token"
            />

            <Field>
              <Label>Reward Budget</Label>
              <InputBox
                value={state.rewardBudget}
                onChange={(e) => patch({ rewardBudget: e.target.value })}
                aria-label="Reward Budget"
                placeholder="e.g. 500000"
                inputMode="decimal"
              />
            </Field>
            <Field>
              <Label>Start</Label>
              <RadioRow>
                <TokenPill
                  type="button"
                  $active={state.startMode === 'immediate'}
                  aria-pressed={state.startMode === 'immediate'}
                  onClick={() => patch({ startMode: 'immediate' })}
                >
                  Immediate
                </TokenPill>
                <TokenPill
                  type="button"
                  $active={state.startMode === 'scheduled'}
                  aria-pressed={state.startMode === 'scheduled'}
                  onClick={() => patch({ startMode: 'scheduled' })}
                >
                  Scheduled
                </TokenPill>
              </RadioRow>
            </Field>
            <Field>
              <Label title="Total number of days the farm emits rewards before ending.">Duration / End (Days)</Label>
              <InputBox
                value={state.durationDays}
                onChange={(e) => patch({ durationDays: e.target.value })}
                aria-label="Duration in Days"
                placeholder="e.g. 60"
                inputMode="decimal"
              />
            </Field>

            <Field>
              <Label title="Reward tokens emitted per day, converted to per-block allocation on BNB Chain.">
                Emission Rate (tokens / day)
              </Label>
              <InputBox
                value={state.emissionRate}
                onChange={(e) => patch({ emissionRate: e.target.value })}
                aria-label="Emission Rate"
                placeholder="tokens / day"
                inputMode="decimal"
              />
            </Field>
            <Field>
              <Label>Farm Owner</Label>
              <InputBox
                value={state.farmOwner}
                onChange={(e) => patch({ farmOwner: e.target.value })}
                aria-label="Farm Owner"
                placeholder="0x…"
              />
            </Field>
            <Field>
              <Label>Creation Fee</Label>
              <ReadOnlyValue data-testid="create-farm-fee" $accent={fee.isFree ? '#18f089' : '#F4C430'}>
                {fee.display} · {fee.reason}
              </ReadOnlyValue>
            </Field>

            <Field style={{ gridColumn: 'span 2' }}>
              <Label>Treasury Recipient</Label>
              <ReadOnlyValue data-testid="create-farm-treasury-recipient">
                {fee.recipientLabel} · {fee.recipient}
              </ReadOnlyValue>
            </Field>
            <Field>
              <Label>Estimated APR</Label>
              <ReadOnlyValue data-testid="create-farm-estimated-apr" $accent={aprPending ? undefined : '#18f089'}>
                {estimatedApr}
              </ReadOnlyValue>
            </Field>
          </FieldsGrid>

          <Blocker data-testid="create-farm-execution-blocker" role="status">
            <BlockerTitle>{CREATE_FARM_CONTRACT_CAPABILITY.blockerLabel}</BlockerTitle>
            <BlockerList>
              {CREATE_FARM_CONTRACT_CAPABILITY.facts.map((fact) => (
                <BlockerItem key={fact}>{fact}</BlockerItem>
              ))}
            </BlockerList>
            <DisabledButton type="button" disabled aria-disabled="true" data-testid="create-farm-submit-disabled">
              Create Farm — Execution Disabled
            </DisabledButton>
          </Blocker>
        </FieldsCol>

        <PreviewCol data-testid="create-farm-review-panel">
          <PreviewBlock>
            <PreviewTitle>Estimated APR</PreviewTitle>
            <PreviewValue $pending={aprPending}>{estimatedApr}</PreviewValue>
          </PreviewBlock>

          <PreviewBlock>
            <PreviewTitle>Farm Health</PreviewTitle>
            {healthScore == null ? (
              <PreviewValue $pending>Calculated after reward configuration.</PreviewValue>
            ) : (
              <>
                <PreviewValue $pending>{healthScore} / 100</PreviewValue>
                <HealthBar>
                  <HealthFill $pct={healthScore} data-testid="create-farm-health-bar" />
                </HealthBar>
              </>
            )}
          </PreviewBlock>

          <PreviewBlock>
            <PreviewTitle>Review</PreviewTitle>
            {reviewRows.map(([k, v]) => (
              <ReviewRow key={k}>
                <span>{k}</span>
                <strong>{v}</strong>
              </ReviewRow>
            ))}
          </PreviewBlock>
        </PreviewCol>
      </Body>
    </Section>
  )
}

export default CreateFarmWorkspace
