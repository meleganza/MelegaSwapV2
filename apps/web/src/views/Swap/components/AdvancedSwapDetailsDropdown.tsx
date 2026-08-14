import styled from 'styled-components'
import { useMemo } from 'react'
import { ChevronDownIcon, ChevronUpIcon, Flex, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { melegaOperational as tokens } from 'ui/tokens'
import useLastTruthy from 'hooks/useLast'
import { useExecutionDetailsOpen } from 'hooks/useExecutionDetailsOpen'

import { AdvancedSwapDetails, AdvancedSwapDetailsProps } from './AdvancedSwapDetails'

const Shell = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`

const ToggleRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  background: ${tokens.surfaceSecondary};
  color: ${tokens.textSecondary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: ${tokens.fontBody};
  flex-shrink: 0;

  &:hover {
    border-color: ${tokens.borderGold};
    color: ${tokens.text};
  }

  &:focus-visible {
    outline: 2px solid ${tokens.borderGold};
    outline-offset: 2px;
  }
`

/**
 * Stable accordion: grid 0fr/1fr avoids max-height clipping and corrupted close state.
 * Single source of truth: executionDetailsOpen.
 */
const Panel = styled.div<{ $open: boolean }>`
  display: grid;
  grid-template-rows: ${({ $open }) => ($open ? '1fr' : '0fr')};
  transition: grid-template-rows 220ms ease;
  width: 100%;
  margin-top: ${({ $open }) => ($open ? '8px' : '0')};
`

const PanelInner = styled.div`
  overflow: hidden;
  min-height: 0;
  min-width: 0;
`

const PanelBody = styled.div`
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  padding-bottom: 12px;
  border-radius: ${tokens.radiusSm};
  max-height: min(60vh, 480px);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;

  &,
  & * {
    overflow-wrap: anywhere;
  }
`

export default function AdvancedSwapDetailsDropdown({
  pairs,
  path,
  priceImpactWithoutFee,
  realizedLPFee,
  slippageAdjustedAmounts,
  inputAmount,
  outputAmount,
  tradeType,
  ...rest
}: AdvancedSwapDetailsProps) {
  const { t } = useTranslation()
  const { executionDetailsOpen, toggleExecutionDetailsOpen } = useExecutionDetailsOpen()
  const hasTrade = Boolean(inputAmount && outputAmount)

  const trade = useMemo(
    () => ({
      pairs,
      path,
      priceImpactWithoutFee,
      realizedLPFee,
      slippageAdjustedAmounts,
      inputAmount,
      outputAmount,
      tradeType,
    }),
    [pairs, path, priceImpactWithoutFee, realizedLPFee, slippageAdjustedAmounts, inputAmount, outputAmount, tradeType],
  )
  const lastTrade = useLastTruthy(trade)

  if (!hasTrade) {
    return null
  }

  return (
    <Shell data-execution-details-accordion data-execution-details-open={executionDetailsOpen ? 'true' : 'false'}>
      <ToggleRow
        type="button"
        onClick={() => toggleExecutionDetailsOpen()}
        aria-expanded={executionDetailsOpen}
        aria-controls="execution-details-panel"
        id="execution-details-toggle"
      >
        <Text fontSize="14px" color="textSubtle">
          {executionDetailsOpen ? t('Hide') : t('Details')}
        </Text>
        <Flex alignItems="center">
          {executionDetailsOpen ? <ChevronUpIcon width="20px" /> : <ChevronDownIcon width="20px" />}
        </Flex>
      </ToggleRow>
      <Panel $open={executionDetailsOpen}>
        <PanelInner>
          <PanelBody id="execution-details-panel" role="region" aria-labelledby="execution-details-toggle">
            {executionDetailsOpen ? (
              <AdvancedSwapDetails
                {...rest}
                pairs={pairs ?? lastTrade.pairs ?? undefined}
                path={path ?? lastTrade.path ?? undefined}
                priceImpactWithoutFee={priceImpactWithoutFee ?? lastTrade.priceImpactWithoutFee ?? undefined}
                realizedLPFee={realizedLPFee ?? lastTrade.realizedLPFee ?? undefined}
                slippageAdjustedAmounts={slippageAdjustedAmounts ?? lastTrade.slippageAdjustedAmounts ?? undefined}
                inputAmount={inputAmount ?? lastTrade.inputAmount ?? undefined}
                outputAmount={outputAmount ?? lastTrade.outputAmount ?? undefined}
                tradeType={tradeType ?? lastTrade.tradeType ?? undefined}
              />
            ) : null}
          </PanelBody>
        </PanelInner>
      </Panel>
    </Shell>
  )
}
