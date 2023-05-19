import { useBlockNumber } from 'wagmi'

import React, { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getDRFPrice } from '@/api'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { DEFAULT_MARGIN_TOKEN, PLATFORM_TOKEN, VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { useMulCurrentIndexDAT } from '@/hooks/useQueryApi'
import { useConfigInfoStore } from '@/store'
import { MarginTokenKeys } from '@/typings'
import { bnMul, bnPlus, isGT, isLT } from '@/utils/tools'

const Datas: FC = () => {
  const { t } = useTranslation()
  const { data: blockNumber = 0 } = useBlockNumber({ watch: true })

  const [tokenPrice, setTokenPrice] = useState<number>(0)

  const mTokenPrices = useConfigInfoStore((state) => state.mTokenPrices)

  const { data: dashboardDAT } = useMulCurrentIndexDAT()

  const totalBuyback = useMemo(() => {
    return Object.values(dashboardDAT).reduce((p, n, index) => {
      const margin = Object.keys(dashboardDAT)[index] as MarginTokenKeys
      return bnPlus(bnMul(n.drfBuyBack ?? 0, mTokenPrices[margin]), p)
    }, 0)
  }, [dashboardDAT, mTokenPrices])

  const tokenDecimal = useMemo(() => {
    if (tokenPrice === 0) return 2
    if (isLT(tokenPrice, 1) && isGT(tokenPrice, 0)) return 4
    return 2
  }, [tokenPrice])

  const totalDestroyed = useMemo(() => {
    return dashboardDAT[DEFAULT_MARGIN_TOKEN.symbol]?.drfBurnt ?? 0
  }, [dashboardDAT])

  useEffect(() => {
    const func = async () => {
      const { data } = await getDRFPrice()

      setTokenPrice(data)
    }

    void func()
  }, [blockNumber])

  return (
    <div className="web-dashboard-plan-datas">
      <div className="web-dashboard-plan-datas-item">
        <header>{t('NewDashboard.BuybackPlan.TotalBuybackValue')}</header>
        <section>
          <BalanceShow value={totalBuyback} />
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
