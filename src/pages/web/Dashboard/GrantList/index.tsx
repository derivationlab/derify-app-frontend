import classNames from 'classnames'
import { debounce, sortBy } from 'lodash'
import PubSub from 'pubsub-js'

import React, { FC, useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getGrantPlanList } from '@/api'
import Select from '@/components/common/Form/Select'
import Image from '@/components/common/Image'
import Pagination from '@/components/common/Pagination'
import Spinner from '@/components/common/Spinner'
import { resortMargin } from '@/pages/web/Dashboard/Overview/MarketInfo'
import { all, grantTargetOptions } from '@/reducers/addGrant'
import { grantStateOptions, reducer, stateInit } from '@/reducers/addGrant'
import { useMarginTokenListStore } from '@/store/useMarginTokenList'
import { PubSubEvents } from '@/typings'

import AddGrant from './AddGrant'
import ListItem from './ListItem'

const grantTarget = grantTargetOptions(true)

interface IPagination {
  data: any[]
  index: number
}

const GrantList: FC = () => {
  const { t } = useTranslation()
  const [state, dispatch] = useReducer(reducer, stateInit)
  const [pagination, setPagination] = useState<IPagination>({ data: [], index: 0 })

  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)

  const options = useMemo(() => {
    if (pagination.data.length) {
      const output: any[] = []
      pagination.data.forEach((token) => {
        output.push({
          value: token.margin_token,
          label: token.symbol,
          icon: token.logo,
          open: token.open
        })
      })
      return [all, ...output]
    }

    return [all]
  }, [pagination.data])

  const _getGrantPlanList = useCallback(async (index = 0, marginToken, grantStatus, grantTarget) => {
    const { data } = await getGrantPlanList(marginToken, grantTarget, grantStatus, index, 8)

    const sort = sortBy(data?.records ?? [], ['open'], 'desc')

    dispatch({
      type: 'SET_GRANT_DAT',
      payload: { records: sort, totalItems: data?.totalItems ?? 0, isLoaded: false }
    })
  }, [])

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
    const intersectionObserver = new IntersectionObserver(
      function (entries) {
        if (entries[0].intersectionRatio <= 0) return
        setPagination((val) => ({ ...val, index: ++pagination.index }))
      },
      { threshold: 0 }
    )

    const parent = document.getElementById('MARGIN')
    const children = parent?.querySelectorAll('.web-select-options-li')
    const target = children?.[children.length - 1]
    if (target) intersectionObserver.observe(target)
  }, [options])

  useEffect(() => {
    if (marginTokenList.length) {
      setPagination((val) => ({ ...val, data: resortMargin(marginTokenList) }))
    }
  }, [marginTokenList])

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

  return (
    <div className="web-dashboard">
      <header className="web-dashboard-grant-header">
        <div id="MARGIN">
          <Select
            large
            filter
            label={t('NewDashboard.GrantList.Margin', 'Margin')}
            value={state.marginToken1}
            onChange={(v) => dispatch({ type: 'SET_MARGIN_TOKEN1', payload: v })}
            renderer={(props) => (
              <div className={classNames('web-select-options-item', { close: props.open === 0 })}>
                {props.icon && <Image src={props.icon} />}
                {props.label}
              </div>
            )}
            objOptions={options as any}
            labelRenderer={(props) => (
              <div className="web-dashboard-add-grant-margin-label">
                {props.icon && <Image src={props.icon} />}
                <span>{props.label}</span>
              </div>
            )}
            filterPlaceholder="Search name or contract address..."
          />
        </div>
        <Select
          large
          label={t('NewDashboard.GrantList.Target', 'Target')}
          value={state.grantTarget1}
          onChange={(v) => dispatch({ type: 'SET_GRANT_TARGET1', payload: v })}
          objOptions={grantTarget as any}
        />
        <Select
          large
          label={t('NewDashboard.GrantList.State', 'State')}
          value={state.grantStatus}
          onChange={(v) => dispatch({ type: 'SET_GRANT_STATUS', payload: v })}
          objOptions={grantStateOptions as any}
        />
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

export default GrantList
