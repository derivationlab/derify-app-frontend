import classNames from 'classnames'
import numeral from 'numeral'

import React, { FC, useMemo } from 'react'
import { isMobile } from 'react-device-detect'

export interface DecimalShowProps {
  value: number | string
  percent?: boolean
  black?: boolean
  format?: string
  suffix?: string
}

const DecimalShow: FC<DecimalShowProps> = ({ value, percent, suffix = '', black, format }) => {
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
        {isMobile && suffix && <br />}
        {suffix && suffix}
      </small>
    </div>
  )
}

export default DecimalShow
