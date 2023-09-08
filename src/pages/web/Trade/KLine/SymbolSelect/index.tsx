import { getAddress } from 'ethers/lib/utils'
import { debounce, uniqBy } from 'lodash'

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'react-use'

import { getDerivativeList, searchDerivative } from '@/api'
import ChangePercent from '@/components/common/ChangePercent'
import { DropDownList, DropDownListItem } from '@/components/common/DropDownList'
import Skeleton from '@/components/common/Skeleton'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { TRADING_VISIBLE_COUNT, ZERO } from '@/config'
import { getPairAddressList } from '@/funcs/helper'
import Favorite from '@/pages/web/Trade/KLine/SymbolSelect/Favorite'
import { useInitData } from '@/pages/web/Trade/KLine/SymbolSelect/hooks'
import NoResults from '@/pages/web/Trade/c/NoResults'
import { Rec } from '@/typings'

let seqCount = 0
let temporaryStorage: any[] = []

interface PairOptionsInit {
  data: Rec[]
  loaded: boolean
}

const SymbolSelect = () => {
  const bottomRef = useRef(null)
  const observerRef = useRef<IntersectionObserver | null>()

  const { t } = useTranslation()
  const [pairOptions, setPairOptions] = useState<PairOptionsInit>({ data: [], loaded: false })
  const [fuzzySearch, setFuzzySearch] = useState<string>('')
  const {
    checking,
    spotPrice,
    quoteToken,
    spotPrices,
    indicators,
    marginToken,
    derivativeList,
    traderFavorite,
    protocolConfig,
    updateSpotPrices,
    updateQuoteToken
  } = useInitData(pairOptions.data)

  const indicator = useMemo(() => {
    if (indicators) {
      const find = Object.keys(indicators).find((key) => getAddress(key) === getAddress(quoteToken.token))
      return find ? indicators[find]?.price_change_rate ?? 0 : 0
    }
    return 0
  }, [quoteToken, indicators])

  const currentTk = useMemo(() => {
    if (checking) return <div className="web-trade-symbol-select-curr s">{t('common.Loading')} ...</div>
    if (derivativeList.length)
      return (
        <div className="web-trade-symbol-select-curr">
          <h4>{quoteToken.name}</h4>
          <aside>
            <Skeleton rowsProps={{ rows: 1 }} animation loading={!spotPrices}>
              <BalanceShow value={spotPrice} decimal={Number(spotPrice) === 0 ? 2 : quoteToken.decimals} />
            </Skeleton>
            <ChangePercent value={indicator} />
            <div className="icon" />
          </aside>
        </div>
      )
    return <div className="web-trade-symbol-select-curr s">{t('Trade.Derivative.NoTrading')}</div>
  }, [spotPrice, quoteToken, checking])

  const morePairs = useCallback(async () => {
    setPairOptions((val) => ({ ...val }))
    const { data } = await getDerivativeList(marginToken.address, seqCount)
    if (protocolConfig && data?.records) {
      const filterRecords = data.records.filter((r: Rec) => r.open) // opening
      const pairAddresses = await getPairAddressList(protocolConfig.factory, filterRecords)
      const output = (pairAddresses ?? []).filter((l) => l.derivative !== ZERO) // deployed
      const combine = [...pairOptions.data, ...output]
      const deduplication = uniqBy(combine, 'token')
      temporaryStorage = deduplication
      setPairOptions((val) => ({ ...val, data: deduplication }))
      if (data.records.length === 0 || data.records.length < TRADING_VISIBLE_COUNT) seqCount = seqCount - 1
    }
  }, [protocolConfig, pairOptions.data])

  /**
   * TODO:
   * If the transaction pair cached by the browser is found to be off the shelf (open or not open),
   * other transaction pair information will be displayed
   *
   * FIXME：
   * xx/xx - api error
   */
  const fuzzySearchFunc = useCallback(
    debounce(async (marginToken: string, fuzzySearch: string, factory: string) => {
      try {
        const { data } = await searchDerivative(marginToken, fuzzySearch)
        const filterRecords = (data as any[]).filter((d) => d.open) // opening
        const pairAddresses = await getPairAddressList(factory, filterRecords)
        const output = (pairAddresses ?? []).filter((l) => l.derivative !== ZERO) // deployed
        setPairOptions((val) => ({ ...val, data: output, loaded: false }))
      } catch (e) {
        setPairOptions((val) => ({ ...val, data: [], loaded: false }))
      }
    }, 100),
    []
  )

  useEffect(() => {
    if (spotPrices) updateSpotPrices(spotPrices)
  }, [spotPrices])

  useEffect(() => {
    if (fuzzySearch.trim()) {
      setPairOptions((val) => ({ ...val, data: [], loaded: true }))
      if (protocolConfig) void fuzzySearchFunc(marginToken.address, fuzzySearch, protocolConfig.factory)
    } else {
      const data = temporaryStorage.length === 0 ? derivativeList : temporaryStorage
      const deduplication = uniqBy([...traderFavorite, ...data], 'token')
      setPairOptions((val) => ({ ...val, data: deduplication, loaded: false }))
    }
  }, [marginToken, fuzzySearch, derivativeList, protocolConfig, traderFavorite])

  useEffect(() => {
    if (pairOptions.data.length) {
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target.id === 'bottom') {
              console.info('IntersectionObserver......')
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

  return (
    <div className="web-trade-symbol-select">
      <DropDownList
        entry={currentTk}
        height={588}
        loading={pairOptions.loaded}
        disabled={derivativeList.length === 0}
        onSearch={setFuzzySearch}
        placeholder={t('Trade.kline.SearchTip')}
      >
        {pairOptions.data.length ? (
          pairOptions.data.map((o: Rec, index: number) => {
            const len = pairOptions.data.length
            const idInit = index === len - 1 ? 'bottom' : undefined
            const refInit = index === len - 1 ? bottomRef : null
            const id = fuzzySearch.trim() ? undefined : idInit
            const ref = fuzzySearch.trim() ? null : refInit
            const keys = Object.keys(indicators ?? Object.create(null))
            const findKey = keys.find((key) => getAddress(key) === getAddress(o.token))
            const values = indicators?.[findKey ?? ''] ?? Object.create(null)
            const findToken = (spotPrices ?? []).find((t) => t.name === o.name)
            const decimals = Number(findToken?.price ?? 0) === 0 ? 2 : o.price_decimals
            return (
              <DropDownListItem
                key={o.name + index}
                id={id}
                ref={ref}
                content={
                  isMobile ? (
                    <>
                      <aside>
                        <Favorite data={o} />
                        <h5>{o.name}</h5>
                        <BalanceShow value={values?.apy ?? 0} percent unit="APR" />
                      </aside>
                      <aside>
                        <BalanceShow value={findToken?.price ?? 0} decimal={decimals} />
                        <ChangePercent value={values?.price_change_rate ?? 0} />
                      </aside>
                    </>
                  ) : (
                    <>
                      <Favorite data={o} />
                      <h5>{o.name}</h5>
                      <BalanceShow value={findToken?.price ?? 0} decimal={decimals} />
                      <ChangePercent value={values?.price_change_rate ?? 0} />
                      <BalanceShow value={values?.apy ?? 0} percent unit="APR" />
                    </>
                  )
                }
                onSelect={() => {
                  const { name, token, derivative, price_decimals: decimals } = o
                  updateQuoteToken({ name, token, decimals, derivative, margin: marginToken.symbol })
                }}
              />
            )
          })
        ) : pairOptions.loaded ? null : (
          <NoResults />
        )}
      </DropDownList>
    </div>
  )
}

export default SymbolSelect
