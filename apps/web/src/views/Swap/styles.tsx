import { Box, Flex } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const StyledSwapContainer = styled(Flex)<{ $isChartExpanded: boolean }>`
  flex-shrink: 0;
  height: fit-content;
  width: 100%;
  max-width: min(436px, 100vw);
  padding: 0 16px;
  box-sizing: border-box;
  ${({ theme }) => theme.mediaQueries.lg} {
    padding: 0 40px;
    max-width: 520px;
  }

  ${({ theme }) => theme.mediaQueries.xxl} {
    ${({ $isChartExpanded }) => ($isChartExpanded ? 'padding: 0 120px' : 'padding: 0 40px')};
  }
`

export const StyledInputCurrencyWrapper = styled(Box)`
  width: 100%;
  max-width: 436px;
`
