import React, { useEffect } from 'react'
import styled from 'styled-components'
import { lb } from './lbProductTokens'

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(4px);
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`

const Modal = styled.div`
  width: 100%;
  max-width: 520px;
  padding: 24px;
  border-radius: 24px;
  background: ${lb.card};
  border: 1px solid ${lb.border};
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
  box-sizing: border-box;
`

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  line-height: 26px;
  font-weight: 600;
  color: ${lb.text};
`

const Body = styled.p`
  margin: 12px 0 0;
  font-size: 13px;
  line-height: 20px;
  color: ${lb.muted};
`

const Footer = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`

const Cancel = styled.button`
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid ${lb.border};
  background: transparent;
  color: ${lb.muted2};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`

const Confirm = styled.button<{ $danger?: boolean }>`
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: 0;
  background: ${({ $danger }) => ($danger ? lb.danger : lb.gold)};
  color: ${({ $danger }) => ($danger ? '#fff' : lb.ink)};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`

export function LbConfirmDialog({
  title,
  body,
  confirmLabel,
  danger,
  onCancel,
  onConfirm,
}: {
  title: string
  body: string
  confirmLabel: string
  danger?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <Backdrop data-testid="lb-confirm-dialog" role="presentation" onClick={onCancel}>
      <Modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="lb-confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <Title id="lb-confirm-title">{title}</Title>
        <Body>{body}</Body>
        <Footer>
          <Cancel type="button" onClick={onCancel}>
            Cancel
          </Cancel>
          <Confirm type="button" $danger={danger} onClick={onConfirm}>
            {confirmLabel}
          </Confirm>
        </Footer>
      </Modal>
    </Backdrop>
  )
}
