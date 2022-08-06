import React, { FC, useState, useEffect, useImperativeHandle, ChangeEvent } from 'react'
import classNames from 'classnames'
interface Props {
  value?: number
  min?: number
  max?: number
  step?: number
  size?: 'default' | 'mini'
  onChange?: (value: number) => void
  cRef?: any
  suffix?: string
  className?: string
  input: boolean
}

const Stepper: FC<Props> = ({
  size = 'default',
  value = 0,
  min = 0,
  max = 10,
  step = 1,
  onChange,
  cRef,
  suffix,
  className,
  input
}) => {
  const [currValue, setCurrValue] = useState(value)
  const [currTime, setCurrTime] = useState(0)
  const changeValue = (val: number): void => {
    if (val >= min && val <= max) {
      setCurrValue(val)
    }
  }
  useEffect(() => {
    onChange?.(currValue)
  }, [currValue, onChange])

  useImperativeHandle(cRef, () => ({
    reset() {
      setCurrValue(min)
    }
  }))
  const isTouch: boolean = 'ontouchstart' in window

  const touchStart = (type: string) => {
    setCurrTime(+new Date())
    console.log(type)
  }
  const touchEnd = (action: string, type: string): void => {
    if (type === 'mouse' && isTouch) return

    const now = +new Date()
    const diffTime = now - currTime
    if (diffTime > 400) {
      if (action === 'add') {
        changeValue(max)
      }
      if (action === 'sub') {
        changeValue(min)
      }
    } else {
      if (action === 'add') {
        changeValue(currValue + step)
      }
      if (action === 'sub') {
        changeValue(currValue - step)
      }
    }
  }

  const inputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const v = Number(e.target.value)
    changeValue(v > max ? max : v < min ? min : v)
  }
  return (
    <div className={classNames('web-stepper', `web-stepper-size-${size}`, className)}>
      <button
        className="web-stepper-sub"
        disabled={currValue <= min}
        onTouchStart={() => touchStart('touch')}
        onTouchEnd={() => touchEnd('sub', 'touch')}
        onMouseDown={() => touchStart('mouse')}
        onMouseUp={() => touchEnd('sub', 'mouse')}
      >
        <i />
      </button>
      {input ? (
        <input type="number" value={currValue} onChange={inputChange} />
      ) : (
        <label>
          {currValue}
          {suffix}
        </label>
      )}
      <button
        className="web-stepper-add"
        disabled={currValue >= max}
        onTouchStart={() => touchStart('touch')}
        onTouchEnd={() => touchEnd('add', 'touch')}
        onMouseDown={() => touchStart('mouse')}
        onMouseUp={() => touchEnd('add', 'mouse')}
      >
        <i />
      </button>
    </div>
  )
}

export default Stepper
