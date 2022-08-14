import React, { FC, useEffect, useMemo, useState, useContext } from 'react'
import { useAccount } from 'wagmi'
import { isEmpty } from 'lodash'
import Table from 'rc-table'
import { useTranslation } from 'react-i18next'

import { getListOfAllUsersOfBroker } from '@/api'
import { BSC_SCAN_URL } from '@/config'
import { MobileContext } from '@/context/Mobile'

import Image from '@/components/common/Image'
import Pagination from '@/components/common/Pagination'

import { RowTime, calcShortHash } from './common'

interface DataProps {
  trader: string
  update_time: string
}

interface RowProps {
  text?: string
  data?: DataProps
}

const RowTrader: FC<{ data: Record<string, any> }> = ({ data }) => {
  const { mobile } = useContext(MobileContext)
  return (
    <div className="web-broker-table-trader-tx">
      <Image src="icon/normal-ico.svg" cover />
      <a href={`${BSC_SCAN_URL}/address/${data.trader}`} title={data.trader} target="_blank">
        {mobile ? calcShortHash(data.trader, 4, 4) : calcShortHash(data.trader)}
      </a>
    </div>
  )
}

const RowLastTransaction: FC<RowProps> = ({ text }) => (
  <div className="web-broker-table-trader-tx">
    {text ? (
      <a href={`${BSC_SCAN_URL}/tx/${text}`} target="_blank" title={text}>
        {calcShortHash(text ?? '')}
      </a>
    ) : (
      '-'
    )}
  </div>
)

const Trader: FC = () => {
  const { t } = useTranslation()
  const { data: account } = useAccount()
  const { mobile } = useContext(MobileContext)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [tradeFlow, setTradeFlow] = useState<Record<string, any>>({})
  const [pageIndex, setPageIndex] = useState<number>(0)

  const getListOfAllUsersOfBrokerFun = async (index = 0) => {
    setTradeFlow({})
    setIsLoading(true)

    if (account?.address) {
      // const { data } = await getListOfAllUsersOfBroker('0x34D2F68529CCE3080A2eF473BC35Fa95FFaB4589', index, 10)
      const { data } = await getListOfAllUsersOfBroker(account.address, index, 10)

      setTradeFlow(data)
    }

    setIsLoading(false)
  }

  const onPageChangeEv = (index: number) => {
    setPageIndex(index)
    void getListOfAllUsersOfBrokerFun(index)
  }

  const memoEmptyText = useMemo(() => {
    if (isLoading) return 'Loading'
    if (isEmpty(tradeFlow?.records)) return 'No Record'
    return ''
  }, [isLoading, tradeFlow?.records])

  useEffect(() => {
    void getListOfAllUsersOfBrokerFun()
  }, [])

  // registration_days todo
  const mobileColumns = [
    {
      title: t('Broker.Trader.Trader', 'Trader'),
      dataIndex: 'trader',
      width: mobile ? '' : 420,
      render: (_: string, data: Record<string, any>) => <RowTrader data={data} />
    },
    {
      title: t(`Broker.Trader.LastTransactionTime${mobile ? 'M' : ''}`, 'Last Transaction Time'),
      dataIndex: 'last_transaction_time',
      width: mobile ? 95 : 268,
      render: (text: string) => <RowTime time={text} />
    },
    {
      title: t(`Broker.Trader.${mobile ? '' : 'Registration'}Time`, 'Time'),
      dataIndex: 'registration_time',
      width: mobile ? 95 : 268,
      render: (text: string) => <RowTime time={text} />
    }
  ]
  const webColumns = [
    mobileColumns[0],
    {
      title: t('Broker.Trader.LastTransaction', 'Last Transaction'),
      dataIndex: 'last_transaction',
      width: 420,
      render: (text: string) => <RowLastTransaction text={text} />
    },
    mobileColumns[1],
    mobileColumns[2]
  ]

  return (
    <>
      <Table
        className="web-broker-table"
        emptyText={memoEmptyText}
        columns={mobile ? mobileColumns : webColumns}
        data={tradeFlow?.records ?? []}
        rowKey="update_time"
      />
      <Pagination page={pageIndex} total={tradeFlow?.totalItems ?? 0} onChange={onPageChangeEv} />
    </>
  )
}

export default Trader
