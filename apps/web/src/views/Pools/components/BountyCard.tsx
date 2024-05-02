import React, { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import {
  Card,
  CardBody,
  Text,
  Flex,
  HelpIcon,
  Button,
  Heading,
  Skeleton,
  useModal,
  Box,
  useTooltip,
} from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import Balance from 'components/Balance'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { useCakeVault, useCakeVault1 } from 'state/pools/hooks'
import BountyModal from './BountyModal'

const StyledCard = styled(Card)`
  width: 100%;
  flex: 1;
  border-radius: 24px;
  border: 1px;
  border-style: solid;
  border-color: white;
  border-bottom-width: 3px;
  ${({ theme }) => theme.mediaQueries.sm} {
    min-width: 240px;
  }
`

const BountyCard = () => {
  const { t } = useTranslation()
  const {
    estimatedDexTokenBountyReward,
    fees: { callFee },
  } = useCakeVault1()
  const cakePriceBusd = usePriceCakeBusd()

  const estimatedDollarBountyReward = useMemo(() => {
    return new BigNumber(estimatedDexTokenBountyReward).multipliedBy(cakePriceBusd)
  }, [cakePriceBusd, estimatedDexTokenBountyReward])

  const hasFetchedDollarBounty = estimatedDollarBountyReward.gte(0)
  const hasFetchedCakeBounty = estimatedDexTokenBountyReward ? estimatedDexTokenBountyReward.gte(0) : false
  const dollarBountyToDisplay = hasFetchedDollarBounty ? getBalanceNumber(estimatedDollarBountyReward, 18) : 0
  const cakeBountyToDisplay = hasFetchedCakeBounty ? getBalanceNumber(estimatedDexTokenBountyReward, 18) : 0

  const TooltipComponent = ({ fee }: { fee: number }) => (
    <>
      <Text color='#000' mb="16px">{t('This bounty is given as a reward for providing a service to other users.')}</Text>
      <Text color='#000' mb="16px">
        {t(
          'Whenever you successfully claim the bounty, you’re also helping out by activating the Auto MARCO Pool’s compounding function for everyone.',
        )}
      </Text>
      <Text color='#000' style={{ fontWeight: 'bold' }}>
        {t('Auto-Compound Bounty: %fee%% of all Auto MARCO pool users pending yield', { fee: fee / 100 })}
      </Text>
    </>
  )

  const [onPresentBountyModal] = useModal(<BountyModal TooltipComponent={TooltipComponent} />)

  const { targetRef, tooltip, tooltipVisible } = useTooltip(<TooltipComponent fee={callFee} />, {
    placement: 'bottom-end',
    tooltipOffset: [20, 10],
  })

  return (
    <>
      {tooltipVisible && tooltip}
      <StyledCard>
        <CardBody>
          <Flex flexDirection="column">
            <Flex alignItems="center" mb="12px">
              <Text fontSize="16px" bold color="textSubtle" mr="4px">
                {t('Auto MARCO Bounty')}
              </Text>
              <Box ref={targetRef}>
                <HelpIcon color="textSubtle" />
              </Box>
            </Flex>
          </Flex>
          <Flex alignItems="center" justifyContent="space-between">
            <Flex flexDirection="column" mr="12px">
              <Heading>
                {hasFetchedCakeBounty ? (
                  <>
                    <Balance fontSize="20px" bold unit="" value={cakeBountyToDisplay} prefix="" decimals={3} />
                  </>
                ) : (
                  <Skeleton height={20} width={96} mb="2px" />
                )}
              </Heading>
              {hasFetchedDollarBounty ? (
                <Balance
                  fontSize="12px"
                  color="textSubtle"
                  value={dollarBountyToDisplay}
                  decimals={2}
                  unit=" USD"
                  prefix="~"
                />
              ) : (
                <Skeleton height={16} width={62} />
              )}
            </Flex>
            <Button
              disabled={!dollarBountyToDisplay || !cakeBountyToDisplay || !callFee}
              onClick={onPresentBountyModal}
              scale="sm"
              id="clickClaimVaultBounty"
            >
              {t('Claim')}
            </Button>
          </Flex>
        </CardBody>
      </StyledCard>
    </>
  )
}

export default BountyCard
