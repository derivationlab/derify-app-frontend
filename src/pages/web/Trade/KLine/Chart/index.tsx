import { isEmpty } from 'lodash'
import { useInterval } from 'react-use'
import React, { FC, useState, useCallback, useRef, useEffect } from 'react'

import { findToken } from '@/config/tokens'
import { KLineTimes } from '@/data'
import { useSpotPrice } from '@/hooks/useMatchConf'
import { useQuoteToken } from '@/zustand'
import { useMTokenFromRoute } from '@/hooks/useTrading'
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

  const quoteToken = useQuoteToken((state) => state.quoteToken)

  const marginToken = useMTokenFromRoute()

  const { spotPrice } = useSpotPrice(quoteToken, marginToken)

  const [loading, setLoading] = useState<boolean>(false)
  const [timeLine, setTimeLine] = useState(60 * 60 * 1000)
  const [chartData, setChartData] = useState<Record<string, any>[]>([])

  const getBaseData = useCallback(async () => {
    if (!onetime) setLoading(true)

    if (kline.current) {
      // kline.current.reset()

      const tokenAddress = findToken(quoteToken).tokenAddress
      const { data, more } = await getKLineData(tokenAddress, timeLine, getKlineEndTime(), 130, true)

      store.current = data[data.length - 1] // keep original data

      const reorganize = reorganizeLastPieceOfData(data, spotPrice)

      setChartData(reorganize)

      kline.current.initData(reorganize, more)
    }

    onetime = true
    setLoading(false)
  }, [spotPrice, timeLine])

  const getMoreData = useCallback(
    async (lastTime: number) => {
      const tokenAddress = findToken(quoteToken).tokenAddress

      return await getKLineData(tokenAddress, timeLine, lastTime, 50, false)
    },
    [quoteToken]
  )

  useInterval(() => {
    const func = async () => {
      if (kline.current) {
        const tokenAddress = findToken(quoteToken).tokenAddress

        const { data } = await getKLineData(tokenAddress, timeLine, getKlineEndTime(), 1, false)
        // console.info(timestamp, data[0]?.timestamp)
        if (store.current?.timestamp !== data[0]?.timestamp) {
          kline.current.update(store.current)
          store.current = data[0]
        }

        const reorganize = reorganizeLastPieceOfData(data, spotPrice)

        kline.current.update(reorganize[0])
      }
    }
    void func()
  }, 60000)

  useEffect(() => {
    void getBaseData()
  }, [timeLine, quoteToken])

  useEffect(() => {
    if (!isEmpty(store.current) && kline.current) {
      const reorganize = reorganizeLastPieceOfData([store.current], spotPrice)
      kline.current.update(reorganize[0])
    }
  }, [chartData, spotPrice])

  useEffect(() => {
    kline.current && kline.current.reset()
    setLoading(true)
  }, [quoteToken])

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
