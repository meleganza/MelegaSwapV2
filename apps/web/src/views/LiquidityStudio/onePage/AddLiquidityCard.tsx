import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Currency } from '@pancakeswap/sdk'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useCurrency } from 'hooks/Tokens'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { liqOne } from './onePageTokens'

/** BSC common bases for in-card pair/token pick (no modal / no drawer). */
const MARCO_ADDR = '0x963556de11697ddaae61460e815fcbcd84614778'
const USDT_ADDR = '0x55d398326f99059fF775485246999027B3197955'
const WBNB_ADDR = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'

const PAIR_PRESETS: Array<{ a: string; b: string }> = [
  { a: 'BNB', b: MARCO_ADDR },
  { a: MARCO_ADDR, b: USDT_ADDR },
  { a: 'BNB', b: USDT_ADDR },
  { a: WBNB_ADDR, b: MARCO_ADDR },
]

const TOKEN_CYCLE = ['BNB', MARCO_ADDR, USDT_ADDR, WBNB_ADDR] as const

const Card = styled.section`
  width: ${liqOne.col};
  max-width: 100%;
  height: ${liqOne.addH};
  min-height: ${liqOne.addH};
  max-height: ${liqOne.addH};
  box-sizing: border-box;
  padding: 0;
  border-radius: ${liqOne.cardRadius};
  border: 1px solid ${liqOne.border};
  background: ${liqOne.card};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: ${liqOne.font};

  @media (max-width: 1375px) {
    width: 100%;
    height: auto;
    min-height: 0;
    max-height: none;
    overflow: visible;
  }
`

const Header = styled.div`
  flex: 0 0 ${liqOne.addHeaderH};
  height: ${liqOne.addHeaderH};
  min-height: ${liqOne.addHeaderH};
  max-height: ${liqOne.addHeaderH};
  position: relative;
  padding: 14px ${liqOne.addPadX} 0;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 1375px) {
    flex: 0 0 auto;
    height: auto;
    min-height: 0;
    max-height: none;
    overflow: visible;
    padding-bottom: 8px;
  }
`

const Eyebrow = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${liqOne.gold};
`

const Title = styled.h2`
  margin: 4px 0 0;
  font-size: 22px;
  line-height: 28px;
  font-weight: 750;
  color: ${liqOne.text};
  max-width: calc(100% - 168px);
`

const Desc = styled.p`
  margin: 4px 0 0;
  max-width: calc(100% - 168px);
  font-size: 12px;
  line-height: 16px;
  color: ${liqOne.bodySoft};
`

/** Approved dark droplet / liquidity discs — do not replace with a new illustration. */
const Artwork = styled.div`
  pointer-events: none;
  position: absolute;
  right: 12px;
  top: 0;
  width: 160px;
  height: 110px;
`

const Disc = styled.div<{ $x: string; $y: string; $s?: string }>`
  position: absolute;
  left: ${({ $x }) => $x};
  top: ${({ $y }) => $y};
  width: ${({ $s }) => $s ?? '44px'};
  height: ${({ $s }) => $s ?? '44px'};
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #2c2c2c, #121212);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 -6px 12px rgba(0, 0, 0, 0.45);
`

const Plus = styled.div`
  position: absolute;
  left: 54%;
  top: 30%;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${liqOne.gold};
  color: #111;
  font-size: 15px;
  font-weight: 800;
  display: grid;
  place-items: center;
  line-height: 1;
`

const PairSection = styled.div`
  flex: 0 0 ${liqOne.addPairH};
  height: ${liqOne.addPairH};
  min-height: ${liqOne.addPairH};
  max-height: ${liqOne.addPairH};
  padding: 0 ${liqOne.addPadX};
  box-sizing: border-box;
  display: flex;
  align-items: center;
  overflow: hidden;

  @media (max-width: 1375px) {
    flex: 0 0 auto;
    height: auto;
    min-height: 0;
    max-height: none;
    padding: 8px ${liqOne.addPadX};
  }
`

const PairSelect = styled.button`
  appearance: none;
  width: 100%;
  height: 48px;
  min-height: 48px;
  max-height: 48px;
  border-radius: ${liqOne.controlRadius};
  border: 1px solid ${liqOne.borderStrong};
  background: ${liqOne.elevated};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  cursor: pointer;
  box-sizing: border-box;
  font-family: ${liqOne.font};
`

const PairText = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${liqOne.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 90%;
`

const Chevron = styled.span`
  color: ${liqOne.muted};
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;
`

