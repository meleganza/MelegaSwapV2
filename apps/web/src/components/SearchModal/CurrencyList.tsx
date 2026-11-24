import { CSSProperties, MouseEvent, MutableRefObject, useCallback, useMemo } from 'react'
import { Currency, CurrencyAmount, Token } from '@pancakeswap/sdk'
import { Text, QuestionHelper } from '@pancakeswap/uikit'
import '@pancakeswap/tokens';
import styled from 'styled-components'
import { FixedSizeList } from 'react-window'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { LightGreyCard } from 'components/Card'
import { useTranslation } from '@pancakeswap/localization'
import { useAccount } from 'wagmi'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCombinedActiveList } from '../../state/lists/hooks'
import { useLiveCurrencyBalance } from '../../state/wallet/hooks'
import { useIsUserAddedToken } from '../../hooks/Tokens'
import Column from '../Layout/Column'
import { RowFixed, RowBetween } from '../Layout/Row'
import { CurrencyLogo } from '../Logo'
import CircleLoader from '../Loader/CircleLoader'
import { isTokenOnList } from '../../utils'
import { getTokenExplorerUrl } from '../../utils/blockExplorer'
import ImportRow from './ImportRow'

function currencyKey(currency: Currency): string {
  return currency?.isToken ? currency.address : currency?.isNative ? currency.symbol : ''
}

const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
`

const FixedContentRow = styled.div`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-gap: 16px;
  align-items: center;
`

function Balance({ balance }: { balance: CurrencyAmount<Currency> }) {
  return <StyledBalanceText title={balance.toExact()}>{balance.toSignificant(4)}</StyledBalanceText>
}

const MenuItem = styled(RowBetween)<{ disabled: boolean; selected: boolean }>`
  padding: 6px 16px;
  height: 60px;
  display: grid;
  grid-template-columns: auto minmax(80px, 1fr) minmax(0, 72px) auto;
  grid-gap: 8px;
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  :hover {
    background-color: ${({ disabled }) => !disabled && '#F7F6F2'};
  }
  opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};

  > div:nth-child(2) > div:first-child {
    color: #171817 !important;
    font-weight: 700;
    font-size: 16px !important;
  }

  > div:nth-child(2) > div:last-child { color: #72736E !important; font-size: 13px !important; }

  img[class*='CurrencyLogo'], > img, > div:first-child img { width: 40px; height: 40px; }
`

const TokenActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`

const TokenAction = styled.button`
  width: 32px;
  height: 32px;
  min-width: 32px;
  border: 1px solid #E5E2D9;
  border-radius: 10px;
  background: #FFFFFF;
  color: #72736E;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;

  &:hover, &:focus-visible { color: #171817; border-color: #F3C928; }
  svg { width: 16px; height: 16px; }

  @media (max-width: 374px) { &:nth-child(2) { display: none; } }
`

const CopyIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>
const WalletIcon = () => <img src="/images/wallets/metamask.png" alt="" width={18} height={18} style={{ display: 'block' }} />
const ExternalIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></svg>

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
}: {
  currency: Currency
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: CSSProperties
}) {
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const key = currencyKey(currency)
  const selectedTokenList = useCombinedActiveList()
  const isOnSelectedList = isTokenOnList(selectedTokenList, currency)
  const customAdded = useIsUserAddedToken(currency)
  const { balance, loading, error: balanceError } = useLiveCurrencyBalance(account ?? undefined, currency)
  const token = currency.isToken ? currency : null
  const explorerUrl = token ? getTokenExplorerUrl(token.address, token.chainId) : null

  const stop = (event: MouseEvent) => event.stopPropagation()
  const copyAddress = (event: MouseEvent) => {
    stop(event)
    if (token) void navigator.clipboard?.writeText(token.address)
  }
  const addToWallet = (event: MouseEvent) => {
    stop(event)
    const provider = (window as Window & { ethereum?: { request?: (args: unknown) => Promise<unknown> } }).ethereum
    if (!token || !provider?.request) return
    void provider.request({ method: 'wallet_watchAsset', params: { type: 'ERC20', options: { address: token.address, symbol: token.symbol, decimals: token.decimals } } })
  }

  // only show add or remove buttons if not on selected list
  return (
    <MenuItem
      style={style}
      className={`token-item-${key}`}
      onClick={() => (isSelected ? null : onSelect())}
      disabled={isSelected}
      selected={otherSelected}
    >
      <CurrencyLogo currency={currency} size="24px" />
      <Column>
        <Text bold>{currency.symbol}</Text>
        <Text color="textSubtle" small ellipsis maxWidth="200px">
          {!isOnSelectedList && customAdded && `${t('Added by user')} •`} {currency.name}
        </Text>
      </Column>
      <RowFixed style={{ justifySelf: 'flex-end' }}>
        {balance ? (
          <Balance balance={balance} />
        ) : account && loading ? (
          <CircleLoader />
        ) : account ? (
          <StyledBalanceText color="textSubtle" title={balanceError ? t('Balance unavailable') : undefined}>
            —
          </StyledBalanceText>
        ) : null}
      </RowFixed>
      {token ? (
        <TokenActions aria-label={`${currency.symbol} actions`}>
          <TokenAction type="button" aria-label={`Copy ${currency.symbol} contract`} onClick={copyAddress}><CopyIcon /></TokenAction>
          <TokenAction type="button" aria-label={`Add ${currency.symbol} to wallet`} onClick={addToWallet}><WalletIcon /></TokenAction>
          {explorerUrl ? <TokenAction as="a" href={explorerUrl} target="_blank" rel="noreferrer" aria-label={`Open ${currency.symbol} in explorer`} onClick={stop}><ExternalIcon /></TokenAction> : null}
        </TokenActions>
      ) : <span />}
    </MenuItem>
  )
}

