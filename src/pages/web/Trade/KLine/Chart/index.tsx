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
  const { currentPair } = useContractData()
  const [time, setTime] = useState(60 * 60 * 1000)
  const [loading, setLoading] = useState<boolean>(false)
  const kline = useRef<KlineChartProps>(null)

  const getBaseData = useCallback(async () => {
    if (kline.current) {
      setLoading(true)
      kline.current.reset()
      const { data, more } = await getKLineData(currentPair, time, +new Date(), 100, true)
      kline.current.initData(data, more)
      setLoading(false)
    }
  }, [time, currentPair])

  const getMoreData = useCallback(async (lastTime: number) => {
    return await getKLineData(currentPair, time, lastTime, 100, false)
  }, [])

  useInterval(async () => {
    if (kline.current) {
      const { data } = await getKLineData(currentPair, time, +new Date(), 1, false)
      kline.current.update(data)
    }
  }, 60000)

  useEffect(() => {
    void getBaseData()
  }, [time, currentPair])

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
