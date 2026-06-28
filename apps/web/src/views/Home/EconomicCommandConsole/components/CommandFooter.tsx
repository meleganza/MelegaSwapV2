import React from 'react'
import styled from 'styled-components'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useGasPrice } from 'state/user/hooks'
import { useCommandTranslation } from '../useCommandTranslation'
import { cmd } from '../tokens'
import { LiveDot } from '../styles'

const Bar = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 24px 40px;
  padding: 12px 24px;
  border-top: 1px solid ${cmd.border};
  background: rgba(0, 0, 0, 0.94);
  backdrop-filter: blur(10px);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;

  @media (max-width: 1024px) {
    bottom: 56px;
    padding: 10px 16px;
    gap: 12px 20px;
  }
`

const Item = styled.div`
  color: ${cmd.textSecondary};

  strong {
    color: ${cmd.text};
    margin-left: 6px;
  }
`

const CommandFooter: React.FC = () => {
  const { t } = useCommandTranslation()
  const { chainId } = useActiveChainId()
  const gasPrice = useGasPrice()

  const gasGwei =
    chainId === 56 && gasPrice && gasPrice !== '0'
      ? `${Math.round(Number(gasPrice) / 1e9)} GWEI`
      : t('Not indexed')

  return (
    <Bar>
      <Item>
        {t('CMD system status')}: <LiveDot>{t('CMD status optimal')}</LiveDot>
      </Item>
      <Item>
        {t('CMD block time')}: <strong>{t('Not indexed')}</strong>
      </Item>
      <Item>
        {t('CMD gas price')}: <strong>{gasGwei}</strong>
      </Item>
      <Item>
        {t('CMD network')}: <strong>BNB CHAIN</strong>
      </Item>
    </Bar>
  )
}

export default CommandFooter
