import React, { useCallback, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useModal } from '@pancakeswap/uikit'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { useRouter } from 'next/router'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { LsPanel, LsPanelTitle, LsPrimaryBtn } from './liquidityStudioPrimitives'

const shimmer = keyframes`
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
`

const PairSelect = styled.button`
  width: 100%;
  height: ${liquidityStudioLayout.builderPairHeight};
  min-height: ${liquidityStudioLayout.builderPairHeight};
  border-radius: 12px;
  border: 1px solid ${liquidityStudioColors.border};
  background: ${liquidityStudioColors.surfaceSecondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  margin-bottom: ${liquidityStudioLayout.sectionGap};
  cursor: pointer;
  box-sizing: border-box;
`

const PairText = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${liquidityStudioColors.text};
`

const Chevron = styled.span`
  display: inline-flex;
  color: ${liquidityStudioColors.muted};
  font-size: 16px;
  line-height: 1;
`

const TokenRow = styled.div`
  position: relative;
  height: ${liquidityStudioLayout.tokenRowHeight};
  min-height: ${liquidityStudioLayout.tokenRowHeight};
  border-radius: 12px;
  border: 1px solid ${liquidityStudioColors.border};
  background: ${liquidityStudioColors.surfaceSecondary};
  padding: 10px 14px;
  box-sizing: border-box;
  margin-bottom: ${liquidityStudioLayout.sectionGap};
`

const TokenLabel = styled.span`
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${liquidityStudioColors.muted};
  line-height: 1;
  margin-bottom: 6px;
`

const TokenInput = styled.input`
  display: block;
  width: calc(100% - 100px);
  border: none;
  background: transparent;
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  color: ${liquidityStudioColors.text};
  outline: none;
  padding: 0;

  &::placeholder {
    color: ${liquidityStudioColors.muted};
  }
`

const TokenSelect = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  height: 40px;
  min-width: 88px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid ${liquidityStudioColors.border};
  background: #0f0f0f;
  color: ${liquidityStudioColors.text};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
`

const SwapMid = styled.div`
  display: flex;
  justify-content: center;
  margin: 2px auto ${liquidityStudioLayout.sectionGap};
  position: relative;
  z-index: 2;
`

const SwapBtn = styled.button`
  width: ${liquidityStudioLayout.swapIconSize};
  height: ${liquidityStudioLayout.swapIconSize};
  border-radius: 50%;
  border: 1px solid rgba(212, 175, 55, 0.35);
  background: #121212;
  color: ${liquidityStudioColors.goldBright};
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const RatioHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${liquidityStudioLayout.ratioRowHeight};
  min-height: ${liquidityStudioLayout.ratioRowHeight};
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 600;
  color: ${liquidityStudioColors.muted};
`

const RatioBar = styled.div<{ $pct?: number }>`
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  margin-bottom: ${liquidityStudioLayout.sectionGap};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    width: ${({ $pct }) => $pct ?? 50}%;
    background: linear-gradient(90deg, ${liquidityStudioColors.goldBright}, ${liquidityStudioColors.gold});
    border-radius: 999px;
    animation: ${shimmer} 6s ease-in-out infinite;
  }
`

const SlippageRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${liquidityStudioLayout.slippageRowHeight};
  min-height: ${liquidityStudioLayout.slippageRowHeight};
  margin-bottom: 0;
  font-size: 13px;
  font-weight: 600;
`

const SlippageLabel = styled.span`
  color: ${liquidityStudioColors.muted};
`

const SlippageValue = styled.span`
  color: ${liquidityStudioColors.goldBright};
  font-weight: 700;
`

const StatusLine = styled.p`
  margin: 8px 0 0;
  font-size: 11px;
  font-weight: 600;
  color: ${liquidityStudioColors.muted};
`

const PositionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;
`

const PositionItem = styled.button<{ $active?: boolean }>`
  text-align: left;
  border-radius: 12px;
  border: 1px solid ${({ $active }) => ($active ? liquidityStudioColors.gold : liquidityStudioColors.border)};
  background: ${liquidityStudioColors.surfaceSecondary};
  padding: 10px 12px;
  cursor: pointer;
  color: ${liquidityStudioColors.text};
`

const ConnectWrap = styled.div`
  margin-top: 10px;

  button {
    width: 100% !important;
    height: ${liquidityStudioLayout.connectButtonHeight} !important;
    border-radius: 12px !important;
    background: linear-gradient(180deg, #f4c542 0%, #d4af37 100%) !important;
    color: #050505 !important;
    font-size: 15px !important;
    font-weight: 800 !important;
    border: none !important;
  }
`

