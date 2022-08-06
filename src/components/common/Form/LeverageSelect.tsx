import React, { FC, useRef, useState, useMemo } from 'react'
import { useClickAway } from 'react-use'
import classNames from 'classnames'

import Button from '@/components/common/Button'

import Stepper from './Stepper'

interface Props {
  value: number
  onChange: (value: number) => void
  className?: string
}

const LeverageSelect: FC<Props> = ({ value, onChange, className }) => {
  const ref = useRef(null)
  const [showOptions, setShowOptions] = useState(false)
  const [stepperValue, setStepperValue] = useState(value)
  useClickAway(ref, () => setShowOptions(false))

  const onConfirm = () => {
    onChange(stepperValue)
    setShowOptions(false)
  }

  return (
    <div className={classNames('web-leverage-select', { show: showOptions }, className)} ref={ref}>
      <div className="web-leverage-select-curr" onClick={() => setShowOptions(!showOptions)}>
        {value}x
      </div>
      <div className="web-leverage-select-stepper">
        <Stepper value={stepperValue} min={1} onChange={(val) => setStepperValue(val)} suffix="x" input />
        <Button size="medium" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  )
}

export default LeverageSelect
