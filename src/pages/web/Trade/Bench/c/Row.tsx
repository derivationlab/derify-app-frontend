import React, { FC } from 'react'
import { isMobile } from 'react-device-detect'

import { num2size } from '@/utils/tools'

interface Props {
  mb?: string | number
}

const Row: FC<Props> = ({ children, mb }) => {
  mb = Number(mb ?? 24)
  return (
    <div className="web-trade-bench-pane-row" style={{ marginBottom: num2size(isMobile ? (mb / 3) * 2 : mb) }}>
      {children}
    </div>
  )
}

Row.defaultProps = {
  mb: 24
}

export default Row
