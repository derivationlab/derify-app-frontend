import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import React, { FC } from 'react'
import { isMobile } from 'react-device-detect'

dayjs.extend(relativeTime)

interface TimeProps {
  time: string | number
}

export const RowTime: FC<TimeProps> = ({ time }) => {
  const timeFormat = isMobile ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
  return (
    <div className="web-broker-table-time">
      <time>{time ? dayjs(time).format(timeFormat) : 'No Tx.'}</time>
      {time && <em>{dayjs(time).fromNow()}</em>}
    </div>
  )
}

export const calcTimeStr = (time: string | number) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : 'No Tx.')

export default null
