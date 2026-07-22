import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { ArrowRight, Check, ChevronDown, CircleAlert, Info, ShieldCheck } from 'lucide-react'
import type { Currency } from '@pancakeswap/sdk'
import type { LiquidityBuildingCardState } from '../useLiquidityBuildingCard'
import { DECISION_FREQUENCY_OPTIONS, LB_UX } from '../uxCopy'
import { lb } from './lbProductTokens'

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 24px;
  align-items: start;

  @media (max-width: 1119px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 1279px) and (min-width: 1120px) {
    grid-template-columns: minmax(0, 1fr) 300px;
  }
`

const FormCard = styled.section`
  padding: 28px;
  border-radius: 20px;
  background: ${lb.card};
  border: 1px solid ${lb.border};
  box-sizing: border-box;

  @media (max-width: 390px) {
    padding: 20px;
    border-radius: 18px;
  }
`

const SummaryCard = styled.aside<{ $sticky: boolean }>`
  padding: 20px;
  border-radius: 18px;
  background: ${lb.cardDeep};
  border: 1px solid ${lb.borderSoft};
  box-sizing: border-box;
  ${({ $sticky }) => ($sticky ? 'position: sticky; top: 104px;' : '')}
`

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  line-height: 31px;
  font-weight: 600;
  color: ${lb.text};
  font-family: ${lb.font};
`

const Desc = styled.p`
  margin: 6px 0 0;
  max-width: 650px;
  font-size: 13px;
  line-height: 20px;
  color: ${lb.muted};
`

const Section = styled.div`
  margin-top: 28px;
`

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  color: ${lb.text};
`

const SectionDesc = styled.p`
  margin: 4px 0 0;
  font-size: 11px;
  line-height: 16px;
  color: ${lb.muted4};
`

const FieldLabel = styled.label`
  display: block;
  margin-top: 12px;
  font-size: 12px;
  font-weight: 600;
  color: ${lb.muted2};
`

const TokenBtn = styled.button<{ $error?: boolean }>`
  width: 100%;
  height: 56px;
  margin-top: 10px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid ${({ $error }) => ($error ? 'rgba(239,68,68,0.70)' : lb.borderInput)};
  background: ${lb.input};
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  color: ${lb.text};
  font-family: ${lb.font};
  box-shadow: ${({ $error }) => ($error ? '0 0 0 3px rgba(239,68,68,0.08)' : 'none')};

  &:hover {
    border-color: ${({ $error }) => ($error ? 'rgba(239,68,68,0.70)' : '#444444')};
    background: #101010;
  }

  &:focus-visible {
    border-color: #8a700b;
    box-shadow: 0 0 0 3px rgba(244, 196, 48, 0.08);
    outline: none;
  }
`

const TokenLeft = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const TokenIcon = styled.span`
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: #1b1b1b;
  border: 1px solid ${lb.border};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: ${lb.gold};
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const TokenMeta = styled.span`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const TokenSymbol = styled.span`
  font-size: 14px;
  line-height: 19px;
  font-weight: 600;
  color: ${lb.text};
`

const TokenSub = styled.span`
  margin-top: 2px;
  font-size: 10px;
  line-height: 14px;
  color: ${lb.muted5};
`

const BudgetShell = styled.div<{ $error?: boolean }>`
  width: 100%;
  height: 64px;
  margin-top: 10px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid ${({ $error }) => ($error ? 'rgba(239,68,68,0.70)' : lb.borderInput)};
  background: ${lb.input};
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
  box-shadow: ${({ $error }) => ($error ? '0 0 0 3px rgba(239,68,68,0.08)' : 'none')};
`

const BudgetInput = styled.input`
  border: 0;
  outline: 0;
  background: transparent;
  color: ${lb.text};
  font-size: 22px;
  line-height: 28px;
  font-weight: 600;
  min-width: 0;
  width: 100%;
  font-family: ${lb.font};
