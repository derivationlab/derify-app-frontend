import React, { FC, useState, useMemo, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Table from 'rc-table'
import classNames from 'classnames'
import { useAccount } from 'wagmi'
import { isEmpty } from 'lodash'

import { BSC_SCAN_URL } from '@/config'
import { MobileContext } from '@/context/Mobile'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { getBrokerRewardTx } from '@/api'
import { nonBigNumberInterception } from '@/utils/tools'

import Pagination from '@/components/common/Pagination'

import { RowTime, calcShortHash, calcTimeStr } from './common'

interface DataProps {
  id: string
  tx: string
  trader: string
  status: number
  type: number
  amount: string
  percent: string
  event_time: string
}

const RowTransaction: FC<{ data: Record<string, any> }> = ({ data }) => {
  const { mobile } = useContext(MobileContext)
  return (
    <div className="web-broker-table-transaction-tx">
      <a href={`${BSC_SCAN_URL}/tx/${data.tx}`} target="_blank" title={data.tx}>
        {mobile ? calcShortHash(data.tx, 4, 4) : calcShortHash(data.tx)}
      </a>
      {mobile ? (
        <time>{calcTimeStr(data.event_time)}</time>
      ) : (
        <a href={`${BSC_SCAN_URL}/address/${data.user}`} target="_blank" title={data.user}>
          by trader {calcShortHash(data.user)}
        </a>
      )}
    </div>
  )
}

const RowType: FC<{ data: DataProps }> = ({ data }) => {
  const { t } = useTranslation()

  const openType = [0, 1, 2]
  const closeType = [3, 4, 5, 6, 7, 8, 9]

  const txTypes: Record<string, string> = {
    'type=0|1': t('Broker.Transaction.Type0', 'Market Price'),
    'type=2': t('Broker.Transaction.Type1', 'Limit Price'),
    'type=3': t('Broker.Transaction.Type2', 'Take Profit'),
    'type=4': t('Broker.Transaction.Type3', 'Stop Loss'),
    'type=5': t('Broker.Transaction.Type4', 'Deleverage'),
    'type=6': t('Broker.Transaction.Type5', 'Liquidate'),
    'type=7|8|9': 'Close'
  }

  const memoPosType = useMemo(() => {
    const findKey = Object.keys(txTypes).find((key) => key.includes(data.type as any))
    if (findKey) return txTypes[findKey]
    return ''
  }, [data.type])

  return (
    <div className="web-broker-table-transaction-type">
      <strong className={classNames(openType.includes(data.type) && 'open', closeType.includes(data.type) && 'close')}>
        {openType.includes(data.type) && t('Broker.Transaction.Open', 'Open')}
        {closeType.includes(data.type) && t('Broker.Transaction.Close', 'Close')}
      </strong>
      <em>{memoPosType}</em>
    </div>
  )
}

const judgeUpsAndDowns = (data: string): string => (Number(data) > 0 ? '+' : '')

const RowRealizedPnl: FC<{ data: Record<string, any> }> = ({ data }) => {
  // const { mobile } = useContext(MobileContext)
  const up = useMemo(() => Number(data.pnl_usdt) > 0, [data.pnl_usdt])
  const down = useMemo(() => Number(data.pnl_usdt) < 0, [data.pnl_usdt])
  const pnl_usdt = nonBigNumberInterception(data.pnl_usdt)

  return (
    <div className="web-broker-table-transaction-pnl">
      <strong className={classNames({ up }, { down })}>
        {Math.abs(data.pnl_usdt) === 0 ? '-' : `${judgeUpsAndDowns(data.pnl_usdt)}${pnl_usdt}`}
      </strong>
      <em>{BASE_TOKEN_SYMBOL}</em>
    </div>
  )
}

const Transaction: FC = () => {
  const { t } = useTranslation()
  const { data: account } = useAccount()
  const { mobile } = useContext(MobileContext)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [tradeFlow, setTradeFlow] = useState<Record<string, any>>({})
  const [pageIndex, setPageIndex] = useState<number>(0)

  const getBrokerRewardTxFunc = async (index = 0) => {
    setTradeFlow({})
    setIsLoading(true)

    if (account?.address) {
      const { data } = await getBrokerRewardTx(account.address, index, 10)

      setTradeFlow(data)
    }

    setIsLoading(false)
  }

  const onPageChangeEv = (index: number) => {
    setPageIndex(index)
    void getBrokerRewardTxFunc(index)
  }

  const memoEmptyText = useMemo(() => {
    if (isLoading) return 'Loading'
    if (isEmpty(tradeFlow?.records)) return 'No Record'
    return ''
  }, [isLoading, tradeFlow?.records])

  const mobileColumns = [
    {
      title: t('Broker.Transaction.Transaction', 'Transaction'),
      dataIndex: '',
      width: mobile ? '' : 420,
      render: (_: string, data: DataProps) => <RowTransaction data={data} />
    },
    {
      title: t('Broker.Transaction.Type', 'Type'),
      dataIndex: '',
      width: mobile ? 90 : 268,
      render: (_: string, data: DataProps) => <RowType data={data} />
    },
    {
      title: t('Broker.Transaction.RealizedPnL', 'Realized PnL'),
      dataIndex: '',
      width: mobile ? 110 : 268,
      render: (_: string, data: DataProps) => <RowRealizedPnl data={data} />
    }
  ]

  const webColumns = [
    ...mobileColumns,
    {
      title: t('Broker.Transaction.Time', 'Time'),
      dataIndex: 'event_time',
      render: (text: string) => <RowTime time={text} />
    }
  ]

  useEffect(() => {
    void getBrokerRewardTxFunc()
  }, [])

  return (
    <>
      <Table
        className="web-broker-table"
        columns={mobile ? mobileColumns : webColumns}
        emptyText={memoEmptyText}
        data={tradeFlow?.records ?? []}
        rowKey="id"
      />
      <Pagination page={pageIndex} total={tradeFlow?.totalItems ?? 0} onChange={onPageChangeEv} />
    </>
  )
}

export default Transaction
