import classNames from 'classnames'
import { times } from 'lodash'
import invariant from 'tiny-invariant'

import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useClickAway, useToggle } from 'react-use'

import Button from '@/components/common/Button'
import Slider from '@/components/common/Slider'
import { getPosMaxLeverage } from '@/funcs/helper'
import { useQuoteTokenStore } from '@/store'
import { QuoteTokenState } from '@/store/types'

import Stepper from './Stepper'

interface Props {
  value: number
  onChange: (value: number) => void
  className?: string
}

const calcLeverageMarks = (max: number, limit = 6): number[] => {
  const need = limit - 1

  invariant(
    max > 0 && max % need === 0,
    `Please check the value: ${max}, the expected value is a multiple of ${need} & > 0`
  )

  const multiple = max / need

  if (multiple === 1) return times(need, (index) => ++index * multiple)
  return times(limit, (index) => (index === 0 ? 1 : index * multiple))
}

const LeverageSelect: FC<Props> = ({ onChange, className }) => {
  const ref = useRef(null)
  const [isVisible, toggleVisible] = useToggle(false)
  const [multiple, setMultiple] = useState<number>(0)
  const [maxLeverage, setMaxLeverage] = useState<number>(0)
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)

  const sliderMarks = useMemo(() => (maxLeverage > 0 ? calcLeverageMarks(maxLeverage) : []), [maxLeverage])

  const onConfirm = () => {
    onChange(multiple)
    toggleVisible(false)
  }

  const getMaxLeverage = useCallback(async () => {
    const leverage = await getPosMaxLeverage(quoteToken.derivative)
    setMaxLeverage(Number(leverage))
  }, [quoteToken])

  useEffect(() => {
    if (maxLeverage === 0) {
      setMultiple(0)
    } else {
      // onChange(maxLeverage)
      // setMultiple(maxLeverage)

      const m = maxLeverage >= 30 ? 30 : maxLeverage
      onChange(m)
      setMultiple(m)
    }
  }, [quoteToken, maxLeverage])

  useEffect(() => {
    void getMaxLeverage()
  }, [quoteToken])

  useClickAway(ref, () => toggleVisible(false))

  return (
    <div className={classNames('web-leverage-select', { show: isVisible }, className)} ref={ref}>
      <div className='web-leverage-select-curr' onClick={() => toggleVisible()}>
        {multiple}x
      </div>
      <div className='web-leverage-select-stepper'>
        <Stepper value={multiple} min={1} onChange={setMultiple} suffix='X' max={maxLeverage} input />
        <Slider value={multiple} onChange={setMultiple} suffix='X' marks={sliderMarks} />
        <Button full size='medium' onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  )
}

export default LeverageSelect