const FormSection = styled.div`
  flex: 0 0 ${liqOne.addFormH};
  height: ${liqOne.addFormH};
  min-height: ${liqOne.addFormH};
  max-height: ${liqOne.addFormH};
  padding: 17px ${liqOne.addPadX};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;

  @media (max-width: 1375px) {
    flex: 0 0 auto;
    height: auto;
    min-height: 0;
    max-height: none;
    overflow: visible;
    padding: 12px ${liqOne.addPadX};
  }
`

const TokenBox = styled.div`
  position: relative;
  width: 100%;
  height: 72px;
  min-height: 72px;
  max-height: 72px;
  border-radius: ${liqOne.controlRadius};
  border: 1px solid ${liqOne.borderStrong};
  background: ${liqOne.elevated};
  padding: 8px 12px;
  box-sizing: border-box;
  overflow: hidden;
`

const TokenAmount = styled.input`
  display: block;
  width: calc(100% - 110px);
  height: 40px;
  border: none;
  background: transparent;
  font-size: 40px;
  font-weight: 650;
  line-height: 40px;
  color: ${liqOne.text};
  outline: none;
  padding: 0;
  font-family: ${liqOne.font};

  &::placeholder {
    color: ${liqOne.muted};
  }
`

const TokenSelect = styled.button`
  appearance: none;
  position: absolute;
  right: 10px;
  top: 8px;
  height: 44px;
  min-width: 88px;
  padding: 0 12px;
  border-radius: ${liqOne.controlRadius};
  border: 1px solid ${liqOne.borderStrong};
  background: #0f0f0f;
  color: ${liqOne.text};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: ${liqOne.font};
`

const BalanceRow = styled.div`
  position: absolute;
  left: 12px;
  right: 10px;
  bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 20px;
`

const Balance = styled.span`
  font-size: 12px;
  line-height: 12px;
  color: ${liqOne.muted};
  font-weight: 600;
`

const MaxBtn = styled.button`
  appearance: none;
  width: 28px;
  height: 20px;
  padding: 0;
  border-radius: 4px;
  border: 1px solid ${liqOne.goldBorder};
  background: rgba(221, 185, 47, 0.12);
  color: ${liqOne.gold};
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  font-family: ${liqOne.font};
  line-height: 1;
`

const SwapMid = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  flex: 0 0 40px;
`

const SwapBtn = styled.button`
  appearance: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(221, 185, 47, 0.35);
  background: #121212;
  color: ${liqOne.gold};
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const Summary = styled.div`
  flex: 0 0 ${liqOne.addSummaryH};
  height: ${liqOne.addSummaryH};
  min-height: ${liqOne.addSummaryH};
  max-height: ${liqOne.addSummaryH};
  padding: 0 ${liqOne.addPadX};
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  border-top: 1px solid ${liqOne.borderDefault};
  border-bottom: 1px solid ${liqOne.borderDefault};

  @media (max-width: 1375px) {
    flex: 0 0 auto;
    height: auto;
    min-height: 44px;
    max-height: none;
    padding: 8px ${liqOne.addPadX};
  }
`

const Metric = styled.div`
  min-width: 0;
  overflow: hidden;
`

