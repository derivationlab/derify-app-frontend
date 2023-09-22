import { isEmpty } from 'lodash-es'
import { useBlockNumber } from 'wagmi'

import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import Skeleton from '@/components/common/Skeleton'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { PLATFORM_TOKEN, VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { useAllCurrentIndex } from '@/hooks/useAllCurrentIndex'
import { useAllMarginPrice } from '@/hooks/useAllMarginPrice'
import { useBuyBackPool } from '@/hooks/useDashboard'
import { usePlatformTokenPrice } from '@/hooks/usePlatformTokenPrice'
import { useMarginTokenListStore, useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { Rec } from '@/typings'
import { bnMul, bnPlus } from '@/utils/tools'

interface Props {
  priceFeed: Rec | undefined
  allMarginTokenList: string[]
}

const Data = ({ priceFeed, allMarginTokenList }: Props) => {
  const { t } = useTranslation()
  const { data: blockNumber = 0 } = useBlockNumber({ watch: true })
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const { data: tokenPrice } = usePlatformTokenPrice()
  const { data: buyBackInfo } = useBuyBackPool(allMarginTokenList)
  const { data: marginPrices } = useAllMarginPrice(priceFeed)
  const { data: currentIndex } = useAllCurrentIndex(marginTokenList)

  const tokenDecimal = useMemo(() => {
    if (Number(tokenPrice) === 0) return 2
    if (Number(tokenPrice) < 1 && Number(tokenPrice) > 0) return 4
    return 2
  }, [tokenPrice])

  const totalDestroyed = useMemo(() => {
    return currentIndex?.[marginToken.symbol]?.drfBurnt ?? 0
  }, [marginToken, currentIndex])

  const buybackValue = useMemo(() => {
    if (marginPrices && !isEmpty(buyBackInfo)) {
      const keys = Object.keys(buyBackInfo) as any[]
      return keys.reduce((p, n: string) => {
        const price = marginPrices[n] ?? 0
        const amount = buyBackInfo[n] ?? 0
        return bnPlus(bnMul(amount, price), p)
      }, '0')
    }
    return '0'
  }, [buyBackInfo, marginPrices])

  return (
    <div className="web-dashboard-plan-datas">
      <div className="web-dashboard-plan-datas-item">
        <header>{t('NewDashboard.BuybackPlan.TotalBuybackValue')}</header>
        <section>
          <Skeleton rowsProps={{ rows: 1 }} animation loading={Number(buybackValue) === 0}>
            <BalanceShow value={buybackValue} />
            <u>{VALUATION_TOKEN_SYMBOL}</u>
          </Skeleton>
        </section>
      </div>
      <div className="web-dashboard-plan-datas-item">
        <header>{t('NewDashboard.BuybackPlan.CurrentDRFPrice', '', { Coin: PLATFORM_TOKEN.symbol })} </header>
        <section>
          <Skeleton rowsProps={{ rows: 1 }} animation loading={Number(tokenPrice) === 0}>
            <BalanceShow value={tokenPrice} decimal={tokenDecimal} />
            <u>{VALUATION_TOKEN_SYMBOL}</u>
          </Skeleton>
        </section>
      </div>
      <div className="web-dashboard-plan-datas-item">
        <header>{t('NewDashboard.BuybackPlan.TotalDestroyed', 'Total Destroyed')}</header>
        <section>
          <Skeleton rowsProps={{ rows: 1 }} animation loading={isEmpty(currentIndex)}>
            <BalanceShow value={totalDestroyed} />
            <u>{PLATFORM_TOKEN.symbol}</u>
          </Skeleton>
        </section>
      </div>
      <div className="web-dashboard-plan-datas-item">
        <header>{t('NewDashboard.BuybackPlan.CurrentBlockHeight', 'Current Block Height')}</header>
        <section>
          <BalanceShow value={blockNumber} rule="0" unit="" />
          <u>Block</u>
        </section>
      </div>
    </div>
  )
}

export default Data
