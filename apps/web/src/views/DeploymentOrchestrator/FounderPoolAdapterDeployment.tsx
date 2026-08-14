import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useWalletChainId } from 'hooks/useWalletChainId'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  isAuthorizedMelegaDeployer,
} from 'lib/deployment-orchestrator/founderDeployer'
import {
  isUserRejectedError,
  resolveWalletProvider,
  walletEstimateDeployGas,
  walletEthCall,
  walletGetCode,
  walletGetTransactionReceipt,
  walletSendCallTransaction,
  walletSendDeployTransaction,
  type EthereumProvider,
} from 'lib/deployment-orchestrator/founderWalletTx'
import {
  LEGACY_SMARTCHEF_INIT_CODE_HASH,
  PUBLIC_POOL_ADAPTER_CHAIN_ID,
  PUBLIC_POOL_ADAPTER_LEGACY_FACTORY,
  PUBLIC_POOL_ADAPTER_MARCO,
  PUBLIC_POOL_ADAPTER_TREASURY,
  buildPublicPoolAdapterArtifactGate,
  decodeAdapterViewResult,
  decodeFactoryOwner,
  encodeAdapterViewCall,
  encodeFactoryOwnerCall,
  encodeFactoryTransferOwnership,
  isPublicPoolAdapterAddress,
  maskedPublicPoolAdapterRuntimeHash,
  validatePublicPoolAdapterState,
  type PublicPoolAdapterOnChainState,
} from 'lib/public-pool-adapter'

const STORAGE_KEY = 'melega.public-pool-adapter.founder-session.v1'

const Root = styled.main`
  width: min(940px, calc(100% - 32px));
  margin: 30px auto 70px;
  color: #f4f4f4;
`
const Header = styled.header`
  margin-bottom: 18px;
  h1 { margin: 0 0 8px; font-size: 30px; }
  p { margin: 0; color: #999; line-height: 1.55; }
`
const Banner = styled.div<{ $tone: 'ok' | 'warn' | 'bad' }>`
  margin-bottom: 14px;
  padding: 13px 15px;
  border: 1px solid ${({ $tone }) => ($tone === 'ok' ? '#168b58' : $tone === 'bad' ? '#9d3e3e' : '#8d7118')};
  border-radius: 12px;
  background: ${({ $tone }) => ($tone === 'ok' ? '#0d251b' : $tone === 'bad' ? '#2a1212' : '#251f0d')};
  color: ${({ $tone }) => ($tone === 'ok' ? '#35e895' : $tone === 'bad' ? '#ff9d9d' : '#f4c430')};
  font-weight: 700;
  line-height: 1.45;
`
const Card = styled.section`
  margin-top: 14px;
  padding: 18px;
  border: 1px solid #303030;
  border-radius: 14px;
  background: #111;
  h2 { margin: 0 0 12px; font-size: 19px; }
`
const Grid = styled.dl`
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 9px 14px;
  margin: 0;
  dt { color: #8e8e8e; }
  dd { margin: 0; word-break: break-all; }
  @media (max-width: 680px) { grid-template-columns: 1fr; gap: 4px; dd { margin-bottom: 8px; } }
`
const Review = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 16px;
  color: #d5d5d5;
  line-height: 1.45;
  input { margin-top: 3px; }
`
const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
`
const Button = styled.button<{ $primary?: boolean }>`
  min-height: 44px;
  padding: 0 17px;
  border: 1px solid ${({ $primary }) => ($primary ? '#947716' : '#3c3c3c')};
  border-radius: 11px;
  background: ${({ $primary }) => ($primary ? '#f4c430' : '#191919')};
  color: ${({ $primary }) => ($primary ? '#080808' : '#efefef')};
  font-weight: 800;
  cursor: pointer;
  &:disabled { cursor: not-allowed; opacity: 0.42; }
`
const Hash = styled.a`
  color: #f4c430;
  word-break: break-all;
`

type Phase = 'loading' | 'ready-deploy' | 'ready-activate' | 'active' | 'quarantined'

async function waitForReceipt(eth: EthereumProvider, txHash: string) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const receipt = await walletGetTransactionReceipt(eth, txHash)
    if (receipt) return receipt
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }
  throw new Error('Transaction confirmation timeout. The transaction may still be pending in the wallet.')
}