const MetricLabel = styled.div`
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${liqOne.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MetricValue = styled.div`
  margin-top: 2px;
  font-size: 13px;
  font-weight: 700;
  color: ${liqOne.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Footer = styled.div`
  flex: 0 0 ${liqOne.addFooterH};
  height: ${liqOne.addFooterH};
  min-height: ${liqOne.addFooterH};
  max-height: ${liqOne.addFooterH};
  padding: 0 ${liqOne.addPadX};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;

  @media (max-width: 1375px) {
    flex: 0 0 auto;
    height: auto;
    min-height: 0;
    max-height: none;
    overflow: visible;
    padding: 10px ${liqOne.addPadX} 12px;
  }
`

const Primary = styled.button`
  appearance: none;
  width: 100%;
  height: 44px;
  min-height: 44px;
  max-height: 44px;
  border: 0;
  border-radius: ${liqOne.controlRadius};
  background: ${liqOne.gold};
  color: #111;
  font-size: 14px;
  font-weight: 800;
  font-family: ${liqOne.font};
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: ${liqOne.goldHover};
  }
`

const ConnectWrap = styled.div`
  width: 100%;
  height: 44px;

  button {
    width: 100% !important;
    height: 44px !important;
    min-height: 44px !important;
    max-height: 44px !important;
    border-radius: ${liqOne.controlRadius} !important;
  }
`

const PositionsAnchor = styled.button`
  appearance: none;
  display: block;
  width: 100%;
  height: 8px;
  margin-top: 8px;
  padding: 0;
  background: transparent;
  border: none;
  color: ${liqOne.gold};
  font-size: 11px;
  font-weight: 650;
  line-height: 8px;
  cursor: pointer;
  text-align: center;
  font-family: ${liqOne.font};
  overflow: hidden;
`

function dash(v?: string | null): string {
  if (!v) return '—'
  const t = v.trim()
  if (!t || t === '—' || /^0+(\.0+)?%?$/.test(t)) return '—'
  return v
}

function currencyKey(c?: Currency | null): string {
  if (!c) return ''
  if (c.isNative || c.symbol === 'BNB') return 'BNB'
  return c.wrapped?.address?.toLowerCase() ?? ''
}

function nextTokenId(current?: Currency | null, other?: Currency | null): string {
  const cur = currencyKey(current)
  const otherId = currencyKey(other)
  const idx = TOKEN_CYCLE.findIndex((id) => id.toLowerCase() === cur.toLowerCase())
  for (let i = 1; i <= TOKEN_CYCLE.length; i += 1) {
    const cand = TOKEN_CYCLE[(Math.max(idx, 0) + i) % TOKEN_CYCLE.length]
    if (cand.toLowerCase() !== otherId.toLowerCase()) return cand
  }
  return TOKEN_CYCLE[0]
}

type Props = {
  onViewPositions: () => void
}

export const AddLiquidityCard = React.forwardRef<HTMLElement, Props>(function AddLiquidityCard(
  { onViewPositions },
  ref,
) {
  const {
    pairLabel,
    currencyA,
    currencyB,
    setCurrencyA,
    setCurrencyB,
    onFieldAInput,
    onFieldBInput,
    onSwapTokens,
    typedValueA,
    typedValueB,
    preview,
    primaryCtaLabel,
    onPrimaryAction,
    account,
    loadingLabel,
    error,
    noLiquidity,
    phase,
  } = useLiquidityRuntime()

  const [pairIdx, setPairIdx] = useState(0)
  const marco = useCurrency(MARCO_ADDR)
  const usdt = useCurrency(USDT_ADDR)
  const wbnb = useCurrency(WBNB_ADDR)
  const bnb = useCurrency('BNB')

  const balances = useCurrencyBalances(account ?? undefined, [currencyA ?? undefined, currencyB ?? undefined])
  const balA = balances[0]
  const balB = balances[1]
  const maxA = maxAmountSpend(balA)
  const maxB = maxAmountSpend(balB)

  const resolveId = useCallback(
    (id: string): Currency | undefined => {
      const key = id.toLowerCase()
      if (key === 'bnb') return bnb ?? undefined
      if (key === MARCO_ADDR.toLowerCase()) return marco ?? undefined
      if (key === USDT_ADDR.toLowerCase()) return usdt ?? undefined
      if (key === WBNB_ADDR.toLowerCase()) return wbnb ?? undefined
      return undefined
    },
    [bnb, marco, usdt, wbnb],
  )

  const cyclePair = useCallback(() => {
    const next = (pairIdx + 1) % PAIR_PRESETS.length
    setPairIdx(next)
    const a = resolveId(PAIR_PRESETS[next].a)
    const b = resolveId(PAIR_PRESETS[next].b)
    if (a && b) {
      setCurrencyA(a)
      setCurrencyB(b)
    }
  }, [pairIdx, resolveId, setCurrencyA, setCurrencyB])

  const onPickA = useCallback(() => {
    const c = resolveId(nextTokenId(currencyA, currencyB))
    if (c) setCurrencyA(c)
  }, [currencyA, currencyB, resolveId, setCurrencyA])

  const onPickB = useCallback(() => {
    const c = resolveId(nextTokenId(currencyB, currencyA))
    if (c) setCurrencyB(c)
  }, [currencyA, currencyB, resolveId, setCurrencyB])

  const ctaLabel = useMemo(() => {
    if (!account) return 'Connect Wallet'
    if (
      error?.code === 'INSUFFICIENT_TOKEN_A' ||
      error?.code === 'INSUFFICIENT_TOKEN_B' ||
      /insufficient/i.test(error?.message ?? '')
    ) {
      return 'Insufficient Balance'
    }
    if (error?.code === 'NETWORK_UNAVAILABLE' || error?.code === 'POOL_CLOSED') {
      return 'Unsupported Pair'
    }
    if (phase === 'approval_required' || /approve/i.test(primaryCtaLabel)) return 'Approve'
    if (noLiquidity) return 'Create Pool'
    if (/connect/i.test(primaryCtaLabel)) return 'Connect Wallet'
    return 'Add Liquidity'
  }, [account, error, noLiquidity, phase, primaryCtaLabel])

  const inlineStatus =
    (error && error.code !== 'CALCULATING' && error.code !== 'ENTER_AMOUNT' ? error.message : null) ||
    loadingLabel ||
    null

  const summaryLp = inlineStatus || dash(preview?.expectedLp)
  const summaryShare = dash(preview?.poolShare)
  const summaryImpact = '—'

  return (
    <Card
      ref={ref as React.Ref<HTMLElement>}
      id="liq-add-card"
      data-testid="liq-one-add-card"
      data-ls-card-add-liquidity="true"
      data-pixel-add="520"
    >
      <Header data-testid="liq-add-header" data-pixel-add-header="96">
        <Eyebrow>MANUAL</Eyebrow>
        <Title>Add Liquidity</Title>
        <Desc>Add liquidity to an existing pool or create a new one. You will receive LP tokens.</Desc>
        <Artwork aria-hidden data-testid="liq-add-artwork">
          <Disc $x="8%" $y="22%" $s="48px" />
          <Disc $x="36%" $y="12%" $s="52px" />
          <Disc $x="58%" $y="34%" $s="40px" />
          <Plus>+</Plus>
        </Artwork>
      </Header>

      <PairSection data-testid="liq-add-pair" data-pixel-add-pair="70">
        <PairSelect type="button" onClick={cyclePair} data-testid="liq-add-pair-select" data-ls-pair-select>
          <PairText>{pairLabel || 'BNB / MARCO'}</PairText>
          <Chevron aria-hidden>▾</Chevron>
        </PairSelect>
      </PairSection>

      <FormSection data-testid="liq-add-form" data-pixel-add-form="250">
        <TokenBox data-testid="liq-add-token-a">
          <TokenAmount
            value={typedValueA === '0.0' ? '' : typedValueA}
            onChange={(e) => onFieldAInput(e.target.value)}
            placeholder="0.0"
            inputMode="decimal"
            aria-label="Token A amount"
          />
          <TokenSelect type="button" onClick={onPickA} data-testid="liq-add-token-a-select">
            {currencyA?.symbol ?? '—'}
          </TokenSelect>
          <BalanceRow>
            <Balance>Balance {balA ? balA.toSignificant(6) : '—'}</Balance>
            <MaxBtn
              type="button"
              disabled={!maxA}
              onClick={() => maxA && onFieldAInput(maxA.toExact())}
              data-testid="liq-add-token-a-max"
            >
              MAX
            </MaxBtn>
          </BalanceRow>
        </TokenBox>

        <SwapMid>
          <SwapBtn type="button" aria-label="Swap tokens" onClick={onSwapTokens} data-testid="liq-add-swap">
            ⇅
          </SwapBtn>
        </SwapMid>

        <TokenBox data-testid="liq-add-token-b">
          <TokenAmount
            value={typedValueB === '0.0' ? '' : typedValueB}
            onChange={(e) => onFieldBInput(e.target.value)}
            placeholder="0.0"
            inputMode="decimal"
            aria-label="Token B amount"
          />
          <TokenSelect type="button" onClick={onPickB} data-testid="liq-add-token-b-select">
            {currencyB?.symbol ?? '—'}
          </TokenSelect>
          <BalanceRow>
            <Balance>Balance {balB ? balB.toSignificant(6) : '—'}</Balance>
            <MaxBtn
              type="button"
              disabled={!maxB}
              onClick={() => maxB && onFieldBInput(maxB.toExact())}
              data-testid="liq-add-token-b-max"
            >
              MAX
            </MaxBtn>
          </BalanceRow>
        </TokenBox>
      </FormSection>

      <Summary data-testid="liq-add-summary" data-pixel-add-summary="44">
        <Metric>
          <MetricLabel>{inlineStatus ? 'Status' : 'Est. LP received'}</MetricLabel>
          <MetricValue title={summaryLp}>{summaryLp}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>Pool Share</MetricLabel>
          <MetricValue>{summaryShare}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>Price Impact</MetricLabel>
          <MetricValue>{summaryImpact}</MetricValue>
        </Metric>
      </Summary>

      <Footer data-testid="liq-add-footer" data-pixel-add-footer="60">
        {!account ? (
          <ConnectWrap>
            <ConnectWalletButton>{ctaLabel}</ConnectWalletButton>
          </ConnectWrap>
        ) : (
          <Primary type="button" data-ls-primary-btn data-testid="liq-add-cta" onClick={onPrimaryAction}>
            {ctaLabel}
          </Primary>
        )}
        <PositionsAnchor type="button" onClick={onViewPositions} data-testid="liq-add-view-positions">
          View Your Positions ↓
        </PositionsAnchor>
      </Footer>
    </Card>
  )
})

export default AddLiquidityCard
