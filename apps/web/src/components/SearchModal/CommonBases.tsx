import { ChainId, Currency, Token } from '@pancakeswap/sdk'
import { Text, QuestionHelper } from '@pancakeswap/uikit'
import styled from 'styled-components'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useTranslation } from '@pancakeswap/localization'

import { SUGGESTED_BASES } from 'config/constants/exchange'
import { AutoColumn } from '../Layout/Column'
import { AutoRow } from '../Layout/Row'
import { CurrencyLogo } from '../Logo'
import { CommonBasesType } from './types'

const ButtonWrapper = styled.div`
  display: inline-block;
  vertical-align: top;
  // margin-right: 10px;
  width: 33%;
`

const BaseWrapper = styled.div<{ disable?: boolean }>`
  // border: 1px solid ${({ theme, disable }) => (disable ? 'transparent' : theme.colors.dropdown)};
  border-radius: 10px;
  display: flex;
  padding: 6px;
  align-items: center;
  :hover {
    cursor: ${({ disable }) => !disable && 'pointer'};
    background-color: ${({ theme, disable }) => !disable && theme.colors.background};
  }
  background-color: ${({ theme, disable }) => disable && theme.colors.dropdown};
  opacity: ${({ disable }) => disable && '0.4'};
`

const RowWrapper = styled.div`
  white-space: nowrap;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar {
    display: none;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
`

export default function CommonBases({
  chainId,
  onSelect,
  selectedCurrency,
  commonBasesType,
}: {
  chainId?: ChainId
  commonBasesType
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
}) {
  const native = useNativeCurrency()

  const { t } = useTranslation()
  const pinTokenDescText = commonBasesType === CommonBasesType.SWAP_LIMITORDER ? t('Common tokens') : t('Common bases')

  const FIRST_LINE = [SUGGESTED_BASES[chainId]?.[0], SUGGESTED_BASES[chainId]?.[1]]
  const SECOND_LINE_ETH = [SUGGESTED_BASES[chainId]?.[2], SUGGESTED_BASES[chainId]?.[3], SUGGESTED_BASES[chainId]?.[4]]

  return (
    <AutoColumn gap="md">
      <AutoRow>
        <Text fontSize="14px">{pinTokenDescText}</Text>
        {commonBasesType === CommonBasesType.LIQUIDITY && (
          <QuestionHelper text={t('These tokens are commonly paired with other tokens.')} ml="4px" />
        )}
      </AutoRow>
      <RowWrapper>
        <ButtonWrapper>
          <BaseWrapper
            onClick={() => {
              if (!selectedCurrency || !selectedCurrency.isNative) {
                onSelect(native)
              }
            }}
            disable={selectedCurrency?.isNative}
          >
            <CurrencyLogo currency={native} style={{ marginRight: 8 }} />
            <Text>{native?.symbol}</Text>
          </BaseWrapper>
        </ButtonWrapper>  
        {(chainId ? FIRST_LINE || [] : []).map((token: Token) => {
          const selected = selectedCurrency?.equals(token)
          return (
            <ButtonWrapper key={`buttonBase#${token.address}`}>
              <BaseWrapper onClick={() => !selected && onSelect(token)} disable={selected}>
                <CurrencyLogo currency={token} style={{ marginRight: 8, borderRadius: '50%' }} />
                <Text>{token.symbol}</Text>
              </BaseWrapper>
            </ButtonWrapper>
          )
        })}
      </RowWrapper>
      <RowWrapper>
        {([8453, 369, 250, 25, 43114].includes(chainId) ? [] : SECOND_LINE_ETH || []).map((token: Token) => {
          const selected = selectedCurrency?.equals(token)
          return (
            <ButtonWrapper key={`buttonBase#${token.address}`}>
              <BaseWrapper onClick={() => !selected && onSelect(token)} disable={selected}>
                <CurrencyLogo currency={token} style={{ marginRight: 8, borderRadius: '50%' }} />
                <Text>{token.symbol}</Text>
              </BaseWrapper>
            </ButtonWrapper>
          )
        })}
      </RowWrapper>
    </AutoColumn>
  )
}
