import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import styled, { css, keyframes } from 'styled-components'
import { poolsStudioColors } from '../poolsStudioTokens'
import CreatePoolWizardPreview from './CreatePoolWizardPreview'
import {
  WIZARD_STEP_LABELS,
  TOKEN_OPTIONS,
  buildMachinePreviewJson,
  computeEstimatedApr,
  computeHealthScore,
  createDefaultWizardState,
  type CreatePoolWizardState,
  type WizardStep,
} from './createPoolWizardState'

const Card = styled.section<{ $expanded?: boolean }>`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: #141414;
  border: 1px solid
    ${({ $expanded }) => ($expanded ? 'rgba(212, 175, 55, 0.45)' : 'rgba(212, 175, 55, 0.32)')};
  border-radius: 22px;
  padding: ${({ $expanded }) => ($expanded ? '32px 36px 34px' : '28px 32px')};
  display: flex;
  flex-direction: column;
  overflow: ${({ $expanded }) => ($expanded ? 'visible' : 'hidden')};
  min-height: ${({ $expanded }) => ($expanded ? '0' : '188px')};
  height: auto;
  transition: padding 220ms ease-out, border-color 220ms ease-out;

  @media (max-width: 767px) {
    padding: ${({ $expanded }) => ($expanded ? '18px' : '28px 24px')};
    border-radius: 18px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    margin-bottom: 32px;
    scroll-margin-top: 16px;
    scroll-margin-bottom: 120px;
  }
`

const CompactTitle = styled.h2`
  margin: 0;
  font-family: Orbitron, sans-serif;
  font-size: 30px;
  line-height: 36px;
  font-weight: 700;
  color: #f7f7f7;
`

const CompactSubtitle = styled.p`
  margin: 8px 0 0;
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: #9a9a9a;
`

const CompactCtaRow = styled.div`
  display: flex;
  align-items: center;
  margin-top: 24px;
  gap: 16px;
  min-width: 0;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`

const CompactCreateBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 168px;
  min-width: 168px;
  height: 46px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #f0d050 0%, #d4af37 55%, #c9a227 100%);
  color: #050505;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  flex-shrink: 0;
  transition: box-shadow 150ms ease;

  &:hover {
    box-shadow: 0 0 24px rgba(232, 196, 58, 0.22);
  }

  @media (max-width: 767px) {
    width: 100%;
    min-width: 0;
  }
`

const CompactMicrocopy = styled.p`
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  color: #777777;

  @media (max-width: 767px) {
    text-align: center;
  }
`

const ExpandedHeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;

  @media (max-width: 767px) {
    margin-bottom: 14px;
  }
`

const CloseBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  min-width: 72px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: #b8b8b8;
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    border-color 150ms ease,
    color 150ms ease;

  &:hover {
    border-color: #d4af37;
    color: #d4af37;
  }
`

const Header = styled.div`
  margin-bottom: 18px;

  @media (max-width: 767px) {
    margin-bottom: 14px;
  }
`

const Title = styled.h2`
  margin: 0;
  font-family: Orbitron, sans-serif;
  font-size: 32px;
  line-height: 38px;
  font-weight: 700;
  color: #ffffff;

  @media (max-width: 767px) {
    font-size: 24px;
    line-height: 30px;
  }
`

const Subtitle = styled.p`
  margin: 6px 0 0;
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: #9a9a9a;

  @media (max-width: 767px) {
    font-size: 12px;
    line-height: 18px;
  }
