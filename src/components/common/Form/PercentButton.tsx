// PercentButton
import BN from 'bignumber.js'
import classNames from 'classnames'
import React, { FC, useEffect, useMemo, useState } from 'react'

import { useContractData } from '@/store/contract/hooks'
import { nonBigNumberInterception } from '@/utils/tools'

interface Props {
  value: number | string
  decimal?: number
  onChange: (value: number) => void
  currValue?: number | string
}

const list = [0.25, 0.5, 0.75, 1]

const PercentButton: FC<Props> = ({ value, onChange, currValue, decimal = 8 }) => {
  const { currentPair } = useContractData()

  const [valueIndex, setValueIndex] = useState<number>(-1)

  const values = useMemo(() => {
    return list.map((item) => Number(nonBigNumberInterception(String(new BN(value).times(item)), decimal)))
  }, [value])

  const submitChange = (index: number) => {
    onChange(values[index])
    setValueIndex(index)
  }

  useEffect(() => {
    if (currentPair && valueIndex > -1) onChange(values[valueIndex])
  }, [currentPair, values, valueIndex])

  return (
    <div className="web-percent-button">
      {list.map((percent: number, index: number) => (
        <span
          key={percent}
          onClick={() => submitChange(index)}
          className={classNames({ active: Number(currValue) === values[index] && Number(currValue) })}
        >
          {percent * 100}%
        </span>
      ))}
    </div>
  )
}

export default PercentButton