export const LiquidityBuilderPanel: React.FC = () => {
  const router = useRouter()
  const {
    mode,
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
    slippageLabel,
    preview,
    primaryCtaLabel,
    onPrimaryAction,
    account,
    loadingLabel,
    error,
    positions,
    positionsLoading,
    selectedPositionId,
    setSelectedPositionId,
    onRemovePercent,
    removePercent,
  } = useLiquidityRuntime()

  const [pickField, setPickField] = useState<'A' | 'B' | null>(null)

  const onCurrencySelect = useCallback(
    (currency) => {
      if (pickField === 'A') setCurrencyA(currency)
      if (pickField === 'B') setCurrencyB(currency)
      setPickField(null)
    },
    [pickField, setCurrencyA, setCurrencyB],
  )

  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal
      onCurrencySelect={onCurrencySelect}
      selectedCurrency={pickField === 'A' ? currencyA : currencyB}
      otherSelectedCurrency={pickField === 'A' ? currencyB : currencyA}
      showCommonBases
      commonBasesType="LIQUIDITY"
    />,
    true,
    false,
    'lsCurrencyModal',
  )

  const openPicker = (field: 'A' | 'B') => {
    setPickField(field)
    onPresentCurrencyModal()
  }

  const isPositions = mode === 'My Positions'
  const isRemove = mode === 'Remove Liquidity'
  const isSimulation = mode === 'Simulation'

  return (
    <LsPanel
      data-ls-panel
      data-ls-builder
      $width={liquidityStudioLayout.leftWidth}
      $height={liquidityStudioLayout.builderHeight}
    >
      <LsPanelTitle>Liquidity Builder</LsPanelTitle>
      {isSimulation ? (
        <StatusLine style={{ marginBottom: 12 }}>
          Read-only simulation using live pool math. Adjust amounts to preview LP share, APR, and IL — no on-chain execution.
        </StatusLine>
      ) : null}
      {isPositions ? (
        <>
          <PairText style={{ display: 'block', marginBottom: 12 }}>Your LP Positions</PairText>
          {!account ? (
            <StatusLine>Connect wallet to view positions.</StatusLine>
          ) : positionsLoading ? (
            <StatusLine>Reading LP…</StatusLine>
          ) : positions.length === 0 ? (
            <StatusLine>No LP positions found.</StatusLine>
          ) : (
            <PositionList>
              {positions.map((pos) => (
                <PositionItem
                  key={pos.id}
                  type="button"
                  $active={selectedPositionId === pos.id}
                  onClick={() => setSelectedPositionId(pos.id)}
                >
                  {pos.pairLabel}
                </PositionItem>
              ))}
            </PositionList>
          )}
          <LsPrimaryBtn type="button" data-ls-primary-btn onClick={() => router.push('/liquidity')}>
            {primaryCtaLabel}
          </LsPrimaryBtn>
        </>
      ) : (
        <>
          <PairSelect type="button" onClick={() => openPicker('A')}>
            <PairText>{pairLabel}</PairText>
            <Chevron aria-hidden>▾</Chevron>
          </PairSelect>
          <TokenRow>
            <TokenLabel>{isRemove ? 'Expected Output A' : 'Token A'}</TokenLabel>
            {isRemove ? (
              <TokenInput value={typedValueA} readOnly placeholder="0.0" />
            ) : (
              <TokenInput
                value={typedValueA === '0.0' ? '' : typedValueA}
                onChange={(e) => onFieldAInput(e.target.value)}
                placeholder="0.0"
                inputMode="decimal"
              />
            )}
            <TokenSelect type="button" onClick={() => openPicker('A')}>
              {currencyA?.symbol ?? '—'}
            </TokenSelect>
          </TokenRow>
          <SwapMid>
            <SwapBtn type="button" aria-label="Swap tokens" onClick={onSwapTokens}>
              ⇅
            </SwapBtn>
          </SwapMid>
          <TokenRow>
            <TokenLabel>{isRemove ? 'Expected Output B' : 'Token B'}</TokenLabel>
            {isRemove ? (
              <TokenInput value={typedValueB} readOnly placeholder="0.0" />
            ) : (
              <TokenInput
                value={typedValueB === '0.0' ? '' : typedValueB}
                onChange={(e) => onFieldBInput(e.target.value)}
                placeholder="0.0"
                inputMode="decimal"
              />
            )}
            <TokenSelect type="button" onClick={() => openPicker('B')}>
              {currencyB?.symbol ?? '—'}
            </TokenSelect>
          </TokenRow>
          <RatioHead>
            <span>Ratio</span>
            <span>
              {preview.tokenAPct} / {preview.tokenBPct}
            </span>
          </RatioHead>
          <RatioBar $pct={preview.tokenAPct} aria-hidden />
          {isRemove && (
            <TokenRow style={{ height: 56, minHeight: 56 }}>
              <TokenLabel>Remove %</TokenLabel>
              <TokenInput
                value={removePercent}
                onChange={(e) => onRemovePercent(e.target.value)}
                placeholder="50"
                inputMode="numeric"
              />
            </TokenRow>
          )}
          <SlippageRow>
            <SlippageLabel>Slippage Tolerance</SlippageLabel>
            <SlippageValue>{slippageLabel}</SlippageValue>
          </SlippageRow>
          {loadingLabel && <StatusLine>{loadingLabel}</StatusLine>}
          {error && error.code !== 'CALCULATING' && <StatusLine>{error.message}</StatusLine>}
          {!account ? (
            <ConnectWrap>
              <ConnectWalletButton>{primaryCtaLabel}</ConnectWalletButton>
            </ConnectWrap>
          ) : (
            <LsPrimaryBtn type="button" data-ls-primary-btn onClick={onPrimaryAction} disabled={isSimulation}>
              {primaryCtaLabel}
            </LsPrimaryBtn>
          )}
        </>
      )}
    </LsPanel>
  )
}

export default LiquidityBuilderPanel
