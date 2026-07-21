import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Flex, Text } from '@pancakeswap/uikit'

const Wrap = styled(Flex)`
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  margin-top: 8px;
`

const HiddenForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`

const Label = styled.label`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const Input = styled.input`
  min-height: 44px;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
`

const Button = styled.button`
  min-height: 44px;
  padding: 8px 14px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 8px;
  background: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 14px;
  cursor: pointer;
  text-align: left;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ManageLink = styled.a`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }
`

const Fact = styled(Text)`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const TOKEN_KEY = 'melega.pp012.operator.token'

interface Props {
  slug: string
}

/**
 * Client-only Manage Project entry.
 * Never visible for unauthenticated public visitors.
 */
const ProjectManageEntry: React.FC<Props> = ({ slug }) => {
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [authorized, setAuthorized] = useState(false)
  const [busy, setBusy] = useState(false)

  const authenticate = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault()
      setBusy(true)
      setError(null)
      try {
        const res = await fetch(`/api/private/projects/${slug}/control-center/session`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token.trim()}`,
          },
        })
        if (!res.ok) {
          setAuthorized(false)
          setError('Authentication failed. Manage Project remains hidden.')
          return
        }
        const body = (await res.json()) as { verified?: boolean; authorized?: boolean }
        if (!body.authorized || !body.verified) {
          setAuthorized(false)
          setError('Owner identity is not verified for management.')
          return
        }
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(TOKEN_KEY, token.trim())
        }
        setAuthorized(true)
        setOpen(false)
      } catch {
        setAuthorized(false)
        setError('Authentication unavailable.')
      } finally {
        setBusy(false)
      }
    },
    [slug, token],
  )

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.sessionStorage.getItem(TOKEN_KEY)
    if (!stored) return
    setToken(stored)
    ;(async () => {
      try {
        const res = await fetch(`/api/private/projects/${slug}/control-center/session`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${stored}` },
        })
        if (!res.ok) {
          window.sessionStorage.removeItem(TOKEN_KEY)
          return
        }
        const body = (await res.json()) as { verified?: boolean; authorized?: boolean }
        if (body.authorized && body.verified) setAuthorized(true)
      } catch {
        // keep hidden
      }
    })()
  }, [slug])

  if (authorized) {
    return (
      <Wrap data-testid="project-manage-entry-authorized">
        <ManageLink href={`/project-hq/${slug}/manage`} data-testid="manage-project-link">
          Manage Project
        </ManageLink>
        <Fact>Authenticated Control Center — registry staging only.</Fact>
      </Wrap>
    )
  }

  return (
    <Wrap data-testid="project-manage-entry">
      {!open ? (
        <Button type="button" onClick={() => setOpen(true)} aria-expanded={open}>
          Owner access
        </Button>
      ) : (
        <HiddenForm onSubmit={authenticate} aria-label="Control Center authentication">
          <Label htmlFor="pp012-operator-token">Operator token</Label>
          <Input
            id="pp012-operator-token"
            name="token"
            type="password"
            autoComplete="off"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            aria-required="true"
            aria-invalid={Boolean(error)}
          />
          <Button type="submit" disabled={busy || token.trim().length < 8}>
            {busy ? 'Checking…' : 'Authenticate'}
          </Button>
          <Button type="button" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </HiddenForm>
      )}
      {error ? (
        <Fact role="alert" data-testid="manage-auth-error">
          {error}
        </Fact>
      ) : (
        <Fact>Manage Project is never shown publicly without authentication.</Fact>
      )}
    </Wrap>
  )
}

export default ProjectManageEntry