`

const ProgressWizard = styled.div`
  height: 44px;
  display: flex;
  align-items: center;
  margin-bottom: 22px;
  min-width: 0;

  @media (max-width: 767px) {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    margin-bottom: 16px;
    margin-left: 0;
    margin-right: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 0 16px;
    scroll-padding-inline: 16px;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`

const ProgressTrack = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;

  @media (max-width: 767px) {
    min-width: max-content;
    width: max-content;
    padding-right: 16px;
  }
`

const StepNode = styled.div<{ $active?: boolean; $completed?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;

  @media (max-width: 767px) {
    flex: 0 0 auto;
    min-width: 56px;
  }

  &:first-child {
    @media (max-width: 767px) {
      min-width: 64px;
    }
  }
`

const StepCircle = styled.div<{ $active?: boolean; $completed?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  box-sizing: border-box;
  display: grid;
  place-items: center;
  font-family: Inter, sans-serif;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  transition:
    background 180ms ease,
    border-color 180ms ease,
    color 180ms ease;

  ${({ $completed, $active }) =>
    $completed
      ? css`
          background: rgba(24, 240, 137, 0.14);
          border: 1px solid #18f089;
          color: #18f089;
        `
      : $active
        ? css`
            background: rgba(212, 175, 55, 0.14);
            border: 1px solid #d4af37;
            color: #d4af37;
          `
        : css`
            background: #1d1d1d;
            border: 1px solid #333333;
            color: #707070;
          `}
`

const StepLabel = styled.span<{ $active?: boolean; $completed?: boolean }>`
  font-family: Inter, sans-serif;
  font-size: 12px;
  line-height: 14px;
  font-weight: 600;
  white-space: nowrap;
  color: ${({ $completed, $active }) => ($completed ? '#18f089' : $active ? '#d4af37' : '#707070')};
  transition: color 180ms ease;
`

const Connector = styled.div<{ $filled?: boolean }>`
  flex: 1;
  height: 2px;
  min-width: 12px;
  margin: 0 4px 18px;
  background: #2c2c2c;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ $filled }) => ($filled ? '#18f089' : 'transparent')};
    transform: scaleX(${({ $filled }) => ($filled ? 1 : 0)});
    transform-origin: left center;
    transition: transform 180ms ease;
  }
`

const Body = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 22px;
  min-width: 0;

  @media (max-width: 767px) {
    flex-direction: column;
    gap: 0;
  }
`

const PreviewColumn = styled.div`
  width: 320px;
  min-width: 320px;
  align-self: flex-start;
  position: sticky;
  top: 24px;

  @media (max-width: 767px) {
    width: 100%;
    min-width: 0;
    position: static;
    top: auto;
    margin-top: 24px;

    & > aside {
      margin-top: 0;
    }
  }
`

const StepColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;

  @media (max-width: 767px) {
    width: 100%;
    align-self: stretch;
  }
`

const slideInFromRight = keyframes`
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
`

const slideInFromLeft = keyframes`
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: translateX(0); }
`

const slideInNext = css`
  animation: ${slideInFromRight} 220ms ease;
`

const slideInPrev = css`
  animation: ${slideInFromLeft} 220ms ease;
`

const StepPanel = styled.div<{ $dir: 'next' | 'prev' | 'none' }>`
  ${({ $dir }) => ($dir === 'next' ? slideInNext : $dir === 'prev' ? slideInPrev : '')}
  min-width: 0;

  @media (max-width: 767px) {
    width: 100%;
  }
`

const FieldsGrid = styled.div<{ $cols?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols ?? 2}, minmax(0, 1fr));
  column-gap: 18px;
  row-gap: 18px;
  width: 100%;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    column-gap: 0;
    row-gap: 10px;
  }
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  height: 68px;
  min-height: 68px;
  min-width: 0;
  overflow: visible;

  @media (max-width: 767px) {
    height: 56px;
    min-height: 56px;
  }
`

const FieldTall = styled(Field)`
  height: auto;
  min-height: 68px;
`

const Label = styled.span`
  font-family: Inter, sans-serif;
  font-size: 11px;
  line-height: 12px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #7f7f7f;
  white-space: nowrap;
  overflow: visible;

  @media (max-width: 767px) {
    font-size: 9px;
    line-height: 11px;
    letter-spacing: 0.08em;
    color: #777777;
  }
`

const valueTextStyles = css<{ $compact?: boolean }>`
  font-family: Inter, sans-serif;
  font-size: ${({ $compact }) => ($compact ? '12px' : '14px')};
  font-weight: 700;
  line-height: 1.2;
  color: #f2f2f2;

  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 600;
    color: #ffffff;
  }
