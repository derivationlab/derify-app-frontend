import days from 'dayjs'
import { isArray } from 'lodash'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { findToken } from '@/config/tokens'
import { useMTokenFromRoute } from '@/hooks/useTrading'
import { getHistoryTotalPositionsNetValue } from '@/api'
import { useCurrentTotalPositionsNetValue } from '@/hooks/useQueryApi'

import { BarChart } from '@/components/common/Chart'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

let output: Record<string, any> = {}
const time = days().utc().startOf('days').format()

const PositionChart: FC = () => {
  const [chartData, setChartData] = useState<any>([])

  const { marginToken } = useMTokenFromRoute()

  const { data } = useCurrentTotalPositionsNetValue(findToken(marginToken).tokenAddress, 'all')

  const combineDAT = useMemo(() => {
    if (data) output = { day_time: time, ...data }
    return [...chartData, output]
  }, [chartData, data])

  const historyDAT = useCallback(async () => {
    const { data } = await getHistoryTotalPositionsNetValue(findToken(marginToken).tokenAddress, 'all')

    if (isArray(data)) {
      const convert = data
        .map((o) => ({ ...o, total_position_net_value: Number(o.total_position_net_value) }))
        .reverse()
      setChartData(convert)
    }
  }, [marginToken])

  useEffect(() => {
    void historyDAT()
  }, [marginToken])

  return (
    <div className="web-dashboard-overview-charts">
      <header>
        <label>Total Position Value</label>
        <BalanceShow value={data.total_positions_net_value} unit={marginToken} />
      </header>
      <section>
        <BarChart
          chartId="PositionVolume"
          data={combineDAT}
          xKey="day_time"
          enableLegend={false}
          timeFormatStr={'YYYY-MM-DD HH:mm'}
          yFormat={[
            {
              label: 'Value',
              value: 'total_position_net_value',
              color: '#E7446B'
            }
          ]}
        />
      </section>
    </div>
  )
}

export default PositionChart
