import PubSub from 'pubsub-js'
import { debounce } from 'lodash'
import React, { FC, useCallback, useEffect, useMemo, useReducer } from 'react'
import { useTranslation } from 'react-i18next'

import { PubSubEvents } from '@/typings'
import { getGrantList } from '@/api'
import { all, grantTargetOptions } from '@/reducers/addGrant'
import { findToken, MARGIN_TOKENS } from '@/config/tokens'
import { grantStateOptions, reducer, stateInit } from '@/reducers/grantList'

import { Select } from '@/components/common/Form'
import Image from '@/components/common/Image'
import Pagination from '@/components/common/Pagination'

import ListItem from './ListItem'
import AddGrant from './AddGrant'

const targetOptions = grantTargetOptions(true)

const GrantList: FC = () => {
  const { t } = useTranslation()
  const [state, dispatch] = useReducer(reducer, stateInit)

  const pageChange = useCallback(
    (index: number) => {
      dispatch({ type: 'SET_PAGE_INDEX', payload: index })

      void fetchData(index, state.marginToken, state.grantStatus, state.grantTarget)
    },
    [state.marginToken, state.grantStatus, state.grantTarget]
  )

  const fetchData = useCallback(async (index = 0, marginToken, grantStatus, grantTarget) => {
    const _marginToken = findToken(marginToken)?.tokenAddress ?? 'all'
    const _grantStatus = grantStateOptions.find((t) => t.value === grantStatus)?.key ?? 'all'
    const _grantTarget = targetOptions.find((t) => t.value === grantTarget)?.nick ?? 'all'

    const { data } = await getGrantList(_marginToken, _grantTarget, _grantStatus, index, 9)

    dispatch({
      type: 'SET_GRANT_DAT',
      payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
    })
  }, [])

  const marginOptions = useMemo(() => {
    const base = MARGIN_TOKENS.map((t) => ({
      value: t.symbol,
      label: t.symbol,
      icon: `market/${t.symbol.toLowerCase()}.svg`
    }))

    return [all, ...base]
  }, [])

  const debounceSearch = useCallback(
    debounce((marginToken, grantStatus, grantTarget) => {
      void fetchData(0, marginToken, grantStatus, grantTarget)
    }, 1000),
    []
  )

  useEffect(() => {
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

      void fetchData(0, state.marginToken, state.grantStatus, state.grantTarget)
    })

    void fetchData(0, state.marginToken, state.grantStatus, state.grantTarget)
  }, [state.marginToken, state.grantStatus, state.grantTarget])

  useEffect(() => {
    if (state.marginToken || state.grantStatus || state.grantTarget) {
      dispatch({
        type: 'SET_GRANT_DAT',
        payload: { records: [], totalItems: 0, isLoaded: true }
      })

      void debounceSearch(state.marginToken, state.grantStatus, state.grantTarget)
    }
  }, [state.marginToken, state.grantStatus, state.grantTarget])

  return (
    <div className="web-dashboard">
      <header className="web-dashboard-grant-header">
        <Select
          large
          filter
          label={t('NewDashboard.GrantList.Margin', 'Margin')}
          value={state.marginToken}
          onChange={(v) => dispatch({ type: 'SET_MARGIN_TOKEN', payload: v })}
          renderer={(props) => (
            <div className="web-select-options-item">
              {props.icon && <Image src={props.icon} />}
              {props.label}
            </div>
          )}
          objOptions={marginOptions}
          labelRenderer={(props) => (
            <div className="web-dashboard-add-grant-margin-label">
              {props.icon && <Image src={props.icon} />}
              <span>{props.label}</span>
            </div>
          )}
          filterPlaceholder="Search name or contract address..."
        />
        <Select
          large
          label={t('NewDashboard.GrantList.Target', 'Target')}
          value={state.grantTarget}
          onChange={(v) => dispatch({ type: 'SET_GRANT_TARGET', payload: v })}
          objOptions={targetOptions as any}
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
        {state.grantData.records.map((item, index) => (
          <ListItem key={index} data={item} />
        ))}
      </div>
      <Pagination page={state.pageIndex} total={state.grantData.totalItems} onChange={pageChange} />
    </div>
  )
}

export default GrantList
