import Table from 'rc-table'
import classNames from 'classnames'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { debounce, isEmpty } from 'lodash'
import React, { FC, useMemo, useState, useContext, useReducer, useCallback, useEffect } from 'react'

import { bnMul } from '@/utils/tools'
import { useMarketInfo } from '@/hooks/useMarketInfo'
import { MobileContext } from '@/providers/Mobile'

import { useMarginToken } from '@/store'
import { reducer, stateInit } from '@/reducers/marketInfo'
import { STATIC_RESOURCES_URL } from '@/config'
import { getDashboardMarginTokenList } from '@/api'
import { useFactoryConf, useProtocolConf } from '@/hooks/useMatchConf'

import { Input } from '@/components/common/Form'
import Button from '@/components/common/Button'
import Pagination from '@/components/common/Pagination'
import DecimalShow from '@/components/common/DecimalShow'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

import { TableMargin } from '../c/TableCol'

const MarketInfo: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const history = useHistory()

  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)

  const marginToken = useMarginToken((state) => state.marginToken)

  const { match } = useFactoryConf('', marginToken)
  const { protocolConfig } = useProtocolConf(marginToken)
  const { data: marketInfo } = useMarketInfo(protocolConfig?.exchange, match)

  const [keyword, setKeyword] = useState('')

  const mColumns = useMemo(() => {
    return [
      {
        title: 'Margin',
        dataIndex: 'name',
        render: (_: string, data: Record<string, any>) => (
          <TableMargin icon={`${STATIC_RESOURCES_URL}market/${data.symbol.toLowerCase()}.svg`} name={data.symbol} />
        )
      },
      {
        title: 'Trading/Position',
        dataIndex: 'trading_amount',
        render: (value: string, data: Record<string, any>) => (
          <>
            <BalanceShow value={value} unit={data.symbol} />
            <BalanceShow value={marketInfo.positionVol} unit={data.symbol} />
          </>
        )
      },
      {
        title: 'Max APY',
        dataIndex: 'max_pm_apy',
        render: (value: number) => {
          const per = bnMul(value ?? 0, 100)
          return <DecimalShow value={per} percent black />
        }
      }
    ]
  }, [t, marketInfo])

  const wColumns = useMemo(() => {
    return [
      mColumns[0],
      {
        title: 'Max Position Mining APY',
        dataIndex: 'max_pm_apy',
        width: 300,
        render: (value: number) => {
          const per = bnMul(value ?? 0, 100)
          return <DecimalShow value={per} percent black />
        }
      },
      {
        title: 'Trading Volume',
        dataIndex: 'trading_amount',
        width: 220,
        render: (value: number, data: Record<string, any>) => <BalanceShow value={value} unit={data.symbol} />
      },
      {
        title: 'Position Volume',
        dataIndex: 'positionVolume',
        width: 220,
        render: (value: number, data: Record<string, any>) => (
          <BalanceShow value={data.positionVol} unit={data.symbol} />
        )
      },
      {
        title: 'Buyback Pool',
        dataIndex: 'buybackPool',
        width: 220,
        render: (value: number, data: Record<string, any>) => (
          <BalanceShow value={marketInfo.buybackPool} unit={data.symbol} />
        )
      },
      {
        title: 'Detail Info',
        dataIndex: 'Margin',
        width: 150,
        align: 'right',
        render: (_: string, data: Record<string, any>) => (
          <Button size="medium" disabled={!!data.open} onClick={() => history.push(`/${data.symbol}/trade`)}>
            GO
          </Button>
        )
      }
    ]
  }, [t, marketInfo])

  const emptyText = useMemo(() => {
    if (state.marketData.isLoaded) return 'Loading'
    if (isEmpty(state.marketData.records)) return 'No Record'
    return ''
  }, [state.marketData])

  const onSearch = () => {
    if (keyword) {
      console.log('Search keyword: ' + keyword)
    }
  }

  // todo search
  const debounceSearch = useCallback(
    debounce((keyword: string) => {
      void fetchData(0)
    }, 1000),
    []
  )

  const fetchData = useCallback(
    async (index = 0) => {
      // keyword
      const { data } = await getDashboardMarginTokenList(index, 10)

      console.info(data)

      dispatch({
        type: 'SET_MARKET_DAT',
        payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
      })
    },
    [keyword]
  )

  const pageChange = (index: number) => {
    dispatch({ type: 'SET_PAGE_INDEX', payload: index })

    void fetchData(index)
  }

  useEffect(() => {
    if (keyword) {
      dispatch({
        type: 'SET_MARKET_DAT',
        payload: { records: [], totalItems: 0, isLoaded: true }
      })

      void debounceSearch(keyword)
    }
  }, [keyword])

  useEffect(() => {
    void fetchData()
  }, [])

  return (
    <div className="web-dashboard-overview-market">
      <header className="web-dashboard-section-header">
        <h3>Market Info</h3>
        <div className="web-dashboard-section-header-search">
          <Input value={keyword} onChange={setKeyword} placeholder="search name or contract address..">
            <button className="web-dashboard-section-header-search-button" onClick={onSearch} />
          </Input>
        </div>
      </header>
      <Table
        rowKey="symbol"
        data={state.marketData.records}
        // @ts-ignore
        columns={mobile ? mColumns : wColumns}
        className={classNames('web-broker-table', { 'web-space-table': mobile })}
        emptyText={emptyText}
        rowClassName={(record) => (!!record.open ? 'close' : 'open')}
      />
      <Pagination page={state.pageIndex} total={state.marketData.totalItems} onChange={pageChange} />
    </div>
  )
}

export default MarketInfo
