import numeral from 'numeral'
import classNames from 'classnames'
import React, { FC, useMemo } from 'react'

import { bnMul } from '@/utils/tools'

interface Props {
  unit?: string
  rule?: string
  value: number | string
  percent?: boolean
}

const BalanceShow: FC<Props> = ({ unit, rule, value, percent = false }) => {
  // todo dec maybe undefined
  const [isMillion, int, dec] = useMemo(() => {
    const output = percent ? bnMul(value, 100) : value
    const isMillion = output >= 1000000
    const isDecimal = output < 1
    const formatRule = rule || (isMillion ? '0,0.00 a' : '0,0.00')
    return [isMillion, ...numeral(output).format(formatRule).split('.')]
  }, [value, percent])

  return (
    <div className={classNames('web-balance-show', { million: isMillion })}>
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
  value: 0
}

export default BalanceShow
