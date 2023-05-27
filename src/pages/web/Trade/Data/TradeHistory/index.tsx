import { isEmpty } from 'lodash'
import { useAccount } from 'wagmi'

import React, { FC, useEffect, useMemo, useReducer } from 'react'

import { getTradingHistory } from '@/api'
import Pagination from '@/components/common/Pagination'
import Spinner from '@/components/common/Spinner'
import { reducer, stateInit } from '@/reducers/records'
import { useMarginTokenStore } from '@/store'

import NoRecord from '../c/NoRecord'
import ListItem from './ListItem'

const TradeHistory: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state) => state.marginToken)

  const fetchData = async (index = 0) => {
    if (address) {
      const { data } = await getTradingHistory(marginToken.address, address, index)

      dispatch({
        type: 'SET_RECORDS',
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
        <Pagination page={state.pageIndex} total={state.records.totalItems} onChange={pageChange} />
      )}
    </div>
  )
}

export default TradeHistory
