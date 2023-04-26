import React, { PropsWithChildren } from 'react'
import cls from 'classnames'

import { SkeletonProps } from './interface'
import SkeletonRows from './SkeletonRows'

function SkeletonComponent(props: PropsWithChildren<SkeletonProps>) {
  const { loading = true, children, className, animation, rowsProps } = props

  const classNames = cls('web-c-skeleton', { 'web-c-skeleton-animate': animation }, className)

  return (
    <>
      {loading ? (
        <div className={classNames}>
          <SkeletonRows {...rowsProps} />
        </div>
      ) : (
        children
      )}
    </>
  )
}

SkeletonComponent.displayName = 'Skeleton'

export default SkeletonComponent
