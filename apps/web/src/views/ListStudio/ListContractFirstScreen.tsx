import React, { useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { ListWorkspace } from './ListWorkspace'

const Root = styled.main`
  min-height: calc(100vh - 120px);
  padding: clamp(28px, 7vh, 88px) 24px 56px;
  color: #fff;
  background: #050607;
`
const Entry = styled.section`
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: clamp(28px, 5vw, 54px);
  border: 1px solid rgba(244, 196, 48, 0.34);
  border-radius: 24px;
  background: radial-gradient(circle at 88% 12%, rgba(244,196,48,.13), transparent 42%), #111214;
  box-shadow: 0 24px 80px rgba(0,0,0,.42);
  box-sizing: border-box;
`
const Eyebrow = styled.div`
  color: #f4c430; font-size: 12px; font-weight: 850; letter-spacing: .13em; text-transform: uppercase;
`
const Title = styled.h1`
  margin: 14px 0 10px; font-size: clamp(42px, 6vw, 76px); line-height: .98; letter-spacing: -.045em;
`
const Copy = styled.p`
  max-width: 720px; margin: 0 0 26px; color: rgba(255,255,255,.64); font-size: 16px; line-height: 1.55;
`
const Form = styled.form`
  display: grid; grid-template-columns: minmax(0,1fr) auto auto; gap: 12px;
  @media (max-width: 720px) { grid-template-columns: 1fr; }
`
const Input = styled.input`
  min-width: 0; height: 58px; padding: 0 18px; border-radius: 14px; border: 1px solid rgba(255,255,255,.12);
  background: #18191b; color: #fff; font: 500 15px/1 ui-monospace, SFMono-Regular, Menlo, monospace; outline: none;
  &:focus { border-color: rgba(244,196,48,.72); box-shadow: 0 0 0 3px rgba(244,196,48,.08); }
`
const Chain = styled.span`
  height: 58px; padding: 0 18px; display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid rgba(244,196,48,.58); border-radius: 999px; color: #f4c430; font-weight: 800;
`
const Submit = styled.button`
  height: 58px; padding: 0 26px; border: 0; border-radius: 14px; background: #f4c430; color: #0a0a0a;
  font-size: 15px; font-weight: 850; cursor: pointer; white-space: nowrap;
`
const Error = styled.p`margin: 12px 0 0; color: #ff6b6b; font-size: 13px;`
const WorkspaceWrap = styled.div`
  width: min(1376px, 100%); margin: 0 auto;
`

export const ListContractFirstScreen: React.FC = () => {
  const router = useRouter()
  const [contract, setContract] = useState(typeof router.query.contract === 'string' ? router.query.contract : '')
  const [error, setError] = useState('')
  const active = router.query.intent === 'import-token'

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const value = contract.trim()
    if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
      setError('Enter a valid BNB Chain contract address.')
      return
    }
    setError('')
    void router.push({ pathname: '/list', query: { intent: 'import-token', contract: value, chain: 'bsc' } }, undefined, { shallow: true, scroll: false })
  }

  return (
    <Root data-testid="list-contract-first">
      <PageMeta />
      {active ? (
        <WorkspaceWrap><ListWorkspace /></WorkspaceWrap>
      ) : (
        <Entry>
          <Eyebrow>List on Melega</Eyebrow>
          <Title>Enter the contract.</Title>
          <Copy>Start with the token address. Melega verifies the contract and opens the complete listing funnel in place.</Copy>
          <Form onSubmit={submit}>
            <Input value={contract} onChange={(event) => setContract(event.target.value)} placeholder="0x..." aria-label="Contract address" autoComplete="off" />
            <Chain>BNB</Chain>
            <Submit type="submit">Analyze Project</Submit>
          </Form>
          {error ? <Error role="alert">{error}</Error> : null}
        </Entry>
      )}
    </Root>
  )
}

export default ListContractFirstScreen
