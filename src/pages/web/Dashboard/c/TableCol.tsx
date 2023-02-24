import React, { FC } from 'react'
import Countdown from 'react-countdown'
import numeral from 'numeral'

import Image from '@/components/common/Image'
import Button from '@/components/common/Button'

interface TableMarginProps {
  icon: string
  name: string
}

export const TableMargin: FC<TableMarginProps> = ({ icon, name }) => {
  return (
    <div className="web-dashboard-table-margin">
      <Image src={icon} />
      <span>{name}</span>
    </div>
  )
}

interface TableCountDownProps {
  date: number
}

export const TableCountDown: FC<TableCountDownProps> = ({ date }) => {
  const renderer = (props: any) => {
    const { days, hours, minutes, seconds, completed } = props
    return (
      <Button className="web-dashboard-table-countdown" size="medium" disabled={completed}>
        {days ? `${days}d` : ''} {numeral(hours).format('00')}:{numeral(minutes).format('00')}:
        {numeral(seconds).format('00')}
      </Button>
    )
  }
  return <Countdown date={date} renderer={renderer} />
}
