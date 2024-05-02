// import { parseUnits } from '@ethersproject/units'
import { AtomBox } from '@pancakeswap/ui/components/AtomBox'
import { UserMenuItemProps } from '@pancakeswap/uikit/src/widgets/Menu/components/UserMenu/types'
import {
  // ButtonMenu,
  // ButtonMenuItem,
  // CloseIcon,
  Heading,
  // IconButton,
  // InjectedModalProps,
  // ModalBody,
  // ModalContainer,
  // ModalHeader as UIKitModalHeader,
  // ModalTitle,
  ModalV2,
  ModalWrapper,
  Text,
  ModalV2Props,
  Flex,
  Grid,
  // Box,
} from '@pancakeswap/uikit'
// import { useAccount, useBalance } from 'wagmi'
// import { useState, useCallback } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'
import { chains } from 'utils/wagmi'
import { ChainLogo } from 'components/Logo/ChainLogo'

// const ModalHeader = styled(UIKitModalHeader)`
//   // background: ${({ theme }) => theme.colors.gradientBubblegum};
// `

const StyleGrid = styled(Grid)`
  grid-template-columns: auto auto auto auto auto;
  @media screen and (max-width: 900px) {
    grid-template-columns: auto auto auto;
  }
  @media screen and (max-width: 550px) {
    grid-template-columns: auto auto;
  }
  // gap: 20px;
`

export const UserMenuItem = styled.button<{ active: boolean }>`
  align-items: center;
  border: 0;
  background: ${({ theme, active }) => active ? theme.colors.backgroundAltBlur : "transparent"};
  color: ${({ theme }) => theme.colors.textSubtle};
  cursor: pointer;
  display: flex;
  font-size: 16px;
  // height: 72px;
  justify-content: space-between;
  outline: 0;
  padding: 16px 0;
  width: 150px;
  border-radius: 8px;

  &:is(button) {
    cursor: "pointer";
  }

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.tertiary};
  }

  &:active:not(:disabled) {
    opacity: 0.85;
    transform: translateY(1px);
  }
`;

interface NetworkSwitchModalProps<T = unknown> extends ModalV2Props {
  switchNetwork: (x: number) => void;
  chainId: number;
}

// export function WalletModalV2<T = unknown>(props: WalletModalV2Props<T>)

export function NetworkSwitchModal<T = unknown>(props: NetworkSwitchModalProps<T>) {
  const { switchNetwork, chainId, ...rest } = props
  const { t } = useTranslation()
  // const [view, setView] = useState(initialView)
  // const { t } = useTranslation()
  // const { address: account } = useAccount()
  // const { data, isFetched } = useBalance({ address: account })

  // const handleClick = () => {chain.id !== chainId && switchNetwork(chain.id); props.onDismiss();}


  return (
    // <ModalContainer title={t('Welcome!')} $minWidth="360px">
    //   <ModalHeader>
    //     <ModalTitle>
    //       <Heading>{t('Select Network')}</Heading>
    //     </ModalTitle>
    //     <IconButton scale="sm" variant="text" onClick={onDismiss}>
    //       <CloseIcon width="20px" color="text" />
    //     </IconButton>
    //   </ModalHeader>
    //   <ModalBody p="8px" width="100%">

    //   {chains
    //     .filter((chain) => !chain.testnet || chain.id === chainId)
    //     .map((chain) => (
    //       <UserMenuItem
    //         key={chain.id}
    //         style={{ justifyContent: 'flex-start' }}
    //         onClick={() => chain.id !== chainId && switchNetwork(chain.id)}
    //       >
    //         <ChainLogo chainId={chain.id} />
    //         <Text color={chain.id === chainId ? 'secondary' : 'text'} bold={chain.id === chainId} pl="12px">
    //           {chain.name}
    //         </Text>
    //       </UserMenuItem>
    //     ))}
    //   </ModalBody>
    // </ModalContainer>
    <ModalV2 closeOnOverlayClick {...rest}>
      <ModalWrapper onDismiss={props.onDismiss} style={{ overflow: 'visible', border: 'none', maxWidth: "360px" }}>
        <AtomBox position="relative">
          <AtomBox py="32px" px="24px">
            <Heading color="text" as="h4" pb="36px">
              {t('Switch Network')}
            </Heading>
            <StyleGrid>
              {chains
                .filter((chain) => !chain.testnet || chain.id === chainId)
                .map((chain) => (
                  <Flex
                    key={`network-flex-${chain.id}`}
                    justifyContent="center"
                  >
                    <UserMenuItem
                      key={`network-${chain.id}`}
                      active={chainId === chain.id}
                      style={{ flexDirection: 'column', justifyContent: 'flex-start' }}
                      onClick={() => { if (chain.id !== chainId) { switchNetwork(chain.id); props.onDismiss(); } }}
                    >
                      <ChainLogo chainId={chain.id} width={36} height={36} />
                      <Text fontSize={16} color={chain.id === chainId ? 'secondary' : 'text'} bold={chain.id === chainId} mt="10px">
                        {chain.name}
                      </Text>
                    </UserMenuItem>
                  </Flex>
                )
                )}
            </StyleGrid>
          </AtomBox>
        </AtomBox>
      </ModalWrapper>
    </ModalV2>
  )
}

// export default NetworkSwitchModal
