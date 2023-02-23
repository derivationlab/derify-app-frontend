import React, { FC, useMemo, useContext } from 'react'
import classNames from 'classnames'

import { MobileContext } from '@/context/Mobile'

export interface DecimalShowProps {
  value: number
  percent?: boolean
  black?: boolean
  suffix?: string
}

const DecimalShow: FC<DecimalShowProps> = ({ value, percent, suffix, black }) => {
  const { mobile } = useContext(MobileContext)

  const [int, dec] = useMemo(() => {
    const strVal = String(value)
    if (strVal.includes('.')) {
      return strVal.split('.')
    }
    return [strVal, '00']
  }, [value])
  return (
    <div className={classNames('web-decimal-show', { black })}>
      <em>{int}</em>
      <small>
        {`.${dec}${percent && '%'}`}
        {mobile && suffix && <br />}
        {suffix}
      </small>
    </div>
  )
}

export default DecimalShow
