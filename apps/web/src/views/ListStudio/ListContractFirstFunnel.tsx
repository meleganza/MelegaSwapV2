import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { ArrowRight, Check, FileSearch, Plus, Rocket, Sparkles } from 'lucide-react'
import { useListIntent } from './useListIntent'

type Detection = {
  tier: 'canonical' | 'pending'
  listedOnDex: boolean
  projectClaimed: boolean
  slug?: string | null
  name?: string | null
  symbol?: string | null
  logo?: string | null
  contract: string
  chainId: number
}

const NETWORKS = [
  { id: 56, label: 'BNB Chain' },
  { id: 8453, label: 'Base' },
  { id: 1, label: 'Ethereum' },
  { id: 137, label: 'Polygon' },
]

const Shell = styled.section`
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(244, 196, 48, 0.2);
  border-radius: 22px;
  background: radial-gradient(circle at 78% 20%, rgba(244, 196, 48, 0.14), transparent 34%),
    linear-gradient(145deg, rgba(17, 17, 15, 0.98), rgba(7, 7, 7, 0.99));
  padding: clamp(22px, 4vw, 52px);
  min-height: 430px;

  &::after {
    content: '';
    position: absolute;
    width: 420px;
    height: 420px;
    right: -180px;
    top: -210px;
    border: 1px solid rgba(244, 196, 48, 0.12);
    border-radius: 50%;
    pointer-events: none;
  }
`

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #f2c84c;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

const Head = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
`

const Title = styled.h1`
  margin: 18px 0 0;
  max-width: 720px;
  color: #fff;
  font-size: clamp(34px, 5vw, 62px);
  line-height: 0.98;
  letter-spacing: -0.045em;
  font-weight: 760;

  span {
    color: #f2c84c;
  }
`

const Description = styled.p`
  margin: 16px 0 0;
  max-width: 620px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 15px;
  line-height: 1.55;
`

const Finder = styled.div`
  position: relative;
  z-index: 1;
  margin-top: 30px;
  padding: 10px;
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr) auto;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 15px;
  background: rgba(0, 0, 0, 0.42);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.32);

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

const control = `
  width: 100%;
  min-height: 50px;
  border-radius: 11px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.04);
  color: #fff;
  font: inherit;
  outline: none;
  &:focus { border-color: rgba(244,196,48,.55); }
`

const Select = styled.select`
  ${control};
  padding: 0 12px;
`
const Input = styled.input`
  ${control};
  padding: 0 15px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
`

const Primary = styled.button`
  min-height: 50px;
  padding: 0 20px;
  border: 0;
  border-radius: 11px;
  background: linear-gradient(180deg, #f7cf43, #dda916);
  color: #0a0a0a;
  font-weight: 850;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const Secondary = styled.button`
  min-height: 44px;
  padding: 0 15px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.025);
  color: #fff;
  font-weight: 750;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`

const Under = styled.div`
  position: relative;
  z-index: 1;
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;

  @media (max-width: 640px) {
    align-items: stretch;
    flex-direction: column;
  }
`

const Result = styled.div`
  position: relative;
  z-index: 1;
  margin-top: 18px;
  padding: 18px;
  border: 1px solid rgba(244, 196, 48, 0.22);
  border-radius: 15px;
  background: rgba(244, 196, 48, 0.045);
`

const ResultHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 640px) {
    align-items: stretch;
    flex-direction: column;
  }
`

const Token = styled.div`
  min-width: 0;
  strong {
    color: #fff;
    font-size: 18px;
  }
  span {
    display: block;
    margin-top: 4px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
  }
`

const Path = styled.div`
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr 1fr;
  }
`

const Step = styled.div<{ $active?: boolean; $done?: boolean }>`
  min-height: 68px;
  padding: 10px 11px;
  border: 1px solid
    ${({ $active, $done }) =>
      $active ? 'rgba(244,196,48,.55)' : $done ? 'rgba(45,212,145,.28)' : 'rgba(255,255,255,.08)'};
  border-radius: 11px;
  background: ${({ $active }) => ($active ? 'rgba(244,196,48,.08)' : 'rgba(255,255,255,.02)')};
  color: ${({ $active, $done }) => ($active ? '#f2c84c' : $done ? '#52dc9d' : 'rgba(255,255,255,.62)')};
  font-size: 11px;
  font-weight: 750;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;

  small {
    color: rgba(255, 255, 255, 0.35);
    font-weight: 600;
  }
`

const ErrorLine = styled.div`
  position: relative;
  z-index: 1;
  margin-top: 10px;
  color: #ff7d82;
  font-size: 12px;
`

