import { init, Chart } from 'klinecharts'

import React, { FC, useState, useEffect, useRef, useImperativeHandle, useContext } from 'react'

import { ThemeContext } from '@/providers/Theme'

import KLineConfig from './config'

export interface KLineDataProps {
  open: number
  close: number
  high: number
  low: number
  volume?: number
  turnover?: number
  timestamp: number
}

interface KlineChartProps {
  reset: () => void
  initData: (data: any, more?: boolean) => void
  update: (data: any) => void
}

interface Props {
  cRef: KlineChartProps | null
  timeLine: number
  pricePrecision: number
  getMoreData: (time: number, timeLine: number) => Promise<{ data: KLineDataProps[]; more: boolean }>
}

const KLine: FC<Props> = ({ cRef, timeLine, getMoreData, pricePrecision }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<Chart | null>(null)
  const { theme } = useContext(ThemeContext)

  // @ts-ignore
  useImperativeHandle(cRef, () => ({
    reset: () => {
      if (chart) chart.clearData()
    },
    initData: (data: KLineDataProps[], more: boolean) => {
      if (chart) chart.applyNewData(data, more)
    },
    update: (data: KLineDataProps) => {
      if (chart) chart.updateData(data)
    }
  }))

  useEffect(() => {
    if (chartRef.current) setChart(init(chartRef.current, KLineConfig(theme)))
  }, [chartRef])

  useEffect(() => {
    if (chart) {
      chart.loadMore(async (time) => {
        const { data, more } = await getMoreData(time, timeLine)
        if (data) chart.applyMoreData(data, more)
      })
    }
  }, [chart, timeLine])

  useEffect(() => {
    if (chart) chart.setStyleOptions(KLineConfig(theme))
  }, [theme, chart])

  useEffect(() => {
    if (chart) chart.setPriceVolumePrecision(pricePrecision, pricePrecision)
  }, [chart, pricePrecision])

  return <div id="web-kline-base" className="web-kline" ref={chartRef} />
}

export default KLine
