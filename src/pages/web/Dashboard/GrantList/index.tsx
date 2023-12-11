import classNames from 'classnames'
import { getGrantPlanList, searchMarginToken } from 'derify-apis'
import { isAddress } from 'ethers/lib/utils'
import { debounce, sortBy, uniqBy } from 'lodash-es'
import PubSub from 'pubsub-js'

import React, { FC, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DropDownList, DropDownListItem } from '@/components/common/DropDownList'
import Image from '@/components/common/Image'
import Pagination from '@/components/common/Pagination'
import Spinner from '@/components/common/Spinner'
import IsItConnected from '@/components/web/IsItConnected'
import { resortMargin } from '@/pages/web/Dashboard/Overview/MarketInfo'
import { grantTargetOptions } from '@/reducers/addGrant'
import { grantStateOptions, reducer, stateInit } from '@/reducers/addGrant'
import { getMarginDeployStatus, getMarginTokenList, useMarginTokenListStore } from '@/store/useMarginTokenList'
import { PubSubEvents, Rec } from '@/typings'

import AddGrant from './AddGrant'
import ListItem from './ListItem'

const grantTarget = grantTargetOptions(true)

let seqCount = 0

const GrantListInner: FC = () => {
  const bottomRef = useRef<any>()
  const observerRef = useRef<IntersectionObserver | null>()
  const { t } = useTranslation()
  const [state, dispatch] = useReducer(reducer, stateInit)
  const [marginOptions, setMarginOptions] = useState<{ data: Rec[]; loaded: boolean }>({
    data: [],
    loaded: false
  })
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)

  const currentMargin = useMemo(
    () => marginOptions.data.find((item: Rec) => item.margin_token === state.marginToken1),
    [state.marginToken1, marginOptions.data]
  )

  const currentTarget = useMemo(
    () => grantTarget.find((item: Rec) => item.value === state.grantTarget1),
    [state.grantTarget1]
  )

  const currentStatus = useMemo(
    () => grantStateOptions.find((item: Rec) => item.value === state.grantStatus),
    [state.grantStatus]
  )

  const _getGrantPlanList = useCallback(async (index = 0, marginToken, grantStatus, grantTarget) => {
    const { data } = await getGrantPlanList<{ data: Rec }>(marginToken, grantTarget, grantStatus, index, 8)

    const sort = sortBy(data?.records ?? [], ['open'], 'desc')

    dispatch({
      type: 'SET_GRANT_DAT',
      payload: { records: sort, totalItems: data?.totalItems ?? 0, isLoaded: false }
    })
  }, [])

  const fuzzySearchFunc = useCallback(
    debounce(async (searchKeyword: string) => {
      const { data = [] } = await searchMarginToken<{ data: Rec[] }>(searchKeyword)
      setMarginOptions({ data, loaded: false })
    }, 1500),
    []
  )

  const onPagination = useCallback(
    (index: number) => {
      dispatch({ type: 'SET_PAGE_INDEX', payload: index })

      void _getGrantPlanList(index, state.marginToken1, state.grantStatus, state.grantTarget1)
    },
    [state.marginToken1, state.grantStatus, state.grantTarget1]
  )

  const debounceSearch = useCallback(
    debounce((marginToken, grantStatus, grantTarget) => {
      void _getGrantPlanList(0, marginToken, grantStatus, grantTarget)
    }, 1000),
    []
  )

  useEffect(() => {
    if (state.marginToken1 || state.grantStatus || state.grantTarget1) {
      dispatch({ type: 'SET_GRANT_DAT', payload: { isLoaded: true } })

      void debounceSearch(state.marginToken1, state.grantStatus, state.grantTarget1)
    }

    PubSub.unsubscribe(PubSubEvents.UPDATE_GRANT_LIST)
    PubSub.subscribe(PubSubEvents.UPDATE_GRANT_LIST, () => {
      console.info(`UPDATE_GRANT_LIST`)

      dispatch({
        type: 'SET_GRANT_DAT',
        payload: { records: [], totalItems: 0, isLoaded: true }
      })
      dispatch({ type: 'SET_PAGE_INDEX', payload: 0 })
      dispatch({ type: 'SET_GRANT_TARGET', payload: '' })
      dispatch({ type: 'SET_GRANT_STATUS', payload: '' })
      dispatch({ type: 'SET_MARGIN_TOKEN', payload: '' })

      void debounceSearch(state.marginToken1, state.grantStatus, state.grantTarget1)
    })
  }, [state.marginToken1, state.grantStatus, state.grantTarget1])

  const funcAsync = useCallback(async () => {
    const { records = [] } = await getMarginTokenList(seqCount)
    const deployStatus = await getMarginDeployStatus(records)
    const filter = records.filter((f: Rec) => deployStatus[f.symbol])
    const combine = [...marginOptions.data, ...filter]
    const deduplication = uniqBy(combine, 'margin_token')
    setMarginOptions((val: any) => ({ ...val, data: deduplication, loaded: false }))
    if (records.length === 0 || records.length < 30) seqCount = seqCount - 1
  }, [marginOptions.data])

  useEffect(() => {
    if (searchKeyword.trim()) {
      setMarginOptions({ data: [], loaded: true })
      void fuzzySearchFunc(searchKeyword)
    } else {
      seqCount = 0
      if (marginTokenList.length) {
        const all = { margin_token: 'all', symbol: 'ALL' }
        setMarginOptions({
          data: [all, ...resortMargin(marginTokenList)],
          loaded: false
        })
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

  return (
    <div className="web-dashboard">
      <header className="web-dashboard-grant-header">
        <DropDownList
          entry={
            <div className="web-dashboard-grant-select-entry">
              <label>{t('NewDashboard.GrantList.Margin', 'Margin')}</label>
              <section>
                {currentMargin?.logo && <Image src={currentMargin?.logo} />}
                <strong>{currentMargin?.symbol}</strong>
              </section>
            </div>
          }
          loading={marginOptions.loaded}
          onSearch={setSearchKeyword}
          placeholder="Search name or contract address..."
        >
          {marginOptions.data.map((o: Rec, index: number) => {
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
                    {o.logo && <Image src={o.logo} />}
                    {o.symbol}
                  </>
                }
                onSelect={() => dispatch({ type: 'SET_MARGIN_TOKEN1', payload: o.margin_token })}
                className={classNames('web-dashboard-grant-margin-item', {
                  active: state.marginToken1 === o.margin_token,
                  close: isAddress(o.margin_token) && !o.open
                })}
              />
            )
          })}
        </DropDownList>
        <DropDownList
          entry={
            <div className="web-dashboard-grant-select-entry">
              <label>{t('NewDashboard.GrantList.Target')}</label>
              <section>
                <strong>{currentTarget?.label}</strong>
              </section>
            </div>
          }
          showSearch={false}
        >
          {grantTarget.map((o: any) => {
            return (
              <DropDownListItem
                key={o.value}
                content={o.label}
                onSelect={() => dispatch({ type: 'SET_GRANT_TARGET1', payload: o.value })}
                className={classNames('web-dashboard-grant-target-item', {
                  active: state.grantTarget1 === o.value
                })}
              />
            )
          })}
        </DropDownList>
        <DropDownList
          entry={
            <div className="web-dashboard-grant-select-entry">
              <label>{t('NewDashboard.GrantList.State')}</label>
              <section>
                <strong>{currentStatus?.label}</strong>
              </section>
            </div>
          }
          showSearch={false}
        >
          {grantStateOptions.map((o: any) => {
            return (
              <DropDownListItem
                key={o.value}
                content={o.label}
                onSelect={() => dispatch({ type: 'SET_GRANT_STATUS', payload: o.value })}
                className={classNames('web-dashboard-grant-status-item', {
                  active: state.grantStatus === o.value
                })}
              />
            )
          })}
        </DropDownList>
      </header>
      <div className="web-dashboard-grant-list">
        <AddGrant />
        {state.grantData.isLoaded ? (
          <Spinner small />
        ) : (
          state.grantData.records.map((item, index) => <ListItem key={index} data={item} />)
        )}
      </div>
      <Pagination page={state.pageIndex} pageSize={8} total={state.grantData.totalItems} onChange={onPagination} />
    </div>
  )
}

const GrantList = () => {
  return (
    <IsItConnected>
      <GrantListInner />
    </IsItConnected>
  )
}

export default GrantList
