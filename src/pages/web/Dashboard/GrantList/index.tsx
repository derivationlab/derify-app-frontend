import React, { FC, useCallback, useReducer } from 'react'

import { Select } from '@/components/common/Form'
import Image from '@/components/common/Image'
import Pagination from '@/components/common/Pagination'

import { MarginData, TargetData, StateData, GrantListData } from './mockData'

import ListItem from './ListItem'
import AddGrant from './AddGrant'
import { useAddGrant } from '@/hooks/useDashboard'
import { useAccount } from 'wagmi'
import { useProtocolConf } from '@/hooks/useMatchConf'
import { useMTokenFromRoute } from '@/hooks/useTrading'
import { useQuoteToken } from '@/zustand'
import {
  getActiveRankGrantCount,
  getActiveRankGrantRatios,
  getActiveRankGrantTotalAmount,
  getGrantList,
  getTraderMarginBalance
} from '@/api'
import { findToken } from '@/config/tokens'
import { reducer, stateInit } from '@/reducers/grantList'

const GrantList: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { data } = useAccount()

  const marginToken = useMTokenFromRoute()

  const quoteToken = useQuoteToken((state) => state.quoteToken)

  const { protocolConfig } = useProtocolConf(quoteToken, marginToken)

  const fetchData = useCallback(async (index = 0) => {
    console.info(index)
    // dispatch({
    //   type: 'SET_GRANT_DAT',
    //   payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
    // })
  }, [])

  const pageChange = (index: number) => {
    dispatch({ type: 'SET_PAGE_INDEX', payload: index })

    void fetchData(index)
  }

  const { addGrantPlan } = useAddGrant()

  const _addGrantPlan = useCallback(async () => {
    /**
     * marginToken: 保证金地址('all'或者'0x...'，默认'all')
     * target: 奖励对象 enum{'all','rank', 'pmr', 'broker_rewards'}，默认'all'
     * status： 交易比赛状态 enum{'upcoming', 'active', 'closed', 'all'), 默认'all'
     */
    if (data?.address) await getGrantList(findToken(marginToken)?.tokenAddress, 'all', 'all', 0, 10)
    if (data?.address) await getTraderMarginBalance(data?.address, 0, 10)
    await getActiveRankGrantCount(findToken(marginToken)?.tokenAddress)
    if (data?.address) await getActiveRankGrantRatios(findToken(marginToken)?.tokenAddress, data?.address)
    await getActiveRankGrantTotalAmount(findToken(marginToken)?.tokenAddress)
    if (protocolConfig) await addGrantPlan(1, protocolConfig.awards, '2000', '4', '4')
  }, [data?.address, protocolConfig, marginToken])

  return (
    <div className="web-dashboard">
      <button onClick={_addGrantPlan}>addGrantPlan</button>
      <header className="web-dashboard-grant-header">
        <Select
          label="Margin"
          value={state.marginToken}
          onChange={(v) => dispatch({ type: 'SET_MARGIN_TOKEN', payload: v })}
          large
          filter
          filterPlaceholder="serch name or contract address.."
          objOptions={MarginData}
          renderer={(props) => (
            <div className="web-select-options-item">
              {props.icon && <Image src={props.icon} />}
              {props.label}
            </div>
          )}
        />
        <Select
          label="Target"
          value={state.grantType}
          onChange={(v) => dispatch({ type: 'SET_GRANT_TYPE', payload: v })}
          large
          objOptions={TargetData}
        />
        <Select
          label="State"
          value={state.grantStatus}
          onChange={(v) => dispatch({ type: 'SET_GRANT_STATUS', payload: v })}
          large
          objOptions={StateData}
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
