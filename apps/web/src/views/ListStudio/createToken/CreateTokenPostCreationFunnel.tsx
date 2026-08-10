/**
 * Post-token-creation public funnel — success + next product actions.
 * Presentation only. No Featured / Trend Boost / checkout here.
 */
import React, { useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { uxRebuildColors, uxRebuildFont } from 'design-system/melega/tokens/uxRebuild'
import { CLAIM_PROJECT_HREF } from 'views/ProjectsStudio/components/ProjectsStudioPageHeader'
import type { CreateTokenSuccessModel, FunnelMetricStatus } from './createTokenPostCreationTypes'

const gold = uxRebuildColors.gold
const line = 'rgba(255,255,255,0.1)'

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
  font-family: ${uxRebuildFont};
  color: #f5f5f5;
`

const SuccessCard = styled.section`
  padding: 20px 18px;
  border-radius: 16px;
  border: 1px solid rgba(221, 185, 47, 0.28);
  background:
    radial-gradient(ellipse 70% 80% at 12% 0%, rgba(221, 185, 47, 0.12), transparent 55%),
    linear-gradient(165deg, rgba(22, 20, 12, 0.98), rgba(12, 12, 12, 0.98));
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const Eyebrow = styled.div`
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${gold};
`

const Title = styled.h3`
  margin: 0;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #fff;
`

const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`

const IdentityText = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const TokenName = styled.div`
  font-size: 16px;
  font-weight: 750;
  color: #fff;
`

const TokenMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
`

const ContractRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${line};
  background: rgba(0, 0, 0, 0.28);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  word-break: break-all;
`

const StatusPill = styled.span<{ $tone: FunnelMetricStatus }>`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.04em;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'LOCKED'
        ? 'rgba(255,255,255,0.12)'
        : $tone === 'PENDING'
          ? 'rgba(251,191,36,0.35)'
          : 'rgba(34,197,94,0.35)'};
  color: ${({ $tone }) =>
    $tone === 'LOCKED' ? 'rgba(255,255,255,0.55)' : $tone === 'PENDING' ? '#fbbf24' : '#86efac'};
  background: rgba(255, 255, 255, 0.03);
`

const CopyBtn = styled.button`
  appearance: none;
  cursor: pointer;
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(221, 185, 47, 0.35);
  background: rgba(221, 185, 47, 0.12);
  color: ${gold};
  font-size: 11px;
  font-weight: 700;
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const SectionTitle = styled.h4`
  margin: 4px 0 0;
  font-size: 14px;
  font-weight: 750;
  color: rgba(255, 255, 255, 0.88);
`

const Cards = styled.div`
  display: grid;
  gap: 12px;
`

const ActionCard = styled.article<{ $locked?: boolean }>`
  padding: 16px;
  border-radius: 14px;
  border: 1px solid ${({ $locked }) => ($locked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $locked }) => ($locked ? 'rgba(14,14,14,0.7)' : 'rgba(18,18,18,0.95)')};
  opacity: ${({ $locked }) => ($locked ? 0.72 : 1)};
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`

const CardTitle = styled.h5`
  margin: 0;
  font-size: 15px;
  font-weight: 750;
  color: #fff;
`

const CardDesc = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.62);
`

const CardActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 2px;
`

