import styled from 'styled-components'
import { useTestnetLiquidityRuntime } from './useTestnetLiquidityRuntime'
import { BSC_TESTNET_ADDRESSES } from 'config/constants/bscTestnet'
import { getAddressExplorerUrl, getTxExplorerUrl } from 'utils/blockExplorer'
import { TESTNET_LIQUIDITY_CHAIN_ID } from './testnetLiquidityConfig'
import { formatUnits } from '@ethersproject/units'

const Page = styled.div`
  min-height: 80vh;
  display: flex;
  justify-content: center;
  padding: 48px 16px 80px;
  background: #0a0a0a;
  color: #f5f5f5;
`

const Card = styled.div`
  width: 100%;
  max-width: 600px;
`

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0 0 8px;
`

const Subtitle = styled.p`
  font-size: 14px;
  color: #9a9a9a;
  margin: 0 0 32px;
`

const Section = styled.section`
  margin-bottom: 28px;
  padding-bottom: 28px;
  border-bottom: 1px solid #222;
`

const SectionLabel = styled.div`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #777;
  margin-bottom: 12px;
`

const Badge = styled.span`
  display: inline-block;
  background: #0d3d24;
  color: #4ade80;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #166534;
`

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`

const Label = styled.label`
  font-size: 13px;
  color: #aaa;
`

const Select = styled.select`
  width: 100%;
  font-size: 16px;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid #333;
  background: #141414;
  color: #fff;
`

const Input = styled.input`
  width: 100%;
  font-size: 18px;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid #333;
  background: #141414;
  color: #fff;
  box-sizing: border-box;
`

const Mono = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: #888;
  word-break: break-all;
`

const Ratio = styled.div`
  font-size: 15px;
  color: #d4af37;
  margin-top: 8px;
`

const ActionButton = styled.button<{ $primary?: boolean }>`
  width: 100%;
  font-size: 17px;
  font-weight: 600;
  padding: 16px 20px;
  margin-bottom: 12px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background: ${({ $primary, disabled }) => (disabled ? '#2a2a2a' : $primary ? '#d4af37' : '#1f1f1f')};
  color: ${({ $primary, disabled }) => (disabled ? '#666' : $primary ? '#0a0a0a' : '#f5f5f5')};
  border: 1px solid ${({ disabled }) => (disabled ? '#333' : '#444')};

  &:disabled {
    cursor: not-allowed;
  }
`

const Arrow = styled.div`
  text-align: center;
  color: #555;
  font-size: 18px;
  margin: 4px 0;
`

const RuntimeGrid = styled.div`
  display: grid;
  gap: 10px;
  font-size: 13px;
`

const RuntimeRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  span:first-child {
    color: #777;
  }
  span:last-child {
    font-family: ui-monospace, monospace;
    font-size: 11px;
    text-align: right;
    word-break: break-all;
  }
`

const ResultBox = styled.div`
  background: #111;
  border: 1px solid #2a2a2a;
  border-radius: 10px;
  padding: 16px;
  margin-top: 16px;
  font-size: 13px;
`

const ErrorText = styled.div`
  color: #f87171;
  font-size: 14px;
  margin: 12px 0;
`

const WarnText = styled.div`
  color: #fbbf24;
  font-size: 14px;
  margin-bottom: 16px;
`

