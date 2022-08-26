import React, { FC, useCallback, useEffect, useState } from 'react'
import { isArray } from 'lodash'
import { useBlockNumber } from 'wagmi'
import { useTranslation } from 'react-i18next'

import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { useContractData } from '@/store/contract/hooks'
import { getCurrentTradingAmount, getHistoryTradingData } from '@/api'
import { SelectTimesOptions, SelectSymbolOptions, SelectSymbolTokens, SelectTimesValues } from '@/data'

import Select from '@/components/common/Form/Select'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { BarChart } from '@/components/common/Chart'

const TradingVolume: FC = () => {
  const { t } = useTranslation()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const { currentPair } = useContractData()

  const [tradingData, setTradingData] = useState<Record<string, any>[]>([])
  const [timeSelectVal, setTimeSelectVal] = useState<string>('1M')
  const [pairSelectVal, setPairSelectVal] = useState<string>('All Derivatives')
  const [tradingVolume, setTradingVolume] = useState<string>('0')

  const getHistoryTradingDataCb = useCallback(async () => {
    const { data: trading } = await getHistoryTradingData(
      SelectSymbolTokens[pairSelectVal],
      SelectTimesValues[timeSelectVal]
    )

    if (isArray(trading)) {
      // Huge data will have hidden dangers todo
      const convert = trading.map((o) => ({ ...o, trading_amount: Number(o.trading_amount) })).reverse()
      setTradingData(convert)
    }
  }, [timeSelectVal, pairSelectVal])

  const getTradingVolumeDataCb = useCallback(async () => {
    // console.info(blockNumber)
    const { data: volume } = await getCurrentTradingAmount(currentPair)
    // trading_amount: '843.40500000', trading_fee: '0.42170250'

    if (isArray(volume)) {
      setTradingVolume(volume[0]?.trading_amount ?? 0)
    }
  }, [currentPair])

  useEffect(() => {
    void getHistoryTradingDataCb()
  }, [getHistoryTradingDataCb, timeSelectVal, pairSelectVal, currentPair])

  useEffect(() => {
    void getTradingVolumeDataCb()
  }, [blockNumber])

  return (
    <div className="web-dashborad-chart">
      <header className="web-dashborad-chart-header">
        <h3>
          {t('Dashboard.TradingVolume', 'Trading Volume')} :
          <BalanceShow value={tradingVolume} unit={BASE_TOKEN_SYMBOL} format={false} />
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
      <main className="web-dashborad-chart-main">
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
          data={tradingData}
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