`

const BudgetBelow = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 10px;
  line-height: 14px;
  color: #7a7a7a;
`

const MaxBtn = styled.button`
  height: 26px;
  padding: 0 9px;
  border-radius: 8px;
  border: 1px solid #3b3318;
  background: rgba(244, 196, 48, 0.06);
  color: ${lb.gold};
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
`

const StrategyGrid = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 390px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 768px) and (min-width: 391px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const StrategyCard = styled.button<{ $active?: boolean }>`
  min-height: 116px;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid ${({ $active }) => ($active ? lb.goldBorder : lb.borderInput)};
  background: ${({ $active }) =>
    $active
      ? 'linear-gradient(180deg, rgba(244,196,48,0.07), rgba(13,13,13,1))'
      : lb.input};
  position: relative;
  cursor: pointer;
  text-align: left;
  color: ${lb.text};
  font-family: ${lb.font};
`

const StrategyCheck = styled.span`
  position: absolute;
  top: 14px;
  right: 14px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: ${lb.gold};
  display: flex;
  align-items: center;
  justify-content: center;
`

const StrategyTitle = styled.div`
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  color: ${lb.text};
  display: flex;
  align-items: center;
`

const RecBadge = styled.span`
  margin-left: 7px;
  height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  background: ${lb.gold};
  color: ${lb.ink};
  font-size: 8px;
  line-height: 18px;
  font-weight: 800;
  letter-spacing: 0.4px;
`

const StrategyDesc = styled.p`
  margin: 8px 0 0;
  max-width: 260px;
  font-size: 11px;
  line-height: 16px;
  color: #8f8f8f;
`

const RangeRow = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`

const RangeField = styled.input`
  height: 44px;
  border-radius: 12px;
  background: ${lb.input};
  border: 1px solid ${lb.borderInput};
  color: ${lb.text};
  padding: 0 12px;
  font-size: 13px;
  font-weight: 600;
  width: 100%;
  box-sizing: border-box;
`

const FreqGrid = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const FreqBtn = styled.button<{ $active?: boolean }>`
  height: 42px;
  border-radius: 11px;
  border: 1px solid ${({ $active }) => ($active ? lb.goldBorder : lb.borderInput)};
  background: ${({ $active }) => ($active ? 'rgba(244,196,48,0.08)' : lb.input)};
  color: ${({ $active }) => ($active ? lb.gold : lb.muted)};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  font-family: ${lb.font};
`

const AdvTrigger = styled.button`
  width: 100%;
  min-height: 44px;
  margin-top: 10px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid ${lb.borderSoft};
  background: ${lb.input};
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #d4d4d4;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  font-family: ${lb.font};
`

const AdvRow = styled.div`
  margin-top: 10px;
  min-height: 36px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${lb.borderSoft};
  background: ${lb.input};
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
  color: ${lb.muted2};
`

const ErrorMsg = styled.div`
  margin-top: 6px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 10px;
  line-height: 15px;
  color: ${lb.danger};
`

const Footer = styled.div`
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 390px) {
    flex-direction: column-reverse;
    & > button {
      width: 100%;
    }
  }
`

const CancelBtn = styled.button`
  height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid ${lb.border};
  background: transparent;
  color: ${lb.muted2};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: ${lb.font};
`

const ReviewBtn = styled.button<{ $disabled?: boolean }>`
  height: 44px;
  min-width: 160px;
  padding: 0 18px;
  border-radius: 12px;
  border: 0;
  background: ${({ $disabled }) => ($disabled ? '#333333' : lb.gold)};
  color: ${({ $disabled }) => ($disabled ? '#747474' : lb.ink)};
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  font-family: ${lb.font};
`

const SummaryTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  line-height: 20px;
  font-weight: 600;
  color: ${lb.text};
`

const SumRow = styled.div<{ $last?: boolean }>`
  min-height: 42px;
  padding: 10px 0;
  border-bottom: ${({ $last }) => ($last ? '0' : `1px solid #242424`)};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
