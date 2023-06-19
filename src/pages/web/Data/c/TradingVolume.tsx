import { isArray } from 'lodash'

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getHistoryTradingDAT } from '@/api'
import { BarChart } from '@/components/common/Chart'
import Select from '@/components/common/Form/Select'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { SelectTimesOptions, SelectTimesValues } from '@/data'
import { useCurrentTrading } from '@/hooks/useCurrentTrading'
import { useDerivativeListStore, useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'
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
  const [derivativeSel, setDerivativeSel] = useState<string>('All Derivatives')

  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const derivativeList = useDerivativeListStore((state) => state.derivativeList)

  const derivative = useMemo(() => {
    const base = {
      key: 'All Derivatives',
      val: 'all'
    }
    if (derivativeList.length) {
      const _derivative = derivativeList.map((derivative) => ({
        key: derivative.name,
        val: derivative.token
      }))
      return [base, ..._derivative]
    }
    return [base]
  }, [derivativeList])

  const derAddress = useMemo(() => {
    return derivative.find((d) => d.key === derivativeSel)?.val ?? ''
  }, [derivative, derivativeSel])

  const { data: tradingVolume } = useCurrentTrading(derAddress, marginToken.address)

  const decimals = useMemo(() => {
    return Number(tradingVolume?.[0]?.trading_amount ?? 0) === 0 ? 2 : marginToken.decimals
  }, [tradingVolume, marginToken])

  const combineDAT = useMemo(() => {
    if (tradingVolume) output = { day_time: time, ...tradingVolume[0] }
    return [...tradingData, output]
  }, [tradingData, tradingVolume])

  const historyDAT = useCallback(async () => {
    const { data: trading } = await getHistoryTradingDAT(
      derAddress,
      SelectTimesValues[timeSelectVal],
      marginToken.address
    )

    if (isArray(trading)) {
      // Huge data will have hidden dangers todo
      const convert = trading.map((o) => ({ ...o, trading_amount: Number(o.trading_amount) })).reverse()
      setTradingData(convert)
    }
  }, [timeSelectVal, derAddress])

  useEffect(() => {
    void historyDAT()
  }, [historyDAT, timeSelectVal, derivativeSel])

  return (
    <div className="web-data-chart">
      <header className="web-data-chart-header">
        <h3>
          {t('Dashboard.TradingVolume', 'Trading Volume')} :
          <BalanceShow value={tradingVolume?.[0]?.trading_amount ?? 0} unit={marginToken.symbol} decimal={decimals} />
        </h3>
        <aside>
          <Select
            value={timeSelectVal}
            options={SelectTimesOptions}
            onChange={(value) => setTimeSelectVal(String(value))}
          />
          <Select
            value={derivativeSel}
            options={derivative.map((d) => d.key)}
            onChange={(value) => setDerivativeSel(value as string)}
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
