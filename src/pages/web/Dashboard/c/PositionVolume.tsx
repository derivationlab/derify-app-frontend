import React, { FC, useCallback, useEffect, useState, useContext, useMemo } from 'react'
import BN from 'bignumber.js'
import { isArray } from 'lodash'
import { useTranslation } from 'react-i18next'
import days from 'dayjs'

import ThemeContext from '@/context/Theme/Context'

import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { useConstantData } from '@/store/constant/hooks'
import { SelectTimesOptions, SelectSymbolOptions, SelectSymbolTokens, SelectTimesValues } from '@/data'
import { getHistoryPositionsData } from '@/api'

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
  const { positions } = useConstantData()

  const [timeSelectVal, setTimeSelectVal] = useState<string>('1M')
  const [pairSelectVal, setPairSelectVal] = useState<string>('All Derivatives')
  const [positionData, setPositionsData] = useState<Record<string, any>[]>([])

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

  const memoPositionsVolume = useMemo(() => {
    if (positions.length > 0) {
      const isAll = SelectSymbolTokens[pairSelectVal] === 'all'
      const target =
        positions.find((p) => (p.token === '' && isAll) || p.token === SelectSymbolTokens[pairSelectVal]) ?? base
      // console.info(target)
      const long = new BN(target?.long_position_amount ?? 0)
      const short = new BN(target?.short_position_amount ?? 0)
      const total = long.plus(short)

      return {
        long: `${long.div(total).times(100).toFixed(2)}%`,
        short: `${short.div(total).times(100).toFixed(2)}%`,
        volume: total.toString(),
        day_time: time,
        long_position_amount: target?.long_position_amount ?? 0,
        short_position_amount: target?.short_position_amount ?? 0
      }
    }
    return base
  }, [pairSelectVal, positions])

  const memoCombineData = useMemo(() => {
    return ([...positionData, memoPositionsVolume])
  }, [positionData, memoPositionsVolume])

  useEffect(() => {
    void getHistoryPositionsDataCb()
  }, [getHistoryPositionsDataCb, timeSelectVal, pairSelectVal])

  return (
    <div className='web-dashborad-chart'>
      <header className='web-dashborad-chart-header'>
        <h3>
          {t('Dashboard.PositionVolume', 'Position Volume')} :
          <BalanceShow value={memoPositionsVolume?.volume} unit={BASE_TOKEN_SYMBOL} format={false} />
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
      <main className='web-dashborad-chart-main'>
        <div className='web-dashborad-chart-position-tip'>
          {/*{positionVolume.long}*/}
          <span className='long'>
            Long<i>{memoPositionsVolume?.long}</i>
          </span>
          <span className='short'>
            Short<i>{memoPositionsVolume?.short}</i>
          </span>
        </div>
        <BarChart
          chartId='PositionVolume'
          data={memoCombineData}
          xKey='day_time'
          timeFormatStr={timeSelectVal !== '1D' ? 'MM/DD' : 'HH:mm'}
          yFormat={barColor}
        />
      </main>
    </div>
  )
}

export default PositionVolume
