import React, { FC, useState, useCallback, useRef, useEffect } from 'react'
import { useInterval } from 'react-use'
import { useContractData } from '@/store/contract/hooks'

import { sleep } from '@/utils/tools'

import { KLineTimes } from '@/data'

import KLineChart from '@/components/common/Chart/KLine'
import { Select } from '@/components/common/Form'
import Loading from '@/components/common/Loading'

import { getKLineData } from './help'

interface KlineChartProps {
  reset: () => void
  initData: (data: any, more?: boolean) => void
  update: (data: any) => void
}

const Chart: FC = () => {
  const kline = useRef<KlineChartProps>(null)
  const { currentPair, pairs, pairsLoaded } = useContractData()

  const [time, setTime] = useState(60 * 60 * 1000)
  const [loading, setLoading] = useState<boolean>(false)

  const handleTradeData = (data: Record<string, any>[], pairs: Record<string, any>[]): Record<string, any>[] => {
    const last = data.pop()
    const target = pairs.find((pair) => pair.token === currentPair) ?? {}
    return [...data, { ...last, close: Number(target.spotPrice) }]
  }

  const getBaseData = useCallback(
    async (pairs: Record<string, any>[]) => {
      if (kline.current) {
        setLoading(true)
        kline.current.reset()
        const { data, more } = await getKLineData(currentPair, time, +new Date(), 100, true)
        kline.current.initData(handleTradeData(data, pairs), more)
        setLoading(false)
      }
    },
    [time, currentPair]
  )

  const getMoreData = useCallback(async (lastTime: number) => {
    return await getKLineData(currentPair, time, lastTime, 100, false)
  }, [])

  useInterval(async () => {
    if (kline.current) {
      const { data } = await getKLineData(currentPair, time, +new Date(), 1, false)
      kline.current.update(handleTradeData(data, pairs))
    }
  }, 60000)

  useEffect(() => {
    if (pairsLoaded) void getBaseData(pairs)
  }, [time, currentPair, pairsLoaded])

  return (
    <div className="web-trade-kline-chart">
      <Select value={time} objOptions={KLineTimes} onChange={(val) => setTime(Number(val))} />
      <div className="web-trade-kline-chart-layout">
        {/* @ts-ignore */}
        <KLineChart cRef={kline} getMoreData={(time: number) => getMoreData(time)} />
      </div>
      <Loading show={loading} type="float" />
    </div>
  )
}

export default Chart
