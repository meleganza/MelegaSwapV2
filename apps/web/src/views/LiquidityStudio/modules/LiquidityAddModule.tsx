/**
 * LIQUIDITY_MODULE_004_ADD_LIQUIDITY — premium UI over existing mint runtime.
 * No second AMM math / slippage model / router path.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Currency } from '@pancakeswap/sdk'
import { useModal } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import ConnectWalletButton from 'components/ConnectWalletButton'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import SettingsModal from 'components/Menu/GlobalSettings/SettingsModal'
import { SettingsMode } from 'components/Menu/GlobalSettings/types'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { humanizeAddError, mapApprovalState, resolveLiquidityAddCta } from './liquidityAddCta'
import { LIQUIDITY_ADD_COPY, liquidityAdd } from './liquidityAddTokens'
import { MELEGA_CHAIN_ID } from 'lib/bsc-indexer/constants'

const Shell = styled.section<{ $embedded?: boolean }>`
  width: 100%;
  max-width: ${({ $embedded }) => ($embedded ? '100%' : liquidityAdd.contentMax)};
  margin: ${({ $embedded }) => ($embedded ? '0' : `${liquidityAdd.gapAfterDiscovery} auto 0`)};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: ${liquidityAdd.tabletBreak}) {
    padding: ${({ $embedded }) => ($embedded ? '0' : '0 16px')};
  }
`

const Layout = styled.div<{ $embedded?: boolean }>`
  width: 100%;
  display: grid;
  grid-template-columns: ${({ $embedded }) =>
    $embedded ? '1fr' : `minmax(0, ${liquidityAdd.mainW}) minmax(0, ${liquidityAdd.sideW})`};
  column-gap: ${liquidityAdd.columnGap};
  row-gap: ${({ $embedded }) => ($embedded ? '12px' : '16px')};
  align-items: start;
  min-width: 0;

  @media (max-width: ${liquidityAdd.tabletBreak}) {
    grid-template-columns: 1fr;
  }
`

const Panel = styled.div<{ $embedded?: boolean }>`
  width: 100%;
  box-sizing: border-box;
  border-radius: ${liquidityAdd.cardRadius};
  border: ${({ $embedded }) => ($embedded ? '1px solid rgba(255,255,255,0.06)' : liquidityAdd.cardBorder)};
  background: ${({ $embedded }) => ($embedded ? 'rgba(8,8,8,0.55)' : liquidityAdd.cardBg)};
  padding: ${({ $embedded }) => ($embedded ? '14px' : liquidityAdd.cardPad)};
  min-width: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  line-height: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${liquidityAdd.text};
`

const Desc = styled.p`
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 20px;
  color: ${liquidityAdd.muted};
`

const PairRow = styled.div`
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`

const Logos = styled.div`
  display: flex;
  align-items: center;
  > *:last-child {
    margin-left: -8px;
  }
`

const PairName = styled.div`
  font-size: 18px;
  font-weight: 750;
  color: ${liquidityAdd.text};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const TokenBox = styled.div`
  margin-top: 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(8, 8, 8, 0.9);
  padding: 12px 14px;
  min-width: 0;
`

const TokenHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const TokenLabel = styled.div`
  font-size: 12px;
  font-weight: 650;
  color: ${liquidityAdd.dim};
`

const TokenSelect = styled.button`
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #111;
  color: ${liquidityAdd.text};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
`

const AmountInput = styled.input`
  margin-top: 8px;
  width: 100%;
  border: none;
  background: transparent;
  color: ${liquidityAdd.text};
  font-size: 28px;
  font-weight: 650;
  line-height: 34px;
  outline: none;
  padding: 0;

  &::placeholder {
    color: ${liquidityAdd.dim};
  }
`

const BalanceRow = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const Balance = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${liquidityAdd.muted};
`

const MaxBtn = styled.button`
  appearance: none;
  height: 22px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid rgba(244, 196, 48, 0.45);
  background: rgba(244, 196, 48, 0.1);
  color: ${liquidityAdd.gold};
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const Metrics = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: ${liquidityAdd.mobileBreak}) {
    grid-template-columns: 1fr;
  }
`

const Metric = styled.div`
  min-width: 0;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  padding: 10px 12px;
`

const MetricLabel = styled.div`
  font-size: 11px;
  font-weight: 650;
  color: ${liquidityAdd.dim};
`

const MetricValue = styled.div`
  margin-top: 4px;
  font-size: 13px;
  font-weight: 700;
  color: ${liquidityAdd.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SlippageRow = styled.div`
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const SlippageBtn = styled.button`
  appearance: none;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: ${liquidityAdd.gold};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`

const PreviewList = styled.dl`
  margin: 16px 0 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const PreviewRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
`

const PreviewDt = styled.dt`
  margin: 0;
  font-size: 12px;
  color: ${liquidityAdd.dim};
`

const PreviewDd = styled.dd`
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: ${liquidityAdd.text};
  text-align: right;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ErrorBanner = styled.div`
  margin-top: 14px;
  border-radius: 10px;
  border: 1px solid rgba(248, 113, 113, 0.35);
  background: rgba(248, 113, 113, 0.08);
  color: ${liquidityAdd.danger};
  font-size: 13px;
  font-weight: 650;
  padding: 10px 12px;
`

const InfoBanner = styled.div`
  margin-top: 14px;
  border-radius: 10px;
  border: 1px solid rgba(244, 196, 48, 0.3);
  background: rgba(244, 196, 48, 0.08);
  color: ${liquidityAdd.gold};
  font-size: 13px;
  font-weight: 650;
  padding: 10px 12px;
`

const Primary = styled.button`
  appearance: none;
  width: 100%;
  margin-top: 16px;
  height: ${liquidityAdd.ctaH};
  border: 0;
  border-radius: ${liquidityAdd.ctaRadius};
  background: ${liquidityAdd.gold};
  color: #111;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: ${liquidityAdd.goldHover};
  }

  &:focus-visible {
    outline: ${liquidityAdd.focusRing};
    outline-offset: ${liquidityAdd.focusOffset};
  }
`

const ConnectWrap = styled.div`
  margin-top: 16px;
  width: 100%;
  height: ${liquidityAdd.ctaH};

  button {
    width: 100% !important;
    height: ${liquidityAdd.ctaH} !important;
    min-height: ${liquidityAdd.ctaH} !important;
    border-radius: ${liquidityAdd.ctaRadius} !important;
  }
`

const Security = styled.p`
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 16px;
  color: ${liquidityAdd.dim};
`

const Skeleton = styled.div`
  width: 100%;
  min-height: 320px;
  border-radius: ${liquidityAdd.cardRadius};
  border: ${liquidityAdd.cardBorder};
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.06) 50%,
    rgba(255, 255, 255, 0.03) 100%
  );
`

function dash(v?: string | null): string {
  if (!v) return LIQUIDITY_ADD_COPY.emptyMetric
  const t = v.trim()
  if (!t || t === '—' || /^0+(\.0+)?%?$/.test(t)) return LIQUIDITY_ADD_COPY.emptyMetric
  return v
}

function queryTokenId(raw: unknown): string | undefined {
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0].trim()
  return undefined
}

const LiquidityAddForm: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const router = useRouter()
  const { chainId } = useActiveChainId()
  const {
    setMode,
    pairLabel,
    currencyA,
    currencyB,
    setCurrencyA,
    setCurrencyB,
    onFieldAInput,
    onFieldBInput,
    typedValueA,
    typedValueB,
    preview,
    onPrimaryAction,
    account,
    approvalA,
    approvalB,
    error,
    phase,
    slippageLabel,
    loadingLabel,
  } = useLiquidityRuntime()

  const [seeded, setSeeded] = useState(false)
  const [completedFlash, setCompletedFlash] = useState(false)

  useEffect(() => {
    setMode('Add Liquidity')
  }, [setMode])

  const token0Q = queryTokenId(router.query.token0)
  const token1Q = queryTokenId(router.query.token1)
  const seedA = useCurrency(token0Q)
  const seedB = useCurrency(token1Q)

  useEffect(() => {
    if (seeded) return
    if (seedA && seedB) {
      setCurrencyA(seedA)
      setCurrencyB(seedB)
      setSeeded(true)
    }
  }, [seedA, seedB, seeded, setCurrencyA, setCurrencyB])

  const balances = useCurrencyBalances(account ?? undefined, [currencyA ?? undefined, currencyB ?? undefined])
  const balA = balances[0]
  const balB = balances[1]
  const maxA = maxAmountSpend(balA)
  const maxB = maxAmountSpend(balB)

  const [onPresentSelectA] = useModal(
    <CurrencySearchModal
      onCurrencySelect={(c: Currency) => setCurrencyA(c)}
      selectedCurrency={currencyA}
      otherSelectedCurrency={currencyB}
      showCommonBases
    />,
    true,
    true,
    'liquidity-module-004-select-a',
  )

  const [onPresentSelectB] = useModal(
    <CurrencySearchModal
      onCurrencySelect={(c: Currency) => setCurrencyB(c)}
      selectedCurrency={currencyB}
      otherSelectedCurrency={currencyA}
      showCommonBases
    />,
    true,
    true,
    'liquidity-module-004-select-b',
  )

  const [onPresentSettings] = useModal(<SettingsModal mode={SettingsMode.SWAP_LIQUIDITY} />, true, true, 'liquidity-module-004-settings')

  const wrongChain = Boolean(account && chainId != null && chainId !== MELEGA_CHAIN_ID)

  const cta = useMemo(
    () =>
      resolveLiquidityAddCta({
        account,
        approvalA: mapApprovalState(approvalA),
        approvalB: mapApprovalState(approvalB),
        errorCode: error?.code,
        wrongChain,
        completed: completedFlash,
      }),
    [account, approvalA, approvalB, error?.code, wrongChain, completedFlash],
  )

  const errorLabel = humanizeAddError(error?.code, error?.message)

  const ratioLabel = useMemo(() => {
    if (!currencyA?.symbol || !currencyB?.symbol) return LIQUIDITY_ADD_COPY.emptyMetric
    if (preview.tokenAPct > 0 || preview.tokenBPct > 0) {
      return `${preview.tokenAPct}% ${currencyA.symbol} · ${preview.tokenBPct}% ${currencyB.symbol}`
    }
    return LIQUIDITY_ADD_COPY.emptyMetric
  }, [currencyA?.symbol, currencyB?.symbol, preview.tokenAPct, preview.tokenBPct])

  const depositedLabel = useMemo(() => {
    const a = typedValueA && typedValueA !== '0.0' ? `${typedValueA} ${currencyA?.symbol ?? ''}`.trim() : null
    const b = typedValueB && typedValueB !== '0.0' ? `${typedValueB} ${currencyB?.symbol ?? ''}`.trim() : null
    if (!a && !b) return LIQUIDITY_ADD_COPY.emptyMetric
    return [a, b].filter(Boolean).join(' + ')
  }, [typedValueA, typedValueB, currencyA?.symbol, currencyB?.symbol])

  const handlePrimary = useCallback(() => {
    if (cta.state === 'connect' || cta.disabled) return
    onPrimaryAction()
    if (cta.state === 'add') {
      // Modal confirm owns completion; flash only if approvals already done.
      setCompletedFlash(false)
    }
  }, [cta.state, cta.disabled, onPrimaryAction])

  useEffect(() => {
    if (approvalA === ApprovalState.PENDING || approvalB === ApprovalState.PENDING) {
      setCompletedFlash(false)
    }
  }, [approvalA, approvalB])

  const loading = phase === 'calculating' && !currencyA && !currencyB

  if (loading) {
    return <Skeleton data-testid="liquidity-add-skeleton" aria-label={LIQUIDITY_ADD_COPY.skeletonLabel} />
  }

  return (
    <Layout
      $embedded={embedded}
      data-testid="liquidity-add-layout"
      data-liquidity-add-geometry={embedded ? 'embedded-stack' : '900-24-424'}
      data-liquidity-add-embedded={embedded ? '1' : '0'}
    >
      <Panel $embedded={embedded} data-testid="liquidity-add-form-panel">
        {!embedded ? (
          <>
            <Title>{LIQUIDITY_ADD_COPY.title}</Title>
            <Desc>{LIQUIDITY_ADD_COPY.description}</Desc>
          </>
        ) : null}

        <PairRow data-testid="liquidity-add-pair">
          <Logos aria-hidden="true">
            <MelegaTokenAvatar
              symbol={currencyA?.symbol}
              name={currencyA?.name}
              address={currencyA?.isToken ? currencyA.address : undefined}
              chainId={liquidityAdd.chainId}
              size={32}
              radius="circle"
            />
            <MelegaTokenAvatar
              symbol={currencyB?.symbol}
              name={currencyB?.name}
              address={currencyB?.isToken ? currencyB.address : undefined}
              chainId={liquidityAdd.chainId}
              size={32}
              radius="circle"
            />
          </Logos>
          <PairName>{pairLabel || 'Select pair'}</PairName>
        </PairRow>

        <TokenBox data-testid="liquidity-add-token-a">
          <TokenHead>
            <TokenLabel>{LIQUIDITY_ADD_COPY.tokenA}</TokenLabel>
            <TokenSelect type="button" onClick={onPresentSelectA} data-testid="liquidity-add-token-a-select">
              <MelegaTokenAvatar
                symbol={currencyA?.symbol}
                name={currencyA?.name}
                address={currencyA?.isToken ? currencyA.address : undefined}
                chainId={liquidityAdd.chainId}
                size={20}
                radius="circle"
              />
              {currencyA?.symbol ?? 'Select'}
            </TokenSelect>
          </TokenHead>
          <AmountInput
            value={typedValueA === '0.0' ? '' : typedValueA}
            onChange={(e) => onFieldAInput(e.target.value)}
            placeholder="0.0"
            inputMode="decimal"
            aria-label={LIQUIDITY_ADD_COPY.amount}
            data-testid="liquidity-add-amount-a"
          />
          <BalanceRow>
            <Balance>
              {LIQUIDITY_ADD_COPY.balance} {balA ? balA.toSignificant(6) : '—'}
            </Balance>
            <MaxBtn
              type="button"
              disabled={!maxA}
              onClick={() => maxA && onFieldAInput(maxA.toExact())}
              data-testid="liquidity-add-max-a"
            >
              MAX
            </MaxBtn>
          </BalanceRow>
        </TokenBox>

        <TokenBox data-testid="liquidity-add-token-b">
          <TokenHead>
            <TokenLabel>{LIQUIDITY_ADD_COPY.tokenB}</TokenLabel>
            <TokenSelect type="button" onClick={onPresentSelectB} data-testid="liquidity-add-token-b-select">
              <MelegaTokenAvatar
                symbol={currencyB?.symbol}
                name={currencyB?.name}
                address={currencyB?.isToken ? currencyB.address : undefined}
                chainId={liquidityAdd.chainId}
                size={20}
                radius="circle"
              />
              {currencyB?.symbol ?? 'Select'}
            </TokenSelect>
          </TokenHead>
          <AmountInput
            value={typedValueB === '0.0' ? '' : typedValueB}
            onChange={(e) => onFieldBInput(e.target.value)}
            placeholder="0.0"
            inputMode="decimal"
            aria-label={LIQUIDITY_ADD_COPY.amount}
            data-testid="liquidity-add-amount-b"
          />
          <BalanceRow>
            <Balance>
              {LIQUIDITY_ADD_COPY.balance} {balB ? balB.toSignificant(6) : '—'}
            </Balance>
            <MaxBtn
              type="button"
              disabled={!maxB}
              onClick={() => maxB && onFieldBInput(maxB.toExact())}
              data-testid="liquidity-add-max-b"
            >
              MAX
            </MaxBtn>
          </BalanceRow>
        </TokenBox>

        <Metrics data-testid="liquidity-add-metrics">
          <Metric>
            <MetricLabel>{LIQUIDITY_ADD_COPY.poolRatio}</MetricLabel>
            <MetricValue title={ratioLabel}>{ratioLabel}</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>{LIQUIDITY_ADD_COPY.estimatedLp}</MetricLabel>
            <MetricValue>{dash(preview.expectedLp)}</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>{LIQUIDITY_ADD_COPY.poolShare}</MetricLabel>
            <MetricValue>{dash(preview.poolShare)}</MetricValue>
          </Metric>
        </Metrics>

        <SlippageRow>
          <MetricLabel>
            {LIQUIDITY_ADD_COPY.slippage}: {slippageLabel}
          </MetricLabel>
          <SlippageBtn type="button" onClick={onPresentSettings} data-testid="liquidity-add-slippage">
            Edit
          </SlippageBtn>
        </SlippageRow>

        {errorLabel ? <ErrorBanner data-testid="liquidity-add-error">{errorLabel}</ErrorBanner> : null}
        {loadingLabel && !errorLabel ? (
          <InfoBanner data-testid="liquidity-add-loading">{loadingLabel}</InfoBanner>
        ) : null}

        {!account ? (
          <ConnectWrap data-testid="liquidity-add-connect">
            <ConnectWalletButton>{cta.label}</ConnectWalletButton>
          </ConnectWrap>
        ) : (
          <Primary
            type="button"
            onClick={handlePrimary}
            disabled={cta.disabled}
            data-testid="liquidity-add-cta"
            data-cta-state={cta.state}
          >
            {cta.label}
          </Primary>
        )}
        <Security>{LIQUIDITY_ADD_COPY.securityNote}</Security>
      </Panel>

      <Panel $embedded={embedded} data-testid="liquidity-add-preview-panel">
        <Title as="h3" style={{ fontSize: embedded ? 16 : 20, lineHeight: embedded ? '22px' : '26px' }}>
          {LIQUIDITY_ADD_COPY.previewTitle}
        </Title>
        <PreviewList>
          <PreviewRow>
            <PreviewDt>{LIQUIDITY_ADD_COPY.previewPair}</PreviewDt>
            <PreviewDd>{pairLabel || LIQUIDITY_ADD_COPY.emptyMetric}</PreviewDd>
          </PreviewRow>
          <PreviewRow>
            <PreviewDt>{LIQUIDITY_ADD_COPY.previewDeposited}</PreviewDt>
            <PreviewDd title={depositedLabel}>{depositedLabel}</PreviewDd>
          </PreviewRow>
          <PreviewRow>
            <PreviewDt>{LIQUIDITY_ADD_COPY.previewLp}</PreviewDt>
            <PreviewDd>{dash(preview.expectedLp)}</PreviewDd>
          </PreviewRow>
          <PreviewRow>
            <PreviewDt>{LIQUIDITY_ADD_COPY.previewShare}</PreviewDt>
            <PreviewDd>{dash(preview.poolShare)}</PreviewDd>
          </PreviewRow>
          <PreviewRow>
            <PreviewDt>{LIQUIDITY_ADD_COPY.previewFee}</PreviewDt>
            <PreviewDd>{dash(preview.feeTier)}</PreviewDd>
          </PreviewRow>
        </PreviewList>
      </Panel>
    </Layout>
  )
}

/**
 * Provider is hoisted on `/liquidity` so Module 004 + 006 share one mint/positions runtime.
 * `embedded` mounts the form inside the IA primary workspace without a second page section.
 */
export const LiquidityAddModule: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => (
  <Shell
    $embedded={embedded}
    id={liquidityAdd.anchorId}
    data-testid="liquidity-add-module"
    data-liquidity-module="004-add-liquidity"
    data-liquidity-module-004="mounted"
    aria-labelledby="liquidity-add-title"
  >
    <span id="liquidity-add-title" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
      {LIQUIDITY_ADD_COPY.title}
    </span>
    <LiquidityAddForm embedded={embedded} />
  </Shell>
)

export default LiquidityAddModule
