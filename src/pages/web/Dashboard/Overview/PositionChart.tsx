import days from 'dayjs'
import { isArray } from 'lodash'
import React, { FC, useEffect, useMemo, useState } from 'react'

import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { getHistoryTotalPositionsNetValue } from '@/api'
import { useCurrentTotalPositionsNetValue } from '@/hooks/useQueryApi'

import { BarChart } from '@/components/common/Chart'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

let output = Object.create(null)

const time = days().utc().startOf('days').format()

const PositionChart: FC = () => {
  const [chartData, setChartData] = useState<any>([])

  const { data } = useCurrentTotalPositionsNetValue('all', 'all')

  const combineDAT = useMemo(() => {
    if (data) output = { day_time: time, ...data }
    return [...chartData, output]
  }, [chartData, data])

  const historyDAT = async () => {
    const { data } = await getHistoryTotalPositionsNetValue('all', 'all')

    if (isArray(data)) {
      const convert = data
        .map((o) => ({ ...o, total_positions_net_value: Number(o.total_positions_net_value) }))
        .reverse()
      setChartData(convert)
    }
  }

  useEffect(() => {
    void historyDAT()
  }, [])

  return (
    <div className="web-dashboard-overview-charts">
      <header>
        <label>Total Position Value</label>
        <BalanceShow value={data.total_positions_net_value} unit={VALUATION_TOKEN_SYMBOL} />
      </header>
      <section>
        <BarChart
          chartId="PositionVolume"
          data={combineDAT}
          xKey="day_time"
          enableLegend={false}
          timeFormatStr={'YYYY-MM-DD'}
          yFormat={[
            {
              label: 'Value',
              value: 'total_positions_net_value',
              color: '#E7446B'
            }
          ]}
        />
      </section>
    </div>
  )
}

export default PositionChart
