import React, { FC, useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useInterval } from 'react-use'
import { isEmpty } from 'lodash'

import { KLineTimes } from '@/data'
import { useContractData } from '@/store/contract/hooks'
import { getKLineData, getKlineEndTime, reorganizeLastPieceOfData } from './help'

import { Select } from '@/components/common/Form'
import Loading from '@/components/common/Loading'
import KLineChart from '@/components/common/Chart/KLine'

interface KlineChartProps {
  reset: () => void
  update: (data: any) => void
  initData: (data: any, more?: boolean) => void
}

let onetime = false

const Chart: FC = () => {
  const store = useRef<Record<string, any>>({})
  const kline = useRef<KlineChartProps>(null)

  const { currentPair, pairs, pairsLoaded } = useContractData()

  const [loading, setLoading] = useState<boolean>(false)
  const [timeLine, setTimeLine] = useState(60 * 60 * 1000)
  const [chartData, setChartData] = useState<Record<string, any>[]>([])

  const memoPairInfo = useMemo(() => {
    return pairs.find((pair) => pair.token === currentPair) ?? {}
  }, [pairs, currentPair])

  const getBaseData = useCallback(async () => {
    if (!onetime) setLoading(true)

    if (kline.current) {
      // kline.current.reset()

      const { data, more } = await getKLineData(currentPair, timeLine, getKlineEndTime(), 130, true)

      store.current = data[data.length - 1] // keep original data

      const reorganize = reorganizeLastPieceOfData(data, pairs, currentPair)

      setChartData(reorganize)

      kline.current.initData(reorganize, more)
    }

    onetime = true
    setLoading(false)
  }, [pairs, timeLine, currentPair])

  const getMoreData = useCallback(async (lastTime: number) => {
    return await getKLineData(currentPair, timeLine, lastTime, 50, false)
  }, [])

  useInterval(() => {
    const func = async () => {
      if (kline.current) {
        const { data } = await getKLineData(currentPair, timeLine, getKlineEndTime(), 1, false)
        // console.info(timestamp, data[0]?.timestamp)
        if (store.current?.timestamp !== data[0]?.timestamp) {
          kline.current.update(store.current)
          store.current = data[0]
        }

        const reorganize = reorganizeLastPieceOfData(data, [memoPairInfo], currentPair)

        kline.current.update(reorganize[0])
      }
    }
    void func()
  }, 60000)

  useEffect(() => {
    if (pairsLoaded) void getBaseData()
  }, [pairsLoaded, timeLine, currentPair])

  useEffect(() => {
    if (!isEmpty(store.current) && kline.current) {
      const reorganize = reorganizeLastPieceOfData([store.current], [memoPairInfo], currentPair)
      kline.current.update(reorganize[0])
    }
  }, [chartData, memoPairInfo?.spotPrice])

  useEffect(() => {
    setLoading(true)
    if (kline.current) kline.current.reset()
  }, [currentPair])

  return (
    <div className="web-trade-kline-chart">
      <Select
        value={timeLine}
        objOptions={KLineTimes}
        onChange={(val) => {
          onetime = false
          setTimeLine(Number(val))
        }}
      />
      <div className="web-trade-kline-chart-layout">
        {/* @ts-ignore */}
        <KLineChart cRef={kline} getMoreData={(timeLine: number) => getMoreData(timeLine)} />
      </div>
      <Loading show={loading} type="float" />
    </div>
  )
}

export default Chart
