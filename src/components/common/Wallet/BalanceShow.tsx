import React, { FC, useMemo } from 'react'
import BN from 'bignumber.js'
import classNames from 'classnames'

import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { nonBigNumberInterception } from '@/utils/tools'

interface Props {
  value: number | string
  unit: string
  format?: boolean
  decimal?: number
  percent?: boolean
}

const BalanceShow: FC<Props> = ({ value, unit, format = true, percent = false, decimal = 2 }) => {
  const [int, dec] = useMemo(() => {
    const safeNumber = nonBigNumberInterception(value, decimal)
    const finalValue = percent ? new BN(safeNumber).multipliedBy(100).toString() : safeNumber
    return finalValue.split('.')
  }, [value, format, percent])

  return (
    <div className={classNames('web-balance-show million dec')}>
      <strong>{int ?? 0}</strong>
      <small>
        {dec && `.${dec}`}
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
