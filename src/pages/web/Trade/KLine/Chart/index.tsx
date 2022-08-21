import React, { FC, useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useInterval } from 'react-use'

import { KLineTimes } from '@/data'
import { useContractData } from '@/store/contract/hooks'

import { Select } from '@/components/common/Form'
import Loading from '@/components/common/Loading'
import KLineChart from '@/components/common/Chart/KLine'

import { getKLineData, getKlineEndTime, reorganizeLastPieceOfData } from './help'

interface KlineChartProps {
  reset: () => void
  update: (data: any) => void
  initData: (data: any, more?: boolean) => void
}

const Chart: FC = () => {
  const store = useRef<Record<string, any>>({})
  const kline = useRef<KlineChartProps>(null)
  const { currentPair, pairs, pairsLoaded } = useContractData()

  const [timeLine, setTimeLine] = useState(60 * 60 * 1000)
  const [loading, setLoading] = useState<boolean>(false)

  const memoPairInfo = useMemo(() => {
    return pairs.find((pair) => pair.token === currentPair) ?? {}
  }, [pairs, currentPair])

  const getBaseData = useCallback(async () => {
    if (kline.current) {
      kline.current.reset()

      const { data, more } = await getKLineData(currentPair, timeLine, getKlineEndTime(), 100, true)

      // store.current = data[data.length - 1] // keep original data

      // const reorganize = reorganizeLastPieceOfData(data, pairs, currentPair)

      kline.current.initData(data, more)

      setLoading(false)
    }
  }, [pairs, timeLine, currentPair])

  const getMoreData = useCallback(async (lastTime: number) => {
    return await getKLineData(currentPair, timeLine, lastTime, 100, false)
  }, [])

  useInterval(() => {
    const func = async () => {
      if (kline.current) {
        // kline.current.update(store.current)

        const { data } = await getKLineData(currentPair, timeLine, getKlineEndTime(), 1, false)

        // store.current = data[0]

        // const reorganize = reorganizeLastPieceOfData(data, [memoPairInfo], currentPair)

        kline.current.update(data[0])
      }
    }
    void func()
  }, 6000)

  // todo: backup code
  // useEffect(() => {
  //   setLoading(true)
  //
  //   void getBaseData()
  // }, [timeLine, currentPair])
  //
  // useEffect(() => {
  //   if (pairsLoaded && memoPairInfo?.spotPrice) void getBaseData()
  // }, [memoPairInfo?.spotPrice, pairsLoaded])

  useEffect(() => {
    setLoading(true)

    if (pairsLoaded && memoPairInfo?.spotPrice) void getBaseData()
  }, [memoPairInfo?.spotPrice, pairsLoaded, timeLine, currentPair])

  return (
    <div className="web-trade-kline-chart">
      <Select value={timeLine} objOptions={KLineTimes} onChange={(val) => setTimeLine(Number(val))} />
      <div className="web-trade-kline-chart-layout">
        {/* @ts-ignore */}
        <KLineChart cRef={kline} getMoreData={(timeLine: number) => getMoreData(timeLine)} />
      </div>
      <Loading show={loading} type="float" />
    </div>
  )
}

export default Chart
