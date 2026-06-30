import styled from 'styled-components'
import { useMemo, useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon, Flex, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { melegaOperational as tokens } from 'ui/tokens'

import useLastTruthy from 'hooks/useLast'

import { AdvancedSwapDetails, AdvancedSwapDetailsProps } from './AdvancedSwapDetails'

const ToggleRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 12px 16px;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  background: ${tokens.surfaceSecondary};
  color: ${tokens.textSecondary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: ${tokens.fontBody};

  &:hover {
    border-color: ${tokens.borderGold};
    color: ${tokens.text};
  }
`

const AdvancedDetailsFooter = styled.div<{ show: boolean }>`
  padding-bottom: 16px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  border-radius: ${tokens.radiusSm};
  overflow: hidden;
  max-height: ${({ show }) => (show ? '1200px' : '0')};
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: max-height 300ms ease-in-out, opacity 200ms ease-in-out;
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
  const [expanded, setExpanded] = useState(false)
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
    <>
      <ToggleRow type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
        <Text fontSize="14px" color="textSubtle">
          {expanded ? t('Hide details') : t('Show details')}
        </Text>
        <Flex alignItems="center">
          {expanded ? <ChevronUpIcon width="20px" /> : <ChevronDownIcon width="20px" />}
        </Flex>
      </ToggleRow>
      <AdvancedDetailsFooter show={expanded}>
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
      </AdvancedDetailsFooter>
    </>
  )
}
