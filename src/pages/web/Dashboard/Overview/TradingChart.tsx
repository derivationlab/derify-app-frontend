import days from 'dayjs'
import { isArray } from 'lodash'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { getHistoryTotalTradingNetValue } from '@/api'
import { useCurrentTotalTradingNetValue } from '@/hooks/useQueryApi'

import { BarChart } from '@/components/common/Chart'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

let output = Object.create(null)

const time = days().utc().startOf('days').format()

const TradingChart: FC = () => {
  const [chartData, setChartData] = useState<any>([])
  const { t } = useTranslation()

  const { data } = useCurrentTotalTradingNetValue('all', 'all')

  const combineDAT = useMemo(() => {
    if (data) output = { day_time: time, trading_net_value: data?.trading_net_value ?? 0 }
    return [...chartData, output]
  }, [chartData, data])

  const historyDAT = async () => {
    const { data } = await getHistoryTotalTradingNetValue('all', 'all')

    if (isArray(data)) {
      const convert = data.map((o) => ({ ...o, trading_net_value: Number(o.trading_net_value) })).reverse()
      setChartData(convert)
    }
  }

  useEffect(() => {
    void historyDAT()
  }, [])

  return (
    <div className="web-dashboard-overview-charts">
      <header>
        <label>{t('NewDashboard.Overview.TotalTradingValue')}</label>
        <BalanceShow value={data.trading_net_value} unit={VALUATION_TOKEN_SYMBOL} />
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
              value: 'trading_net_value',
              color: '#E7446B'
            }
          ]}
        />
      </section>
    </div>
  )
}

export default TradingChart
