import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAccount } from 'wagmi'
import styled, { css, keyframes } from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { melegaZIndex } from 'design-system/melega/tokens/melegaZIndex'
import CreatePoolWizardPreview from './CreatePoolWizardPreview'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { MelegaAccordionSection } from 'design-system/melega/components/Modal'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { getCanonicalTokenRegistry, type CanonicalTokenRecord } from 'lib/canonical-token-registry'
import {
  computeEstimatedApr,
  computeHealthScore,
  computeRewardConsumptionPct,
  createDefaultWizardState,
  deriveDailyRewards,
  describePoolSchedule,
  describeWizardCreatePoolFee,
  type CreatePoolWizardState,
  type WizardStep,
} from './createPoolWizardState'

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

type PoolTokenOption = Pick<CanonicalTokenRecord, 'address' | 'chainId' | 'name' | 'logo'> & { symbol: string }

const POOL_TOKEN_OPTIONS: PoolTokenOption[] = getCanonicalTokenRegistry()
  .filter((token) => token.chainId === 56 && Boolean(token.address))
  .map((token) => ({
    address: token.address,
    chainId: token.chainId,
    name: token.name,
    logo: token.logo,
    symbol: token.address.toLowerCase() === '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c' ? 'BNB' : token.symbol,
  }))
  .sort((a, b) => {
    if (a.address.toLowerCase() === MARCO_BSC_ADDRESS.toLowerCase()) return -1
    if (b.address.toLowerCase() === MARCO_BSC_ADDRESS.toLowerCase()) return 1
    return a.symbol.localeCompare(b.symbol)
  })

const Card = styled.section`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 8px 12px 12px;
  display: flex;
  flex-direction: column;
  overflow: visible;
  height: auto;
  gap: 10px;

  @media (max-width: 767px) {
    padding: 6px 10px 10px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
`

const ExpandedHeaderRow = styled.div`
  display: none;
`

const ReviewNowBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 168px;
  height: 40px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid rgba(244, 196, 48, 0.45);
  background: rgba(244, 196, 48, 0.1);
  color: #f4c430;
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
  transition: background 150ms ease, border-color 150ms ease;

  &:hover {
    background: rgba(244, 196, 48, 0.18);
    border-color: #f4c430;
  }

  @media (max-width: 767px) {
    width: 100%;
    min-width: 0;
  }
`

const Header = styled.div`
  margin-bottom: 18px;

  @media (max-width: 767px) {
    margin-bottom: 14px;
  }
`

const Title = styled.h2`
  margin: 0;
  font-family: Sora, sans-serif;
  font-size: 22px;
  line-height: 28px;
  font-weight: 700;
  color: #ffffff;

  @media (max-width: 767px) {
    font-size: 20px;
    line-height: 26px;
  }
`

const Subtitle = styled.p`
  margin: 6px 0 0;
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: #9a9a9a;

  @media (max-width: 767px) {
    font-size: 12px;
    line-height: 18px;
  }
`

const FeeBlock = styled.div`
  display: none;
`

const FeeItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

const FeeLabel = styled.span`
  font-family: Inter, sans-serif;
  font-size: 10px;
  line-height: 12px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #8c7a3a;
`

const FeeValue = styled.span<{ $free?: boolean }>`
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 18px;
  font-weight: 800;
  color: ${({ $free }) => ($free ? '#18f089' : '#F4C430')};
`

const FeeMeta = styled.span`
  font-family: Inter, sans-serif;
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  color: #d8d0b0;
  word-break: break-all;
`

const EssentialsSection = styled.div`
  display: none;
`

const EssentialsTitle = styled.h3`
  margin: 0 0 12px;
  font-family: Inter, sans-serif;
  font-size: 11px;
  line-height: 14px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #7f7f7f;
`

const EssentialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 20px;
  row-gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: #191919;
  border: 1px solid #292929;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    column-gap: 0;
    row-gap: 10px;
    padding: 14px;
  }
`

const EssentialItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

const EssentialLabel = styled.span`
  font-family: Inter, sans-serif;
  font-size: 10px;
  line-height: 12px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #7f7f7f;
  white-space: nowrap;
`

const EssentialValue = styled.span`
  font-family: Inter, sans-serif;
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: #f2f2f2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 767px) {
    font-size: 12px;
  }
`

