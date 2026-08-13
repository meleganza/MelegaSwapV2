import styled from 'styled-components'
import type { MarcoBridgeProgress } from 'lib/marco-bridge/types'

const STAGES: Array<{ id: MarcoBridgeProgress; label: string }> = [
  { id: 'TRANSACTION_SUBMITTED', label: 'Submitted' },
  { id: 'SOURCE_CONFIRMED', label: 'Source confirmed' },
  { id: 'CROSS_CHAIN_VERIFICATION', label: 'Verifying' },
  { id: 'DESTINATION_EXECUTION', label: 'Destination' },
  { id: 'MARCO_DELIVERED', label: 'Delivered' },
]

const Progress = styled.ol`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 5px;
  padding: 0;
  margin: 0;
  list-style: none;
`

const Step = styled.li<{ $complete: boolean; $current: boolean }>`
  min-width: 0;
  color: ${({ $complete, $current, theme }) => ($complete || $current ? theme.colors.text : theme.colors.textSubtle)};
  font-size: 10px;
  font-weight: ${({ $current }) => ($current ? 700 : 500)};
  line-height: 1.25;
  text-align: center;

  &::before {
    content: '';
    display: block;
    height: 3px;
    margin-bottom: 7px;
    border-radius: 999px;
    background: ${({ $complete, $current, theme }) =>
      $complete ? theme.colors.success : $current ? theme.colors.primary : theme.colors.cardBorder};
  }
`

export default function BridgeDeliveryProgress({ stage }: { stage?: MarcoBridgeProgress }) {
  const currentIndex = stage ? STAGES.findIndex((item) => item.id === stage) : -1

  return (
    <Progress aria-label="Bridge delivery progress">
      {STAGES.map((item, index) => (
        <Step key={item.id} $complete={currentIndex > index} $current={currentIndex === index}>
          {item.label}
        </Step>
      ))}
    </Progress>
  )
}
