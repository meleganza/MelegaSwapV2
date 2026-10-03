import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createGlobalStyle } from 'styled-components'
import ModalProvider from '../../../packages/uikit/src/widgets/Modal/ModalContext'
import useModal from '../../../packages/uikit/src/widgets/Modal/useModal'
import Modal from '../../../packages/uikit/src/widgets/Modal/Modal'
import theme from '../../../packages/uikit/src/theme/dark'
const Style = createGlobalStyle`body { margin:0; background:#101112; color:white; font-family:Arial; } button { padding:16px; cursor:pointer; }`
const stats = (window as any).stats = { mounts:0, unmounts:0, correct:0, wrong:0, ticks:0 }
function Confirmation({ name, quote, onConfirm, onDismiss }: any) {
  useEffect(() => { stats.mounts++; return () => { stats.unmounts++ } }, [])
  return <Modal title="Confirm Swap" onDismiss={onDismiss}>
    <div data-testid="review" style={{ width:'min(340px, calc(100vw - 48px))' }}>
      <h2>10000 MARCO → {quote} {name}</h2>
      <p>SLIPPAGE TOLERANCE: 10.0%</p>
      <p>Output is estimated. Minimum received: 27370000 {name}</p>
      <p>Price impact: 0.72%</p><p>Liquidity Provider Fee: 25 MARCO</p>
      <button style={{width:'100%',background:'#f4c430',borderRadius:24}} onClick={onConfirm}>Confirm Swap</button>
    </div>
  </Modal>
}
function Fallback({ tick }: { tick: number }) {
  const [present] = useModal(<Confirmation name="AARON" quote={30116600 + tick} onConfirm={() => { stats.correct++ }} />, true, true, 'confirmSwapModal')
  return <button onClick={present}>Swap MARCO-AARON</button>
}
function Parent() {
  const [tick, setTick] = useState(0)
  useEffect(() => { const timer = setInterval(() => { stats.ticks++; setTick(x=>x+1) },100); return ()=>clearInterval(timer) },[])
  // Same topology as SmartSwapCommitButton returning its legacyFallback child.
  useModal(<Confirmation name="OTHER" quote={42 + tick} onConfirm={() => { stats.wrong++ }} />, true, true, 'confirmSwapModal')
  return <Fallback tick={tick} />
}
createRoot(document.getElementById('root')!).render(<ThemeProvider theme={theme}><Style/><ModalProvider><Parent/></ModalProvider></ThemeProvider>)