const ReadinessNote = styled.p`
  margin: 10px 0 0;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(244, 196, 48, 0.22);
  background: rgba(244, 196, 48, 0.05);
  font-family: Inter, sans-serif;
  font-size: 12px;
  line-height: 17px;
  font-weight: 500;
  color: #c9bd8f;
`

const ProgressWizard = styled.div`
  display: none;
`

const AccordionStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
`

const ProgressTrack = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;

  @media (max-width: 767px) {
    min-width: max-content;
    width: max-content;
    padding-right: 16px;
  }
`

const StepNode = styled.button<{ $active?: boolean; $completed?: boolean }>`
  appearance: none;
  border: 0;
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  padding: 0;
  color: inherit;

  @media (max-width: 767px) {
    flex: 0 0 auto;
    min-width: 56px;
  }

  &:first-child {
    @media (max-width: 767px) {
      min-width: 64px;
    }
  }
`

const StepCircle = styled.div<{ $active?: boolean; $completed?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  box-sizing: border-box;
  display: grid;
  place-items: center;
  font-family: Inter, sans-serif;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  transition: background 180ms ease, border-color 180ms ease, color 180ms ease;

  ${({ $completed, $active }) =>
    $completed
      ? css`
          background: rgba(24, 240, 137, 0.14);
          border: 1px solid #18f089;
          color: #18f089;
        `
      : $active
      ? css`
          background: rgba(244, 196, 48, 0.14);
          border: 1px solid #f4c430;
          color: #f4c430;
        `
      : css`
          background: #1d1d1d;
          border: 1px solid #333333;
          color: #707070;
        `}
`

const StepLabel = styled.span<{ $active?: boolean; $completed?: boolean }>`
  font-family: Inter, sans-serif;
  font-size: 12px;
  line-height: 14px;
  font-weight: 600;
  white-space: nowrap;
  color: ${({ $completed, $active }) => ($completed ? '#18f089' : $active ? '#F4C430' : '#707070')};
  transition: color 180ms ease;
`

const Connector = styled.div<{ $filled?: boolean }>`
  flex: 1;
  height: 2px;
  min-width: 12px;
  margin: 0 4px 18px;
  background: #2c2c2c;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ $filled }) => ($filled ? '#18f089' : 'transparent')};
    transform: scaleX(${({ $filled }) => ($filled ? 1 : 0)});
    transform-origin: left center;
    transition: transform 180ms ease;
  }
`

const Body = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;

  @media (max-width: 767px) {
    flex-direction: column;
    gap: 12px;
  }
`

const PreviewColumn = styled.div`
  width: 260px;
  min-width: 260px;
  align-self: flex-start;
  position: sticky;
  top: 8px;

  @media (max-width: 767px) {
    width: 100%;
    min-width: 0;
    position: static;
    top: auto;
    margin-top: 16px;

    & > aside {
      margin-top: 0;
    }
  }
`

const StepColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;

  @media (max-width: 767px) {
    width: 100%;
    align-self: stretch;
  }
`

const slideInFromRight = keyframes`
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
`

const slideInFromLeft = keyframes`
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: translateX(0); }
`

const slideInNext = css`
  animation: ${slideInFromRight} 220ms ease;
`

const slideInPrev = css`
  animation: ${slideInFromLeft} 220ms ease;
`

const StepPanel = styled.div<{ $dir: 'next' | 'prev' | 'none' }>`
  ${({ $dir }) => ($dir === 'next' ? slideInNext : $dir === 'prev' ? slideInPrev : '')}
  min-width: 0;

  @media (max-width: 767px) {
    width: 100%;
  }
`

const FieldsGrid = styled.div<{ $cols?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols ?? 2}, minmax(0, 1fr));
  column-gap: 18px;
  row-gap: 18px;
  width: 100%;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    column-gap: 0;
    row-gap: 10px;
  }
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  height: 68px;
  min-height: 68px;
  min-width: 0;
  overflow: visible;

  @media (max-width: 767px) {
    height: 56px;
    min-height: 56px;
  }
`

const FieldTall = styled(Field)`
  height: auto;
  min-height: 68px;
`

