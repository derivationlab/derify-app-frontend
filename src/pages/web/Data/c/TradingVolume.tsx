import { isArray } from 'lodash'

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getHistoryTradingDAT } from '@/api'
import { BarChart } from '@/components/common/Chart'
import Select from '@/components/common/Form/Select'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { findToken } from '@/config/tokens'
import { SelectTimesOptions, SelectSymbolOptions, SelectSymbolTokens, SelectTimesValues } from '@/data'
import { useCurrentTradingAmount } from '@/hooks/useQueryApi'
import { useMarginTokenStore } from '@/store'
import { dayjsStartOf } from '@/utils/tools'

const time = dayjsStartOf()
let output: Record<string, any> = {
  day_time: time,
  trading_amount: 0
}

const TradingVolume: FC = () => {
  const { t } = useTranslation()

  const [tradingData, setTradingData] = useState<Record<string, any>[]>([])
  const [timeSelectVal, setTimeSelectVal] = useState<string>('3M')
  const [pairSelectVal, setPairSelectVal] = useState<string>('All Derivatives')

  const marginToken = useMarginTokenStore((state) => state.marginToken)

  const { data: tradingVolume, refetch } = useCurrentTradingAmount(
    SelectSymbolTokens[pairSelectVal],
    marginToken.address
  )

  const historyDAT = useCallback(async () => {
    const { data: trading } = await getHistoryTradingDAT(
      SelectSymbolTokens[pairSelectVal],
      SelectTimesValues[timeSelectVal],
      marginToken.address
    )

    if (isArray(trading)) {
      // Huge data will have hidden dangers todo
      const convert = trading.map((o) => ({ ...o, trading_amount: Number(o.trading_amount) })).reverse()
      setTradingData(convert)
    }
  }, [timeSelectVal, pairSelectVal])

  const combineDAT = useMemo(() => {
    if (tradingVolume) output = { day_time: time, ...tradingVolume[0] }
    return [...tradingData, output]
  }, [tradingData, tradingVolume])

  useEffect(() => {
    void historyDAT()
  }, [historyDAT, timeSelectVal, pairSelectVal])

  useEffect(() => {
    void refetch()
  }, [pairSelectVal])

  return (
    <div className="web-data-chart">
      <header className="web-data-chart-header">
        <h3>
          {t('Dashboard.TradingVolume', 'Trading Volume')} :
          <BalanceShow value={tradingVolume?.[0]?.trading_amount ?? 0} unit={marginToken.symbol} />
        </h3>
        <aside>
          <Select
            value={timeSelectVal}
            options={SelectTimesOptions}
            onChange={(value) => setTimeSelectVal(String(value))}
          />
          <Select
            value={pairSelectVal}
            options={SelectSymbolOptions}
            onChange={(value) => setPairSelectVal(String(value))}
          />
        </aside>
      </header>
      <main className="web-data-chart-main">
        {/*<AreaChart*/}
        {/*  chartId="TradingVolume"*/}
        {/*  data={tradingData}*/}
        {/*  xKey="day_time"*/}
        {/*  timeFormatStr={timeSelectVal !== '1D' ? 'MM/DD' : 'HH:mm'}*/}
        {/*  yKey="trading_amount"*/}
        {/*  yLabel="Trading Volume"*/}
        {/*/>*/}
        <BarChart
          data={combineDAT}
          xKey="day_time"
          chartId="PositionVolume"
          yFormat={[
            {
              label: 'Volume',
              value: 'trading_amount',
              color: '#E7446B'
            }
          ]}
          enableLegend={false}
          timeFormatStr={'YYYY-MM-DD'}
        />
      </main>
    </div>
  )
}

export default TradingVolume
