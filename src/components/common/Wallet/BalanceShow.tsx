import React, { FC, useMemo } from 'react'
import numeral from 'numeral'
import BN from 'bignumber.js'

import classNames from 'classnames'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
interface Props {
  value: number | string
  unit: string
  format?: boolean
  percent?: boolean
}

const BalanceShow: FC<Props> = ({ value, unit, format = true, percent = false }) => {
  const [int, dec, million, isDec] = useMemo(() => {
    const realVal = percent ? new BN(value).multipliedBy(100) : value
    const isMillion = realVal >= 1000000
    const isDec = realVal < 1
    const formatRule = isMillion && format ? '0,0.00 a' : '0,0.00'
    return [...numeral(realVal).format(formatRule).split('.'), isMillion, isDec]
  }, [value, format, percent])
  return (
    <div className={classNames('web-balance-show', { million: million && format }, { dec: isDec })}>
      <strong>{int}</strong>
      <small>
        .{dec}
        {percent ? '%' : ''}
      </small>
      {unit && <span>{unit}</span>}
    </div>
  )
}

BalanceShow.defaultProps = {
  value: 0,
  unit: BASE_TOKEN_SYMBOL
}

export default BalanceShow
