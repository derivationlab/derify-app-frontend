import { useAccount } from 'wagmi'
import React, { FC, useCallback, useEffect, useMemo, useReducer } from 'react'

import { useProtocolConf } from '@/hooks/useMatchConf'
import { useMTokenFromRoute } from '@/hooks/useTrading'
import { grantTargetOptions } from '@/reducers/addGrant'
import { findToken, MARGIN_TOKENS } from '@/config/tokens'
import { grantStateOptions, reducer, stateInit } from '@/reducers/grantList'
import {
  getGrantList,
  getTraderMarginBalance,
  getActiveRankGrantCount,
  getActiveRankGrantRatios,
  getActiveRankGrantTotalAmount
} from '@/api'

import { Select } from '@/components/common/Form'
import Image from '@/components/common/Image'
import Pagination from '@/components/common/Pagination'

import { GrantListData } from './mockData'
import ListItem from './ListItem'
import AddGrant from './AddGrant'

const targetOptions = grantTargetOptions()

const GrantList: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { address } = useAccount()

  const { marginToken } = useMTokenFromRoute()
  const { protocolConfig } = useProtocolConf(marginToken)

  const pageChange = (index: number) => {
    dispatch({ type: 'SET_PAGE_INDEX', payload: index })

    void fetchData(index)
  }

  const fetchData = useCallback(
    async (index = 0) => {
      const marginToken = findToken(state.marginToken).tokenAddress
      const grantStatus = grantStateOptions.find((t) => t.value === state.grantStatus)?.key ?? 'all'
      const grantTarget = targetOptions.find((t) => t.value === state.grantTarget)?.key ?? 'all'

      const { data } = await getGrantList(marginToken, grantTarget, grantStatus, index, 9)

      dispatch({
        type: 'SET_GRANT_DAT',
        payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
      })
    },
    [state.marginToken, state.grantStatus, state.grantTarget]
  )

  // debug todo
  const _addGrantPlan = useCallback(async () => {
    if (address) await getTraderMarginBalance(address, 0, 10) // 404
    await getActiveRankGrantCount(findToken(marginToken)?.tokenAddress) // count: 0
    if (address) await getActiveRankGrantRatios(findToken(marginToken)?.tokenAddress, address) // []
    await getActiveRankGrantTotalAmount(findToken(marginToken)?.tokenAddress) // totalAmount: null
  }, [address, protocolConfig, marginToken])

  const marginOptions = useMemo(
    () =>
      MARGIN_TOKENS.map((t) => ({
        value: t.symbol,
        label: t.symbol,
        icon: `market/${t.symbol.toLowerCase()}.svg`
      })),
    []
  )

  useEffect(() => {
    void fetchData()
  }, [])

  return (
    <div className="web-dashboard">
      {/*<button onClick={_addGrantPlan}>fetchData</button>*/}
      <header className="web-dashboard-grant-header">
        <Select
          large
          filter
          label="Margin"
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
          label="Target"
          value={state.grantTarget}
          onChange={(v) => dispatch({ type: 'SET_GRANT_TARGET', payload: v })}
          objOptions={targetOptions as any}
        />
        <Select
          large
          label="State"
          value={state.grantStatus}
          onChange={(v) => dispatch({ type: 'SET_GRANT_STATUS', payload: v })}
          objOptions={grantStateOptions as any}
        />
      </header>
      <div className="web-dashboard-grant-list">
        <AddGrant />
        {GrantListData.map((item, index) => (
          <ListItem key={index} data={item} />
        ))}
      </div>
      <Pagination page={state.pageIndex} total={state.grantData.totalItems} onChange={pageChange} />
    </div>
  )
}

export default GrantList