`

const inputSurfaceStyles = css`
  margin-top: 8px;
  height: 42px;
  min-height: 42px;
  width: 100%;
  box-sizing: border-box;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
  background: #1a1a1a;
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;

  @media (max-width: 767px) {
    margin-top: 6px;
    height: 38px;
    min-height: 38px;
    padding: 0 12px;
    border-radius: 10px;
    border-color: #292929;
  }
`

const InputBox = styled.input<{ $compact?: boolean }>`
  ${inputSurfaceStyles}
  ${valueTextStyles}

  &::placeholder {
    color: #7f7f7f;
  }
`

const ReadOnlyValue = styled.div<{ $compact?: boolean }>`
  ${inputSurfaceStyles}
  ${valueTextStyles}
  display: flex;
  align-items: center;
  color: #18f089;
`

const PreviewBtn = styled.button`
  ${inputSurfaceStyles}
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  color: ${poolsStudioColors.explorerGold};
  text-align: left;
  cursor: pointer;
`

const SelectWrap = styled.div`
  position: relative;
  margin-top: 8px;
  min-width: 0;

  @media (max-width: 767px) {
    margin-top: 6px;
  }
`

const SelectBtn = styled.button`
  ${inputSurfaceStyles}
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #f2f2f2;
  text-align: left;
  cursor: pointer;
  padding-right: 10px;

  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 600;
  }
`

const TokenLogo = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37 0%, #8a7020 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  color: #050505;
  flex-shrink: 0;
`

const Dropdown = styled.div`
  position: absolute;
  z-index: 20;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #1a1a1a;
  border: 1px solid #333333;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
`

const SearchInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #2a2a2a;
  background: #141414;
  padding: 0 10px;
  font-family: Inter, sans-serif;
  font-size: 12px;
  color: #f2f2f2;
  margin-bottom: 6px;

  &::placeholder {
    color: #707070;
  }
`

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #f2f2f2;
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  padding: 0 8px;

  &:hover {
    background: #242424;
  }
`

const StepActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 22px;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    width: 100%;
    align-self: stretch;
    box-sizing: border-box;
    position: sticky;
    bottom: 0;
    z-index: 5;
    margin-top: 16px;
    padding: 12px 0 calc(8px + env(safe-area-inset-bottom, 0px));
    background: linear-gradient(180deg, rgba(20, 20, 20, 0) 0%, #141414 28%);
  }
`

const GoldBtn = styled.button<{ $wide?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $wide }) => ($wide ? '220px' : '176px')};
  min-width: ${({ $wide }) => ($wide ? '220px' : '176px')};
  height: ${({ $wide }) => ($wide ? '50px' : '46px')};
  border: none;
  border-radius: 12px;
  background: #e8c43a;
  color: #050505;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  flex-shrink: 0;
  transition: box-shadow 150ms ease;
  text-decoration: none;

  &:hover {
    box-shadow: 0 0 24px rgba(232, 196, 58, 0.22);
  }

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    min-width: 0;
    height: 46px;
    display: flex;
    align-self: stretch;
  }
`

const GhostBtn = styled.button<{ $review?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $review }) => ($review ? '96px' : 'auto')};
  min-width: ${({ $review }) => ($review ? '96px' : '0')};
  height: ${({ $review }) => ($review ? '50px' : '46px')};
  padding: ${({ $review }) => ($review ? '0' : '0 18px')};
  border-radius: 12px;
  border: 1px solid #333333;
  background: transparent;
  color: #b0b0b0;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    min-width: 0;
    height: 46px;
    flex: none;
    padding: 0 18px;
  }
`

const ReviewScroll = styled.div`
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  background: #1a1a1a;
  padding: 14px 16px;
  margin-top: 4px;

  @media (max-width: 767px) {
    max-height: 220px;
  }
`

const ReviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 24px;
  row-gap: 10px;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    column-gap: 0;
  }
`