`

const SumLabel = styled.span`
  font-size: 10px;
  line-height: 14px;
  color: ${lb.muted5};
`

const SumValue = styled.span`
  max-width: 180px;
  font-size: 11px;
  line-height: 16px;
  font-weight: 600;
  color: #d4d4d4;
  text-align: right;
  word-break: break-word;
`

const InfoBlock = styled.div`
  margin-top: 16px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${lb.border};
  background: ${lb.input};
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 9px;
  font-size: 10px;
  line-height: 15px;
  color: #8f8f8f;
`

function tokenInitials(symbol?: string | null) {
  const s = (symbol || '?').trim()
  return s.slice(0, 2).toUpperCase()
}

function shorten(addr?: string | null) {
  if (!addr) return 'Not available'
  if (addr.length < 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function LbSetupView({
  card,
  onPickToken,
  stickySummary,
}: {
  card: LiquidityBuildingCardState
  onPickToken: () => void
  stickySummary: boolean
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [touched, setTouched] = useState({ token: false, budget: false })

  const balanceNum = useMemo(() => {
    if (!card.walletBalanceLabel) return null
    const n = Number(card.walletBalanceLabel.split(' ')[0])
    return Number.isFinite(n) ? n : null
  }, [card.walletBalanceLabel])

  const budgetNum = Number(card.draft.tokenBudget)
  const tokenError =
    touched.token && !card.draft.tokenAddress ? 'Select a supported token.' : null
  const budgetError = (() => {
    if (!touched.budget && !card.draft.tokenBudget) return null
    if (!Number.isFinite(budgetNum) || budgetNum <= 0) return 'Enter a budget greater than zero.'
    if (balanceNum != null && budgetNum > balanceNum) return 'Budget exceeds your available balance.'
    return null
  })()

  const pairHint =
    !card.draft.tokenSymbol
      ? null
      : card.pairDetection.loading
        ? LB_UX.pairLoading
        : card.pairDetection.available
          ? `${LB_UX.pairDetected}`
          : 'A Melega DEX pool could not be detected.'

  const destination = card.pairDetection.available
    ? `${card.draft.tokenSymbol}/${card.pairDetection.quoteSymbol}`
    : 'Not available'

  const logoURI = (card.selectedCurrency as Currency & { logoURI?: string })?.logoURI

  return (
    <div data-testid="lb-setup-view">
      <Layout>
        <div>
          <FormCard>
            <Title>Configure your program</Title>
            <Desc>Choose the token reserve and operating strategy. Melega will validate the rest automatically.</Desc>

            <Section>
              <SectionTitle>Token reserve</SectionTitle>
              <SectionDesc>Select an eligible wallet token and dedicate a maximum budget.</SectionDesc>
              <FieldLabel htmlFor="lb-token-select">Token</FieldLabel>
              <TokenBtn
                id="lb-token-select"
                type="button"
                data-testid="lb-token-select"
                aria-required
                $error={Boolean(tokenError)}
                onClick={() => {
                  setTouched((t) => ({ ...t, token: true }))
                  onPickToken()
                }}
              >
                <TokenLeft>
                  <TokenIcon>
                    {logoURI ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoURI} alt="" />
                    ) : (
                      tokenInitials(card.draft.tokenSymbol)
                    )}
                  </TokenIcon>
                  <TokenMeta>
                    <TokenSymbol>{card.draft.tokenSymbol || 'Select token'}</TokenSymbol>
                    <TokenSub data-testid="lb-token-meta">
                      {card.draft.tokenAddress ? shorten(card.draft.tokenAddress) : 'Required'}
                    </TokenSub>
                  </TokenMeta>
                </TokenLeft>
                <ChevronDown size={16} color={lb.muted5} aria-hidden />
              </TokenBtn>
              {tokenError ? (
                <ErrorMsg data-testid="lb-token-error">
                  <CircleAlert size={14} aria-hidden />
                  {tokenError}
                </ErrorMsg>
              ) : null}
              {pairHint ? (
                <SectionDesc data-testid="lb-pair-detection" style={{ marginTop: 8 }}>
                  {pairHint}
                </SectionDesc>
              ) : null}

              <FieldLabel htmlFor="lb-budget-input">Token Budget</FieldLabel>
              <SectionDesc>Maximum amount available to this program.</SectionDesc>
              <BudgetShell $error={Boolean(budgetError)}>
                <BudgetInput
                  id="lb-budget-input"
                  data-testid="lb-budget-input"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={card.draft.tokenBudget}
                  onChange={(e) => {
                    setTouched((t) => ({ ...t, budget: true }))
                    card.setBudget(e.target.value)
                  }}
                  aria-required
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: lb.muted }}>
                  {card.draft.tokenSymbol || 'TOKEN'}
                </span>
              </BudgetShell>
              <BudgetBelow>
                <span>
                  {card.walletBalanceLabel ? `Wallet ${card.walletBalanceLabel}` : 'Wallet balance unavailable'}
                </span>
                <MaxBtn
                  type="button"
                  data-testid="lb-budget-max"
                  disabled={balanceNum == null}
                  onClick={() => {
                    if (balanceNum == null || !card.walletBalanceLabel) return
                    const raw = card.walletBalanceLabel.split(' ')[0]
                    card.setBudget(raw)
                    setTouched((t) => ({ ...t, budget: true }))
                  }}
                >
                  MAX
                </MaxBtn>
              </BudgetBelow>
              {budgetError ? (
                <ErrorMsg data-testid="lb-budget-error">
                  <CircleAlert size={14} aria-hidden />
                  {budgetError}
                </ErrorMsg>
              ) : null}
            </Section>

            <Section>
              <SectionTitle>Strategy</SectionTitle>
              <SectionDesc>Full AI is recommended. Dynamic Range is advanced.</SectionDesc>
              <StrategyGrid>
                <StrategyCard
                  type="button"
                  $active={card.draft.strategy === 'FULL_AI'}
                  data-testid="lb-strategy-full-ai"
                  onClick={() => card.setStrategy('FULL_AI')}
                >
                  {card.draft.strategy === 'FULL_AI' ? (
                    <StrategyCheck>
                      <Check size={12} color={lb.ink} strokeWidth={2.2} />
                    </StrategyCheck>
                  ) : null}
                  <StrategyTitle>
                    Full AI <RecBadge>RECOMMENDED</RecBadge>
                  </StrategyTitle>
                  <StrategyDesc>Melega chooses the operating range within fixed safety limits.</StrategyDesc>
                </StrategyCard>
                <StrategyCard
                  type="button"
                  $active={card.draft.strategy === 'DYNAMIC_RANGE'}
                  data-testid="lb-strategy-dynamic"
                  onClick={() => card.setStrategy('DYNAMIC_RANGE')}
                >
                  {card.draft.strategy === 'DYNAMIC_RANGE' ? (
                    <StrategyCheck>
                      <Check size={12} color={lb.ink} strokeWidth={2.2} />
                    </StrategyCheck>
                  ) : null}
                  <StrategyTitle>Dynamic Range</StrategyTitle>
                  <StrategyDesc>Define a minimum and maximum percentage for each decision.</StrategyDesc>
                </StrategyCard>
              </StrategyGrid>
              {card.draft.strategy === 'DYNAMIC_RANGE' ? (
                <RangeRow data-testid="lb-dynamic-range-fields">
                  <div>
                    <FieldLabel>Minimum %</FieldLabel>
                    <RangeField
                      inputMode="decimal"
                      value={card.draft.minimumRateBps}
                      onChange={(e) => card.setRateRange(e.target.value, card.draft.maximumRateBps)}
                      data-testid="lb-range-min"
                    />
                  </div>
                  <div>
                    <FieldLabel>Maximum %</FieldLabel>
                    <RangeField
                      inputMode="decimal"
                      value={card.draft.maximumRateBps}
                      onChange={(e) => card.setRateRange(card.draft.minimumRateBps, e.target.value)}
                      data-testid="lb-range-max"
                    />
                  </div>
                </RangeRow>
              ) : null}
            </Section>

            <Section>
              <SectionTitle>Decision frequency</SectionTitle>
              <SectionDesc>How often Melega evaluates market conditions.</SectionDesc>
              <FreqGrid>
                {DECISION_FREQUENCY_OPTIONS.map((opt) => (
                  <FreqBtn
                    key={opt.seconds}
                    type="button"
                    $active={card.draft.epochSeconds === opt.seconds}
                    data-testid={`lb-freq-${opt.seconds}`}
                    onClick={() => card.setEpoch(opt.seconds)}
                  >
                    {opt.label}
                  </FreqBtn>
                ))}
              </FreqGrid>
            </Section>

            <Section>
              <SectionTitle>Advanced protections</SectionTitle>
              <AdvTrigger
                type="button"
                data-testid="lb-advanced-protections"
                aria-expanded={advancedOpen}
                onClick={() => setAdvancedOpen((v) => !v)}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} color={lb.gold} aria-hidden />
                  Advanced protections
                </span>
                <ChevronDown size={15} color={lb.muted5} aria-hidden />
              </AdvTrigger>
              {advancedOpen ? (
                <div data-testid="lb-advanced-protections-body">
                  {[
                    'Maximum per-decision usage',
                    'Daily budget cap',
                    'Maximum price impact',
                    'Slippage cap',
                  ].map((row) => (
                    <AdvRow key={row}>
                      <span>{row}</span>
                      <span style={{ color: lb.muted5, fontWeight: 600 }}>Managed by strategy</span>
                    </AdvRow>
                  ))}
                </div>
              ) : null}
            </Section>
          </FormCard>

          <Footer>
            <CancelBtn type="button" data-testid="lb-setup-cancel" onClick={card.backToEntry}>
              Cancel
            </CancelBtn>
            <ReviewBtn
              type="button"
              data-testid="lb-primary-cta"
              $disabled={!card.draftReady}
              disabled={!card.draftReady}
              onClick={() => {
                setTouched({ token: true, budget: true })
                card.openReview()
              }}
            >
              Review Program
              <ArrowRight size={16} aria-hidden />
            </ReviewBtn>
          </Footer>
        </div>

        <SummaryCard $sticky={stickySummary} data-testid="lb-program-preview">
          <SummaryTitle>Program preview</SummaryTitle>
          {(
            [
              ['Token', card.draft.tokenSymbol || 'Not available'],
              ['Budget', card.draft.tokenBudget ? `${card.draft.tokenBudget} ${card.draft.tokenSymbol || ''}`.trim() : 'Not available'],
              [
                'Strategy',
                card.draft.strategy === 'FULL_AI' ? 'Full AI' : 'Dynamic Range',
              ],
              ['Decision Frequency', card.decisionFrequencyLabel],
              ['Liquidity Destination', destination],
              ['LP Ownership', LB_UX.lpOwnedByOwner],
              ['Success Fee', '5% on quote acquired'],
            ] as const
          ).map(([label, value], i, arr) => (
            <SumRow key={label} $last={i === arr.length - 1}>
              <SumLabel>{label}</SumLabel>
              <SumValue>{value}</SumValue>
            </SumRow>
          ))}
          <InfoBlock>
            <Info size={16} color={lb.gold} aria-hidden />
            <span>
              Your configuration is reviewed before any approval or deposit action becomes available.
            </span>
          </InfoBlock>
        </SummaryCard>
      </Layout>
    </div>
  )
}
