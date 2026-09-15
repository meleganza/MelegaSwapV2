import React from 'react'
export default React.forwardRef<HTMLAnchorElement, any>((props, ref)=><a {...props} ref={ref}/>)
