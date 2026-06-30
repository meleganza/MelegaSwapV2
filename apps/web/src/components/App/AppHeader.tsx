import styled from 'styled-components'
import { Text, Flex, IconButton, ArrowBackIcon, NotificationDot, QuestionHelper } from '@pancakeswap/uikit'
import { useExpertModeManager } from 'state/user/hooks'
import GlobalSettings from 'components/Menu/GlobalSettings'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import Transactions from './Transactions'
import { SettingsMode } from '../Menu/GlobalSettings/types'

interface Props {
  title: string
  subtitle?: string
  helper?: string
  backTo?: string | (() => void)
  noConfig?: boolean
}

const AppHeaderContainer = styled(Flex)`
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 20px;
  border-bottom: 1px solid ${tokens.border};
  width: 100%;
  background: ${tokens.surfaceSecondary};
`

const Title = styled.h2`
  margin: 0;
  font-family: ${tokens.fontDisplay};
  font-size: 18px;
  font-weight: 600;
  color: ${tokens.text};
  letter-spacing: 0.02em;
`

const AppHeader: React.FC<React.PropsWithChildren<Props>> = ({ title, subtitle, helper, backTo, noConfig = false }) => {
  const [expertMode] = useExpertModeManager()
  return (
    <AppHeaderContainer>
      <Flex alignItems="center" width="100%" style={{ gap: '12px' }}>
        {backTo &&
          (typeof backTo === 'string' ? (
            <Link passHref href={backTo}>
              <IconButton as="a" scale="sm">
                <ArrowBackIcon width="24px" />
              </IconButton>
            </Link>
          ) : (
            <IconButton scale="sm" variant="text" onClick={backTo}>
              <ArrowBackIcon width="24px" />
            </IconButton>
          ))}
        <Flex flexDirection="column" width="100%">
          <Flex my="4px" alignItems="center" justifyContent="space-between">
            <Flex alignItems="center">
              <Title>{title}</Title>
              {helper && <QuestionHelper text={helper} ml="4px" placement="top-start" />}
            </Flex>
            {!noConfig && (
              <Flex alignItems="center">
                <NotificationDot show={expertMode}>
                  <GlobalSettings mode={SettingsMode.SWAP_LIQUIDITY} />
                </NotificationDot>
                <Transactions />
              </Flex>
            )}
          </Flex>
          {subtitle && (
            <Flex alignItems="center">
              <Text color="textSubtle" fontSize="14px">
                {subtitle}
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </AppHeaderContainer>
  )
}

export default AppHeader
