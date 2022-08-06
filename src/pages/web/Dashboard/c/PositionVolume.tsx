import React, { FC, useCallback, useEffect, useState, useContext, useMemo } from 'react'
import BN from 'bignumber.js'
import { isArray } from 'lodash'
import { useTranslation } from 'react-i18next'

import ThemeContext from '@/context/Theme/Context'

import { SelectTimesOptions, SelectSymbolOptions, SelectSymbolTokens, SelectTimesValues } from '@/data'
import { getCurrentPositionsAmount, getHistoryPositionsData } from '@/api'

import Select from '@/components/common/Form/Select'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { BarChart } from '@/components/common/Chart'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'

interface Volume {
  long: string
  volume: string
  short: string
}

const base = { long: '0%', volume: '0', short: '0%' }

const PositionVolume: FC = () => {
  const { t } = useTranslation()
  const [timeSelectVal, setTimeSelectVal] = useState<string>('1M')
  const [pairSelectVal, setPairSelectVal] = useState<string>('All Derivatives')
  const [positionData, setPositionsData] = useState<Record<string, any>[]>([])
  const [positionVolume, setPositionVolume] = useState<Volume>(base)
  const { theme } = useContext(ThemeContext)

  const barColor = useMemo(() => {
    let longColor = '#B0FBD7'
    let shortColor = '#FFBDBD'
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
    const { data: current } = await getCurrentPositionsAmount(SelectSymbolTokens[pairSelectVal])
    const { data: history } = await getHistoryPositionsData(
      SelectSymbolTokens[pairSelectVal],
      SelectTimesValues[timeSelectVal]
    )

    const long = history.reduce((p: BN, n: Record<string, any>) => p.plus(new BN(n.long_position_amount)), new BN(0))
    const short = history.reduce((p: BN, n: Record<string, any>) => p.plus(new BN(n.short_position_amount)), new BN(0))
    const total = long.plus(short)
    const volume = new BN(current?.long_position_amount ?? 0).plus(current?.short_position_amount ?? 0)

    setPositionVolume({
      volume: volume.toString(),
      long: `${long.div(total).times(100).toFixed(2)}%`,
      short: `${short.div(total).times(100).toFixed(2)}%`
    })

    if (isArray(history)) {
      // Huge data will have hidden dangers todo
      const convert = history
        .map((o) => ({
          ...o,
          long_position_amount: Number(o.long_position_amount),
          short_position_amount: o.short_position_amount
        }))
        .reverse()
      setPositionsData(convert)
    }
  }, [timeSelectVal, pairSelectVal])

  useEffect(() => {
    void getHistoryPositionsDataCb()
  }, [getHistoryPositionsDataCb, timeSelectVal, pairSelectVal])

  return (
    <div className="web-dashborad-chart">
      <header className="web-dashborad-chart-header">
        <h3>
          {t('Dashboard.PositionVolume', 'Position Volume')} :
          <BalanceShow value={positionVolume.volume} unit={BASE_TOKEN_SYMBOL} format={false} />
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
        <div className="web-dashborad-chart-position-tip">
          {/*{positionVolume.long}*/}
          <span className="long">
            Long<i>{positionVolume.long}</i>
          </span>
          <span className="short">
            Short<i>{positionVolume.short}</i>
          </span>
        </div>
        <BarChart
          chartId="PositionVolume"
          data={positionData}
          xKey="day_time"
          timeFormatStr={timeSelectVal !== '1D' ? 'MM/DD' : 'HH:mm'}
          yFormat={barColor}
        />
      </main>
    </div>
  )
}

export default PositionVolume
