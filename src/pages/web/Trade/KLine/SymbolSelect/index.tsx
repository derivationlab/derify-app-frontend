import { getDerivativeList, searchDerivative } from 'derify-apis-test'
import { getAddress } from 'ethers/lib/utils'
import { debounce, uniqBy } from 'lodash-es'

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'

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
let switchSettings = 0

interface Resource {
  originData: Rec[]
  searchData: Rec[]
  searchKeywords: string
  searchLoaded: boolean
}

const initResource = { originData: [], searchData: [], searchLoaded: false, searchKeywords: '' }

const SymbolSelect = () => {
  const bottomRef = useRef(null)
  const observerRef = useRef<IntersectionObserver | null>()
  const { t } = useTranslation()
  const [resource, setResource] = useState<Resource>(initResource)
  const {
    checking,
    spotPrice,
    indicator,
    quoteToken,
    spotPrices,
    indicators,
    marginToken,
    derivativeList,
    traderFavorite,
    protocolConfig,
    updateSpotPrices,
    updateQuoteToken
  } = useInitData(uniqBy([...resource.originData, ...resource.searchData], 'token'))

  const different = useMemo(() => {
    return resource.searchKeywords ? resource.searchData : resource.originData
  }, [resource, traderFavorite])

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
    switchSettings = 1

    const { data } = await getDerivativeList<{ data: Rec }>(marginToken.address, seqCount, TRADING_VISIBLE_COUNT)
    if (protocolConfig && data?.records) {
      const filterRecords = data.records.filter((r: Rec) => r.open) // opening
      const pairAddresses = await getPairAddressList(protocolConfig.factory, filterRecords)
      const output = (pairAddresses ?? []).filter((l) => l.derivative !== ZERO) // deployed
      const combine = [...resource.originData, ...output]
      const deduplication = uniqBy(combine, 'token')
      setResource((val) => ({ ...val, originData: deduplication }))
      if (data.records.length === 0 || data.records.length < TRADING_VISIBLE_COUNT) seqCount = seqCount - 1
    }

    switchSettings = 0
  }, [protocolConfig, resource.originData])

  /**
   * TODO:
   * If the transaction pair cached by the browser is found to be off the shelf (open or not open),
   * other transaction pair information will be displayed
   *
   * FIXME：
   * xx/xx - api error
   */
  const fuzzySearchFunc = useCallback(
    debounce(async (marginToken: string, derivativeList: Rec[], fuzzySearch: string, factory: string) => {
      let searchData: Rec[]
      try {
        const { data } = await searchDerivative<{ data: Rec[] }>(marginToken, fuzzySearch)
        const notIncludedInDerivativeList = data.filter((d) => !derivativeList.some((p) => p.token === d.token))
        if (notIncludedInDerivativeList.length) {
          const openList = notIncludedInDerivativeList.filter((d) => d.open) // opening
          const contract = await getPairAddressList(factory, openList)
          searchData = (contract ?? []).filter((l) => l.derivative !== ZERO) // deployed
        } else {
          searchData = data
        }
        setResource((val) => ({ ...val, searchData }))
      } catch (e) {
        setResource((val) => ({ ...val, searchData: [] }))
      } finally {
        setResource((val) => ({ ...val, searchLoaded: false }))
      }
    }, 200),
    []
  )

  const handleSearch = useCallback(
    (v: string) => {
      if (!v.trim()) {
        setResource((val) => ({
          ...val,
          originData: uniqBy([...traderFavorite, ...derivativeList], 'token'),
          searchData: [],
          searchLoaded: false,
          searchKeywords: ''
        }))
      } else {
        setResource((val) => ({ ...val, searchKeywords: v.trim(), searchData: [], searchLoaded: true }))
        void fuzzySearchFunc(marginToken.address, derivativeList, v.trim(), protocolConfig?.factory ?? '')
      }
    },
    [marginToken, protocolConfig, derivativeList, traderFavorite]
  )

  useEffect(() => {
    if (spotPrices) updateSpotPrices(spotPrices)
  }, [spotPrices])

  useEffect(() => {
    setResource((val) => ({ ...val, originData: uniqBy([...traderFavorite, ...derivativeList], 'token') }))
  }, [derivativeList, traderFavorite])

  useEffect(() => {
    if (resource.originData.length) {
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target.id === 'bottom') {
              console.info('IntersectionObserver......')
              seqCount += 1
              if (switchSettings === 0) void morePairs()
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
  }, [resource.originData.length])

  // useEffect(() => {
  //   console.info(derivativeList)
  // }, [derivativeList])

  return (
    <div className="web-trade-symbol-select">
      <DropDownList
        entry={currentTk}
        height={588}
        loading={resource.searchLoaded}
        disabled={derivativeList.length === 0}
        onSearch={handleSearch}
        placeholder={t('Trade.kline.SearchTip')}
      >
        {different.length ? (
          different.map((o: Rec, index: number) => {
            const len = different.length
            const id = index === len - 1 ? 'bottom' : undefined
            const ref = index === len - 1 ? bottomRef : null
            const idInit = resource.searchKeywords.trim() ? undefined : id
            const refInit = resource.searchKeywords.trim() ? null : ref
            const keys = Object.keys(indicators ?? Object.create(null))
            const findKey = keys.find((key) => getAddress(key) === getAddress(o.token))
            const values = indicators?.[findKey ?? ''] ?? Object.create(null)
            const findToken = (spotPrices ?? []).find((t) => t.name === o.name)
            const decimals = Number(findToken?.price ?? 0) === 0 ? 2 : o.price_decimals
            return (
              <DropDownListItem
                key={o.name + index}
                id={idInit}
                ref={refInit}
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
        ) : resource.searchLoaded ? null : (
          <NoResults />
        )}
      </DropDownList>
    </div>
  )
}

export default SymbolSelect
