import React, { FC } from 'react'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { BarChart } from '@/components/common/Chart'

const data = [
  {
    value: 2400,
    time: 1677143943900
  },
  {
    value: 1398,
    time: 1677144943900
  },
  {
    value: 9800,
    time: 1677145943900
  },
  {
    value: 3908,
    time: 1677146943900
  },
  {
    value: 4800,
    time: 1677147943900
  },
  {
    value: 3800,
    time: 1677148943900
  },
  {
    value: 4300,
    time: 1677149943900
  }
]

const TradingChart: FC = () => {
  return (
    <div className="web-dashboard-overview-charts">
      <header>
        <label>Total Trading Value</label>
        <BalanceShow value={12345.4567} unit="USD" />
      </header>
      <section>
        <BarChart
          chartId="PositionVolume"
          data={data}
          xKey="time"
          enableLegend={false}
          timeFormatStr={'YYYY-MM-DD HH:mm'}
          yFormat={[
            {
              label: 'Value',
              value: 'value',
              color: '#E7446B'
            }
          ]}
        />
      </section>
    </div>
  )
}

export default TradingChart
