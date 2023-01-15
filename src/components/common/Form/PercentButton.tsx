// PercentButton
import BN from 'bignumber.js'
import classNames from 'classnames'
import React, { FC, useEffect, useMemo, useState } from 'react'
import ReactSlider from 'react-slider'

import { useContractData } from '@/store/contract/hooks'
import { nonBigNumberInterception } from '@/utils/tools'

interface Props {
  value: number | string
  decimal?: number
  onChange: (value: number) => void
  currValue?: number | string
}

const list = [0.25, 0.5, 0.75, 1]
const _ReactSlider = ReactSlider as any

const PercentButton: FC<Props> = ({ value, onChange, currValue, decimal = 8 }) => {
  const [type, setType] = useState(false)
  const { currentPair } = useContractData()
  const [valueIndex, setValueIndex] = useState<number>(-1)

  const values = useMemo(() => {
    return list.map((item) => Number(nonBigNumberInterception(String(new BN(value).times(item)), decimal)))
  }, [value])
  const submitChange = (index: number) => {
    onChange(values[index])
    setValueIndex(index)
  }

  const onSliderChange = (e: number) => {
    onChange(Number(nonBigNumberInterception(String(new BN(e).div(100).times(value)), decimal)))
  }

  useEffect(() => {
    if (currentPair && valueIndex > -1) onChange(values[valueIndex])
  }, [currentPair, values, valueIndex])

  return (
    <div className="web-percent-button">
      {type ? (
        <div className="web-percent-button-slider-layout">
          <_ReactSlider
            className="c-slider"
            thumbClassName="c-slider-thumb"
            trackClassName="c-slider-track"
            onChange={onSliderChange}
            renderThumb={(props: any, state: any) => (
              <div {...props}>
                <u>{state.valueNow}%</u>
              </div>
            )}
          />
        </div>
      ) : (
        <div className="web-percent-buttons">
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
      )}

      <div className={classNames('web-percent-button-switch', { active: type })} onClick={() => setType(!type)} />
    </div>
  )
}

export default PercentButton
