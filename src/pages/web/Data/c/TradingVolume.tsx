import days from 'dayjs'
import { isArray } from 'lodash'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { findToken } from '@/config/tokens'
import { useMarginToken } from '@/zustand'
import { getHistoryTradingData } from '@/api'
import { useCurrentTradingAmount } from '@/hooks/useQueryApi'
import { SelectTimesOptions, SelectSymbolOptions, SelectSymbolTokens, SelectTimesValues } from '@/data'

import { BarChart } from '@/components/common/Chart'
import Select from '@/components/common/Form/Select'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

const time = days().utc().startOf('days').format()
const TradingVolume: FC = () => {
  const { t } = useTranslation()

  const [tradingData, setTradingData] = useState<Record<string, any>[]>([])
  const [timeSelectVal, setTimeSelectVal] = useState<string>('3M')
  const [pairSelectVal, setPairSelectVal] = useState<string>('All Derivatives')

  const marginToken = useMarginToken((state) => state.marginToken)

  const {
    data: tradingVolume,
    isLoading,
    refetch
  } = useCurrentTradingAmount(SelectSymbolTokens[pairSelectVal], findToken(marginToken).tokenAddress)

  const historyDAT = useCallback(async () => {
    const { data: trading } = await getHistoryTradingData(
      SelectSymbolTokens[pairSelectVal],
      SelectTimesValues[timeSelectVal],
      findToken(marginToken).tokenAddress
    )

    if (isArray(trading)) {
      // Huge data will have hidden dangers todo
      const convert = trading.map((o) => ({ ...o, trading_amount: Number(o.trading_amount) })).reverse()
      setTradingData(convert)
    }
  }, [timeSelectVal, pairSelectVal])

  const combineDAT = useMemo(() => {
    let output
    if (!isLoading && tradingVolume) {
      // console.info({ day_time: time, ...data[0] })
      output = { day_time: time, ...tradingVolume[0] }
    }
    return [...tradingData, output]
  }, [tradingData, isLoading, tradingVolume])

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
          <BalanceShow value={tradingVolume?.[0]?.trading_amount ?? 0} unit={marginToken} />
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
          chartId="PositionVolume"
          data={combineDAT}
          xKey="day_time"
          enableLegend={false}
          timeFormatStr={timeSelectVal !== '1D' ? 'MM/DD' : 'HH:mm'}
          yFormat={[
            {
              label: 'Volume',
              value: 'trading_amount',
              color: '#E7446B'
            }
          ]}
        />
      </main>
    </div>
  )
}

export default TradingVolume
