import React, { FC, useRef, useState, useMemo } from 'react'
import { useClickAway } from 'react-use'
import classNames from 'classnames'

import Button from '@/components/common/Button'
import Slider from '@/components/common/Slider'

import Stepper from './Stepper'

interface Props {
  value: number
  onChange: (value: number) => void
  className?: string
}

const LeverageSelect: FC<Props> = ({ value, onChange, className }) => {
  const ref = useRef(null)

  const [multiple, setMultiple] = useState(30)
  const [showOptions, setShowOptions] = useState(false)

  const onConfirm = () => {
    onChange(multiple)
    setShowOptions(false)
  }

  useClickAway(ref, () => setShowOptions(false))

  return (
    <div className={classNames('web-leverage-select', { show: showOptions }, className)} ref={ref}>
      <div className="web-leverage-select-curr" onClick={() => setShowOptions(!showOptions)}>
        {value}x
      </div>
      <div className="web-leverage-select-stepper">
        <Stepper value={multiple} min={1} onChange={setMultiple} suffix="X" max={75} input />
        <Slider value={multiple} onChange={setMultiple} suffix="X" marks={[1, 15, 30, 45, 60, 75]} />
        <Button full size="medium" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  )
}

export default LeverageSelect
