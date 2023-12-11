import { getHistoryTotalPositionsNetValue } from 'derify-apis'
import { isArray } from 'lodash-es'

import React, { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AreaChart } from '@/components/common/Chart'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { useCurrentNetPositions } from '@/hooks/useCurrentNetPositions'
import { Rec } from '@/typings'
import { dayjsStartOf } from '@/utils/tools'

const time = dayjsStartOf()
let output: Record<string, any> = {
  day_time: time,
  total_positions_net_value: 0
}

const PositionChart: FC = () => {
  const [chartData, setChartData] = useState<any>([])
  const { t } = useTranslation()

  const { data } = useCurrentNetPositions('all', 'all')

  const combineDAT = useMemo(() => {
    if (data) output = { day_time: time, ...data }
    return [...chartData, output]
  }, [chartData, data])

  const historyDAT = async () => {
    const { data } = await getHistoryTotalPositionsNetValue<{ data: Rec[] }>('all', 'all')

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
        <label>{t('NewDashboard.Overview.TotalPositionValue')}</label>
        <BalanceShow value={data.total_positions_net_value} unit={VALUATION_TOKEN_SYMBOL} />
      </header>
      <section>
        <AreaChart
          data={combineDAT}
          xKey="day_time"
          yKey="total_positions_net_value"
          yLabel="Value"
          chartId="PositionVolume"
          timeFormatStr={'YYYY-MM-DD'}
        />
      </section>
    </div>
  )
}

export default PositionChart
