import React, { FC, useMemo, useContext } from 'react'
import classNames from 'classnames'
import numeral from 'numeral'

import { MobileContext } from '@/context/Mobile'

export interface DecimalShowProps {
  value: number | string
  percent?: boolean
  black?: boolean
  format?: string
  suffix?: string
}

const DecimalShow: FC<DecimalShowProps> = ({ value, percent, suffix = '', black, format }) => {
  const { mobile } = useContext(MobileContext)
  const [int, dec] = useMemo(() => {
    const strVal = format ? numeral(value).format(format) : String(value)
    if (strVal.includes('.')) {
      return strVal.split('.')
    }
    return [strVal, '00']
  }, [value, format])
  // const formatInt = useMemo(() => (format ? numeral(int).format(format) : int), [int, format])
  return (
    <div className={classNames('web-decimal-show', { black })}>
      <em>{int}</em>
      <small>
        {`.${dec}${percent ? '%' : ''}`}
        {mobile && suffix && <br />}
        {suffix && suffix}
      </small>
    </div>
  )
}

export default DecimalShow
