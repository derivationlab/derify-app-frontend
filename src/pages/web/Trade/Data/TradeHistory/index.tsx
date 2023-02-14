import PubSub from 'pubsub-js'
import { isEmpty } from 'lodash'
import { useAccount } from 'wagmi'
import React, { FC, useEffect, useMemo, useState } from 'react'

import { PubSubEvents } from '@/typings'
import { getTraderTradeFlow } from '@/api'

import Loading from '@/components/common/Loading'
import Pagination from '@/components/common/Pagination'

import ListItem from './ListItem'
import NoRecord from '../c/NoRecord'

const TradeHistory: FC = () => {
  const { data: account } = useAccount()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [tradeFlow, setTradeFlow] = useState<Record<string, any>>({})
  const [pageIndex, setPageIndex] = useState<number>(0)

  const getTraderTradeFlowFunc = async (index = 0) => {
    setTradeFlow({})
    setIsLoading(true)

    if (account?.address) {
      const { data } = await getTraderTradeFlow(account?.address, index, 10)

      setTradeFlow(data)
    }

    setIsLoading(false)
  }

  const onPageChangeEv = (index: number) => {
    setPageIndex(index)
    void getTraderTradeFlowFunc(index)
  }

  const memoTradeHistory = useMemo(() => {
    if (!account?.address) return <NoRecord show />
    if (isLoading) return <Loading show type="section" />
    if (!isEmpty(tradeFlow?.records)) {
      return tradeFlow.records.map((d: Record<string, any>, i: number) => (
        <ListItem key={`trade-history-${i}`} data={d} />
      ))
    }
    return <NoRecord show />
  }, [account?.address, isLoading, tradeFlow?.records])

  useEffect(() => {
    void getTraderTradeFlowFunc()

    PubSub.subscribe(PubSubEvents.UPDATE_TRADE_HISTORY, () => {
      void getTraderTradeFlowFunc()
    })

    return () => {
      PubSub.clearAllSubscriptions()
    }
  }, [])

  return (
    <div className="web-trade-data-wrap">
      <div className="web-trade-data-list">{memoTradeHistory}</div>
      <Pagination page={pageIndex} total={tradeFlow?.totalItems ?? 0} onChange={onPageChangeEv} />
    </div>
  )
}

export default TradeHistory
