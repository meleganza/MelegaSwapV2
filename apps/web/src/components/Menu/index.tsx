import React from 'react'
import MelegaAppShell from 'app-shell/MelegaAppShell'

/** Global Melega DEX application shell (DS-002). */
const Menu = (props: { children?: React.ReactNode }) => <MelegaAppShell>{props.children}</MelegaAppShell>

export default Menu
