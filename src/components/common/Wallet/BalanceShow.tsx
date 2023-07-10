import classNames from 'classnames'
import numeral from 'numeral'

import React, { FC, useMemo } from 'react'

import { bnMul } from '@/utils/tools'

interface Props {
  unit?: string
  rule?: string
  value: number | string
  percent?: boolean
  decimal?: number
}

const BalanceShow: FC<Props> = ({ unit, rule, value, percent = false, decimal = 2 }) => {
  const [isMillion, int, dec] = useMemo(() => {
    const padEnd = '0'.padEnd(decimal, '0')
    const output = percent ? bnMul(value, 100) : value
    const isMillion = Math.abs(Number(output)) >= 1000000
    const formatRule = rule || (isMillion ? `0,0.${padEnd} a` : `0,0.${padEnd}`)
    if (Number(output) < 0.000001) return [isMillion, ...Number(output).toFixed(decimal).split('.')]
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
