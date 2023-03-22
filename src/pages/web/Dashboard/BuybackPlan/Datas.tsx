import { useBlockNumber } from 'wagmi'
import React, { FC, useMemo } from 'react'

import BalanceShow from '@/components/common/Wallet/BalanceShow'

import { useConfigInfo } from '@/store'
import { bnMul, bnPlus } from '@/utils/tools'
import { MarginTokenKeys } from '@/typings'
import { useMulCurrentIndexDAT } from '@/hooks/useQueryApi'
import { DEFAULT_MARGIN_TOKEN, PLATFORM_TOKEN, VALUATION_TOKEN_SYMBOL } from '@/config/tokens'

const Datas: FC = () => {
  const { data = 0 } = useBlockNumber({ watch: true })

  const mTokenPrices = useConfigInfo((state) => state.mTokenPrices)

  const { data: dashboardDAT } = useMulCurrentIndexDAT()

  const totalDestroyed = useMemo(() => {
    return dashboardDAT[DEFAULT_MARGIN_TOKEN.symbol]?.drfBurnt ?? 0
  }, [dashboardDAT])

  const totalBuyback = useMemo(() => {
    return Object.values(dashboardDAT).reduce((p, n, index) => {
      const margin = Object.keys(dashboardDAT)[index] as MarginTokenKeys
      return bnPlus(bnMul(n.drfBuyBack ?? 0, mTokenPrices[margin]), p)
    }, 0)
  }, [dashboardDAT])

  return (
    <div className="web-dashboard-plan-datas">
      <div className="web-dashboard-plan-datas-item">
        <header>Total Buyback Value</header>
        <section>
          <BalanceShow value={totalBuyback} />
          <u>{VALUATION_TOKEN_SYMBOL}</u>
        </section>
      </div>
      <div className="web-dashboard-plan-datas-item">
        <header>Current {PLATFORM_TOKEN.symbol} Price</header>
        <section>
          <BalanceShow value={mTokenPrices[PLATFORM_TOKEN.symbol as MarginTokenKeys]} />
          <u>{VALUATION_TOKEN_SYMBOL}</u>
        </section>
      </div>
      <div className="web-dashboard-plan-datas-item">
        <header>Total Destroyed</header>
        <section>
          <BalanceShow value={totalDestroyed} />
          <u>{PLATFORM_TOKEN.symbol}</u>
        </section>
      </div>
      <div className="web-dashboard-plan-datas-item">
        <header>Current Block Height</header>
        <section>
          <BalanceShow value={data} rule="0" unit="" />
          <u>Block</u>
        </section>
      </div>
    </div>
  )
}

export default Datas
