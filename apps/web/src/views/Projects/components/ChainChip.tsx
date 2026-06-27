import React from 'react'
import styled from 'styled-components'
import { Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'

const Chip = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(73, 170, 242, 0.65)' : 'rgba(255, 255, 255, 0.18)')};
  background: ${({ $active }) => ($active ? 'rgba(73, 170, 242, 0.12)' : 'rgba(255, 255, 255, 0.04)')};
  color: #ffffff;
  transition: border-color 0.15s ease, background 0.15s ease;

  &:hover {
    border-color: rgba(73, 170, 242, 0.45);
  }
`

interface ChainChipProps {
  chainId: number
  label: string
  active?: boolean
  onToggle?: (chainId: number) => void
  readOnly?: boolean
}

const ChainChip: React.FC<ChainChipProps> = ({ chainId, label, active = false, onToggle, readOnly = false }) => {
  const { t } = useTranslation()

  if (readOnly) {
    return (
      <Chip as="span" $active={active} style={{ cursor: 'default' }}>
        <Text as="span" fontSize="12px" color="text">
          {t(label)}
        </Text>
      </Chip>
    )
  }

  return (
    <Chip type="button" $active={active} onClick={() => onToggle?.(chainId)} aria-pressed={active}>
      <Text as="span" fontSize="12px" color="text">
        {t(label)}
      </Text>
    </Chip>
  )
}

export default ChainChip
