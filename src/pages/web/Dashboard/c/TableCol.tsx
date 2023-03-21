import React, { FC, useEffect, useState } from 'react'

import { calcDateDuration } from '@/utils/tools'

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
  timestamp: number
}

export const TableCountDown: FC<TableCountDownProps> = ({ timestamp }) => {
  const [estimatedTime, setEstimatedTime] = useState<[number, string, string, string, boolean]>([
    0,
    '0',
    '0',
    '0',
    false
  ])

  useEffect(() => {
    const timer: NodeJS.Timer = setInterval(function () {
      if (estimatedTime[4] && timer) return clearInterval(timer)
      setEstimatedTime(calcDateDuration(timestamp))
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [estimatedTime])

  return (
    <Button className="web-dashboard-table-countdown" size="medium">
      {`${estimatedTime[0]}d`} {estimatedTime[1]}:{estimatedTime[2]}:{estimatedTime[3]}
    </Button>
  )
}