async function readAdapterState(eth: EthereumProvider, adapterAddress: string): Promise<PublicPoolAdapterOnChainState> {
  const fields = ['owner', 'smartChefFactory', 'marcoToken', 'treasury', 'smartChefInitCodeHash', 'creationPaused'] as const
  const results = await Promise.all(
    fields.map((field) => walletEthCall(eth, adapterAddress, encodeAdapterViewCall(field))),
  )
  return {
    owner: String(decodeAdapterViewResult('owner', results[0])),
    smartChefFactory: String(decodeAdapterViewResult('smartChefFactory', results[1])),
    marcoToken: String(decodeAdapterViewResult('marcoToken', results[2])),
    treasury: String(decodeAdapterViewResult('treasury', results[3])),
    smartChefInitCodeHash: String(decodeAdapterViewResult('smartChefInitCodeHash', results[4])),
    creationPaused: Boolean(decodeAdapterViewResult('creationPaused', results[5])),
  }
}

export default function FounderPoolAdapterDeployment() {
  const { address, isConnected, connector } = useAccount()
  const chainId = useWalletChainId()
  const artifact = useMemo(() => buildPublicPoolAdapterArtifactGate(), [])
  const [reviewed, setReviewed] = useState(false)
  const [phase, setPhase] = useState<Phase>('loading')
  const [note, setNote] = useState('Reading the production factory owner…')
  const [adapterAddress, setAdapterAddress] = useState<string | null>(null)
  const [deployTx, setDeployTx] = useState<string | null>(null)
  const [activationTx, setActivationTx] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const correctWallet = isAuthorizedMelegaDeployer(address)
  const correctChain = chainId === PUBLIC_POOL_ADAPTER_CHAIN_ID

  const provider = useCallback(async (): Promise<EthereumProvider> => {
    const preferred = (await connector?.getProvider?.()) as EthereumProvider | undefined
    const eth = resolveWalletProvider(preferred ?? null)
    if (!eth) throw new Error('Wallet provider unavailable')
    return eth
  }, [connector])

  const validateAdapter = useCallback(async (eth: EthereumProvider, candidate: string) => {
    const code = await walletGetCode(eth, candidate)
    if (!code || code === '0x') throw new Error('Adapter bytecode is missing')
    const runtimeHash = maskedPublicPoolAdapterRuntimeHash(code)
    if (runtimeHash.toLowerCase() !== artifact.expectedRuntimeBytecodeSha256.toLowerCase()) {
      throw new Error('Adapter runtime checksum mismatch — activation is blocked')
    }
    const state = await readAdapterState(eth, candidate)
    const reasons = validatePublicPoolAdapterState(state)
    if (reasons.length) throw new Error(reasons.join(' · '))
    return state
  }, [artifact.expectedRuntimeBytecodeSha256])

  const refresh = useCallback(async () => {
    if (!isConnected || !address) {
      setPhase('ready-deploy')
      setNote('Connect the authorized MELEGA DEPLOYER to continue.')
      return
    }
    if (!correctChain) {
      setPhase('ready-deploy')
      setNote('Switch the connected wallet to BNB Smart Chain (56).')
      return
    }
    try {
      const eth = await provider()
      const ownerRaw = await walletEthCall(eth, PUBLIC_POOL_ADAPTER_LEGACY_FACTORY, encodeFactoryOwnerCall())
      const factoryOwner = decodeFactoryOwner(ownerRaw)

      if (factoryOwner.toLowerCase() !== AUTHORIZED_MELEGA_DEPLOYER.toLowerCase()) {
        await validateAdapter(eth, factoryOwner)
        setAdapterAddress(factoryOwner)
        setPhase('active')
        setNote('Adapter ACTIVE. Legacy factory ownership and adapter runtime are validated on-chain.')
        return
      }

      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as { adapterAddress?: string; deployTx?: string }
          if (isPublicPoolAdapterAddress(parsed.adapterAddress)) {
            await validateAdapter(eth, parsed.adapterAddress)
            setAdapterAddress(parsed.adapterAddress)
            setDeployTx(parsed.deployTx || null)
            setPhase('ready-activate')
            setNote('Adapter validated. Review and sign the legacy-factory ownership transfer.')
            return
          }
        } catch {
          // A stale local session is not an on-chain security failure. Discard it
          // and allow a fresh, separately validated deployment.
          window.localStorage.removeItem(STORAGE_KEY)
        }
      }

      setPhase('ready-deploy')
      setNote('Legacy factory is still owned by MELEGA DEPLOYER. Adapter deployment is ready for review.')
    } catch (error) {
      setPhase('quarantined')
      setNote(error instanceof Error ? error.message : 'Protected deployment validation failed')
    }
  }, [address, correctChain, isConnected, provider, validateAdapter])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const deploy = useCallback(async () => {
    if (!address || !artifact.deploymentData) return
    setPending(true)
    setNote('Estimating deployment gas…')
    try {
      const eth = await provider()
      const gas = await walletEstimateDeployGas(eth, address, artifact.deploymentData)
      setNote('Confirm the adapter deployment in the connected wallet.')
      const txHash = await walletSendDeployTransaction(
        eth,
        address,
        artifact.deploymentData,
        gas + (gas / BigInt(5)),
      )
      setDeployTx(txHash)
      setNote('Deployment submitted. Waiting for on-chain validation…')
      const receipt = await waitForReceipt(eth, txHash)
      if (receipt.status !== '0x1' && receipt.status !== 1 && receipt.status !== '1') {
        throw new Error('Adapter deployment transaction failed')
      }
      const candidate = receipt.contractAddress
      if (!isPublicPoolAdapterAddress(candidate)) throw new Error('Deployment receipt has no contract address')
      await validateAdapter(eth, candidate)
      setAdapterAddress(candidate)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ adapterAddress: candidate, deployTx: txHash }))
      setReviewed(false)
      setPhase('ready-activate')
      setNote('Adapter bytecode and constructor state validated. The second signature can now activate it.')
    } catch (error) {
      if (isUserRejectedError(error)) {
        setPhase('ready-deploy')
        setNote('Deployment signature cancelled. No transaction was sent.')
      } else {
        setPhase('quarantined')
        setNote(error instanceof Error ? error.message : 'Deployment failed')
      }
    } finally {
      setPending(false)
    }
  }, [address, artifact.deploymentData, provider, validateAdapter])

  const activate = useCallback(async () => {
    if (!address || !adapterAddress) return
    setPending(true)
    setNote('Confirm the legacy-factory ownership transfer in the connected wallet.')
    try {
      const eth = await provider()
      const data = encodeFactoryTransferOwnership(adapterAddress)
      const estimateRaw = await eth.request({
        method: 'eth_estimateGas',
        params: [{ from: address, to: PUBLIC_POOL_ADAPTER_LEGACY_FACTORY, data, value: '0x0' }],
      })
      const estimate = typeof estimateRaw === 'string' ? BigInt(estimateRaw) : null
      const txHash = await walletSendCallTransaction(eth, {
        from: address,
        to: PUBLIC_POOL_ADAPTER_LEGACY_FACTORY,
        data,
        gasUnits: estimate ? estimate + (estimate / BigInt(5)) : null,
      })
      setActivationTx(txHash)
      setNote('Activation submitted. Verifying production factory ownership…')
      const receipt = await waitForReceipt(eth, txHash)
      if (receipt.status !== '0x1' && receipt.status !== 1 && receipt.status !== '1') {
        throw new Error('Factory ownership transfer failed')
      }
      const ownerRaw = await walletEthCall(eth, PUBLIC_POOL_ADAPTER_LEGACY_FACTORY, encodeFactoryOwnerCall())
      const owner = decodeFactoryOwner(ownerRaw)
      if (owner.toLowerCase() !== adapterAddress.toLowerCase()) {
        throw new Error('Factory owner does not match the validated adapter')
      }
      await validateAdapter(eth, adapterAddress)
      setPhase('active')
      setReviewed(false)
      setNote('Adapter ACTIVE. Non-MARCO reward pools are permissionless; MARCO reward pools remain owner-only.')
    } catch (error) {
      if (isUserRejectedError(error)) {
        setPhase('ready-activate')
        setNote('Activation signature cancelled. The production factory was not changed.')
      } else {
        setPhase('quarantined')
        setNote(error instanceof Error ? error.message : 'Activation failed')
      }
    } finally {
      setPending(false)
    }
  }, [adapterAddress, address, provider, validateAdapter])

  const tone: 'ok' | 'warn' | 'bad' = phase === 'active' ? 'ok' : phase === 'quarantined' ? 'bad' : 'warn'
  const deployEnabled = phase === 'ready-deploy' && artifact.ok && correctWallet && correctChain && reviewed && !pending
  const activateEnabled = phase === 'ready-activate' && correctWallet && correctChain && reviewed && !pending

  return (
    <Root data-protected-pool-adapter-deployment>
      <Header>
        <h1>Protected Pool Adapter Deployment</h1>
        <p>Two explicit MELEGA DEPLOYER signatures. No private key, server signer, KMS or automatic broadcast.</p>
      </Header>

      <Banner $tone={tone}>{note}</Banner>
      {!isConnected ? <ConnectWalletButton>Connect MELEGA DEPLOYER</ConnectWalletButton> : null}

      <Card>
        <h2>Certified deployment package</h2>
        <Grid>
          <dt>Authorized signer</dt><dd>{AUTHORIZED_MELEGA_DEPLOYER}</dd>
          <dt>Connected wallet</dt><dd>{address || 'Not connected'}</dd>
          <dt>Chain</dt><dd>{chainId ?? 'Unavailable'} · required 56</dd>
          <dt>Legacy factory</dt><dd>{PUBLIC_POOL_ADAPTER_LEGACY_FACTORY}</dd>
          <dt>MARCO reward policy</dt><dd>Owner-only</dd>
          <dt>Other rewards</dt><dd>Permissionless · atomic reward funding</dd>
          <dt>Treasury</dt><dd>{PUBLIC_POOL_ADAPTER_TREASURY}</dd>
          <dt>MARCO token</dt><dd>{PUBLIC_POOL_ADAPTER_MARCO}</dd>
          <dt>SmartChef init-code hash</dt><dd>{LEGACY_SMARTCHEF_INIT_CODE_HASH}</dd>
          <dt>Creation bytecode SHA-256</dt><dd>{artifact.creationBytecodeSha256}</dd>
          <dt>Adapter address</dt><dd>{adapterAddress || 'Created after signature 1'}</dd>
        </Grid>
        {!artifact.ok ? <Banner $tone="bad">{artifact.reasons.join(' · ')}</Banner> : null}
      </Card>

      <Card>
        <h2>{phase === 'ready-activate' ? 'Signature 2 · Activate adapter' : 'Signature 1 · Deploy adapter'}</h2>
        <p>
          {phase === 'ready-activate'
            ? 'Transfers only the legacy SmartChefFactory ownership to the already validated adapter. The adapter includes a Founder-only rollback function.'
            : 'Deploys the certified adapter. This first transaction does not change the production factory.'}
        </p>
        <Review>
          <input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} />
          <span>I verified signer, chain, production factory, MARCO restriction, treasury and certified checksum.</span>
        </Review>
        <Actions>
          {phase === 'ready-activate' ? (
            <Button $primary disabled={!activateEnabled} onClick={() => void activate()}>
              {pending ? 'Waiting for wallet…' : 'Sign activation'}
            </Button>
          ) : (
            <Button $primary disabled={!deployEnabled} onClick={() => void deploy()}>
              {pending ? 'Waiting for wallet…' : 'Sign adapter deployment'}
            </Button>
          )}
          <Button disabled={pending} onClick={() => void refresh()}>Refresh on-chain state</Button>
        </Actions>
        {deployTx ? <p>Deploy tx · <Hash href={`https://bscscan.com/tx/${deployTx}`} target="_blank" rel="noreferrer">{deployTx}</Hash></p> : null}
        {activationTx ? <p>Activation tx · <Hash href={`https://bscscan.com/tx/${activationTx}`} target="_blank" rel="noreferrer">{activationTx}</Hash></p> : null}
      </Card>
    </Root>
  )
}
