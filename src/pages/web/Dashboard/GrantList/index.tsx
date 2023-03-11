import React, { FC, useCallback, useState } from 'react'

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
import { useBrokerInfo } from '@/zustand/useBrokerInfo'
import { useQuoteToken } from '@/zustand'
import {
  getActiveRankGrantCount,
  getActiveRankGrantRatios,
  getActiveRankGrantTotalAmount,
  getRankGrantList,
  getTraderMarginBalance
} from '@/api'
import { findToken } from '@/config/tokens'

const GrantList: FC = () => {
  const { data } = useAccount()

  const [pageIndex, setPageIndex] = useState<number>(0)
  const [marginType, setMarginType] = useState<string | number>('')
  const [target, setTarget] = useState<string | number>('')
  const [state, setState] = useState<string | number>('')

  const marginToken = useMTokenFromRoute()

  const quoteToken = useQuoteToken((state) => state.quoteToken)

  const { protocolConfig } = useProtocolConf(quoteToken, marginToken)

  const onPageChangeEv = (index: number) => {
    setPageIndex(index)
    // void getBrokersListCb(index)
  }

  const { addGrantPlan } = useAddGrant()

  const _addGrantPlan = useCallback(async () => {
    // upcoming， active，closed
    if (data?.address) await getRankGrantList(findToken(marginToken)?.tokenAddress, data?.address, 'upcoming', 0, 10)
    if (data?.address) await getTraderMarginBalance(data?.address, 0, 10)
    await getActiveRankGrantCount(findToken(marginToken)?.tokenAddress)
    await getActiveRankGrantRatios(findToken(marginToken)?.tokenAddress)
    await getActiveRankGrantTotalAmount(findToken(marginToken)?.tokenAddress)
    if (protocolConfig) await addGrantPlan(1, protocolConfig.awards, '2000', '4', '4')
  }, [data?.address, protocolConfig, marginToken])

  return (
    <div className="web-dashboard">
      <button onClick={_addGrantPlan}>addGrantPlan</button>
      <header className="web-dashboard-grant-header">
        <Select
          label="Margin"
          value={marginType}
          onChange={setMarginType}
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
        <Select label="Target" value={target} onChange={setTarget} large objOptions={TargetData} />
        <Select label="State" value={state} onChange={setState} large objOptions={StateData} />
      </header>
      <div className="web-dashboard-grant-list">
        <AddGrant />
        {GrantListData.map((item, index) => (
          <ListItem key={index} data={item} />
        ))}
      </div>
      <Pagination page={pageIndex} total={100} onChange={onPageChangeEv} />
    </div>
  )
}

export default GrantList
