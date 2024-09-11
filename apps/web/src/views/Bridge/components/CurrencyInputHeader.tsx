import { useTranslation } from '@pancakeswap/localization'
import {
  Flex,
  // IconButton,
  Swap,
  // Text,
  // useModal,
  // useTooltip,
} from '@pancakeswap/uikit'
// import TransactionsModal from 'components/App/Transactions/TransactionsModal'
// import { useSwapHotTokenDisplay } from 'hooks/useSwapHotTokenDisplay'
import { useAtom } from 'jotai'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
// import { useExpertModeManager } from 'state/user/hooks'
// import styled from 'styled-components'
import atomWithStorageWithErrorCatch from 'utils/atomWithStorageWithErrorCatch'

interface Props {
  title: string | ReactElement
  noConfig?: boolean
  setIsChartDisplayed?: React.Dispatch<React.SetStateAction<boolean>>
  isChartDisplayed?: boolean
  onRefreshPrice: () => void
}

const mobileShowOnceTokenHighlightAtom = atomWithStorageWithErrorCatch('pcs::mobileShowOnceTokenHighlight', false)

const CurrencyInputHeader: React.FC<React.PropsWithChildren<Props>> = ({
  onRefreshPrice,
  title,
}) => {
  const { t } = useTranslation()
  const [mobileTooltipShowOnce, setMobileTooltipShowOnce] = useAtom(mobileShowOnceTokenHighlightAtom)
  const [, setMobileTooltipShow] = useState(false)

  const mobileTooltipClickOutside = useCallback(() => {
    setMobileTooltipShow(false)
  }, [])

  useEffect(() => {
    if (isMobile && !mobileTooltipShowOnce) {
      setMobileTooltipShow(true)
      setMobileTooltipShowOnce(true)
    }
  }, [mobileTooltipShowOnce, setMobileTooltipShowOnce])

  useEffect(() => {
    document.body.addEventListener('click', mobileTooltipClickOutside)
    return () => {
      document.body.removeEventListener('click', mobileTooltipClickOutside)
    }
  }, [mobileTooltipClickOutside])

  const titleContent = (
    <Flex width="100%" alignItems="center" justifyContent="space-between" flexDirection="column">
      <Flex flexDirection="row" alignItems="center" width="100%" marginBottom={15}>
        <Swap.CurrencyInputHeaderTitle>{title}</Swap.CurrencyInputHeaderTitle>
        <Flex width="100%" justifyContent="end">
          {/* <NotificationDot show={expertMode}>
            <GlobalSettings color="textSubtle" mr="0" mode={SettingsMode.SWAP_LIQUIDITY} />
          </NotificationDot>
          <IconButton onClick={onPresentTransactionsModal} variant="text" scale="sm">
            <HistoryIcon color="textSubtle" width="24px" />
          </IconButton>
          <IconButton variant="text" scale="sm" onClick={handleOnClick}>
            <RefreshIcon disabled={!hasAmount} color="textSubtle" width="27px" />
          </IconButton> */}
        </Flex>
      </Flex>
      {/* <Flex justifyContent="start" width="100%" height="17px" alignItems="center" mb="14px">
        <Swap.CurrencyInputHeaderSubTitle>{subtitle}</Swap.CurrencyInputHeaderSubTitle>
      </Flex> */}
      {/* <Flex width="100%" justifyContent="end">
        {isChartSupported && setIsChartDisplayed && (
          <ColoredIconButton
            onClick={() => {
              if (!isChartDisplayed && isSwapHotTokenDisplay) {
                setIsSwapHotTokenDisplay(false)
              }
              toggleChartDisplayed()
            }}
            variant="text"
            scale="sm"
          >
            {isChartDisplayed ? <ChartDisableIcon color="textSubtle" /> : <ChartIcon width="24px" color="textSubtle" />}
          </ColoredIconButton>
        )}
        <ColoredIconButton
          variant="text"
          scale="sm"
          onClick={() => {
            if (!isSwapHotTokenDisplay && isChartDisplayed) {
              toggleChartDisplayed()
            }
            setIsSwapHotTokenDisplay(!isSwapHotTokenDisplay)
          }}
        >
          {isSwapHotTokenDisplay ? (
            <HotDisableIcon color="textSubtle" width="24px" />
          ) : (
            <>
              <TooltipText
                ref={targetRef}
                onClick={() => setMobileTooltipShow(false)}
                display="flex"
                style={{ justifyContent: 'center' }}
              >
                <HotIcon color="textSubtle" width="24px" />
              </TooltipText>
              {tooltipVisible && (!isMobile || mobileTooltipShow) && tooltip}
            </>
          )}
        </ColoredIconButton>
      </Flex> */}
    </Flex>
  )

  return <Swap.CurrencyInputHeader title={titleContent} subtitle={<></>} />
}

export default CurrencyInputHeader
