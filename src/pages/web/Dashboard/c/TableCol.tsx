import React, { FC, useEffect, useState } from 'react'

import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
import { getJsonRpcProvider } from '@/utils/contractHelpers'
import { calcDateDuration } from '@/utils/tools'

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
  cycle: number
  blockNumber: number
}

export const TableCountDown: FC<TableCountDownProps> = ({ cycle, blockNumber }) => {
  const [initTimestamp, setInitTimestamp] = useState<number>(0)
  const [estimatedTime, setEstimatedTime] = useState<[number, string, string, string, boolean]>([
    0,
    '0',
    '0',
    '0',
    false
  ])

  const funcAsync = async (blockNumber: number) => {
    const { timestamp } = await getJsonRpcProvider().getBlock(blockNumber)
    setInitTimestamp((timestamp ?? 0) * 1000 + cycle * 3 * 1000)
  }

  useEffect(() => {
    if (blockNumber > 0) void funcAsync(blockNumber)
  }, [])

  useEffect(() => {
    const timer: NodeJS.Timer = setInterval(function () {
      if (estimatedTime[4] && timer) return clearInterval(timer)
      if (initTimestamp > 0) setEstimatedTime(calcDateDuration(initTimestamp))
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [estimatedTime, initTimestamp])

  return (
    <Button className="web-dashboard-table-countdown" size="medium">
      {`${estimatedTime[0]}d`} {estimatedTime[1]}:{estimatedTime[2]}:{estimatedTime[3]}
    </Button>
  )
}
