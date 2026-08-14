import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Percent, TradeType } from '@pancakeswap/sdk'
import { Pair } from '@pancakeswap/smart-router/evm'
import { Modal, ModalV2, QuestionHelper, SearchIcon, Text, Flex, Link } from '@pancakeswap/uikit'

import { AutoColumn } from 'components/Layout/Column'
import { RowBetween, RowFixed } from 'components/Layout/Row'
import { BUYBACK_FEE, LP_HOLDERS_FEE, TOTAL_FEE, TREASURY_FEE } from 'config/constants/info'
import { useState } from 'react'
import styled from 'styled-components'
import { Field } from 'state/swap/actions'
import FormattedPriceImpact from './FormattedPriceImpact'
import { RouterViewer } from './RouterViewer'
import SwapRoute from './SwapRoute'
import { DexSwapFeeDisclosure } from 'components/DexPricing/DexSwapFeeDisclosure'

const DetailsColumn = styled(AutoColumn)`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  & > div {
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }
`

const SummaryColumn = styled(AutoColumn)`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 0 16px;

  & > div {
    min-width: 0;
    max-width: 100%;
    gap: 8px;
    flex-wrap: wrap;
  }

  & > div > div,
  p {
    min-width: 0;
    max-width: 100%;
    overflow-wrap: anywhere;
  }
`

function TradeSummary({
  inputAmount,
  outputAmount,
  tradeType,
  slippageAdjustedAmounts,
  priceImpactWithoutFee,
  realizedLPFee,
  hasStablePair = false,
}: {
  hasStablePair?: boolean
  inputAmount?: CurrencyAmount<Currency>
  outputAmount?: CurrencyAmount<Currency>
  tradeType?: TradeType
  slippageAdjustedAmounts: {
    INPUT?: CurrencyAmount<Currency>
    OUTPUT?: CurrencyAmount<Currency>
  }
  priceImpactWithoutFee?: Percent
  realizedLPFee?: CurrencyAmount<Currency>
}) {
  const { t } = useTranslation()
  const isExactIn = tradeType === TradeType.EXACT_INPUT
  const totalFeePercent = `${(TOTAL_FEE * 100).toFixed(2)}%`
  const lpHoldersFeePercent = `${(LP_HOLDERS_FEE * 100).toFixed(2)}%`
  const treasuryFeePercent = `${(TREASURY_FEE * 100).toFixed(4)}%`
  const buyBackFeePercent = `${(BUYBACK_FEE * 100).toFixed(4)}%`

  return (
    <SummaryColumn>
      <RowBetween>
        <RowFixed>
          <Text fontSize="14px" color="textSubtle">
            {isExactIn ? t('Minimum received') : t('Maximum sold')}
          </Text>
          <QuestionHelper
            text={t(
              'Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.',
            )}
            ml="4px"
            placement="top-start"
          />
        </RowFixed>
        <RowFixed>
          <Text fontSize="14px">
            {isExactIn
              ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${outputAmount.currency.symbol}` ?? '-'
              : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${inputAmount.currency.symbol}` ?? '-'}
          </Text>
        </RowFixed>
      </RowBetween>
      {priceImpactWithoutFee && (
        <RowBetween>
          <RowFixed>
            <Text fontSize="14px" color="textSubtle">
              {t('Price Impact')}
            </Text>
            <QuestionHelper
              text={t('The difference between the market price and estimated price due to trade size.')}
              ml="4px"
              placement="top-start"
            />
          </RowFixed>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </RowBetween>
      )}

      {realizedLPFee && (
        <RowBetween>
          <RowFixed>
            <Text fontSize="14px">{t('Liquidity Provider Fee')}</Text>
            <QuestionHelper
              text={
                <>
                  <Text mb="12px" fontSize="14px" color="#000">
                    {hasStablePair
                      ? t('For each non-stableswap trade, a %amount% fee is paid', { amount: totalFeePercent })
                      : t('For each trade a %amount% fee is paid', { amount: totalFeePercent })}
                  </Text>
                  <Text fontSize="14px" color="#000">
                    - {t('%amount% to LP token holders', { amount: lpHoldersFeePercent })}
                  </Text>
                  <Text fontSize="14px" color="#000">
                    - {t('%amount% to the Treasury', { amount: treasuryFeePercent })}
                  </Text>
                  <Text fontSize="14px" color="#000">
                    - {t('%amount% towards MARCO buyback and burn', { amount: buyBackFeePercent })}
                  </Text>
                  {hasStablePair && (
                    <>
                      <Text mt="12px">
                        {t('For each stableswap trade, refer to the fee table')}
                        <Link
                          style={{ display: 'inline' }}
                          ml="4px"
                          external
                          href="https://docs.pancakeswap.finance/products/stableswap#stableswap-fees"
                        >
                          {t('here.')}
                        </Link>
                      </Text>
                    </>
                  )}
                </>
              }
              ml="4px"
              placement="top-start"
            />
          </RowFixed>
          <Text fontSize="14px">{`${realizedLPFee.toSignificant(4)} ${inputAmount.currency.symbol}`}</Text>
        </RowBetween>
      )}
    </SummaryColumn>
  )
}

