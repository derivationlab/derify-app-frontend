import React, { FC, useMemo, useContext } from 'react'

import { MobileContext } from '@/context/Mobile'

export interface DecimalShowProps {
  value: number
  percent?: boolean
  suffix?: string
}

const DecimalShow: FC<DecimalShowProps> = ({ value, percent, suffix }) => {
  const { mobile } = useContext(MobileContext)

  const [int, dec] = useMemo(() => {
    const strVal = String(value)
    if (strVal.includes('.')) {
      return strVal.split('.')
    }
    return [strVal, '00']
  }, [value])
  return (
    <div className="web-decimal-show">
      <em>{int}</em>
      <small>
        {`.${dec}${percent && '%'}`}
        {mobile && <br />}
        {suffix}
      </small>
    </div>
  )
}

export default DecimalShow