const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  background: linear-gradient(180deg, #f2c84c 0%, #d4a017 100%);
  color: #111;
  font-size: 13px;
  font-weight: 750;
  text-decoration: none;
`

const SecondaryBtn = styled.button`
  appearance: none;
  cursor: pointer;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  font-size: 13px;
  font-weight: 650;
`

const LockedNote = styled.p`
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
`

const ExternalBox = styled.div`
  margin-top: 4px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid ${line};
  background: rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
`

const ExternalLink = styled.a`
  color: ${gold};
  font-weight: 650;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`

function shorten(addr: string): string {
  if (addr.length < 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function melegaAddLiquidityHref(chainId: number, tokenAddress: string | null): string {
  const base = `/liquidity-studio?view=add&chain=${chainId}`
  if (tokenAddress && /^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
    return `${base}&currency=${encodeURIComponent(tokenAddress)}`
  }
  return base
}

function claimProjectHref(tokenAddress: string | null): string {
  if (tokenAddress && /^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
    return `${CLAIM_PROJECT_HREF}&contract=${encodeURIComponent(tokenAddress)}`
  }
  return CLAIM_PROJECT_HREF
}

export const CreateTokenPostCreationFunnel: React.FC<{
  model: CreateTokenSuccessModel
}> = ({ model }) => {
  const [copied, setCopied] = useState(false)
  const [showExternalLp, setShowExternalLp] = useState(false)
  const hasContract = Boolean(model.contractAddress && /^0x[a-fA-F0-9]{40}$/.test(model.contractAddress))

  const onCopy = async () => {
    if (!model.contractAddress) return
    try {
      await navigator.clipboard?.writeText(model.contractAddress)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Root data-testid="create-token-post-creation-funnel" data-post-create-funnel="v1">
      <SuccessCard data-testid="create-token-success">
        <Eyebrow>Token created</Eyebrow>
        <Title>Your token has been created</Title>
        <Identity>
          <MelegaTokenAvatar
            name={model.name}
            symbol={model.symbol}
            address={model.contractAddress ?? undefined}
            chainId={model.chainId}
            logoURI={model.logoUrl || undefined}
            size={48}
            radius="circle"
          />
          <IdentityText>
            <TokenName>{model.name || '—'}</TokenName>
            <TokenMeta>
              <span>{model.symbol || '—'}</span>
              <MelegaExploreChainBadge chainId={model.chainId} />
              <StatusPill $tone={model.contractStatus} data-testid="create-token-contract-status">
                {model.contractStatus}
              </StatusPill>
            </TokenMeta>
          </IdentityText>
        </Identity>
        <ContractRow data-testid="create-token-contract-row">
          <span>
            Contract{' '}
            <strong>
              {hasContract && model.contractAddress ? shorten(model.contractAddress) : 'Pending confirmation'}
            </strong>
          </span>
          <CopyBtn
            type="button"
            disabled={!hasContract}
            onClick={() => void onCopy()}
            data-testid="create-token-copy-contract"
          >
            {copied ? 'Copied' : 'Copy contract'}
          </CopyBtn>
        </ContractRow>
      </SuccessCard>

      <SectionTitle>Next actions</SectionTitle>
      <Cards>
        <ActionCard data-testid="create-token-next-add-liquidity">
          <CardTitle>Add Liquidity</CardTitle>
          <CardDesc>Create the first market for your token.</CardDesc>
          <CardActions>
            <PrimaryLink
              href={melegaAddLiquidityHref(model.chainId, model.contractAddress)}
              data-testid="create-token-add-liquidity-melega"
            >
              Add Liquidity on Melega DEX
            </PrimaryLink>
            <SecondaryBtn
              type="button"
              onClick={() => setShowExternalLp((v) => !v)}
              data-testid="create-token-add-liquidity-external"
            >
              Use another liquidity provider
            </SecondaryBtn>
          </CardActions>
          {showExternalLp ? (
            <ExternalBox data-testid="create-token-external-lp">
              <span>External providers are outside Melega DEX. You leave this product surface.</span>
              <ExternalLink
                href={
                  hasContract && model.contractAddress
                    ? `https://pancakeswap.finance/add/${model.contractAddress}/BNB`
                    : 'https://pancakeswap.finance/liquidity'
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Open PancakeSwap liquidity ↗
              </ExternalLink>
            </ExternalBox>
          ) : null}
        </ActionCard>

        <ActionCard data-testid="create-token-next-claim-project">
          <CardTitle>Create Your Project Page</CardTitle>
          <CardDesc>Claim your project identity and unlock discovery features.</CardDesc>
          <CardActions>
            <PrimaryLink href={claimProjectHref(model.contractAddress)} data-testid="create-token-claim-project">
              Claim Project Page
            </PrimaryLink>
          </CardActions>
        </ActionCard>

        <ActionCard $locked data-testid="create-token-next-community" data-status="LOCKED">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
            <CardTitle>Launch Your Community</CardTitle>
            <StatusPill $tone="LOCKED">LOCKED</StatusPill>
          </div>
          <CardDesc>After your project page is active, unlock discovery and promotion tools.</CardDesc>
          <LockedNote>
            Grow Your Project unlocks commercial visibility tools only after your project page is claimed.
          </LockedNote>
        </ActionCard>
      </Cards>
    </Root>
  )
}

export default CreateTokenPostCreationFunnel
