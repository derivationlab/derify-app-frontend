import classNames from 'classnames'
import { times } from 'lodash-es'

import React, { FC, useMemo } from 'react'

interface Props {
  alertLevel?: number
}

const Reminder: FC<Props> = ({ alertLevel = 0 }) => {
  const items = useMemo(() => {
    return times(5, (index) => {
      return index < alertLevel ? (
        <li
          key={`${alertLevel}-${index}`}
          className={classNames({ r1: index <= alertLevel, r2: alertLevel === 4, r3: alertLevel === 5 })}
        />
      ) : (
        <li key={`${alertLevel}-${index}`} />
      )
    })
  }, [alertLevel])

  return <ul className="web-trade-data-reminder">{items.map((item) => item)}</ul>
}

export default Reminder
