import { useTranslation } from '@pancakeswap/localization'
import { ChainId } from '@pancakeswap/sdk'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Box,
  Button,
  Flex,
  InfoIcon,
  Text,
  UserMenu,
  UserMenuDivider,
  UserMenuItem,
  useMatchBreakpoints,
  useTooltip,
} from '@pancakeswap/uikit'
import { useAccount, useNetwork } from 'wagmi'
import { useActiveChainId, useLocalNetworkChain } from 'hooks/useActiveChainId'
import { useNetworkConnectorUpdater } from 'hooks/useActiveWeb3React'
import { useHover } from 'hooks/useHover'
import { useSessionChainId } from 'hooks/useSessionChainId'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useActiveHandle } from 'hooks/useEagerConnect.bmp'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { chains } from 'utils/wagmi'
import { filterMelegaVisibleSwitcherChains } from 'config/constants/supportChains'
import { getMelegaChain, getMelegaPreparingChains } from 'config/melegaChainRegistry'
import { MELEGA_CHAIN_A11Y_LABELS } from 'components/Logo/MelegaExploreChainBadge'

/** Compact header labels — never spill into search / language / wallet. */
export const HEADER_CHAIN_COMPACT: Record<number, string> = {
  56: 'BSC',
  97: 'BSC',
  8453: 'Base',
  137: 'POL',
  1: 'ETH',
  42161: 'ARB',
  43114: 'AVAX',
}

export function headerChainLabel(chainId: number): string {
  return HEADER_CHAIN_COMPACT[chainId] ?? getMelegaChain(chainId)?.shortLabel ?? String(chainId)
}

export function headerChainTitle(chainId: number): string {
  return MELEGA_CHAIN_A11Y_LABELS[chainId] ?? getMelegaChain(chainId)?.name ?? `Chain ${chainId}`
}

import { ChainLogo } from './Logo/ChainLogo'
import { NetworkSwitchModal } from './Menu/UserMenu/NetworkSwitchModal'

const NetworkSelect = ({ switchNetwork, chainId }) => {
  const visibleChains = filterMelegaVisibleSwitcherChains(chains)
  const preparing = getMelegaPreparingChains()
  return (
    <>
      {visibleChains.map((chain) => (
        <UserMenuItem
          key={chain.id}
          style={{ justifyContent: 'flex-start' }}
          onClick={() => chain.id !== chainId && switchNetwork(chain.id)}
        >
          <ChainLogo chainId={chain.id} />
          <Text color={chain.id === chainId ? 'secondary' : 'text'} bold={chain.id === chainId} pl="12px">
            {headerChainLabel(chain.id)}
          </Text>
        </UserMenuItem>
      ))}
      {preparing.map((row) => (
        <UserMenuItem
          key={`preparing-${row.chainId}`}
          style={{ justifyContent: 'flex-start' }}
          onClick={() => row.chainId !== chainId && switchNetwork(row.chainId)}
        >
          <ChainLogo chainId={row.chainId} />
          <Text color={row.chainId === chainId ? 'secondary' : 'textSubtle'} bold={row.chainId === chainId} pl="12px">
            {row.shortLabel} · COMING SOON
          </Text>
        </UserMenuItem>
      ))}
    </>
  )
}

const WrongNetworkSelect = ({ switchNetwork, chainId }) => {
  const { t } = useTranslation()
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t(
      'The URL you are accessing (Chain id: %chainId%) belongs to %network%; mismatching your wallet’s network. Please switch the network to continue.',
      {
        chainId,
        network: chains.find((c) => c.id === chainId)?.name ?? 'Unknown network',
      },
    ),
    {
      placement: 'auto-start',
      hideTimeout: 0,
    },
  )
  const { chain } = useNetwork()
  const localChainId = useLocalNetworkChain() ?? filterMelegaVisibleSwitcherChains(chains)[0]?.id
  const [, setSessionChainId] = useSessionChainId()

  if (localChainId == null) return null

  const localChainName = headerChainLabel(localChainId)
  const localChainTitle = headerChainTitle(localChainId)

  const [ref1, isHover] = useHover<HTMLButtonElement>()

  return (
    <>
      <Flex ref={targetRef} alignItems="center" px="16px" py="8px">
        <InfoIcon color="textSubtle" />
        <Text color="textSubtle" pl="6px">
          {t('Please switch network')}
        </Text>
      </Flex>
      {tooltipVisible && tooltip}
      <UserMenuDivider />
      {chain && (
        <UserMenuItem ref={ref1} onClick={() => setSessionChainId(chain.id)} style={{ justifyContent: 'flex-start' }}>
          <ChainLogo chainId={chain.id} />
          <Text color="secondary" bold pl="12px" title={headerChainTitle(chain.id)}>
            {headerChainLabel(chain.id)}
          </Text>
        </UserMenuItem>
      )}
      <Box px="16px" pt="8px">
        {isHover ? <ArrowUpIcon color="text" /> : <ArrowDownIcon color="text" />}
      </Box>
      <UserMenuItem onClick={() => switchNetwork(localChainId)} style={{ justifyContent: 'flex-start' }}>
        <ChainLogo chainId={localChainId} />
        <Text pl="12px" title={localChainTitle}>
          {localChainName}
        </Text>
      </UserMenuItem>
      <Button mx="16px" my="8px" scale="sm" onClick={() => switchNetwork(localChainId)}>
        {t('Switch network in wallet')}
      </Button>
    </>
  )
}

