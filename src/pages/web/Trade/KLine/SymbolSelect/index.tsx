import classNames from 'classnames'
import { getAddress } from 'ethers/lib/utils'
import { debounce, uniqBy } from 'lodash'

import React, { FC, useState, useRef, useContext, useMemo, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickAway } from 'react-use'

import { getDerivativeList, searchMarginToken } from '@/api'
import ChangePercent from '@/components/common/ChangePercent'
import { DropDownList, DropDownListItem } from '@/components/common/DropDownList'
import Skeleton from '@/components/common/Skeleton'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { usePriceDecimalsSupport, useTokenSpotPricesSupport } from '@/hooks/useTokenSpotPrices'
import { MobileContext } from '@/providers/Mobile'
import {
  getDerAddressList,
  useDerivativeListStore,
  useMarginIndicatorsStore,
  useMarginTokenStore,
  useProtocolConfigStore,
  useQuoteTokenStore
} from '@/store'
import { MarginTokenState, QuoteTokenState } from '@/store/types'
import { Rec } from '@/typings'

interface Props {
  onToggle?: () => void
}

let seqCount = 0

const SymbolSelect: FC<Props> = ({ onToggle }) => {
  const ref = useRef(null)
  const bottomRef = useRef<any>()
  const observerRef = useRef<IntersectionObserver | null>()
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)
  const [showOptions, setShowOptions] = useState<boolean>(false)
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [pairOptions, setPairOptions] = useState<{ data: Rec[]; loaded: boolean }>({
    data: [],
    loaded: false
  })
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const derivativeList = useDerivativeListStore((state) => state.derivativeList)
  const derAddressList = useDerivativeListStore((state) => state.derAddressList)
  const updateQuoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.updateQuoteToken)
  const marginIndicators = useMarginIndicatorsStore((state) => state.marginIndicators)
  const { priceDecimals } = usePriceDecimalsSupport(pairOptions.data)
  const { data: tokenSpotPrices } = useTokenSpotPricesSupport(pairOptions.data, priceDecimals)

  const spotPrice = useMemo(() => {
    if (tokenSpotPrices) {
      const find = tokenSpotPrices.find((t) => t.name === quoteToken.symbol)
      return find?.price ?? '0'
    }
    return '0'
  }, [quoteToken, tokenSpotPrices])

  const indicator = useMemo(() => {
    if (marginIndicators) {
      const keys = Object.keys(marginIndicators)
      const find = keys.find((key) => getAddress(key) === getAddress(quoteToken.token))
      return find ? marginIndicators[find]?.price_change_rate ?? 0 : 0
    }
    return 0
  }, [quoteToken, marginIndicators])

  const toggle = () => {
    setShowOptions(false)
    onToggle?.()
  }

  const funcAsync = useCallback(async () => {
    const { data } = await getDerivativeList(marginToken.address, seqCount)
    if (protocolConfig && data?.records) {
      const filterRecords = data.records.filter((r: Rec) => r.open)
      const pairAddresses = await getDerAddressList(protocolConfig.factory, filterRecords)
      const output: any[] = []
      filterRecords.forEach((d: Rec) => {
        if (pairAddresses[d.name]) output.push({ ...d, ...pairAddresses[d.name] })
      })
      const combine = [...pairOptions.data, ...output]
      const deduplication = uniqBy(combine, 'token')
      setPairOptions((val: any) => ({ ...val, data: deduplication, loaded: false }))
      if (data.records.length === 0 || data.records.length < 12) seqCount = seqCount - 1
    }
  }, [protocolConfig, pairOptions.data])

  const _searchMarginToken = useCallback(
    debounce(async (searchKeyword: string) => {
      const { data = [] } = await searchMarginToken(searchKeyword)
      setPairOptions({ data, loaded: false })
    }, 1500),
    []
  )

  useEffect(() => {
    if (searchKeyword.trim()) {
      setPairOptions({ data: [], loaded: true })
      void _searchMarginToken(searchKeyword)
    } else {
      seqCount = 0
      if (derivativeList.length && derAddressList) {
        const output: any[] = []
        derivativeList.forEach((d) => {
          if (derAddressList[d.name]) output.push({ ...d, ...derAddressList[d.name] })
        })
        setPairOptions({ data: output, loaded: false })
      }
    }
  }, [searchKeyword, derAddressList, derivativeList])

  useEffect(() => {
    if (pairOptions.data.length) {
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target.id === 'bottom') {
              seqCount += 1
              console.info('intersectionObserver=', seqCount)
              void funcAsync()
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

  useClickAway(ref, () => setShowOptions(false))

  return (
    <div className="web-trade-symbol-select">
      <div className={classNames('web-trade-symbol-select', { show: showOptions })} ref={ref}>
        {mobile && <div className="web-trade-symbol-select-toggle" onClick={toggle} />}
      </div>

      <DropDownList
        entry={
          quoteToken.symbol ? (
            <div className="web-trade-symbol-select-curr" onClick={() => setShowOptions(!showOptions)}>
              <h4>{quoteToken.symbol}</h4>
              <aside>
                <Skeleton rowsProps={{ rows: 1 }} animation loading={!tokenSpotPrices}>
                  <BalanceShow value={spotPrice} decimal={Number(spotPrice) === 0 ? 2 : quoteToken.decimals} />
                </Skeleton>
                <ChangePercent value={indicator} />
              </aside>
            </div>
          ) : (
            <div className="web-trade-symbol-select-curr s">{t('Trade.Derivative.NoTrading')}</div>
          )
        }
        height={588}
        loading={pairOptions.loaded}
        onSearch={setSearchKeyword}
        placeholder={t('Trade.kline.SearchTip')}
      >
        {pairOptions.data.map((o: Rec, index: number) => {
          const len = pairOptions.data.length
          const id = index === len - 1 ? 'bottom' : undefined
          const ref = index === len - 1 ? bottomRef : null
          const _id = searchKeyword.trim() ? undefined : id
          const _ref = searchKeyword.trim() ? null : ref
          const keys = Object.keys(marginIndicators ?? [])
          const findKey = keys.find((key) => getAddress(key) === getAddress(o.token))
          const values = marginIndicators?.[findKey ?? ''] ?? Object.create(null)
          const findToken = (tokenSpotPrices ?? []).find((t) => t.name === o.name)
          const decimals = Number(findToken?.price_decimals) === 0 ? 2 : o.price_decimals
          return (
            <DropDownListItem
              key={o.name}
              id={_id}
              ref={_ref}
              content={
                mobile ? (
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
                const { name, token, price_decimals } = o
                updateQuoteToken({ symbol: name, token, decimals: price_decimals })
              }}
            />
          )
        })}
      </DropDownList>
    </div>
  )
}

export default SymbolSelect
