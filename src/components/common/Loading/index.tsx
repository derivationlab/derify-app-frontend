import React, { FC, useMemo } from 'react'
import { createPortal } from 'react-dom'
import classNames from 'classnames'

interface Props {
  show: boolean
  type: 'section' | 'fixed' | 'float'
  height?: string
}

const Loading: FC<Props> = ({ show, type, height }) => {
  const LoadingTsx = useMemo(
    () => (
      <div className={classNames('web-loading', `web-loading-type-${type}`)} style={{ height }}>
        <div className="web-loading-inner">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    ),
    [type, height]
  )
  if (!show) return null
  if (type === 'fixed') {
    return createPortal(LoadingTsx, document.body)
  }
  return LoadingTsx
}

Loading.defaultProps = {
  show: false,
  type: 'section',
  height: `100%`
}

export default Loading
