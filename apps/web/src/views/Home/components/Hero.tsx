
import { keyframes } from 'styled-components';
import { Flex, Heading, Link, Button, Text } from '@pancakeswap/uikit'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useTranslation } from '@pancakeswap/localization'
import ConnectWalletButton from 'components/ConnectWalletButton'
import useTheme from 'hooks/useTheme'
import './SlideSvg';
import './CompositeImage';

const flyingAnim = () => keyframes`
  from {
    transform: translate(0,  0px);
  }
  50% {
    transform: translate(-5px, -5px);
  }
  to {
    transform: translate(0, 0px);
  }
`

const fading = () => keyframes`
  from {
    opacity: 0.9;
  }
  50% {
    opacity: 0.1;
  }
  to {
    opacity: 0.9;
  }
`














const Hero = () => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  useTheme();

  return (
    <div>
      <img
        style={{ position: 'absolute', zIndex: 2, width: '200px', height: 'auto', right: '8rem' }}
        alt="space"
        src="/images/melega.png"
      />
      <Flex
        position="relative"
        flexDirection={['column-reverse', null, null, 'row']}
        alignItems={['flex-end', null, null, 'center']}
        justifyContent="center"
      >
        <Flex flex="1" flexDirection="column">
          <Heading scale="xl" color="#fff" mb="24px">
            {t('Melega DEX')}
          </Heading>
          <Text width="500px" color="#fff" mb="24px">
            {t(
              'AI-native liquidity on BSC, Base, Ethereum, and Polygon. Swap, LP, farms, and pools with familiar DEX compatibility.',
            )}
          </Text>
          <Flex>
            {!account && <ConnectWalletButton mr="8px" />}
            <Link mr="16px" href="/swap">
              <Button variant={!account ? 'secondary' : 'primary'}>{t('Trade Now')}</Button>
            </Link>
          </Flex>
        </Flex>
      </Flex>
    </div>
  )
}

export default Hero
