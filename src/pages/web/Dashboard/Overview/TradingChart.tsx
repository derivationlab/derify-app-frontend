import days from 'dayjs'
import { isArray } from 'lodash'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { findToken } from '@/config/tokens'
import { useMTokenFromRoute } from '@/hooks/useTrading'
import { getHistoryTotalTradingNetValue } from '@/api'
import { useCurrentTotalTradingNetValue } from '@/hooks/useQueryApi'

import { BarChart } from '@/components/common/Chart'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

let output: Record<string, any> = {}
const time = days().utc().startOf('days').format()

const TradingChart: FC = () => {
  const [chartData, setChartData] = useState<any>([])

  const { marginToken } = useMTokenFromRoute()

  const { data } = useCurrentTotalTradingNetValue(findToken(marginToken).tokenAddress, 'all')

  const combineDAT = useMemo(() => {
    if (data) output = { day_time: time, ...data[0] }
    return [...chartData, output]
  }, [chartData, data])

  const historyDAT = useCallback(async () => {
    const { data } = await getHistoryTotalTradingNetValue(findToken(marginToken).tokenAddress, 'all')

    if (isArray(data)) {
      const convert = data.map((o) => ({ ...o, total_trading_net_value: Number(o.total_trading_net_value) })).reverse()
      setChartData(convert)
    }
  }, [marginToken])

  useEffect(() => {
    void historyDAT()
  }, [marginToken])

  return (
    <div className="web-dashboard-overview-charts">
      <header>
        <label>Total Trading Value</label>
        <BalanceShow value={data?.[0].total_trading_net_value ?? 0} unit={marginToken} />
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
