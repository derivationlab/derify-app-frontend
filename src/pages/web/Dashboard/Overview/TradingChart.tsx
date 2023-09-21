import { getHistoryTotalTradingNetValue } from 'derify-apis-test'
import { isArray } from 'lodash-es'

import React, { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BarChart } from '@/components/common/Chart'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { useCurrentNetTrading } from '@/hooks/useCurrentNetTrading'
import { Rec } from '@/typings'
import { dayjsStartOf } from '@/utils/tools'

const time = dayjsStartOf()
let output: { day_time: string; trading_net_value: number } = {
  day_time: time,
  trading_net_value: 0
}

const TradingChart: FC = () => {
  const [chartData, setChartData] = useState<Rec[]>([])

  const { t } = useTranslation()

  const { data } = useCurrentNetTrading('all', 'all')

  const combineDAT = useMemo(() => {
    if (data) output = { day_time: time, trading_net_value: data?.trading_net_value ?? 0 }
    return [...chartData, output]
  }, [chartData, data])

  const historyDAT = async () => {
    const { data } = await getHistoryTotalTradingNetValue<{ data: Rec[] }>('all', 'all')

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
          xKey="day_time"
          data={combineDAT}
          chartId="PositionVolume"
          yFormat={[
            {
              label: 'Value',
              value: 'trading_net_value',
              color: '#E7446B'
            }
          ]}
          enableLegend={false}
          timeFormatStr={'YYYY-MM-DD'}
        />
      </section>
    </div>
  )
}

export default TradingChart
