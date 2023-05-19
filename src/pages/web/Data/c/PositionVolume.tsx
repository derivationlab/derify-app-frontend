import { isArray } from 'lodash'

import React, { FC, useCallback, useEffect, useState, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { getHistoryPositionsDAT } from '@/api'
import { BarChart } from '@/components/common/Chart'
import Select from '@/components/common/Form/Select'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { findToken } from '@/config/tokens'
import { SelectTimesOptions, SelectSymbolOptions, SelectSymbolTokens, SelectTimesValues } from '@/data'
import { useCurrentPositionsAmount } from '@/hooks/useQueryApi'
import { ThemeContext } from '@/providers/Theme'
import { useMarginTokenStore } from '@/store'
import { bnDiv, bnMul, bnPlus, dayjsStartOf, isGT, keepDecimals } from '@/utils/tools'

const time = dayjsStartOf()
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

  const marginToken = useMarginTokenStore((state) => state.marginToken)

  const { data: positionsDAT, refetch } = useCurrentPositionsAmount(
    SelectSymbolTokens[pairSelectVal],
    marginToken.address
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
      marginToken.address
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
          <BalanceShow value={totalAmount?.volume} unit={marginToken.symbol} />
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
          data={combineDAT}
          xKey="day_time"
          chartId="PositionVolume"
          yFormat={barColor}
          timeFormatStr={'YYYY-MM-DD'}
        />
      </main>
    </div>
  )
}

export default PositionVolume
