import classNames from 'classnames'

import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

export interface DirectionProps {
  direction: 'Short' | 'SHORT' | 'short' | 'Long' | 'LONG' | 'long' | 'twoWay'
}

export interface MultipleStatusProps extends DirectionProps {
  multiple?: number
}

const MultipleStatus: FC<MultipleStatusProps> = ({ multiple, direction }) => {
  const { t } = useTranslation()
  return (
    <div
      className={classNames('web-trade-multiple-status', `status-${direction.toLocaleLowerCase()}`, {
        'no-multiple': !multiple
      })}
    >
      <span>{t(`common.${direction.toLocaleLowerCase()}`)}</span>
      {multiple && <em>{multiple}x</em>}
    </div>
  )
}

export default MultipleStatus
