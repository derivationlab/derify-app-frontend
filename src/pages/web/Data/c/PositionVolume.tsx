import React, { FC, useCallback, useEffect, useState, useContext, useMemo } from 'react'
import BN from 'bignumber.js'
import { useInterval } from 'react-use'
import { isArray } from 'lodash'
import { useTranslation } from 'react-i18next'
import days from 'dayjs'

import { getHistoryPositionsData } from '@/api'
import ThemeContext from '@/context/Theme/Context'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { getCurrentPositionsAmountData } from '@/store/constant/helper'
import { SelectTimesOptions, SelectSymbolOptions, SelectSymbolTokens, SelectTimesValues } from '@/data'

import Select from '@/components/common/Form/Select'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { BarChart } from '@/components/common/Chart'

const time = days().utc().startOf('days').format()
const base = {
  long: '0%',
  volume: '0',
  short: '0%',
  day_time: time,
  long_position_amount: 0,
  short_position_amount: 0
}

const PositionVolume: FC = () => {
  const { t } = useTranslation()
  const { theme } = useContext(ThemeContext)

  const [timeSelectVal, setTimeSelectVal] = useState<string>('3M')
  const [pairSelectVal, setPairSelectVal] = useState<string>('All Derivatives')
  const [positionData, setPositionsData] = useState<Record<string, any>[]>([])
  const [totalAmount, setTotalAmount] = useState<Record<string, any>>(base)

  const barColor = useMemo(() => {
    let longColor = '#24ce7d'
    let shortColor = '#e23e3e'
    if (theme === 'Dark') {
      longColor = '#037c42'
      shortColor = '#9e2b2b'
    }
    return [
      {
        label: 'Long',
        value: 'long_position_amount',
        color: longColor
      },
      {
        label: 'Short',
        value: 'short_position_amount',
        color: shortColor
      }
    ]
  }, [theme])

  const getHistoryPositionsDataCb = useCallback(async () => {
    const { data: history } = await getHistoryPositionsData(
      SelectSymbolTokens[pairSelectVal],
      SelectTimesValues[timeSelectVal]
    )

    if (isArray(history)) {
      // Huge data will have hidden dangers todo
      const convert = history
        .map((o) => ({
          ...o,
          long_position_amount: Number(o.long_position_amount),
          short_position_amount: Number(o.short_position_amount)
        }))
        .reverse()

      setPositionsData(convert)
    }
  }, [timeSelectVal, pairSelectVal])

  const getPositionsAmountFunc = async () => {
    // const data = await getCurrentPositionsAmountData(SelectSymbolTokens[pairSelectVal])
    //
    // if (data) {
    //   const long = new BN(data.long_position_amount)
    //   const short = new BN(data.short_position_amount)
    //   const total = long.plus(short)
    //
    //   if (total.isGreaterThan(0)) {
    //     setTotalAmount({
    //       long: `${long.div(total).times(100).toFixed(2)}%`,
    //       short: `${short.div(total).times(100).toFixed(2)}%`,
    //       volume: total.toString(),
    //       day_time: time,
    //       long_position_amount: data.long_position_amount,
    //       short_position_amount: data.short_position_amount
    //     })
    //   }
    // }
  }

  const memoCombineData = useMemo(() => {
    return [...positionData, totalAmount]
  }, [positionData, totalAmount])

  useInterval(() => {
    void getPositionsAmountFunc()
  }, 60000)

  useEffect(() => {
    void getHistoryPositionsDataCb()
  }, [getHistoryPositionsDataCb, timeSelectVal, pairSelectVal])

  useEffect(() => {
    setTotalAmount(base)

    void getPositionsAmountFunc()
  }, [pairSelectVal])

  return (
    <div className="web-data-chart">
      <header className="web-data-chart-header">
        <h3>
          {t('Dashboard.PositionVolume', 'Position Volume')} :
          <BalanceShow value={totalAmount?.volume} unit={BASE_TOKEN_SYMBOL} />
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
        <div className="web-data-chart-position-tip">
          {/*{positionVolume.long}*/}
          <span className="long">
            Long<i>{totalAmount?.long}</i>
          </span>
          <span className="short">
            Short<i>{totalAmount?.short}</i>
          </span>
        </div>
        <BarChart
          chartId="PositionVolume"
          data={memoCombineData}
          xKey="day_time"
          timeFormatStr={timeSelectVal !== '1D' ? 'MM/DD' : 'HH:mm'}
          yFormat={barColor}
        />
      </main>
    </div>
  )
}

export default PositionVolume