const Label = styled.span`
  font-family: Inter, sans-serif;
  font-size: 11px;
  line-height: 12px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #7f7f7f;
  white-space: nowrap;
  overflow: visible;

  @media (max-width: 767px) {
    font-size: 9px;
    line-height: 11px;
    letter-spacing: 0.08em;
    color: #777777;
  }
`

const valueTextStyles = css<{ $compact?: boolean }>`
  font-family: Inter, sans-serif;
  font-size: ${({ $compact }) => ($compact ? '12px' : '14px')};
  font-weight: 700;
  line-height: 1.2;
  color: #f2f2f2;

  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 600;
    color: #ffffff;
  }
`

const inputSurfaceStyles = css`
  margin-top: 8px;
  height: 42px;
  min-height: 42px;
  width: 100%;
  box-sizing: border-box;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
  background: #1a1a1a;
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;

  @media (max-width: 767px) {
    margin-top: 6px;
    height: 38px;
    min-height: 38px;
    padding: 0 12px;
    border-radius: 10px;
    border-color: #292929;
  }
`

const InputBox = styled.input<{ $compact?: boolean }>`
  ${inputSurfaceStyles}
  ${valueTextStyles}

  &::placeholder {
    color: #7f7f7f;
  }
`

const ReadOnlyValue = styled.div<{ $compact?: boolean }>`
  ${inputSurfaceStyles}
  ${valueTextStyles}
  display: flex;
  align-items: center;
  color: #18f089;
`

const SelectWrap = styled.div`
  position: relative;
  margin-top: 8px;
  min-width: 0;

  @media (max-width: 767px) {
    margin-top: 6px;
  }
`

const SelectBtn = styled.button`
  ${inputSurfaceStyles}
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #f2f2f2;
  text-align: left;
  cursor: pointer;
  padding-right: 10px;

  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 600;
  }
`

const TokenLogo = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f4c430 0%, #8a7020 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  color: #050505;
  flex-shrink: 0;
`

const Dropdown = styled.div<{ $top: number; $left: number; $width: number }>`
  position: fixed;
  z-index: ${melegaZIndex.overlayStacked};
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  width: ${({ $width }) => $width}px;
  max-height: min(280px, calc(100vh - 24px));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  border: 1px solid #333333;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
  box-sizing: border-box;
`

const DropdownList = styled.div`
  overflow-y: auto;
  max-height: 220px;
  min-height: 0;
`

const SearchInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #2a2a2a;
  background: #141414;
  padding: 0 10px;
  font-family: Inter, sans-serif;
  font-size: 12px;
  color: #f2f2f2;
  margin-bottom: 6px;

  &::placeholder {
    color: #707070;
  }
`

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #f2f2f2;
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  padding: 0 8px;

  &:hover {
    background: #242424;
  }
`

const StepActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 22px;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    width: 100%;
    align-self: stretch;
    box-sizing: border-box;
    position: sticky;
    bottom: 0;
    z-index: 5;
    margin-top: 16px;
    padding: 12px 0 calc(8px + env(safe-area-inset-bottom, 0px));
    background: linear-gradient(180deg, rgba(20, 20, 20, 0) 0%, #141414 28%);
  }
`

const GoldBtn = styled.button<{ $wide?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $wide }) => ($wide ? '220px' : '176px')};
  min-width: ${({ $wide }) => ($wide ? '220px' : '176px')};
  height: ${({ $wide }) => ($wide ? '50px' : '46px')};
  border: none;
  border-radius: 12px;
  background: #e8c43a;
  color: #050505;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  flex-shrink: 0;
  transition: box-shadow 150ms ease;
  text-decoration: none;

  &:hover {
    box-shadow: 0 0 24px rgba(232, 196, 58, 0.22);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    box-shadow: none;
  }

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    min-width: 0;
    height: 46px;
    display: flex;
    align-self: stretch;
  }
`

const GhostBtn = styled.button<{ $review?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $review }) => ($review ? '96px' : 'auto')};
  min-width: ${({ $review }) => ($review ? '96px' : '0')};
  height: ${({ $review }) => ($review ? '50px' : '46px')};
  padding: ${({ $review }) => ($review ? '0' : '0 18px')};
  border-radius: 12px;
  border: 1px solid #333333;
  background: transparent;
  color: #b0b0b0;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    min-width: 0;
    height: 46px;
    flex: none;
    padding: 0 18px;
  }
`

