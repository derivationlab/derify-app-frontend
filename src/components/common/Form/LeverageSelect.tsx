import classNames from 'classnames'
import { times } from 'lodash'
import invariant from 'tiny-invariant'

import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useClickAway } from 'react-use'

import Button from '@/components/common/Button'
import Slider from '@/components/common/Slider'
import { useDerivativeListStore, useQuoteTokenStore } from '@/store'
import { QuoteTokenState } from '@/store/types'

import Stepper from './Stepper'

interface Props {
  value: number
  onChange: (value: number) => void
  className?: string
}

const calcLeverageMarks = (max: number, limit = 7): number[] => {
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

  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const posMaxLeverage = useDerivativeListStore((state) => state.posMaxLeverage)

  const [multiple, setMultiple] = useState(0)
  const [showOptions, setShowOptions] = useState(false)

  const maxLeverage = useMemo(() => {
    return posMaxLeverage ? Number(posMaxLeverage[quoteToken.symbol] ?? 0) : 0
  }, [quoteToken, posMaxLeverage])

  const leverageMarks = useMemo(() => {
    if (maxLeverage > 0) return calcLeverageMarks(maxLeverage)
    return []
  }, [maxLeverage])

  const onConfirm = () => {
    onChange(multiple)
    setShowOptions(false)
  }

  useEffect(() => {
    if (maxLeverage === 0) {
      setMultiple(0)
      return
    }
    if (maxLeverage >= 30) {
      setMultiple(30)
      return
    }
    setMultiple(maxLeverage)
  }, [maxLeverage])

  useClickAway(ref, () => setShowOptions(false))

  return (
    <div className={classNames('web-leverage-select', { show: showOptions }, className)} ref={ref}>
      <div className="web-leverage-select-curr" onClick={() => setShowOptions(!showOptions)}>
        {multiple}x
      </div>
      <div className="web-leverage-select-stepper">
        <Stepper value={multiple} min={1} onChange={setMultiple} suffix="X" max={maxLeverage} input />
        <Slider value={multiple} onChange={setMultiple} suffix="X" marks={leverageMarks} />
        <Button full size="medium" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  )
}

export default LeverageSelect
