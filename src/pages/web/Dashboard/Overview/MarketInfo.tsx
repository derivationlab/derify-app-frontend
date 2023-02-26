import React, { FC, useMemo, useState } from 'react'
import { isEmpty } from 'lodash'
import Table from 'rc-table'

import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { Input } from '@/components/common/Form'
import Button from '@/components/common/Button'
import DecimalShow from '@/components/common/DecimalShow'
import Pagination from '@/components/common/Pagination'

import { TableMargin } from '../c/TableCol'
import { MarketInfoData as data } from './mockData'

const MarketInfo: FC = () => {
  const [keyword, setKeyword] = useState('')
  const [pageIndex, setPageIndex] = useState<number>(0)
  const isLoading = false
  const memoEmptyText = useMemo(() => {
    if (isLoading) return 'Loading'
    if (isEmpty(data)) return 'No Record'
    return ''
  }, [isLoading])
  const webColumns = [
    {
      title: 'Margin',
      dataIndex: 'name',
      render: (_: string, data: Record<string, any>) => <TableMargin icon={data.icon} name={data.name} />
    },
    {
      title: 'Max Position Mining APY',
      dataIndex: 'maxApy',
      width: 300,
      render: (value: number) => <DecimalShow value={value} percent black />
    },
    {
      title: 'Trading Volume',
      dataIndex: 'tradingVolume',
      width: 220,
      render: (value: number, data: Record<string, any>) => (
        <BalanceShow value={value} format="0.00a" unit={data.name} />
      )
    },
    {
      title: 'Position Volume',
      dataIndex: 'positionVolume',
      width: 220,
      render: (value: number, data: Record<string, any>) => (
        <BalanceShow value={value} format="0.00a" unit={data.name} />
      )
    },
    {
      title: 'Buyback Pool',
      dataIndex: 'buybackPool',
      width: 220,
      render: (value: number, data: Record<string, any>) => (
        <BalanceShow value={value} format="0.00a" unit={data.name} />
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

  const onSearch = () => {
    if (keyword) {
      console.log('Search keyword: ' + keyword)
    }
  }

  const onPageChangeEv = (index: number) => {
    setPageIndex(index)
    // void getBrokersListCb(index)
  }

  return (
    <div className="web-dashboard-overview-market">
      <header className="web-dashboard-section-header">
        <h3>Market Info</h3>
        <div className="web-dashboard-section-header-search">
          <Input value={keyword} onChange={setKeyword} placeholder="serch name or contract address..">
            <button className="web-dashboard-section-header-search-button" onClick={onSearch} />
          </Input>
        </div>
      </header>
      {/* @ts-ignore */}
      <Table className="web-broker-table" emptyText={memoEmptyText} columns={webColumns} data={data} rowKey="id" />
      <Pagination page={pageIndex} total={100} onChange={onPageChangeEv} />
    </div>
  )
}

export default MarketInfo
// <BalanceShow value={12345.4567} unit="USD" />