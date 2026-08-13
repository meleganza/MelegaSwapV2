import { useMemo, useState } from 'react'
import { Button } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useAccount } from 'wagmi'
import styled from 'styled-components'
import { canonicalizeBridgeAmount, formatDecimalAmount } from 'lib/marco-bridge/amounts'
import { validateDestinationWallet } from 'lib/marco-bridge/address'
import { useSolanaWallet } from 'lib/marco-bridge/useSolanaWallet'
import type { MarcoBridgeNetworkId } from 'lib/marco-bridge/types'
import {
  MARCO_BRIDGE_PUBLIC_ACTIVATION_AUTHORIZED,
  MARCO_WAVE1_NETWORKS,
  MARCO_WAVE1_ROUTES,
  getMarcoBridgeNetwork,
  getMarcoBridgeRoute,
} from 'lib/marco-bridge/wave1Registry'
import BridgeDeliveryProgress from './BridgeDeliveryProgress'

const CHAIN_BY_ID: Partial<Record<number, MarcoBridgeNetworkId>> = { 56: 'bnb', 8453: 'base', 4663: 'robinhood' }

const Panel = styled.section`
  display: grid;
  gap: 12px;
  padding: 12px 2px 2px;
`
const Status = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 12px;
  border: 1px solid rgba(255, 198, 0, 0.18);
  border-radius: 11px;
  background: rgba(255, 198, 0, 0.035);
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 12px;
  strong {
    color: ${({ theme }) => theme.colors.primary};
  }
`
const NetworkRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 34px minmax(0, 1fr);
  align-items: end;
  gap: 8px;
  @media (max-width: 575px) {
    grid-template-columns: 1fr;
  }
`
const Field = styled.label`
  display: grid;
  gap: 6px;
  min-width: 0;
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`
const control = `height:50px;padding:0 13px;border-radius:13px;font-size:15px;outline:none;`
const Select = styled.select`
  width: 100%;
  ${control}border:1px solid ${({ theme }) => theme.colors.cardBorder};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.input};
  font-weight: 650;
  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`
const Input = styled.input<{ $invalid?: boolean }>`
  width: 100%;
  ${control}border:1px solid ${({ $invalid, theme }) => ($invalid ? theme.colors.failure : theme.colors.cardBorder)};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.input};
  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`