const ReviewStepHeader = styled.div`
  margin-bottom: 14px;
`

const ReviewStepTitle = styled.h3`
  margin: 0;
  font-family: Orbitron, sans-serif;
  font-size: 24px;
  line-height: 30px;
  font-weight: 700;
  color: #f7f7f7;
`

const ReviewStepSubtitle = styled.p`
  margin: 6px 0 0;
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: #9a9a9a;
`

const ReviewRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-family: Inter, sans-serif;
  font-size: 13px;
  line-height: 18px;
  color: #9a9a9a;

  strong {
    color: #f2f2f2;
    font-weight: 700;
    text-align: right;
  }
`

const JsonBlock = styled.pre`
  margin: 8px 0 0;
  padding: 12px;
  border-radius: 10px;
  background: #141414;
  border: 1px solid #2a2a2a;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  line-height: 16px;
  color: #c8c8c8;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 140px;
  overflow-y: auto;
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-top: 20px;
  width: 100%;
  min-width: 0;
  padding-top: 4px;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin-top: 12px;
    padding-bottom: 96px;
  }
`

const FooterNote = styled.p`
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 13px;
  line-height: 18px;
  font-weight: 400;
  color: #8c8c8c;

  @media (max-width: 767px) {
    font-size: 12px;
    color: #888888;
  }
