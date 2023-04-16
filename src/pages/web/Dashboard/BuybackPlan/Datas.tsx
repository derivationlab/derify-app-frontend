import { useBlockNumber } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo } from 'react'

import BalanceShow from '@/components/common/Wallet/BalanceShow'

import { useConfigInfoStore } from '@/store'
import { MarginTokenKeys } from '@/typings'
import { useMulCurrentIndexDAT } from '@/hooks/useQueryApi'
import { bnMul, bnPlus, isGT, isLT } from '@/utils/tools'
import { DEFAULT_MARGIN_TOKEN, PLATFORM_TOKEN, VALUATION_TOKEN_SYMBOL } from '@/config/tokens'

const Datas: FC = () => {
  const { t } = useTranslation()
  const { data: blockNumber = 0 } = useBlockNumber({ watch: true })

  const mTokenPrices = useConfigInfoStore((state) => state.mTokenPrices)
  const mTokenPricesLoaded = useConfigInfoStore((state) => state.mTokenPricesLoaded)

  const { data: dashboardDAT } = useMulCurrentIndexDAT()

  const totalBuyback = useMemo(() => {
    return Object.values(dashboardDAT).reduce((p, n, index) => {
      const margin = Object.keys(dashboardDAT)[index] as MarginTokenKeys
      return bnPlus(bnMul(n.drfBuyBack ?? 0, mTokenPrices[margin]), p)
    }, 0)
  }, [dashboardDAT, mTokenPrices])

  const tokenDecimal = useMemo(() => {
    if (!mTokenPricesLoaded) return 2
    if (
      isLT(mTokenPrices[PLATFORM_TOKEN.symbol as MarginTokenKeys], 1) &&
      isGT(mTokenPrices[PLATFORM_TOKEN.symbol as MarginTokenKeys], 0)
    )
      return 4
    return 2
  }, [mTokenPrices, mTokenPricesLoaded])

  const totalDestroyed = useMemo(() => {
    return dashboardDAT[DEFAULT_MARGIN_TOKEN.symbol]?.drfBurnt ?? 0
  }, [dashboardDAT])

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
          <BalanceShow value={mTokenPrices[PLATFORM_TOKEN.symbol as MarginTokenKeys]} decimal={tokenDecimal} />
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
