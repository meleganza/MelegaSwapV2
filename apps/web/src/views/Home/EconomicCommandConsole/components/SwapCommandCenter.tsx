import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Currency } from '@pancakeswap/sdk'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { currencyId } from 'utils/currencyId'
import { SmartSwapForm } from 'views/Swap/SmartSwap'
import useWarningImport from 'views/Swap/hooks/useWarningImport'
import { useCommandTranslation } from '../useCommandTranslation'
import { cmd } from '../tokens'

const Wrap = styled.div`
  width: 100%;
  max-width: 480px;
`

const Heading = styled.h2`
  margin: 0 0 16px;
  text-align: center;
  font-family: ${cmd.fontDisplay};
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: ${cmd.goldHighlight};
`

const Card = styled.div`
  background: ${cmd.surfaceGlass};
  backdrop-filter: blur(16px);
  border: 1px solid ${cmd.borderGold};
  border-radius: 16px;
  padding: 20px 18px 18px;
  box-shadow: 0 0 80px rgba(212, 175, 55, 0.06);

  & form,
  & [class*='Card'] {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }

  & h2,
  & [class*='Heading'] {
    display: none;
  }

  & input,
  & [class*='Input'] {
    background: rgba(0, 0, 0, 0.5) !important;
    border: 1px solid ${cmd.border} !important;
    border-radius: 12px !important;
    color: ${cmd.text} !important;
  }

  & button[class*='Swap'],
  & button[type='submit'] {
    background: linear-gradient(180deg, ${cmd.goldHighlight}, ${cmd.gold}) !important;
    color: #000 !important;
    border: none !important;
    border-radius: 12px !important;
    font-family: ${cmd.fontDisplay} !important;
    font-weight: 700 !important;
    letter-spacing: 0.1em !important;
    min-height: 52px !important;
  }
`

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`

const Tab = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid ${({ $active }) => ($active ? cmd.gold : cmd.border)};
  background: ${({ $active }) => ($active ? 'rgba(212, 175, 55, 0.1)' : 'transparent')};
  color: ${({ $active }) => ($active ? cmd.goldHighlight : cmd.textSecondary)};
  font-family: ${cmd.fontDisplay};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  cursor: ${({ $active }) => ($active ? 'default' : 'pointer')};
  transition: border-color ${cmd.transition}, color ${cmd.transition};
`

const SwapCommandCenter: React.FC = () => {
  const { t } = useCommandTranslation()
  const [tab, setTab] = useState<'swap' | 'limit'>('swap')
  const warningSwapHandler = useWarningImport()
  const { onCurrencySelection } = useSwapActionHandlers()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const handleOutputSelect = useCallback(
    (newCurrencyOutput: Currency) => {
      onCurrencySelection(Field.OUTPUT, newCurrencyOutput)
      warningSwapHandler(newCurrencyOutput)
      const newCurrencyOutputId = currencyId(newCurrencyOutput)
      if (newCurrencyOutputId === inputCurrencyId) {
        replaceBrowserHistory('inputCurrency', outputCurrencyId)
      }
      replaceBrowserHistory('outputCurrency', newCurrencyOutputId)
    },
    [inputCurrencyId, outputCurrencyId, onCurrencySelection, warningSwapHandler],
  )

  return (
    <Wrap>
      <Heading>{t('CMD instant swap')}</Heading>
      <Card>
        <Tabs>
          <Tab $active={tab === 'swap'} type="button" onClick={() => setTab('swap')}>
            SWAP
          </Tab>
          <Tab $active={tab === 'limit'} type="button" onClick={() => setTab('limit')}>
            LIMIT
          </Tab>
        </Tabs>
        {tab === 'swap' ? (
          <SmartSwapForm handleOutputSelect={handleOutputSelect} />
        ) : (
          <Tab $active type="button" disabled style={{ width: '100%', opacity: 0.7 }}>
            {t('CMD limit coming')}
          </Tab>
        )}
      </Card>
    </Wrap>
  )
}

export default SwapCommandCenter
