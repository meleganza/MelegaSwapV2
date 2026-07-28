import styled from 'styled-components'

const Card = styled.section`
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.28);
  box-sizing: border-box;
`

const Title = styled.h4`
  margin: 0 0 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #9ca3af;
`

const Body = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
  color: #f8fafc;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Sub = styled.p`
  margin: 3px 0 0;
  font-size: 11px;
  line-height: 1.3;
  color: #9ca3af;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export type SmartSwapInsightCardProps = {
  title: string
  body: string
  sub?: string
  'data-insight'?: string
}

/** Compact insight card — max 2 lines of body. */
export function SmartSwapInsightCard({ title, body, sub, ...rest }: SmartSwapInsightCardProps) {
  return (
    <Card data-smart-insight-card data-insight={rest['data-insight']}>
      <Title>{title}</Title>
      <Body>{body}</Body>
      {sub ? <Sub>{sub}</Sub> : null}
    </Card>
  )
}

export default SmartSwapInsightCard
