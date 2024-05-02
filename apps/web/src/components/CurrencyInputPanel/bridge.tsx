import { useMemo, useState } from 'react'
import { Currency, Pair, Token, Percent, CurrencyAmount } from '@pancakeswap/sdk'
import { Button, ChevronDownIcon, Text, useModal, Flex, Box, NumericalInput, CopyButton } from '@pancakeswap/uikit'
import styled, { css } from 'styled-components'
import { isAddress } from 'utils'
import { useTranslation } from '@pancakeswap/localization'
import { WrappedTokenInfo } from '@pancakeswap/token-lists'

import { useBUSDCurrencyAmount } from 'hooks/useBUSDPrice'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import { StablePair } from 'views/AddLiquidity/AddStableLiquidity/hooks/useStableLPDerivedMintInfo'

import { useAccount } from 'wagmi'
// import { useActiveChainId } from 'hooks/useActiveChainId'
import { ChainLogo } from 'components/Logo/ChainLogo'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencySearchBridgeModal from '../SearchModal/CurrencySearchBridgeModal'
import { CurrencyLogo, DoubleCurrencyLogo } from '../Logo'

import AddToWalletButton from '../AddToWallet/AddToWalletButton'

const InputRow = styled.div<{ selected: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-end;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`
const CurrencySelectButton = styled(Button).attrs({ variant: 'text', scale: 'sm' })<{ zapStyle?: ZapStyle }>`
  padding: 0 0.5rem;
  ${({theme}) => css`
    &:disabled,
    &.pancake-button--disabled {
        background-color: transparent;
        color: ${theme.colors.primary};
        cursor: default;
    }
  `}
  ${({ zapStyle, theme }) =>
    zapStyle &&
    css`
      padding: 8px;
      background: ${theme.colors.background};
      border: 1px solid ${theme.colors.cardBorder};
      border-radius: ${zapStyle === 'zap' ? '0px' : '8px'} 8px 0px 0px;
      height: auto;
    `};
`
const LabelRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;
`
const InputPanel = styled.div`
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  z-index: 1;
`
const Container = styled.div<{ zapStyle?: ZapStyle; error?: boolean }>`
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  // box-shadow: ${({ theme, error }) => theme.shadows[error ? 'warning' : 'inset']};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  ${({ zapStyle }) =>
    !!zapStyle &&
    css`
      border-radius: 0px 16px 16px 16px;
    `};
`

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.6;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`

type ZapStyle = 'noZap' | 'zap'

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onInputBlur?: () => void
  onPercentInput?: (percent: number) => void
  onMax?: () => void
  showQuickInputButton?: boolean
  showMaxButton: boolean
  maxAmount?: CurrencyAmount<Currency>
  lpPercent?: string
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | StablePair | null
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
  commonBasesType?: string
  showSearchInput?: boolean
  zapStyle?: ZapStyle
  beforeButton?: React.ReactNode
  disabled?: boolean
  error?: boolean
  showBUSD?: boolean
  tokensToShow?: Token[]
  chainId?: number
  isTargetChain?: boolean
}
export default function CurrencyInputPanelForBridge({
  value,
  onUserInput,
  onInputBlur,
  onPercentInput,
  onMax,
  showQuickInputButton = false,
  showMaxButton,
  maxAmount,
  lpPercent,
  label,
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  zapStyle,
  beforeButton,
  pair = null, // used for double token logo
  otherCurrency,
  id,
  showCommonBases,
  commonBasesType,
  showSearchInput,
  disabled,
  error,
  showBUSD,
  tokensToShow,
  chainId,
  isTargetChain,
}: CurrencyInputPanelProps) {
  const { address: account } = useAccount()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const { t } = useTranslation()

  const token = pair ? pair.liquidityToken : currency?.isToken ? currency : null
  const tokenAddress = token ? isAddress(token.address) : null

  const amountInDollar = useBUSDCurrencyAmount(
    showBUSD ? currency : undefined,
    Number.isFinite(+value) ? +value : undefined,
  )

  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchBridgeModal
      onCurrencySelect={onCurrencySelect}
      selectedCurrency={currency}
      otherSelectedCurrency={otherCurrency}
      showCommonBases={showCommonBases}
      commonBasesType={commonBasesType}
      showSearchInput={showSearchInput}
      tokensToShow={tokensToShow}
    />,
  )

  const percentAmount = useMemo(
    () => ({
      25: maxAmount ? maxAmount.multiply(new Percent(25, 100)).toExact() : undefined,
      50: maxAmount ? maxAmount.multiply(new Percent(50, 100)).toExact() : undefined,
      75: maxAmount ? maxAmount.multiply(new Percent(75, 100)).toExact() : undefined,
    }),
    [maxAmount],
  )

  const [currentClickedPercent, setCurrentClickedPercent] = useState('')

  const isAtPercentMax = (maxAmount && value === maxAmount.toExact()) || (lpPercent && lpPercent === '100')

  return (
    <Box position="relative" id={id}>
      <Flex alignItems="center" justifyContent="space-between">
        <Flex>
          {beforeButton}
          <CurrencySelectButton
            zapStyle={zapStyle}
            className="open-currency-select-button"
            selected={!!currency}
            onClick={() => {
              if (!disableCurrencySelect) {
                onPresentCurrencyModal()
              }
            }}
            disabled={isTargetChain}
          >
            <Flex alignItems="center" justifyContent="space-between">
              {pair ? (
                <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={16} margin />
              ) : currency ? (
                <CurrencyLogo currency={currency} size="24px" style={{ marginRight: '8px' }} />
              ) : null}
              {pair ? (
                <Text id="pair" bold>
                  {pair?.token0.symbol}:{pair?.token1.symbol}
                </Text>
              ) : (
                <Text id="pair" bold>
                  {(currency && currency.symbol && currency.symbol.length > 10
                    ? `${currency.symbol.slice(0, 4)}...${currency.symbol.slice(
                        currency.symbol.length - 5,
                        currency.symbol.length,
                      )}`
                    : currency?.symbol) || t('Select a currency')}
                </Text>
              )}
              {!disableCurrencySelect && !isTargetChain && <ChevronDownIcon />}
            </Flex>
          </CurrencySelectButton>
          {!isTargetChain && token && tokenAddress ? (
            <Flex style={{ gap: '4px' }} ml="4px" alignItems="center">
              <CopyButton
                width="16px"
                buttonColor="textSubtle"
                text={tokenAddress}
                tooltipMessage={t('Token address copied')}
              />
              <AddToWalletButton
                variant="text"
                p="0"
                height="auto"
                width="fit-content"
                tokenAddress={tokenAddress}
                tokenSymbol={token.symbol}
                tokenDecimals={token.decimals}
                tokenLogo={token instanceof WrappedTokenInfo ? token.logoURI : undefined}
              />
            </Flex>
          ) : null}
        </Flex>
        {account && !isTargetChain && (
          <Text
            onClick={!disabled && onMax}
            color="textSubtle"
            fontSize="14px"
            style={{ display: 'inline', cursor: 'pointer' }}
          >
            {!hideBalance && !!currency
              ? t('Balance: %balance%', { balance: selectedCurrencyBalance?.toSignificant(6) ?? t('Loading') })
              : ' -'}
          </Text>
        )}
        <Flex justifyContent='center' alignItems='center'>
            <ChainLogo chainId={chainId} width={24} height={24} />
          </Flex>
      </Flex>
      <InputPanel>
        <Container as="label" zapStyle={zapStyle} error={error}>
          <LabelRow>
            <NumericalInput
              error={error}
              disabled={disabled}
              className="token-amount-input"
              value={value}
              onBlur={onInputBlur}
              onUserInput={(val) => {
                onUserInput(val)
                setCurrentClickedPercent('')
              }}
            />
          </LabelRow>
          {!!currency && showBUSD && Number.isFinite(amountInDollar) && (
            <Flex justifyContent="flex-end" mr="1rem">
              <Flex maxWidth="200px">
                <Text fontSize="12px" color="textSubtle">
                  ~{formatNumber(amountInDollar)} USD
                </Text>
              </Flex>
            </Flex>
          )}
          <InputRow selected={disableCurrencySelect}>
            {account && currency && selectedCurrencyBalance?.greaterThan(0) && !disabled && label !== 'To' && (
              <Flex alignItems="right" justifyContent="right">
                {maxAmount?.greaterThan(0) &&
                  showQuickInputButton &&
                  onPercentInput &&
                  [25, 50, 75].map((percent) => {
                    const isAtClickedPercent = currentClickedPercent === percent.toString()
                    const isAtCurrentPercent =
                      (maxAmount && value !== '0' && value === percentAmount[percent]) ||
                      (lpPercent && lpPercent === percent.toString())

                    return (
                      <Button
                        key={`btn_quickCurrency${percent}`}
                        onClick={() => {
                          onPercentInput(percent)
                          setCurrentClickedPercent(percent.toString())
                        }}
                        scale="xs"
                        mr="5px"
                        variant={isAtClickedPercent || isAtCurrentPercent ? 'primary' : 'secondary'}
                        style={{ textTransform: 'uppercase' }}
                      >
                        {percent}%
                      </Button>
                    )
                  })}
                {maxAmount?.greaterThan(0) && showMaxButton && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      onMax?.()
                      setCurrentClickedPercent('MAX')
                    }}
                    scale="xs"
                    variant={isAtPercentMax ? 'primary' : 'secondary'}
                    style={{ textTransform: 'uppercase' }}
                  >
                    {t('Max')}
                  </Button>
                )}
              </Flex>
            )}
          </InputRow>
        </Container>
        {disabled && <Overlay />}
      </InputPanel>
    </Box>
  )
}
