import classNames from 'classnames'
import { getAddress } from 'ethers/lib/utils'
import { debounce, uniqBy } from 'lodash'

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import { useClickAway, useToggle } from 'react-use'

import { getDerivativeList, searchDerivative } from '@/api'
import ChangePercent from '@/components/common/ChangePercent'
import { DropDownList, DropDownListItem } from '@/components/common/DropDownList'
import Skeleton from '@/components/common/Skeleton'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { ZERO } from '@/config'
import { usePriceDecimals, useTokenSpotPrice, useTokenSpotPrices } from '@/hooks/useTokenSpotPrices'
import NoResults from '@/pages/web/Trade/c/NoResults'
import {
  getPairAddressList,
  useMarginIndicatorsStore,
  useMarginTokenStore,
  useProtocolConfigStore,
  useTokenSpotPricesStore
} from '@/store'
import { MarginTokenState } from '@/store/types'
import { Rec } from '@/typings'
import { useTokenProtect } from '@/hooks/useTokenProtect'

let seqCount = 0
const visibleCount = 12

interface PairOptionsInit {
  data: Rec[]
  loaded: boolean
}

const SymbolSelect = ({ onToggle }: { onToggle?: () => void }) => {
  const ref = useRef(null)
  const bottomRef = useRef<any>()
  const observerRef = useRef<IntersectionObserver | null>()
  const { t } = useTranslation()
  const [visible, toggleVisible] = useToggle(false)
  const [pairOptions, setPairOptions] = useState<PairOptionsInit>({ data: [], loaded: false })
  const [fuzzySearch, setFuzzySearch] = useState<string>('')
  const { checking, quoteToken, derivativeList, updateQuoteToken } = useTokenProtect()
  const { priceDecimals } = usePriceDecimals(pairOptions.data)
  const { spotPrices } = useTokenSpotPrices(pairOptions.data, priceDecimals, quoteToken)
  const { spotPrice } = useTokenSpotPrice(spotPrices, quoteToken.name)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const updateSpotPrices = useTokenSpotPricesStore((state) => state.updateTokenSpotPricesForTrading)
  const indicators = useMarginIndicatorsStore((state) => state.marginIndicators)
  const indicator = useMemo(() => {
    if (indicators) {
      const keys = Object.keys(indicators)
      const find = keys.find((key) => getAddress(key) === getAddress(quoteToken.token))
      return find ? indicators[find]?.price_change_rate ?? 0 : 0
    }
    return 0
  }, [quoteToken, indicators])

  const currentTk = useMemo(() => {
    if (checking) return <div className="web-trade-symbol-select-curr s">{t('common.Loading')} ...</div>
    if (derivativeList.length)
      return (
        <div className="web-trade-symbol-select-curr" onClick={() => toggleVisible(!visible)}>
          <h4>{quoteToken.name}</h4>
          <aside>
            <Skeleton rowsProps={{ rows: 1 }} animation loading={!spotPrices}>
              <BalanceShow value={spotPrice} decimal={Number(spotPrice) === 0 ? 2 : quoteToken.decimals} />
            </Skeleton>
            <ChangePercent value={indicator} />
          </aside>
        </div>
      )
    return <div className="web-trade-symbol-select-curr s">{t('Trade.Derivative.NoTrading')}</div>
  }, [spotPrice, quoteToken, checking])

  const morePairs = useCallback(async () => {
    const { data } = await getDerivativeList(marginToken.address, seqCount)
    if (protocolConfig && data?.records) {
      const filterRecords = data.records.filter((r: Rec) => r.open) // opening
      const pairAddresses = await getPairAddressList(protocolConfig.factory, filterRecords)
      const output = (pairAddresses ?? []).filter((l) => l.derivative !== ZERO) // deployed
      const combine = [...pairOptions.data, ...output]
      const deduplication = uniqBy(combine, 'token')
      setPairOptions((val: any) => ({ ...val, data: deduplication, loaded: false }))
      if (data.records.length === 0 || data.records.length < visibleCount) seqCount = seqCount - 1
    }
  }, [protocolConfig, pairOptions.data])

  // xrp/usd - error
  // 地址搜索 - 不支持
  const fuzzySearchFunc = useCallback(
    debounce(async (marginToken: string, fuzzySearch: string) => {
      const { data } = await searchDerivative(marginToken, fuzzySearch)
      setPairOptions({ data, loaded: false })
    }, 100),
    []
  )

  useEffect(() => {
    if (spotPrices) updateSpotPrices(spotPrices)
  }, [spotPrices])

  useEffect(() => {
    if (fuzzySearch.trim()) {
      setPairOptions({ data: [], loaded: true })
      void fuzzySearchFunc(marginToken.address, fuzzySearch)
    } else {
      seqCount = 0
      if (derivativeList.length) {
        setPairOptions({ data: derivativeList, loaded: false })
      }
    }
  }, [marginToken, fuzzySearch, derivativeList])

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

  useClickAway(ref, () => toggleVisible(false))

  return (
    <div className="web-trade-symbol-select">
      <div className={classNames('web-trade-symbol-select', { show: visible })} ref={ref}>
        {isMobile && (
          <div
            className="web-trade-symbol-select-toggle"
            onClick={() => {
              onToggle?.()
              toggleVisible(false)
            }}
          />
        )}
      </div>

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
                key={o.name}
                id={id}
                ref={ref}
                content={
                  isMobile ? (
                    <>
                      <aside>
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