export const NetworkSwitcher = () => {
  const { t } = useTranslation()
  const { chainId, isWrongNetwork, isNotMatched } = useActiveChainId()
  const { isMobile } = useMatchBreakpoints()
  const { pendingChainId, isLoading, canSwitch, switchNetworkAsync } = useSwitchNetwork()
  const router = useRouter()
  const { address: account } = useAccount()

  const [open, setOpen] = useState(false)
  const handleActive = useActiveHandle()

  const handleClick = () => {
    if (typeof __NEZHA_BRIDGE__ !== 'undefined') {
      handleActive()
    } else {
      setOpen(true)
    }
  }

  useNetworkConnectorUpdater()

  const foundChain = useMemo(
    () => chains.find((c) => c.id === (isLoading ? pendingChainId || chainId : chainId)),
    [isLoading, pendingChainId, chainId],
  )
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t('Unable to switch network. Please try it on your wallet'),
    { placement: 'bottom' },
  )

  const cannotChangeNetwork = !canSwitch

  if (!chainId || (!account && router.pathname.includes('info'))) {
    return null
  }

  const safeSwitch = async (next: number) => {
    try {
      await switchNetworkAsync(next)
    } catch {
      // Never crash the header — wallet rejection / unsupported chain stay toast-only.
    }
  }

  const visibleChains = filterMelegaVisibleSwitcherChains(chains)
  const isBnbOnlyProduction = visibleChains.length === 1 && visibleChains[0]?.id === ChainId.BSC

  if (isBnbOnlyProduction && account && (isWrongNetwork || isNotMatched)) {
    return (
      <Box height="100%" px="16px" data-network-status-pill>
        <Button scale="sm" onClick={() => void safeSwitch(ChainId.BSC)}>
          Switch wallet to BSC
        </Button>
      </Box>
    )
  }

  const isBnbOnlyStatus = isBnbOnlyProduction && chainId === ChainId.BSC && !isWrongNetwork && !isNotMatched

  if (isBnbOnlyStatus) {
    return (
      <Box height="100%" data-network-status-pill>
        <Flex alignItems="center" height="44px" px="16px" style={{ cursor: 'default', userSelect: 'none' }}>
          <ChainLogo chainId={ChainId.BSC} width={20} height={20} />
          <Text
            data-chain-label
            ml="6px"
            fontSize="13px"
            fontWeight={600}
            color="text"
            lineHeight={1.2}
            title={headerChainTitle(ChainId.BSC)}
          >
            BSC
          </Text>
        </Flex>
      </Box>
    )
  }

  return (
    <Box ref={cannotChangeNetwork ? targetRef : null} height="100%" data-testid="network-switcher-root">
      {cannotChangeNetwork && tooltipVisible && tooltip}
      <UserMenu
        placement="bottom"
        variant={isLoading ? 'pending' : isWrongNetwork ? 'danger' : 'default'}
        avatarSrc={`/images/chains/${[8453, 42161, 10, 324].includes(chainId) ? `${chainId}-1` : chainId}.png`}
        avatarClassName="melega-chain-avatar"
        disabled={cannotChangeNetwork}
        text={
          !isMobile &&
          (isLoading ? (
            t('Requesting')
          ) : isWrongNetwork ? (
            t('Network')
          ) : foundChain ? (
            <Box data-chain-label title={headerChainTitle(foundChain.id)}>
              {headerChainLabel(foundChain.id)}
            </Box>
          ) : (
            t('Select a Network')
          ))
        }
        onClick={handleClick}
      >
        {() =>
          isNotMatched ? (
            <WrongNetworkSelect switchNetwork={safeSwitch} chainId={chainId} />
          ) : (
            <NetworkSelect switchNetwork={safeSwitch} chainId={chainId} />
          )
        }
      </UserMenu>
      {open ? (
        <NetworkSwitchModal
          isOpen={open}
          onDismiss={() => setOpen(false)}
          switchNetwork={(id) => {
            void safeSwitch(id)
          }}
          chainId={chainId}
        />
      ) : null}
    </Box>
  )
}
