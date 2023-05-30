import { isEmpty } from 'lodash'

import React, { FC, useCallback, useRef, useEffect, useReducer, useMemo } from 'react'
import { useInterval } from 'react-use'

import KLineChart from '@/components/common/Chart/KLine'
import Select from '@/components/common/Form/Select'
import Spinner from '@/components/common/Spinner'
import { KLineTimes } from '@/data'
import { reducer, stateInit } from '@/reducers/kline'
import { useQuoteTokenStore, useTokenSpotPricesStore } from '@/store'
import { QuoteTokenState } from '@/store/types'

import { getKLineDAT, getKlineEndTime, reorganizeLastPieceOfData } from './help'

interface KlineChartProps {
  reset: () => void
  update: (data: any) => void
  initData: (data: any, more?: boolean) => void
}

let onetime = false

const Chart: FC = () => {
  const store = useRef<Record<string, any>>({})
  const kline = useRef<KlineChartProps>(null)
  const [state, dispatch] = useReducer(reducer, stateInit)

  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPrices)

  const spotPrice = useMemo(() => {
    return tokenSpotPrices?.[quoteToken.symbol] ?? '0'
  }, [quoteToken, tokenSpotPrices])

  const getBaseData = useCallback(async () => {
    if (!onetime) dispatch({ type: 'SET_KLINE_INIT', payload: { loaded: true } })

    if (kline.current) {
      // kline.current.reset()

      if (quoteToken.address) {
        const { data, more } = await getKLineDAT(quoteToken.address, state.kline.timeLine, getKlineEndTime(), 130, true)

        store.current = data[data.length - 1] // keep original data

        const reorganize = reorganizeLastPieceOfData(data, spotPrice)

        dispatch({ type: 'SET_KLINE_INIT', payload: { data: reorganize } })
        kline.current.initData(reorganize, more)
      } else {
        kline.current.initData([], false)
      }

      onetime = true
      dispatch({ type: 'SET_KLINE_INIT', payload: { loaded: false } })
    }
  }, [spotPrice, quoteToken, state.kline.timeLine])

  const getMoreData = useCallback(
    async (lastTime: number, timeLine: number) => {
      if (quoteToken.address) return await getKLineDAT(quoteToken.address, timeLine, lastTime, 50, false)
    },
    [quoteToken]
  )

  useInterval(() => {
    const func = async () => {
      if (kline.current && quoteToken.address) {
        const { data } = await getKLineDAT(quoteToken.address, state.kline.timeLine, getKlineEndTime(), 1, false)
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
    dispatch({ type: 'SET_KLINE_INIT', payload: { loaded: true } })
    void getBaseData()
  }, [quoteToken, state.kline.timeLine])

  useEffect(() => {
    if (!isEmpty(store.current) && kline.current) {
      const reorganize = reorganizeLastPieceOfData([store.current], spotPrice)
      kline.current.update(reorganize[0])
    }
  }, [spotPrice, state.kline.data])

  useEffect(() => {
    kline.current && kline.current.reset()
  }, [quoteToken])

  return (
    <div className="web-trade-kline-chart">
      <Select
        value={state.kline.timeLine}
        objOptions={KLineTimes}
        onChange={(val) => {
          onetime = false
          dispatch({ type: 'SET_KLINE_INIT', payload: { timeLine: Number(val) } })
        }}
      />
      <div className="web-trade-kline-chart-layout">
        {/* @ts-ignore */}
        <KLineChart cRef={kline} getMoreData={getMoreData} timeLine={state.kline.timeLine} />
      </div>
      {state.kline.loaded && <Spinner absolute />}
    </div>
  )
}

export default Chart