const ReviewScroll = styled.div`
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  background: #1a1a1a;
  padding: 14px 16px;
  margin-top: 4px;

  @media (max-width: 767px) {
    max-height: 220px;
  }
`

const ReviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 24px;
  row-gap: 10px;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    column-gap: 0;
  }
`

const ReviewStepHeader = styled.div`
  margin-bottom: 14px;
`

const ReviewStepTitle = styled.h3`
  margin: 0;
  font-family: Sora, sans-serif;
  font-size: 24px;
  line-height: 30px;
  font-weight: 700;
  color: #f7f7f7;
`

const ReviewStepSubtitle = styled.p`
  margin: 6px 0 0;
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: #9a9a9a;
`

const ReviewRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-family: Inter, sans-serif;
  font-size: 13px;
  line-height: 18px;
  color: #9a9a9a;

  strong {
    color: #f2f2f2;
    font-weight: 700;
    text-align: right;
  }
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-top: 20px;
  width: 100%;
  min-width: 0;
  padding-top: 4px;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin-top: 12px;
    padding-bottom: 96px;
  }
`

const FooterNote = styled.p`
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 13px;
  line-height: 18px;
  font-weight: 400;
  color: #8c8c8c;

  @media (max-width: 767px) {
    font-size: 12px;
    color: #888888;
  }
`

type TokenSelectorProps = {
  label: string
  value: string
  selectedAddress: string
  onChange: (token: PoolTokenOption) => void
}

const TokenAvatar: React.FC<{ token: PoolTokenOption }> = ({ token }) => {
  return (
    <MelegaTokenAvatar
      name={token.name}
      symbol={token.symbol}
      size={32}
      address={token.address}
      chainId={token.chainId}
      logoURI={token.logo}
      radius="circle"
    />
  )
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ label, value, selectedAddress, onChange }) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null)

  const selected = useMemo(
    () =>
      POOL_TOKEN_OPTIONS.find((token) => token.address.toLowerCase() === selectedAddress.toLowerCase()) ??
      POOL_TOKEN_OPTIONS.find((token) => token.symbol === value),
    [selectedAddress, value],
  )
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return POOL_TOKEN_OPTIONS.filter(
      (token) =>
        !needle ||
        token.symbol.toLowerCase().includes(needle) ||
        token.name.toLowerCase().includes(needle) ||
        token.address.toLowerCase().includes(needle),
    )
  }, [query])

  const syncCoords = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const width = Math.max(rect.width, 220)
    const preferredTop = rect.bottom + 6
    const maxTop = window.innerHeight - 24 - 280
    const top = Math.min(preferredTop, Math.max(12, maxTop))
    let left = rect.left
    if (left + width > window.innerWidth - 12) left = Math.max(12, window.innerWidth - width - 12)
    setCoords({ top, left, width })
  }, [])

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null)
      return
    }
    syncCoords()
    const onScroll = () => syncCoords()
    window.addEventListener('resize', syncCoords)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      window.removeEventListener('resize', syncCoords)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open, syncCoords])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (wrapRef.current?.contains(t)) return
      if (dropdownRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <Field data-ps-create-field>
      <Label>{label}</Label>
      <SelectWrap ref={wrapRef}>
        <SelectBtn
          type="button"
          aria-label={label}
          aria-expanded={open}
          aria-haspopup="listbox"
          data-ps-create-token-select
          onClick={() => setOpen((v) => !v)}
        >
          {selected ? <TokenAvatar token={selected} /> : null}
          <span>{value || 'Select token'}</span>
        </SelectBtn>
        {open && coords && typeof document !== 'undefined'
          ? createPortal(
              <Dropdown
                ref={dropdownRef}
                $top={coords.top}
                $left={coords.left}
                $width={coords.width}
                data-ps-create-token-dropdown
                role="listbox"
                aria-label={label}
              >
                <SearchInput
                  placeholder="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  data-ps-create-token-search
                  autoFocus
                />
                <DropdownList>
                  {filtered.map((token) => (
                    <DropdownItem
                      key={token.address}
                      type="button"
                      role="option"
                      aria-selected={token.address.toLowerCase() === selectedAddress.toLowerCase()}
                      onClick={() => {
                        onChange(token)
                        setOpen(false)
                        setQuery('')
                      }}
                    >
                      <TokenAvatar token={token} />
                      <span>{token.symbol}</span>
                      <small>{shortAddr(token.address)}</small>
                    </DropdownItem>
                  ))}
                </DropdownList>
              </Dropdown>,
              document.body,
            )
          : null}
      </SelectWrap>
    </Field>
  )
}

