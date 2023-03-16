import React, { FC, useMemo, useState, useContext } from 'react'
import { isEmpty } from 'lodash'
import Table from 'rc-table'

import { MobileContext } from '@/providers/Mobile'

import BalanceShow from '@/components/common/Wallet/BalanceShow'
import Button from '@/components/common/Button'
import DecimalShow from '@/components/common/DecimalShow'
import Pagination from '@/components/common/Pagination'

import { MarketInfoData as data } from './mockData'
import { TableMargin } from '@/pages/web/Dashboard/c/TableCol'

const MySpace: FC = () => {
  const { mobile } = useContext(MobileContext)
  const [pageIndex, setPageIndex] = useState<number>(0)
  const isLoading = false
  const memoEmptyText = useMemo(() => {
    if (isLoading) return 'Loading'
    if (isEmpty(data)) return 'No Record'
    return ''
  }, [isLoading])

  const mobileColumns = [
    {
      title: 'Margin',
      dataIndex: 'name',
      render: (_: string, data: Record<string, any>) => <TableMargin icon={data.icon} name={data.name} />
    },
    {
      title: 'Trading/Position',
      dataIndex: 'maxApy',
      render: (value: number, data: Record<string, any>) => (
        <>
          <BalanceShow value={value} unit={data.name} />
          <DecimalShow value={value} percent black />
        </>
      )
    },
    {
      title: 'Balance/Rate',
      dataIndex: 'maxApy',
      render: (value: number, data: Record<string, any>) => (
        <>
          <BalanceShow value={value} unit={data.name} />
          <DecimalShow value={value} percent black />
        </>
      )
    }
  ]

  const webColumns = [
    mobileColumns[0],
    {
      title: 'Margin Balance/Rate',
      dataIndex: 'maxApy',
      width: 250,
      render: (value: number, data: Record<string, any>) => (
        <>
          <BalanceShow value={value} unit={data.name} />
          <DecimalShow value={value} percent black />
        </>
      )
    },
    {
      title: 'Position Volume',
      dataIndex: 'tradingVolume',
      width: 250,
      render: (value: number, data: Record<string, any>) => <BalanceShow value={value} unit={data.name} />
    },
    {
      title: 'Position Mining Rewards',
      dataIndex: 'positionVolume',
      width: 250,
      render: (value: number, data: Record<string, any>) => (
        <>
          <BalanceShow value={value} unit={data.name} />
          <BalanceShow value={value} unit="DRF" />
        </>
      )
    },
    {
      title: 'Broker Rewards',
      dataIndex: 'buybackPool',
      width: 250,
      render: (value: number, data: Record<string, any>) => (
        <>
          <BalanceShow value={value} unit={data.name} />
          <BalanceShow value={value} unit="DRF" />
        </>
      )
    },
    {
      title: 'Detail Info',
      dataIndex: 'Margin',
      width: 150,

      align: 'right',
      render: () => <Button size="medium">GO</Button>
    }
  ]
  const onPageChangeEv = (index: number) => {
    setPageIndex(index)
    // void getBrokersListCb(index)
  }
  return (
    <div className="web-table-page">
      <header className="web-table-page-header">
        <h3>My Space</h3>
      </header>
      <Table
        className="web-broker-table web-space-table"
        emptyText={memoEmptyText}
        // @ts-ignore
        columns={mobile ? mobileColumns : webColumns}
        data={data}
        rowKey="id"
      />
      <Pagination page={pageIndex} total={100} onChange={onPageChangeEv} />
    </div>
  )
}

export default MySpace
