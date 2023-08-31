import classNames from 'classnames'
import { isEmpty, orderBy } from 'lodash'
import Table from 'rc-table'

import React, { FC, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import Button from '@/components/common/Button'
import Pagination from '@/components/common/Pagination'
import Spinner from '@/components/common/Spinner'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { useAllCurrentTrading } from '@/hooks/useAllCurrentTrading'
import { useBoundPools } from '@/hooks/useBoundPools'
import { useAllMarginIndicators } from '@/hooks/useMarginIndicators'
import { useFactoryConfig, useMarginPosVolume, usePairAddrConfig } from '@/hooks/useMarginPosVolume'
import { usePriceDecimals, useTokenSpotPrices } from '@/hooks/useTokenSpotPrices'
import { getMarginTokenList, useMarginTokenListStore } from '@/store'
import { bnMul, bnPlus } from '@/utils/tools'

import { TableMargin } from '../c/TableCol'

interface IPagination {
  data: any[]
  index: number
}

export const resortMargin = (data: any[]) => {
  return orderBy(data, ['open', 'max_pm_apy'], ['desc', 'desc'])
}

const MarketInfo: FC = () => {
  const history = useHistory()
  const { t } = useTranslation()
  const [pagination, setPagination] = useState<IPagination>({ data: [], index: 0 })
  const pagingParams = useMarginTokenListStore((state) => state.pagingParams)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const allMarginTokenList = useMarginTokenListStore((state) => state.allMarginTokenList)
  const marginTokenListLoaded = useMarginTokenListStore((state) => state.marginTokenListLoaded)
  const { data: boundPools } = useBoundPools(allMarginTokenList)
  const { data: tradingVol } = useAllCurrentTrading(allMarginTokenList)
  const { data: indicators } = useAllMarginIndicators(allMarginTokenList)
  const { data: allPositions } = useMarginPosVolume()
  const { factoryConfig } = useFactoryConfig(allPositions)
  const { pairAddrConfig } = usePairAddrConfig(factoryConfig, allPositions)
  const { priceDecimals } = usePriceDecimals(pairAddrConfig)
  const { spotPrices } = useTokenSpotPrices(pairAddrConfig, priceDecimals)

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
          let total = '0'
          const p = tradingVol?.[data.margin_token] ?? 0
          if (allPositions && data.margin_token in allPositions && spotPrices) {
            const p1 = allPositions[data.margin_token]
            const p2 = Object.keys(p1)
            total = p2.reduce((p, n: string) => {
              const price = spotPrices.find((f) => f.margin === data.margin_token && f.token === n)?.price ?? 0
              return bnPlus(bnMul(p1[n], price), p)
            }, '0')
          }
          return (
            <>
              <BalanceShow value={p} unit={symbol} decimal={Number(p) === 0 ? 2 : data.amount_decimals} />
              <BalanceShow value={total} unit={symbol} decimal={Number(total) === 0 ? 2 : data.amount_decimals} />
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
            return <BalanceShow value={apy} decimal={2} percent />
          }
          return <BalanceShow value={0} decimal={2} percent />
        }
      }
    ]
  }, [t, indicators, boundPools, allPositions, spotPrices])

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
          const p = tradingVol?.[data.margin_token] ?? 0
          return <BalanceShow value={p} unit={symbol} decimal={Number(p) === 0 ? 2 : data.amount_decimals} />
        }
      },
      {
        title: t('NewDashboard.Overview.PositionVolume'),
        dataIndex: 'symbol',
        render: (symbol: string, data: Record<string, any>) => {
          let total = '0'
          if (allPositions && data.margin_token in allPositions && spotPrices) {
            const p1 = allPositions[data.margin_token]
            const p2 = Object.keys(p1)
            total = p2.reduce((p, n: string) => {
              const price = spotPrices.find((f) => f.token === n)?.price ?? 0
              return bnPlus(bnMul(p1[n], price), p)
            }, '0')
          }
          return <BalanceShow value={total} unit={symbol} decimal={Number(total) === 0 ? 2 : data.amount_decimals} />
        }
      },
      {
        title: t('NewDashboard.Overview.BuybackPool'),
        dataIndex: 'symbol',
        render: (symbol: string, data: Record<string, any>) => {
          const p = boundPools?.[data.margin_token] ?? 0
          return <BalanceShow value={p} unit={symbol} decimal={Number(p) === 0 ? 2 : data.amount_decimals} />
        }
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
  }, [t, tradingVol, indicators, boundPools, allPositions, spotPrices])

  const emptyText = useMemo(() => {
    if (!marginTokenListLoaded) return <Spinner small />
    if (isEmpty(marginTokenList)) return t('NewDashboard.Overview.NoResultsFound')
    return ''
  }, [t, marginTokenListLoaded])

  const onPagination = async (index: number) => {
    setPagination((val) => ({ ...val, index }))
    const data = await getMarginTokenList(index)
    setPagination((val) => ({ ...val, data: resortMargin(data?.records ?? []) }))
  }

  useEffect(() => {
    if (marginTokenList.length) {
      setPagination((val) => ({ ...val, data: resortMargin(marginTokenList) }))
    }
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
        columns={isMobile ? mColumns : wColumns}
        className={classNames('web-broker-table', { 'web-space-table': isMobile })}
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
