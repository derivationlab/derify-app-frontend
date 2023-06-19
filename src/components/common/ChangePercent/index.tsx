import classNames from 'classnames'

import React, { FC, useMemo } from 'react'

import { bnMul, keepDecimals } from '@/utils/tools'

interface Props {
  value: number
  size?: string
}

const ChangePercent: FC<Props> = ({ value, size }) => {
  const [valStr, isUp] = useMemo(() => {
    const isUp = value >= 0
    const valStr = `${isUp ? '+' : ''}${keepDecimals(bnMul(value, 100), 2)}%`
    return [valStr, isUp]
  }, [value])
  return (
    <div className={classNames('web-change-percent', `web-change-percent-size-${size}`, { up: isUp }, { down: !isUp })}>
      <span>{valStr}</span>
    </div>
  )
}

ChangePercent.defaultProps = {
  size: 'default'
}

export default ChangePercent