export const CreatePoolCta: React.FC = () => {
  const { address } = useAccount()
  const [step, setStep] = useState<WizardStep>(1)
  const [animDir, setAnimDir] = useState<'next' | 'prev' | 'none'>('none')
  const [state, setState] = useState<CreatePoolWizardState>(createDefaultWizardState)

  const patch = useCallback((partial: Partial<CreatePoolWizardState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial }
      if ('rewardBudget' in partial || 'emissionDuration' in partial) {
        next.dailyRewards = deriveDailyRewards(next)
      }
      return next
    })
  }, [])

  const goNext = () => {
    setAnimDir('next')
    setStep((s) => Math.min(4, s + 1) as WizardStep)
  }

  const goPrev = () => {
    setAnimDir('prev')
    setStep((s) => Math.max(1, s - 1) as WizardStep)
  }

  const resetWizard = useCallback(() => {
    setState(createDefaultWizardState())
    setAnimDir('none')
    setStep(1)
  }, [])

  const jumpToReview = useCallback(() => {
    setAnimDir('next')
    setStep(4)
  }, [])

  const estimatedApr = useMemo(() => computeEstimatedApr(state), [state])
  const healthScore = useMemo(() => computeHealthScore(state), [state])
  const rewardConsumptionPct = useMemo(() => computeRewardConsumptionPct(state), [state])
  const schedule = useMemo(() => describePoolSchedule(state), [state])
  const feeInfo = useMemo(() => describeWizardCreatePoolFee(state), [state])

  const reviewRows = useMemo(
    () => [
      ['Reward Token', state.rewardToken],
      ['Stake Token', state.stakeToken],
      ['Budget', state.rewardBudget],
      ['Daily emission', state.dailyRewards ? `${state.dailyRewards} / day` : 'Not set'],
      ['Duration', `${state.emissionDuration} days`],
      ['Lock', state.lockPeriod ? `${state.lockType} · ${state.lockPeriod}` : state.lockType],
      ['APR', estimatedApr],
      ['Creation Fee', feeInfo.display],
      ['Fee destination', feeInfo.recipientLabel || 'Melega Treasury'],
    ],
    [state, estimatedApr, feeInfo],
  )

  return (
    <Card
      id="create-pool"
      data-ps-create-pool-builder
      data-r709-create-pool
      data-r710-create-pool
      data-r711-create-pool
      data-r712-create-pool
      data-r722-create-pool-wizard
      data-r723-create-pool
      data-r723-create-pool-expanded
      data-ps-create-pool-expanded="true"
      data-ps-create-pool-permanently-expanded
      data-create-pool-accordion="true"
      data-melega-modal-system="true"
    >
      {/* MelegaModal owns the only title — keep legacy review jump without a second H2. */}
      <ExpandedHeaderRow aria-hidden>
        <ReviewNowBtn type="button" data-ps-create-pool-review-now onClick={jumpToReview}>
          Review Pool Creation
        </ReviewNowBtn>
      </ExpandedHeaderRow>

      <FeeBlock data-ps-create-pool-fee-block>
        <FeeItem>
          <FeeLabel>Creation Fee</FeeLabel>
          <FeeValue $free={feeInfo.isFree} data-ps-create-pool-fee-amount>
            {feeInfo.display}
          </FeeValue>
        </FeeItem>
        <FeeItem>
          <FeeLabel>Reason</FeeLabel>
          <FeeMeta data-ps-create-pool-fee-reason>{feeInfo.reason}</FeeMeta>
        </FeeItem>
        <FeeItem style={{ flex: 1 }}>
          <FeeLabel>Recipient</FeeLabel>
          <FeeMeta data-ps-create-pool-fee-recipient>{feeInfo.recipientLabel || 'Melega Treasury'}</FeeMeta>
        </FeeItem>
      </FeeBlock>

      <EssentialsSection data-ps-create-pool-essentials>
        <EssentialsTitle>Essentials</EssentialsTitle>
        <EssentialsGrid data-ps-create-pool-essentials-grid>
          <EssentialItem>
            <EssentialLabel>Stake Token</EssentialLabel>
            <EssentialValue data-ps-essential-stake-token>{state.stakeToken || '—'}</EssentialValue>
          </EssentialItem>
          <EssentialItem>
            <EssentialLabel>Reward Token</EssentialLabel>
            <EssentialValue data-ps-essential-reward-token>{state.rewardToken || '—'}</EssentialValue>
          </EssentialItem>
          <EssentialItem>
            <EssentialLabel>Reward Budget</EssentialLabel>
            <EssentialValue data-ps-essential-reward-budget>{state.rewardBudget || 'Not set'}</EssentialValue>
          </EssentialItem>
          <EssentialItem>
            <EssentialLabel>Reward Duration</EssentialLabel>
            <EssentialValue data-ps-essential-reward-duration>
              {state.emissionDuration ? `${state.emissionDuration} days` : 'Not set'}
            </EssentialValue>
          </EssentialItem>
          <EssentialItem>
            <EssentialLabel>Emission Rate</EssentialLabel>
            <EssentialValue data-ps-essential-emission-rate>
              {state.dailyRewards ? `${state.dailyRewards} / day` : 'Not set'}
            </EssentialValue>
          </EssentialItem>
          <EssentialItem>
            <EssentialLabel>Start</EssentialLabel>
            <EssentialValue data-ps-essential-start>{schedule.start}</EssentialValue>
          </EssentialItem>
          <EssentialItem>
            <EssentialLabel>End</EssentialLabel>
            <EssentialValue data-ps-essential-end>{schedule.end}</EssentialValue>
          </EssentialItem>
          <EssentialItem>
            <EssentialLabel>Lock Type</EssentialLabel>
            <EssentialValue data-ps-essential-lock-type>{state.lockType || '—'}</EssentialValue>
          </EssentialItem>
          <EssentialItem>
            <EssentialLabel>Lock Period</EssentialLabel>
            <EssentialValue data-ps-essential-lock-period>{state.lockPeriod || '—'}</EssentialValue>
          </EssentialItem>
          <EssentialItem>
            <EssentialLabel>Cooldown</EssentialLabel>
            <EssentialValue data-ps-essential-cooldown>{state.cooldown || '—'}</EssentialValue>
          </EssentialItem>
          <EssentialItem>
            <EssentialLabel>Pool Owner</EssentialLabel>
            {address ? (
              <EssentialValue data-ps-essential-pool-owner>{shortAddr(address)}</EssentialValue>
            ) : (
              <ConnectWalletButton scale="sm" data-ps-essential-pool-owner-connect>
                Connect
              </ConnectWalletButton>
            )}
          </EssentialItem>
          <EssentialItem>
            <EssentialLabel>Creation Fee</EssentialLabel>
            <EssentialValue data-ps-essential-creation-fee>{feeInfo.display}</EssentialValue>
          </EssentialItem>
          <EssentialItem>
            <EssentialLabel>Treasury</EssentialLabel>
            <EssentialValue data-ps-essential-treasury>{feeInfo.recipientLabel}</EssentialValue>
          </EssentialItem>
          <EssentialItem>
            <EssentialLabel>Estimated APR</EssentialLabel>
            <EssentialValue data-ps-essential-apr>{estimatedApr}</EssentialValue>
          </EssentialItem>
          <EssentialItem>
            <EssentialLabel>Reward Consumption</EssentialLabel>
            <EssentialValue data-ps-essential-reward-consumption>
              {rewardConsumptionPct == null ? 'Calculated after configuration' : `${rewardConsumptionPct}%`}
            </EssentialValue>
          </EssentialItem>
          <EssentialItem>
            <EssentialLabel>Pool Health</EssentialLabel>
            <EssentialValue data-ps-essential-pool-health>
              {healthScore == null ? 'Calculated after configuration' : `${healthScore} / 100`}
            </EssentialValue>
          </EssentialItem>
        </EssentialsGrid>
      </EssentialsSection>

      <ProgressWizard data-r722-wizard-progress aria-hidden>
        <ProgressTrack />
      </ProgressWizard>

      <Body data-ps-create-pool-wizard-body>
        <StepColumn>
          <AccordionStack data-create-pool-accordion-ui="true">
            {(
              [
                [1, 'Step 1', 'Tokens', (s: number) => s === 1],
                [2, 'Step 2', 'Rewards', (s: number) => s === 2],
                [3, 'Step 3', 'Rules', (s: number) => s === 3],
                [4, 'Step 4', 'Review', (s: number) => s === 4],
              ] as const
            ).map(([idx, title, summary, isOpen]) => (
              <MelegaAccordionSection
                key={idx}
                id={`create-pool-step-${idx}`}
                title={title}
                summary={summary}
                open={isOpen(step)}
                onToggle={() => {
                  const targetStep = idx as WizardStep
                  setAnimDir(targetStep >= step ? 'next' : 'prev')
                  setStep(targetStep)
                }}
                testId={`create-pool-acc-${idx}`}
              >
                {isOpen(step) ? (
                  <StepPanel
                    key={`active-${step}`}
                    $dir={animDir}
                    data-ps-wizard-step-panel={step}
                    data-create-pool-active-step={step}
                  >
                    {step === 1 ? (
                      <>
                        <FieldsGrid $cols={2} data-ps-create-pool-grid>
                          <TokenSelector
                            label="Reward Token"
                            value={state.rewardToken}
                            selectedAddress={state.rewardTokenAddress}
                            onChange={(token) =>
                              patch({ rewardToken: token.symbol, rewardTokenAddress: token.address })
                            }
                          />
                          <TokenSelector
                            label="Stake Token"
                            value={state.stakeToken}
                            selectedAddress={state.stakeTokenAddress}
                            onChange={(token) => patch({ stakeToken: token.symbol, stakeTokenAddress: token.address })}
                          />
                        </FieldsGrid>
                        <StepActions data-ps-wizard-actions>
                          <GoldBtn type="button" data-ps-wizard-next onClick={goNext}>
                            Next →
                          </GoldBtn>
                          <GhostBtn type="button" data-ps-wizard-cancel onClick={resetWizard}>
                            Reset
                          </GhostBtn>
                        </StepActions>
                      </>
                    ) : null}

                    {step === 2 ? (
                      <>
                        <FieldsGrid $cols={2} data-ps-create-pool-grid>
                          <Field data-ps-create-field>
                            <Label>Reward Budget</Label>
                            <InputBox
                              value={state.rewardBudget}
                              onChange={(e) => patch({ rewardBudget: e.target.value })}
                              aria-label="Reward Budget"
                            />
                          </Field>
                          <Field data-ps-create-field>
                            <Label title="How many calendar days rewards are emitted. SmartChef schedules use day-length emission windows on BNB Chain.">
                              Reward Duration (Days)
                            </Label>
                            <InputBox
                              value={state.emissionDuration}
                              onChange={(e) => patch({ emissionDuration: e.target.value })}
                              aria-label="Reward Duration in Days"
                              placeholder="e.g. 30"
                              $compact
                              inputMode="decimal"
                            />
                          </Field>
                          <Field data-ps-create-field>
                            <Label title="Total reward tokens emitted each day. Converted to per-block emission using ~28,800 BNB Chain blocks/day.">
                              Daily Reward Emission
                            </Label>
                            <ReadOnlyValue aria-label="Daily Reward Emission in reward tokens per day">
                              {state.dailyRewards
                                ? `${state.dailyRewards} ${state.rewardToken} / day`
                                : 'Budget ÷ duration'}
                            </ReadOnlyValue>
                          </Field>
                          <Field data-ps-create-field>
                            <Label>Estimated APR</Label>
                            <ReadOnlyValue aria-label="Estimated APR" data-ps-wizard-est-apr>
                              {estimatedApr}
                            </ReadOnlyValue>
                          </Field>
                        </FieldsGrid>
                        <StepActions>
                          <GoldBtn type="button" data-ps-wizard-next onClick={goNext}>
                            Next →
                          </GoldBtn>
                          <GhostBtn type="button" data-ps-wizard-back onClick={goPrev}>
                            ← Back
                          </GhostBtn>
                        </StepActions>
                      </>
                    ) : null}

                    {step === 3 ? (
                      <>
                        <FieldsGrid $cols={2} data-ps-create-pool-grid>
                          <Field data-ps-create-field>
                            <Label>Lock Type</Label>
                            <InputBox
                              value={state.lockType}
                              onChange={(e) => patch({ lockType: e.target.value })}
                              aria-label="Lock Type"
                              $compact
                            />
                          </Field>
                          <Field data-ps-create-field>
                            <Label>Lock Period</Label>
                            <InputBox
                              value={state.lockPeriod}
                              onChange={(e) => patch({ lockPeriod: e.target.value })}
                              aria-label="Lock Period"
                              $compact
                            />
                          </Field>
                          <Field data-ps-create-field>
                            <Label>Cooldown</Label>
                            <InputBox
                              value={state.cooldown}
                              onChange={(e) => patch({ cooldown: e.target.value })}
                              aria-label="Cooldown"
                              $compact
                            />
                          </Field>
                          <Field data-ps-create-field>
                            <Label>Withdrawal Fee</Label>
                            <InputBox
                              value={state.withdrawalFee}
                              onChange={(e) => patch({ withdrawalFee: e.target.value })}
                              aria-label="Withdrawal Fee"
                            />
                          </Field>
                          <Field data-ps-create-field>
                            <Label>Auto Compound</Label>
                            <InputBox
                              value={state.autoCompound}
                              onChange={(e) => patch({ autoCompound: e.target.value })}
                              aria-label="Auto Compound"
                              $compact
                            />
                          </Field>
                          <Field data-ps-create-field>
                            <Label>Minimum Stake</Label>
                            <InputBox
                              value={state.minStake}
                              onChange={(e) => patch({ minStake: e.target.value })}
                              aria-label="Minimum Stake"
                            />
                          </Field>
                          <Field data-ps-create-field>
                            <Label>Maximum Stake</Label>
                            <InputBox
                              value={state.maxStake}
                              onChange={(e) => patch({ maxStake: e.target.value })}
                              aria-label="Maximum Stake"
                            />
                          </Field>
                          <Field data-ps-create-field>
                            <Label>Visibility</Label>
                            <InputBox
                              value={state.visibility}
                              onChange={(e) => patch({ visibility: e.target.value })}
                              aria-label="Visibility"
                              $compact
                            />
                          </Field>
                        </FieldsGrid>
                        <StepActions>
                          <GoldBtn type="button" data-ps-wizard-next onClick={goNext}>
                            Next →
                          </GoldBtn>
                          <GhostBtn type="button" data-ps-wizard-back onClick={goPrev}>
                            ← Back
                          </GhostBtn>
                        </StepActions>
                      </>
                    ) : null}

                    {step === 4 ? (
                      <>
                        <ReviewStepHeader data-ps-wizard-pool-ready>
                          <ReviewStepTitle>Review Pool Creation</ReviewStepTitle>
                          <ReviewStepSubtitle>Confirm the essentials.</ReviewStepSubtitle>
                        </ReviewStepHeader>
                        <ReviewScroll data-ps-wizard-review>
                          <ReviewGrid>
                            {reviewRows.map(([k, v]) => (
                              <ReviewRow key={k}>
                                <span>{k}</span>
                                <strong>{v}</strong>
                              </ReviewRow>
                            ))}
                          </ReviewGrid>
                        </ReviewScroll>
                        <StepActions data-ps-create-pool-footer>
                          <GoldBtn type="button" $wide data-ps-create-pool-btn disabled>
                            Create Pool
                          </GoldBtn>
                          <GhostBtn type="button" $review data-ps-wizard-back onClick={goPrev}>
                            ← Back
                          </GhostBtn>
                        </StepActions>
                        <ReadinessNote data-ps-create-pool-readiness-note>
                          {!state.rewardToken
                            ? 'Select the reward token before continuing.'
                            : state.rewardToken === 'MARCO'
                            ? 'MARCO reward pools require the official Melega deployer. The pool becomes visible only after its reward balance is confirmed on-chain.'
                            : 'The current production factory is owner-gated and has no public deployment adapter. The pool remains blocked and hidden until deployment and reward funding are both confirmed on-chain.'}
                        </ReadinessNote>
                      </>
                    ) : null}
                  </StepPanel>
                ) : null}
              </MelegaAccordionSection>
            ))}
          </AccordionStack>
        </StepColumn>

        <PreviewColumn>
          <CreatePoolWizardPreview state={state} />
        </PreviewColumn>
      </Body>
    </Card>
  )
}

export default CreatePoolCta