export interface AdvancedSwapDetailsProps {
  hasStablePair?: boolean
  pairs?: Pair[]
  path?: Currency[]
  priceImpactWithoutFee?: Percent
  realizedLPFee?: CurrencyAmount<Currency>
  slippageAdjustedAmounts?: {
    INPUT?: CurrencyAmount<Currency>
    OUTPUT?: CurrencyAmount<Currency>
  }
  inputAmount?: CurrencyAmount<Currency>
  outputAmount?: CurrencyAmount<Currency>
  tradeType?: TradeType
}

export function AdvancedSwapDetails({
  pairs,
  path,
  priceImpactWithoutFee,
  realizedLPFee,
  slippageAdjustedAmounts,
  inputAmount,
  outputAmount,
  tradeType,
  hasStablePair,
}: AdvancedSwapDetailsProps) {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(() => false)
  const showRoute = Boolean(path && path.length > 1)
  return (
    <DetailsColumn gap="0px">
      {inputAmount && (
        <>
          <TradeSummary
            inputAmount={inputAmount}
            outputAmount={outputAmount}
            tradeType={tradeType}
            slippageAdjustedAmounts={slippageAdjustedAmounts}
            priceImpactWithoutFee={priceImpactWithoutFee}
            realizedLPFee={realizedLPFee}
            hasStablePair={hasStablePair}
          />
          {outputAmount && (
            <DexSwapFeeDisclosure
              trade={{
                inputAmount,
                outputAmount,
                tradeType,
              }}
            />
          )}
          {showRoute && (
            <>
              <RowBetween style={{ padding: '0 16px', minWidth: 0, gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Text fontSize="14px" color="textSubtle">
                    {t('Route')}
                  </Text>
                  <QuestionHelper
                    text={t('Routing through these tokens resulted in the best price for your trade.')}
                    ml="4px"
                    placement="top-start"
                  />
                </span>
                <SwapRoute path={path} />
                <SearchIcon style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(true)} />
                <ModalV2 closeOnOverlayClick isOpen={isModalOpen} onDismiss={() => setIsModalOpen(false)}>
                  <Modal
                    title={
                      <Flex justifyContent="center">
                        {t('Route')}{' '}
                        <QuestionHelper
                          text={t('Routing through these tokens resulted in the best price for your trade.')}
                          ml="4px"
                          placement="top-start"
                        />
                      </Flex>
                    }
                    onDismiss={() => setIsModalOpen(false)}
                  >
                    <RouterViewer
                      inputCurrency={inputAmount.currency}
                      pairs={pairs}
                      path={path}
                      outputCurrency={outputAmount.currency}
                    />
                  </Modal>
                </ModalV2>
              </RowBetween>
            </>
          )}
        </>
      )}
    </DetailsColumn>
  )
}
