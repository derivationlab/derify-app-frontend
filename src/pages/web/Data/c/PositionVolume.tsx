import classNames from 'classnames'
import { isArray, uniqBy } from 'lodash'

import React, { FC, useCallback, useEffect, useState, useContext, useMemo, useRef } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'

import { getDerivativeList, getHistoryPositionsDAT } from '@/api'
import { BarChart } from '@/components/common/Chart'
import { DropDownList, DropDownListItem } from '@/components/common/DropDownList'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { timeLineOptions, matchTimeLineOptions } from '@/data'
import { useCurrentPositions } from '@/hooks/useCurrentPositions'
import { ThemeContext } from '@/providers/Theme'
import { useDerivativeListStore, useMarginTokenStore, useProtocolConfigStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { Rec } from '@/typings'
import { bnDiv, bnMul, bnPlus, dayjsStartOf, isGT, keepDecimals } from '@/utils/tools'

const time = dayjsStartOf()
let output = {
  long: '0%',
  short: '0%',
  volume: '0',
  day_time: time,
  long_position_amount: 0,
  short_position_amount: 0
}
const all = {
  name: 'All Derivatives',
  token: 'all'
}
interface PairOptionsInit {
  data: Rec[]
  loaded: boolean
}

let seqCount = 0
const PositionVolume: FC = () => {
  const bottomRef = useRef<any>()
  const observerRef = useRef<IntersectionObserver | null>()
  const { t } = useTranslation()

  const { theme } = useContext(ThemeContext)
  const [pairOptions, setPairOptions] = useState<PairOptionsInit>({ data: [], loaded: false })
  const [positionsData, setPositionsData] = useState<Record<string, any>[]>([])
  const [timeSelectVal, setTimeSelectVal] = useState<string>('3M')
  const [derivativeSel, setDerivativeSel] = useState<typeof all>(all)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const derivativeList = useDerivativeListStore((state) => state.derivativeList)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const { data: positionsDAT } = useCurrentPositions(derivativeSel.token, marginToken.address)

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
      derivativeSel.token,
      matchTimeLineOptions[timeSelectVal],
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
  }, [timeSelectVal, derivativeSel])

  const morePairs = useCallback(async () => {
    const { data } = await getDerivativeList(marginToken.address, seqCount)
    if (protocolConfig && data?.records) {
      const filter = data.records.filter((r: Rec) => r.open)
      const combine = [...pairOptions.data, ...filter]
      const deduplication = uniqBy(combine, 'token')
      setPairOptions((val: any) => ({ ...val, data: deduplication, loaded: false }))
      if (data.records.length === 0 || data.records.length < 12) seqCount = seqCount - 1
    }
  }, [protocolConfig, pairOptions.data])

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
    return [...positionsData, totalAmount]
  }, [positionsData, totalAmount])

  const decimals = useMemo(() => {
    return Number(totalAmount.volume) === 0 ? 2 : marginToken.decimals
  }, [totalAmount, marginToken])

  const currentTimeLine = useMemo(() => timeLineOptions.find((time) => time === timeSelectVal), [timeSelectVal])

  useEffect(() => {
    void historyDAT()
  }, [historyDAT, timeSelectVal, derivativeSel])

  useEffect(() => {
    if (pairOptions.data.length) {
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target.id === 'bottom') {
              seqCount += 1
              void morePairs()
            }
          })
        },
        { threshold: 0.2 }
      )
      if (bottomRef.current) {
        intersectionObserver.observe(bottomRef.current)
        observerRef.current = intersectionObserver
      }
    }
    return () => {
      observerRef.current && observerRef.current.disconnect()
    }
  }, [pairOptions.data.length])

  useEffect(() => {
    if (derivativeList.length) {
      setPairOptions({ data: [all, ...derivativeList], loaded: false })
    }
  }, [derivativeList])

  return (
    <div className="web-data-chart">
      <header className="web-data-chart-header">
        <h3>
          {t('Dashboard.PositionVolume', 'Position Volume')} :
          <BalanceShow value={totalAmount?.volume} unit={marginToken.symbol} decimal={decimals} />
        </h3>
        <aside>
          <DropDownList
            entry={
              <div className="web-select-show-button">
                <span>{currentTimeLine}</span>
              </div>
            }
            showSearch={false}
          >
            {timeLineOptions.map((o) => {
              return (
                <DropDownListItem
                  key={o}
                  content={o}
                  onSelect={() => setTimeSelectVal(o)}
                  className={classNames({
                    active: timeSelectVal === o
                  })}
                />
              )
            })}
          </DropDownList>
          <DropDownList
            entry={
              <div className="web-select-show-button">
                <span>{derivativeSel?.name}</span>
              </div>
            }
            height={isMobile ? 244 : 284}
            loading={pairOptions.loaded}
            showSearch={false}
          >
            {pairOptions.data.map((o: any, index: number) => {
              const len = pairOptions.data.length
              const id = index === len - 1 ? 'bottom' : undefined
              const ref = index === len - 1 ? bottomRef : null
              return (
                <DropDownListItem
                  key={o.name}
                  id={id}
                  ref={ref}
                  content={o.name}
                  onSelect={() => {
                    setDerivativeSel(o)
                  }}
                  className={classNames({
                    active: derivativeSel.name === o.name
                  })}
                />
              )
            })}
          </DropDownList>
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
