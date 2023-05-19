import React, { FC, useContext } from 'react'

import { MobileContext } from '@/providers/Mobile'
import { num2size } from '@/utils/tools'

interface Props {
  mb?: string | number
}

const Row: FC<Props> = ({ children, mb }) => {
  const { mobile } = useContext(MobileContext)
  mb = Number(mb ?? 24)
  return (
    <div className="web-trade-bench-pane-row" style={{ marginBottom: num2size(mobile ? (mb / 3) * 2 : mb) }}>
      {children}
    </div>
  )
}

Row.defaultProps = {
  mb: 24
}

export default Row
