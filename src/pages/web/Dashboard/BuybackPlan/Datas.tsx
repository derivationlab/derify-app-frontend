import PubSub from 'pubsub-js'
import { useBlockNumber } from 'wagmi'

import React, { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { PLATFORM_TOKEN, VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { useAllCurrentIndex } from '@/hooks/useAllCurrentIndex'
import { usePlatformTokenPrice } from '@/hooks/usePlatformTokenPrice'
import { useMarginTokenListStore, useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { PubSubEvents } from '@/typings'
import { bnMul, bnPlus, isGT, isLT } from '@/utils/tools'

const Datas: FC = () => {
  const { t } = useTranslation()
  const { data: blockNumber = 0 } = useBlockNumber({ watch: true })
  const [buybackValue, setBuybackValue] = useState<string>('0')

  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)

  const { data: tokenPrice } = usePlatformTokenPrice()
  const { data: currentIndex } = useAllCurrentIndex(marginTokenList)

  const tokenDecimal = useMemo(() => {
    if (tokenPrice === 0) return 2
    if (isLT(tokenPrice, 1) && isGT(tokenPrice, 0)) return 4
    return 2
  }, [tokenPrice])

  const totalDestroyed = useMemo(() => {
    return currentIndex?.[marginToken.symbol]?.drfBurnt ?? 0
  }, [marginToken, currentIndex])

  useEffect(() => {
    PubSub.subscribe(PubSubEvents.UPDATE_BUYBACK_VALUE, (topic: string, message: any) => {
      const keys = Object.keys(message) as any[]
      const _ = keys.reduce((p, n) => {
        return bnPlus(bnMul(message[n], n === 'BUSD' ? 1 : tokenPrice), p)
      }, '0')
      setBuybackValue(_)
    })
  }, [tokenPrice])

  return (
    <div className="web-dashboard-plan-datas">
      <div className="web-dashboard-plan-datas-item">
        <header>{t('NewDashboard.BuybackPlan.TotalBuybackValue')}</header>
        <section>
          <BalanceShow value={buybackValue} />
          <u>{VALUATION_TOKEN_SYMBOL}</u>
        </section>
      </div>
      <div className="web-dashboard-plan-datas-item">
        <header>{t('NewDashboard.BuybackPlan.CurrentDRFPrice', '', { Coin: PLATFORM_TOKEN.symbol })} </header>
        <section>
          <BalanceShow value={tokenPrice} decimal={tokenDecimal} />
          <u>{VALUATION_TOKEN_SYMBOL}</u>
        </section>
      </div>
      <div className="web-dashboard-plan-datas-item">
        <header>{t('NewDashboard.BuybackPlan.TotalDestroyed', 'Total Destroyed')}</header>
        <section>
          <BalanceShow value={totalDestroyed} />
          <u>{PLATFORM_TOKEN.symbol}</u>
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

export default Datas
