import dayjs from 'dayjs'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

import React, { FC, useContext } from 'react'

import { ThemeContext } from '@/providers/Theme'
import { keepDecimals, numeralNumber } from '@/utils/tools'

interface Props {
  data: any[]
  chartId: string
  xKey: string
  yKey: string
  yLabel: string
  timeFormatStr: string
}

const AreaC: FC<Props> = ({ chartId, data, xKey, yKey, yLabel, timeFormatStr }) => {
  const { theme } = useContext(ThemeContext)
  const formatTime = (value: string) => {
    return dayjs(value).format(timeFormatStr)
  }
  const formatValue = (value: number) => numeralNumber(value, 2)
  const formatTip = (value: any) => [formatValue(value) as typeof value, yLabel]
  const toolTipStyle = theme === 'Dark' ? { backgroundColor: '#222', color: '#fff', borderColor: '#444' } : {}

  return (
    <div className="web-chart-area-layout">
      <div className="web-chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            width={500}
            height={400}
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 30,
              bottom: 0
            }}
          >
            <defs>
              <linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E7446B" stopOpacity={1} />
                <stop offset="95%" stopColor="#E7446B" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 0" vertical={false} />
            <XAxis
              fontSize={12}
              dataKey={xKey}
              interval={data.length > 20 ? Math.ceil(data.length / 20) : 0}
              tickFormatter={(value) => dayjs(value).format('DD')}
            />
            <YAxis fontSize={12} orientation="right" tickFormatter={formatValue} />
            <Tooltip formatter={formatTip} labelFormatter={formatTime} contentStyle={toolTipStyle} />
            <Area type="monotone" dataKey={yKey} stroke="#E7446B" fillOpacity={1} fill={`url(#${chartId})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default AreaC
