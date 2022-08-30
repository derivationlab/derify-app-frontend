import React, { FC, useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { isEmpty } from 'lodash'
// import { useTranslation } from 'react-i18next'

import { getTraderTradeFlow } from '@/api'

import Pagination from '@/components/common/Pagination'
import Loading from '@/components/common/Loading'

import ListItem from './ListItem'
import NoRecord from '../c/NoRecord'
import { useShareMessage } from '@/store/share/hooks'

const TradeHistory: FC = () => {
  // const { t } = useTranslation()
  const { data: account } = useAccount()
  const { shareMessage } = useShareMessage()

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
  }, [])

  useEffect(() => {
    if (shareMessage && shareMessage?.type.includes('UPDATE_TRADE_HISTORY')) void getTraderTradeFlowFunc()
  }, [shareMessage])

  return (
    <div className="web-trade-data-wrap">
      <div className="web-trade-data-list">{memoTradeHistory}</div>
      <Pagination page={pageIndex} total={tradeFlow?.totalItems ?? 0} onChange={onPageChangeEv} />
    </div>
  )
}

export default TradeHistory
