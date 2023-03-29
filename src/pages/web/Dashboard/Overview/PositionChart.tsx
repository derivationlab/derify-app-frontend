import days from 'dayjs'
import { isArray } from 'lodash'
import { useTranslation } from 'react-i18next'
import React, { FC, useEffect, useMemo, useState } from 'react'

import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { getHistoryTotalPositionsNetValue } from '@/api'
import { useCurrentTotalPositionsNetValue } from '@/hooks/useQueryApi'

import { AreaChart } from '@/components/common/Chart'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

const time = days().utc().startOf('days').format()
let output: Record<string, any> = {
  day_time: time,
  total_positions_net_value: 0
}

const PositionChart: FC = () => {
  const [chartData, setChartData] = useState<any>([])
  const { t } = useTranslation()

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