export default function CurrencyList({
  height,
  currencies,
  inactiveCurrencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showNative,
  showImportView,
  setImportToken,
  breakIndex,
}: {
  height: number | string
  currencies: Currency[]
  inactiveCurrencies: Currency[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherCurrency?: Currency | null
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
  showNative: boolean
  showImportView: () => void
  setImportToken: (token: Token) => void
  breakIndex: number | undefined
}) {
  const native = useNativeCurrency()

  const itemData: (Currency | undefined)[] = useMemo(() => {
    let formatted: (Currency | undefined)[] = showNative
      ? [native, ...currencies, ...inactiveCurrencies]
      : [...currencies, ...inactiveCurrencies]
    if (breakIndex !== undefined) {
      formatted = [...formatted.slice(0, breakIndex), undefined, ...formatted.slice(breakIndex, formatted.length)]
    }
    return formatted
  }, [breakIndex, currencies, inactiveCurrencies, showNative, native])

  const { chainId } = useActiveChainId()

  const { t } = useTranslation()

  const Row = useCallback(
    ({ data, index, style }) => {
      const currency: Currency = data[index]
      const isSelected = Boolean(selectedCurrency && currency && selectedCurrency.equals(currency))
      const otherSelected = Boolean(otherCurrency && currency && otherCurrency.equals(currency))
      const handleSelect = () => onCurrencySelect(currency)

      const token = wrappedCurrency(currency, chainId)

      const showImport = index > currencies.length

      if (index === breakIndex || !data) {
        return (
          <FixedContentRow style={style}>
            <LightGreyCard padding="8px 12px" borderRadius="8px">
              <RowBetween>
                <Text small>{t('Expanded results from inactive Token Lists')}</Text>
                <QuestionHelper
                  text={t(
                    "Tokens from inactive lists. Import specific tokens below or click 'Manage' to activate more lists.",
                  )}
                  ml="4px"
                />
              </RowBetween>
            </LightGreyCard>
          </FixedContentRow>
        )
      }

      if (showImport && token) {
        return (
          <ImportRow
            onCurrencySelect={handleSelect}
            style={style}
            token={token}
            showImportView={showImportView}
            setImportToken={setImportToken}
            dim
          />
        )
      }
      return (
        <CurrencyRow
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
        />
      )
    },
    [
      selectedCurrency,
      otherCurrency,
      chainId,
      currencies.length,
      breakIndex,
      onCurrencySelect,
      t,
      showImportView,
      setImportToken,
    ],
  )

  const itemKey = useCallback((index: number, data: any) => currencyKey(data[index]), [])

  return (
    <FixedSizeList
      height={height}
      ref={fixedListRef as any}
      width="100%"
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={64}
      itemKey={itemKey}
    >
      {Row}
    </FixedSizeList>
  )
}
