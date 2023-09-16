import classNames from 'classnames'
import { debounce, uniqBy } from 'lodash'
import { useAccount } from 'wagmi'

import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import { searchMarginToken } from '@/api'
import { DropDownList, DropDownListItem } from '@/components/common/DropDownList'
import Image from '@/components/common/Image'
import { MARGIN_VISIBLE_COUNT } from '@/config'
import { useMarginBalances } from '@/hooks/useMarginBalances'
import { resortMargin } from '@/pages/web/MySpace'
import NoResults from '@/pages/web/Trade/c/NoResults'
import { getMarginDeployStatus, getMarginTokenList, useMarginTokenListStore, useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { Rec } from '@/typings'

let seqCount = 0

interface MarginOptions {
  data: Rec[]
  loaded: boolean
}

const MarginTokenList: FC = () => {
  const history = useHistory()
  const bottomRef = useRef<any>()
  const observerRef = useRef<IntersectionObserver | null>()
  const { t } = useTranslation()
  const { address } = useAccount()
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const updateMarginTokenListStore = useMarginTokenListStore((state) => state.updateMarginTokenListStore)
  const { data: marginBalances } = useMarginBalances(address, marginTokenList, marginToken)
  const [marginOptions, setMarginOptions] = useState<MarginOptions>({ data: [], loaded: false })
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  const fuzzySearchFunc = useCallback(
    debounce(async (searchKeyword: string) => {
      const { data = [] } = await searchMarginToken(searchKeyword)
      setMarginOptions({ data, loaded: false })
    }, 100),
    []
  )

  const funcAsync = useCallback(async () => {
    const { records = [] } = await getMarginTokenList(seqCount)
    const deployStatus = await getMarginDeployStatus(records)
    const filter = records.filter((f: Rec) => deployStatus[f.symbol])
    const combine = [...marginOptions.data, ...filter]
    const deduplication = uniqBy(combine, 'margin_token')
    setMarginOptions((val: any) => ({ ...val, data: deduplication, loaded: false }))
    updateMarginTokenListStore(deduplication)
    if (records.length === 0 || records.length < MARGIN_VISIBLE_COUNT) seqCount = seqCount - 1
  }, [marginOptions.data])

  useEffect(() => {
    if (searchKeyword.trim()) {
      setMarginOptions({ data: [], loaded: true })
      void fuzzySearchFunc(searchKeyword)
    } else {
      seqCount = 0
      if (marginTokenList.length && marginBalances) {
        const _ = marginTokenList.map((margin) => {
          const marginBalance = marginBalances?.[margin.symbol] ?? 0
          return { ...margin, marginBalance: Number(marginBalance) }
        })
        setMarginOptions({ data: resortMargin(_), loaded: false })
        updateMarginTokenListStore(marginTokenList)
      }
    }
  }, [searchKeyword, marginBalances, marginTokenList])

  useEffect(() => {
    if (marginOptions.data.length) {
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target.id === 'bottom') {
              seqCount += 1
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
  }, [marginOptions.data.length])

  return (
    <DropDownList
      entry={
        <div className="web-trade-bench-margin-token">
          <label>{t('Trade.Bench.Margin')}</label>
          <section>
            <Image src={marginToken.logo} />
            <strong>{marginToken.symbol}</strong>
          </section>
        </div>
      }
      loading={marginOptions.loaded}
      onSearch={setSearchKeyword}
      placeholder={t('Trade.Bench.SearchTip')}
    >
      {marginOptions.data.length ? (
        marginOptions.data.map((o: Rec, index: number) => {
          const len = marginOptions.data.length
          const id = index === len - 1 ? 'bottom' : undefined
          const ref = index === len - 1 ? bottomRef : null
          const _id = searchKeyword.trim() ? undefined : id
          const _ref = searchKeyword.trim() ? null : ref
          return (
            <DropDownListItem
              key={o.margin_token}
              id={_id}
              ref={_ref}
              content={
                <>
                  <Image src={o.logo} style={{ width: '24px' }} />
                  {o.symbol}
                </>
              }
              onSelect={() => history.push(`/${o.symbol}/trade`)}
              className={classNames('web-trade-bench-margin-item', { close: !o.open })}
            />
          )
        })
      ) : marginOptions.loaded ? null : (
        <NoResults />
      )}
    </DropDownList>
  )
}

export default MarginTokenList
