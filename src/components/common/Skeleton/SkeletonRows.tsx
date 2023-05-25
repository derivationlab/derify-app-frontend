import cls from 'classnames'
import { times } from 'lodash'

import React, { FC } from 'react'

import { SkeletonRowsProps } from './interface'

const SkeletonRows: FC<SkeletonRowsProps> = ({ rows = 3, className }) => {
  const classNames = cls('skeleton-rows', className)

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
