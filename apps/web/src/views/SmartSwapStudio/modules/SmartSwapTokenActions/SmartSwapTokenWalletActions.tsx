/**
 * Compact token utility actions for Smart Swap surfaces:
 * 1) Add Token to MetaMask (wallet_watchAsset)
 * 2) Copy Token Address (clipboard + confirmation)
 *
 * Presentation only — does not alter swap execution / routing / fees.
 */
import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Currency, Token } from '@pancakeswap/sdk'
import { CopyButton, MetamaskIcon } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import {
  buildWatchAssetPayload,
  buildWatchAssetPayloadFromFields,
  canRequestWatchAsset,
  requestWatchAsset,
} from 'lib/smart-swap-token-actions'

const Row = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`

const IconBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 2px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSubtle};
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 1px;
  }
`

const Status = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.success};
  white-space: nowrap;
`

export type SmartSwapTokenWalletActionsProps = {
  currency?: Currency | null
  /** When Currency is unavailable (preview refs). */
  tokenRef?: {
    address?: string | null
    symbol?: string | null
    decimals?: number | null
    chainId?: number | null
    isNative?: boolean | null
  } | null
  size?: number
  showLabels?: boolean
  className?: string
}

function resolvePayload(props: SmartSwapTokenWalletActionsProps) {
  if (props.currency) return buildWatchAssetPayload(props.currency)
  const ref = props.tokenRef
  if (!ref || ref.isNative || !ref.address || !ref.symbol || ref.decimals == null || !ref.chainId) return null
  return buildWatchAssetPayloadFromFields({
    address: ref.address,
    symbol: ref.symbol,
    decimals: ref.decimals,
    chainId: ref.chainId,
  })
}

function resolveCopyAddress(props: SmartSwapTokenWalletActionsProps): string | null {
  if (props.currency && !props.currency.isNative && props.currency instanceof Token) {
    return props.currency.address
  }
  if (props.currency && !props.currency.isNative && 'address' in props.currency) {
    return (props.currency as Token).address
  }
  if (props.tokenRef?.address && !props.tokenRef.isNative) return props.tokenRef.address
  return null
}

export function SmartSwapTokenWalletActions(props: SmartSwapTokenWalletActionsProps) {
  const { t } = useTranslation()
  const [watchStatus, setWatchStatus] = useState<string | null>(null)
  const payload = resolvePayload(props)
  const copyAddress = resolveCopyAddress(props)
  const canWatch = Boolean(payload && canRequestWatchAsset())
  const iconSize = props.size ?? 16

  const onAdd = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!payload) return
      try {
        setWatchStatus(null)
        await requestWatchAsset(payload)
        setWatchStatus(t('Added'))
        setTimeout(() => setWatchStatus(null), 1500)
      } catch {
        setWatchStatus(t('Failed'))
        setTimeout(() => setWatchStatus(null), 1500)
      }
    },
    [payload, t],
  )

  if (!copyAddress && !payload) return null

  return (
    <Row
      className={props.className}
      data-smart-swap-token-actions="true"
      data-testid="smart-swap-token-wallet-actions"
      onClick={(e) => e.stopPropagation()}
    >
      {copyAddress ? (
        <CopyButton
          width={`${iconSize}px`}
          buttonColor="textSubtle"
          text={copyAddress}
          tooltipMessage={t('Token address copied')}
          data-testid="smart-swap-copy-token-address"
        />
      ) : null}
      {canWatch && payload ? (
        <IconBtn
          type="button"
          onClick={onAdd}
          aria-label={t('Add Token to MetaMask')}
          title={t('Add Token to MetaMask')}
          data-testid="smart-swap-add-token-metamask"
          data-token-address={payload.address}
          data-token-symbol={payload.symbol}
          data-token-decimals={String(payload.decimals)}
        >
          <MetamaskIcon width={`${iconSize}px`} />
          {props.showLabels ? <span style={{ marginLeft: 4, fontSize: 11 }}>{t('Add')}</span> : null}
        </IconBtn>
      ) : null}
      {watchStatus ? <Status>{watchStatus}</Status> : null}
    </Row>
  )
}

export default SmartSwapTokenWalletActions
