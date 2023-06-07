import classNames from 'classnames'
import { isEmpty, flatten, uniq } from 'lodash'
import Table from 'rc-table'

import React, { FC, useMemo, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import Button from '@/components/common/Button'
import DecimalShow from '@/components/common/DecimalShow'
import Pagination from '@/components/common/Pagination'
import Spinner from '@/components/common/Spinner'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { useAllCurrentTrading } from '@/hooks/useAllCurrentTrading'
import { useBoundPools } from '@/hooks/useBoundPools'
import { useAllMarginIndicators } from '@/hooks/useMarginIndicators'
import PositionVolume from '@/pages/web/Dashboard/c/PositionVolume'
import { MobileContext } from '@/providers/Mobile'
import { getMarginTokenList, useMarginTokenListStore } from '@/store'
import { bnMul, keepDecimals } from '@/utils/tools'

import { TableMargin } from '../c/TableCol'

interface IPagination {
  data: any[]
  index: number
}

const MarketInfo: FC = () => {
  const history = useHistory()
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)
  const [pagination, setPagination] = useState<IPagination>({ data: [], index: 0 })

  const pagingParams = useMarginTokenListStore((state) => state.pagingParams)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const marginAddressList = useMarginTokenListStore((state) => state.marginAddressList)
  const marginTokenListLoaded = useMarginTokenListStore((state) => state.marginTokenListLoaded)

  const { data: boundPools } = useBoundPools(marginAddressList)
  const { data: tradingVol } = useAllCurrentTrading(marginAddressList)
  const { data: indicators } = useAllMarginIndicators(marginAddressList)

  const mColumns = useMemo(() => {
    return [
      {
        title: t('NewDashboard.Overview.Margin'),
        dataIndex: 'name',
        render: (_: string, data: Record<string, any>) => <TableMargin icon={data.logo} name={data.symbol} />
      },
      {
        title: 'Trading/Position',
        dataIndex: 'symbol',
        render: (symbol: string, data: Record<string, any>) => {
          return (
            <>
              <BalanceShow value={boundPools?.[data.margin_token] ?? 0} unit={symbol} />
              <PositionVolume data={data} />
            </>
          )
        }
      },
      {
        title: 'Max APR',
        dataIndex: 'symbol',
        render: (symbol: string, data: Record<string, any>) => {
          if (indicators?.[data.margin_token]) {
            const apy = Math.max.apply(null, Object.values(indicators[data.margin_token]))
            const per = keepDecimals(bnMul(apy, 100), 2)
            return <DecimalShow value={per} percent black />
          }
          return <DecimalShow value={0} percent black />
        }
      }
    ]
  }, [t, indicators, boundPools])

  const wColumns = useMemo(() => {
    return [
      mColumns[0],
      {
        title: t('NewDashboard.Overview.MaxPositionMiningAPY'),
        dataIndex: 'symbol',
        render: (symbol: string, data: Record<string, any>) => {
          if (indicators?.[data.margin_token]) {
            const apy = Math.max.apply(null, Object.values(indicators[data.margin_token]))
            return <BalanceShow value={apy} percent />
          }
          return <BalanceShow value={0} percent />
        }
      },
      {
        title: t('NewDashboard.Overview.TradingVolume'),
        dataIndex: 'symbol',
        render: (symbol: string, data: Record<string, any>) => {
          return <BalanceShow value={tradingVol?.[data.margin_token] ?? 0} unit={symbol} />
        }
      },
      {
        title: t('NewDashboard.Overview.PositionVolume'),
        dataIndex: 'symbol',
        render: (symbol: string, data: Record<string, any>) => {
          return <PositionVolume data={data} />
        }
      },
      {
        title: t('NewDashboard.Overview.BuybackPool'),
        dataIndex: 'symbol',
        render: (symbol: string, data: Record<string, any>) => (
          <BalanceShow value={boundPools?.[data.margin_token] ?? 0} unit={symbol} />
        )
      },
      {
        title: t('NewDashboard.Overview.DetailInfo'),
        dataIndex: 'Margin',
        align: 'right',
        render: (_: string, data: Record<string, any>) => (
          <Button size="medium" disabled={!data.open} onClick={() => history.push(`/${data.symbol}/trade`)}>
            GO
          </Button>
        )
      }
    ]
  }, [t, tradingVol, indicators, boundPools])

  const emptyText = useMemo(() => {
    if (!marginTokenListLoaded) return <Spinner small />
    if (isEmpty(marginTokenList)) return t('NewDashboard.Overview.NoResultsFound')
    return ''
  }, [t, marginTokenListLoaded])

  const onPagination = async (index: number) => {
    setPagination((val) => ({ ...val, index }))

    const data = await getMarginTokenList(index)
    setPagination((val) => ({ ...val, data: data?.records ?? [] }))
  }

  useEffect(() => {
    if (marginTokenList.length) setPagination((val) => ({ ...val, data: marginTokenList }))
  }, [marginTokenList])

  return (
    <div className="web-dashboard-overview-market">
      <header className="web-dashboard-section-header">
        <h3>{t('NewDashboard.Overview.MarketInfo')}</h3>
        <div className="web-dashboard-section-header-search">
          {/*todo search*/}
          {/*<Input value={keyword} onChange={setKeyword} placeholder={t('NewDashboard.Overview.SerchTip')}>*/}
          {/*  <button className='web-dashboard-section-header-search-button' onClick={onSearch} />*/}
          {/*</Input>*/}
        </div>
      </header>
      <Table
        rowKey="symbol"
        data={pagination.data}
        columns={mobile ? mColumns : wColumns}
        className={classNames('web-broker-table', { 'web-space-table': mobile })}
        emptyText={emptyText}
        rowClassName={(record) => (!!record.open ? 'open' : 'close')}
      />
      {pagingParams.totalItems > 0 && (
        <Pagination page={pagination.index} total={pagingParams.totalItems} onChange={onPagination} />
      )}
    </div>
  )
}

export default MarketInfo