`

type TokenSelectorProps = {
  label: string
  value: string
  onChange: (v: string) => void
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ label, value, onChange }) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(
    () => TOKEN_OPTIONS.filter((t) => t.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  )

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <Field data-ps-create-field>
      <Label>{label}</Label>
      <SelectWrap ref={wrapRef}>
        <SelectBtn
          type="button"
          aria-label={label}
          data-ps-create-token-select
          onClick={() => setOpen((v) => !v)}
        >
          <TokenLogo>{value.slice(0, 1)}</TokenLogo>
          <span>{value || 'Select token'}</span>
        </SelectBtn>
        {open ? (
          <Dropdown data-ps-create-token-dropdown>
            <SearchInput
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-ps-create-token-search
              autoFocus
            />
            {filtered.map((token) => (
              <DropdownItem
                key={token}
                type="button"
                onClick={() => {
                  onChange(token)
                  setOpen(false)
                  setQuery('')
                }}
              >
                <TokenLogo>{token.slice(0, 1)}</TokenLogo>
                {token}
              </DropdownItem>
            ))}
          </Dropdown>
        ) : null}
      </SelectWrap>
    </Field>
  )
}

export const CreatePoolCta: React.FC = () => {
  const [expanded, setExpanded] = useState(false)
  const [step, setStep] = useState<WizardStep>(1)
  const [step3Page, setStep3Page] = useState<0 | 1>(0)
  const [showStep4Json, setShowStep4Json] = useState(false)
  const [animDir, setAnimDir] = useState<'next' | 'prev' | 'none'>('none')
  const [state, setState] = useState<CreatePoolWizardState>(createDefaultWizardState)

  const patch = useCallback((partial: Partial<CreatePoolWizardState>) => {
    setState((prev) => ({ ...prev, ...partial }))
  }, [])

  const goNext = () => {
    setAnimDir('next')
    if (step === 3 && step3Page === 0) {
      setStep3Page(1)
      return
    }
    setStep((s) => Math.min(5, s + 1) as WizardStep)
  }

  const goPrev = () => {
    setAnimDir('prev')
    if (step === 3 && step3Page === 1) {
      setStep3Page(0)
      return
    }
    if (step === 4) setStep3Page(1)
    setStep((s) => Math.max(1, s - 1) as WizardStep)
  }

  const estimatedApr = useMemo(() => computeEstimatedApr(state), [state])
  const healthScore = useMemo(() => computeHealthScore(state), [state])
  const machineJson = useMemo(() => buildMachinePreviewJson(state), [state])

  const machineStatus = state.rewardToken && state.stakeToken ? 'Ready' : 'Draft'

  const reviewRows = useMemo(
    () => [
      ['Reward Token', state.rewardToken],
      ['Stake Token', state.stakeToken],
      ['APR', estimatedApr],
      ['Budget', state.rewardBudget],
      ['Duration', `${state.emissionDuration} days`],
      ['Lock', `${state.lockType} · ${state.lockPeriod}`],
      ['Cooldown', state.cooldown],
      ['Auto Compound', state.autoCompound],
      ['Pool Type', state.poolType],
      ['Health Score', `${healthScore} / 100`],
      ['Machine Status', machineStatus],
    ],
    [state, estimatedApr, healthScore, machineStatus],
  )

  return (
    <Card
      id="create-pool"
      data-ps-create-pool-builder
      data-r709-create-pool
      data-r710-create-pool
      data-r711-create-pool
      data-r712-create-pool
      data-r722-create-pool-wizard
      data-r723-create-pool
      data-r723-create-pool-compact={!expanded || undefined}
      data-r723-create-pool-expanded={expanded || undefined}
      $expanded={expanded}
    >
      {!expanded ? (
        <div data-ps-create-pool-compact>
          <CompactTitle>Create Pool</CompactTitle>
          <CompactSubtitle>
            Launch a staking pool with guided reward, lock and emission setup.
          </CompactSubtitle>
          <CompactCtaRow>
            <CompactCreateBtn
              type="button"
              data-ps-create-pool-expand
              onClick={() => setExpanded(true)}
            >
              Create Pool
            </CompactCreateBtn>
            <CompactMicrocopy>Opens guided setup · ≈30 seconds</CompactMicrocopy>
          </CompactCtaRow>
        </div>
      ) : (
        <>
      <ExpandedHeaderRow>
        <Header style={{ marginBottom: 0, flex: 1, minWidth: 0 }}>
          <Title>Create Pool</Title>
          <Subtitle>Configure reward token, stake token, emission, lock and safety parameters.</Subtitle>
        </Header>
        <CloseBtn type="button" data-ps-create-pool-close onClick={() => setExpanded(false)}>
          Close
        </CloseBtn>
      </ExpandedHeaderRow>

      <ProgressWizard data-r722-wizard-progress>
        <ProgressTrack>
          {WIZARD_STEP_LABELS.map((label, i) => {
            const idx = (i + 1) as WizardStep
            const active = step === idx
            const completed = step > idx
            return (
              <React.Fragment key={label}>
                {i > 0 ? <Connector $filled={step > idx} data-ps-wizard-connector /> : null}
                <StepNode data-ps-wizard-step={idx} data-ps-wizard-step-active={active || undefined}>
                  <StepCircle $active={active} $completed={completed}>
                    {completed ? '✓' : idx}
                  </StepCircle>
                  <StepLabel $active={active} $completed={completed}>
                    {label}
                  </StepLabel>
                </StepNode>
              </React.Fragment>
            )
          })}
        </ProgressTrack>
      </ProgressWizard>

      <Body data-ps-create-pool-wizard-body>
        <StepColumn>
          <StepPanel
            key={`${step}-${step === 3 ? step3Page : 0}`}
            $dir={animDir}
            data-ps-wizard-step-panel={step}
          >
            {step === 1 ? (
              <>
                <FieldsGrid $cols={2} data-ps-create-pool-grid>
                  <TokenSelector
                    label="Reward Token"
                    value={state.rewardToken}
                    onChange={(rewardToken) => patch({ rewardToken })}
                  />
                  <TokenSelector
                    label="Stake Token"
                    value={state.stakeToken}
                    onChange={(stakeToken) => patch({ stakeToken })}
                  />
                </FieldsGrid>
                <StepActions data-ps-wizard-actions>
                  <GoldBtn type="button" data-ps-wizard-next onClick={goNext}>
                    Next →
                  </GoldBtn>
                  <GhostBtn type="button" data-ps-wizard-cancel onClick={() => setExpanded(false)}>
                    Cancel
                  </GhostBtn>
                </StepActions>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <FieldsGrid $cols={2} data-ps-create-pool-grid>
                  <Field data-ps-create-field>
                    <Label>Reward Budget</Label>
                    <InputBox
                      value={state.rewardBudget}
                      onChange={(e) => patch({ rewardBudget: e.target.value })}
                      aria-label="Reward Budget"
                    />
                  </Field>
                  <Field data-ps-create-field>
                    <Label>Emission Duration</Label>
                    <InputBox
                      value={state.emissionDuration}
                      onChange={(e) => patch({ emissionDuration: e.target.value })}
                      aria-label="Emission Duration"
                      $compact
                    />
                  </Field>
                  <Field data-ps-create-field>
                    <Label>Daily Rewards</Label>
                    <InputBox
                      value={state.dailyRewards}
                      onChange={(e) => patch({ dailyRewards: e.target.value })}
                      aria-label="Daily Rewards"
                    />
                  </Field>
                  <Field data-ps-create-field>
                    <Label>Estimated APR</Label>
                    <ReadOnlyValue aria-label="Estimated APR" data-ps-wizard-est-apr>
                      {estimatedApr}
                    </ReadOnlyValue>
                  </Field>
                </FieldsGrid>
                <StepActions>
                  <GoldBtn type="button" data-ps-wizard-next onClick={goNext}>
                    Next →
                  </GoldBtn>
                  <GhostBtn type="button" data-ps-wizard-back onClick={goPrev}>
                    ← Back
                  </GhostBtn>
                </StepActions>
              </>
            ) : null}

            {step === 3 && step3Page === 0 ? (
              <>
                <FieldsGrid $cols={2} data-ps-create-pool-grid>
                  <Field data-ps-create-field>
                    <Label>Lock Type</Label>
                    <InputBox
                      value={state.lockType}
                      onChange={(e) => patch({ lockType: e.target.value })}
                      aria-label="Lock Type"
                      $compact
                    />
                  </Field>
                  <Field data-ps-create-field>
                    <Label>Lock Period</Label>
                    <InputBox
                      value={state.lockPeriod}
                      onChange={(e) => patch({ lockPeriod: e.target.value })}
                      aria-label="Lock Period"
                      $compact
                    />
                  </Field>
                  <Field data-ps-create-field>
                    <Label>Cooldown</Label>
                    <InputBox
                      value={state.cooldown}
                      onChange={(e) => patch({ cooldown: e.target.value })}
                      aria-label="Cooldown"
                      $compact
                    />
                  </Field>
                  <Field data-ps-create-field>
                    <Label>Withdrawal Fee</Label>
                    <InputBox
                      value={state.withdrawalFee}
                      onChange={(e) => patch({ withdrawalFee: e.target.value })}
                      aria-label="Withdrawal Fee"
                    />
                  </Field>
                </FieldsGrid>
                <StepActions>
                  <GoldBtn type="button" data-ps-wizard-next onClick={goNext}>
                    Next →
                  </GoldBtn>
                  <GhostBtn type="button" data-ps-wizard-back onClick={goPrev}>
                    ← Back
                  </GhostBtn>
                </StepActions>
              </>
            ) : null}

            {step === 3 && step3Page === 1 ? (
              <>
                <FieldsGrid $cols={2} data-ps-create-pool-grid>
                  <Field data-ps-create-field>
                    <Label>Deposit Fee</Label>
                    <InputBox
                      value={state.depositFee}
                      onChange={(e) => patch({ depositFee: e.target.value })}
                      aria-label="Deposit Fee"
                    />
                  </Field>
                  <Field data-ps-create-field>
                    <Label>Auto Compound</Label>
                    <InputBox
                      value={state.autoCompound}
                      onChange={(e) => patch({ autoCompound: e.target.value })}
                      aria-label="Auto Compound"
                    />
                  </Field>
                </FieldsGrid>
                <StepActions>
                  <GoldBtn type="button" data-ps-wizard-next onClick={goNext}>
                    Next →
                  </GoldBtn>
                  <GhostBtn type="button" data-ps-wizard-back onClick={goPrev}>
                    ← Back
                  </GhostBtn>
                </StepActions>
              </>
            ) : null}

            {step === 4 ? (
              <>
                <FieldsGrid $cols={2} data-ps-create-pool-grid>
                  <Field data-ps-create-field>
                    <Label>Pool Type</Label>
                    <InputBox
                      value={state.poolType}
                      onChange={(e) => patch({ poolType: e.target.value })}
                      aria-label="Pool Type"
                      $compact
                    />
                  </Field>
                  <Field data-ps-create-field>
                    <Label>Minimum Stake</Label>
                    <InputBox
                      value={state.minStake}
                      onChange={(e) => patch({ minStake: e.target.value })}
                      aria-label="Minimum Stake"
                    />
                  </Field>
                  <Field data-ps-create-field>
                    <Label>Maximum Stake</Label>
                    <InputBox
                      value={state.maxStake}
                      onChange={(e) => patch({ maxStake: e.target.value })}
                      aria-label="Maximum Stake"
                    />
                  </Field>
                  <Field data-ps-create-field>
                    <Label>Visibility</Label>
                    <InputBox
                      value={state.visibility}
                      onChange={(e) => patch({ visibility: e.target.value })}
                      aria-label="Visibility"
                      $compact
                    />
                  </Field>
                </FieldsGrid>
                <Field
                  data-ps-create-machine-preview-field
                  style={{ marginTop: 18, height: 'auto', minHeight: 42, maxWidth: 'calc(50% - 9px)' }}
                >
                  <Label>Machine Preview</Label>
                  <PreviewBtn
                    type="button"
                    data-ps-create-machine-preview
                    onClick={() => setShowStep4Json((v) => !v)}
                  >
                    {showStep4Json ? 'Hide JSON' : 'View JSON'}
                  </PreviewBtn>
                  {showStep4Json ? <JsonBlock style={{ maxHeight: 96, marginTop: 8 }}>{machineJson}</JsonBlock> : null}
                </Field>
                <StepActions>
                  <GoldBtn type="button" data-ps-wizard-next onClick={goNext}>
                    Next →
                  </GoldBtn>
                  <GhostBtn type="button" data-ps-wizard-back onClick={goPrev}>
                    ← Back
                  </GhostBtn>
                </StepActions>
              </>
            ) : null}

            {step === 5 ? (
              <>
                <ReviewStepHeader data-ps-wizard-pool-ready>
                  <ReviewStepTitle>Pool Ready</ReviewStepTitle>
                  <ReviewStepSubtitle>Review configuration before creating the pool.</ReviewStepSubtitle>
                </ReviewStepHeader>
                <ReviewScroll data-ps-wizard-review>
                  <ReviewGrid>
                    {reviewRows.map(([k, v]) => (
                      <ReviewRow key={k}>
                        <span>{k}</span>
                        <strong>{v}</strong>
                      </ReviewRow>
                    ))}
                  </ReviewGrid>
                </ReviewScroll>
                <StepActions data-ps-create-pool-footer>
                  <GoldBtn
                    as={Link}
                    to="/build-studio?intent=staking-pool#create-pool"
                    $wide
                    data-ps-create-pool-btn
                  >
                    Create Pool
                  </GoldBtn>
                  <GhostBtn type="button" $review data-ps-wizard-back onClick={goPrev}>
                    ← Back
                  </GhostBtn>
                </StepActions>
              </>
            ) : null}
          </StepPanel>
        </StepColumn>

        <PreviewColumn>
          <CreatePoolWizardPreview state={state} />
        </PreviewColumn>
      </Body>

      <Footer>
        <FooterNote data-ps-wizard-footer-progress>
          Progress · Step {step} / 5
        </FooterNote>
        <FooterNote data-ps-wizard-footer-eta>Estimated completion time · ≈30 seconds</FooterNote>
      </Footer>
        </>
      )}
    </Card>
  )
}

export default CreatePoolCta
