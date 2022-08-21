import dayjs from 'dayjs'

import { getKLineData as getKLineDataApi } from '@/api'
import { sleep } from '@/utils/tools'

interface klineData {
  open: number
  low: number
  high: number
  close: number
  timestamp: number
}

export const calcKlineData = (data: [number, number, number, number, number][]): klineData[] => {
  return (data ?? []).map((item, index) => {
    const timestamp = item[0] * 1000
    const open = index === 0 ? item[1] : data[index - 1][4]
    const close = item[4]
    const high = Math.max(open, item[2], item[3], close)
    const low = Math.min(open, item[2], item[3], close)
    return {
      timestamp,
      open,
      high,
      low,
      close
    }
  })
}

let initToken = ''

export const getKLineData = async (token: string, time: number, endTime: number, limit = 10, isInit: boolean) => {
  if (isInit) initToken = token
  if (token !== initToken) {
    await sleep(3000)
    return { data: [], more: true }
  }
  const data = await getKLineDataApi(token, time, endTime, limit)
  const klineData = calcKlineData(data)
  const more = klineData.length === limit
  return {
    data: klineData,
    more
  }
}

export const reorganizeLastPieceOfData = (
  data: Record<string, any>[],
  pairs: Record<string, any>[],
  current: string
): Record<string, any>[] => {
  const lastPieceOfData = data.pop()
  const targetPairsData = pairs.find((pair) => pair.token === current) ?? {}
  return [...data, { ...lastPieceOfData, close: Number(targetPairsData.spotPrice ?? 0) }]
}

export const getKlineEndTime = (): number => {
  const date = dayjs().format('YYYY-MM-DD')
  const hour = dayjs().hour()
  // console.info(dayjs(`${date} 16`).valueOf())
  return dayjs(`${date} ${hour + 1}`).valueOf()
}
