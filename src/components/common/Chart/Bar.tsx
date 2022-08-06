import React, { FC, useContext } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import dayjs from 'dayjs'
import numeral from 'numeral'

import ThemeContext from '@/context/Theme/Context'

interface FormatProps {
  label: string
  value: string
  color: string
}

interface Props {
  data: any[]
  chartId: string
  xKey: string
  yFormat: FormatProps[]
  timeFormatStr: string
  enableLegend?: boolean
}

const AreaC: FC<Props> = ({ chartId, data, xKey, yFormat, timeFormatStr, enableLegend }) => {
  const { theme } = useContext(ThemeContext)

  const formatTime = (value: string) => {
    return dayjs(value).format(timeFormatStr)
  }

  const formatValue = (value: number) => numeral(value).format('0,0.00')
  const formatLegend = (value: string) => {
    const o = yFormat.find((item) => item.value === value)
    return o?.label
  }
  const formatTip = (value: any, label: string) => {
    return [formatValue(value), formatLegend(label)]
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
                  <stop offset="95%" stopColor={item.color} stopOpacity={0.2} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 0" vertical={false} />
            <XAxis dataKey={xKey} minTickGap={10} tickFormatter={formatTime} />
            <YAxis orientation="right" tickFormatter={formatValue} />
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
