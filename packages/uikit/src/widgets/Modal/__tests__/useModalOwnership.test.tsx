import React, { useMemo, useState } from 'react'
import { fireEvent, render, screen, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '../ModalContext'
import useModal from '../useModal'

afterEach(cleanup)

function Dialog({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  return <button onClick={onConfirm}>{label}</button>
}

function Owner({ name, value, confirm, id }: { name: string; value: number; confirm: () => void; id?: string }) {
  const [present] = useModal(<Dialog label={`${name}:${value}`} onConfirm={confirm} />, true, true, id)
  return <button onClick={present}>Open {name}</button>
}

// Bound updates to inspect the first conflicting write without letting the pre-fix
// provider enter its unbounded setModalNode/render/effect feedback loop.
function Harness({ value, id, write, confirm }: any) {
  const [state, setState] = useState({ isOpen: false, nodeId: '', modalNode: null as React.ReactNode })
  const context = useMemo(() => ({
    ...state,
    onPresent: (modalNode: React.ReactNode, nodeId: string) => setState({ isOpen: true, nodeId, modalNode }),
    onDismiss: () => setState({ isOpen: false, nodeId: '', modalNode: null }),
    setModalNode: write,
  }), [state, write])
  return <Context.Provider value={context}>
    <Owner name="smart" value={999} confirm={() => { throw new Error('Wrong swap handler') }} id={id} />
    <Owner name="fallback" value={value} confirm={confirm} id={id} />
    {state.modalNode}
  </Context.Provider>
}

describe('modal updates belong to the presenting hook instance', () => {
  it.each(['confirmSwapModal', undefined])('isolates a fallback from a mounted parent using id %s', (id) => {
    const write = vi.fn()
    const confirm = vi.fn()
    const view = render(<Harness value={1} id={id} write={write} confirm={confirm} />)
    fireEvent.click(screen.getByText('Open fallback'))
    expect(write).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('fallback:1'))
    expect(confirm).toHaveBeenCalledTimes(1)
    view.rerender(<Harness value={2} id={id} write={write} confirm={confirm} />)
    expect(write).toHaveBeenCalledTimes(1)
    expect(write.mock.calls[0][0].props.label).toBe('fallback:2')
  })

  it('transfers ownership when another instance explicitly opens', () => {
    const write = vi.fn()
    render(<Harness value={1} id="confirmSwapModal" write={write} confirm={vi.fn()} />)
    fireEvent.click(screen.getByText('Open fallback'))
    fireEvent.click(screen.getByText('Open smart'))
    expect(screen.getByText('smart:999')).toBeTruthy()
    expect(write).not.toHaveBeenCalled()
  })
})