const Direction = styled.div`
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  margin-bottom: 8px;
  border: 1px solid rgba(255, 198, 0, 0.22);
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.primary};
  @media (max-width: 575px) {
    margin: -2px auto;
    transform: rotate(90deg);
  }
`
const WalletLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 38px;
  padding: 0 11px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 12px;
  strong {
    overflow: hidden;
    color: ${({ theme }) => theme.colors.text};
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`
const WalletActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  button {
    height: 32px;
    font-size: 11px;
  }
`
const AmountWrap = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 58px;
  gap: 8px;
`
const MaxButton = styled.button`
  border: 1px solid rgba(255, 198, 0, 0.24);
  border-radius: 13px;
  color: ${({ theme }) => theme.colors.primary};
  background: rgba(255, 198, 0, 0.05);
  font-weight: 800;
  cursor: not-allowed;
  opacity: 0.55;
`
const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 13px;
  @media (max-width: 575px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`
const Metric = styled.div`
  min-width: 0;
  padding: 10px 11px;
  border-right: 1px solid ${({ theme }) => theme.colors.cardBorder};
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  strong {
    display: block;
    overflow: hidden;
    margin-top: 4px;
    color: ${({ theme }) => theme.colors.text};
    font-size: 11px;
    letter-spacing: normal;
    text-overflow: ellipsis;
    text-transform: none;
    white-space: nowrap;
  }
`
const ErrorText = styled.p`
  margin: -2px 2px 0;
  color: ${({ theme }) => theme.colors.failure};
  font-size: 11px;
`
const Advanced = styled.details`
  padding: 9px 11px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 11px;
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 10px;
  summary {
    font-weight: 700;
    cursor: pointer;
  }
  p {
    overflow-wrap: anywhere;
    margin: 7px 0 0;
  }
`

const shorten = (value?: string | null) => (value ? `${value.slice(0, 7)}…${value.slice(-5)}` : 'Not connected')
const validate = (value: string, family: 'evm' | 'solana') => {
  if (!value) return { valid: false, reason: '' }
  try {
    validateDestinationWallet(value, family)
    return { valid: true, reason: '' }
  } catch (error) {
    return { valid: false, reason: error instanceof Error ? error.message : 'Invalid wallet.' }
  }
}

export default function MarcoBridgeWorkspace() {
  const { chainId } = useActiveChainId()
  const { address, isConnected } = useAccount()
  const { switchNetworkAsync, isLoading: isSwitching } = useSwitchNetwork()
  const solana = useSolanaWallet()
  const [source, setSource] = useState<MarcoBridgeNetworkId>(CHAIN_BY_ID[Number(chainId)] ?? 'bnb')
  const [destination, setDestination] = useState<MarcoBridgeNetworkId>('base')
  const [destinationWallet, setDestinationWallet] = useState('')
  const [amount, setAmount] = useState('')

  const destinations = useMemo(
    () => MARCO_WAVE1_ROUTES.filter((route) => route.from === source).map((route) => route.to),
    [source],
  )
  const activeDestination = destinations.includes(destination) ? destination : destinations[0]
  const route = getMarcoBridgeRoute(source, activeDestination)
  const sourceNetwork = getMarcoBridgeNetwork(source)
  const destinationNetwork = getMarcoBridgeNetwork(activeDestination)
  const sourceWallet = sourceNetwork.walletFamily === 'evm' ? (isConnected ? address : undefined) : solana.address
  const destinationValidation = validate(destinationWallet, destinationNetwork.walletFamily)
  const canonicalAmount = useMemo(() => {
    try {
      return canonicalizeBridgeAmount(amount, sourceNetwork.decimals, destinationNetwork.decimals)
    } catch {
      return undefined
    }
  }, [amount, sourceNetwork.decimals, destinationNetwork.decimals])
  const expectedReceive = canonicalAmount
    ? formatDecimalAmount(canonicalAmount.receiveLD, destinationNetwork.decimals)
    : '—'
  const wrongNetwork = sourceNetwork.walletFamily === 'evm' && Number(chainId) !== sourceNetwork.chainId

  const setConnectedDestination = async () => {
    if (destinationNetwork.walletFamily === 'evm' && address) setDestinationWallet(address)
    if (destinationNetwork.walletFamily === 'solana') {
      const next = solana.address ?? (await solana.connect())
      if (next) setDestinationWallet(next)
    }
  }
  const handleSourceChange = (next: MarcoBridgeNetworkId) => {
    const nextDestinations = MARCO_WAVE1_ROUTES.filter((candidate) => candidate.from === next).map(
      (candidate) => candidate.to,
    )
    setSource(next)
    setDestination(nextDestinations[0])
    setDestinationWallet('')
    setAmount('')
  }
  const renderCta = () => {
    if (sourceNetwork.walletFamily === 'evm' && !isConnected)
      return <ConnectWalletButton width="100%">Connect Wallet</ConnectWalletButton>
    if (sourceNetwork.walletFamily === 'solana' && !solana.address)
      return (
        <Button width="100%" onClick={() => solana.connect()}>
          Connect Solana Wallet
        </Button>
      )
    if (wrongNetwork && source === 'robinhood')
      return (
        <Button width="100%" disabled>
          Action Required · Robinhood Network Binding Pending
        </Button>
      )
    if (wrongNetwork)
      return (
        <Button
          width="100%"
          disabled={!sourceNetwork.chainId || isSwitching}
          onClick={() => sourceNetwork.chainId && switchNetworkAsync(sourceNetwork.chainId)}
        >
          {isSwitching ? 'Switching…' : 'Switch Network'}
        </Button>
      )
    if (!destinationValidation.valid)
      return (
        <Button width="100%" disabled>
          Connect Destination Wallet
        </Button>
      )
    if (!canonicalAmount)
      return (
        <Button width="100%" disabled>
          Enter Amount
        </Button>
      )
    return (
      <Button width="100%" disabled>
        Action Required · Activation Pending
      </Button>
    )
  }

  return (
    <Panel role="tabpanel" aria-label="MARCO Bridge">
      <Status>
        <span>Certified Wave-1 route</span>
        <strong>{MARCO_BRIDGE_PUBLIC_ACTIVATION_AUTHORIZED ? 'Live' : 'Activation pending'}</strong>
      </Status>
      <NetworkRow>
        <Field>
          From
          <Select value={source} onChange={(e) => handleSourceChange(e.target.value as MarcoBridgeNetworkId)}>
            {Object.values(MARCO_WAVE1_NETWORKS).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>
        <Direction aria-hidden>⇄</Direction>
        <Field>
          To
          <Select
            value={activeDestination}
            onChange={(e) => {
              setDestination(e.target.value as MarcoBridgeNetworkId)
              setDestinationWallet('')
            }}
          >
            {destinations.map((id) => (
              <option key={id} value={id}>
                {getMarcoBridgeNetwork(id).name}
              </option>
            ))}
          </Select>
        </Field>
      </NetworkRow>
      <WalletLine>
        <span>Source wallet</span>
        <strong>{shorten(sourceWallet)}</strong>
      </WalletLine>
      <Field>
        Destination wallet
        <Input
          aria-label="Destination wallet"
          $invalid={Boolean(destinationWallet && !destinationValidation.valid)}
          value={destinationWallet}
          placeholder={destinationNetwork.walletFamily === 'solana' ? 'Solana address' : '0x…'}
          onChange={(e) => setDestinationWallet(e.target.value.trim())}
        />
      </Field>
      <WalletActions>
        <Button
          scale="sm"
          variant="secondary"
          disabled={destinationNetwork.walletFamily === 'evm' && !address}
          onClick={setConnectedDestination}
        >
          Use connected destination wallet
        </Button>
      </WalletActions>
      {destinationWallet && !destinationValidation.valid ? <ErrorText>{destinationValidation.reason}</ErrorText> : null}
      {wrongNetwork && source === 'robinhood' ? (
        <ErrorText>
          Robinhood Chain remains fail-closed until its canonical wallet RPC binding is certified in Melega DEX.
        </ErrorText>
      ) : null}
      <Field>
        Amount · MARCO
        <AmountWrap>
          <Input
            aria-label="MARCO amount"
            inputMode="decimal"
            value={amount}
            placeholder="0.0"
            onChange={(e) => setAmount(e.target.value)}
          />
          <MaxButton disabled>MAX</MaxButton>
        </AmountWrap>
      </Field>
      <Metrics>
        <Metric>
          You receive<strong>{expectedReceive === '—' ? '—' : `${expectedReceive} MARCO`}</strong>
        </Metric>
        <Metric>
          Network fee<strong>Fresh quote required</strong>
        </Metric>
        <Metric>
          Delivery<strong>Tracked after source tx</strong>
        </Metric>
        <Metric>
          Route<strong>{route ? `${sourceNetwork.shortName} → ${destinationNetwork.shortName}` : 'Unsupported'}</strong>
        </Metric>
      </Metrics>
      {renderCta()}
      <BridgeDeliveryProgress />
      <Advanced>
        <summary>Advanced route details</summary>
        <p>
          Source EID {sourceNetwork.layerZeroEid} · Destination EID {destinationNetwork.layerZeroEid}
        </p>
        <p>Source identity: {sourceNetwork.identity.protocolContractOrStore}</p>
        <p>Destination identity: {destinationNetwork.identity.protocolContractOrStore}</p>
      </Advanced>
    </Panel>
  )
}