const Link = styled.a`
  color: #d4af37;
  text-decoration: underline;
`

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export default function TestnetLiquidityScreen() {
  const r = useTestnetLiquidityRuntime()

  return (
    <Page>
      <Card>
        <Title>Testnet Liquidity</Title>
        <Subtitle>Founder MVP — MARCO / WBNB pool for Smart Router validation (chain 97 only)</Subtitle>

        {!r.isOnTestnet && (
          <WarnText>
            This page is only available on BNB Testnet (chain 97). Switch your wallet to BNB Testnet to execute
            transactions.
          </WarnText>
        )}

        <Section>
          <SectionLabel>Network</SectionLabel>
          <Badge>BNB Testnet</Badge>
          <Mono style={{ marginTop: 12 }}>chainId: {TESTNET_LIQUIDITY_CHAIN_ID}</Mono>
          {!r.account && <WarnText style={{ marginTop: 12 }}>Connect wallet to execute.</WarnText>}
        </Section>

        <Section>
          <SectionLabel>Runtime</SectionLabel>
          <RuntimeGrid>
            <RuntimeRow>
              <span>Router</span>
              <span>{shortAddr(r.runtime.router)}</span>
            </RuntimeRow>
            <RuntimeRow>
              <span>Factory</span>
              <span>{shortAddr(r.runtime.factory)}</span>
            </RuntimeRow>
            <RuntimeRow>
              <span>Pair</span>
              <span>{r.pairAddress ? shortAddr(r.pairAddress) : 'Not created'}</span>
            </RuntimeRow>
            <RuntimeRow>
              <span>Status</span>
              <span>{r.statusLabel}</span>
            </RuntimeRow>
            <RuntimeRow>
              <span>Treasury Intake</span>
              <span>{shortAddr(r.runtime.treasuryIntake)}</span>
            </RuntimeRow>
            <RuntimeRow>
              <span>Wrapper</span>
              <span>{r.runtime.wrapper ?? 'Not deployed'}</span>
            </RuntimeRow>
          </RuntimeGrid>
        </Section>

        <Section>
          <SectionLabel>Token A</SectionLabel>
          <Row>
            <Select value={r.tokenA.id} onChange={(e) => r.setTokenAId(e.target.value)}>
              {r.tokenOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.symbol}
                </option>
              ))}
            </Select>
            <Mono>{r.tokenA.address}</Mono>
          </Row>
        </Section>

        <Section>
          <SectionLabel>Token B</SectionLabel>
          <Row>
            <Select value={r.tokenB.id} onChange={(e) => r.setTokenBId(e.target.value)}>
              {r.tokenOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.symbol}
                </option>
              ))}
            </Select>
            <Mono>{r.tokenB.isNative ? BSC_TESTNET_ADDRESSES.wbnb : r.tokenB.address} (native tBNB when WBNB)</Mono>
          </Row>
        </Section>

        <Section>
          <SectionLabel>Amounts</SectionLabel>
          <Row>
            <Label>{r.tokenA.symbol} amount</Label>
            <Input value={r.amountA} onChange={(e) => r.setAmountA(e.target.value)} inputMode="decimal" />
          </Row>
          <Row>
            <Label>{r.tokenB.symbol} amount</Label>
            <Input value={r.amountB} onChange={(e) => r.setAmountB(e.target.value)} inputMode="decimal" />
          </Row>
          <Ratio>{r.ratioPreview}</Ratio>
        </Section>

        <Section>
          <SectionLabel>Actions</SectionLabel>
          {r.errorMessage && <ErrorText>{r.errorMessage}</ErrorText>}

          <ActionButton
            $primary
            disabled={!r.canApprove}
            onClick={r.onApproveMarco}
            type="button"
          >
            {r.pendingPhase === 'approve' ? 'Approving MARCO…' : 'Approve MARCO'}
          </ActionButton>

          {r.showCreatePair && (
            <>
              <Arrow>↓</Arrow>
              <ActionButton
                disabled={!r.canCreatePair}
                onClick={r.onCreatePair}
                type="button"
              >
                {r.pendingPhase === 'create_pair' ? 'Creating pair…' : 'Create Pair'}
              </ActionButton>
            </>
          )}

          <Arrow>↓</Arrow>
          <ActionButton
            $primary
            disabled={!r.canAddLiquidity}
            onClick={r.onAddLiquidity}
            type="button"
          >
            {r.pendingPhase === 'add_liquidity' ? 'Adding liquidity…' : 'Add Liquidity'}
          </ActionButton>
        </Section>

        {(r.liquiditySuccess || r.liquidityTxHash || r.createPairTxHash) && (
          <Section>
            <SectionLabel>Result</SectionLabel>
            <ResultBox>
              {r.pairAddress && (
                <div>
                  Pair:{' '}
                  <Link href={getAddressExplorerUrl(r.pairAddress, TESTNET_LIQUIDITY_CHAIN_ID)} target="_blank" rel="noreferrer">
                    {r.pairAddress}
                  </Link>
                </div>
              )}
              {r.lpBalance && (
                <div style={{ marginTop: 8 }}>LP balance: {formatUnits(r.lpBalance, 18)}</div>
              )}
              {r.reservesFormatted && (
                <div style={{ marginTop: 8 }}>
                  Reserves: {formatUnits(r.reservesFormatted.reserve0, 18)} / {formatUnits(r.reservesFormatted.reserve1, 18)}
                </div>
              )}
              {r.createPairTxHash && (
                <div style={{ marginTop: 8 }}>
                  Create pair tx:{' '}
                  <Link href={getTxExplorerUrl(r.createPairTxHash, TESTNET_LIQUIDITY_CHAIN_ID)} target="_blank" rel="noreferrer">
                    {shortAddr(r.createPairTxHash)}
                  </Link>
                </div>
              )}
              {r.liquidityTxHash && (
                <div style={{ marginTop: 8 }}>
                  Add liquidity tx:{' '}
                  <Link href={getTxExplorerUrl(r.liquidityTxHash, TESTNET_LIQUIDITY_CHAIN_ID)} target="_blank" rel="noreferrer">
                    {shortAddr(r.liquidityTxHash)}
                  </Link>
                </div>
              )}
            </ResultBox>
          </Section>
        )}
      </Card>
    </Page>
  )
}
