import PubSub from 'pubsub-js'
import { isEmpty } from 'lodash'
import { useAccount } from 'wagmi'
import React, { FC, useEffect, useMemo, useReducer } from 'react'

import { findToken } from '@/config/tokens'
import { PubSubEvents } from '@/typings'
import { useMTokenFromRoute } from '@/hooks/useTrading'
import { reducer, stateInit } from '@/reducers/positionDAT'
import { getTraderTradeFlow } from '@/api'

import Loading from '@/components/common/Loading'
import Pagination from '@/components/common/Pagination'

import ListItem from './ListItem'
import NoRecord from '../c/NoRecord'

const TradeHistory: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { address } = useAccount()

  const { marginToken } = useMTokenFromRoute()

  const fetchData = async (index = 0) => {
    if (address) {
      const { data } = await getTraderTradeFlow(findToken(marginToken).tokenAddress, address, index, 10)

      dispatch({
        type: 'SET_POSITION_DAT',
        payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
      })
    }
  }

  const pageChange = (index: number) => {
    dispatch({ type: 'SET_PAGE_INDEX', payload: index })

    void fetchData(index)
  }

  const memoTradeHistory = useMemo(() => {
    if (!address) return <NoRecord show />
    if (state.positionDAT.isLoaded) return <Loading show type="section" />
    if (!isEmpty(state.positionDAT?.records)) {
      return state.positionDAT.records.map((d: Record<string, any>, i: number) => (
        <ListItem key={`trade-history-${i}`} data={d} />
      ))
    }
    return <NoRecord show />
  }, [address, state.positionDAT])

  useEffect(() => {
    void fetchData()

    PubSub.subscribe(PubSubEvents.UPDATE_TRADE_HISTORY, () => {
      void fetchData()
    })
  }, [marginToken])

  return (
    <div className="web-trade-data-wrap">
      <div className="web-trade-data-list">{memoTradeHistory}</div>
      <Pagination page={state.pageIndex} total={state.positionDAT.totalItems} onChange={pageChange} />
    </div>
  )
}

export default TradeHistory
