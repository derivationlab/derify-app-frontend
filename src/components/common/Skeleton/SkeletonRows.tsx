import cls from 'classnames'
import { isArray, times } from 'lodash'

import React, { FC } from 'react'

import { SkeletonRowsProps } from './interface'

const SkeletonRows: FC<SkeletonRowsProps> = ({ rows = 3, width = '60%', className }) => {
  const classNames = cls('skeleton-rows', className)

  const calcRowsWidth = (index: number) => {
    if (isArray(width)) {
      return width[index]
    }
    if (rows - 1 === index) {
      return width
    }

    return undefined
  }

  return (
    <div className="web-c-skeleton-content">
      <ul className={classNames}>
        {times(rows, (i) => {
          return <li className="web-c-skeleton-row" key={i} />
        })}
      </ul>
    </div>
  )
}

export default SkeletonRows
