import dayjs from 'dayjs'
import { getKLineDAT as getKLineDataApi } from 'derify-apis-staging'

import { Rec } from '@/typings'
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

export const getKLineDAT = async (token: string, time: number, endTime: number, limit = 10, isInit: boolean) => {
  if (isInit) initToken = token
  if (token !== initToken) {
    await sleep(1000)
    return { data: [], more: true }
  }
  const { data } = await getKLineDataApi<{ data: Rec }>(token, time, endTime, limit)
  const filter = (data ?? []).filter((d: number[]) => d.slice(1).some((l) => l > 0))
  const klineData = calcKlineData(filter)
  const more = klineData.length === limit
  return {
    data: klineData,
    more
  }
}

export const reorganizeLastPieceOfData = (data: Record<string, any>[], spotPrices: string): Record<string, any>[] => {
  const pairSpotPrice = Number(spotPrices)

  if (pairSpotPrice === 0) return data

  const lastPieceOfData = data.pop() ?? {}
  const { high = 0, low = 0 } = lastPieceOfData
  const _low = Math.min(low, pairSpotPrice)
  const _high = Math.max(high, pairSpotPrice)

  return [...data, { ...lastPieceOfData, close: pairSpotPrice, high: _high, low: _low }]
}

export const getKlineEndTime = (): number => {
  const date = dayjs().format('YYYY-MM-DD')
  const hour = dayjs().hour()
  return dayjs(`${date} ${hour + 1}`).valueOf()
}