export const ListContractFirstFunnel: React.FC = () => {
  const router = useRouter()
  const { setListIntent } = useListIntent()
  const [contract, setContract] = useState('')
  const [chainId, setChainId] = useState(56)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detected, setDetected] = useState<Detection | null>(null)
  const valid = /^0x[a-fA-F0-9]{40}$/.test(contract.trim())

  const selectedNetwork = useMemo(() => NETWORKS.find((network) => network.id === chainId), [chainId])

  useEffect(() => {
    const onPublished = (event: Event) => {
      const detail = (event as CustomEvent<{ chainId: number; contract: string; slug: string }>).detail
      if (!detail) return
      setDetected((current) => {
        if (!current) return current
        if (current.chainId !== detail.chainId || current.contract.toLowerCase() !== detail.contract.toLowerCase()) {
          return current
        }
        return { ...current, projectClaimed: true, slug: detail.slug }
      })
    }
    window.addEventListener('melega:project-claim-published', onPublished)
    return () => window.removeEventListener('melega:project-claim-published', onPublished)
  }, [])

  const analyze = async () => {
    if (!valid || loading) return
    setLoading(true)
    setError(null)
    setDetected(null)
    try {
      const response = await fetch('/api/registry/projects/onboard', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contract: contract.trim(), chainId }),
      })
      const payload = await response.json()
      if (!response.ok || !payload?.ok) throw new Error(payload?.reason || 'Token detection failed.')
      const canonical = payload.tier === 'canonical'
      setDetected({
        tier: canonical ? 'canonical' : 'pending',
        listedOnDex: canonical || Boolean(payload.dex?.listed),
        projectClaimed: canonical || Boolean(payload.dex?.projectClaimed),
        slug: canonical ? payload.project?.slug ?? null : payload.dex?.registrySlug ?? null,
        name: canonical ? payload.project?.displayName : payload.dex?.name ?? payload.onChain?.name,
        symbol: canonical
          ? payload.project?.resources?.tokens?.find((token: { chainId?: number }) => token.chainId === chainId)?.symbol
          : payload.dex?.symbol ?? payload.onChain?.symbol,
        logo: payload.dex?.logo ?? null,
        contract: contract.trim(),
        chainId,
      })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Token detection failed.')
    } finally {
      setLoading(false)
    }
  }

  const openDetectedFlow = () => {
    if (!detected) return
    if (detected.projectClaimed && detected.slug) {
      void router.push(`/@${detected.slug}/`)
      return
    }
    const intent = detected.listedOnDex ? 'claim-project' : 'import-token'
    void router.push(
      {
        pathname: '/list',
        query: {
          intent,
          contract: detected.contract,
          chain: String(detected.chainId),
          ...(detected.slug ? { slug: detected.slug } : {}),
          ...(detected.name ? { name: detected.name } : {}),
          ...(detected.symbol ? { symbol: detected.symbol } : {}),
          ...(detected.logo ? { logo: detected.logo } : {}),
          journey: 'listing',
          ...(detected.listedOnDex ? { listed: '1', liquidity: 'confirmed' } : {}),
        },
      },
      undefined,
      { shallow: true, scroll: false },
    )
  }

  return (
    <Shell data-testid="list-contract-first" data-list-concept="list-your-project">
      <Head>
        <div>
          <Eyebrow>
            <Sparkles size={14} /> List your project
          </Eyebrow>
          <Title>
            Bring your token.
            <br />
            <span>Grow your project.</span>
          </Title>
          <Description>
            Paste the contract once. Melega detects the token and keeps liquidity, Project Page setup and visibility
            in one guided flow.
          </Description>
        </div>
      </Head>

      <Finder>
        <Select value={chainId} onChange={(event) => setChainId(Number(event.target.value))} aria-label="Network">
          {NETWORKS.map((network) => (
            <option key={network.id} value={network.id}>
              {network.label}
            </option>
          ))}
        </Select>
        <Input
          value={contract}
          onChange={(event) => {
            setContract(event.target.value)
            setDetected(null)
            setError(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void analyze()
          }}
          placeholder="Paste token contract address (0x…)"
          aria-label="Token contract address"
          autoComplete="off"
        />
        <Primary type="button" disabled={!valid || loading} onClick={() => void analyze()}>
          <FileSearch size={17} /> {loading ? 'Detecting…' : 'Detect token'}
        </Primary>
      </Finder>

      <Under>
        <span>Network: {selectedNetwork?.label}. On-chain identity and Melega registry are checked automatically.</span>
        <Secondary type="button" onClick={() => setListIntent('create-token')}>
          <Plus size={16} /> Create a new token
        </Secondary>
      </Under>

      {error ? <ErrorLine role="alert">{error}</ErrorLine> : null}

      {detected ? (
        <Result data-testid="list-adaptive-result" data-detection-tier={detected.tier}>
          <ResultHead>
            <Token>
              <strong>
                {detected.name || detected.symbol || 'Token detected'}
                {detected.symbol ? ` · ${detected.symbol}` : ''}
              </strong>
              <span>{detected.listedOnDex ? 'Already listed on Melega DEX' : 'Deployed token · setup required'}</span>
            </Token>
            <Primary type="button" onClick={openDetectedFlow}>
              {detected.projectClaimed
                ? 'Open project page'
                : detected.listedOnDex
                ? 'Claim project page'
                : 'Continue setup'}{' '}
              <ArrowRight size={17} />
            </Primary>
          </ResultHead>
          <Path aria-label="Adaptive listing path">
            <Step $done>
              <Check size={16} /> Token detected
              <small>Identity imported</small>
            </Step>
            <Step $active={!detected.listedOnDex} $done={detected.listedOnDex}>
              {detected.listedOnDex ? <Check size={16} /> : <Plus size={16} />} Liquidity
              <small>{detected.listedOnDex ? 'DEX surface detected' : 'Only when needed'}</small>
            </Step>
            <Step $active={detected.listedOnDex && !detected.projectClaimed} $done={detected.projectClaimed}>
              <Check size={16} /> {detected.projectClaimed ? 'Project page live' : 'Claim project page'}
              <small>{detected.projectClaimed ? 'Identity published' : 'Verify ownership'}</small>
            </Step>
            <Step>
              <Rocket size={16} /> Grow visibility
              <small>Featured · Boost</small>
            </Step>
          </Path>
        </Result>
      ) : null}
    </Shell>
  )
}

export default ListContractFirstFunnel
