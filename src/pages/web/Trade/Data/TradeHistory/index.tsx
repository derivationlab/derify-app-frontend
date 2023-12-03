import { getTradingHistory } from 'derify-apis-v20'
import { isEmpty } from 'lodash-es'
import { useAccount } from 'wagmi'

import React, { FC, useEffect, useMemo, useReducer } from 'react'

import Pagination from '@/components/common/Pagination'
import Spinner from '@/components/common/Spinner'
import { reducer, stateInit } from '@/reducers/records'
import { useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { Rec } from '@/typings'

import NoRecord from '../c/NoRecord'
import ListItem from './ListItem'

const TradeHistory: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  const fetchData = async (index = 0) => {
    if (address) {
      const { data } = await getTradingHistory<{ data: Rec }>(marginToken.address, address, index)

      dispatch({
        type: 'SET_RECORDS',
        payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
      })
    }
  }

  const onPagination = (index: number) => {
    dispatch({ type: 'SET_PAGE_INDEX', payload: index })

    void fetchData(index)
  }

  const memoTradeHistory = useMemo(() => {
    if (!address) return <NoRecord show />
    if (state.records.loaded) return <Spinner absolute small />
    if (!isEmpty(state.records.records)) {
      return state.records.records.map((d: Record<string, any>, i: number) => (
        <ListItem key={`trade-history-${i}`} data={d} />
      ))
    }
    return <NoRecord show />
  }, [address, state.records])

  useEffect(() => {
    void fetchData()
  }, [marginToken])

  return (
    <div className="web-trade-data-wrap">
      <div className="web-trade-data-list">{memoTradeHistory}</div>
      {state.records.totalItems > 0 && (
        <Pagination page={state.pageIndex} total={state.records.totalItems} onChange={onPagination} />
      )}
    </div>
  )
}

export default TradeHistory
