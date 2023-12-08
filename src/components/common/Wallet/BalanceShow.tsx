import cls from 'classnames'
import numeral from 'numeral'

import React, { FC, useMemo } from 'react'

import { bnMul } from '@/utils/tools'

interface Props {
  unit?: string
  rule?: string
  value: number | string
  percent?: boolean
  decimal?: number
  classNames?: string | string[]
}

const limit = 0.000001
const million = 1000000

const BalanceShow: FC<Props> = ({ unit, rule, value, percent = false, decimal = 2, classNames }) => {
  const [isMillion, int, dec] = useMemo(() => {
    let split = []
    const padEnd = '0'.padEnd(decimal, '0')
    const output = percent ? bnMul(value, 100) : value
    const absValue = Math.abs(Number(output))
    const isMillion = absValue >= million
    const formatRule = rule || (isMillion ? `0,0.${padEnd}a` : `0,0.${padEnd}`)
    if (absValue < limit) split = Number(output).toFixed(decimal).split('.')
    else split = numeral(output).format(formatRule).split('.')
    return [isMillion, ...split]
  }, [value, percent])

  const _dec = useMemo(() => {
    const a = dec.replace(/k|m|b|t/gi, '')
    const b = dec.replace(/[0-9]+/g, '')
    return (
      <>
        .<u>{a}</u>
        <u>{b}</u>
      </>
    )
  }, [dec])

  return (
    <div className={cls('web-balance-show', classNames, { million: isMillion })}>
      <strong>{int ?? 0}</strong>
      <small>
        {dec && _dec}
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
