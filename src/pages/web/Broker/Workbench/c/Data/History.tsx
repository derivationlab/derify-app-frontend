import BN from 'bignumber.js'
import React, { FC, useEffect, useState, useMemo, useContext } from 'react'
import { isEmpty } from 'lodash'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import Table from 'rc-table'

import { BSC_SCAN_URL } from '@/config'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { getBrokerAccountFlow } from '@/api'
import { getDecimalAmount, nonBigNumberInterception, safeInterceptionValues } from '@/utils/tools'
import { useConstantData } from '@/store/constant/hooks'

import { MobileContext } from '@/context/Mobile'

import Pagination from '@/components/common/Pagination'

import { RowTime, calcShortHash, calcTimeStr } from './common'

interface DataProps {
  id: string
  tx: string
  broker: string
  trader: string
  amount: string
  balance: string
  update_type: string | number
  event_time: string
  update_time: string
}

interface RowProps {
  text?: string
  data?: DataProps
}

const RowType: FC<{ data: DataProps }> = ({ data }) => {
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)

  const TypeEnum = [
    t('Broker.History.Type0', 'Income'),
    t('Broker.History.Type1', 'Withdraw'),
    t('Broker.History.Type2', 'GasFee'),
    t('Broker.History.Type3', 'Redeem'),
    t('Broker.History.Type4', 'Deposit'),
    t('Broker.History.Type5', 'Interest')
  ]

  // @ts-ignore
  const type = TypeEnum[data.update_type]
  return (
    <div className="web-broker-table-history-type">
      <strong>{type}</strong>
      {mobile ? (
        <time>{calcTimeStr(data.event_time)}</time>
      ) : (
        <a href={`${BSC_SCAN_URL}/tx/${data.tx}`} target="_blank" title={data.tx}>
          txid {calcShortHash(data.tx)}
        </a>
      )}
    </div>
  )
}

const RowAmount: FC<Record<string, any>> = ({ text = 0, coin = BASE_TOKEN_SYMBOL }) => (
  <div className="web-broker-table-history-amount">
    <strong>{safeInterceptionValues(getDecimalAmount(text).toString())}</strong>
    <u>{coin}</u>
  </div>
)

const RowBalance: FC<Record<string, any>> = ({ text = 0, coin = BASE_TOKEN_SYMBOL }) => (
  <div className="web-broker-table-history-balance">
    <strong>{safeInterceptionValues(getDecimalAmount(text).toString())}</strong>
    <u>{coin}</u>
  </div>
)

// loading ui todo
const History: FC = () => {
  const { t } = useTranslation()
  const { indicator } = useConstantData()

  const { data: account } = useAccount()
  const { mobile } = useContext(MobileContext)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [tradeFlow, setTradeFlow] = useState<Record<string, any>>({})
  const [pageIndex, setPageIndex] = useState<number>(0)

  const getBrokerAccountFlowFunc = async (index = 0) => {
    setTradeFlow({})
    setIsLoading(true)

    if (account?.address) {
      // const { data } = await getBrokerAccountFlow('0x34D2F68529CCE3080A2eF473BC35Fa95FFaB4589', index, 10)
      const { data } = await getBrokerAccountFlow(account.address, index, 10)

      setTradeFlow(data)
    }

    setIsLoading(false)
  }

  const onPageChangeEv = (index: number) => {
    setPageIndex(index)
    void getBrokerAccountFlowFunc(index)
  }

  const memoEmptyText = useMemo(() => {
    if (isLoading) return 'Loading'
    if (isEmpty(tradeFlow?.records)) return 'No Record'
    return ''
  }, [isLoading, tradeFlow?.records])

  useEffect(() => {
    void getBrokerAccountFlowFunc()
  }, [])

  const mobileColums = [
    {
      title: t('Broker.History.Type', 'Type'),
      dataIndex: 'update_type',
      width: mobile ? '' : 428,
      render: (_: string, data: DataProps) => <RowType data={data} />
    },
    {
      title: t('Broker.History.Amount', 'Amount'),
      dataIndex: 'amount',
      width: mobile ? 95 : 268,
      render: (_: string, data: Record<string, any>) => {
        const drf_amount = new BN(data?.drf_amount ?? 0).times(indicator?.drfPrice ?? 0)
        const rewards_plus = drf_amount.plus(data?.usd_amount ?? 0).toString()
        const rewards_total = nonBigNumberInterception(rewards_plus)

        // const usd = String(data?.usd_amount)
        // const usd_amount = safeInterceptionValues(
        //   usd.indexOf('.') > -1 ? usd : `${usd}.0`
        // )
        // const drf = String(data?.drf_amount)
        // const drf_amount = safeInterceptionValues(
        //   drf.indexOf('.') > -1 ? drf : `${drf}.0`
        // )
        // return (
        //   <>
        //     <RowAmount text={usd_amount} />
        //     <RowAmount text={drf_amount} coin='DRF' />
        //   </>
        // )
        return <RowAmount text={rewards_total} />
      }
    },
    {
      title: t('Broker.History.Balance', 'Balance'),
      dataIndex: 'balance',
      width: mobile ? 95 : 268,
      render: (_: string, data: Record<string, any>) => {
        const drf_balance = new BN(data?.drf_balance ?? 0).times(indicator?.drfPrice ?? 0)
        const rewards_plus = drf_balance.plus(data?.usd_balance ?? 0).toString()
        const rewards_total = nonBigNumberInterception(rewards_plus)

        // const usd = String(data?.usd_balance)
        // const usd_balance = safeInterceptionValues(
        //   usd.indexOf('.') > -1 ? usd : `${usd}.0`
        // )
        // const drf = String(data?.drf_balance)
        // const drf_balance = safeInterceptionValues(
        //   drf.indexOf('.') > -1 ? drf : `${drf}.0`
        // )
        // return (
        //   <>
        //     <RowBalance text={usd_balance} />
        //     <RowBalance text={drf_balance} coin='DRF' />
        //   </>
        // )
        return <RowBalance text={rewards_total} />
      }
    }
  ]

  const webColumns = [
    ...mobileColums,
    {
      title: t('Broker.History.Time', 'Time'),
      dataIndex: 'event_time',
      render: (text: string) => <RowTime time={text} />
    }
  ]

  return (
    <>
      <Table
        className="web-broker-table"
        columns={mobile ? mobileColums : webColumns}
        emptyText={memoEmptyText}
        data={tradeFlow?.records ?? []}
        rowKey="id"
      />
      <Pagination page={pageIndex} total={tradeFlow?.totalItems ?? 0} onChange={onPageChangeEv} />
    </>
  )
}

export default History
