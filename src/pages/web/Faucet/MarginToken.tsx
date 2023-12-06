import classNames from 'classnames'
import { searchMarginToken } from 'derify-apis-test'
import { debounce, uniqBy } from 'lodash-es'

import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DropDownList, DropDownListItem } from '@/components/common/DropDownList'
import Image from '@/components/common/Image'
import NoResults from '@/pages/web/Trade/c/NoResults'
import { getMarginDeployStatus, getMarginTokenList, useMarginTokenListStore } from '@/store'
import { Rec } from '@/typings'

let seqCount = 0

interface MarginOptions {
  data: Rec[]
  loaded: boolean
}

const MarginToken: FC<{ onSelect: (marginToken: Rec) => void }> = ({ onSelect }) => {
  const { t } = useTranslation()
  const bottomRef = useRef<any>()
  const observerRef = useRef<IntersectionObserver | null>()
  const marginTokens = useMarginTokenListStore((state) => state.marginTokenList)
  const updateMarginTokenListStore = useMarginTokenListStore((state) => state.updateMarginTokenListStore)
  const [selectedValue, setSelectedValue] = useState<Rec>({})
  const [marginOptions, setMarginOptions] = useState<MarginOptions>({ data: [], loaded: false })
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  const marginTokenList = useMemo(() => marginTokens.filter((l) => l.open), [marginTokens])

  const fuzzySearchFunc = useCallback(
    debounce(async (searchKeyword: string) => {
      const { data = [] } = await searchMarginToken<{ data: Rec[] }>(searchKeyword)
      setMarginOptions({ data, loaded: false })
    }, 100),
    []
  )

  const funcAsync = useCallback(async () => {
    const { records = [] } = await getMarginTokenList(seqCount)
    const deployStatus = await getMarginDeployStatus(records)
    const filter = records.filter((f: Rec) => deployStatus[f.symbol] && f.open)
    const combine = [...marginOptions.data, ...filter]
    const deduplication = uniqBy(combine, 'margin_token')
    setMarginOptions((val: any) => ({ ...val, data: deduplication, loaded: false }))
    updateMarginTokenListStore(deduplication)
    if (records.length === 0 || records.length < 30) seqCount = seqCount - 1
  }, [marginOptions.data])

  useEffect(() => {
    if (searchKeyword.trim()) {
      setMarginOptions({ data: [], loaded: true })
      void fuzzySearchFunc(searchKeyword)
    } else {
      seqCount = 0
      if (marginTokenList.length) {
        setMarginOptions({ data: marginTokenList, loaded: false })
        updateMarginTokenListStore(marginTokenList)
      }
    }
  }, [searchKeyword, marginTokenList])

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

  useEffect(() => {
    if (marginTokenList.length) setSelectedValue(marginTokenList[0])
  }, [marginTokenList])

  return (
    <DropDownList
      entry={
        <div className="web-faucet-margin-token">
          <label>{t('Trade.Bench.Margin')}</label>
          <section>
            {selectedValue.logo ? <Image src={selectedValue.logo} /> : <em className="img" />}
            <span>{selectedValue.symbol}</span>
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
                  {o.logo ? <Image src={o.logo} style={{ width: '24px' }} /> : <em className="img" />}
                  {o.symbol}
                </>
              }
              onSelect={() => {
                onSelect(o)
                setSelectedValue(o)
              }}
              className={classNames('web-faucet-margin-token-item', {
                active: selectedValue.margin_token === o.margin_token,
                close: !o.open
              })}
            />
          )
        })
      ) : marginOptions.loaded ? null : (
        <NoResults />
      )}
    </DropDownList>
  )
}

export default MarginToken
