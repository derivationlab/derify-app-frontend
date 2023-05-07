import { isEmpty } from 'lodash'
import { useInterval } from 'react-use'
import React, { FC, useState, useCallback, useRef, useEffect } from 'react'
import { findToken } from '@/config/tokens'
import { KLineTimes } from '@/data'
import { useMarginTokenStore, usePairsInfoStore, useQuoteTokenStore } from '@/store'
import { getKLineDAT, getKlineEndTime, reorganizeLastPieceOfData } from './help'
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

  const spotPrices = usePairsInfoStore((state) => state.spotPrices)
  const quoteToken = useQuoteTokenStore((state) => state.quoteToken)
  const marginToken = useMarginTokenStore((state) => state.marginToken)

  const [loading, setLoading] = useState<boolean>(false)
  const [timeLine, setTimeLine] = useState(60 * 60 * 1000)
  const [chartData, setChartData] = useState<Record<string, any>[]>([])

  const getBaseData = useCallback(async () => {
    if (!onetime) setLoading(true)

    if (kline.current) {
      // kline.current.reset()

      const tokenAddress = findToken(quoteToken).tokenAddress
      const { data, more } = await getKLineDAT(tokenAddress, timeLine, getKlineEndTime(), 130, true)

      store.current = data[data.length - 1] // keep original data

      const reorganize = reorganizeLastPieceOfData(data, spotPrices[marginToken][quoteToken])

      setChartData(reorganize)

      kline.current.initData(reorganize, more)
    }

    onetime = true
    setLoading(false)
  }, [spotPrices[marginToken][quoteToken], timeLine])

  const getMoreData = useCallback(
    async (lastTime: number) => {
      const tokenAddress = findToken(quoteToken).tokenAddress

      return await getKLineDAT(tokenAddress, timeLine, lastTime, 50, false)
    },
    [quoteToken]
  )

  useInterval(() => {
    const func = async () => {
      if (kline.current) {
        const tokenAddress = findToken(quoteToken).tokenAddress

        const { data } = await getKLineDAT(tokenAddress, timeLine, getKlineEndTime(), 1, false)
        // console.info(timestamp, data[0]?.timestamp)
        if (store.current?.timestamp !== data[0]?.timestamp) {
          kline.current.update(store.current)
          store.current = data[0]
        }

        const reorganize = reorganizeLastPieceOfData(data, spotPrices[marginToken][quoteToken])

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
      const reorganize = reorganizeLastPieceOfData([store.current], spotPrices[marginToken][quoteToken])
      kline.current.update(reorganize[0])
    }
  }, [chartData, spotPrices[marginToken][quoteToken]])

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
