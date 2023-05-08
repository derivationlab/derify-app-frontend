import PubSub from 'pubsub-js'
import { debounce, orderBy } from 'lodash'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useEffect, useMemo, useReducer } from 'react'
import { findToken } from '@/config/tokens'
import { PubSubEvents } from '@/typings'
import { getGrantPlanList } from '@/api'
import { useMarginListStore } from '@/store/useMarginToken'
import { all, grantTargetOptions } from '@/reducers/addGrant'
import { grantStateOptions, reducer, stateInit } from '@/reducers/addGrant'
import { Select } from '@/components/common/Form'
import Image from '@/components/common/Image'
import Pagination from '@/components/common/Pagination'
import ListItem from './ListItem'
import AddGrant from './AddGrant'

const grantTarget = grantTargetOptions(true)

const GrantList: FC = () => {
  const { t } = useTranslation()
  const [state, dispatch] = useReducer(reducer, stateInit)

  const marginList = useMarginListStore((state) => state.marginList)
  const marginListLoaded = useMarginListStore((state) => state.marginListLoaded)

  const options = useMemo(() => {
    if (marginListLoaded) {
      const _ = marginList.map((token) => ({
        value: token.symbol,
        label: token.symbol,
        icon: `market/${token.symbol.toLowerCase()}.svg`
      }))

      return [all, ..._]
    }

    return [all]
  }, [marginList, marginListLoaded])

  const _getGrantPlanList = useCallback(async (index = 0, marginToken, grantStatus, grantTarget) => {
    const token = findToken(marginToken)?.tokenAddress ?? 'all'

    const { data } = await getGrantPlanList(token, grantTarget, grantStatus, index, 8)

    const sort = orderBy(data?.records ?? [], ['open'], 'desc')

    dispatch({
      type: 'SET_GRANT_DAT',
      payload: { records: sort, totalItems: data?.totalItems ?? 0, isLoaded: false }
    })
  }, [])

  const pageChange = useCallback(
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
      void debounceSearch(state.marginToken1, state.grantStatus, state.grantTarget1)
    }

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
        <Select
          large
          filter
          label={t('NewDashboard.GrantList.Margin', 'Margin')}
          value={state.marginToken1}
          onChange={(v) => dispatch({ type: 'SET_MARGIN_TOKEN1', payload: v })}
          renderer={(props) => (
            <div className="web-select-options-item">
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
        {state.grantData.records.map((item, index) => (
          <ListItem key={index} data={item} />
        ))}
      </div>
      <Pagination page={state.pageIndex} pageSize={8} total={state.grantData.totalItems} onChange={pageChange} />
    </div>
  )
}

export default GrantList
