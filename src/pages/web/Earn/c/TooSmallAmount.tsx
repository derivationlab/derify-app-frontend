import React, { FC } from 'react'

import { PLATFORM_TOKEN } from '@/config/tokens'
import { isGT, isLT } from '@/utils/tools'

interface Props {
  amount: string | number
  token?: string
}

const TooSmallAmount: FC<Props> = ({ amount, token = PLATFORM_TOKEN.symbol }) => {
  return isLT(amount, 0.005) && isGT(amount, 0) ? (
    <small className="too-small-amount">
      {amount} {token}
    </small>
  ) : null
}

export default TooSmallAmount
