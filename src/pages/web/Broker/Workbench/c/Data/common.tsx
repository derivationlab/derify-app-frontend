import React, { FC, useContext } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { MobileContext } from '@/providers/Mobile'
import { calcShortHash as _calcShortHash } from '@/utils/tools'

dayjs.extend(relativeTime)

interface TimeProps {
  time: string | number
}

export const RowTime: FC<TimeProps> = ({ time }) => {
  const { mobile } = useContext(MobileContext)
  const timeFormat = mobile ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
  return (
    <div className="web-broker-table-time">
      <time>{time ? dayjs(time).format(timeFormat) : 'No Tx.'}</time>
      {time && <em>{dayjs(time).fromNow()}</em>}
    </div>
  )
}

export const calcTimeStr = (time: string | number) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : 'No Tx.')

export const calcShortHash = _calcShortHash

export default null
