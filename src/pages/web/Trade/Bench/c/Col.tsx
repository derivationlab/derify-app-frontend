import React, { FC } from 'react'

interface Props {
  label?: string
}

const Col: FC<Props> = ({ label, children }) => {
  return (
    <div className="web-trade-bench-pane-col">
      {label && <header>{label}</header>}
      {children}
    </div>
  )
}

export default Col
