import dayjs from 'dayjs'
import React, { FC, useContext } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

import { ThemeContext } from '@/providers/Theme'
import { keepDecimals } from '@/utils/tools'

interface FormatProps {
  label: string
  value: string
  color: string
}

interface Props {
  data: any[]
  chartId: string
  xKey: string
  xInterval?: number
  xMinTickGap?: number
  yFormat: FormatProps[]
  timeFormatStr: string
  enableLegend?: boolean
}

const AreaC: FC<Props> = ({
  chartId,
  data,
  xKey,
  yFormat,
  xInterval = 0,
  xMinTickGap = 10,
  timeFormatStr,
  enableLegend
}) => {
  const { theme } = useContext(ThemeContext)

  const formatTime = (value: string) => {
    return dayjs(value).format(timeFormatStr)
  }

  const formatValue = (value: number) => keepDecimals(value, 2)
  const formatLegend = (value: string) => {
    const o = yFormat.find((item) => item.value === value)
    return o?.label
  }
  const formatTip = (value: any, label: string) => {
    return [formatValue(value) as typeof value, formatLegend(label)]
  }

  const toolTipStyle = theme === 'Dark' ? { backgroundColor: '#222', color: '#fff', borderColor: '#444' } : {}

  return (
    <div className="web-chart-area-layout">
      <div className="web-chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={400}
            data={data}
            margin={{
              top: 30,
              right: 30,
              left: 30,
              bottom: 0
            }}
          >
            <defs>
              {yFormat.map((item) => (
                <linearGradient key={item.value} id={`${chartId}-${item.label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={item.color} stopOpacity={1} />
                  <stop offset="95%" stopColor={item.color} stopOpacity={0.3} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 0" vertical={false} />
            <XAxis
              fontSize={14}
              dataKey={xKey}
              interval={xInterval}
              minTickGap={xMinTickGap}
              tickFormatter={(value) => dayjs(value).format('DD')}
            />
            <YAxis fontSize={14} orientation="right" tickFormatter={formatValue} />
            {enableLegend && <Legend formatter={formatLegend} />}
            <Tooltip
              formatter={formatTip}
              labelFormatter={formatTime}
              cursor={{ fill: 'transparent' }}
              contentStyle={toolTipStyle}
            />
            {yFormat.map((item) => (
              <Bar key={item.value} dataKey={item.value} fillOpacity={1} fill={`url(#${chartId}-${item.label})`} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

AreaC.defaultProps = {
  enableLegend: true
}

export default AreaC
