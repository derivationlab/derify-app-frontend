import days from 'dayjs'
import { isArray } from 'lodash'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useEffect, useState, useContext, useMemo } from 'react'

import { ThemeContext } from '@/providers/Theme'
import { findToken } from '@/config/tokens'

import { getHistoryPositionsDAT } from '@/api'
import { useCurrentPositionsAmount } from '@/hooks/useQueryApi'
import { bnDiv, bnMul, bnPlus, isGT, keepDecimals } from '@/utils/tools'
import { SelectTimesOptions, SelectSymbolOptions, SelectSymbolTokens, SelectTimesValues } from '@/data'

import Select from '@/components/common/Form/Select'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { BarChart } from '@/components/common/Chart'
import { useMarginToken } from '@/zustand'

const time = days().utc().startOf('days').format()
let output: Record<string, any> = {
  long: '0%',
  short: '0%',
  volume: '0',
  day_time: time,
  long_position_amount: 0,
  short_position_amount: 0
}

const PositionVolume: FC = () => {
  const { t } = useTranslation()
  const { theme } = useContext(ThemeContext)

  const [positionData, setPositionsData] = useState<Record<string, any>[]>([])
  const [timeSelectVal, setTimeSelectVal] = useState<string>('3M')
  const [pairSelectVal, setPairSelectVal] = useState<string>('All Derivatives')

  const marginToken = useMarginToken((state) => state.marginToken)

  const { data: positionsDAT, refetch } = useCurrentPositionsAmount(
    'PositionVolume-useCurrentPositionsAmount',
    SelectSymbolTokens[pairSelectVal],
    findToken(marginToken).tokenAddress
  )

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

  const historyDAT = useCallback(async () => {
    const { data: history } = await getHistoryPositionsDAT(
      SelectSymbolTokens[pairSelectVal],
      SelectTimesValues[timeSelectVal],
      findToken(marginToken).tokenAddress
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

  const totalAmount = useMemo(() => {
    if (positionsDAT) {
      const { long_position_amount = 0, short_position_amount = 0 } = positionsDAT
      const volume = bnPlus(long_position_amount, short_position_amount)

      if (isGT(volume, 0)) {
        const p1 = bnMul(bnDiv(long_position_amount, volume), 100)
        const p2 = bnMul(bnDiv(short_position_amount, volume), 100)
        output = {
          long: `${keepDecimals(p1, 2)}%`,
          short: `${keepDecimals(p2, 2)}%`,
          volume,
          day_time: time,
          long_position_amount: long_position_amount,
          short_position_amount: short_position_amount
        }
        return output
      }
    }
    return output
  }, [positionsDAT])

  const combineDAT = useMemo(() => {
    return [...positionData, totalAmount]
  }, [positionData, totalAmount])

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
          {t('Dashboard.PositionVolume', 'Position Volume')} :
          <BalanceShow value={totalAmount?.volume} unit={marginToken} />
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
          data={combineDAT}
          xKey="day_time"
          timeFormatStr={timeSelectVal !== '1D' ? 'MM/DD' : 'HH:mm'}
          yFormat={barColor}
        />
      </main>
    </div>
  )
}

export default PositionVolume
