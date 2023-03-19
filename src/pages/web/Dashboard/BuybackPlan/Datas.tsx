import { useBlockNumber } from 'wagmi'
import React, { FC } from 'react'

import BalanceShow from '@/components/common/Wallet/BalanceShow'

import { useCurrentIndexDAT } from '@/hooks/useQueryApi'
import { BENCHMARK_TOKEN, findToken, PLATFORM_TOKEN } from '@/config/tokens'
import { useMarginToken } from '@/store'

const Datas: FC = () => {
  const { data = 0 } = useBlockNumber({ watch: true })

  const marginToken = useMarginToken((state) => state.marginToken)

  const { data: dashboardDAT } = useCurrentIndexDAT(findToken(marginToken).tokenAddress)

  return (
    <div className="web-dashboard-plan-datas">
      <div className="web-dashboard-plan-datas-item">
        <header>Total Buyback Value</header>
        <section>
          <BalanceShow value={dashboardDAT?.drfBuyBack} />
          <u>{PLATFORM_TOKEN.symbol}</u>
        </section>
      </div>
      <div className="web-dashboard-plan-datas-item">
        <header>Current {PLATFORM_TOKEN.symbol} Price</header>
        <section>
          <BalanceShow value={dashboardDAT?.drfPrice} />
          <u>{BENCHMARK_TOKEN.symbol}</u>
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
