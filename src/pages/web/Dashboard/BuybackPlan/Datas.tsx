import { useBlockNumber } from 'wagmi'
import React, { FC } from 'react'

import BalanceShow from '@/components/common/Wallet/BalanceShow'

import { useConfigInfo, useMarginToken } from '@/store'
import { useCurrentIndexDAT } from '@/hooks/useQueryApi'
import { findToken, PLATFORM_TOKEN, VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { bnMul } from '@/utils/tools'

const Datas: FC = () => {
  const { data = 0 } = useBlockNumber({ watch: true })

  const marginToken = useMarginToken((state) => state.marginToken)
  const mTokenPrices = useConfigInfo((state) => state.mTokenPrices)

  const { data: dashboardDAT } = useCurrentIndexDAT(findToken(marginToken).tokenAddress)

  return (
    <div className="web-dashboard-plan-datas">
      <div className="web-dashboard-plan-datas-item">
        <header>Total Buyback Value</header>
        <section>
          <BalanceShow value={bnMul(dashboardDAT?.drfBuyBack, mTokenPrices[marginToken])} />
          <u>{VALUATION_TOKEN_SYMBOL}</u>
        </section>
      </div>
      <div className="web-dashboard-plan-datas-item">
        <header>Current {PLATFORM_TOKEN.symbol} Price</header>
        <section>
          <BalanceShow value={dashboardDAT?.drfPrice} />
          <u>{VALUATION_TOKEN_SYMBOL}</u>
        </section>
      </div>
      <div className="web-dashboard-plan-datas-item">
        <header>Total Destroyed</header>
        <section>
          <BalanceShow value={dashboardDAT?.drfBurnt} />
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
